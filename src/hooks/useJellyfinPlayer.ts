import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useSettings } from "../contexts/settings-context";
import playbackManager from "../lib/jellyfin/playback-manager";
import { ApiClient } from "../lib/jellyfin/api-client";
import Events from "../lib/jellyfin/events";
import { getDeviceId } from "../lib/device-id";

export function useJellyfinPlayer() {
  const { serverUrl, user, isAuthenticated } = useAuthContext();
  const { playbackMode, videoBitrate } = useSettings();
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [playerState, setPlayerState] = useState<any>(null);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize ApiClient and set it on playbackManager
  useEffect(() => {
    if (isAuthenticated && serverUrl && user?.AccessToken && user?.Id) {
      const deviceId = getDeviceId();
      const client = new ApiClient(
        serverUrl,
        user.AccessToken,
        user.Id,
        deviceId
      );
      playbackManager.setApiClient(client);
    }
  }, [isAuthenticated, serverUrl, user]);

  useEffect(() => {
    const onPlaybackStart = (_e: any, player: any, state: any) => {
      setPaused(false);
      setCurrentItem(state.NowPlayingItem);
      setPlayerState(state);
      setDuration(playbackManager.duration() || 0);
    };

    const onPlaybackStop = (_e: any, info: any) => {
      setPaused(true);
      setCurrentItem(null);
      setPlayerState(null);
      setDuration(0);
      setCurrentTime(0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(playbackManager.currentTime() || 0);
      setDuration(playbackManager.duration() || 0);
    };

    const onPause = () => setPaused(true);
    const onUnpause = () => setPaused(false);
    const onVolumeChange = () => {
      setVolume(playbackManager.getCurrentPlayer()?.getVolume() || 100);
      setIsMuted(playbackManager.getCurrentPlayer()?.isMuted() || false);
    };

    Events.on(playbackManager, "playbackstart", onPlaybackStart);
    Events.on(playbackManager, "playbackstop", onPlaybackStop);
    Events.on(playbackManager, "timeupdate", onTimeUpdate);
    Events.on(playbackManager, "pause", onPause);
    Events.on(playbackManager, "unpause", onUnpause);
    Events.on(playbackManager, "volumechange", onVolumeChange);

    return () => {
      Events.off(playbackManager, "playbackstart", onPlaybackStart);
      Events.off(playbackManager, "playbackstop", onPlaybackStop);
      Events.off(playbackManager, "timeupdate", onTimeUpdate);
      Events.off(playbackManager, "pause", onPause);
      Events.off(playbackManager, "unpause", onUnpause);
      Events.off(playbackManager, "volumechange", onVolumeChange);
    };
  }, []);

  // Effect to reload playback when settings change
  useEffect(() => {
    // Only reload if we are currently active (have a current item)
    // and specifically if the settings that affect streaming URL change.
    // We use a ref to track previous settings to avoid initial run or unnecessary reloads
    // But since this is a fresh hook instance/render on context change, we can just check if playing.
    
    // Actually, simply checking if we have currentItem is enough to know we have an active session.
    // However, we don't want to reload if paused? Or maybe we do.
    // OG Jellyfin reloads immediately.
    
    if (currentItem && playbackManager) {
       const player = playbackManager.getCurrentPlayer();
       if (!player) return;

       const currentTicks = (playbackManager.currentTime() || 0) * 10000;
       
       // We need to re-invoke play with the same item but new settings.
       // We can retrieve the current playlist and index from queue manager.
       const playQueueManager = playbackManager._playQueueManager;
       const playlist = playQueueManager.getPlaylist();
       const index = playQueueManager.getCurrentPlaylistIndex();
       
       if (playlist.length > 0 && index !== -1) {
         // Stop current playback (optional, play() might handle it, but safer to be explicit or let manager handle)
         // playbackManager.play() handles stopping previous player.
         
         console.debug("Reloading playback due to settings change", { playbackMode, videoBitrate });
         
         playbackManager.play({
           items: playlist,
           startIndex: index,
           startPositionTicks: currentTicks,
           playbackMode,
           // videoBitrate is read directly from appSettings/localStorage by playbackManager
         });
       }
    }
  }, [playbackMode, videoBitrate]);

  const play = useCallback(
    (options: any) => {
      return playbackManager.play({
        ...options,
        playbackMode,
      });
    },
    [playbackMode]
  );

  const pause = useCallback(() => {
    playbackManager.pause();
  }, []);

  const resume = useCallback(() => {
    playbackManager.unpause();
  }, []);

  const stop = useCallback(() => {
    playbackManager.stop();
  }, []);

  const seek = useCallback((ticks: number) => {
    // ticks are in 100ns units (Jellyfin/C# standard)
    // playbackManager.seek(ticks);
    // But our ported playbackManager calls player.seek which might expect seconds or ticks depending on implementation
    // My ported playbackManager.seek takes ticks.
    // My HtmlVideoPlayer.currentTime takes seconds.
    // But playbackManager.seek handles conversion.
    const player = playbackManager.getCurrentPlayer();
    if (player) {
      // playbackManager.seek implementation in my port was:
      // player.currentTime(parseInt(ticks / 10000, 10));
      // So pass ticks.
      player.currentTime(ticks / 10000);
    }
  }, []);

  return {
    play,
    pause,
    resume,
    stop,
    seek,
    paused,
    currentTime, // in seconds
    duration, // in seconds
    currentItem,
    playerState,
    volume,
    isMuted,
    playbackManager,
  };
}
