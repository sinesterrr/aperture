import React, { useState, useEffect } from "react";
import { JellyfinItem, MediaSourceInfo } from "../types/jellyfin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { MediaInfoDialog } from "../components/media-info-dialog";
import { ImageEditorDialog } from "../components/image-editor-dialog";
import { Info, Download, Play, ArrowLeft, Layers, ChevronDown } from "lucide-react";
import {
  getDownloadUrl,
  getStreamUrl,
  getSubtitleTracks,
  getUserWithPolicy,
  getUser,
  type UserPolicy,
} from "../actions";
import {
  getMediaDetailsFromName,
  cutOffText,
  formatPlaybackPosition,
  formatRuntime,
} from "../lib/utils";
import { usePlayback } from "../hooks/usePlayback";
import { DolbyDigital, DolbyTrueHd, DolbyVision, DtsHd } from "./icons/codecs";

interface MediaActionsProps {
  movie?: JellyfinItem;
  show?: JellyfinItem;
  episode?: JellyfinItem;
  onBeforePlay?: () => void;
}

export function MediaActions({
  movie,
  show,
  episode,
  onBeforePlay,
}: MediaActionsProps) {
  const media = movie || show || episode;
  const { play } = usePlayback();
  const [selectedVersion, setSelectedVersion] =
    useState<MediaSourceInfo | null>(null);
  const [userPolicy, setUserPolicy] = useState<UserPolicy | null>(null);

  // Determine if this is a resume or new play
  const hasProgress =
    media?.UserData?.PlaybackPositionTicks &&
    media.UserData.PlaybackPositionTicks > 0 &&
    !media.UserData.Played;
  const totalRuntimeTicks = media?.RunTimeTicks || 0;
  const resumePositionTicks = media?.UserData?.PlaybackPositionTicks || 0;
  const timeLeftTicks = totalRuntimeTicks - resumePositionTicks;
  const timeLeft = formatRuntime(timeLeftTicks);

  // Initialize selectedVersion when media changes
  useEffect(() => {
    if (media?.MediaSources && media.MediaSources.length > 0) {
      setSelectedVersion(media.MediaSources[0]);
    }
  }, [media]);

  // Fetch user policy when component mounts
  useEffect(() => {
    const fetchUserPolicy = async () => {
      try {
        const currentUser = await getUser();
        if (currentUser?.Id && media?.Id) {
          const userWithPolicy = await getUserWithPolicy(
            currentUser.Id,
            media.Id
          );
          if (userWithPolicy?.Policy) {
            setUserPolicy(userWithPolicy.Policy);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user policy:", error);
      }
    };

    if (media?.Id) {
      fetchUserPolicy();
    }
  }, [media?.Id]);

  if (!media) {
    return null;
  }

  // If episode doesn't have MediaSources but has an Id, show basic play button
  if (!media.MediaSources || media.MediaSources.length === 0) {
    if (episode && media.Id) {
      return (
        <div className="mb-4 flex items-center">
          <Button
            variant="outline"
            className="gap-0"
            onClick={() => {
              // Could redirect to a streaming service or handle differently
              onBeforePlay?.();
            }}
          >
            <Play className="h-4 w-4 mr-2" />
            {hasProgress ? "Resume" : "Play"} Episode
            {hasProgress && (
              <span className="text-sm opacity-75">{timeLeft} left</span>
            )}
          </Button>
        </div>
      );
    }
    return null;
  }

  if (!selectedVersion) {
    return null;
  }

  const hasMultipleVersions = media.MediaSources.length > 1;

  const download = async () => {
    window.open(await getDownloadUrl(selectedVersion.Id!), "_blank");
  };

  // Helper function to get display name for a media source
  const getMediaSourceDisplayName = (source: MediaSourceInfo) => {
    const detailsFromName = getMediaDetailsFromName(source.Name!);

    // If we can't parse details from the name, try to use DisplayTitle from video stream
    if (detailsFromName === "Unknown" && source.MediaStreams) {
      const videoStream = source.MediaStreams.find(
        (stream) => stream.Type === "Video"
      );
      if (videoStream?.DisplayTitle) {
        return getMediaDetailsFromName(videoStream.DisplayTitle);
      }
    }

    return detailsFromName;
  };

  const getVersionName = (source: MediaSourceInfo) => {
    const name = source.Name?.trim();
    if (name) {
      const bracketMatch = name.match(/\[[^\]]+\]/);
      if (bracketMatch) {
        return bracketMatch[0];
      }
      return name;
    }
    return getMediaSourceDisplayName(source);
  };

  const renderSourceLabel = (source: MediaSourceInfo, isDropdown = false) => {
    const techName = getMediaSourceDisplayName(source);
    const verName = getVersionName(source);
    
    const isBracketed = verName.startsWith('[') && verName.endsWith(']');
    const cleanVerName = isBracketed ? verName.replace(/[\[\]]/g, '') : verName;
    
    const isRedundant = !isBracketed && (verName === techName || techName.toLowerCase().includes(verName.toLowerCase()));

    if (isRedundant) {
        return techName;
    }

    if (isDropdown) {
        return (
            <div className="flex flex-col items-start gap-0.5 leading-tight">
                <span className="font-medium text-[0.8rem] text-primary">{cleanVerName}</span>
                <span className="text-xs text-muted-foreground font-normal">{techName}</span>
            </div>
        );
    }

    return (
        <span className="flex items-center gap-1.5">
            <span className="font-semibold text-primary opacity-90">{cleanVerName}</span>
            <span className="opacity-50">•</span>
            <span>{techName}</span>
        </span>
    );
  };

  // Helper function to check if media has Dolby Digital audio
  const hasDolbyDigital = (source: MediaSourceInfo) => {
    if (!source.MediaStreams) {
      return false;
    }

    const audioStreams = source.MediaStreams.filter(
      (stream) => stream.Type === "Audio"
    );

    const result = source.MediaStreams.some(
      (stream) =>
        stream.Type === "Audio" &&
        (stream.Codec?.toLowerCase().includes("ac3") ||
          stream.Codec?.toLowerCase().includes("dolby") ||
          stream.DisplayTitle?.toLowerCase().includes("dolby"))
    );

    return result;
  };

  // Helper function to check if media has Dolby TrueHD audio
  const hasDolbyTrueHD = (source: MediaSourceInfo) => {
    if (!source.MediaStreams) {
      return false;
    }

    const audioStreams = source.MediaStreams.filter(
      (stream) => stream.Type === "Audio"
    );

    const result = source.MediaStreams.some(
      (stream) =>
        stream.Type === "Audio" &&
        (stream.Codec?.toLowerCase().includes("truehd") ||
          stream.DisplayTitle?.toLowerCase().includes("truehd"))
    );

    return result;
  };

  // Helper function to check if media has Dolby Vision video
  const hasDolbyVision = (source: MediaSourceInfo) => {
    if (!source.MediaStreams) {
      return false;
    }

    const videoStreams = source.MediaStreams.filter(
      (stream) => stream.Type === "Video"
    );

    const result = source.MediaStreams.some(
      (stream) =>
        stream.Type === "Video" &&
        (stream.VideoRange?.toLowerCase().includes("dovi") ||
          stream.DisplayTitle?.toLowerCase().includes("dolby vision") ||
          stream.Profile?.toLowerCase().includes("dolby"))
    );

    return result;
  };

  const hasDtsHd = (source: MediaSourceInfo) => {
    if (!source.MediaStreams) {
      return false;
    }

    const audioStreams = source.MediaStreams.filter(
      (stream) => stream.Type === "Audio"
    );

    const result = source.MediaStreams.some(
      (stream) =>
        stream.Type === "Audio" &&
        (stream.Codec?.toLowerCase().includes("dts-hd") ||
          stream.DisplayTitle?.toLowerCase().includes("dts-hd"))
    );
    return result;
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          onClick={() => {
            if (media) {
              onBeforePlay?.();
              play({
                id: media.Id!,
                name: media.Name!,
                type: media.Type as
                  | "Movie"
                  | "Series"
                  | "Episode"
                  | "TvChannel",
                resumePositionTicks: media.UserData?.PlaybackPositionTicks,
                selectedVersion: selectedVersion,
              });
            }
          }}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {hasProgress ? "Resume" : "Play"}
          {hasProgress ? (
            <span className="text-sm opacity-75 pr-1">{timeLeft} left</span>
          ) : null}
        </Button>

        <div className="flex items-center gap-2">
          {hasMultipleVersions ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="truncate">
                <Button
                  variant="outline"
                  className="overflow-hidden whitespace-nowrap text-ellipsis fill-foreground gap-1.5 px-4"
                >
                  {renderSourceLabel(selectedVersion)}
                  <ChevronDown className="h-4 w-4 opacity-50 ml-1 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {media.MediaSources.map((source: MediaSourceInfo) => (
                  <DropdownMenuItem
                    key={source.Id}
                    onSelect={() => {
                      setSelectedVersion(source);
                      // onStreamUrlChange(null); // Clear stream URL when changing version
                    }}
                    className="fill-foreground gap-3 flex justify-between"
                  >
                    {renderSourceLabel(source, true)}
                    <Badge variant="outline" className="bg-sidebar">
                      {source.Size
                        ? `${(source.Size / 1024 ** 3).toFixed(2)} GB`
                        : "Unknown size"}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              className="overflow-hidden whitespace-nowrap text-ellipsis fill-foreground gap-1.5 px-4"
            >
              {getMediaSourceDisplayName(selectedVersion)}
            </Button>
          )}
        </div>

        <Button variant="outline" size="icon" onClick={download}>
          <Download className="h-4 w-4" />
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl dark:bg-background/30 backdrop-blur-md z-[9999999999]">
            <DialogHeader>
              <DialogTitle>Media Info</DialogTitle>
            </DialogHeader>
            <MediaInfoDialog mediaSource={selectedVersion} />
          </DialogContent>
        </Dialog>

        {userPolicy?.IsAdministrator && (
          <ImageEditorDialog
            itemId={media.Id!}
            itemName={media.Name || "Unknown"}
          />
        )}
      </div>
      {hasMultipleVersions && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground ml-1">
          <Layers className="h-3 w-3 text-primary" />
          <span className="flex items-center gap-2">
            {media.MediaSources.length} versions available — pick one from the
            dropdown
            <Badge variant="secondary" className="text-[0.6rem] uppercase">
              Current: {renderSourceLabel(selectedVersion)}
            </Badge>
          </span>
        </div>
      )}

      {(hasDolbyDigital(selectedVersion) ||
        hasDolbyTrueHD(selectedVersion) ||
        hasDolbyVision(selectedVersion) ||
        hasDtsHd(selectedVersion)) && (
        <div className="flex gap-4 ml-1 h-8 items-center mt-4 -mb-2">
          {hasDolbyDigital(selectedVersion) && <DolbyDigital />}
          {hasDolbyTrueHD(selectedVersion) && <DolbyTrueHd />}
          {hasDolbyVision(selectedVersion) && <DolbyVision />}
          {hasDtsHd(selectedVersion) && <DtsHd />}
        </div>
      )}
    </div>
  );
}
