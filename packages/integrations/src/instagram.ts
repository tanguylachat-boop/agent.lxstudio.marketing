import type { PublishResult, Metrics } from "./types.js";

/**
 * Client Instagram Graph API
 */
export class InstagramClient {
  private accessToken: string;
  private igUserId: string;
  private baseUrl = "https://graph.facebook.com/v18.0";

  constructor(accessToken: string, igUserId: string) {
    this.accessToken = accessToken;
    this.igUserId = igUserId;
  }

  /**
   * Publie une vidéo Reels sur Instagram
   */
  async publishReel(params: {
    videoUrl: string;
    caption: string;
    coverUrl?: string;
    shareToFeed?: boolean;
    locationId?: string;
  }): Promise<PublishResult> {
    try {
      // Étape 1 : Créer le conteneur média
      const createResponse = await fetch(
        `${this.baseUrl}/${this.igUserId}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            media_type: "REELS",
            video_url: params.videoUrl,
            caption: params.caption,
            cover_url: params.coverUrl,
            share_to_feed: params.shareToFeed ?? true,
            location_id: params.locationId,
            access_token: this.accessToken,
          }),
        }
      );

      if (!createResponse.ok) {
        const error = await createResponse.json();
        return {
          success: false,
          error: error.error?.message || "Failed to create media container",
          response: error,
        };
      }

      const createData = (await createResponse.json()) as { id: string };
      const containerId = createData.id;

      // Étape 2 : Attendre que la vidéo soit prête (polling)
      await this.waitForMediaReady(containerId);

      // Étape 3 : Publier le conteneur
      const publishResponse = await fetch(
        `${this.baseUrl}/${this.igUserId}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: this.accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        return {
          success: false,
          error: error.error?.message || "Failed to publish media",
          response: error,
        };
      }

      const publishData = (await publishResponse.json()) as { id: string };

      return {
        success: true,
        postId: publishData.id,
        permalink: `https://www.instagram.com/p/${publishData.id}/`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Récupère les insights d'un post
   */
  async getInsights(mediaId: string): Promise<Metrics | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${mediaId}/insights?metric=impressions,reach,likes,comments,shares,saves,profile_visits&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        data: Array<{ name: string; values: Array<{ value: number }> }>;
      };

      const metrics: Metrics = {};
      data.data.forEach((item) => {
        const value = item.values[0]?.value || 0;
        switch (item.name) {
          case "impressions":
            metrics.views = value;
            break;
          case "reach":
            metrics.reach = value;
            break;
          case "likes":
            metrics.likes = value;
            break;
          case "comments":
            metrics.comments = value;
            break;
          case "shares":
            metrics.shares = value;
            break;
          case "saves":
            metrics.saves = value;
            break;
          case "profile_visits":
            metrics.profileVisits = value;
            break;
        }
      });

      return metrics;
    } catch {
      return null;
    }
  }

  /**
   * Attend que le média soit prêt (status = FINISHED)
   */
  private async waitForMediaReady(containerId: string, maxAttempts = 20): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(
        `${this.baseUrl}/${containerId}?fields=status_code&access_token=${this.accessToken}`
      );

      if (response.ok) {
        const data = (await response.json()) as { status_code: string };
        if (data.status_code === "FINISHED") {
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    throw new Error("Media processing timeout");
  }
}
