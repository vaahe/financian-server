import jwt from 'jsonwebtoken';

const generateAccessToken = (userId: string) => {
    console.log({ userId });
    const accessSecret = process.env.JWT_ACCESS_SECRET;

    if (!accessSecret) {
        throw new Error('JWT_ACCESS_SECRET environment variable undefined');
    }

    return jwt.sign({ userId }, accessSecret, { expiresIn: '30m' });
}

const generateRefreshToken = (userId: string) => {
    console.log({ userId });

    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!refreshSecret) {
        throw new Error('JWT_REFRESH_SECRET env varibale undefined');
    }

    return jwt.sign({ userId }, refreshSecret, { expiresIn: '1d' });
}

export { generateAccessToken, generateRefreshToken };