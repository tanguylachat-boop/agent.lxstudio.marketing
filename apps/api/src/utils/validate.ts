import { z, ZodSchema } from "zod";
import { ValidationError } from "./errors.js";

/**
 * Valide des données avec un schema Zod
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.errors);
  }
  return result.data;
}
