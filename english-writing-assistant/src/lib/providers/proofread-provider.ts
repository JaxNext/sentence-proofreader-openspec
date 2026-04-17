import { ProofreadResult } from "../types";

export interface ProofreadProvider {
  proofread(text: string): Promise<ProofreadResult>;
}
