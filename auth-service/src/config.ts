import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const configSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  RABBITMQ_URL: z.string(),
  JWT_SECRET: z.string(),
});

export const config = configSchema.parse(process.env);
