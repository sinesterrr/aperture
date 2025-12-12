/* eslint-disable @typescript-eslint/no-explicit-any */
import Hls from "hls.js";
import debounce from "lodash/debounce";
import Screenfull from "screenfull";

import { MediaError } from "../media-error";
import browser from "../browser";
import { appSettings, userSettings } from "../settings";
import {
  bindEventsToHlsPlayer,
  destroyHlsPlayer,
  destroyFlvPlayer,
  destroyCastPlayer,
  getCrossOriginValue,
  enableHlsJsPlayerForCodecs,
  applySrc,
  resetSrc,
  playWithPromise,
  onEndedInternal,
  saveVolume,
  seekOnPlaybackStart,
  onErrorInternal,
  handleHlsJsMediaError,
  getSavedVolume,
  isValidDuration,
  getBufferedRanges,
} from "../html-media-helper";
import getDeviceProfile, { canPlaySecondaryAudio } from "../device-profile";
import Events from "../events";
import { includesAny, isHls, isLocalItem } from "../utils";

function resolveUrl(url: string): Promise<string> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true);
    xhr.onload = function () {
      resolve(xhr.responseURL || url);
    };
    xhr.onerror = function (e) {
      console.error(e);
      resolve(url);
    };
    xhr.send(null);
  });
}

function enableNativeTrackSupport(mediaSource: any, track: any) {
  if (track?.DeliveryMethod === "Embed") {
    return true;
  }

  if ((browser as any).firefox && isHls(mediaSource)) {
    return false;
  }

  if (browser.ps4) {
    return false;
  }

  if (browser.web0s) {
    return false;
  }

  if ((browser as any).edge) {
    return false;
  }

  if (browser.iOS && (browser.iOSVersion || 10) < 10) {
    return false;
  }

  if (track) {
    const format = (track.Codec || "").toLowerCase();
    if (format === "ssa" || format === "ass" || format === "pgssub") {
      return false;
    }
  }

  return true;
}

function getMediaStreamAudioTracks(mediaSource: any) {
  return mediaSource.MediaStreams.filter(function (s: any) {
    return s.Type === "Audio";
  });
}

function getMediaStreamTextTracks(mediaSource: any) {
  return mediaSource.MediaStreams.filter(function (s: any) {
    return s.Type === "Subtitle";
  });
}

function zoomIn(elem: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const duration = 240;
    elem.style.animation = `htmlvideoplayer-zoomin ${duration}ms ease-in normal`;
    const onAnimationEnd = () => {
      resolve();
    };
    // fallback if no animation
    setTimeout(resolve, duration + 10);
  });
}

function normalizeTrackEventText(text: string, useHtml: boolean) {
  const result = text
    .replace(/\\N/gi, "\n") // Correct newline characters
    .replace(/\r/gi, "") // Remove carriage return characters
    .replace(/{\\.*?}/gi, "") // Remove ass/ssa tags
    // Force LTR as the default direction
    .split("\n")
    .map((val) => `\u200E${val}`)
    .join("\n");
  return useHtml ? result.replace(/\n/gi, "<br>") : result;
}

function getDefaultProfile() {
  return getDeviceProfile({});
}

const PRIMARY_TEXT_TRACK_INDEX = 0;
const SECONDARY_TEXT_TRACK_INDEX = 1;

// Plugin type
const PluginType = {
  MediaPlayer: "MediaPlayer",
};

// We will assume playbackManager is passed or set later to avoid circular dependency
let _playbackManager: any = null;

export class HtmlVideoPlayer {
  name: string;
  type = PluginType.MediaPlayer;
  id = "htmlvideoplayer";
  priority = 1;
  isFetching = false;
  #videoDialog: HTMLDivElement | null | undefined;
  #subtitleTrackIndexToSetOnPlaying: number | undefined;
  #secondarySubtitleTrackIndexToSetOnPlaying: number | undefined;
  #audioTrackIndexToSetOnPlaying: number | null | undefined;
  #currentAssRenderer: any | null | undefined;
  #currentPgsRenderer: any | null | undefined;
  #customTrackIndex: number | undefined;
  #customSecondaryTrackIndex: number | undefined;
  #showTrackOffset: boolean | undefined;
  #currentTrackOffset: number | undefined = 0;
  #secondaryTrackOffset: number | undefined = 0;
  #videoSubtitlesElem: HTMLElement | null | undefined;
  #videoSecondarySubtitlesElem: HTMLElement | null | undefined;
  #currentTrackEvents: any | null | undefined;
  #currentSecondaryTrackEvents: any | null | undefined;
  #supportedFeatures: string[] | undefined;
  #mediaElement: HTMLVideoElement | null | undefined;
  #fetchQueue = 0;
  #currentSrc: string | null | undefined;
  #started: boolean | undefined;
  #timeUpdated: boolean | undefined;
  #currentTime: number | null | undefined;

