import { z } from "zod";
import { PlatformEnum, StatusEnum } from "./common.js";

/**
 * Type de job
 */
export const JobTypeEnum = z.enum([
  "generate_ideas",
  "generate_script",
  "generate_caption",
  "compose_assets",
  "publish_post",
  "pull_analytics",
]);
export type JobType = z.infer<typeof JobTypeEnum>;

/**
 * Schéma pour un job planifié
 */
export const JobSchema = z.object({
  id: z.string().uuid(),
  platform: PlatformEnum.nullable(),
  type: JobTypeEnum,
  payload_json: z.record(z.unknown()),
  run_at_tz: z.string().datetime(),
  status: StatusEnum,
  error: z.string().nullable(),
  attempts: z.number().int().default(0),
  max_attempts: z.number().int().default(3),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Job = z.infer<typeof JobSchema>;

/**
 * Requête de création de job
 */
export const CreateJobSchema = JobSchema.omit({
  id: true,
  status: true,
  error: true,
  attempts: true,
  created_at: true,
  updated_at: true,
}).extend({
  status: StatusEnum.default("pending"),
});
export type CreateJob = z.infer<typeof CreateJobSchema>;
