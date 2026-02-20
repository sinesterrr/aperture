import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
} from "lucide-react";
import { PlaybackContextValue } from "@/src/playback/hooks/usePlaybackManager";
import { formatVideoTime } from "@/src/lib/utils";

interface VideoOSDTransportProps {
  manager: PlaybackContextValue;
  currentTime: number;
  duration: number;
  paused: boolean;
  muted: boolean;
  volume: number;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const VideoOSDTransport: React.FC<VideoOSDTransportProps> = ({
  manager,
  currentTime,
  duration,
  paused,
  muted,
  volume,
  isFullscreen,
  toggleFullscreen,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        <button
          onClick={() => manager.seek(Math.max(0, currentTime - 10) * 10000000)}
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
            manager.seek(Math.min(duration, currentTime + 10) * 10000000)
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
                onChange={(e) => manager.setVolume(parseFloat(e.target.value))}
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
                currentTime * 10000000,
                duration * 10000000,
              ).split(" / ")[0]
            }
          </span>{" "}
          /{" "}
          {
            formatVideoTime(duration * 10000000, duration * 10000000).split(
              " / ",
            )[0]
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
  );
};
