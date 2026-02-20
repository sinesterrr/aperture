import React, { useState, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { isFullscreenAtom } from "../../lib/atoms";
import { PlaybackContextValue } from "../hooks/usePlaybackManager";
import { fetchSeasons } from "../../actions";
import { useTrickplay } from "../../hooks/useTrickplay";
import { useSkipSegments } from "../../hooks/useSkipSegments";
import { VideoSplashLoader } from "./VideoSplashLoader";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  RotateCcw,
  RotateCw,
  PictureInPicture,
} from "lucide-react";
import { formatVideoTime } from "../../lib/utils";
import { SettingsMenu } from "./SettingsMenu";
import { getNextEpisode } from "@/src/actions/media";
import _ from "lodash";

interface VideoOSDProps {
  manager: PlaybackContextValue;
  className?: string;
}

const dateObject = Date.now();

export const VideoOSD: React.FC<VideoOSDProps> = ({ manager }) => {
  const { playbackState } = manager;
  const {
    paused,
    currentTime,
    duration,
    currentItem,
    currentMediaSource,
    volume,
    muted,
    isMiniPlayer,
    isLoading,
    isBuffering,
  } = playbackState;
  const { initializeTrickplay, renderThumbnail } = useTrickplay();
  const { checkSegment } = useSkipSegments(currentItem?.Id);
  const activeSegment = checkSegment(currentTime);
  const currentSeconds = currentTime;
  const durationSeconds = duration;

  const {
    chapters,
    introSegment,
    creditsSegment,
    activeChapter,
    isInIntro,
    isInCredits,
  } = useMemo(() => {
    const chapters = (currentItem as any)?.Chapters || [];
    const introSegment = chapters.find(
      (ch: any) => ch.Name?.toLowerCase() === "intro",
    );
    const creditsSegment = chapters.find(
      (ch: any) => ch.Name?.toLowerCase() === "credits",
    );

    const activeChapter =
      currentTime !== null
        ? chapters.find((ch: any, i: number) => {
            const start = ch.StartPositionTicks / 10000000;
            const nextCh = chapters[i + 1];
            const end = nextCh
              ? nextCh.StartPositionTicks / 10000000
              : durationSeconds;
            return currentTime >= start && currentTime < end;
          })
        : null;

    const isInIntro = activeChapter?.Name?.toLowerCase() === "intro";
    const isInCredits = activeChapter?.Name?.toLowerCase() === "credits";
    return {
      chapters,
      introSegment,
      creditsSegment,
      activeChapter,
      isInIntro,
      isInCredits,
    };
  }, [currentItem, currentTime, durationSeconds]);

  useEffect(() => {
    if (currentItem) {
      initializeTrickplay(currentItem as any, currentMediaSource || null);
    }
  }, [currentItem, currentMediaSource, initializeTrickplay]);

  const [isHovering, setIsHovering] = useState(false);
  const [lastActivity, setLastActivity] = useState(dateObject);
  const [nextEpisodeData, setNextEpisodeData] = useState<any>(null);

  const hasNextEpisode = !_.isEmpty(nextEpisodeData);

  useEffect(() => {
    const checkNextEpisode = async () => {
      try {
        if (currentItem?.Type !== "Episode") {
          setNextEpisodeData(null);
          return;
        }

        const seriesId = (currentItem as any)?.SeriesId;
        const parentIndexNumber = currentItem?.ParentIndexNumber;
        const episodeNumber = currentItem?.IndexNumber;

        if (!seriesId || !parentIndexNumber) {
          setNextEpisodeData(null);
          return;
        }

        const seasons = await fetchSeasons(seriesId);

        const seasonData = seasons.find(
          (s: any) => s.IndexNumber === parentIndexNumber,
        );
        if (!seasonData || !seasonData.Id) {
          setNextEpisodeData(null);
          return;
        }

        const seasonId = seasonData.Id;

        const nextEpisode = await getNextEpisode(seasonId, episodeNumber);

        if (nextEpisode) {
          setNextEpisodeData(nextEpisode);
        } else {
          setNextEpisodeData(null);
        }
      } catch (err) {
        setNextEpisodeData(null);
      }
    };

    checkNextEpisode();
  }, [currentItem]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused && Date.now() - lastActivity > 3000) {
        setIsHovering(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, lastActivity]);

  const handleMouseMove = () => {
    setLastActivity(Date.now());
    setIsHovering(true);
  };

  const [scrubbingValue, setScrubbingValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);

  const handleSeek = (value: number[]) => {
    setScrubbingValue(null);
    manager.seek(value[0] * 10000000); // convert seconds to ticks
  };

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTimelineWidth(rect.width);
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

    if (isScrubbing) {
      setScrubbingValue(newTime);
    } else {
      setHoverTime(newTime);
    }
  };

  const handleTimelineLeave = () => {
    if (!isScrubbing) {
      setHoverTime(null);
      setIsHoveringProgress(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsScrubbing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setTimelineWidth(rect.width);
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    setScrubbingValue(percentage * duration);
  };

  const handleMouseUp = () => {
    if (isScrubbing && scrubbingValue !== null) {
      manager.seek(scrubbingValue * 10000000);
      setScrubbingValue(null);
    }
    setIsScrubbing(false);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!isScrubbing) return;

    const progressBar = document.querySelector("[data-progress-bar]");
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    setScrubbingValue(newTime);
  };

  useEffect(() => {
    if (!isScrubbing) return;

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isScrubbing, duration]);

  const displayTime = scrubbingValue !== null ? scrubbingValue : currentSeconds;
  const activeThumbTime = scrubbingValue !== null ? scrubbingValue : hoverTime;
  const thumbnail =
    activeThumbTime !== null ? renderThumbnail(activeThumbTime) : null;
  let thumbStyle: React.CSSProperties = {};
  if (thumbnail) {
    thumbStyle = {
      width: thumbnail.coords[2],
      height: thumbnail.coords[3],
      backgroundImage: `url(${thumbnail.src})`,
      backgroundPosition: `-${thumbnail.coords[0]}px -${thumbnail.coords[1]}px`,
    };

    if (timelineWidth > 0 && durationSeconds > 0 && activeThumbTime !== null) {
      const ratio = activeThumbTime / durationSeconds;
      const centerPx = ratio * timelineWidth;
      const halfWidth = thumbnail.coords[2] / 2;
      const clampedCenter = Math.max(
        halfWidth,
        Math.min(timelineWidth - halfWidth, centerPx),
      );
      thumbStyle.left = `${clampedCenter}px`;
      thumbStyle.transform = "translateX(-50%)";
    } else if (durationSeconds > 0 && activeThumbTime !== null) {
      thumbStyle.left = `${(activeThumbTime / durationSeconds) * 100}%`;
      thumbStyle.transform = "translateX(-50%)";
    }
  }

  const isVisible = isHovering || paused;

  const handleOverlayClick = () => {
    handleMouseMove();
    if (paused) {
      manager.unpause();
    } else {
      manager.pause();
    }
  };

  const [isFullscreen] = useAtom(isFullscreenAtom);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((e) => console.error("Fullscreen error:", e));
    } else {
      document
        .exitFullscreen()
        .catch((e) => console.error("Exit fullscreen error:", e));
    }
  };

  // Stop propagation for controls so they don't trigger the overlay click
  const handleControlsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMouseMove();
  };

  if (isMiniPlayer) {
    return (
      <div
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all duration-300 cursor-pointer group"
        onClick={manager.toggleMiniPlayer}
      >
        <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
          <Maximize className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  }

  return (
    <>
      <VideoSplashLoader
        item={currentItem}
        isVisible={isLoading || isBuffering || false}
        onClose={() => manager.stop()}
      />
      <div
        className="absolute inset-0 z-40 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isVisible ? 1 : 0,
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-50 flex flex-col justify-between transition-opacity duration-300 p-6 md:p-10"
        onMouseMove={handleMouseMove}
        onClick={handleOverlayClick}
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      >
        <header
          className={`flex items-center justify-between transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
          onClick={handleControlsClick}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => manager.stop()}
              className="glass-button rounded-full w-12 h-12 flex items-center justify-center group hover:bg-opacity-50 border border-white/10 transition-all duration-300 backdrop-blur-sm"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
              }}
            >
              <ArrowLeft className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
            </button>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                {currentItem?.SeriesName || currentItem?.Name}
              </h1>
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                {currentItem?.ParentIndexNumber !== undefined &&
                  currentItem?.IndexNumber !== undefined && (
                    <span
                      className="bg-white/10 px-2.5 py-1 rounded text-xs uppercase tracking-wider border border-white/5 font-mono font-bold text-white"
                      style={{ background: "rgba(255, 255, 255, 0.1)" }}
                    >
                      S{String(currentItem.ParentIndexNumber).padStart(2, "0")}E
                      {String(currentItem.IndexNumber).padStart(2, "0")}
                    </span>
                  )}
                {currentItem?.SeriesName && (
                  <span className="text-white">{currentItem?.Name}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SettingsMenu manager={manager} isVisible={isVisible} />
          </div>
        </header>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {paused && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-white text-black rounded-full w-20 h-20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Play className="w-8 h-8 text-black fill-black ml-1" />
              </div>
            </div>
          )}
        </div>

        {isInIntro && introSegment && (
          <div
            className="absolute right-10 z-50 pointer-events-auto"
            style={{ bottom: "20%" }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMouseMove();
                const introIndex = chapters.findIndex(
                  (ch: any) => ch === introSegment,
                );
                let endTicks =
                  introSegment.EndPositionTicks ||
                  (introSegment as any).EndTicks;
                if (
                  !endTicks &&
                  introIndex >= 0 &&
                  introIndex < chapters.length - 1
                ) {
                  endTicks = chapters[introIndex + 1].StartPositionTicks;
                } else if (!endTicks) {
                  endTicks = durationSeconds * 10000000;
                }
                manager.seek(endTicks);
              }}
              className="text-black text-sm font-semibold px-4.5 py-2.5 bg-white hover:bg-white/90 rounded-lg transition-all duration-200"
            >
              Skip Intro
            </button>
          </div>
        )}

        {isInCredits && creditsSegment && (
          <div
            className="absolute right-10 z-50 pointer-events-auto"
            style={{ bottom: "20%" }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMouseMove();
                if (hasNextEpisode && nextEpisodeData) {
                  manager.play(nextEpisodeData, { startPositionTicks: 0 });
                } else {
                  const creditsIndex = chapters.findIndex(
                    (ch: any) => ch === creditsSegment,
                  );
                  let endTicks =
                    creditsSegment.EndPositionTicks ||
                    (creditsSegment as any).EndTicks;
                  if (
                    !endTicks &&
                    creditsIndex >= 0 &&
                    creditsIndex < chapters.length - 1
                  ) {
                    endTicks = chapters[creditsIndex + 1].StartPositionTicks;
                  } else if (!endTicks) {
                    endTicks = durationSeconds * 10000000;
                  }
                  manager.seek(endTicks);
                  setTimeout(() => {
                    manager.pause();
                  }, 500);
                }
              }}
              className="text-black text-sm font-semibold px-4.5 py-2.5 bg-white hover:bg-white/90 rounded-lg transition-all duration-200"
            >
              {hasNextEpisode ? "Next Episode" : "Skip Credits"}
            </button>
          </div>
        )}

        <div
          className={`w-full max-w-5xl mx-auto transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"}`}
          onClick={handleControlsClick}
        >
          <div
            className="rounded-2xl p-4 md:px-6 md:py-4 flex flex-col gap-4 shadow-2xl transition-all duration-300 backdrop-blur-md border border-white/10"
            style={{
              background: "rgba(20, 20, 20, 0.4)",
            }}
          >
            <div
              className="group/progress relative w-full h-4 flex items-center cursor-pointer"
              data-progress-bar
              onMouseEnter={() => setIsHoveringProgress(true)}
              onMouseLeave={() => {
                setIsHoveringProgress(false);
                handleTimelineLeave();
              }}
            >
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm relative group-hover/progress:h-2 transition-all duration-200">
                <div className="h-full bg-white/20 w-[45%]"></div>
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                  style={{
                    width: `${durationSeconds > 0 ? ((isScrubbing && scrubbingValue !== null ? scrubbingValue : currentSeconds) / durationSeconds) * 100 : 0}%`,
                    transition: isScrubbing ? "none" : "width 0.05s linear",
                  }}
                ></div>
              </div>

              {durationSeconds > 0 && (
                <div
                  className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none"
                  style={{
                    left: `${((isScrubbing && scrubbingValue !== null ? scrubbingValue : currentSeconds) / durationSeconds) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    scale: isScrubbing || isHoveringProgress ? 1 : 0,
                    transition: isScrubbing
                      ? "none"
                      : "scale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.05s linear",
                  }}
                ></div>
              )}

              {thumbnail && activeThumbTime !== null && durationSeconds > 0 && (
                <div
                  className="absolute bottom-10 border-2 border-white rounded-md overflow-hidden shadow-lg bg-black z-30 pointer-events-none transition-opacity duration-200"
                  style={thumbStyle}
                >
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-full px-2">
                    {activeChapter && (
                      <span className="text-[10px] text-white/90 font-medium truncate max-w-full drop-shadow-md text-center">
                        {activeChapter.Name}
                      </span>
                    )}
                    <div className="bg-black/70 px-1 rounded text-[10px] text-white font-mono">
                      {
                        formatVideoTime(
                          activeThumbTime * 10000000,
                          durationSeconds * 10000000,
                        ).split(" / ")[0]
                      }
                    </div>
                  </div>
                </div>
              )}

              {chapters.map((chapter: any, index: number) => {
                const startSeconds = chapter.StartPositionTicks / 10000000;
                if (startSeconds <= 0) return null;
                const leftPct = (startSeconds / durationSeconds) * 100;

                return (
                  <div
                    key={index}
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-white/40 group-hover/progress:h-4 transition-all duration-200 pointer-events-none"
                    style={{ left: `${leftPct}%` }}
                  />
                );
              })}

              <div
                className="absolute inset-0 cursor-pointer"
                onMouseMove={(e) => {
                  if (!isScrubbing) {
                    handleTimelineHover(e);
                  }
                }}
                onMouseDown={handleMouseDown}
                onClick={(e) => {
                  if (!isScrubbing) {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, x / rect.width));
                    manager.seek(percentage * durationSeconds * 10000000);
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-6 flex-1">
                <button
                  onClick={() =>
                    manager.seek(Math.max(0, currentTime - 10) * 10000000)
                  }
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                <button
                  onClick={paused ? manager.unpause : manager.pause}
                  className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  {paused ? (
                    <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                  ) : (
                    <Pause className="w-6 h-6 text-black fill-black" />
                  )}
                </button>

                <button
                  onClick={() =>
                    manager.seek(
                      Math.min(duration, currentTime + 10) * 10000000,
                    )
                  }
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <RotateCw className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2 ml-2 group/volume">
                  <button
                    onClick={manager.toggleMute}
                    className="text-white/70 hover:text-white transition-colors shrink-0"
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>

                  {/* Volume Slider - expands on hover of button or slider */}
                  <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-out flex items-center">
                    <div className="h-1 bg-white/30 rounded-full w-24 relative shrink-0">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-all duration-100"
                        style={{
                          width: `${muted ? 0 : volume}%`,
                        }}
                      ></div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={muted ? 0 : volume}
                        onChange={(e) =>
                          manager.setVolume(parseFloat(e.target.value))
                        }
                        className="absolute inset-0 opacity-0 w-full cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-white/60 tracking-wide font-mono">
                  <span className="text-white">
                    {
                      formatVideoTime(
                        currentSeconds * 10000000,
                        durationSeconds * 10000000,
                      ).split(" / ")[0]
                    }
                  </span>{" "}
                  /{" "}
                  {
                    formatVideoTime(
                      durationSeconds * 10000000,
                      durationSeconds * 10000000,
                    ).split(" / ")[0]
                  }
                </div>

                <div className="w-px h-6 bg-white/10 hidden md:block"></div>

                <button
                  onClick={manager.toggleMiniPlayer}
                  className="text-white/70 hover:text-white transition-colors hidden md:block"
                  title="Picture in Picture"
                >
                  <PictureInPicture className="w-5 h-5" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="text-white/70 hover:text-white transition-colors"
                  title="Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
