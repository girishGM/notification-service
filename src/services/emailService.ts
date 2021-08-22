const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
import {EmailRequest} from "../dto/emailRequest";

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';
var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export class EmailService {

    async sendEmail(emailRequest: EmailRequest):Promise<boolean> {
        let emailSentFlag: boolean = true;
        try{
             emailSentFlag = await this.send(emailRequest);
        }catch(error){
            throw error;
        }
        return emailSentFlag;
    }

    async send(emailRequest: EmailRequest): Promise<boolean>{
        let emailSentFlag: boolean = true;
        let sendSmtpEmail = {
            to: [{
                email: emailRequest.to
            }],
            templateId: emailRequest.templateId,
            params: {
            name: emailRequest.fromName,
            subject: emailRequest.subject,
            },
        };
       
        await apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data: any) {
        console.log('Email sent ...');

        }, function(error: any) {
            console.error('Error - Inside sendTransacEmail ....');
            throw error ;
        });

        return emailSentFlag;    
    }
}

export default EmailService;