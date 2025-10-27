import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fetchTrends } from './services/trends';
import { generateScript } from './services/llm_claude';
import { generateAudio } from './services/tts_elevenlabs';
import * as runwayVideo from './services/video_runway';
import * as soraVideo from './services/video_sora';
import * as ffmpegCompose from './services/compose_ffmpeg';
import * as shotstackCompose from './services/compose_shotstack';
import { publishBoth } from './services/make_publisher';
import { logToSheets } from './services/logger_sheets';
import { logToSupabase } from './services/logger_supabase';
import { selectHookVariant } from './services/ab_select';

dotenv.config();

export interface GenerationResult {
  success: boolean;
  videoPath?: string;
  videoUrl?: string;
  publishResults?: {
    instagram: any;
    tiktok: any;
  };
  error?: string;
}

export async function generateAndPublish(): Promise<GenerationResult> {
  console.log('\n🚀 === LX Studio AI Agent - Starting Generation ===\n');

  const workDir = path.join(__dirname, '../output', `job_${Date.now()}`);
  fs.mkdirSync(workDir, { recursive: true });

  try {
    // 1. Fetch trends
    console.log('📊 Step 1/7: Fetching trends...');
    const trends = await fetchTrends();
    console.log('✅ Trends:', trends.topics);

    // 2. Generate script with Claude
    console.log('\n📝 Step 2/7: Generating script with Claude...');
    const scriptData = await generateScript(trends);
    console.log('✅ Script generated');
    console.log('   Hook A:', scriptData.hookA);
    console.log('   Hook B:', scriptData.hookB);

    // 3. Select hook variant (A/B test)
    const { hook, variant } = selectHookVariant(scriptData.hookA, scriptData.hookB);
    console.log(`\n🎯 Selected variant: ${variant} - "${hook}"`);

    // 4. Generate audio with ElevenLabs
    console.log('\n🎙️  Step 3/7: Generating audio...');
    const audioPath = path.join(workDir, 'audio.mp3');
    await generateAudio(scriptData.script, audioPath);

    // 5. Generate video
    console.log('\n🎬 Step 4/7: Generating video...');
    const videoProvider = process.env.VIDEO_PROVIDER || 'runway';
    let rawVideoUrl: string;

    const videoPrompt = `Professional B-roll footage for luxury tech agency content. Theme: ${trends.topics[0]}. Style: Modern, elegant, premium. No people, abstract visuals, tech elements, smooth motion.`;

    if (videoProvider === 'runway') {
      rawVideoUrl = await runwayVideo.generateVideo({
        prompt: videoPrompt,
        duration: 5,
        aspectRatio: '9:16'
      });
    } else if (videoProvider === 'sora') {
      rawVideoUrl = await soraVideo.generateVideo({
        prompt: videoPrompt,
        duration: 5,
        aspectRatio: '9:16'
      });
    } else {
      throw new Error(`Unknown VIDEO_PROVIDER: ${videoProvider}`);
    }

    console.log('✅ Video generated:', rawVideoUrl);

    // 6. Compose final video (audio + subtitles + logo)
    console.log('\n🎞️  Step 5/7: Composing final video...');
    const composeBackend = process.env.COMPOSE_BACKEND || 'ffmpeg';
    const finalVideoPath = path.join(workDir, 'final_video.mp4');

    let finalVideoLocation: string;

    if (composeBackend === 'ffmpeg') {
      finalVideoLocation = await ffmpegCompose.composeVideo({
        videoUrl: rawVideoUrl,
        audioPath,
        script: scriptData.script,
        outputPath: finalVideoPath
      });
    } else if (composeBackend === 'shotstack') {
      finalVideoLocation = await shotstackCompose.composeVideo({
        videoUrl: rawVideoUrl,
        audioPath,
        script: scriptData.script,
        outputPath: finalVideoPath
      });
    } else {
      throw new Error(`Unknown COMPOSE_BACKEND: ${composeBackend}`);
    }

    console.log('✅ Final video ready:', finalVideoLocation);

    // 7. Publish to Make.com (Instagram & TikTok)
    console.log('\n📤 Step 6/7: Publishing to Make.com...');

    // For local file, we need a public URL
    // In production, upload to cloud storage first
    const assetsBase = process.env.ASSETS_BASE_URL;
    const videoUrl = assetsBase
      ? `${assetsBase}/videos/${path.basename(finalVideoPath)}`
      : finalVideoLocation;

    const publishResults = await publishBoth(
      videoUrl,
      scriptData.description,
      scriptData.hashtags,
      hook,
      variant,
      scriptData.cta
    );

    console.log('✅ Instagram:', publishResults.instagram.success ? '✓' : '✗');
    console.log('✅ TikTok:', publishResults.tiktok.success ? '✓' : '✗');

    // 8. Log results
    console.log('\n📊 Step 7/7: Logging results...');
    const logBackend = process.env.LOG_BACKEND || 'sheets';

    const timestamp = new Date().toISOString();

    for (const [platform, result] of Object.entries(publishResults)) {
      const logEntry = {
        timestamp,
        hook,
        variant,
        platform,
        postUrl: result.postUrl,
        postId: result.postId,
        success: result.success,
        error: result.error,
        hashtags: scriptData.hashtags,
        cta: scriptData.cta
      };

      if (logBackend === 'sheets') {
        await logToSheets(logEntry);
      } else if (logBackend === 'supabase') {
        await logToSupabase(logEntry);
      }
    }

    console.log('\n✅ === Generation Complete ===\n');

    return {
      success: true,
      videoPath: finalVideoPath,
      videoUrl,
      publishResults
    };
  } catch (error: any) {
    console.error('\n❌ === Generation Failed ===');
    console.error(error);

    return {
      success: false,
      error: error.message
    };
  }
}

// Allow direct execution
if (require.main === module) {
  generateAndPublish()
    .then((result) => {
      if (result.success) {
        console.log('🎉 Success! Video:', result.videoPath);
        process.exit(0);
      } else {
        console.error('💥 Failed:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}
