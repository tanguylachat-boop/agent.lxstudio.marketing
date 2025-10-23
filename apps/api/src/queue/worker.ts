import "dotenv/config";
import { Worker } from "bullmq";
import Redis from "ioredis";
import { logger } from "../utils/logger.js";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

/**
 * Worker pour les jobs de publication
 */
const publishWorker = new Worker(
  "publish",
  async (job) => {
    logger.info({ jobId: job.id, type: job.name }, "Processing publish job");

    // Traiter le job selon son type
    switch (job.name) {
      case "publish_post":
        // Appeler l'API de publication
        logger.info("Publishing post...");
        break;
      case "pull_analytics":
        logger.info("Pulling analytics...");
        break;
      default:
        logger.warn({ type: job.name }, "Unknown job type");
    }

    return { success: true };
  },
  { connection }
);

publishWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Job completed");
});

publishWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, error: err }, "Job failed");
});

logger.info("BullMQ worker started");
