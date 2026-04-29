"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Settings, Loader2, AlertCircle, SendHorizontal } from "lucide-react";
import { ProviderConfig, ProofreadResult } from "@/lib/types";
import { proofreadWithProvider, createProvider } from "@/lib/providers/provider-factory";
import { loadProviderConfig } from "@/components/settings-panel";
import SettingsPanel from "@/components/settings-panel";
import FeedbackDisplay from "@/components/feedback-display";
import VoiceInputBar from "@/components/voice-input-bar";

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
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const checkProviderAvailability = async () => {
      const provider = createProvider(config);
      try {
        const status = await provider.checkAvailability();
        switch (config.type) {
          case 'browser-ai':
            if (status !== 'available') {
              setAvailabilityWarning(`Browser built-in LLM status: ${status}`);
            }
            if (['downloading', 'downloadable'].includes(status)) {
              provider.checkDownloadProgress?.((progress) => {
                setDownloadProgress(Math.round(progress * 100));
              });
            } else {
              setAvailabilityWarning(null)
              setDownloadProgress(null)
            }
            break;
          case 'local':
            switch (status) {
              case 'unavailable':
                setAvailabilityWarning(`Local LLM not running at ${config.localEndpoint}. Check Settings.`);
                break;
              default:
                setAvailabilityWarning(null);
                setDownloadProgress(null);
                break;
            }
            break;
          default:
            setAvailabilityWarning(null);
            setDownloadProgress(null);
            break;
        }
      } catch (err) {
        setAvailabilityWarning(err instanceof Error ? err.message : "An unexpected error occurred.");
        setDownloadProgress(null);
      }
    };

    checkProviderAvailability();
  }, [config]);

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
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {availabilityWarning && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">{availabilityWarning}</p>
              {downloadProgress !== null && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
                    <span>Downloading model...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-700 underline"
              >
                Open Settings
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Type your English sentences here..."
            className="w-full h-48 p-4 pb-12 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base leading-relaxed"
          />
          <div className="absolute bottom-4 right-2 flex items-end gap-2">
            <VoiceInputBar disabled={isLoading} onTextChange={setText} />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !text.trim()}
              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Proofread"
            >
              <SendHorizontal className="w-4 h-4" />
            </button>
          </div>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
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
          warningMsg={availabilityWarning || undefined}
          config={config}
          onConfigChange={setConfig}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
