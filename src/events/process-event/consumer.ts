import { kafka, messageFromRegistry } from "../kafka/kafka";
import { EmailRequest } from "../../dto/emailRequest";
import ConsumerService from "../../services/consumerService";
import { produceDLQMessage } from '../retry-event/retryMechanism';

// the client ID lets kafka know who's producing the messages
const clientId =  process.env.CLIENT_ID;
const topic =  process.env.TOPIC;


export const processMessage = async () => {
  // first, we wait for the client to connect and subscribe to the given topic
  console.log("Consumer getting started.... ");
  const consumer = kafka.consumer({ groupId: clientId });
  let consumerService = new ConsumerService();
  await consumer.connect();
  await consumer.subscribe({ topic });
  console.log(`Consumer started to receive the messages from topic - ${topic} `);

  await consumer.run({
    // this function is called every time the consumer gets a new message
    partitionsConsumedConcurrently: 3,
    eachMessage: async ({ topic, partition, message }) => {
      let emailRequest = await messageFromRegistry(message);
      console.log(`Emailrequest consumed from kafka :: ${JSON.stringify(emailRequest)}`);
      //Email sevice call to send email
      try {
         await consumerService.processMessage(emailRequest);
      } catch (error) {
        console.error(`Error while sending email with error code -${error.status}`);
        handleError(error, emailRequest);
        console.log(`Message handled by retry mechanishm........`);
      }
    },
  });

};

const handleError = async (error: any, emailRequest: EmailRequest) =>{
  try{
      if( error.status === 401 || error.status === 400  ){
        // these messages should go to DLQ.
        let dlqMessage ={
          ...emailRequest,
          error:{
            status: error.status,
            message: error.message
          } 
        };

      await produceDLQMessage(dlqMessage);
        
      console.warn("Message processing failed. Moved to DLQ.", error.status);
    }else if ( error.status === 408 || error.code === 'ENOTFOUND' ){
        // here we can use some retry topic to retry these messages
        // where error can be resolved automatically in some time.
        // Retry topic will have its own wait time and retry count,
        // after all retry done and still no success then this message should go in DLQ or DB.
    }
  }catch(e){
    // if error comes in handle error's of primary consumer
    // we can save the records in DB for further correction and reporting . 
    // call one method to add the message with erorr details in DB.
  }
}
