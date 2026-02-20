import React, { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Video } from "lucide-react";
import { PlaybackContextValue } from "../../hooks/usePlaybackManager";
import { canBrowserDirectPlayHevc } from "../../../actions";
import { getVideoQualityOptions } from "../../utils/quality";
import { SettingsMenuButton } from "./SettingsMenuButton";

interface VideoQualityMenuProps {
  manager: PlaybackContextValue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VideoQualityMenu: React.FC<VideoQualityMenuProps> = ({
  manager,
  open,
  onOpenChange,
}) => {
  const { playbackState } = manager;
  const { currentMediaSource, currentItem } = playbackState;

  const qualityOptions = useMemo(() => {
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

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <SettingsMenuButton icon={Video} isOpen={open} title="Video Quality" />
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
  );
};
