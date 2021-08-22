/** src/index.ts */
import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import routes from './routes/notification';
import fs from 'fs';
import * as dotenv from 'dotenv';
import {processMessage} from './events/process-event/consumer';
import {processDLQMessage} from './events/retry-event/retryMechanism';
import {createTopic} from './events/kafka/kafka';

dotenv.config();

const router: Express = express();

/** Logging */
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log',{flags: 'a'});
// setup the logger
//app.use(morgan('combined', {stream: accessLogStream}))

router.use(morgan('dev', {stream: accessLogStream}));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

/** RULES OF OUR API */
router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
});

/** Routes */
router.use('/', routes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ;

console.log( " PORT form env file ---> "+ process.env.PORT);

// TODO ::  make this configurable and completed before server started.
//Creating topics if not exist...
createTopic();

processMessage().catch((err) => {
    console.error("************************* Final Consumer error  ****************************")
	console.error("error in consumer: ", err)
})

processDLQMessage().catch((err) => {
    console.error("************************* DLQ Consumer error  ****************************")
	console.error("error in DLQ consumer: ", err)
})

httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));