import type { FastifyInstance } from "fastify";
import { GenerateIdeasRequestSchema, type GenerateIdeasResponse } from "@lxstudio/schemas";
import { OpenAIAdapter } from "@lxstudio/ai";
import { loadPrompt, interpolatePrompt } from "@lxstudio/ai";
import { validate } from "../utils/validate.js";
import { supabase } from "../db/client.js";
import { logger } from "../utils/logger.js";

export async function ideasRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: unknown }>("/api/ideas", async (request, reply) => {
    const params = validate(GenerateIdeasRequestSchema, request.body);

    logger.info({ params }, "Generating ideas");

    // Charger le prompt
    const promptTemplate = loadPrompt("promptIdea");

    // Générer via LLM
    const llm = new OpenAIAdapter(process.env.OPENAI_API_KEY!);

    const responseText = await llm.generateJSON<{ ideas: unknown[] }>(promptTemplate, {
      temperature: 0.8,
      maxTokens: 4000,
    });

    const ideas = responseText.ideas.slice(0, params.count);

    // Sauvegarder en DB (optionnel)
    if (process.env.ENABLE_DB_SAVE === "true") {
      for (const idea of ideas) {
        await supabase.from("ideas").insert(idea);
      }
    }

    const response: GenerateIdeasResponse = {
      ideas: ideas as GenerateIdeasResponse["ideas"],
      generated_at: new Date().toISOString(),
    };

    return reply.send(response);
  });
}
