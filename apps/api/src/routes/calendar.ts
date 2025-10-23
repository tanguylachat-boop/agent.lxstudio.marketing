import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { validate } from "../utils/validate.js";
import { logger } from "../utils/logger.js";

const CalendarRequestSchema = z.object({
  week_start: z.string().datetime(),
  count: z.number().int().min(1).max(20).default(7),
  timezone: z.string().default("Europe/Zurich"),
});

/**
 * Génère un calendrier éditorial (slots de publication)
 * Règle : 80% valeur / 20% vente
 * 3-5 posts/semaine/plateforme
 */
export async function calendarRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: unknown }>("/api/calendar", async (request, reply) => {
    const params = validate(CalendarRequestSchema, request.body);

    logger.info({ params }, "Generating calendar");

    // Logique simplifiée : créer 3-5 slots par semaine
    const slots = [];
    const platforms: ("instagram" | "tiktok")[] = ["instagram", "tiktok"];
    const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    // Sélectionner 3 jours aléatoires
    const selectedDays = weekDays.sort(() => 0.5 - Math.random()).slice(0, 3);

    for (const platform of platforms) {
      for (const day of selectedDays) {
        const dayIndex = weekDays.indexOf(day);
        const slotDate = new Date(params.week_start);
        slotDate.setDate(slotDate.getDate() + dayIndex);
        slotDate.setHours(platform === "instagram" ? 14 : 18, 0, 0, 0);

        slots.push({
          platform,
          day,
          scheduled_at: slotDate.toISOString(),
          content_type: Math.random() > 0.2 ? "value" : "sale", // 80/20
        });
      }
    }

    return reply.send({
      week_start: params.week_start,
      timezone: params.timezone,
      slots,
    });
  });
}
