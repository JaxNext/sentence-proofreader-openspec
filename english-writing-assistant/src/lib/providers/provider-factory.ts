import { ProviderConfig, ProofreadResult } from "../types";
import { ProofreadProvider } from "./proofread-provider";
import { BrowserAIProvider } from "./browser-ai-provider";
import { LocalProvider } from "./local-provider";

export function createProvider(config: ProviderConfig): ProofreadProvider {
  switch (config.type) {
    case "browser-ai":
      return new BrowserAIProvider();
    case "local":
      return new LocalProvider(config.localEndpoint || "http://localhost:1234");
    default:
      throw new Error(`Unknown provider type: ${config.type}`);
  }
}

export async function proofreadWithProvider(
  text: string,
  config: ProviderConfig
): Promise<ProofreadResult> {
  const provider = createProvider(config);
  return provider.proofread(text);
}
