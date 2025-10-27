import { google } from 'googleapis';
import * as fs from 'fs';

export interface LogEntry {
  timestamp: string;
  hook: string;
  variant: 'A' | 'B';
  platform: string;
  postUrl?: string;
  postId?: string;
  success: boolean;
  error?: string;
  hashtags: string[];
  cta: string;
}

let sheetsClient: any = null;

async function initSheets() {
  if (sheetsClient) return sheetsClient;

  const credsPath = process.env.SHEETS_CREDS_PATH || './credentials.json';

  if (!fs.existsSync(credsPath)) {
    throw new Error(`Google credentials not found at ${credsPath}`);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export async function logToSheets(entry: LogEntry): Promise<void> {
  const docId = process.env.SHEETS_DOC_ID;

  if (!docId) {
    console.warn('⚠️  SHEETS_DOC_ID not set, skipping Sheets log');
    return;
  }

  try {
    const sheets = await initSheets();

    const values = [
      [
        entry.timestamp,
        entry.hook,
        entry.variant,
        entry.platform,
        entry.postUrl || '',
        entry.postId || '',
        entry.success ? 'SUCCESS' : 'FAILED',
        entry.error || '',
        entry.hashtags.join(', '),
        entry.cta
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: docId,
      range: 'Logs!A:J',
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log('✅ Logged to Google Sheets');
  } catch (error: any) {
    console.error('❌ Sheets logging failed:', error.message);
  }
}

export async function getTopHooks(limit: number = 10): Promise<string[]> {
  const docId = process.env.SHEETS_DOC_ID;

  if (!docId) {
    console.warn('⚠️  SHEETS_DOC_ID not set, returning empty hooks');
    return [];
  }

  try {
    const sheets = await initSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: docId,
      range: 'Logs!A:J'
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return [];
    }

    // Simple scoring: count successful posts per hook
    const hookScores: { [hook: string]: number } = {};

    for (let i = 1; i < rows.length; i++) {
      const [, hook, , , , , success] = rows[i];
      if (success === 'SUCCESS' && hook) {
        hookScores[hook] = (hookScores[hook] || 0) + 1;
      }
    }

    // Sort and return top N
    const sorted = Object.entries(hookScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([hook]) => hook);

    console.log(`📊 Top ${limit} hooks from Sheets:`, sorted);
    return sorted;
  } catch (error: any) {
    console.error('❌ Failed to fetch top hooks:', error.message);
    return [];
  }
}
