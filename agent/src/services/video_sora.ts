import axios from 'axios';

export interface VideoGenParams {
  prompt: string;
  duration: number;
  aspectRatio: string;
  seed?: number;
}

export async function generateVideo(params: VideoGenParams): Promise<string> {
  const apiKey = process.env.SORA_API_KEY;

  if (!apiKey) {
    throw new Error('SORA_API_KEY not set');
  }

  console.log('🎬 Generating video with Sora (OpenAI)...');

  // Note: This is a placeholder implementation
  // Sora API is not yet publicly available as of Jan 2025
  // Update this when official API is released

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/sora/generate',
      {
        prompt: params.prompt,
        duration: params.duration,
        aspect_ratio: params.aspectRatio,
        seed: params.seed
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const taskId = response.data.id;
    console.log(`⏳ Sora task created: ${taskId}, polling...`);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

      const statusResponse = await axios.get(
        `https://api.openai.com/v1/sora/status/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 15000
        }
      );

      if (statusResponse.data.status === 'completed') {
        console.log(`✅ Sora video ready: ${statusResponse.data.video_url}`);
        return statusResponse.data.video_url;
      } else if (statusResponse.data.status === 'failed') {
        throw new Error(`Sora failed: ${statusResponse.data.error}`);
      }
    }

    throw new Error('Sora timeout');
  } catch (error: any) {
    console.error('❌ Sora generation failed:', error.message);
    throw error;
  }
}
