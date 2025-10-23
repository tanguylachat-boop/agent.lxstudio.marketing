import type { FastifyInstance } from "fastify";
import { GenerateScriptRequestSchema, type GenerateScriptResponse } from "@lxstudio/schemas";
import { OpenAIAdapter } from "@lxstudio/ai";
import { loadPrompt, interpolatePrompt } from "@lxstudio/ai";
import { validate } from "../utils/validate.js";
import { supabase } from "../db/client.js";
import { logger } from "../utils/logger.js";

export async function scriptRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: unknown }>("/api/script", async (request, reply) => {
    const params = validate(GenerateScriptRequestSchema, request.body);

    logger.info({ params }, "Generating script");

    // Récupérer l'idée depuis DB
    const { data: idea } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", params.idea_id)
      .single();

    if (!idea) {
      return reply.status(404).send({ error: "Idea not found" });
    }

    // Charger le prompt et interpoler les variables
    const promptTemplate = loadPrompt("promptScript");
    const prompt = interpolatePrompt(promptTemplate, {
      idea_title: idea.title,
      idea_angle: idea.angle,
      duration_target_s: params.duration_target_s.toString(),
    });

    // Générer via LLM
    const llm = new OpenAIAdapter(process.env.OPENAI_API_KEY!);
    const responseData = await llm.generateJSON<{
      script_text: string;
      duration_s: number;
      shots: unknown[];
    }>(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Sauvegarder en DB
    if (process.env.ENABLE_DB_SAVE === "true") {
      await supabase.from("scripts").insert({
        idea_id: params.idea_id,
        script_text: responseData.script_text,
        duration_s: responseData.duration_s,
      });
    }

    const response: GenerateScriptResponse = {
      script: {
        idea_id: params.idea_id,
        script_text: responseData.script_text,
        duration_s: responseData.duration_s,
      },
      shots: responseData.shots as GenerateScriptResponse["shots"],
      generated_at: new Date().toISOString(),
    };

    return reply.send(response);
  });
}
