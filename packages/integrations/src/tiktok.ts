import type { PublishResult, Metrics } from "./types.js";

/**
 * Client TikTok Content Posting API
 */
export class TikTokClient {
  private accessToken: string;
  private baseUrl = "https://open.tiktokapis.com/v2";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Publie une vidéo sur TikTok
   */
  async publishVideo(params: {
    videoUrl: string;
    caption: string;
    privacyLevel?: "PUBLIC" | "FRIENDS" | "SELF";
    disableComment?: boolean;
    disableDuet?: boolean;
    disableStitch?: boolean;
  }): Promise<PublishResult> {
    try {
      // TikTok nécessite d'abord un upload de la vidéo, puis la publication
      // Simplifié ici : en production, suivre le flow officiel (init → upload → publish)

      const response = await fetch(`${this.baseUrl}/post/publish/video/init/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: {
            title: params.caption,
            privacy_level: params.privacyLevel || "PUBLIC",
            disable_comment: params.disableComment || false,
            disable_duet: params.disableDuet || false,
            disable_stitch: params.disableStitch || false,
          },
          source_info: {
            source: "FILE_URL",
            video_url: params.videoUrl,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || "TikTok publish failed",
          response: error,
        };
      }

      const data = (await response.json()) as {
        data: { publish_id: string; upload_url?: string };
      };

      return {
        success: true,
        postId: data.data.publish_id,
        permalink: `https://www.tiktok.com/@username/video/${data.data.publish_id}`, // Placeholder
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Récupère les métriques d'une vidéo (stub simplifié)
   */
  async getVideoMetrics(videoId: string): Promise<Metrics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/video/query/?fields=id,view_count,like_count,comment_count,share_count`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: {
            video_ids: [videoId],
          },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        data: {
          videos: Array<{
            view_count: number;
            like_count: number;
            comment_count: number;
            share_count: number;
          }>;
        };
      };

      const video = data.data.videos[0];
      if (!video) {
        return null;
      }

      return {
        views: video.view_count,
        likes: video.like_count,
        comments: video.comment_count,
        shares: video.share_count,
      };
    } catch {
      return null;
    }
  }
}
