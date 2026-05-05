import pino from "pino";
import { createMiddleware } from "hono/factory";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export const loggerMiddleware = createMiddleware(async (c, next) => {
  const { method, url } = c.req;
  const start = Date.now();
  
  logger.info({ method, url }, "Incoming request");

  await next();

  const duration = Date.now() - start;
  logger.info({ method, url, status: c.res.status, duration: `${duration}ms` }, "Request completed");
});
