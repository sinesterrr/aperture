import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  getSeerrMediaDetails,
  getRadarrSettings,
  getRadarrProfiles,
  getSonarrSettings,
  getSonarrProfiles,
  submitSeerrRequest,
  deleteSeerrRequest,
} from "../actions/seerr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Trash2,
} from "lucide-react";
import { OptimizedImage } from "./optimized-image";
import { useSeerr } from "../contexts/seerr-context";
import { Badge } from "./ui/badge";

interface SeerrRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number;
  mediaType: "movie" | "tv";
}

export function SeerrRequestModal({
  isOpen,
  onClose,
  tmdbId,
  mediaType,
}: SeerrRequestModalProps) {
  const { canManageRequests: isAdmin, addRequest, removeRequest } = useSeerr();

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  // Note: Root folders support requires additional endpoints not yet in seerr.ts, skipping for now as per instructions to fit "details" theme mostly.
  // const [rootFolders, setRootFolders] = useState<any[]>([]);

  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  // const [selectedRootFolder, setSelectedRootFolder] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Fetch details
      getSeerrMediaDetails(mediaType, tmdbId)
        .then((data) => {
          setDetails(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      // If admin, fetch servers (only if we might need to make a request)
      if (isAdmin) {
        if (mediaType === "movie") {
          getRadarrSettings().then((data) => {
            if (data && data.length > 0) {
              setServers(data);
              // Default to first server
              const firstServer = data[0];
              setSelectedServerId(firstServer.id.toString());
            }
          });
        } else {
          getSonarrSettings().then((data) => {
            if (data && data.length > 0) {
              setServers(data);
              const firstServer = data[0];
              setSelectedServerId(firstServer.id.toString());
            }
          });
        }
      }
    } else {
      setDetails(null);
      setServers([]);
      setProfiles([]);
    }
  }, [isOpen, tmdbId, mediaType, isAdmin]);

  // Fetch profiles when server changes
  useEffect(() => {
    if (!isAdmin || !selectedServerId) return;

    const serverId = parseInt(selectedServerId);
    if (isNaN(serverId)) return;

    if (mediaType === "movie") {
      getRadarrProfiles(serverId).then((data) => {
        if (data) setProfiles(data);
      });
    } else {
      getSonarrProfiles(serverId).then((data) => {
        if (data) setProfiles(data);
      });
    }
  }, [selectedServerId, mediaType, isAdmin]);

  const handleRequest = async () => {
    setSubmitting(true);

    const payload: any = {
      mediaType,
      mediaId: tmdbId,
    };

    if (mediaType === "tv") {
      payload.seasons = "all";
    }

    if (isAdmin) {
      if (selectedServerId) payload.serverId = parseInt(selectedServerId);
      if (selectedProfileId) payload.profileId = parseInt(selectedProfileId);
      // if (selectedRootFolder) payload.rootFolder = selectedRootFolder;
    }

    const requestData = await submitSeerrRequest(payload);
    setSubmitting(false);

    if (requestData) {
      toast.success("Request submitted successfully!");

      const hydratedRequest = {
        ...requestData,
        mediaMetadata: {
          ...details,
          mediaType,
        },
      };

      addRequest(hydratedRequest);

      // Update local details to reflect new request status immediately
      setDetails((prev: any) => ({
        ...prev,
        mediaInfo: {
          ...prev.mediaInfo,
          status: requestData.status, // Basic status update
          requests: [requestData], // Add to requests array
        },
      }));
    } else {
      toast.error("Failed to submit request.");
    }
  };

  const handleDeleteRequest = async () => {
    // Find request ID from details
    const requestId = details?.mediaInfo?.requests?.[0]?.id;
    if (!requestId) return;

    if (!confirm("Are you sure you want to cancel this request?")) return;

    setSubmitting(true);
    const success = await deleteSeerrRequest(requestId);
    setSubmitting(false);

    if (success) {
      toast.success("Request cancelled successfully.");
      removeRequest(requestId);
      onClose(); // Close modal on delete usually makes sense
    } else {
      toast.error("Failed to cancel request.");
    }
  };

  const posterUrl = details?.posterPath
    ? `https://image.tmdb.org/t/p/w500${details.posterPath}`
    : undefined;

  const backdropUrl = details?.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${details.backdropPath}`
    : undefined;

  // Determine status
  // 1 = Pending, 2 = Processing, 3 = Partially Available, 4 = Available, 5 = Available
  const status = details?.mediaInfo?.status;
  const requests = details?.mediaInfo?.requests || [];
  const isRequested = requests.length > 0;
  const isAvailable = status === 4 || status === 5;
  const isProcessing = status === 2;
  const isPending = status === 1; // Or if requests exist but not processing/available

  // Logic to show "Request" button vs "Already Requested" status
  const showRequestButton = !isRequested && !isAvailable && !isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl overflow-hidden p-0 gap-0">
        <div className="relative w-full h-48 md:h-64 bg-muted">
          {backdropUrl ? (
            <OptimizedImage
              src={backdropUrl}
              alt="Backdrop"
              className="w-full h-full object-cover opacity-60"
            />
          ) : posterUrl ? (
            <div className="w-full h-full bg-black/40 relative overflow-hidden">
              <OptimizedImage
                src={posterUrl}
                alt="Backdrop Blur"
                className="w-full h-full object-cover blur-3xl opacity-50 scale-110"
              />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            {posterUrl && (
              <div className="w-24 md:w-32 aspect-[2/3] rounded-lg shadow-2xl overflow-hidden border-2 border-background/20 hidden sm:block">
                <OptimizedImage
                  src={posterUrl}
                  alt="Poster"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="mb-1">
              <DialogTitle className="text-2xl md:text-3xl font-bold shadow-black drop-shadow-md">
                {details?.title || details?.name}
              </DialogTitle>
              <div className="text-sm md:text-base text-muted-foreground flex items-center gap-2 mt-1">
                {details?.releaseDate || details?.firstAirDate
                  ? new Date(
                      details?.releaseDate || details?.firstAirDate,
                    ).getFullYear()
                  : "Unknown Year"}

                {details?.runtime > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {Math.floor(details.runtime / 60)}h {details.runtime % 60}
                      m
                    </span>
                  </>
                )}

                {details?.voteAverage > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center text-yellow-500 gap-1">
                      <span className="text-foreground font-medium">
                        {details.voteAverage.toFixed(1)}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              <DialogDescription className="text-base leading-relaxed">
                {details?.overview}
              </DialogDescription>

              <div className="flex flex-wrap gap-2">
                {details?.genres?.map((g: any) => (
                  <Badge
                    key={g.id}
                    variant="secondary"
                    className="px-2 py-0.5 text-xs"
                  >
                    {g.name}
                  </Badge>
                ))}

                {details?.voteCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {details.voteCount} votes
                  </Badge>
                )}

                {details?.status && (
                  <Badge variant="outline" className="text-xs">
                    {details.status}
                  </Badge>
                )}
              </div>

              {/* Request Status Info */}
              {!showRequestButton && (
                <div className="bg-muted/50 rounded-lg p-4 border flex items-start gap-3">
                  {isAvailable ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : isProcessing ? (
                    <HardDrive className="h-5 w-5 text-blue-500 mt-0.5" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {isAvailable
                        ? "Available in Library"
                        : isProcessing
                          ? "Processing"
                          : "Requested"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAvailable &&
                        "This title is already available on your media server."}
                      {isProcessing &&
                        "This title is currently downloading or processing."}
                      {isPending &&
                        "This title has been requested and is pending approval or availability."}
                    </p>
                  </div>

                  {/* Delete Action for Pending Requests */}
                  {!isAvailable &&
                    !isProcessing &&
                    (isAdmin ||
                      details?.mediaInfo?.requests?.[0]?.requestedBy?.id ===
                        details?.userInfo?.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                        onClick={handleDeleteRequest}
                        disabled={submitting}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                </div>
              )}

              {/* Request Configuration (Only if requesting) */}
              {showRequestButton && isAdmin && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium">Admin Options</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servers.length > 1 && (
                      <div className="grid gap-2">
                        <Label>Server</Label>
                        <Select
                          value={selectedServerId}
                          onValueChange={setSelectedServerId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Server" />
                          </SelectTrigger>
                          <SelectContent>
                            {servers.map((server) => (
                              <SelectItem
                                key={server.id}
                                value={server.id.toString()}
                              >
                                {server.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label>Quality Profile</Label>
                      <Select
                        value={selectedProfileId}
                        onValueChange={setSelectedProfileId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Profile" />
                        </SelectTrigger>
                        <SelectContent z-index={200}>
                          {profiles.map((profile) => (
                            <SelectItem
                              key={profile.id}
                              value={profile.id.toString()}
                            >
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="bg-muted/30 p-4 sm:justify-between items-center border-t">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {showRequestButton && !loading && (
            <Button onClick={handleRequest} disabled={submitting || loading}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request {mediaType === "movie" ? "Movie" : "Series"}
            </Button>
          )}
          {isAvailable && (
            <Button variant="outline" disabled className="gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Available
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
