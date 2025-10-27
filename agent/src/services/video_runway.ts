import axios from 'axios';

export interface VideoGenParams {
  prompt: string;
  duration: number;
  aspectRatio: string;
  seed?: number;
}

export async function generateVideo(params: VideoGenParams): Promise<string> {
  const apiKey = process.env.RUNWAY_API_KEY;

  if (!apiKey) {
    throw new Error('RUNWAY_API_KEY not set');
  }

  console.log('🎬 Generating video with Runway Gen-3...');

  // Create generation task
  const createResponse = await axios.post(
    'https://api.runwayml.com/v1/gen3/video',
    {
      prompt: params.prompt,
      duration: params.duration || 5,
      aspect_ratio: params.aspectRatio || '9:16',
      seed: params.seed
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  const taskId = createResponse.data.id;
  console.log(`⏳ Runway task created: ${taskId}, waiting for completion...`);

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max (5s intervals)

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;

    const statusResponse = await axios.get(
      `https://api.runwayml.com/v1/gen3/video/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 15000
      }
    );

    const status = statusResponse.data.status;

    if (status === 'SUCCEEDED') {
      const videoUrl = statusResponse.data.output?.url;
      if (!videoUrl) {
        throw new Error('No video URL in response');
      }
      console.log(`✅ Video generated: ${videoUrl}`);
      return videoUrl;
    } else if (status === 'FAILED') {
      throw new Error(`Runway generation failed: ${statusResponse.data.error}`);
    }

    console.log(`⏳ Status: ${status} (${attempts}/${maxAttempts})`);
  }

  throw new Error('Runway generation timeout after 5 minutes');
}
