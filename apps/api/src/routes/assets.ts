import type { FastifyInstance } from "fastify";
import { ComposeAssetsRequestSchema, type ComposeAssetsResponse } from "@lxstudio/schemas";
import { validate } from "../utils/validate.js";
import { supabase } from "../db/client.js";
import { logger } from "../utils/logger.js";

/**
 * Route de composition d'assets (vidéo, sous-titres, watermark)
 * En production : intégration avec Runway, ElevenLabs, etc.
 * Ici : stub avec URLs de demo
 */
export async function assetsRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: unknown }>("/api/assets/compose", async (request, reply) => {
    const params = validate(ComposeAssetsRequestSchema, request.body);

    logger.info({ params }, "Composing assets");

    // En production : appeler les providers (Runway, ElevenLabs, etc.)
    // Ici : stub

    const assetId = crypto.randomUUID();

    // Créer un job de render (optionnel)
    const renderJobId = process.env.ENABLE_ASSET_RENDER === "true"
      ? crypto.randomUUID()
      : undefined;

    // Sauvegarder en DB
    const asset = {
      id: assetId,
      idea_id: params.idea_id,
      type: "video" as const,
      url_input: null,
      url_output: renderJobId
        ? null
        : "https://storage.lxstudio.ch/demo-video.mp4", // Stub
      srt_url: params.subtitles ? "https://storage.lxstudio.ch/demo-subtitle.srt" : null,
      status: renderJobId ? ("processing" as const) : ("completed" as const),
      metadata: {
        watermark: params.watermark,
        output_format: params.output_format,
      },
    };

    if (process.env.ENABLE_DB_SAVE === "true") {
      await supabase.from("assets").insert(asset);
    }

    const response: ComposeAssetsResponse = {
      asset_id: assetId,
      video_url: asset.url_output || undefined,
      srt_url: asset.srt_url || undefined,
      status: asset.status,
      render_job_id: renderJobId,
    };

    return reply.send(response);
  });

  fastify.get<{ Params: { id: string } }>("/api/assets/:id", async (request, reply) => {
    const { id } = request.params;

    const { data, error } = await supabase.from("assets").select("*").eq("id", id).single();

    if (error || !data) {
      return reply.status(404).send({ error: "Asset not found" });
    }

    return reply.send(data);
  });
}
