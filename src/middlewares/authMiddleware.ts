import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type DecodedToken = {
    userId: string,
    iat: number,
    exp: number,
};

interface AuthenticateRequest extends Request {
    user?: DecodedToken
}

export const authMiddleware = (req: AuthenticateRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const jwtSecret: string = process.env.JWT_ACCESS_SECRET || '';

        if (!jwtSecret) {
            console.error('JWT secret is not defined');
            return res.status(500).json({ message: 'Internal server error' });
        }

        console.log('Token:', token);
        console.log('JWT Secret:', jwtSecret);

        const decodedToken = jwt.verify(token, jwtSecret) as DecodedToken;
        console.log({ decodedToken });
        req.user = decodedToken;

        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};
