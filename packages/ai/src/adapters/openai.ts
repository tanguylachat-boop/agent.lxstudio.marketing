import OpenAI from "openai";
import type { LLMProvider, LLMOptions } from "../llm.js";
import { LLMError } from "../llm.js";

/**
 * Adaptateur OpenAI
 */
export class OpenAIAdapter implements LLMProvider {
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = "gpt-4o") {
    this.client = new OpenAI({ apiKey });
    this.defaultModel = defaultModel;
  }

  async generateCompletion(prompt: string, options?: LLMOptions): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages: [
          ...(options?.systemPrompt
            ? [{ role: "system" as const, content: options.systemPrompt }]
            : []),
          { role: "user" as const, content: prompt },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      return content;
    } catch (error) {
      throw new LLMError("OpenAI completion failed", "openai", error as Error);
    }
  }

  async generateJSON<T>(prompt: string, options?: LLMOptions): Promise<T> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages: [
          ...(options?.systemPrompt
            ? [{ role: "system" as const, content: options.systemPrompt }]
            : []),
          { role: "user" as const, content: prompt },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      return JSON.parse(content) as T;
    } catch (error) {
      throw new LLMError("OpenAI JSON generation failed", "openai", error as Error);
    }
  }
}
