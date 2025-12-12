/* eslint-disable @typescript-eslint/no-explicit-any */
import Events from "./events";
import PlayQueueManager from "./play-queue-manager";
import { appSettings, userSettings } from "./settings";
import HtmlVideoPlayer from "./players/html-video-player";
import { MediaError } from "./media-error";
import { includesAny, isLocalItem } from "./utils";
import getDeviceProfile from "./device-profile";

// Mocks/Stubs for missing dependencies
const globalize = {
  translate: (key: string) => key,
};

const loading = {
  show: () => console.debug("Loading show"),
  hide: () => console.debug("Loading hide"),
};

const alert = (options: any) =>
  console.log((options.title ? options.title + ": " : "") + options.text);

const appHost = {
  supports: (_feature: string) => false,
};

const ServerConnections = {
  getApiClient: (serverId: string) => {
    // This needs to be injected or retrieved from a global store/context
    // For now, we'll rely on the player needing an apiClient passed in options or similar
    throw new Error(
      "ServerConnections.getApiClient not implemented. Inject apiClient instead."
    );
  },
  currentApiClient: () => {
    throw new Error(
      "ServerConnections.currentApiClient not implemented. Inject apiClient instead."
    );
  },
};

// Helper types
export interface PlayOptions {
  fullscreen?: boolean;
  startPositionTicks?: number;
  audioStreamIndex?: number;
  subtitleStreamIndex?: number;
  mediaSourceId?: string;
  startIndex?: number;
  ids?: string[];
  items?: any[];
  serverId?: string;
  playbackMode?: "direct" | "transcode";
  [key: string]: any;
}

const UNLIMITED_ITEMS = -1;

function enableLocalPlaylistManagement(player: any) {
  if (player.getPlaylist) {
    return false;
  }

  return player.isLocalPlayer;
}

function supportsPhysicalVolumeControl(player: any) {
  return player.isLocalPlayer && appHost.supports("PhysicalVolumeControl");
}

function getMimeType(type: string, container: string) {
  container = (container || "").toLowerCase();

  if (type === "audio") {
    if (container === "opus") {
      return "audio/ogg";
    }
    if (container === "webma") {
      return "audio/webm";
    }
    if (container === "m4a") {
      return "audio/mp4";
    }
  } else if (type === "video") {
    if (container === "mkv") {
      return "video/x-matroska";
    }
    if (container === "m4v") {
      return "video/mp4";
    }
    if (container === "mov") {
      return "video/quicktime";
    }
    if (container === "mpg") {
      return "video/mpeg";
    }
    if (container === "flv") {
      return "video/x-flv";
    }
  }

  return type + "/" + container;
}

