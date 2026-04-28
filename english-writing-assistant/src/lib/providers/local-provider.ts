import { ProofreadResult } from "../types";
import { ProofreadProvider, AvailabilityStatus } from "./proofread-provider";
import { buildProofreadPrompt, parseProofreadResponse } from "./prompt-utils";

export class LocalProvider implements ProofreadProvider {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async checkAvailability(): Promise<AvailabilityStatus> {
    try {
      const response = await fetch(`${this.endpoint}/v1/models`, {
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
    const prompt = buildProofreadPrompt(text);

    const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "default",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Local LLM service is unavailable. Please verify it is running at ${this.endpoint}.`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return parseProofreadResponse(content, text);
  }
}
