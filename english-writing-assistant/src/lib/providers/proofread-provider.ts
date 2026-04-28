import { ProofreadResult } from "../types";

export type AvailabilityStatus = "available" | "unavailable" | "downloading" | "downloadable";

export interface ProofreadProvider {
  proofread(text: string): Promise<ProofreadResult>;
  checkAvailability(): Promise<AvailabilityStatus>;
  checkDownloadProgress?(callback?: (progress: number) => void): Promise<void>;
}
