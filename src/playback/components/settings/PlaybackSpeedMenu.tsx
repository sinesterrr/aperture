import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Zap } from "lucide-react";
import { PlaybackContextValue } from "../../hooks/usePlaybackManager";
import { SettingsMenuButton } from "./SettingsMenuButton";

interface PlaybackSpeedMenuProps {
  manager: PlaybackContextValue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlaybackSpeedMenu: React.FC<PlaybackSpeedMenuProps> = ({
  manager,
  open,
  onOpenChange,
}) => {
  const { playbackState } = manager;

  const handleSpeedChange = (val: string) => {
    const rate = parseFloat(val);
    manager.setPlaybackRate(rate);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <SettingsMenuButton icon={Zap} isOpen={open} title="Playback Speed" />
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
  );
};
