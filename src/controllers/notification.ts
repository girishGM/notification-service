/** src/controllers/notification.ts */
import { Request, Response, NextFunction } from 'express';
import {runProducer} from '../events/process-event/producer';
import { EmailRequest } from '../dto/emailRequest';

// send an email
export async function sendEmail(req: Request, res: Response, next: NextFunction): Promise<Response> {
    let emailRequest: EmailRequest = req.body; 
    console.log(`emailRequest :: ${JSON.stringify(emailRequest)}`);

    emailRequest = {...emailRequest,
    id: Date.now.toString() }
    // validateRequest();   can validate the request schema as par the requirement and reply back to 
    // caller if any validation error is there.
    
    runProducer(emailRequest);

    return res.status(200).json({
        message: 'success'
    });
};
export default { sendEmail };