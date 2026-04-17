"use client";

import { useState, useRef, useCallback } from "react";
import { ProviderConfig, ProofreadResult } from "@/lib/types";
import { proofreadWithProvider } from "@/lib/providers/provider-factory";
import { loadProviderConfig } from "@/components/settings-panel";
import SettingsPanel from "@/components/settings-panel";
import FeedbackDisplay from "@/components/feedback-display";

export default function Home() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ProviderConfig>(() => {
    if (typeof window === "undefined") {
      return { type: "local", localEndpoint: "http://localhost:1234" };
    }
    return loadProviderConfig();
  });
  const [showSettings, setShowSettings] = useState(false);
  const [submittedText, setSubmittedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSubmittedText(text);

    try {
      const proofreadResult = await proofreadWithProvider(text, config);
      setResult(proofreadResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [text, config]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">English Writing Assistant</h1>
            <p className="text-sm text-gray-500 mt-1">
              Write English sentences, press Shift+Enter to proofread
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Type your English sentences here..."
            className="w-full h-48 p-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base leading-relaxed"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
              <div className="flex items-center gap-2 text-blue-600">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm font-medium">Proofreading...</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">Shift</kbd> + <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">Enter</kbd> to submit
        </p>

        <FeedbackDisplay originalText={submittedText} result={result} error={error} />
      </div>

      {showSettings && (
        <SettingsPanel
          config={config}
          onConfigChange={setConfig}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
