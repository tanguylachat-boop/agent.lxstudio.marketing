import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CreateJobSchema } from "@lxstudio/schemas";
import { validate } from "../utils/validate.js";
import { supabase } from "../db/client.js";
import { publishQueue } from "../queue/bullmq.js";
import { logger } from "../utils/logger.js";

const CreateScheduleSchema = z.object({
  jobs: z.array(CreateJobSchema),
});

/**
 * Route de planification (crée des jobs BullMQ)
 */
export async function scheduleRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: unknown }>("/api/schedule/create", async (request, reply) => {
    const params = validate(CreateScheduleSchema, request.body);

    logger.info({ count: params.jobs.length }, "Creating schedule");

    const jobIds: string[] = [];

    for (const job of params.jobs) {
      const jobId = crypto.randomUUID();

      // Sauvegarder en DB
      if (process.env.ENABLE_DB_SAVE === "true") {
        await supabase.from("jobs").insert({
          id: jobId,
          ...job,
          status: "pending",
          attempts: 0,
        });
      }

      // Ajouter à la queue BullMQ
      const delay = new Date(job.run_at_tz).getTime() - Date.now();
      await publishQueue.add(
        job.type,
        {
          jobId,
          ...job,
        },
        {
          delay: delay > 0 ? delay : 0,
          attempts: job.max_attempts || 3,
          backoff: { type: "exponential", delay: 2000 },
        }
      );

      jobIds.push(jobId);
    }

    return reply.send({ job_ids: jobIds });
  });

  fastify.get("/api/schedule/jobs", async (request, reply) => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ jobs: data || [] });
  });
}
