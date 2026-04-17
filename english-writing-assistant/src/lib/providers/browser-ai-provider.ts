import { ProofreadResult } from "../types";
import { ProofreadProvider } from "./proofread-provider";
import { parseProofreadResponse } from "./prompt-utils";

interface ProofreaderOptions {
  includeCorrectionTypes: boolean;
  expectedInputLanguages: string[];
  monitor?: (m: { addListener: (event: string, callback: (e: { loaded: number }) => void) => void }) => void;
}
interface ProofreaderSession {
  proofread: (text: string) => Promise<string>;
  destroy: () => void;
}
interface ProofreaderInterface {
  create: (options: ProofreaderOptions) => Promise<ProofreaderSession>;
  availability: (options: ProofreaderOptions) => Promise<'available' | 'unavailable' | 'downloading' | 'downloadable'>;
}
const ERROR_TEMPLATE = "Browser built-in AI is not available. Please use a supported browser (e.g., Chrome 127+).";
export class BrowserAIProvider implements ProofreadProvider {
  async proofread(text: string): Promise<ProofreadResult> {
    if (typeof window === "undefined" || !("Proofreader" in window)) {
      throw new Error(
        ERROR_TEMPLATE
      );
    }
    const options: ProofreaderOptions = {
      includeCorrectionTypes: true,
      expectedInputLanguages: ["en"]
    };
    const Proofreader = (window as unknown as { Proofreader: ProofreaderInterface }).Proofreader;
    const availability = await Proofreader.availability(options);
    if (availability === 'unavailable') {
      throw new Error(
        ERROR_TEMPLATE
      );
    }
    if (availability === 'downloading' || availability === 'downloadable') {
      const session = await Proofreader.create({
        ...options,
        monitor (m) {
          m.addListener("downloadprogress", (e) => {
            console.log(e.loaded);
          });
        }
      });
      session.destroy();
    }
    const session = await Proofreader.create(options);
    const response = await session.proofread(text);
    console.log('BrowserAIProvider proofread response:', response);
    return parseProofreadResponse(JSON.stringify(response), text);
  }
}
