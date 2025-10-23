import { z } from "zod";

/**
 * Schéma pour un script vidéo
 */
export const ScriptSchema = z.object({
  id: z.string().uuid(),
  idea_id: z.string().uuid(),
  script_text: z.string().min(50).max(5000),
  duration_s: z.number().int().min(10).max(60),
  created_at: z.string().datetime(),
});
export type Script = z.infer<typeof ScriptSchema>;

/**
 * Plan vidéo (shot)
 */
export const ShotSchema = z.object({
  order: z.number().int().positive(),
  duration_s: z.number().int().min(2).max(5),
  text: z.string().min(10).max(500),
  visual_prompt: z.string().optional(),
});
export type Shot = z.infer<typeof ShotSchema>;

/**
 * Requête de génération de script
 */
export const GenerateScriptRequestSchema = z.object({
  idea_id: z.string().uuid(),
  duration_target_s: z.number().int().min(10).max(60).default(15),
  structure: z.enum(["HPPO", "AIDA", "PAS"]).default("HPPO"), // Hook-Problème-Preuve-Offre
});
export type GenerateScriptRequest = z.infer<typeof GenerateScriptRequestSchema>;

/**
 * Réponse de génération de script
 */
export const GenerateScriptResponseSchema = z.object({
  script: ScriptSchema.omit({ id: true, created_at: true }),
  shots: z.array(ShotSchema),
  generated_at: z.string().datetime(),
});
export type GenerateScriptResponse = z.infer<typeof GenerateScriptResponseSchema>;
