import { z } from "zod";
import { StatusEnum } from "./common.js";

/**
 * Type d'asset
 */
export const AssetTypeEnum = z.enum(["video", "image", "audio", "subtitle"]);
export type AssetType = z.infer<typeof AssetTypeEnum>;

/**
 * Schéma pour un asset média
 */
export const AssetSchema = z.object({
  id: z.string().uuid(),
  idea_id: z.string().uuid(),
  type: AssetTypeEnum,
  url_input: z.string().url().nullable(),
  url_output: z.string().url().nullable(),
  srt_url: z.string().url().nullable(),
  status: StatusEnum,
  metadata: z.record(z.unknown()).nullable(),
  created_at: z.string().datetime(),
});
export type Asset = z.infer<typeof AssetSchema>;

/**
 * Requête de composition d'assets
 */
export const ComposeAssetsRequestSchema = z.object({
  idea_id: z.string().uuid(),
  script_id: z.string().uuid(),
  shots: z.array(
    z.object({
      order: z.number(),
      text: z.string(),
      visual_prompt: z.string().optional(),
      duration_s: z.number(),
    })
  ),
  voiceover: z.boolean().default(false),
  subtitles: z.boolean().default(true),
  watermark: z
    .object({
      enabled: z.boolean().default(true),
      text: z.string().default("LX Studio"),
      position: z.enum(["top-right", "bottom-right", "bottom-left"]).default("bottom-right"),
    })
    .default({}),
  output_format: z
    .object({
      width: z.number().default(1080),
      height: z.number().default(1920),
      fps: z.number().default(30),
      max_size_mb: z.number().default(50),
    })
    .default({}),
});
export type ComposeAssetsRequest = z.infer<typeof ComposeAssetsRequestSchema>;

/**
 * Réponse de composition d'assets
 */
export const ComposeAssetsResponseSchema = z.object({
  asset_id: z.string().uuid(),
  video_url: z.string().url().optional(),
  srt_url: z.string().url().optional(),
  status: StatusEnum,
  render_job_id: z.string().optional(),
});
export type ComposeAssetsResponse = z.infer<typeof ComposeAssetsResponseSchema>;
