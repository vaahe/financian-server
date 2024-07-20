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
        const jwtSecret = process.env.JWT_ACCESS_SECRET!;
        const decodedToken = jwt.verify(token, jwtSecret) as DecodedToken;

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};

export const checkAdmin = (req: AuthenticateRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user && user.userId === '9743c77d-e290-40c0-896a-973d8d05ab41') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
    }
};
