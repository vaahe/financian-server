import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import { generateAccessToken } from '../utils/jwtUtils';

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body.token;
        const refreshSecret = process.env.JWT_REFRESH_SECRET || '';

        if (refreshToken == null) {
            return res.status(401).json({ message: 'Access denied: No refresh token provided' });
        }

        jwt.verify(refreshToken, refreshSecret, (error: any, user: any) => {
            if (error) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
            
            const newAccessToken = generateAccessToken(user?.id);

            return res.json({ newAccessToken });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}