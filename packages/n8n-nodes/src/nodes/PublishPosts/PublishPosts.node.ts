import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";

export class PublishPosts implements INodeType {
  description: INodeTypeDescription = {
    displayName: "LX Studio - Publish Posts",
    name: "lxStudioPublishPosts",
    group: ["transform"],
    version: 1,
    description: "Publie sur Instagram ou TikTok via l'API LX Studio (avec fallback Buffer)",
    defaults: {
      name: "Publish Posts",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      {
        displayName: "API Base URL",
        name: "apiBaseUrl",
        type: "string",
        default: "https://api.lxstudio.ch",
        required: true,
      },
      {
        displayName: "API Key",
        name: "apiKey",
        type: "string",
        typeOptions: { password: true },
        default: "",
      },
      {
        displayName: "Platform",
        name: "platform",
        type: "options",
        options: [
          { name: "Instagram", value: "instagram" },
          { name: "TikTok", value: "tiktok" },
        ],
        default: "instagram",
        required: true,
      },
      {
        displayName: "Asset ID",
        name: "assetId",
        type: "string",
        default: "",
        required: true,
      },
      {
        displayName: "Caption ID",
        name: "captionId",
        type: "string",
        default: "",
        required: true,
      },
      {
        displayName: "Video URL",
        name: "videoUrl",
        type: "string",
        default: "",
        required: true,
      },
      {
        displayName: "Caption Text",
        name: "captionText",
        type: "string",
        typeOptions: { rows: 4 },
        default: "",
        required: true,
      },
      {
        displayName: "Hashtags (comma-separated)",
        name: "hashtags",
        type: "string",
        default: "",
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const apiBaseUrl = this.getNodeParameter("apiBaseUrl", i) as string;
      const apiKey = this.getNodeParameter("apiKey", i, "") as string;
      const platform = this.getNodeParameter("platform", i) as string;
      const assetId = this.getNodeParameter("assetId", i) as string;
      const captionId = this.getNodeParameter("captionId", i) as string;
      const videoUrl = this.getNodeParameter("videoUrl", i) as string;
      const captionText = this.getNodeParameter("captionText", i) as string;
      const hashtagsStr = this.getNodeParameter("hashtags", i, "") as string;

      const hashtags = hashtagsStr.split(",").map((h) => h.trim()).filter(Boolean);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      }

      const endpoint = platform === "instagram" ? "/api/publish/instagram" : "/api/publish/tiktok";

      const body = {
        asset_id: assetId,
        caption_id: captionId,
        video_url: videoUrl,
        caption_text: captionText,
        hashtags,
      };

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      returnData.push({ json: data });
    }

    return [returnData];
  }
}
