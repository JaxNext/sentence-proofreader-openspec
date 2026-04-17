import { ProofreadResult } from "../types";
import { ProofreadProvider } from "./proofread-provider";

export class CloudProvider implements ProofreadProvider {
  async proofread(text: string): Promise<ProofreadResult> {
    const response = await fetch("/api/proofread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || "Cloud AI service error. Please try again.");
    }

    return response.json();
  }
}
