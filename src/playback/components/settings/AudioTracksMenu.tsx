"use client";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Music2 } from "lucide-react";
import { PlaybackContextValue } from "../../hooks/usePlaybackManager";
import { getAudioTracks } from "../../../actions";

interface AudioTracksMenuProps {
  manager: PlaybackContextValue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AudioTracksMenu: React.FC<AudioTracksMenuProps> = ({
  manager,
  open,
  onOpenChange,
}) => {
  const { playbackState } = manager;
  const { currentItem, currentMediaSource } = playbackState;
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    async function fetchTracks() {
      if (currentItem?.Id && currentMediaSource?.Id) {
        try {
          const audio = await getAudioTracks(
            currentItem.Id,
            currentMediaSource.Id,
          );
          setAudioTracks(audio);
        } catch (error) {
          console.error("Failed to fetch audio tracks", error);
        }
      }
    }
    fetchTracks();
  }, [currentItem?.Id, currentMediaSource?.Id]);

  const handleAudioChange = (indexStr: string) => {
    const index = parseInt(indexStr);
    if (!isNaN(index)) {
      manager.setAudioStreamIndex(index);
    }
  };

  const isActive = open || isHovering;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        className="glass-button rounded-full w-10 h-10 flex items-center justify-center border border-white/10 transition-all duration-300 backdrop-blur-sm pointer-events-auto z-50 relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          background: isActive
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(255, 255, 255, 0.05)",
          borderColor: isActive
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(255, 255, 255, 0.1)",
        }}
        title="Audio"
      >
        <Music2 className="w-5 h-5 transition-colors"
          style={{
            color: isActive ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.7)",
          }}
        />
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
  );
};
