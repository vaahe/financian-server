import fs from 'fs';
import path from 'path';
import cors, { CorsOptions } from 'cors';
import express, { Express } from "express";
import cookieParser from "cookie-parser";

import userRouter from './routes/userRouter';
import authRouter from './routes/authRouter';
import courseRouter from './routes/courseRouter';
import paymentRouter from './routes/paymentRouter';
import commentsRouter from './routes/commentsRouter';

import './config/passportConfig';

import { authMiddleware } from "./middlewares/authMiddleware";
import session from 'express-session';
import passport from 'passport';

const app: Express = express();

const corsOptions: CorsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
};

app.use(cookieParser());
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize()); // initialize passport and session
app.use(passport.session());

app.use(cors(corsOptions));

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/courses', courseRouter);
app.use('/payment', paymentRouter);
app.use('/comments', commentsRouter);

app.get('/file/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '/uploads/thumbnails', filename);
    console.log(filePath);

    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    } else {
        return res.status(404).send('File not found');
    }
});

app.get('/protected', authMiddleware, (req, res) => {
    console.log(req.cookies);
    res.json({ message: 'This is a protected route' });
});

export default app;