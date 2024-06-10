import cors, { CorsOptions } from 'cors';
import dotenv from "dotenv";
import express, { Express } from "express";
import bodyParser from 'body-parser';

import userRouter from './routes/userRoute';

dotenv.config();

const app: Express = express();

const corsOptions: CorsOptions = {
    origin: "http://localhost:3000"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/users', userRouter);

export default app;