import { createClient } from "redis";
import { config } from "../config";
import { logger } from "../middleware/logger";

export const redis = createClient({
  url: config.REDIS_URL,
});

redis.on("error", (err) => logger.error({ err }, "Redis Client Error"));

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
    logger.info("Connected to Redis");
  }
};
