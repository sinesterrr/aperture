import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerFullscreen,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
  MediaPlayerSettings,
  MediaPlayerTooltip,
} from "../ui/media-player";
import {
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Users,
  FastForward,
} from "lucide-react";
import { useMediaPlayer } from "../../contexts/MediaPlayerContext";
import { formatRuntime } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useAuth } from "../../hooks/useAuth";
import { decode } from "blurhash";
import DisplayEndTime from "../display-end-time";
import { useTrickplay } from "../../hooks/useTrickplay";
import { PlayerLoadingOverlay } from "./player-loading-overlay";

interface GlobalMediaPlayerProps {}

export function GlobalMediaPlayer({}: GlobalMediaPlayerProps) {
  const { isPlayerVisible, setIsPlayerVisible, player } = useMediaPlayer();
  const [isClosing, setIsClosing] = useState(false);

  // Reset closing state when player becomes visible again
  useEffect(() => {
    if (isPlayerVisible) {
      setIsClosing(false);
    }
  }, [isPlayerVisible]);

  const {
    currentItem,
    currentTime,
    duration,
    playbackManager,
    paused,
    isMuted,
    volume,
  } = player;

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Local state for UI that isn't fully in playbackManager yet or needs UI-specific handling
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  // Backdrop image state
  const [backdropImageLoaded, setBackdropImageLoaded] = useState(false);
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null);

  const {
    initializeTrickplay,
    resetTrickplay,
    renderThumbnail: renderTrickplayThumbnail,
  } = useTrickplay();

  const { serverUrl } = useAuth();

  // Helper function to format time to HH:MM AM/PM
  const formatEndTime = (currentSeconds: number, durationSeconds: number) => {
    const remainingSeconds = durationSeconds - currentSeconds;
    const endTime = new Date(Date.now() + remainingSeconds * 1000);
    return endTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Provide video element to playbackManager
  useEffect(() => {
    if (videoRef.current && playbackManager) {
      // Find the HTML video player instance
      const players = playbackManager.getPlayers();
      const htmlPlayer = players.find(
        (p: any) => p.name === "Html Video Player" || p.id === "htmlvideoplayer"
      );

      if (htmlPlayer && htmlPlayer.setMediaElement) {
        htmlPlayer.setMediaElement(videoRef.current);
      }
    }
  }, [videoRef.current, playbackManager]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    playbackManager.stop();
    setIsPlayerVisible(false);
    resetTrickplay();
  }, [playbackManager, setIsPlayerVisible, resetTrickplay]);

  // Decode blur hash for backdrop image
  useEffect(() => {
    if (currentItem && !blurDataUrl) {
      // Get blur hash for backdrop
      const backdropImageTag =
        currentItem.Type === "Episode"
          ? currentItem.ParentBackdropImageTags?.[0]
          : currentItem.BackdropImageTags?.[0];
      const blurHash =
        currentItem.ImageBlurHashes?.["Backdrop"]?.[backdropImageTag!] || "";

      if (blurHash) {
        try {
          const pixels = decode(blurHash, 32, 32);
          const canvas = document.createElement("canvas");
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const imageData = ctx.createImageData(32, 32);
            imageData.data.set(pixels);
            ctx.putImageData(imageData, 0, 0);
            setBlurDataUrl(canvas.toDataURL());
          }
        } catch (error) {
          console.error("Error decoding blur hash:", error);
        }
      }
    }
  }, [currentItem, blurDataUrl]);

  // Sync chapters
  useEffect(() => {
    if (currentItem?.Chapters) {
      const newChapters = currentItem.Chapters.map(
        (chapter: any, index: number) => {
          const startTime = chapter.StartPositionTicks / 10000000;
          const nextChapter = currentItem.Chapters[index + 1];
          const endTime = nextChapter
            ? nextChapter.StartPositionTicks / 10000000
            : duration;
          return {
            startTime,
            endTime,
            text: chapter.Name || `Chapter ${index + 1}`,
          };
        }
      );
      setChapters(newChapters);
    } else {
      setChapters([]);
    }
  }, [currentItem, duration]);

  // if (!isPlayerVisible) {
  //   return null;
  // }

  // Simplified UI rendering reusing components
  const showPlayer = isPlayerVisible && !isClosing;

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-black flex items-center justify-center w-screen ${
        !showPlayer ? "hidden" : ""
      }`}
    >
      <MediaPlayer
        autoHide
        onEnded={handleClose}
        className="w-screen"
        // Pass dummy tracks for now or wire up real ones from playbackManager
        customSubtitleTracks={subtitleTracks}
        audioTracks={audioTracks}
        selectedAudioTrackId={1}
        customSubtitlesEnabled={false} // Handled by Jellyfin player logic mostly
        chapters={chapters}
        // Force media state updates if needed, though MediaPlayer usually watches the video element
        // Since we pass the video element as child, MediaPlayer (if using media-chrome) should attach to it.
      >
        <MediaPlayerVideo asChild>
          <video
            ref={videoRef}
            className="h-screen bg-black w-screen htmlvideoplayer"
            crossOrigin="anonymous"
            playsInline
            autoPlay
          />
        </MediaPlayerVideo>

        {/* Loading Overlay */}
        <PlayerLoadingOverlay
          isVisible={!currentItem && isPlayerVisible} // Simple check
          mediaDetails={currentItem}
          currentMedia={
            currentItem
              ? {
                  id: currentItem.Id,
                  name: currentItem.Name,
                  type: currentItem.Type,
                }
              : null
          }
          serverUrl={serverUrl ?? ""}
          blurDataUrl={blurDataUrl}
          backdropImageLoaded={backdropImageLoaded}
          onBackdropLoaded={() => setBackdropImageLoaded(true)}
          onClose={handleClose}
          formatEndTime={formatEndTime}
          ticksToSeconds={(t) => t / 10000000}
        />

        {/* Controls */}
        <MediaPlayerControls className="flex-col items-start gap-2.5 px-6 pb-4 z-[9999]">
          <Button
            variant="ghost"
            className="fixed left-4 top-4 z-10 hover:backdrop-blur-md"
            onClick={handleClose}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <MediaPlayerControlsOverlay />

          <div className="flex flex-col w-full gap-1.5 pb-2">
            {currentItem?.SeriesName && (
              <div className="text-sm text-white/70 truncate font-medium">
                {currentItem.SeriesName}
              </div>
            )}

            <div className="flex items-center justify-between w-full">
              <h2 className="text-3xl font-semibold text-white truncate font-poppins">
                {currentItem?.Type === "Episode" && currentItem?.IndexNumber
                  ? `${currentItem.IndexNumber}. ${currentItem.Name}`
                  : currentItem?.Name}
              </h2>

              {duration > 0 && currentTime >= 0 && (
                <DisplayEndTime time={formatEndTime(currentTime, duration)} />
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-white/60">
              {currentItem?.Type === "Episode" && (
                <div className="space-x-1">
                  {currentItem?.ParentIndexNumber && (
                    <span>S{currentItem.ParentIndexNumber}</span>
                  )}
                  <span>•</span>
                  {currentItem?.IndexNumber && (
                    <span>E{currentItem.IndexNumber}</span>
                  )}
                </div>
              )}

              {currentItem?.RunTimeTicks && (
                <span>{formatRuntime(currentItem.RunTimeTicks)}</span>
              )}

              {currentItem?.ProductionYear && (
                <span>{currentItem.ProductionYear}</span>
              )}
            </div>
          </div>

          <MediaPlayerSeek
            tooltipThumbnailRenderer={renderTrickplayThumbnail}
          />

          <div className="flex w-full items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              <MediaPlayerPlay />
              <MediaPlayerSeekBackward>
                <RotateCcw />
              </MediaPlayerSeekBackward>
              <MediaPlayerSeekForward>
                <RotateCw />
              </MediaPlayerSeekForward>
              <MediaPlayerVolume expandable />
              <MediaPlayerTime />
            </div>
            <div className="flex items-center gap-2">
              {/* Simplified Cast & Crew for now - similar to previous but using currentItem */}
              {currentItem?.People && currentItem.People.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <MediaPlayerTooltip tooltip="Cast & Crew">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </MediaPlayerTooltip>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-80 bg-black/90 border-white/20 text-white z-[1000000]"
                    side="top"
                  >
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Cast & Crew</h3>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {currentItem.People.map(
                          (person: any, index: number) => (
                            <div
                              key={`${person.Id}-${index}`}
                              className="flex items-center space-x-3 p-2 rounded hover:bg-white/10"
                            >
                              <div className="flex-shrink-0">
                                {person.PrimaryImageTag ? (
                                  <img
                                    src={`${serverUrl}/Items/${person.Id}/Images/Primary?fillHeight=759&fillWidth=506&quality=96`}
                                    alt={person.Name!}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      target.nextElementSibling!.classList.remove(
                                        "hidden"
                                      );
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs ${
                                    person.PrimaryImageTag ? "hidden" : ""
                                  }`}
                                >
                                  {person.Name?.charAt(0) || "?"}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {person.Name}
                                </p>
                                {person.Role && (
                                  <p className="text-xs text-white/70 truncate">
                                    {person.Role}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <MediaPlayerSettings />
              <MediaPlayerPiP />
              <MediaPlayerFullscreen />
            </div>
          </div>
        </MediaPlayerControls>
      </MediaPlayer>
    </div>
  );
}
