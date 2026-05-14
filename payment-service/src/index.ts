import { Hono } from "hono";
import { logger } from "hono/logger";
import { config } from "./config";

const app = new Hono();

app.use("*", logger());

app.get("/", (c) => {
  return c.json({
    message: "Payment Service is running",
    version: "1.0.0",
  });
});

export default {
  port: parseInt(config.PORT),
  fetch: app.fetch,
};
