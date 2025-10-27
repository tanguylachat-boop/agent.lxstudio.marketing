import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { TrendData } from './trends';

export interface ScriptOutput {
  hookA: string;
  hookB: string;
  script: string;
  cta: string;
  hashtags: string[];
  description: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateScript(trends: TrendData, variant: 'A' | 'B' = 'A'): Promise<ScriptOutput> {
  const systemPrompt = fs.readFileSync(
    path.join(__dirname, '../prompts/system.md'),
    'utf-8'
  );

  let userTemplate = fs.readFileSync(
    path.join(__dirname, '../prompts/post_template.md'),
    'utf-8'
  );

  // Replace placeholders
  userTemplate = userTemplate
    .replace('{{NICHE}}', trends.niche)
    .replace('{{TRENDS}}', trends.topics.join(', '))
    .replace('{{PERSONA}}', trends.persona);

  console.log('🤖 Generating script with Claude 3.5 Sonnet...');

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userTemplate
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        hookA: parsed.HOOK_A,
        hookB: parsed.HOOK_B,
        script: parsed.SCRIPT,
        cta: parsed.CTA,
        hashtags: parsed.HASHTAGS,
        description: parsed.DESCRIPTION
      };
    } catch (error) {
      attempts++;
      console.error(`❌ Attempt ${attempts}/${maxAttempts} failed:`, error);

      if (attempts >= maxAttempts) {
        throw new Error(`Failed to generate script after ${maxAttempts} attempts`);
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
    }
  }

  throw new Error('Failed to generate script');
}
