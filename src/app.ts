import cors, { CorsOptions } from 'cors';
import dotenv from "dotenv";
import express, { Express } from "express";

dotenv.config();

const app: Express = express();

const corsOptions: CorsOptions = {
    origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

export default app;