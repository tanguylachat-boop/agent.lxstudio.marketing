import { z } from "zod";

/**
 * Schéma pour une légende (caption)
 */
export const CaptionSchema = z.object({
  id: z.string().uuid(),
  idea_id: z.string().uuid(),
  caption_a: z.string().min(50).max(300),
  caption_b: z.string().min(50).max(300),
  caption_c: z.string().min(50).max(300),
  hashtags: z.array(z.string()).min(5).max(15),
  created_at: z.string().datetime(),
});
export type Caption = z.infer<typeof CaptionSchema>;

/**
 * Requête de génération de caption
 */
export const GenerateCaptionRequestSchema = z.object({
  idea_id: z.string().uuid(),
  script_text: z.string().optional(),
  length_range: z.tuple([z.number().int(), z.number().int()]).default([125, 220]),
  hashtag_count: z.number().int().min(5).max(15).default(8),
  locale: z.string().default("fr_CH"),
});
export type GenerateCaptionRequest = z.infer<typeof GenerateCaptionRequestSchema>;

/**
 * Réponse de génération de caption
 */
export const GenerateCaptionResponseSchema = z.object({
  caption: CaptionSchema.omit({ id: true, created_at: true }),
  generated_at: z.string().datetime(),
});
export type GenerateCaptionResponse = z.infer<typeof GenerateCaptionResponseSchema>;
