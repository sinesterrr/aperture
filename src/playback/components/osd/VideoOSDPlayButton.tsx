import React from "react";
import { Play } from "lucide-react";

interface VideoOSDPlayButtonProps {
  paused: boolean;
}

export const VideoOSDPlayButton: React.FC<VideoOSDPlayButtonProps> = ({
  paused,
}) => {
  if (!paused) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="animate-in fade-in duration-300">
        <div className="bg-white text-black rounded-full w-20 h-20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          <Play className="w-8 h-8 text-black fill-black ml-1" />
        </div>
      </div>
    </div>
  );
};
