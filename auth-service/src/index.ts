import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { loggerMiddleware, logger } from "./middleware/logger";
import { authController } from "./modules/auth/auth.controller";
import { config } from "./config";
import { connectRedis } from "./cache/redis";
import { connectRabbitMQ } from "./queue/rabbitmq";

const app = new Hono();

// Global Middlewares
app.use("*", loggerMiddleware);

// Initialize connections
const start = async () => {
  try {
    await connectRedis();
    await connectRabbitMQ();
    logger.info("External services initialized");
  } catch (err) {
    logger.error({ err }, "Initialization failed");
  }
};

start();

// Public Routes
app.get("/", (c) => c.text("Auth Service is running"));
app.route("/auth", authController);

// Protected Routes (Example)
app.use("/api/*", jwt({
  secret: config.JWT_SECRET,
  alg: "HS256"
}));
app.get("/api/me", async (c) => {
  const payload = c.get("jwtPayload");
  return c.json({ user: payload });
});

export default {
  port: Number(config.PORT),
  fetch: app.fetch,
};
