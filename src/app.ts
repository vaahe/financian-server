import './config';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import express, { Express } from "express";
import cookieParser from "cookie-parser";

import userRouter from './routes/userRouter';
import authRouter from './routes/authRouter';
import courseRouter from './routes/courseRouter';
import refreshRouter from './routes/refreshRouter';
import paymentRouter from './routes/paymentRouter';
import commentsRouter from './routes/commentsRouter';

import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

const corsOptions: CorsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
};

app.use(cookieParser());
app.use(express.json());
// app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/courses', courseRouter);
app.use('/refresh', refreshRouter);
app.use('/payment', paymentRouter);
app.use('/comments', commentsRouter);

app.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

export default app;