import { ProofreadResult } from "../types";

export function buildProofreadPrompt(): string {
  return `You are an English writing assistant for non-native speakers. Proofread the following text and return a JSON object with this exact structure:

{
  "correctedInput": "the fully corrected version of the text",
  "corrections": [
    {
      "correction": "the corrected text",
      "startIndex": 0,
      "endIndex": 5,
      "types": ["grammar"]
    }
  ]
}

Rules:
- startIndex and endIndex are character-level positions in the ORIGINAL text (0-based, endIndex is exclusive)
- types can include: "vocabulary", "grammar", "native-suggestion"
- "vocabulary": incorrect or inappropriate word choice
- "grammar": grammatical errors (subject-verb agreement, tense, articles, etc.)
- "native-suggestion": grammatically correct but unnatural phrasing — suggest a more native expression
- A correction can have multiple types
- If no issues are found, return correctedInput equal to the original text and an empty corrections array
- Return ONLY the JSON object, no other text
`;
}

export function parseProofreadResponse(raw: string, originalText: string): ProofreadResult {
  let cleaned = raw.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { correctedInput: originalText, corrections: [] };
  }

  cleaned = jsonMatch[0];

  try {
    const parsed = JSON.parse(cleaned);

    if (
      typeof parsed.correctedInput !== "string" ||
      !Array.isArray(parsed.corrections)
    ) {
      return { correctedInput: originalText, corrections: [] };
    }

    const corrections = parsed.corrections.filter(
      (c: unknown) =>
        typeof c === "object" &&
        c !== null &&
        typeof (c as Record<string, unknown>).correction === "string" &&
        typeof (c as Record<string, unknown>).startIndex === "number" &&
        typeof (c as Record<string, unknown>).endIndex === "number" &&
        Array.isArray((c as Record<string, unknown>).types) ||
        typeof (c as Record<string, unknown>).type === "string"
    ).map((c: { types: string[], type?: string }) => ({
      ...c,
      types: Array.isArray(c.types) ? c.types : [c.type],
    }));

    return {
      correctedInput: parsed.correctedInput,
      corrections,
    };
  } catch {
    return { correctedInput: originalText, corrections: [] };
  }
}
