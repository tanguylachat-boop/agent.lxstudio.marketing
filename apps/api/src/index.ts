import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { healthRoute } from "./routes/health.js";
import { ideasRoute } from "./routes/ideas.js";
import { calendarRoute } from "./routes/calendar.js";
import { scriptRoute } from "./routes/script.js";
import { captionRoute } from "./routes/caption.js";
import { assetsRoute } from "./routes/assets.js";
import { scheduleRoute } from "./routes/schedule.js";
import { publishRoute } from "./routes/publish.js";
import { analyticsRoute } from "./routes/analytics.js";
import { leadsRoute } from "./routes/leads.js";
import { logger } from "./utils/logger.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";

const fastify = Fastify({
  logger: process.env.NODE_ENV === "development",
});

// CORS
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || "*",
});

// Rate limiting
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Routes
await fastify.register(healthRoute);
await fastify.register(ideasRoute);
await fastify.register(calendarRoute);
await fastify.register(scriptRoute);
await fastify.register(captionRoute);
await fastify.register(assetsRoute);
await fastify.register(scheduleRoute);
await fastify.register(publishRoute);
await fastify.register(analyticsRoute);
await fastify.register(leadsRoute);

// Error handler
fastify.setErrorHandler((error, _request, reply) => {
  logger.error({ error }, "Unhandled error");
  reply.status(500).send({ error: "Internal server error" });
});

// Start server
try {
  await fastify.listen({ port: PORT, host: HOST });
  logger.info(`API server listening on ${HOST}:${PORT}`);
} catch (err) {
  logger.error(err);
  process.exit(1);
}
