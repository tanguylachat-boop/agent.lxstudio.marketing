import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";

export class SchedulePosts implements INodeType {
  description: INodeTypeDescription = {
    displayName: "LX Studio - Schedule Posts",
    name: "lxStudioSchedulePosts",
    group: ["transform"],
    version: 1,
    description: "Planifie des publications via l'API LX Studio",
    defaults: {
      name: "Schedule Posts",
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
        displayName: "Jobs (JSON Array)",
        name: "jobs",
        type: "json",
        default: "[]",
        required: true,
        description: 'Array de jobs: [{"platform":"instagram","type":"publish_post",...}]',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const apiBaseUrl = this.getNodeParameter("apiBaseUrl", i) as string;
      const apiKey = this.getNodeParameter("apiKey", i, "") as string;
      const jobsJson = this.getNodeParameter("jobs", i) as string;

      const jobs = JSON.parse(jobsJson);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      }

      const response = await fetch(`${apiBaseUrl}/api/schedule/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({ jobs }),
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
