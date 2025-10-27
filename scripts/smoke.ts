import * as dotenv from 'dotenv';
import * as path from 'path';
import { generateAndPublish } from '../agent/src/index';

dotenv.config({ path: path.join(__dirname, '../agent/.env') });

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          LX STUDIO AI AGENT - SMOKE TEST                 ║
║                                                           ║
║  This test will generate a complete video workflow       ║
║  WITHOUT publishing (unless PUBLISH_MAKE=true).          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

console.log('🔧 Configuration:');
console.log('   - VIDEO_PROVIDER:', process.env.VIDEO_PROVIDER || 'runway');
console.log('   - COMPOSE_BACKEND:', process.env.COMPOSE_BACKEND || 'ffmpeg');
console.log('   - LOG_BACKEND:', process.env.LOG_BACKEND || 'sheets');
console.log('   - PUBLISH_MAKE:', process.env.PUBLISH_MAKE || 'false');
console.log('   - TIMEZONE:', process.env.TIMEZONE || 'Europe/Zurich');
console.log('');

async function runSmokeTest() {
  try {
    const result = await generateAndPublish();

    if (result.success) {
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║  ✅ SMOKE TEST PASSED                                     ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      console.log('📦 Generated Assets:');
      console.log('   - Video:', result.videoPath);
      console.log('   - URL:', result.videoUrl);
      console.log('');
      console.log('📤 Publish Results:');
      console.log('   - Instagram:', result.publishResults?.instagram.success ? '✅ Published' : '⏭️  Skipped');
      console.log('     Post URL:', result.publishResults?.instagram.postUrl || 'N/A');
      console.log('   - TikTok:', result.publishResults?.tiktok.success ? '✅ Published' : '⏭️  Skipped');
      console.log('     Post URL:', result.publishResults?.tiktok.postUrl || 'N/A');
      console.log('');
      console.log('💡 To enable actual publishing, set PUBLISH_MAKE=true in .env');
      console.log('');
      process.exit(0);
    } else {
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║  ❌ SMOKE TEST FAILED                                     ║');
      console.log('╚═══════════════════════════════════════════════════════════╝\n');
      console.log('Error:', result.error);
      console.log('');
      console.log('🔍 Troubleshooting:');
      console.log('   1. Check all API keys in .env');
      console.log('   2. Verify webhook URLs are correct');
      console.log('   3. Check network connectivity');
      console.log('   4. Review logs above for specific errors');
      console.log('');
      process.exit(1);
    }
  } catch (error: any) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  💥 SMOKE TEST CRASHED                                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.error(error);
    process.exit(1);
  }
}

runSmokeTest();
