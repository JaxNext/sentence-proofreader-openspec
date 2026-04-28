export type CorrectionType = "vocabulary" | "grammar" | "native-suggestion" | "punctuation";

export interface Correction {
  correction: string;
  startIndex: number;
  endIndex: number;
  types: CorrectionType[];
}

export interface ProofreadResult {
  correctedInput: string;
  corrections: Correction[];
}

export type ProviderType = "browser-ai" | "local";

export interface ProviderConfig {
  type: ProviderType;
  localEndpoint?: string;
}
