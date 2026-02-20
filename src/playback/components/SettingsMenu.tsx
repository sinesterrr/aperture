import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../../components/ui/dropdown-menu";
import { Volume2, Zap, Video, Captions, Type } from "lucide-react";
import { PlaybackContextValue } from "../hooks/usePlaybackManager";
import {
  getAudioTracks,
  getSubtitleTracks,
  canBrowserDirectPlayHevc,
} from "../../actions";
import { getVideoQualityOptions } from "../utils/quality";

interface SettingsMenuProps {
  manager: PlaybackContextValue;
  isVisible?: boolean;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  manager,
  isVisible = true,
}) => {
  const { playbackState } = manager;
  const { currentItem, currentMediaSource } = playbackState;
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [openSpeed, setOpenSpeed] = useState(false);
  const [openQuality, setOpenQuality] = useState(false);
  const [openSubtitles, setOpenSubtitles] = useState(false);
  const [openAudio, setOpenAudio] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showFetchResults, setShowFetchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [subtitleSize, setSubtitleSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aperture-subtitle-size");
      return saved ? parseInt(saved, 10) : 100;
    }
    return 100;
  });

  const handleSubtitleSizeChange = (newSize: number) => {
    setSubtitleSize(newSize);
    localStorage.setItem("aperture-subtitle-size", String(newSize));
    manager.reportState({ subtitleSize: newSize });

    window.dispatchEvent(
      new CustomEvent("subtitle-size-change", { detail: { size: newSize } }),
    );
  };

  useEffect(() => {
    if (!isVisible) {
      setOpenSpeed(false);
      setOpenQuality(false);
      setOpenSubtitles(false);
      setOpenAudio(false);
    }
  }, [isVisible]);
  useEffect(() => {
    if (!isVisible) {
      setOpenSpeed(false);
      setOpenQuality(false);
      setOpenSubtitles(false);
      setOpenAudio(false);
    }
  }, [isVisible]);

  const closeAllMenus = () => {
    setOpenSpeed(false);
    setOpenQuality(false);
    setOpenSubtitles(false);
    setOpenAudio(false);
  };

  useEffect(() => {
    async function fetchTracks() {
      if (currentItem?.Id && currentMediaSource?.Id) {
        const audio = await getAudioTracks(
          currentItem.Id,
          currentMediaSource.Id,
        );
        const subs = await getSubtitleTracks(
          currentItem.Id,
          currentMediaSource.Id,
        );
        setAudioTracks(audio);
        setSubtitleTracks(subs);
      }
    }
    fetchTracks();
  }, [currentItem?.Id, currentMediaSource?.Id]);

  const qualityOptions = React.useMemo(() => {
    const videoStream = currentMediaSource?.MediaStreams?.find(
      (s) => s.Type === "Video",
    );
    if (!videoStream) return [];

    const opts = getVideoQualityOptions({
      videoBitrate: videoStream.BitRate ?? undefined,
      videoCodec: videoStream.Codec ?? undefined,
      enableAuto: true,
      isAutomaticBitrateEnabled: playbackState.preferredQuality === "auto",
    });

    return opts;
  }, [currentMediaSource, playbackState.preferredQuality]);

  const handleAudioChange = (indexStr: string) => {
    const index = parseInt(indexStr);
    if (!isNaN(index)) {
      manager.setAudioStreamIndex(index);
    }
  };

  const handleSubtitleChange = (indexStr: string) => {
    const index = parseInt(indexStr);
    if (isNaN(index)) {
      return;
    }

    if (index === 9999) {
      manager.reportState({ subtitleStreamIndex: 9999 });
      return;
    }

    manager.setSubtitleStreamIndex(index);
  };

  const handleQualityChange = (variant: string) => {
    manager.setPreferredQuality(variant);

    let bitrate: number | undefined;
    if (variant === "auto") {
      bitrate = undefined;
    } else if (variant === "direct") {
      bitrate = 120000000;
    } else {
      bitrate = parseInt(variant);
    }

    if (currentItem) {
      manager.play(currentItem, {
        startPositionTicks: playbackState.currentTime * 10000000,
        mediaSourceId: currentMediaSource?.Id || undefined,
        videoBitrate: bitrate,
      });
    }
  };

  const handleSpeedChange = (val: string) => {
    const rate = parseFloat(val);
    manager.setPlaybackRate(rate);
  };

  const handleAspectRatioChange = (val: string) => {
    manager.reportState({ aspectRatio: val });
  };

  return (
    <>
      <div className="flex gap-4">
        <DropdownMenu
          open={openSpeed}
          onOpenChange={(open) => {
            if (open) closeAllMenus();
            setOpenSpeed(open);
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              className="glass-button rounded-full w-10 h-10 flex items-center justify-center border border-white/10 transition-all duration-300 backdrop-blur-sm"
              style={{
                background: openSpeed
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                borderColor: openSpeed
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.1)",
                color: openSpeed
                  ? "rgb(255, 255, 255)"
                  : "rgba(255, 255, 255, 0.7)",
              }}
              title="Playback Speed"
            >
              <Zap className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 rounded-2xl overflow-hidden text-sm z-100"
            style={{
              background: "rgba(30, 30, 30, 0.65)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <DropdownMenuRadioGroup
              value={String(playbackState.playbackRate)}
              onValueChange={handleSpeedChange}
            >
              <DropdownMenuRadioItem
                value="0.5"
                className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
              >
                <span className="text-white/90 ml-3">0.5x</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="0.75"
                className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
              >
                <span className="text-white/90 ml-3">0.75x</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="1"
                className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
              >
                <span className="text-white/90 ml-3">1x (Normal)</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="1.25"
                className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
              >
                <span className="text-white/90 ml-3">1.25x</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="1.5"
                className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
              >
                <span className="text-white/90 ml-3">1.5x</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="2"
                className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
              >
                <span className="text-white/90 ml-3">2x</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu
          open={openQuality}
          onOpenChange={(open) => {
            if (open) closeAllMenus();
            setOpenQuality(open);
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              className="glass-button rounded-full w-10 h-10 flex items-center justify-center border border-white/10 transition-all duration-300 backdrop-blur-sm"
              style={{
                background: openQuality
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                borderColor: openQuality
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.1)",
                color: openQuality
                  ? "rgb(255, 255, 255)"
                  : "rgba(255, 255, 255, 0.7)",
              }}
              title="Video Quality"
            >
              <Video className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 rounded-2xl overflow-hidden text-sm z-100 max-h-[60vh] overflow-y-auto"
            style={{
              background: "rgba(30, 30, 30, 0.65)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <DropdownMenuRadioGroup
              value={playbackState.preferredQuality}
              onValueChange={handleQualityChange}
            >
              <DropdownMenuRadioItem
                value="auto"
                className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
              >
                <span className="text-white/90 ml-3">Auto</span>
              </DropdownMenuRadioItem>

              {(() => {
                const videoStream = currentMediaSource?.MediaStreams?.find(
                  (s) => s.Type === "Video",
                );
                const isHevc =
                  videoStream?.Codec?.toLowerCase().includes("hevc") ||
                  videoStream?.Codec?.toLowerCase().includes("h265");
                const isSupported = !isHevc || canBrowserDirectPlayHevc();

                return (
                  isSupported && (
                    <DropdownMenuRadioItem
                      value="direct"
                      className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
                    >
                      <span className="text-white/90 ml-3">Direct Play</span>
                    </DropdownMenuRadioItem>
                  )
                );
              })()}

              {qualityOptions.map(
                (option) =>
                  option.name !== "Auto" && (
                    <DropdownMenuRadioItem
                      key={option.name}
                      value={String(option.bitrate)}
                      className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
                    >
                      <span className="text-white/90 ml-3">{option.name}</span>
                    </DropdownMenuRadioItem>
                  ),
              )}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu
          open={openSubtitles}
          onOpenChange={(open) => {
            if (open) closeAllMenus();
            setOpenSubtitles(open);
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              className="glass-button rounded-full w-10 h-10 flex items-center justify-center border border-white/10 transition-all duration-300 backdrop-blur-sm"
              style={{
                background: openSubtitles
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                borderColor: openSubtitles
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.1)",
                color: openSubtitles
                  ? "rgb(255, 255, 255)"
                  : "rgba(255, 255, 255, 0.7)",
              }}
              title="Subtitles"
            >
              <Captions className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={8}
            side="top"
            className="w-48 rounded-2xl overflow-hidden text-sm z-100 max-h-[60vh] overflow-y-auto"
            style={{
              background: "rgba(30, 30, 30, 0.65)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            {showFetchResults ? (
              <>
                <DropdownMenuRadioItem
                  value="back"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowFetchResults(false);
                  }}
                  className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white cursor-pointer"
                >
                  <span className="text-white/90 ml-3">← Back</span>
                </DropdownMenuRadioItem>

                <div className="px-5 py-2 border-b border-white/10">
                  <div className="text-xs text-white/50">Searching for:</div>
                  <div className="text-sm text-white/80 font-medium truncate">
                    {searchQuery}
                  </div>
                </div>

                {searchResults.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <span className="text-white/60 text-sm">
                      No subtitles found
                    </span>
                  </div>
                ) : (
                  searchResults.map((result, idx) => (
                    <DropdownMenuRadioItem
                      key={idx}
                      value={`fetch-${idx}`}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      disabled={isDownloading}
                      className="px-5 py-3 transition-colors hover:bg-white/10 text-white cursor-pointer disabled:opacity-50 flex flex-col items-start"
                    >
                      <div className="flex flex-col w-full">
                        <span className="text-white/90 ml-0 text-sm">
                          {result.name}
                        </span>
                        <span className="text-white/40 ml-0 text-xs mt-1">
                          {result.language} • {result.format}
                        </span>
                      </div>
                    </DropdownMenuRadioItem>
                  ))
                )}
              </>
            ) : (
              <DropdownMenuRadioGroup
                value={String(playbackState.subtitleStreamIndex ?? -1)}
                onValueChange={handleSubtitleChange}
              >
                <DropdownMenuRadioItem
                  value="-1"
                  className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
                >
                  <span className="text-white/90 ml-3">Off</span>
                </DropdownMenuRadioItem>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    padding: "12px 20px 8px 20px",
                  }}
                >
                  <Type
                    size={18}
                    style={{ color: "rgba(255, 255, 255, 0.7)", flexShrink: 0 }}
                  />

                  <input
                    type="range"
                    min="10"
                    max="400"
                    value={subtitleSize}
                    onChange={(e) =>
                      handleSubtitleSizeChange(parseInt(e.target.value, 10))
                    }
                    style={
                      {
                        flex: 1,
                        height: "6px",
                        borderRadius: "3px",
                        background: `linear-gradient(to right, white 0%, white ${((subtitleSize - 10) / 390) * 100}%, rgba(255, 255, 255, 0.2) ${((subtitleSize - 10) / 390) * 100}%, rgba(255, 255, 255, 0.2) 100%)`,
                        outline: "none",
                        WebkitAppearance: "none",
                        appearance: "none",
                        cursor: "pointer",
                      } as React.CSSProperties & {
                        WebkitAppearance?: string;
                      }
                    }
                  />
                </div>

                <DropdownMenuSeparator className="bg-white/10" />

                {subtitleTracks.map((track, i) => (
                  <DropdownMenuRadioItem
                    key={i}
                    value={String(track.index)}
                    className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
                  >
                    <span className="text-white/90 ml-3">{track.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Audio Button */}
        <DropdownMenu
          open={openAudio}
          onOpenChange={(open) => {
            if (open) closeAllMenus();
            setOpenAudio(open);
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              className="glass-button rounded-full w-10 h-10 flex items-center justify-center border border-white/10 transition-all duration-300 backdrop-blur-sm"
              style={{
                background: openAudio
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                borderColor: openAudio
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.1)",
                color: openAudio
                  ? "rgb(255, 255, 255)"
                  : "rgba(255, 255, 255, 0.7)",
              }}
              title="Audio"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 rounded-2xl overflow-hidden text-sm z-100 max-h-[60vh] overflow-y-auto"
            style={{
              background: "rgba(30, 30, 30, 0.65)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <DropdownMenuRadioGroup
              value={String(playbackState.audioStreamIndex || "")}
              onValueChange={handleAudioChange}
            >
              {audioTracks.map((track) => (
                <DropdownMenuRadioItem
                  key={track.id ?? track.label}
                  value={String(track.id)}
                  className="px-5 py-2.5 transition-colors hover:bg-white/10 text-white"
                >
                  <span className="text-white/90 ml-3">{track.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
