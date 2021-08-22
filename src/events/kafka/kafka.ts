import { Kafka, SASLOptions, logLevel } from "kafkajs";
import { EmailRequest } from "../../dto/emailRequest";
import * as dotenv from "dotenv";
import {
  SchemaRegistry,
  readAVSCAsync,
} from "@kafkajs/confluent-schema-registry";

dotenv.config();
const username = process.env.KAFKA_USERNAME;
const password = process.env.KAFKA_PASSWORD;

const sasl: SASLOptions =
  username && password ? { username, password, mechanism: "plain" } : null;
const ssl = !!sasl;

let topics: Array<string> = [process.env.TOPIC, process.env.TOPIC_DLQ];

export const registry = new SchemaRegistry({
  host: process.env.SCHEMA_REGISTRY_URL,
});

export const kafka = new Kafka({
  clientId: process.env.CLIENT_ID,
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
  logLevel: logLevel.ERROR,
});

// create the kafka topic where we are going to produce the data
export const createTopic = async () => {
  for (let topic of topics) {
    try {
      const topicExists = (await kafka.admin().listTopics()).includes(topic);
      if (!topicExists) {
        console.log(`Creating topic -- ${topic}`);
        await kafka.admin().createTopics({
          topics: [
            {
              topic: topic,
              numPartitions: 3,
              replicationFactor: 1,
            },
          ],
        });
      } else {
        console.log(`Topic already exist -- ${topic}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

// This will create an AVRO schema from an .avsc file
export const registerSchema = async () => {
  try {
    const schema = await readAVSCAsync(__dirname +'/schema.avsc');
    console.log('schema converted form avsc file');
    const { id } = await registry.register(schema);
    return id;
  } catch (e) {
    console.log(e);
  }
};

// This will decode the message using schema registry id
export const messageFromRegistry = async (message: any) => {
  let messageVal: EmailRequest = null;
  if (message.value) {
    messageVal = await registry.decode(message.value);
    console.log(messageVal);
  }
  return messageVal;
};
