import type { FastifyInstance } from "fastify";
import { GenerateCaptionRequestSchema, type GenerateCaptionResponse } from "@lxstudio/schemas";
import { OpenAIAdapter } from "@lxstudio/ai";
import { loadPrompt, interpolatePrompt } from "@lxstudio/ai";
import { validate } from "../utils/validate.js";
import { supabase } from "../db/client.js";
import { logger } from "../utils/logger.js";

export async function captionRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: unknown }>("/api/caption", async (request, reply) => {
    const params = validate(GenerateCaptionRequestSchema, request.body);

    logger.info({ params }, "Generating caption");

    // Récupérer l'idée et le script (si disponible)
    const { data: idea } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", params.idea_id)
      .single();

    if (!idea) {
      return reply.status(404).send({ error: "Idea not found" });
    }

    const scriptText = params.script_text || idea.title;

    // Charger le prompt
    const promptTemplate = loadPrompt("promptCaption");
    const prompt = interpolatePrompt(promptTemplate, {
      idea_title: idea.title,
      script_text: scriptText,
    });

    // Générer via LLM
    const llm = new OpenAIAdapter(process.env.OPENAI_API_KEY!);
    const responseData = await llm.generateJSON<{
      caption_a: string;
      caption_b: string;
      caption_c: string;
      hashtags: string[];
    }>(prompt, {
      temperature: 0.8,
      maxTokens: 1000,
    });

    // Sauvegarder en DB
    if (process.env.ENABLE_DB_SAVE === "true") {
      await supabase.from("captions").insert({
        idea_id: params.idea_id,
        caption_a: responseData.caption_a,
        caption_b: responseData.caption_b,
        caption_c: responseData.caption_c,
        hashtags: responseData.hashtags,
      });
    }

    const response: GenerateCaptionResponse = {
      caption: {
        idea_id: params.idea_id,
        caption_a: responseData.caption_a,
        caption_b: responseData.caption_b,
        caption_c: responseData.caption_c,
        hashtags: responseData.hashtags,
      },
      generated_at: new Date().toISOString(),
    };

    return reply.send(response);
  });
}
