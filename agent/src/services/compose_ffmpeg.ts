import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface CompositionParams {
  videoUrl: string;
  audioPath: string;
  script: string;
  outputPath: string;
}

export async function composeVideo(params: CompositionParams): Promise<string> {
  console.log('🎞️  Composing final video with FFmpeg...');

  const workDir = path.dirname(params.outputPath);
  const videoPath = path.join(workDir, 'raw_video.mp4');
  const logoPath = path.join(workDir, 'logo.png');
  const subsPath = path.join(workDir, 'subtitles.srt');

  // Download video
  console.log('⬇️  Downloading video...');
  const videoResponse = await axios.get(params.videoUrl, {
    responseType: 'arraybuffer',
    timeout: 120000
  });
  fs.writeFileSync(videoPath, videoResponse.data);

  // Download logo (if ASSETS_BASE_URL is set)
  const assetsBase = process.env.ASSETS_BASE_URL;
  if (assetsBase) {
    try {
      const logoResponse = await axios.get(`${assetsBase}/logo.png`, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      fs.writeFileSync(logoPath, logoResponse.data);
      console.log('✅ Logo downloaded');
    } catch (error) {
      console.warn('⚠️  Logo download failed, skipping overlay');
    }
  }

  // Generate SRT subtitles (simple word-by-word timing)
  generateSubtitles(params.script, subsPath);

  return new Promise((resolve, reject) => {
    const command = ffmpeg()
      .input(videoPath)
      .input(params.audioPath);

    // Add logo overlay if available
    if (fs.existsSync(logoPath)) {
      command.input(logoPath);
    }

    command
      .outputOptions('-c:v libx264')
      .outputOptions('-c:a aac')
      .outputOptions('-b:a 192k')
      .outputOptions('-ar 44100')
      .outputOptions('-shortest')
      .outputOptions('-pix_fmt yuv420p')
      .size('1080x1920')
      .aspect('9:16');

    // Complex filter for logo overlay + subtitles
    let filterComplex = '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[scaled];';

    if (fs.existsSync(logoPath)) {
      filterComplex += '[2:v]scale=96:-1[logo];[scaled][logo]overlay=W-w-20:20[vid];';
    } else {
      filterComplex += '[scaled]copy[vid];';
    }

    // Add subtitles if SRT exists
    if (fs.existsSync(subsPath)) {
      const escapedPath = subsPath.replace(/\\/g, '/').replace(/:/g, '\\:');
      filterComplex += `[vid]subtitles=${escapedPath}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Alignment=2,MarginV=80'[final]`;
      command.outputOptions(`-filter_complex ${filterComplex}`);
      command.outputOptions('-map [final]');
    } else {
      command.outputOptions(`-filter_complex ${filterComplex}`);
      command.outputOptions('-map [vid]');
    }

    command.outputOptions('-map 1:a');

    command
      .output(params.outputPath)
      .on('start', (cmd) => {
        console.log('🎬 FFmpeg command:', cmd);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`⏳ Progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log(`✅ Final video created: ${params.outputPath}`);
        // Cleanup temp files
        try {
          fs.unlinkSync(videoPath);
          if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
          if (fs.existsSync(subsPath)) fs.unlinkSync(subsPath);
        } catch (e) {
          // Ignore cleanup errors
        }
        resolve(params.outputPath);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err);
        reject(err);
      })
      .run();
  });
}

function generateSubtitles(script: string, outputPath: string): void {
  // Simple SRT generation (word-by-word timing)
  const words = script.split(/\s+/);
  const avgWordDuration = 0.4; // seconds per word
  let srtContent = '';
  let index = 1;
  let currentTime = 0;

  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ');
    const startTime = formatSrtTime(currentTime);
    currentTime += avgWordDuration * Math.min(3, words.length - i);
    const endTime = formatSrtTime(currentTime);

    srtContent += `${index}\n${startTime} --> ${endTime}\n${chunk}\n\n`;
    index++;
  }

  fs.writeFileSync(outputPath, srtContent, 'utf-8');
  console.log(`✅ Subtitles generated: ${outputPath}`);
}

function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
}

function pad(num: number, size: number = 2): string {
  let s = num.toString();
  while (s.length < size) s = '0' + s;
  return s;
}
