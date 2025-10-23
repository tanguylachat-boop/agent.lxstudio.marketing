import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";

export class GenerateContent implements INodeType {
  description: INodeTypeDescription = {
    displayName: "LX Studio - Generate Content",
    name: "lxStudioGenerateContent",
    group: ["transform"],
    version: 1,
    description: "Génère idées, script et caption via l'API LX Studio",
    defaults: {
      name: "Generate Content",
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
        description: "URL de base de l'API LX Studio",
      },
      {
        displayName: "API Key",
        name: "apiKey",
        type: "string",
        typeOptions: { password: true },
        default: "",
        description: "Clé API (optionnel)",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        options: [
          { name: "Generate Ideas", value: "ideas" },
          { name: "Generate Script", value: "script" },
          { name: "Generate Caption", value: "caption" },
        ],
        default: "ideas",
        required: true,
      },
      {
        displayName: "Idea Count",
        name: "ideaCount",
        type: "number",
        default: 20,
        displayOptions: { show: { operation: ["ideas"] } },
        description: "Nombre d'idées à générer",
      },
      {
        displayName: "Idea ID",
        name: "ideaId",
        type: "string",
        default: "",
        displayOptions: { show: { operation: ["script", "caption"] } },
        required: true,
        description: "UUID de l'idée source",
      },
      {
        displayName: "Duration (seconds)",
        name: "durationTarget",
        type: "number",
        default: 15,
        displayOptions: { show: { operation: ["script"] } },
        description: "Durée cible du script (10-60s)",
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter("operation", i) as string;
      const apiBaseUrl = this.getNodeParameter("apiBaseUrl", i) as string;
      const apiKey = this.getNodeParameter("apiKey", i, "") as string;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      }

      let endpoint = "";
      let body = {};

      switch (operation) {
        case "ideas": {
          const count = this.getNodeParameter("ideaCount", i) as number;
          endpoint = "/api/ideas";
          body = { count };
          break;
        }
        case "script": {
          const ideaId = this.getNodeParameter("ideaId", i) as string;
          const durationTarget = this.getNodeParameter("durationTarget", i) as number;
          endpoint = "/api/script";
          body = { idea_id: ideaId, duration_target_s: durationTarget };
          break;
        }
        case "caption": {
          const ideaId = this.getNodeParameter("ideaId", i) as string;
          endpoint = "/api/caption";
          body = { idea_id: ideaId };
          break;
        }
      }

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
