"use client";
import React, { useState } from "react";
import { PlaybackContextValue } from "@/src/playback/hooks/usePlaybackManager";
import { formatVideoTime } from "@/src/lib/utils";

interface VideoOSDTimelineProps {
  manager: PlaybackContextValue;
  currentTime: number;
  duration: number;
  buffered: TimeRanges | null;
  chapters: any[];
  isScrubbing: boolean;
  scrubbingValue: number | null;
  activeChapter: any;
  thumbnail: any; // Using any for thumbnail object structure for now
  renderThumbnail: (time: number) => any;
  onScrubStart: (val: number) => void;
  onScrubMove: (val: number) => void;
  onScrubEnd: (val: number) => void;
}

export const VideoOSDTimeline: React.FC<VideoOSDTimelineProps> = ({
  manager,
  currentTime,
  duration,
  buffered,
  chapters,
  isScrubbing,
  scrubbingValue,
  activeChapter,
  thumbnail,
  renderThumbnail,
  onScrubStart,
  onScrubMove,
  onScrubEnd,
}) => {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);

  const currentSeconds = currentTime;
  const durationSeconds = duration;

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTimelineWidth(rect.width);
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

    if (isScrubbing) {
      onScrubMove(newTime);
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
    const rect = e.currentTarget.getBoundingClientRect();
    setTimelineWidth(rect.width);
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onScrubStart(percentage * duration);
  };

  const activeThumbTime = scrubbingValue !== null ? scrubbingValue : hoverTime;
  const currentThumbnail =
    activeThumbTime !== null ? renderThumbnail(activeThumbTime) : null;

  let thumbStyle: React.CSSProperties = {};
  if (currentThumbnail) {
    thumbStyle = {
      width: currentThumbnail.coords[2],
      height: currentThumbnail.coords[3],
      backgroundImage: `url(${currentThumbnail.src})`,
      backgroundPosition: `-${currentThumbnail.coords[0]}px -${currentThumbnail.coords[1]}px`,
    };

    if (timelineWidth > 0 && durationSeconds > 0 && activeThumbTime !== null) {
      const ratio = activeThumbTime / durationSeconds;
      const centerPx = ratio * timelineWidth;
      const halfWidth = currentThumbnail.coords[2] / 2;
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

  return (
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
        {/* Buffered Ranges */}
        {buffered &&
          durationSeconds > 0 &&
          Array.from({ length: buffered.length }).map((_, index) => {
            const start = buffered.start(index);
            const end = buffered.end(index);
            const startPct = (start / durationSeconds) * 100;
            const endPct = (end / durationSeconds) * 100;
            const width = endPct - startPct;

            return (
              <div
                key={`buffered-${index}`}
                className="absolute top-0 h-full bg-white/30 pointer-events-none"
                style={{
                  left: `${startPct}%`,
                  width: `${width}%`,
                }}
              />
            );
          })}
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

      {currentThumbnail && activeThumbTime !== null && durationSeconds > 0 && (
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
            onScrubStart(percentage * durationSeconds); // Start scrub also seeks on click
            manager.seek(percentage * durationSeconds * 10000000);
            onScrubEnd(percentage * durationSeconds); // Immediate end
          }
        }}
      />
    </div>
  );
};
