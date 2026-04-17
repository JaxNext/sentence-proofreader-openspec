"use client";

import { ProofreadResult, Correction, CorrectionType } from "@/lib/types";

const typeStyles: Record<CorrectionType, { bg: string; text: string; label: string }> = {
  grammar: { bg: "bg-red-100", text: "text-red-700", label: "Grammar" },
  vocabulary: { bg: "bg-amber-100", text: "text-amber-700", label: "Vocabulary" },
  "native-suggestion": { bg: "bg-blue-100", text: "text-blue-700", label: "Native" },
  punctuation: { bg: "bg-green-100", text: "text-green-700", label: "Punctuation" },
};

function HighlightedText({ text, corrections }: { text: string; corrections: Correction[] }) {
  const sorted = [...corrections].sort((a, b) => a.startIndex - b.startIndex);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const correction of sorted) {
    if (correction.startIndex > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`}>{text.slice(lastIndex, correction.startIndex)}</span>
      );
    }

    const primaryType = correction.types[0] as CorrectionType;
    const style = typeStyles[primaryType] || typeStyles.grammar;
    parts.push(
      <span
        key={`c-${correction.startIndex}`}
        className={`${style.bg} ${style.text} underline decoration-wavy underline-offset-2 relative group cursor-pointer`}
        title={correction.correction}
      >
        {text.slice(correction.startIndex, correction.endIndex)}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          → {correction.correction}
        </span>
      </span>
    );

    lastIndex = correction.endIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <span>{parts}</span>;
}

function TypeBadges({ types }: { types: CorrectionType[] }) {
  return (
    <span className="inline-flex gap-1">
      {types.map((type) => {
        const style = typeStyles[type] || typeStyles.grammar;
        return (
          <span
            key={type}
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
          >
            {style.label}
          </span>
        );
      })}
    </span>
  );
}

interface FeedbackDisplayProps {
  originalText: string;
  result: ProofreadResult | null;
  error: string | null;
}

export default function FeedbackDisplay({ originalText, result, error }: FeedbackDisplayProps) {
  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  if (result.corrections.length === 0) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700">No issues found! Your text looks great.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Your Text
        </h3>
        <p className="text-gray-900 leading-relaxed">
          <HighlightedText text={originalText} corrections={result.corrections} />
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">
          Corrected
        </h3>
        <p className="text-gray-900 leading-relaxed">{result.correctedInput}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Corrections
        </h3>
        {result.corrections.map((correction, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg"
          >
            <TypeBadges types={correction.types} />
            <div className="flex-1 min-w-0">
              <span className="line-through text-gray-400 text-sm">
                {originalText.slice(correction.startIndex, correction.endIndex)}
              </span>
              <span className="mx-2 text-gray-300">→</span>
              <span className="text-gray-900 text-sm font-medium">{correction.correction}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
