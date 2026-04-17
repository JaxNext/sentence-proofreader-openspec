"use client";

import { useState, useCallback } from "react";
import { ProofreadResult, Correction, CorrectionType } from "@/lib/types";

const typeStyles: Record<CorrectionType, { bg: string; text: string; label: string }> = {
  grammar: { bg: "bg-red-100", text: "text-red-700", label: "Grammar" },
  vocabulary: { bg: "bg-amber-100", text: "text-amber-700", label: "Vocabulary" },
  "native-suggestion": { bg: "bg-blue-100", text: "text-blue-700", label: "Native" },
  punctuation: { bg: "bg-green-100", text: "text-green-700", label: "Punctuation" },
};

const activeTypeStyles: Record<CorrectionType, { bg: string; text: string }> = {
  grammar: { bg: "bg-red-200", text: "text-red-800" },
  vocabulary: { bg: "bg-amber-200", text: "text-amber-800" },
  "native-suggestion": { bg: "bg-blue-200", text: "text-blue-800" },
  punctuation: { bg: "bg-green-200", text: "text-green-800" },
};

function computeCharDiff(original: string, corrected: string) {
  const m = original.length;
  const n = corrected.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (original[i - 1] === corrected[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const reverseOps: { type: "keep" | "delete" | "insert"; char: string }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && original[i - 1] === corrected[j - 1]) {
      reverseOps.push({ type: "keep", char: original[i - 1] });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      reverseOps.push({ type: "delete", char: original[i - 1] });
      reverseOps.push({ type: "insert", char: corrected[j - 1] });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      reverseOps.push({ type: "delete", char: original[i - 1] });
      i--;
    } else {
      reverseOps.push({ type: "insert", char: corrected[j - 1] });
      j--;
    }
  }

  return reverseOps.reverse();
}

function HighlightedOriginalText({
  text,
  corrections,
  activeIndex,
}: {
  text: string;
  corrections: Correction[];
  activeIndex: number | null;
}) {
  const sorted = [...corrections].sort((a, b) => a.startIndex - b.startIndex);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (let ci = 0; ci < sorted.length; ci++) {
    const correction = sorted[ci];
    const isActive = activeIndex === ci;

    if (correction.startIndex > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`}>{text.slice(lastIndex, correction.startIndex)}</span>
      );
    }

    const primaryType = correction.types[0] as CorrectionType;
    const style = typeStyles[primaryType] || typeStyles.grammar;
    const activeStyle = activeTypeStyles[primaryType] || activeTypeStyles.grammar;
    const originalSlice = text.slice(correction.startIndex, correction.endIndex);

    if (isActive) {
      const diff = computeCharDiff(originalSlice, correction.correction);
      const charParts: React.ReactNode[] = [];

      for (let di = 0; di < diff.length; di++) {
        const op = diff[di];
        if (op.type === "keep") {
          charParts.push(<span key={`k-${di}`}>{op.char}</span>);
        } else if (op.type === "delete") {
          charParts.push(
            <span
              key={`d-${di}`}
              className="bg-red-300/70 text-red-900 rounded-sm px-px line-through"
            >
              {op.char}
            </span>
          );
        }
      }

      parts.push(
        <span
          key={`c-${correction.startIndex}`}
          className={`${activeStyle.bg} ${activeStyle.text} rounded-sm px-0.5 ring-2 ring-offset-1 ring-current/30 transition-all`}
        >
          {charParts}
        </span>
      );
    } else {
      parts.push(
        <span
          key={`c-${correction.startIndex}`}
          className={`${style.bg} ${style.text} underline decoration-wavy underline-offset-2 relative group cursor-pointer`}
          title={correction.correction}
        >
          {originalSlice}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            → {correction.correction}
          </span>
        </span>
      );
    }

    lastIndex = correction.endIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <span>{parts}</span>;
}

function HighlightedCorrectedText({
  originalText,
  correctedInput,
  corrections,
  activeIndex,
}: {
  originalText: string;
  correctedInput: string;
  corrections: Correction[];
  activeIndex: number | null;
}) {
  if (activeIndex === null) {
    return <>{correctedInput}</>;
  }

  const sorted = [...corrections].sort((a, b) => a.startIndex - b.startIndex);
  const activeCorrection = sorted[activeIndex];
  if (!activeCorrection) {
    return <>{correctedInput}</>;
  }

  const correctedStart = sorted.slice(0, activeIndex).reduce(
    (offset, c) => offset + (c.correction.length - (c.endIndex - c.startIndex)),
    activeCorrection.startIndex
  );
  const correctedEnd = correctedStart + activeCorrection.correction.length;

  const before = correctedInput.slice(0, correctedStart);
  const after = correctedInput.slice(correctedEnd);
  const correctedSlice = correctedInput.slice(correctedStart, correctedEnd);

  const originalWord = originalText.slice(activeCorrection.startIndex, activeCorrection.endIndex);
  const diff = computeCharDiff(originalWord, correctedSlice);

  const charParts: React.ReactNode[] = [];
  for (let di = 0; di < diff.length; di++) {
    const op = diff[di];
    if (op.type === "keep") {
      charParts.push(<span key={`k-${di}`}>{op.char}</span>);
    } else if (op.type === "insert") {
      charParts.push(
        <span
          key={`i-${di}`}
          className="bg-emerald-300/70 text-emerald-900 rounded-sm px-0.5 font-semibold"
        >
          {op.char}
        </span>
      );
    }
  }

  const primaryType = activeCorrection.types[0] as CorrectionType;
  const activeStyle = activeTypeStyles[primaryType] || activeTypeStyles.grammar;

  return (
    <>
      {before}
      <span
        className={`${activeStyle.bg} rounded-sm px-0.5 ring-2 ring-offset-1 ring-emerald-400/40 transition-all`}
      >
        {charParts}
      </span>
      {after}
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
      title="Copy corrected text"
    >
      {copied ? (
        <>
          Copied!
        </>
      ) : (
        <>
          Copy
        </>
      )}
    </button>
  );
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleActivate = useCallback((index: number | null) => {
    setActiveIndex(index);
  }, []);

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

  const sortedCorrections = [...result.corrections].sort((a, b) => a.startIndex - b.startIndex);

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Your Text
          </h3>
          <p className="text-gray-900 leading-relaxed whitespace-pre-line">
            <HighlightedOriginalText
              text={originalText}
              corrections={result.corrections}
              activeIndex={activeIndex}
            />
          </p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              Corrected
            </h3>
            <CopyButton text={result.correctedInput} />
          </div>
          <p className="text-gray-900 leading-relaxed whitespace-pre-line">
            <HighlightedCorrectedText
              originalText={originalText}
              correctedInput={result.correctedInput}
              corrections={result.corrections}
              activeIndex={activeIndex}
            />
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Corrections
        </h3>
        {sortedCorrections.map((correction, i) => {
          const isActive = activeIndex === i;
          const primaryType = correction.types[0] as CorrectionType;
          const activeStyle = activeTypeStyles[primaryType] || activeTypeStyles.grammar;

          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? `${activeStyle.bg} border-2 border-current/20 ring-1 ring-current/10`
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
              onMouseEnter={() => handleActivate(i)}
              onMouseLeave={() => handleActivate(null)}
              onClick={() => handleActivate(isActive ? null : i)}
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
          );
        })}
      </div>
    </div>
  );
}
