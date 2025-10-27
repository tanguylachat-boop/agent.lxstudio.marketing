import axios from 'axios';

export interface CompositionParams {
  videoUrl: string;
  audioPath: string;
  script: string;
  outputPath: string;
}

export async function composeVideo(params: CompositionParams): Promise<string> {
  const apiKey = process.env.SHOTSTACK_API_KEY;

  if (!apiKey) {
    throw new Error('SHOTSTACK_API_KEY not set');
  }

  console.log('🎞️  Composing video with Shotstack...');

  const assetsBase = process.env.ASSETS_BASE_URL;
  const logoUrl = assetsBase ? `${assetsBase}/logo.png` : null;

  // Build Shotstack timeline
  const timeline = {
    soundtrack: {
      src: params.audioPath,
      effect: 'fadeInFadeOut'
    },
    tracks: [
      {
        clips: [
          {
            asset: {
              type: 'video',
              src: params.videoUrl
            },
            start: 0,
            length: 'auto',
            fit: 'cover',
            scale: 1
          }
        ]
      }
    ]
  };

  // Add logo overlay track if available
  if (logoUrl) {
    timeline.tracks.push({
      clips: [
        {
          asset: {
            type: 'image',
            src: logoUrl
          },
          start: 0,
          length: 'auto',
          fit: 'none',
          scale: 0.15,
          position: 'topRight',
          offset: {
            x: -0.02,
            y: 0.02
          }
        }
      ]
    } as any);
  }

  // Add subtitle track (simple text overlay)
  const words = params.script.split(/\s+/);
  const subtitleClips = [];
  let currentTime = 0;
  const avgWordDuration = 0.4;

  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ');
    subtitleClips.push({
      asset: {
        type: 'title',
        text: chunk,
        style: 'subtitle',
        size: 'medium',
        color: '#ffffff',
        background: '#000000',
        position: 'bottom'
      },
      start: currentTime,
      length: avgWordDuration * Math.min(3, words.length - i)
    });
    currentTime += avgWordDuration * Math.min(3, words.length - i);
  }

  timeline.tracks.push({
    clips: subtitleClips
  } as any);

  // Create render request
  const renderPayload = {
    timeline,
    output: {
      format: 'mp4',
      resolution: 'hd',
      aspectRatio: '9:16',
      size: {
        width: 1080,
        height: 1920
      },
      fps: 25,
      scaleTo: 'preview'
    }
  };

  console.log('🚀 Submitting to Shotstack...');

  const renderResponse = await axios.post(
    'https://api.shotstack.io/v1/render',
    renderPayload,
    {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  const renderId = renderResponse.data.response.id;
  console.log(`⏳ Shotstack render ID: ${renderId}, polling...`);

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;

    const statusResponse = await axios.get(
      `https://api.shotstack.io/v1/render/${renderId}`,
      {
        headers: {
          'x-api-key': apiKey
        },
        timeout: 15000
      }
    );

    const status = statusResponse.data.response.status;

    if (status === 'done') {
      const finalUrl = statusResponse.data.response.url;
      console.log(`✅ Shotstack video ready: ${finalUrl}`);
      return finalUrl;
    } else if (status === 'failed') {
      throw new Error(`Shotstack render failed: ${statusResponse.data.response.error}`);
    }

    console.log(`⏳ Status: ${status} (${attempts}/${maxAttempts})`);
  }

  throw new Error('Shotstack render timeout');
}
