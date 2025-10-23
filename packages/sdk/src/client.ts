import type {
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  GenerateScriptRequest,
  GenerateScriptResponse,
  GenerateCaptionRequest,
  GenerateCaptionResponse,
  ComposeAssetsRequest,
  ComposeAssetsResponse,
  CreateJob,
  Job,
  PublishInstagramRequest,
  PublishTikTokRequest,
  PublishResponse,
  PullAnalyticsRequest,
  PullAnalyticsResponse,
  CreateLead,
  CreateLeadResponse,
} from "@lxstudio/schemas";
import { ApiError, NetworkError } from "./errors.js";

/**
 * Options du client API
 */
export interface LXStudioClientOptions {
  baseUrl: string;
  apiKey?: string;
  supabaseToken?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Client TypeScript pour l'API LX Studio
 */
export class LXStudioClient {
  private baseUrl: string;
  private apiKey?: string;
  private supabaseToken?: string;
  private timeout: number;
  private maxRetries: number;

  constructor(options: LXStudioClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.supabaseToken = options.supabaseToken;
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * Effectue une requête HTTP avec retries
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retries = this.maxRetries
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }
    if (this.supabaseToken) {
      headers["Authorization"] = `Bearer ${this.supabaseToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorBody, response.statusText);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry sur erreurs réseau ou 5xx
      if (
        retries > 0 &&
        (error instanceof TypeError ||
          (error instanceof ApiError && error.statusCode >= 500))
      ) {
        const delay = Math.pow(2, this.maxRetries - retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request<T>(method, path, body, retries - 1);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new NetworkError("Network request failed", error as Error);
    }
  }

  // ==================== Ideas ====================

  async generateIdeas(request: GenerateIdeasRequest): Promise<GenerateIdeasResponse> {
    return this.request<GenerateIdeasResponse>("POST", "/api/ideas", request);
  }

  // ==================== Calendar ====================

  async generateCalendar(request: { week_start: string; count?: number }): Promise<unknown> {
    return this.request("POST", "/api/calendar", request);
  }

  // ==================== Script ====================

  async generateScript(request: GenerateScriptRequest): Promise<GenerateScriptResponse> {
    return this.request<GenerateScriptResponse>("POST", "/api/script", request);
  }

  // ==================== Caption ====================

  async generateCaption(request: GenerateCaptionRequest): Promise<GenerateCaptionResponse> {
    return this.request<GenerateCaptionResponse>("POST", "/api/caption", request);
  }

  // ==================== Assets ====================

  async composeAssets(request: ComposeAssetsRequest): Promise<ComposeAssetsResponse> {
    return this.request<ComposeAssetsResponse>("POST", "/api/assets/compose", request);
  }

  async getAsset(assetId: string): Promise<unknown> {
    return this.request("GET", `/api/assets/${assetId}`);
  }

  // ==================== Schedule ====================

  async createSchedule(request: { jobs: CreateJob[] }): Promise<{ job_ids: string[] }> {
    return this.request("POST", "/api/schedule/create", request);
  }

  async listJobs(params?: { status?: string; platform?: string }): Promise<{ jobs: Job[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request("GET", `/api/schedule/jobs${query ? `?${query}` : ""}`);
  }

  // ==================== Publish ====================

  async publishInstagram(request: PublishInstagramRequest): Promise<PublishResponse> {
    return this.request<PublishResponse>("POST", "/api/publish/instagram", request);
  }

  async publishTikTok(request: PublishTikTokRequest): Promise<PublishResponse> {
    return this.request<PublishResponse>("POST", "/api/publish/tiktok", request);
  }

  // ==================== Analytics ====================

  async pullAnalytics(request: PullAnalyticsRequest): Promise<PullAnalyticsResponse> {
    return this.request<PullAnalyticsResponse>("POST", "/api/analytics/pull", request);
  }

  async getAnalytics(params?: {
    platform?: string;
    since?: string;
  }): Promise<{ analytics: unknown[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request("GET", `/api/analytics${query ? `?${query}` : ""}`);
  }

  // ==================== Leads ====================

  async createLead(request: CreateLead): Promise<CreateLeadResponse> {
    return this.request<CreateLeadResponse>("POST", "/api/leads/webhook", request);
  }

  async listLeads(params?: { since?: string }): Promise<{ leads: unknown[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request("GET", `/api/leads${query ? `?${query}` : ""}`);
  }

  // ==================== Health ====================

  async health(): Promise<{ status: string }> {
    return this.request("GET", "/api/health");
  }
}
