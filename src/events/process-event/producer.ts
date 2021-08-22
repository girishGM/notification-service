import { kafka, registerSchema, registry } from "../kafka/kafka";
import { EmailRequest } from "../../dto/emailRequest";

// this is the topic to which we want to write messages
const topic = process.env.TOPIC ;
const topicDlq = process.env.TOPIC_DLQ;

const producer = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: true,
  transactionalId: "uniqueProducerId",
});

const producerDlq = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: true,
  transactionalId: "dlq-producer",
});


// push the actual message to kafka
const produceToKafka = async (
  registryId: number,
  emailRequest: EmailRequest
) => {
  await producer.connect();
  // compose the message: the key is a string
  // the value will be encoded using the avro schema
  const outgoingMessage = {
    key: emailRequest.id,
    value: await registry.encode(registryId, emailRequest),
  };

  // send the message to the previously created topic
  await producer.send({
    acks: -1,
    topic: topic,
    messages: [outgoingMessage],
  });
};

export async function runProducer(emailRequest: EmailRequest): Promise<void> {
  console.log("Inside runProducer");
  try {
    if (typeof emailRequest != "undefined" && emailRequest) {
      const registryId = await registerSchema();
      console.log("registryId ---- " + registryId);
      if (registryId) {
        await produceToKafka(registryId, emailRequest);
        // disconnect the producer
        await producer.disconnect();
      }
    }
  } catch (e) {
    console.log("**************** Not able to produce the message to Kafka ***************");
    //Add the request in retry Database, from where a schedular will pick the record and call producer.
    // if success then remove that record form this DB or mark this recrod produced successfully.
    // if again not able to produce then update this record in this DB with retry count 
    // after this retry count is reached to a predefined configured number then mark this failed
    // and stop the retry for this record.
    await producer.disconnect();
    console.error(e);
  }
};


export async function runDLQProducer(message: any): Promise<void> {
  console.log("Inside the run DLQ producer ");
  try {
    await producerDlq.connect();
    await producerDlq.send({
      acks: -1,
      topic: topicDlq,
      messages: [{ key: message.id, value: JSON.stringify(message) }],
    });
    await producer.disconnect();
  }catch (e) {
    await producer.disconnect();
    console.log("**************** Not able to produce the message to DLQ topic ***************");
    //In case of broker is not responding we can save this record in database for futher reporting. 
    console.error(e);
  }
};