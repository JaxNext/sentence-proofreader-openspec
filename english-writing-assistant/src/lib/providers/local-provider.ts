import { ProofreadResult } from "../types";
import { ProofreadProvider, AvailabilityStatus } from "./proofread-provider";
import { buildProofreadPrompt, parseProofreadResponse } from "./prompt-utils";
import { STORAGE_KEY } from "./provider-factory";

export class LocalProvider implements ProofreadProvider {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async checkAvailability(): Promise<AvailabilityStatus> {
    try {
      const response = await fetch(`${this.endpoint}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return "available";
      }
      return "unavailable";
    } catch {
      return "unavailable";
    }
  }

  async proofread(text: string): Promise<ProofreadResult> {
    const config = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const response = await fetch(`${this.endpoint}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model || "default",
        system_prompt: buildProofreadPrompt(),
        input: text,
        temperature: 0.1,
        store: false,
        stream: false,
        reasoning: 'off'
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Local LLM service is unavailable. Please verify it is running at ${this.endpoint}.`
      );
    }

    const data = await response.json();
    console.log("LocalProvider proofread response:", data);
    const list = data?.output || []
    const content = list.filter((item: any) => item.type === "message")?.[0]?.content ?? "";

    return parseProofreadResponse(content, text);
  }
}

export async function getModels() {
  const configStr = localStorage.getItem(STORAGE_KEY);
  if (!configStr) {
    return [];
  }
  const config = JSON.parse(configStr);
  const { localEndpoint = "" } = config;
  const modelsUrl = `${localEndpoint}/v1/models`;
  const response = await fetch(modelsUrl, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch models from ${modelsUrl}`);
  }
  const data = await response.json();
  const modelList = data?.data || [];
  return modelList.map((model: any) => model.id);
}
