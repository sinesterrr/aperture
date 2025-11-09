import React, { createContext, useContext, useState, useEffect } from "react";

export interface BitrateOption {
  value: string;
  label: string;
  bitrate: number;
}

export type PlaybackMode = "transcode" | "direct";

export const BITRATE_OPTIONS: BitrateOption[] = [
  { value: "auto", label: "Auto", bitrate: 0 },
  { value: "20000", label: "20 Mbps (4K)", bitrate: 20000000 },
  { value: "8000", label: "8 Mbps (1080p)", bitrate: 8000000 },
  { value: "4000", label: "4 Mbps (720p)", bitrate: 4000000 },
  { value: "2000", label: "2 Mbps (480p)", bitrate: 2000000 },
  { value: "1000", label: "1 Mbps (360p)", bitrate: 1000000 },
];

export type AIProvider = "gemini" | "ollama" | "groq" | "openrouter";

interface SettingsContextType {
  videoBitrate: string;
  setVideoBitrate: (bitrate: string) => void;
  playbackMode: PlaybackMode;
  setPlaybackMode: (mode: PlaybackMode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [videoBitrate, setVideoBitrateState] = useState<string>("auto");
  const [playbackMode, setPlaybackModeState] =
    useState<PlaybackMode>("direct");

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedBitrate = localStorage.getItem("aperture-video-bitrate");
    if (
      savedBitrate &&
      BITRATE_OPTIONS.some((option) => option.value === savedBitrate)
    ) {
      setVideoBitrateState(savedBitrate);
    }

    const savedPlaybackMode = localStorage.getItem("aperture-playback-mode");
    if (savedPlaybackMode === "direct" || savedPlaybackMode === "transcode") {
      setPlaybackModeState(savedPlaybackMode);
    }
  }, []);

  // Save to localStorage when states change
  const setVideoBitrate = (bitrate: string) => {
    setVideoBitrateState(bitrate);
    localStorage.setItem("aperture-video-bitrate", bitrate);
  };

  const setPlaybackMode = (mode: PlaybackMode) => {
    setPlaybackModeState(mode);
    localStorage.setItem("aperture-playback-mode", mode);
  };

  return (
    <SettingsContext.Provider
      value={{
        videoBitrate,
        setVideoBitrate,
        playbackMode,
        setPlaybackMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
