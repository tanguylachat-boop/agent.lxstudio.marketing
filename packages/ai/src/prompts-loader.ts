import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Charge un fichier prompt depuis le dossier prompts/
 */
export function loadPrompt(name: string): string {
  const path = join(__dirname, "prompts", `${name}.txt`);
  return readFileSync(path, "utf-8");
}

/**
 * Charge et remplace les variables dans un prompt
 */
export function interpolatePrompt(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }, template);
}
