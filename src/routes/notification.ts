/** src/routes/notification.ts */
import express from 'express';
import controller from '../controllers/notification';
const router = express.Router();


router.post('/sendEmail', controller.sendEmail);

export = router;