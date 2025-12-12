import { useJellyfinPlayer } from "../hooks/useJellyfinPlayer";

export function useMediaPlayer() {
  const player = useJellyfinPlayer();

  // Map to the existing interface expected by consumers
  // Original interface:
  // {
  //   isPlayerVisible, setIsPlayerVisible, playMedia, currentMedia, currentMediaWithSource,
  //   setCurrentMediaWithSource, skipToTimestamp, skipTimestamp, currentTimestamp, setCurrentTimestamp
  // }

  // We need to maintain some state compatibility or refactor consumers.
  // For now, let's map what we can.

  const isPlayerVisible = !!player.currentItem;
  const currentMedia = player.currentItem;

  // Shim playMedia
  const playMedia = (media: any) => {
    // media here is likely { ids: [...], ... } or similar from the old atom
    // We need to adapt it to player.play(options)
    // Assuming media has `items` or `ids`
    player.play({
      items: [media], // Or however media is structured
      startPositionTicks: 0,
    });
  };

  return {
    isPlayerVisible,
    setIsPlayerVisible: (_visible: boolean) => {}, // No-op, visibility driven by playback state
    playMedia: (media: any) => {
      if (media.ids) {
        player.play({ ids: media.ids, serverId: media.serverId });
      } else if (media.items) {
        player.play({ items: media.items });
      } else {
        // Fallback assuming it's a single item
        player.play({ items: [media] });
      }
    },
    currentMedia,
    currentMediaWithSource: player.currentItem
      ? { item: player.currentItem, source: player.playerState?.MediaSource }
      : null,
    setCurrentMediaWithSource: (_media: any) => {}, // No-op
    skipToTimestamp: (timestamp: number) => player.seek(timestamp * 10000000), // timestamp in seconds -> ticks
    skipTimestamp: 0,
    currentTimestamp: player.currentTime,
    setCurrentTimestamp: (_time: number) => {}, // No-op

    // Expose new player
    player,
  };
}

export type MediaToPlay = any;
export type CurrentMediaWithSource = any;
