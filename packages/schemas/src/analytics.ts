import { z } from "zod";
import { PlatformEnum } from "./common.js";

/**
 * Schéma pour les analytics d'un post
 */
export const AnalyticsSchema = z.object({
  id: z.string().uuid(),
  platform: PlatformEnum,
  post_ref: z.string(), // post_id_ext ou publish_id
  views: z.number().int().default(0),
  reach: z.number().int().default(0),
  likes: z.number().int().default(0),
  comments: z.number().int().default(0),
  shares: z.number().int().default(0),
  saves: z.number().int().default(0),
  profile_visits: z.number().int().default(0),
  collected_at: z.string().datetime(),
});
export type Analytics = z.infer<typeof AnalyticsSchema>;

/**
 * Requête de récupération d'analytics
 */
export const PullAnalyticsRequestSchema = z.object({
  platform: PlatformEnum,
  post_ids: z.array(z.string()).optional(),
  since: z.string().datetime().optional(),
  until: z.string().datetime().optional(),
});
export type PullAnalyticsRequest = z.infer<typeof PullAnalyticsRequestSchema>;

/**
 * Réponse d'analytics
 */
export const PullAnalyticsResponseSchema = z.object({
  analytics: z.array(AnalyticsSchema.omit({ id: true })),
  collected_at: z.string().datetime(),
});
export type PullAnalyticsResponse = z.infer<typeof PullAnalyticsResponseSchema>;
