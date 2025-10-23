import { z } from "zod";

/**
 * Platforms supportées
 */
export const PlatformEnum = z.enum(["instagram", "tiktok"]);
export type Platform = z.infer<typeof PlatformEnum>;

/**
 * Status générique
 */
export const StatusEnum = z.enum(["pending", "processing", "completed", "failed", "cancelled"]);
export type Status = z.infer<typeof StatusEnum>;

/**
 * Timezone
 */
export const TimezoneSchema = z.string().default("Europe/Zurich");

/**
 * UTM parameters
 */
export const UtmParamsSchema = z.object({
  utm_source: z.string(),
  utm_medium: z.string().default("short"),
  utm_campaign: z.string().default("lxstudio_acq"),
  utm_content: z.string().optional(),
});
export type UtmParams = z.infer<typeof UtmParamsSchema>;

/**
 * Pagination
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type Pagination = z.infer<typeof PaginationSchema>;
