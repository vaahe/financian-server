import jwt from 'jsonwebtoken';
import { DecodedToken } from '../types';

export const generateAccessToken = (userId: string) => {
    const accessSecret = process.env.JWT_ACCESS_SECRET!;

    return jwt.sign({ userId }, accessSecret, { expiresIn: '30m' });
}

export const generateRefreshToken = (userId: string) => {
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;

    return jwt.sign({ userId }, refreshSecret, { expiresIn: '1d' });
}

export const verifyAccessToken = (token: string): DecodedToken | null => {
    const accessSecret = process.env.JWT_ACCESS_SECRET!;

    try {
        return jwt.verify(token, accessSecret) as DecodedToken;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const verifyRefreshToken = (token: string) => {
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;

    try {
        return jwt.verify(token, refreshSecret) as DecodedToken;
    } catch (error) {
        console.error(error);
        return null;
    }
}