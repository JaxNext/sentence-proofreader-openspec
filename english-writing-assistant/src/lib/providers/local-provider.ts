import { ProofreadResult } from "../types";
import { ProofreadProvider } from "./proofread-provider";
import { buildProofreadPrompt, parseProofreadResponse } from "./prompt-utils";

export class LocalProvider implements ProofreadProvider {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
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
