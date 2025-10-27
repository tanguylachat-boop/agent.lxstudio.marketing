import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export async function generateAudio(text: string, outputPath: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVEN_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  console.log('🎙️  Generating audio with ElevenLabs...');

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const response = await axios.post(
        url,
        {
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 60000
        }
      );

      // Ensure output directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, response.data);
      console.log(`✅ Audio saved to ${outputPath}`);
      return outputPath;
    } catch (error: any) {
      attempts++;
      console.error(`❌ ElevenLabs attempt ${attempts}/${maxAttempts} failed:`, error.message);

      if (attempts >= maxAttempts) {
        throw new Error(`ElevenLabs failed after ${maxAttempts} attempts: ${error.message}`);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
    }
  }

  throw new Error('Failed to generate audio');
}
