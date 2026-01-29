import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "./optimized-image";
import { SeerrRequestItem } from "../types/seerr";
import { Badge } from "./ui/badge";
import { Check, Clock, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SeerrRequestCardProps {
  item: SeerrRequestItem;
}

export function SeerrRequestCard({ item }: SeerrRequestCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const mediaVal = (item.mediaMetadata || item.media) as any;
  const mediaInfo = item.media;

  const title = mediaVal?.title || mediaVal?.name || "Unknown Title";
  const date = mediaVal?.releaseDate || mediaVal?.firstAirDate;
  const year = date ? new Date(date).getFullYear() : undefined;

  const imageUrl = mediaVal?.backdropPath
    ? `https://image.tmdb.org/t/p/w780${mediaVal.backdropPath}`
    : mediaVal?.posterPath
      ? `https://image.tmdb.org/t/p/w500${mediaVal.posterPath}`
      : undefined;

  const linkHref = useMemo(() => {
    if (mediaInfo?.jellyfinMediaId) {
      if (item.type === "movie") {
        return `/movie/${mediaInfo.jellyfinMediaId}`;
      } else if (item.type === "tv") {
        return `/series/${mediaInfo.jellyfinMediaId}`;
      }
    }
    return "#";
  }, [item, mediaInfo]);

  const getStatusBadge = () => {
    if (mediaInfo?.status === 5) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Available
        </Badge>
      );
    }
    if (mediaInfo?.status === 4) {
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Partially Available
        </Badge>
      );
    }
    if (mediaInfo?.status === 3) {
      return (
        <Badge variant="secondary" className="bg-orange-500 text-white">
          Requested
        </Badge>
      );
    }

    switch (item.status) {
      case 1:
        return (
          <Badge
            variant="outline"
            className="text-yellow-500 border-yellow-500"
          >
            Pending
          </Badge>
        );
      case 2:
        return (
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Approved
          </Badge>
        );
      case 3:
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return null;
    }
  };

  const requester = item.requestedBy;

  return (
    <Link
      to={linkHref}
      className="block group w-72 flex-shrink-0 cursor-pointer"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-md border bg-muted">
        {imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onLoad={() => setIsLoaded(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card text-muted-foreground">
            {title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
          {/* Content placed over image for improved aesthetics in landscape card */}
        </div>
      </div>

      <div className="mt-3 space-y-1.5 px-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {year}
          </span>
          {getStatusBadge()}
        </div>

        <h3
          className="font-semibold text-foreground truncate leading-tight"
          title={title}
        >
          {title}
        </h3>

        <div className="flex items-center gap-2 pt-1">
          <Avatar className="h-5 w-5 border border-border">
            <AvatarImage src={requester?.avatar} />
            <AvatarFallback className="text-[9px]">
              {requester?.username?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            Requested by{" "}
            <span className="font-medium text-foreground">
              {requester?.username}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
