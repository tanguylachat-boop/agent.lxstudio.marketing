import { z } from "zod";

/**
 * Schéma pour les logs d'audit
 */
export const LogSchema = z.object({
  id: z.string().uuid(),
  actor: z.string(), // user_id ou "system"
  action: z.string().min(3).max(255),
  payload_hash: z.string().nullable(),
  error: z.string().nullable(),
  created_at: z.string().datetime(),
});
export type Log = z.infer<typeof LogSchema>;

/**
 * Création de log
 */
export const CreateLogSchema = LogSchema.omit({ id: true, created_at: true });
export type CreateLog = z.infer<typeof CreateLogSchema>;
