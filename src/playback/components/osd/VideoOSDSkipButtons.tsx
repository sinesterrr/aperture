"use client";
import React from "react";
import { PlaybackContextValue } from "@/src/playback/hooks/usePlaybackManager";

interface VideoOSDSkipButtonsProps {
  manager: PlaybackContextValue;
  chapters: any[];
  introSegment: any;
  creditsSegment: any;
  durationSeconds: number;
  isInIntro: boolean;
  isInCredits: boolean;
  hasNextEpisode: boolean;
  nextEpisodeData: any;
  handleMouseMove: () => void;
}

export const VideoOSDSkipButtons: React.FC<VideoOSDSkipButtonsProps> = ({
  manager,
  chapters,
  introSegment,
  creditsSegment,
  durationSeconds,
  isInIntro,
  isInCredits,
  hasNextEpisode,
  nextEpisodeData,
  handleMouseMove,
}) => {
  return (
    <>
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
                introSegment.EndPositionTicks || (introSegment as any).EndTicks;
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
    </>
  );
};
