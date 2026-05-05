import amqp from "amqplib";
import { config } from "../config";
import { logger } from "../middleware/logger";

let connection: any;
let channel: any;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(config.RABBITMQ_URL);
    channel = await connection.createChannel();

    const exchange = "auth_exchange";
    const queue = "auth_queue";
    const dlx = "auth_dlx";
    const dlq = "auth_dlq";

    // Setup DLX and DLQ
    await channel.assertExchange(dlx, "direct", { durable: true });
    await channel.assertQueue(dlq, { durable: true });
    await channel.bindQueue(dlq, dlx, "retry");

    // Setup Main Exchange and Queue with DLX
    await channel.assertExchange(exchange, "direct", { durable: true });
    await channel.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": dlx,
        "x-dead-letter-routing-key": "retry",
      },
    });
    await channel.bindQueue(queue, exchange, "auth_key");

    logger.info("Connected to RabbitMQ with DLQ setup");
  } catch (error) {
    logger.error({ error }, "Failed to connect to RabbitMQ");
    throw error;
  }
};

export const publishToQueue = async (routingKey: string, content: any) => {
  if (!channel) await connectRabbitMQ();
  channel.publish("auth_exchange", routingKey, Buffer.from(JSON.stringify(content)), {
    persistent: true,
  });
};

export { channel, connection };
