import type { FastifyInstance } from "fastify";
import {
  PublishInstagramRequestSchema,
  PublishTikTokRequestSchema,
  type PublishResponse,
} from "@lxstudio/schemas";
import { InstagramClient, TikTokClient, BufferWebhookClient } from "@lxstudio/integrations";
import { validate } from "../utils/validate.js";
import { supabase } from "../db/client.js";
import { logger } from "../utils/logger.js";

/**
 * Route de publication Instagram
 */
export async function publishRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: unknown }>("/api/publish/instagram", async (request, reply) => {
    const params = validate(PublishInstagramRequestSchema, request.body);

    logger.info({ params }, "Publishing to Instagram");

    const publishId = crypto.randomUUID();
    let result;

    if (process.env.PUBLISH_MODE === "direct" && process.env.META_ACCESS_TOKEN) {
      // Publication directe via Graph API
      const client = new InstagramClient(
        process.env.META_ACCESS_TOKEN,
        process.env.IG_USER_ID!
      );

      const fullCaption = `${params.caption_text}\n\n${params.hashtags.join(" ")}`;

      result = await client.publishReel({
        videoUrl: params.video_url,
        caption: fullCaption,
        coverUrl: params.cover_url,
        shareToFeed: params.share_to_feed,
        locationId: params.location_id,
      });
    } else {
      // Fallback Buffer webhook
      const bufferClient = new BufferWebhookClient(process.env.BUFFER_WEBHOOK_URL!);
      result = await bufferClient.sendPublishRequest({
        platform: "instagram",
        videoUrl: params.video_url,
        caption: `${params.caption_text}\n\n${params.hashtags.join(" ")}`,
      });
    }

    // Sauvegarder en DB
    if (process.env.ENABLE_DB_SAVE === "true") {
      await supabase.from("publishes").insert({
        id: publishId,
        platform: "instagram",
        post_id_ext: result.postId || null,
        asset_id: params.asset_id,
        caption_id: params.caption_id,
        status: result.success ? "completed" : "failed",
        response_json: result,
        published_at: result.success ? new Date().toISOString() : null,
      });
    }

    const response: PublishResponse = {
      publish_id: publishId,
      platform: "instagram",
      post_id_ext: result.postId,
      status: result.success ? "completed" : "failed",
      permalink: result.permalink,
      error: result.error,
    };

    return reply.send(response);
  });

  fastify.post<{ Body: unknown }>("/api/publish/tiktok", async (request, reply) => {
    const params = validate(PublishTikTokRequestSchema, request.body);

    logger.info({ params }, "Publishing to TikTok");

    const publishId = crypto.randomUUID();
    let result;

    if (process.env.PUBLISH_MODE === "direct" && process.env.TIKTOK_ACCESS_TOKEN) {
      // Publication directe via TikTok API
      const client = new TikTokClient(process.env.TIKTOK_ACCESS_TOKEN);

      const fullCaption = `${params.caption_text} ${params.hashtags.join(" ")}`;

      result = await client.publishVideo({
        videoUrl: params.video_url,
        caption: fullCaption,
        privacyLevel: params.privacy_level,
        disableComment: params.disable_comment,
        disableDuet: params.disable_duet,
        disableStitch: params.disable_stitch,
      });
    } else {
      // Fallback Buffer webhook
      const bufferClient = new BufferWebhookClient(process.env.BUFFER_WEBHOOK_URL!);
      result = await bufferClient.sendPublishRequest({
        platform: "tiktok",
        videoUrl: params.video_url,
        caption: `${params.caption_text} ${params.hashtags.join(" ")}`,
      });
    }

    // Sauvegarder en DB
    if (process.env.ENABLE_DB_SAVE === "true") {
      await supabase.from("publishes").insert({
        id: publishId,
        platform: "tiktok",
        post_id_ext: result.postId || null,
        asset_id: params.asset_id,
        caption_id: params.caption_id,
        status: result.success ? "completed" : "failed",
        response_json: result,
        published_at: result.success ? new Date().toISOString() : null,
      });
    }

    const response: PublishResponse = {
      publish_id: publishId,
      platform: "tiktok",
      post_id_ext: result.postId,
      status: result.success ? "completed" : "failed",
      permalink: result.permalink,
      error: result.error,
    };

    return reply.send(response);
  });
}
