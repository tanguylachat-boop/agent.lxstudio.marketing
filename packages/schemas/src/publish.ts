import { z } from "zod";
import { PlatformEnum, StatusEnum } from "./common.js";

/**
 * Schéma pour une publication
 */
export const PublishSchema = z.object({
  id: z.string().uuid(),
  platform: PlatformEnum,
  post_id_ext: z.string().nullable(),
  asset_id: z.string().uuid(),
  caption_id: z.string().uuid(),
  status: StatusEnum,
  response_json: z.record(z.unknown()).nullable(),
  published_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});
export type Publish = z.infer<typeof PublishSchema>;

/**
 * Requête de publication Instagram
 */
export const PublishInstagramRequestSchema = z.object({
  asset_id: z.string().uuid(),
  caption_id: z.string().uuid(),
  video_url: z.string().url(),
  caption_text: z.string(),
  hashtags: z.array(z.string()),
  cover_url: z.string().url().optional(),
  share_to_feed: z.boolean().default(true),
  location_id: z.string().optional(),
});
export type PublishInstagramRequest = z.infer<typeof PublishInstagramRequestSchema>;

/**
 * Requête de publication TikTok
 */
export const PublishTikTokRequestSchema = z.object({
  asset_id: z.string().uuid(),
  caption_id: z.string().uuid(),
  video_url: z.string().url(),
  caption_text: z.string(),
  hashtags: z.array(z.string()),
  privacy_level: z.enum(["PUBLIC", "FRIENDS", "SELF"]).default("PUBLIC"),
  disable_comment: z.boolean().default(false),
  disable_duet: z.boolean().default(false),
  disable_stitch: z.boolean().default(false),
});
export type PublishTikTokRequest = z.infer<typeof PublishTikTokRequestSchema>;

/**
 * Réponse de publication
 */
export const PublishResponseSchema = z.object({
  publish_id: z.string().uuid(),
  platform: PlatformEnum,
  post_id_ext: z.string().optional(),
  status: StatusEnum,
  permalink: z.string().url().optional(),
  error: z.string().optional(),
});
export type PublishResponse = z.infer<typeof PublishResponseSchema>;
