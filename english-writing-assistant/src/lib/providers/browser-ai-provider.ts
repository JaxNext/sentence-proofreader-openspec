import { ProofreadResult } from "../types";
import { ProofreadProvider } from "./proofread-provider";
import { parseProofreadResponse } from "./prompt-utils";

interface ProofreaderOptions {
  includeCorrectionTypes: boolean;
  expectedInputLanguages: string[];
  monitor?: (m: { addListener: (event: string, callback: (e: { loaded: number, total: number }) => void) => void }) => void;
}
interface ProofreaderSession {
  proofread: (text: string) => Promise<string>;
  destroy: () => void;
}
interface ProofreaderInterface {
  create: (options: ProofreaderOptions) => Promise<ProofreaderSession>;
  availability: (options: ProofreaderOptions) => Promise<'available' | 'unavailable' | 'downloading' | 'downloadable'>;
}

const ERROR_TEMPLATE = "Browser built-in AI is not available. Please use a supported browser.";

const DEFAULT_OPTIONS: ProofreaderOptions = {
  includeCorrectionTypes: true,
  expectedInputLanguages: ["en"]
}
export class BrowserAIProvider implements ProofreadProvider {
  async checkAvailability () {
    if (typeof window === "undefined" || !("Proofreader" in window)) {
      throw new Error(ERROR_TEMPLATE);
    }
    const Proofreader = (window as unknown as { Proofreader: ProofreaderInterface }).Proofreader;
    const availability = await Proofreader.availability(DEFAULT_OPTIONS);
    if (availability === 'unavailable') {
      throw new Error(ERROR_TEMPLATE);
    }
    if (['downloading', 'downloadable'].includes(availability)) {
      await this.checkDownloadProgress();
    }
    return availability;
  }
  async checkDownloadProgress (callback?: (progress: number) => void) {
    const Proofreader = (window as unknown as { Proofreader: ProofreaderInterface }).Proofreader;
    
    const session = await Proofreader.create({
      ...DEFAULT_OPTIONS,
      monitor (m) {
        m.addListener("downloadprogress", (e) => {
          console.log('Browser built-in AI download progress:', e.loaded / e.total);
          callback?.(e.loaded / e.total);
        });
      }
    });
    session.destroy();
  }
  async proofread(text: string): Promise<ProofreadResult> {
    await this.checkAvailability();
    const Proofreader = (window as unknown as { Proofreader: ProofreaderInterface }).Proofreader;

    const session = await Proofreader.create(DEFAULT_OPTIONS);
    const response = await session.proofread(text);
    console.log('BrowserAIProvider proofread response:', response);
    return parseProofreadResponse(JSON.stringify(response), text);
  }
}
