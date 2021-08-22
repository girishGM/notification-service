import { Kafka, logLevel } from "kafkajs";
import { EmailRequest } from "../../dto/emailRequest";
import ConsumerService from "../../services/consumerService";

import { runDLQProducer } from "../process-event/producer";
import * as dotenv from "dotenv";
dotenv.config();

// the client ID lets kafka know who's producing the messages
const clientId =  process.env.CLIENT_ID_DLQ; 
const topic =  process.env.TOPIC_DLQ;
const brokers = [process.env.KAFKA_BOOTSTRAP_SERVER];

const alarmEmail = process.env.ALARM_EMAIL;


export const kafka = new Kafka({
  clientId: clientId ,
  brokers: brokers,
  logLevel: logLevel.INFO
})


const consumer = kafka.consumer({
    groupId: clientId,
    minBytes: 5,
    maxBytes: 1e6,
    // wait for at most 3 seconds before receiving new data
    maxWaitTimeInMs: 3000,
});


export const processDLQMessage = async () => {
    // first, we wait for the client to connect and subscribe to the given topic
    console.log("Consumer getting started.... ");
    let consumerService = new ConsumerService();
    await consumer.connect();
    await consumer.subscribe({ topic });

    await consumer.run({
      // this function is called every time the consumer gets a new message
      partitionsConsumedConcurrently: 3,
      eachMessage: async ({ topic, partition, message }) => {
        let emailRequest: EmailRequest = JSON.parse(message.value.toString());
        console.log(`Emailrequest consumed from kafka :: ${emailRequest}`);
        emailRequest = {...emailRequest,
          to:alarmEmail,
          templateId:2
        }
        // we can read the message, get the error message and with the help of dynamic content email template
        // can add this error details in Alarm email.

        try {
          await consumerService.processMessage(emailRequest);
        } catch (error) {
          console.error(`Error while sending alarm -- ${error.status}`);
          // need to add this record in database for further chekcing purpose.
        }
      },
    });
}


export const produceDLQMessage = async (message: any) => {

  runDLQProducer(message);

}