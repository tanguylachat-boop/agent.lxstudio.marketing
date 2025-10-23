import type { FastifyInstance } from "fastify";
import { PullAnalyticsRequestSchema, type PullAnalyticsResponse } from "@lxstudio/schemas";
import { InstagramClient, TikTokClient } from "@lxstudio/integrations";
import { validate } from "../utils/validate.js";
import { supabase } from "../db/client.js";
import { logger } from "../utils/logger.js";

/**
 * Route d'analytics (pull métriques depuis IG/TikTok)
 */
export async function analyticsRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: unknown }>("/api/analytics/pull", async (request, reply) => {
    const params = validate(PullAnalyticsRequestSchema, request.body);

    logger.info({ params }, "Pulling analytics");

    const analytics = [];

    if (params.platform === "instagram" && process.env.META_ACCESS_TOKEN) {
      const client = new InstagramClient(
        process.env.META_ACCESS_TOKEN,
        process.env.IG_USER_ID!
      );

      // Récupérer les posts depuis DB
      const { data: publishes } = await supabase
        .from("publishes")
        .select("*")
        .eq("platform", "instagram")
        .not("post_id_ext", "is", null);

      for (const publish of publishes || []) {
        const metrics = await client.getInsights(publish.post_id_ext!);
        if (metrics) {
          analytics.push({
            platform: "instagram" as const,
            post_ref: publish.post_id_ext!,
            views: metrics.views || 0,
            reach: metrics.reach || 0,
            likes: metrics.likes || 0,
            comments: metrics.comments || 0,
            shares: metrics.shares || 0,
            saves: metrics.saves || 0,
            profile_visits: metrics.profileVisits || 0,
          });
        }
      }
    } else if (params.platform === "tiktok" && process.env.TIKTOK_ACCESS_TOKEN) {
      const client = new TikTokClient(process.env.TIKTOK_ACCESS_TOKEN);

      const { data: publishes } = await supabase
        .from("publishes")
        .select("*")
        .eq("platform", "tiktok")
        .not("post_id_ext", "is", null);

      for (const publish of publishes || []) {
        const metrics = await client.getVideoMetrics(publish.post_id_ext!);
        if (metrics) {
          analytics.push({
            platform: "tiktok" as const,
            post_ref: publish.post_id_ext!,
            views: metrics.views || 0,
            reach: 0,
            likes: metrics.likes || 0,
            comments: metrics.comments || 0,
            shares: metrics.shares || 0,
            saves: 0,
            profile_visits: 0,
          });
        }
      }
    }

    // Sauvegarder en DB
    if (process.env.ENABLE_DB_SAVE === "true") {
      for (const metric of analytics) {
        await supabase.from("analytics").insert({
          ...metric,
          collected_at: new Date().toISOString(),
        });
      }
    }

    const response: PullAnalyticsResponse = {
      analytics: analytics as PullAnalyticsResponse["analytics"],
      collected_at: new Date().toISOString(),
    };

    return reply.send(response);
  });

  fastify.get("/api/analytics", async (request, reply) => {
    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .order("collected_at", { ascending: false })
      .limit(100);

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ analytics: data || [] });
  });
}
