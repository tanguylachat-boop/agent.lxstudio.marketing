import * as fs from 'fs';
import * as path from 'path';
import * as sheetsLogger from './logger_sheets';
import * as supabaseLogger from './logger_supabase';

export async function updatePromptWithTopHooks(): Promise<void> {
  console.log('📈 Running A/B optimization: fetching top-performing hooks...');

  const logBackend = process.env.LOG_BACKEND || 'sheets';

  let topHooks: string[] = [];

  if (logBackend === 'sheets') {
    topHooks = await sheetsLogger.getTopHooks(10);
  } else if (logBackend === 'supabase') {
    topHooks = await supabaseLogger.getTopHooks(10);
  }

  if (topHooks.length === 0) {
    console.warn('⚠️  No top hooks found, skipping prompt update');
    return;
  }

  // Update post_template.md with examples of top hooks
  const templatePath = path.join(__dirname, '../prompts/post_template.md');
  let template = fs.readFileSync(templatePath, 'utf-8');

  // Insert top hooks as examples
  const hookSection = `\n## Top Performing Hooks (Last 7 Days)\nUtilise ces hooks comme inspiration pour créer des variantes gagnantes :\n\n${topHooks.map((hook, i) => `${i + 1}. "${hook}"`).join('\n')}\n`;

  // Check if section already exists
  if (template.includes('## Top Performing Hooks')) {
    template = template.replace(
      /## Top Performing Hooks[\s\S]*?(?=\n##|$)/,
      hookSection
    );
  } else {
    // Append before "Output Attendu"
    template = template.replace(
      /## Output Attendu/,
      `${hookSection}\n## Output Attendu`
    );
  }

  fs.writeFileSync(templatePath, template, 'utf-8');
  console.log(`✅ Updated prompt template with ${topHooks.length} top hooks`);
}

export function selectHookVariant(hookA: string, hookB: string): { hook: string; variant: 'A' | 'B' } {
  // Simple random A/B selection (50/50)
  const useA = Math.random() < 0.5;
  return {
    hook: useA ? hookA : hookB,
    variant: useA ? 'A' : 'B'
  };
}
