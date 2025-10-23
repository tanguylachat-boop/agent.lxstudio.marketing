/**
 * Générateur d'URL avec paramètres UTM
 */
export class UtmBuilder {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Construit une URL avec paramètres UTM
   */
  build(params: {
    path?: string;
    source: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  }): string {
    const url = new URL(params.path || "/", this.baseUrl);

    url.searchParams.set("utm_source", params.source);
    url.searchParams.set("utm_medium", params.medium || "short");
    url.searchParams.set("utm_campaign", params.campaign || "lxstudio_acq");

    if (params.content) {
      url.searchParams.set("utm_content", params.content);
    }
    if (params.term) {
      url.searchParams.set("utm_term", params.term);
    }

    return url.toString();
  }

  /**
   * Raccourci pour Instagram
   */
  forInstagram(contentId?: string): string {
    return this.build({
      source: "instagram",
      medium: "short",
      campaign: "lxstudio_acq",
      content: contentId,
    });
  }

  /**
   * Raccourci pour TikTok
   */
  forTikTok(contentId?: string): string {
    return this.build({
      source: "tiktok",
      medium: "short",
      campaign: "lxstudio_acq",
      content: contentId,
    });
  }
}