function getParam(name: string, url: string) {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
  const regexS = "[\\?&]" + name + "=([^&#]*)";
  const regex = new RegExp(regexS, "i");

  const results = regex.exec(url);
  if (results == null) {
    return "";
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}

function isServerItem(item: any) {
  return !!item.Id;
}

function normalizePlayOptions(playOptions: any) {
  playOptions.fullscreen = playOptions.fullscreen !== false;
}

function truncatePlayOptions(playOptions: any) {
  return {
    aspectRatio: playOptions.aspectRatio,
    fullscreen: playOptions.fullscreen,
    mediaSourceId: playOptions.mediaSourceId,
    audioStreamIndex: playOptions.audioStreamIndex,
    subtitleStreamIndex: playOptions.subtitleStreamIndex,
    startPositionTicks: playOptions.startPositionTicks,
  };
}

function getNowPlayingItemForReporting(
  player: any,
  item: any,
  mediaSource: any
) {
  const nowPlayingItem = Object.assign({}, item);

  if (mediaSource) {
    nowPlayingItem.RunTimeTicks = mediaSource.RunTimeTicks;
    nowPlayingItem.MediaStreams = mediaSource.MediaStreams;
    nowPlayingItem.MediaSources = null;
  }

  nowPlayingItem.RunTimeTicks =
    nowPlayingItem.RunTimeTicks || player.duration() * 10000;

  return nowPlayingItem;
}

function createTarget(instance: any, player: any) {
  return {
    name: player.name,
    id: player.id,
    playerName: player.name,
    playableMediaTypes: ["Audio", "Video", "Photo", "Book"].map((t) =>
      player.canPlayMediaType(t)
    ),
    isLocalPlayer: player.isLocalPlayer,
    supportedCommands: instance.getSupportedCommands(player),
  };
}

export class PlaybackManager {
  _currentPlayer: any;
  _playQueueManager: PlayQueueManager;
  _playNextAfterEnded = true;
  _players: any[] = [];
  _apiClient: any; // Injected apiClient

  constructor() {
    this._playQueueManager = new PlayQueueManager();

    // Register default player
    const htmlPlayer = new HtmlVideoPlayer();
    htmlPlayer.setPlaybackManager(this);
    this.initMediaPlayer(htmlPlayer);
  }

  getCurrentPlayer() {
    return this._currentPlayer;
  }

  getPlayers() {
    return this._players;
  }

  setApiClient(apiClient: any) {
    this._apiClient = apiClient;
  }

  getApiClient(serverId?: string) {
    // Fallback to injected client if serverId matches or not provided
    // In a real app, we might have multiple clients
    return this._apiClient;
  }

  initMediaPlayer(player: any) {
    this._players.push(player);

    if (player.isLocalPlayer !== false) {
      player.isLocalPlayer = true;
    }

    if (enableLocalPlaylistManagement(player)) {
      Events.on(player, "error", this.onPlaybackError.bind(this));
      Events.on(player, "timeupdate", this.onPlaybackTimeUpdate.bind(this));
      Events.on(player, "pause", this.onPlaybackPause.bind(this));
      Events.on(player, "unpause", this.onPlaybackUnpause.bind(this));
      Events.on(player, "volumechange", this.onPlaybackVolumeChange.bind(this));
      // Events.on(player, 'repeatmodechange', onRepeatModeChange);
      // Events.on(player, 'shufflequeuemodechange', onShuffleQueueModeChange);
      // Events.on(player, 'playlistitemmove', onPlaylistItemMove);
      // Events.on(player, 'playlistitemremove', onPlaylistItemRemove);
      // Events.on(player, 'playlistitemadd', onPlaylistItemAdd);
    } else if (player.isLocalPlayer) {
      Events.on(
        player,
        "itemstarted",
        this.onPlaybackStartedFromSelfManagingPlayer.bind(this)
      );
      Events.on(
        player,
        "itemstopped",
        this.onPlaybackStoppedFromSelfManagingPlayer.bind(this)
      );
      Events.on(player, "timeupdate", this.onPlaybackTimeUpdate.bind(this));
      Events.on(player, "pause", this.onPlaybackPause.bind(this));
      Events.on(player, "unpause", this.onPlaybackUnpause.bind(this));
      Events.on(player, "volumechange", this.onPlaybackVolumeChange.bind(this));
      // Events.on(player, 'repeatmodechange', onRepeatModeChange);
      // Events.on(player, 'shufflequeuemodechange', onShuffleQueueModeChange);
      // Events.on(player, 'playlistitemmove', onPlaylistItemMove);
      // Events.on(player, 'playlistitemremove', onPlaylistItemRemove);
      // Events.on(player, 'playlistitemadd', onPlaylistItemAdd);
    }
  }

  currentItem(player = this._currentPlayer) {
    if (!player) return null;
    if (player.currentItem) return player.currentItem();
    const data = this.getPlayerData(player);
    return data.streamInfo ? data.streamInfo.item : null;
  }

  currentMediaSource(player = this._currentPlayer) {
    if (!player) return null;
    if (player.currentMediaSource) return player.currentMediaSource();
    const data = this.getPlayerData(player);
    return data.streamInfo ? data.streamInfo.mediaSource : null;
  }

  getPlayerData(player: any) {
    if (!player) throw new Error("player cannot be null");
    // We can just store state on the player object for now or a weak map
    // The original code used a playerStates object keyed by name
    if (!player._playbackManagerState) {
      player._playbackManagerState = {};
    }
    return player._playbackManagerState;
  }

  // Simplified play method
  async play(options: PlayOptions) {
    normalizePlayOptions(options);

    if (this._currentPlayer) {
      if (!this._currentPlayer.isLocalPlayer) {
        return this._currentPlayer.play(options);
      }
    }

    let { items } = options;
    if (!items) {
      if (!options.ids) {
        throw new Error("ids or items required");
      }
      // Fetch items
      const apiClient = this.getApiClient(options.serverId);
      const result = await apiClient.getItems(apiClient.getCurrentUserId(), {
        Ids: options.ids.join(","),
      });
      items = result.Items;
    }

    // Simplification: We assume items are playable and don't do complex translation/intros for now
    // But we should queue them.

    let playStartIndex = options.startIndex || 0;
    let firstItem = items![playStartIndex];

    if (!firstItem) {
      playStartIndex = 0;
      firstItem = items![playStartIndex];
    }

    this._playQueueManager.setPlaylist(items!);
    this._playQueueManager.setPlaylistState(firstItem.PlaylistItemId);

    return this.playInternal(firstItem, options, () => {
      // onPlaybackStarted
      loading.hide();
    });
  }

  async playInternal(item: any, playOptions: any, onPlaybackStartedFn: any) {
    normalizePlayOptions(playOptions);

    const apiClient = this.getApiClient(item.ServerId);
    const mediaType = item.MediaType;

    const player = this.getPlayer(item, playOptions);

    if (!player) {
      console.error("No player found");
      return Promise.reject();
    }

    this.setCurrentPlayerInternal(player, createTarget(this, player));

    const maxBitrate = appSettings.maxStreamingBitrate(true, mediaType); // Assuming network is true for now

    // Get playback info and device profile
    const deviceProfile = await player.getDeviceProfile(item);

    const playbackInfoQuery = {
      UserId: apiClient.getCurrentUserId(),
      StartTimeTicks: playOptions.startPositionTicks || 0,
      AutoOpenLiveStream: true,
      MaxStreamingBitrate: maxBitrate,
      DeviceProfile: deviceProfile,
    };

    const playbackInfo = await apiClient.getPostedPlaybackInfo(
      item.Id,
      playbackInfoQuery
    );

    if (playbackInfo.ErrorCode) {
      console.error("Playback Error: " + playbackInfo.ErrorCode);
      return Promise.reject();
    }

    const mediaSource = playbackInfo.MediaSources[0]; // Logic for selecting best source needed? original uses getOptimalMediaSource

    const streamInfo = this.createStreamInfo(
      apiClient,
      mediaType,
      item,
      mediaSource,
      playOptions.startPositionTicks,
      player,
      playOptions.playbackMode
    );
    streamInfo.fullscreen = playOptions.fullscreen;

    const playerData = this.getPlayerData(player);
    playerData.streamInfo = streamInfo;
    playerData.maxStreamingBitrate = maxBitrate;

    return player.play(streamInfo).then(() => {
      onPlaybackStartedFn();
      this.onPlaybackStarted(player, playOptions, streamInfo, mediaSource);
    });
  }

  onPlaybackStarted(
    player: any,
    playOptions: any,
    streamInfo: any,
    mediaSource: any
  ) {
    streamInfo.started = true;
    streamInfo.playbackStartTimeTicks = new Date().getTime() * 10000;

    const state = this.getPlayerState(
      player,
      streamInfo.item,
      streamInfo.mediaSource
    );

    this.reportPlayback(
      state,
      player,
      true,
      state.NowPlayingItem.ServerId,
      "reportPlaybackStart"
    );

    Events.trigger(this, "playbackstart", [player, state]);
  }

  onPlaybackStopped(player: any, state: any) {
    const streamInfo = this.getPlayerData(player).streamInfo;
    if (streamInfo) {
      streamInfo.ended = true;
      this.reportPlayback(
        state,
        player,
        true,
        streamInfo.item.ServerId,
        "reportPlaybackStopped"
      );
    }
    Events.trigger(this, "playbackstop", [{ player, state }]);
  }

  onPlaybackError(e: any, error: any) {
    const player = this._currentPlayer;
    console.error("Playback Error", e, error);
    Events.trigger(this, "playbackerror", [error]);
  }

  onPlaybackTimeUpdate() {
    const player = this._currentPlayer;
    if (player) {
      this.sendProgressUpdate(player, "timeupdate");
    }
  }

  onPlaybackPause() {
    const player = this._currentPlayer;
    if (player) {
      this.sendProgressUpdate(player, "pause");
    }
  }

  onPlaybackUnpause() {
    const player = this._currentPlayer;
    if (player) {
      this.sendProgressUpdate(player, "unpause");
    }
  }

  onPlaybackVolumeChange() {
    const player = this._currentPlayer;
    if (player) {
      this.sendProgressUpdate(player, "volumechange");
    }
  }

  onPlaybackStartedFromSelfManagingPlayer() {
    // Implementation for when we add casting
  }

  onPlaybackStoppedFromSelfManagingPlayer() {
    // Implementation for when we add casting
  }

  reportPlayback(
    state: any,
    player: any,
    reportPlaylist: boolean,
    serverId: string,
    method: string,
    progressEventName?: string
  ) {
    if (!serverId || !this._apiClient) return;

    const info = Object.assign({}, state.PlayState);
    info.ItemId = state.NowPlayingItem.Id;

    if (progressEventName) {
      info.EventName = progressEventName;
    }

    const apiClient = this.getApiClient(serverId);
    if (apiClient && apiClient[method]) {
      apiClient[method](info);
    }
  }

  sendProgressUpdate(player: any, progressEventName: string) {
    const state = this.getPlayerState(player);
    if (state.NowPlayingItem) {
      const streamInfo = this.getPlayerData(player).streamInfo;
      if (streamInfo && streamInfo.started && !streamInfo.ended) {
        this.reportPlayback(
          state,
          player,
          false,
          state.NowPlayingItem.ServerId,
          "reportPlaybackProgress",
          progressEventName
        );
      }
    }
  }

  getPlayerState(player: any, item?: any, mediaSource?: any) {
    player = player || this._currentPlayer;
    if (!player) return {};

    item = item || this.currentItem(player);
    mediaSource = mediaSource || this.currentMediaSource(player);

    const state: any = {
      PlayState: {},
    };

    if (player) {
      state.PlayState.VolumeLevel = player.getVolume();
      state.PlayState.IsMuted = player.isMuted();
      state.PlayState.IsPaused = player.paused();
      state.PlayState.PositionTicks = Math.floor(10000 * player.currentTime());
      // Add other state properties
    }

    if (item) {
      state.NowPlayingItem = getNowPlayingItemForReporting(
        player,
        item,
        mediaSource
      );
    }

    return state;
  }

  getPlayer(item: any, playOptions: any) {
    // Filter players that can play the item
    return this._players.find((p) => p.canPlayMediaType(item.MediaType));
  }

  setCurrentPlayerInternal(player: any, targetInfo: any) {
    this._currentPlayer = player;
    // Logic to stop previous player if needed
  }

  createStreamInfo(
    apiClient: any,
    type: string,
    item: any,
    mediaSource: any,
    startPosition: number,
    player: any,
    playbackMode?: string
  ) {
    let mediaUrl;
    let contentType;
    let transcodingOffsetTicks = 0;
    let playMethod = "Transcode";
    const mediaSourceContainer = (mediaSource.Container || "").toLowerCase();
    const forceTranscode = playbackMode === "transcode";

    if (type === "Video" || type === "Audio") {
      contentType = getMimeType(type.toLowerCase(), mediaSourceContainer);

      if (!forceTranscode && mediaSource.enableDirectPlay) {
        mediaUrl = mediaSource.Path;
        playMethod = "DirectPlay";
      } else if (
        !forceTranscode &&
        (mediaSource.SupportsDirectPlay || mediaSource.SupportsDirectStream)
      ) {
        const directOptions: any = {
          Static: true,
          mediaSourceId: mediaSource.Id,
          deviceId: apiClient.deviceId(),
          ApiKey: apiClient.accessToken(),
        };
        if (mediaSource.LiveStreamId) {
          directOptions.LiveStreamId = mediaSource.LiveStreamId;
        }
        const prefix = type === "Video" ? "Videos" : "Audio";
        mediaUrl = apiClient.getUrl(
          prefix + "/" + item.Id + "/stream." + mediaSourceContainer,
          directOptions
        );
        playMethod = mediaSource.SupportsDirectPlay
          ? "DirectPlay"
          : "DirectStream";
      } else if (mediaSource.SupportsTranscoding) {
        mediaUrl = apiClient.getUrl(mediaSource.TranscodingUrl);
        if (mediaSource.TranscodingSubProtocol === "hls") {
          contentType = "application/x-mpegURL";
        }
      }
    }

    return {
      url: mediaUrl,
      mimeType: contentType,
      transcodingOffsetTicks,
      playMethod,
      playerStartPositionTicks: startPosition,
      item,
      mediaSource,
      mediaType: type,
      fullscreen: undefined as boolean | undefined,
    };
  }

  getSupportedCommands(player: any) {
    return [];
  }

  // Public API methods that delegates to current player
  pause() {
    this._currentPlayer?.pause();
  }
  unpause() {
    this._currentPlayer?.unpause();
  }
  paused() {
    return this._currentPlayer?.paused();
  }
  currentTime() {
    return this._currentPlayer?.currentTime();
  }
  duration() {
    return this._currentPlayer?.duration();
  }
  stop() {
    if (this._currentPlayer) {
      return this._currentPlayer.stop(true);
    }
    return Promise.resolve();
  }

  trackHasSecondarySubtitleSupport(track: any, player: any) {
    return false;
  }

  getMaxStreamingBitrate(player: any) {
    return appSettings.maxStreamingBitrate(true, "Video");
  }
}

export const playbackManager = new PlaybackManager();
export default playbackManager;
