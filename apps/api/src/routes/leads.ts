import type { FastifyInstance } from "fastify";
import { CreateLeadSchema, type CreateLeadResponse } from "@lxstudio/schemas";
import { validate } from "../utils/validate.js";
import { supabase } from "../db/client.js";
import { logger } from "../utils/logger.js";

/**
 * Route de capture de leads (webhook public)
 */
export async function leadsRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: unknown }>("/api/leads/webhook", async (request, reply) => {
    const params = validate(CreateLeadSchema, request.body);

    logger.info({ params }, "Lead received");

    const leadId = crypto.randomUUID();

    // Sauvegarder en DB
    if (process.env.ENABLE_DB_SAVE !== "false") {
      await supabase.from("leads").insert({
        id: leadId,
        ...params,
      });
    }

    // Notifier (optionnel : Slack, Discord, etc.)
    if (process.env.ALERT_WEBHOOK_URL) {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Nouveau lead : ${params.name} (${params.email}) - Source: ${params.source}`,
          lead: params,
        }),
      }).catch((err) => logger.error({ err }, "Failed to send alert"));
    }

    const response: CreateLeadResponse = {
      lead_id: leadId,
      message: "Lead enregistré avec succès",
    };

    return reply.send(response);
  });

  fastify.get("/api/leads", async (request, reply) => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ leads: data || [] });
  });
}
