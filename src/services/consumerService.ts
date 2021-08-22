import { EmailRequest } from "../dto/emailRequest";
import EmailService from "../services/emailService";

let emailService = new EmailService();

export class ConsumerService {
  async processMessage(emailRequest: EmailRequest): Promise<void> {
    try {
      await emailService.sendEmail(emailRequest);
      console.log(`Email sent successfully`);
    } catch (e) {
      console.log(`Error while sending email`);
      throw e;
    }
  }
}

export default ConsumerService;
