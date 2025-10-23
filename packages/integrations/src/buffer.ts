import type { PublishResult } from "./types.js";

/**
 * Client de fallback pour Buffer/Hootsuite via webhook
 */
export class BufferWebhookClient {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Envoie une demande de publication vers Buffer/Hootsuite
   */
  async sendPublishRequest(params: {
    platform: "instagram" | "tiktok";
    videoUrl: string;
    caption: string;
    scheduledAt?: string;
  }): Promise<PublishResult> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: params.platform,
          video_url: params.videoUrl,
          caption: params.caption,
          scheduled_at: params.scheduledAt,
          source: "lxstudio-automation",
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Buffer webhook failed with status ${response.status}`,
        };
      }

      const data = (await response.json()) as { success?: boolean; id?: string };

      return {
        success: data.success ?? true,
        postId: data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Webhook request failed",
      };
    }
  }
}
