import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

export interface PublishPayload {
  platform: 'instagram' | 'tiktok';
  videoUrl: string;
  caption: string;
  hashtags: string[];
  altText: string;
  thumbUrl?: string;
  metadata: {
    hook: string;
    variant: 'A' | 'B';
    cta: string;
  };
}

export interface PublishResult {
  platform: string;
  success: boolean;
  postUrl?: string;
  postId?: string;
  error?: string;
}

export async function publishToMake(payload: PublishPayload): Promise<PublishResult> {
  const webhookUrl = payload.platform === 'instagram'
    ? process.env.MAKE_WEBHOOK_IG
    : process.env.MAKE_WEBHOOK_TT;

  if (!webhookUrl) {
    throw new Error(`MAKE_WEBHOOK_${payload.platform.toUpperCase()} not set`);
  }

  const publishEnabled = process.env.PUBLISH_MAKE === 'true';

  if (!publishEnabled) {
    console.log(`⚠️  PUBLISH_MAKE=false, skipping ${payload.platform} publish (dry-run)`);
    return {
      platform: payload.platform,
      success: true,
      postUrl: `https://example.com/${payload.platform}/dryrun-post-id`,
      postId: 'dryrun-' + Date.now()
    };
  }

  console.log(`📤 Publishing to ${payload.platform} via Make.com...`);

  try {
    const response = await axios.post(
      webhookUrl,
      {
        platform: payload.platform,
        video_url: payload.videoUrl,
        caption: payload.caption,
        hashtags: payload.hashtags,
        alt_text: payload.altText,
        thumb_url: payload.thumbUrl,
        metadata: payload.metadata
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log(`✅ ${payload.platform} publish successful`);

    return {
      platform: payload.platform,
      success: true,
      postUrl: response.data.post_url || response.data.url,
      postId: response.data.post_id || response.data.id
    };
  } catch (error: any) {
    console.error(`❌ ${payload.platform} publish failed:`, error.message);

    return {
      platform: payload.platform,
      success: false,
      error: error.message
    };
  }
}

export async function publishBoth(
  videoUrl: string,
  caption: string,
  hashtags: string[],
  hook: string,
  variant: 'A' | 'B',
  cta: string
): Promise<{ instagram: PublishResult; tiktok: PublishResult }> {
  const basePayload = {
    videoUrl,
    caption,
    hashtags,
    altText: `LX Studio — ${caption.substring(0, 100)}`,
    metadata: { hook, variant, cta }
  };

  // Publish to both platforms in parallel
  const [igResult, ttResult] = await Promise.all([
    publishToMake({ ...basePayload, platform: 'instagram' }),
    publishToMake({ ...basePayload, platform: 'tiktok' })
  ]);

  return {
    instagram: igResult,
    tiktok: ttResult
  };
}