  // Exposed for other files/helpers
  _flvPlayer: any | undefined;
  _hlsPlayer: any | undefined;
  _castPlayer: any | null | undefined;
  _currentPlayOptions: any | undefined;
  _mediaElement: HTMLVideoElement | null | undefined; // public accessor to private field
  _currentSrc: string | null | undefined;
  _currentTime: number | null | undefined;

  #lastProfile: any | undefined;

  isPip: boolean | undefined;
  forcedFullscreen: boolean | undefined;
  _providedMediaElement: HTMLVideoElement | null | undefined;

  constructor() {
    if (browser.edgeUwp) {
      this.name = "Windows Video Player";
    } else {
      this.name = "Html Video Player";
    }
  }

  setMediaElement(element: HTMLVideoElement) {
    this._providedMediaElement = element;
    this.#mediaElement = element;
    this._mediaElement = element;
  }

  // Set the playback manager instance
  setPlaybackManager(pm: any) {
    _playbackManager = pm;
  }

  currentSrc() {
    return this.#currentSrc;
  }

  incrementFetchQueue() {
    if (this.#fetchQueue <= 0) {
      this.isFetching = true;
      Events.trigger(this, "beginFetch");
    }

    this.#fetchQueue++;
  }

  decrementFetchQueue() {
    this.#fetchQueue--;

    if (this.#fetchQueue <= 0) {
      this.isFetching = false;
      Events.trigger(this, "endFetch");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateVideoUrl(streamInfo: any) {
    // Skipping prefetching for now
    return Promise.resolve();
  }

  async play(options: any) {
    this.#started = false;
    this.#timeUpdated = false;

    this.#currentTime = null;

    if (options.resetSubtitleOffset !== false) this.resetSubtitleOffset();

    const elem = await this.createMediaElement(options);
    this.#applyAspectRatio(options.aspectRatio || this.getAspectRatio());

    await this.updateVideoUrl(options);
    return this.setCurrentSrc(elem, options);
  }

  async setCurrentSrc(elem: HTMLVideoElement, options: any) {
    elem.removeEventListener("error", this.onError);

    let val = options.url;
    console.debug(`playing url: ${val}`);

    // Convert to seconds
    const seconds = (options.playerStartPositionTicks || 0) / 10000000;
    if (seconds) {
      val += `#t=${seconds}`;
    }

    destroyHlsPlayer(this);
    destroyFlvPlayer(this);
    destroyCastPlayer(this);

    let secondaryTrackValid = true;

    this.#subtitleTrackIndexToSetOnPlaying =
      options.mediaSource.DefaultSubtitleStreamIndex == null
        ? -1
        : options.mediaSource.DefaultSubtitleStreamIndex;
    if (
      this.#subtitleTrackIndexToSetOnPlaying != null &&
      this.#subtitleTrackIndexToSetOnPlaying >= 0
    ) {
      const initialSubtitleStream =
        options.mediaSource.MediaStreams[
          this.#subtitleTrackIndexToSetOnPlaying
        ];
      if (
        !initialSubtitleStream ||
        initialSubtitleStream.DeliveryMethod === "Encode"
      ) {
        this.#subtitleTrackIndexToSetOnPlaying = -1;
        secondaryTrackValid = false;
      }
      // secondary track should not be shown if primary track is no longer a valid pair
      if (
        initialSubtitleStream &&
        _playbackManager &&
        !_playbackManager.trackHasSecondarySubtitleSupport(
          initialSubtitleStream,
          this
        )
      ) {
        secondaryTrackValid = false;
      }
    } else {
      secondaryTrackValid = false;
    }

    this.#audioTrackIndexToSetOnPlaying =
      options.playMethod === "Transcode"
        ? null
        : options.mediaSource.DefaultAudioStreamIndex;

    this._currentPlayOptions = options;

    if (secondaryTrackValid) {
      this.#secondarySubtitleTrackIndexToSetOnPlaying =
        options.mediaSource.DefaultSecondarySubtitleStreamIndex == null
          ? -1
          : options.mediaSource.DefaultSecondarySubtitleStreamIndex;
      if (
        this.#secondarySubtitleTrackIndexToSetOnPlaying != null &&
        this.#secondarySubtitleTrackIndexToSetOnPlaying >= 0
      ) {
        const initialSecondarySubtitleStream =
          options.mediaSource.MediaStreams[
            this.#secondarySubtitleTrackIndexToSetOnPlaying
          ];
        if (
          !initialSecondarySubtitleStream ||
          (_playbackManager &&
            !_playbackManager.trackHasSecondarySubtitleSupport(
              initialSecondarySubtitleStream,
              this
            ))
        ) {
          this.#secondarySubtitleTrackIndexToSetOnPlaying = -1;
        }
      }
    } else {
      this.#secondarySubtitleTrackIndexToSetOnPlaying = -1;
    }

    const crossOrigin = getCrossOriginValue(options.mediaSource);
    if (crossOrigin) {
      elem.crossOrigin = crossOrigin;
    }

    if (
      enableHlsJsPlayerForCodecs(options.mediaSource, "Video") &&
      isHls(options.mediaSource)
    ) {
      return this.setSrcWithHlsJs(elem, options, val);
    } else {
      elem.autoplay = true;

      return applySrc(elem, val, options).then(() => {
        this.#currentSrc = val;
        this._currentSrc = val;

        return playWithPromise(elem, this.onError);
      });
    }
  }

  setSrcWithHlsJs(elem: HTMLVideoElement, options: any, url: string) {
    return new Promise<void>((resolve, reject) => {
      let maxBufferLength = 30;

      if (
        (browser.chrome || browser.edgeChromium || (browser as any).firefox) &&
        _playbackManager &&
        _playbackManager.getMaxStreamingBitrate(this) >= 25000000
      ) {
        maxBufferLength = 6;
      }

      const hls = new Hls({
        startPosition: options.playerStartPositionTicks / 10000000,
        manifestLoadingTimeOut: 20000,
        maxBufferLength: maxBufferLength,
        maxMaxBufferLength: maxBufferLength,
        videoPreference: { preferHDR: true },
      });
      hls.loadSource(url);
      hls.attachMedia(elem);

      bindEventsToHlsPlayer(this, hls, elem, this.onError, resolve, reject);

      this._hlsPlayer = hls;

      this.#currentSrc = url;
      this._currentSrc = url;
    });
  }

  setSubtitleStreamIndex(index: number) {
    this.setCurrentTrackElement(index, PRIMARY_TEXT_TRACK_INDEX);
  }

  setSecondarySubtitleStreamIndex(index: number) {
    this.setCurrentTrackElement(index, SECONDARY_TEXT_TRACK_INDEX);
  }

  resetSubtitleOffset() {
    this.#currentTrackOffset = 0;
    this.#secondaryTrackOffset = 0;
    this.#showTrackOffset = false;
  }

  enableShowingSubtitleOffset() {
    this.#showTrackOffset = true;
  }

  disableShowingSubtitleOffset() {
    this.#showTrackOffset = false;
  }

  isShowingSubtitleOffsetEnabled() {
    return this.#showTrackOffset;
  }

  getTextTracks() {
    const videoElement = this.#mediaElement;
    if (videoElement) {
      return Array.from(videoElement.textTracks).filter(function (
        trackElement
      ) {
        return trackElement.mode === "showing";
      });
    } else {
      return null;
    }
  }

  setSubtitleOffset = debounce(this._setSubtitleOffset, 100);

  _setSubtitleOffset(offset: string) {
    // Implementation simplified for now
    const offsetValue = parseFloat(offset);
    this.updateCurrentTrackOffset(offsetValue);
  }

  updateCurrentTrackOffset(
    offsetValue: number,
    currentTrackIndex = PRIMARY_TEXT_TRACK_INDEX
  ) {
    let offsetToCompare = this.#currentTrackOffset;
    if (this.isSecondaryTrack(currentTrackIndex)) {
      offsetToCompare = this.#secondaryTrackOffset;
    }

    let relativeOffset = offsetValue;
    const newTrackOffset = offsetValue;

    if (offsetToCompare) {
      relativeOffset -= offsetToCompare;
    }

    if (this.isSecondaryTrack(currentTrackIndex)) {
      this.#secondaryTrackOffset = newTrackOffset;
    } else {
      this.#currentTrackOffset = newTrackOffset;
    }

    return relativeOffset;
  }

  getSubtitleOffset() {
    return this.#currentTrackOffset;
  }

  isPrimaryTrack(textTrackIndex: number) {
    return textTrackIndex === PRIMARY_TEXT_TRACK_INDEX;
  }

  isSecondaryTrack(textTrackIndex: number) {
    return textTrackIndex === SECONDARY_TEXT_TRACK_INDEX;
  }

  isAudioStreamSupported(stream: any, deviceProfile: any, container: string) {
    const codec = (stream.Codec || "").toLowerCase();

    if (!codec) {
      return true;
    }

    if (!deviceProfile) {
      return true;
    }

    const profiles = deviceProfile.DirectPlayProfiles || [];

    return profiles.some(function (p: any) {
      return (
        p.Type === "Video" &&
        includesAny((p.Container || "").toLowerCase(), container) &&
        includesAny((p.AudioCodec || "").toLowerCase(), codec)
      );
    });
  }

  getSupportedAudioStreams() {
    const profile = this.#lastProfile;

    const mediaSource = this._currentPlayOptions.mediaSource;
    const container = mediaSource.Container.toLowerCase();

    return getMediaStreamAudioTracks(mediaSource).filter((stream: any) => {
      return this.isAudioStreamSupported(stream, profile, container);
    });
  }

  setAudioStreamIndex(index: number) {
    const streams = this.getSupportedAudioStreams();

    if (streams.length < 2) {
      return;
    }

    let audioIndex = -1;

    for (const stream of streams) {
      audioIndex++;

      if (stream.Index === index) {
        break;
      }
    }

    if (audioIndex === -1) {
      return;
    }

    const elem = this.#mediaElement;
    if (!elem) {
      return;
    }

    const elemAudioTracks = (elem as any).audioTracks || [];

    for (let i = 0; i < elemAudioTracks.length; i++) {
      const audioTrack = elemAudioTracks[i];
      if (audioIndex === i) {
        audioTrack.enabled = true;
      } else {
        audioTrack.enabled = false;
      }
    }
  }

  stop(destroyPlayer: boolean) {
    const elem = this.#mediaElement;
    const src = this.#currentSrc;

    if (elem) {
      if (src) {
        elem.pause();
      }

      onEndedInternal(this, elem, this.onError);
    }

    this.destroyCustomTrack(elem);

    if (destroyPlayer) {
      this.destroy();
    }

    return Promise.resolve();
  }

  destroy() {
    this.setSubtitleOffset.cancel();

    destroyHlsPlayer(this);
    destroyFlvPlayer(this);

    // setBackdropTransparency(TRANSPARENCY_LEVEL.None);
    document.body.classList.remove("hide-scroll");

    const videoElement = this.#mediaElement;

    if (videoElement) {
      this.#mediaElement = null;
      this._mediaElement = null;

      this.destroyCustomTrack(videoElement);
      videoElement.removeEventListener("timeupdate", this.onTimeUpdate);
      videoElement.removeEventListener("ended", this.onEnded);
      videoElement.removeEventListener("volumechange", this.onVolumeChange);
      videoElement.removeEventListener("pause", this.onPause);
      videoElement.removeEventListener("playing", this.onPlaying);
      videoElement.removeEventListener("play", this.onPlay);
      videoElement.removeEventListener("click", this.onClick);
      videoElement.removeEventListener("dblclick", this.onDblClick);
      videoElement.removeEventListener("waiting", this.onWaiting);
      videoElement.removeEventListener("error", this.onError);

      resetSrc(videoElement);

      if (videoElement.parentNode) {
        videoElement.parentNode.removeChild(videoElement);
      }
    }

    const dlg = this.#videoDialog;
    if (dlg && dlg.parentNode) {
      this.#videoDialog = null;
      dlg.parentNode.removeChild(dlg);
    }

    if (Screenfull.isEnabled) {
      Screenfull.exit();
    }
  }

  onEnded = (e: Event) => {
    const elem = e.target as HTMLMediaElement;
    this.destroyCustomTrack(elem);
    onEndedInternal(this, elem, this.onError);
  };

  onTimeUpdate = (e: Event) => {
    const elem = e.target as HTMLMediaElement;
    const time = elem.currentTime;

    if (time && !this.#timeUpdated) {
      this.#timeUpdated = true;
      this.ensureValidVideo(elem);
    }

    this.#currentTime = time;
    this._currentTime = time;

    const currentPlayOptions = this._currentPlayOptions;
    if (currentPlayOptions) {
      // let timeMs = time * 1000;
      // timeMs += ((currentPlayOptions.transcodingOffsetTicks || 0) / 10000);
      // this.updateSubtitleText(timeMs);
    }

    Events.trigger(this, "timeupdate");
  };

  onVolumeChange = (e: Event) => {
    const elem = e.target as HTMLMediaElement;
    saveVolume(elem.volume);
    Events.trigger(this, "volumechange");
  };

  onNavigatedToOsd = () => {
    const dlg = this.#videoDialog;
    if (dlg) {
      dlg.classList.remove("videoPlayerContainer-onTop");
      this.onStartedAndNavigatedToOsd();
    }
  };

  onStartedAndNavigatedToOsd() {
    if (this.#subtitleTrackIndexToSetOnPlaying != null) {
      this.setCurrentTrackElement(
        this.#subtitleTrackIndexToSetOnPlaying,
        PRIMARY_TEXT_TRACK_INDEX
      );
    }

    if (
      this.#audioTrackIndexToSetOnPlaying != null &&
      this.canSetAudioStreamIndex()
    ) {
      this.setAudioStreamIndex(this.#audioTrackIndexToSetOnPlaying);
    }

    if (
      this.#secondarySubtitleTrackIndexToSetOnPlaying != null &&
      this.#secondarySubtitleTrackIndexToSetOnPlaying >= 0
    ) {
      setTimeout(() => {
        if (this.#secondarySubtitleTrackIndexToSetOnPlaying != null)
          this.setSecondarySubtitleStreamIndex(
            this.#secondarySubtitleTrackIndexToSetOnPlaying
          );
      }, 0);
    }
  }

  onPlaying = (e: Event) => {
    const elem = e.target as HTMLMediaElement;
    if (!this.#started) {
      this.#started = true;
      elem.removeAttribute("controls");

      // loading.hide();

      seekOnPlaybackStart(
        this,
        e.target as HTMLMediaElement,
        this._currentPlayOptions.playerStartPositionTicks,
        () => {
          // Seek ready
        }
      );

      if (this._currentPlayOptions.fullscreen) {
        // appRouter.showVideoOsd().then(this.onNavigatedToOsd);
        this.onNavigatedToOsd(); // Simplify for now
      } else {
        // setBackdropTransparency(TRANSPARENCY_LEVEL.Backdrop);
        if (this.#videoDialog) {
          this.#videoDialog.classList.remove("videoPlayerContainer-onTop");
        }

        this.onStartedAndNavigatedToOsd();
      }
    }
    Events.trigger(this, "playing");
  };

  onPlay = () => {
    Events.trigger(this, "unpause");
  };

  ensureValidVideo(elem: HTMLMediaElement) {
    if (elem !== this.#mediaElement) {
      return;
    }

    if (
      (elem as HTMLVideoElement).videoWidth === 0 &&
      (elem as HTMLVideoElement).videoHeight === 0
    ) {
      const mediaSource = this._currentPlayOptions?.mediaSource;

      if (!mediaSource || mediaSource.RunTimeTicks) {
        onErrorInternal(this, MediaError.NO_MEDIA_ERROR);
      }
    }
  }

  onClick = () => {
    Events.trigger(this, "click");
  };

  onDblClick = () => {
    Events.trigger(this, "dblclick");
  };

  onPause = () => {
    Events.trigger(this, "pause");
  };

  onWaiting = () => {
    Events.trigger(this, "waiting");
  };

  onError = (e: Event) => {
    const elem = e.target as HTMLMediaElement;
    const errorCode = elem.error ? elem.error.code || 0 : 0;
    const errorMessage = elem.error ? elem.error.message || "" : "";
    console.error(`media element error: ${errorCode} ${errorMessage}`);

    let type;

    switch (errorCode) {
      case 1:
        return;
      case 2:
        type = MediaError.NETWORK_ERROR;
        break;
      case 3:
        if (this._hlsPlayer) {
          handleHlsJsMediaError(this);
          return;
        } else {
          type = MediaError.MEDIA_DECODE_ERROR;
        }
        break;
      case 4:
        type = MediaError.MEDIA_NOT_SUPPORTED;
        break;
      default:
        return;
    }

    onErrorInternal(this, type || MediaError.PLAYER_ERROR);
  };

  destroyCustomTrack(
    videoElement: HTMLMediaElement | null | undefined,
    targetTrackIndex?: number
  ) {
    // Simplified destruction
  }

  fetchSubtitles(track: any, item: any) {
    // Placeholder
    return Promise.resolve({ TrackEvents: [] });
  }

  setTrackForDisplay(
    videoElement: HTMLMediaElement | null,
    track: any,
    targetTextTrackIndex = PRIMARY_TEXT_TRACK_INDEX
  ) {
    // Simplified
  }

  setCurrentTrackElement(streamIndex: number, targetTextTrackIndex: number) {
    console.debug(`setting new text track index to: ${streamIndex}`);

    const mediaStreamTextTracks = getMediaStreamTextTracks(
      this._currentPlayOptions.mediaSource
    );

    const track =
      streamIndex === -1
        ? null
        : mediaStreamTextTracks.filter(function (t: any) {
            return t.Index === streamIndex;
          })[0];

    // Simplified logic avoiding ServerConnections
    const isDirectPlay = this._currentPlayOptions.playMethod === "DirectPlay";

    if (isDirectPlay) {
      this.setTrackForDisplay(
        this.#mediaElement || null,
        track,
        targetTextTrackIndex
      );
    } else {
      this.setTrackForDisplay(this.#mediaElement || null, null, -1);
    }
  }

  createMediaElement(options: any): Promise<HTMLVideoElement> {
    if (this._providedMediaElement) {
      const videoElement = this._providedMediaElement;

      // Re-attach listeners if needed, or ensure they are attached
      videoElement.removeEventListener("timeupdate", this.onTimeUpdate);
      videoElement.removeEventListener("ended", this.onEnded);
      videoElement.removeEventListener("volumechange", this.onVolumeChange);
      videoElement.removeEventListener("pause", this.onPause);
      videoElement.removeEventListener("playing", this.onPlaying);
      videoElement.removeEventListener("play", this.onPlay);
      videoElement.removeEventListener("click", this.onClick);
      videoElement.removeEventListener("dblclick", this.onDblClick);
      videoElement.removeEventListener("waiting", this.onWaiting);
      videoElement.removeEventListener("error", this.onError);

      videoElement.volume = getSavedVolume();

      videoElement.addEventListener("timeupdate", this.onTimeUpdate);
      videoElement.addEventListener("ended", this.onEnded);
      videoElement.addEventListener("volumechange", this.onVolumeChange);
      videoElement.addEventListener("pause", this.onPause);
      videoElement.addEventListener("playing", this.onPlaying);
      videoElement.addEventListener("play", this.onPlay);
      videoElement.addEventListener("click", this.onClick);
      videoElement.addEventListener("dblclick", this.onDblClick);
      videoElement.addEventListener("waiting", this.onWaiting);
      if (options.backdropUrl) {
        videoElement.poster = options.backdropUrl;
      }

      this.#mediaElement = videoElement;
      this._mediaElement = videoElement;

      return Promise.resolve(videoElement);
    }

    let dlg = document.querySelector(".videoPlayerContainer") as HTMLDivElement;

    if (!dlg) {
      const playerDlg = document.createElement("div");
      playerDlg.setAttribute("dir", "ltr");
      playerDlg.classList.add("videoPlayerContainer");
      if (options.fullscreen) {
        playerDlg.classList.add("videoPlayerContainer-onTop");
      }

      let html = "";
      const cssClass = "htmlvideoplayer";

      // Assume basic HTML5 support for now
      html +=
        '<video class="' +
        cssClass +
        '" preload="metadata" autoplay="autoplay" controls="controls" webkit-playsinline playsinline>';
      html += "</video>";

      playerDlg.innerHTML = html;
      const videoElement = playerDlg.querySelector("video") as HTMLVideoElement;

      videoElement.volume = getSavedVolume();

      videoElement.addEventListener("timeupdate", this.onTimeUpdate);
      videoElement.addEventListener("ended", this.onEnded);
      videoElement.addEventListener("volumechange", this.onVolumeChange);
      videoElement.addEventListener("pause", this.onPause);
      videoElement.addEventListener("playing", this.onPlaying);
      videoElement.addEventListener("play", this.onPlay);
      videoElement.addEventListener("click", this.onClick);
      videoElement.addEventListener("dblclick", this.onDblClick);
      videoElement.addEventListener("waiting", this.onWaiting);
      if (options.backdropUrl) {
        videoElement.poster = options.backdropUrl;
      }

      document.body.insertBefore(playerDlg, document.body.firstChild);
      this.#videoDialog = playerDlg;
      this.#mediaElement = videoElement;
      this._mediaElement = videoElement;

      if (options.fullscreen) {
        document.body.classList.add("hide-scroll");

        if (
          !browser.slow &&
          browser.supportsCssAnimation &&
          browser.supportsCssAnimation()
        ) {
          return zoomIn(playerDlg).then(() => {
            return videoElement;
          });
        }
      }

      return Promise.resolve(videoElement);
    } else {
      if (options.fullscreen) {
        document.body.classList.add("hide-scroll");
      }

      const videoElement = dlg.querySelector("video") as HTMLVideoElement;
      if (options.backdropUrl) {
        videoElement.poster = options.backdropUrl;
      }

      // Re-assign media element if it was lost
      this.#mediaElement = videoElement;
      this._mediaElement = videoElement;

      return Promise.resolve(videoElement);
    }
  }

  canPlayMediaType(mediaType: string) {
    const type = (mediaType || "").toLowerCase();
    return (
      type === "video" ||
      type === "movie" ||
      type === "episode" ||
      type === "tvchannel"
    );
  }

  supportsPlayMethod(playMethod: string, item: any) {
    return true;
  }

  getDeviceProfile(item: any, options: any) {
    return this.getDeviceProfileInternal(item, options).then((profile) => {
      this.#lastProfile = profile;
      return profile;
    });
  }

  getDeviceProfileInternal(item: any, options: any) {
    return Promise.resolve(getDefaultProfile());
  }

  currentTime(val?: number) {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      if (val != null) {
        mediaElement.currentTime = val / 1000;
        return;
      }

      const currentTime = this.#currentTime;
      if (currentTime) {
        return currentTime * 1000;
      }

      return (mediaElement.currentTime || 0) * 1000;
    }
  }

  duration() {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      const duration = mediaElement.duration;
      if (isValidDuration(duration)) {
        return duration * 1000;
      }
    }

    return null;
  }

  canSetAudioStreamIndex() {
    const video = this.#mediaElement;
    if (video) {
      return canPlaySecondaryAudio(video);
    }

    return false;
  }

  setMute(mute: boolean) {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      mediaElement.muted = mute;
    }
  }

  isMuted() {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      return mediaElement.muted;
    }
    return false;
  }

  #applyAspectRatio(val = this.getAspectRatio()) {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      if (val === "auto") {
        mediaElement.style.removeProperty("object-fit");
      } else {
        mediaElement.style["object-fit" as any] = val;
      }
    }
  }

  setAspectRatio(val: string) {
    appSettings.aspectRatio(val);
    this.#applyAspectRatio(val);
  }

  getAspectRatio() {
    return appSettings.aspectRatio() || "auto";
  }

  pause() {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      mediaElement.pause();
    }
  }

  resume() {
    this.unpause();
  }

  unpause() {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      mediaElement.play();
    }
  }

  paused() {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      return mediaElement.paused;
    }

    return false;
  }

  setPlaybackRate(value: number) {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      mediaElement.playbackRate = value;
    }
  }

  getPlaybackRate() {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      return mediaElement.playbackRate;
    }
    return null;
  }

  setVolume(val: number) {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      mediaElement.volume = Math.pow(val / 100, 3);
    }
  }

  getVolume() {
    const mediaElement = this.#mediaElement;
    if (mediaElement) {
      return Math.min(
        Math.round(Math.pow(mediaElement.volume, 1 / 3) * 100),
        100
      );
    }
  }

  volumeUp() {
    this.setVolume(Math.min((this.getVolume() || 0) + 2, 100));
  }

  volumeDown() {
    this.setVolume(Math.max((this.getVolume() || 0) - 2, 0));
  }
}

export default HtmlVideoPlayer;
