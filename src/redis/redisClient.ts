import { createClient } from "redis";

if (!process.env.REDIS_URL) {
    console.error('Error: REDIS_URL environment variable not set');
    process.exit(1);
}

const redisClient = createClient({
    url: process.env.REDIS_URL,
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
    console.error('Redis error: ', error.message);
    // Consider implementing reconnection logic here
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
