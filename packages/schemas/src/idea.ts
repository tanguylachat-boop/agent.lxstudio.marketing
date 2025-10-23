import { z } from "zod";

/**
 * Schéma pour une idée de contenu
 */
export const IdeaSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5).max(255),
  hook1: z.string().min(10).max(500),
  hook2: z.string().min(10).max(500),
  hook3: z.string().min(10).max(500),
  angle: z.string().min(20).max(1000),
  cta: z.string().min(10).max(255),
  created_at: z.string().datetime(),
});
export type Idea = z.infer<typeof IdeaSchema>;

/**
 * Schéma pour créer une idée
 */
export const CreateIdeaSchema = IdeaSchema.omit({ id: true, created_at: true });
export type CreateIdea = z.infer<typeof CreateIdeaSchema>;

/**
 * Requête de génération d'idées
 */
export const GenerateIdeasRequestSchema = z.object({
  count: z.number().int().min(1).max(50).default(20),
  market: z.string().default("Suisse romande (Jura, Romandie)"),
  target: z.string().default("PME locales"),
  industry: z.string().optional(),
});
export type GenerateIdeasRequest = z.infer<typeof GenerateIdeasRequestSchema>;

/**
 * Réponse de génération d'idées
 */
export const GenerateIdeasResponseSchema = z.object({
  ideas: z.array(CreateIdeaSchema),
  generated_at: z.string().datetime(),
});
export type GenerateIdeasResponse = z.infer<typeof GenerateIdeasResponseSchema>;
