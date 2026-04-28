"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle, X } from "lucide-react";
import { ProviderConfig, ProviderType } from "@/lib/types";
import { STORAGE_KEY, getModels } from "@/lib/providers/provider-factory";

const defaultConfig: ProviderConfig = {
  type: "browser-ai",
  localEndpoint: "http://localhost:1234",
};

export function loadProviderConfig(): ProviderConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch {}
  return defaultConfig;
}

export function saveProviderConfig(config: ProviderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

function isBrowserAIAvailable(): boolean {
  return typeof window !== "undefined" && "Proofreader" in window;
}

interface SettingsPanelProps {
  config: ProviderConfig;
  warningMsg?: string;
  onConfigChange: (config: ProviderConfig) => void;
  onClose: () => void;
}

export default function SettingsPanel({ warningMsg, config, onConfigChange, onClose }: SettingsPanelProps) {
  const [browserAISupported] = useState(() => isBrowserAIAvailable());

  const [modelOptions, setModelOptions] = useState<ProviderConfig["localEndpoint"][]>([]);
  const fetchingRef = useRef(false);

  const handleTypeChange = (type: ProviderType) => {
    const updated = { ...config, type };
    onConfigChange(updated);
    saveProviderConfig(updated);
  };

  const fetchModelOptions = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const models = await getModels();
      setModelOptions(models);
    } finally {
      fetchingRef.current = false;
    }
  };

  const handleFieldChange = (field: keyof ProviderConfig, value: string) => {
    const updated = { ...config, [field]: value };
    onConfigChange(updated);
    saveProviderConfig(updated);
  };

  const handleLocalEndpointChange = async (endpoint: string) => {
    handleFieldChange("localEndpoint", endpoint);
  };

  useEffect(() => {
    if (config.type === "local" && !warningMsg) {
      fetchModelOptions();
    }
  }, [config.type, config.localEndpoint, warningMsg]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {warningMsg && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">{warningMsg}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="browser-ai"
                  checked={config.type === "browser-ai"}
                  onChange={() => handleTypeChange("browser-ai")}
                  disabled={!browserAISupported}
                  className="text-blue-600"
                />
                <span className={browserAISupported ? "text-gray-900" : "text-gray-400"}>
                  Browser Built-in AI
                </span>
                {!browserAISupported && (
                  <span className="text-xs text-gray-400">(Not available in this browser)</span>
                )}
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="local"
                  checked={config.type === "local"}
                  onChange={() => handleTypeChange("local")}
                  className="text-blue-600"
                />
                <span className="text-gray-900">Local LLM</span>
              </label>
            </div>
          </div>

          {config.type === "local" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local LLM Endpoint
              </label>
              <input
                type="url"
                value={config.localEndpoint || ""}
                onChange={(e) => handleLocalEndpointChange(e.target.value)}
                placeholder="http://localhost:1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Default: http://localhost:1234 (LM Studio)
              </p>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <select
                  value={config.model || ""}
                  onChange={(e) => handleFieldChange("model", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {modelOptions.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
