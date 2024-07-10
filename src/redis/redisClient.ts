import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,
    },
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('ready', () => {
    console.log('Redis client ready');
});

redisClient.on('end', () => {
    console.error('Redis client disconnected');
});

redisClient.on('error', (error) => {
    console.error('Redis error: ', error.message || error);
});

redisClient.on('close', () => {
    console.error('Redis connection closed unexpectedly');
});

async function connectRedis() {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
}

connectRedis();

export default redisClient;
