import { z } from "zod";

/**
 * Schéma pour un lead
 */
export const LeadSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
  name: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().min(8).max(20).nullable(),
  message: z.string().max(2000).nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: z.string().datetime(),
});
export type Lead = z.infer<typeof LeadSchema>;

/**
 * Requête de création de lead (webhook)
 */
export const CreateLeadSchema = LeadSchema.omit({ id: true, created_at: true });
export type CreateLead = z.infer<typeof CreateLeadSchema>;

/**
 * Réponse de création de lead
 */
export const CreateLeadResponseSchema = z.object({
  lead_id: z.string().uuid(),
  message: z.string().default("Lead enregistré avec succès"),
});
export type CreateLeadResponse = z.infer<typeof CreateLeadResponseSchema>;
