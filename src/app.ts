import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import express, { Express, Response, Request } from "express";
import cookieParser from "cookie-parser";

import userRouter from './routes/userRouter';
import authRouter from './routes/authRouter';
import refreshRouter from './routes/refreshRouter';
import { authMiddleware } from "./middlewares/authMiddleware";

dotenv.config();

const app: Express = express();

const corsOptions: CorsOptions = {
    origin: "http://localhost:3000",
    credentials: true
};

app.use(cookieParser());
app.use(express.json());
// app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/refresh', refreshRouter);

app.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

export default app;