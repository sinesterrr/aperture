import browser from "./browser";
import Events from "./events";

function toBoolean(val: any, defaultValue: boolean): boolean {
  if (val === null || val === undefined) {
    return defaultValue;
  }
  return val === true || val === "true";
}

class AppSettings {
  #getKey(name: string, userId?: string) {
    if (userId) {
      name = userId + "-" + name;
    }

    return name;
  }

  enableAutoLogin(val?: boolean) {
    if (val !== undefined) {
      this.set("enableAutoLogin", val.toString());
    }

    return toBoolean(this.get("enableAutoLogin"), true);
  }

  enableGamepad(val?: boolean) {
    if (val !== undefined) {
      return this.set("enableGamepad", val.toString());
    }

    return toBoolean(this.get("enableGamepad"), false);
  }

  enableSmoothScroll(val?: boolean) {
    if (val !== undefined) {
      return this.set("enableSmoothScroll", val.toString());
    }

    return toBoolean(this.get("enableSmoothScroll"), !!browser.tizen);
  }

  enableSystemExternalPlayers(val?: boolean) {
    if (val !== undefined) {
      this.set("enableSystemExternalPlayers", val.toString());
    }

    return toBoolean(this.get("enableSystemExternalPlayers"), false);
  }

  enableAutomaticBitrateDetection(
    isInNetwork: boolean,
    mediaType: string,
    val?: boolean
  ) {
    const key = "enableautobitratebitrate-" + mediaType + "-" + isInNetwork;
    if (val !== undefined) {
      if (isInNetwork && mediaType === "Audio") {
        val = true;
      }

      this.set(key, val.toString());
    }

    if (isInNetwork && mediaType === "Audio") {
      return true;
    } else {
      return toBoolean(this.get(key), true);
    }
  }

  maxStreamingBitrate(isInNetwork: boolean, mediaType: string, val?: string) {
    const key = "maxbitrate-" + mediaType + "-" + isInNetwork;
    if (val !== undefined) {
      if (isInNetwork && mediaType === "Audio") {
        //  nothing to do, this is always a max value
      } else {
        this.set(key, val);
      }
    }

    if (isInNetwork && mediaType === "Audio") {
      // return a huge number so that it always direct plays
      return 150000000;
    } else {
      // Check aperture setting first
      const apertureBitrate = localStorage.getItem("aperture-video-bitrate");
      if (apertureBitrate && apertureBitrate !== "auto") {
        // Retrieve bitrate value from BITRATE_OPTIONS based on value
        // Since BITRATE_OPTIONS is not imported here to avoid circular deps or context issues,
        // we map the known string values from SettingsContext:
        // "20000" -> 20000000
        // "8000" -> 8000000
        // ...
        // Actually, the 'value' stored in aperture-video-bitrate is like "20000", which corresponds to kbps in the label,
        // but the 'bitrate' property in BITRATE_OPTIONS is the actual bits per second.
        // Let's reverse engineer or just use the logic: value * 1000 seems to be the pattern for 4000->4000000.
        // Wait, 20000 * 1000 = 20,000,000. Correct.
        // 1000 * 1000 = 1,000,000. Correct.

        return parseInt(apertureBitrate, 10) * 1000;
      }

      return parseInt(this.get(key) || "0", 10) || 1500000;
    }
  }

  maxStaticMusicBitrate(val?: string) {
    if (val !== undefined) {
      this.set("maxStaticMusicBitrate", val);
    }

    const defaultValue = 320000;
    return (
      parseInt(
        this.get("maxStaticMusicBitrate") || defaultValue.toString(),
        10
      ) || defaultValue
    );
  }

  maxChromecastBitrate(val?: string) {
    if (val !== undefined) {
      this.set("chromecastBitrate1", val);
    }

    const chromecastBitrate1 = this.get("chromecastBitrate1") ?? undefined;
    return chromecastBitrate1 !== undefined
      ? parseInt(chromecastBitrate1, 10)
      : null;
  }

  maxVideoWidth(val?: number) {
    if (val !== undefined) {
      return this.set("maxVideoWidth", val.toString());
    }

    return parseInt(this.get("maxVideoWidth") || "0", 10) || 0;
  }

  limitSupportedVideoResolution(val?: boolean) {
    if (val !== undefined) {
      return this.set("limitSupportedVideoResolution", val.toString());
    }

    return toBoolean(this.get("limitSupportedVideoResolution"), false);
  }

  preferredTranscodeVideoCodec(val?: string) {
    if (val !== undefined) {
      return this.set("preferredTranscodeVideoCodec", val);
    }
    return this.get("preferredTranscodeVideoCodec") || "";
  }

  preferredTranscodeVideoAudioCodec(val?: string) {
    if (val !== undefined) {
      return this.set("preferredTranscodeVideoAudioCodec", val);
    }
    return this.get("preferredTranscodeVideoAudioCodec") || "";
  }

  alwaysBurnInSubtitleWhenTranscoding(val?: boolean) {
    if (val !== undefined) {
      return this.set("alwaysBurnInSubtitleWhenTranscoding", val.toString());
    }

    return toBoolean(this.get("alwaysBurnInSubtitleWhenTranscoding"), false);
  }

  enableDts(val?: boolean) {
    if (val !== undefined) {
      return this.set("enableDts", val.toString());
    }

    return toBoolean(this.get("enableDts"), false);
  }

  enableTrueHd(val?: boolean) {
    if (val !== undefined) {
      return this.set("enableTrueHd", val.toString());
    }

    return toBoolean(this.get("enableTrueHd"), false);
  }

  enableHi10p(val?: boolean) {
    if (val !== undefined) {
      return this.set("enableHi10p", val.toString());
    }

    return toBoolean(this.get("enableHi10p"), false);
  }

  disableVbrAudio(val?: boolean) {
    if (val !== undefined) {
      return this.set("disableVbrAudio", val.toString());
    }

    return toBoolean(this.get("disableVbrAudio"), false);
  }

  alwaysRemuxFlac(val?: boolean) {
    if (val !== undefined) {
      return this.set("alwaysRemuxFlac", val.toString());
    }

    return toBoolean(this.get("alwaysRemuxFlac"), false);
  }

  alwaysRemuxMp3(val?: boolean) {
    if (val !== undefined) {
      return this.set("alwaysRemuxMp3", val.toString());
    }

    return toBoolean(this.get("alwaysRemuxMp3"), false);
  }

  aspectRatio(val?: string) {
    if (val !== undefined) {
      return this.set("aspectRatio", val);
    }

    return this.get("aspectRatio") || "";
  }

  set(name: string, value: string, userId?: string) {
    const currentValue = this.get(name, userId);
    localStorage.setItem(this.#getKey(name, userId), value);

    if (currentValue !== value) {
      Events.trigger(this, "change", [name]);
    }
  }

  get(name: string, userId?: string) {
    return localStorage.getItem(this.#getKey(name, userId));
  }
}

export const appSettings = new AppSettings();

// User Settings functionality (simplified)
export class UserSettings {
  currentUserId: string | null = null;
  currentApiClient: any = null;
  displayPrefs: any = null;
  saveTimeout: any = null;

  setUserInfo(userId: string | null, apiClient: any) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.currentUserId = userId;
    this.currentApiClient = apiClient;

    if (!userId) {
      this.displayPrefs = null;
      return Promise.resolve();
    }

    // Mock for now or implement if needed
    return Promise.resolve();
  }

  // Simplified get/set that proxies to appSettings for now or simplified implementation
  // The original UserSettings does complex syncing with server, which we might want later
  // For playback logic, we mostly read from appSettings or direct prefs

  allowedAudioChannels(val?: string) {
    if (val !== undefined) {
      return this.set("allowedAudioChannels", val, false);
    }
    return this.get("allowedAudioChannels", false) || "-1";
  }

  preferFmp4HlsContainer(val?: boolean) {
    if (val !== undefined) {
      return this.set("preferFmp4HlsContainer", val.toString(), false);
    }
    // Enable it by default only for the platforms that play fMP4 for sure.
    return toBoolean(
      this.get("preferFmp4HlsContainer", false),
      browser.safari ||
        browser.firefox ||
        !!browser.chrome ||
        browser.edgeChromium ||
        false
    );
  }

  limitSegmentLength(val?: boolean) {
    if (val !== undefined) {
      return this.set("limitSegmentLength", val.toString(), false);
    }
    return toBoolean(this.get("limitSegmentLength", false), false);
  }

  enableCinemaMode(val?: boolean) {
    if (val !== undefined) {
      return this.set("enableCinemaMode", val.toString(), false);
    }
    return toBoolean(this.get("enableCinemaMode", false), true);
  }

  selectAudioNormalization(val?: string) {
    if (val !== undefined) {
      return this.set("selectAudioNormalization", val, false);
    }
    return this.get("selectAudioNormalization", false) || "TrackGain";
  }

  enableNextVideoInfoOverlay(val?: boolean) {
    if (val !== undefined) {
      return this.set("enableNextVideoInfoOverlay", val.toString());
    }
    return toBoolean(this.get("enableNextVideoInfoOverlay", false), true);
  }

  enableVideoRemainingTime(val?: boolean) {
    if (val !== undefined) {
      return this.set("enableVideoRemainingTime", val.toString());
    }
    return toBoolean(this.get("enableVideoRemainingTime", false), true);
  }

  getSubtitleAppearanceSettings(key?: string) {
    key = key || "localplayersubtitleappearance3";
    return Object.assign(
      { verticalPosition: -3 },
      JSON.parse(this.get(key, false) || "{}")
    );
  }

  setSubtitleAppearanceSettings(value: any, key?: string) {
    key = key || "localplayersubtitleappearance3";
    return this.set(key, JSON.stringify(value), false);
  }

  set(name: string, value: string | null, enableOnServer?: boolean) {
    // Simplified set that delegates to appSettings for local storage
    const userId = this.currentUserId;
    const result = appSettings.set(name, value || "", userId || undefined);
    return result;
  }

  get(name: string, enableOnServer?: boolean): string | null {
    // Simplified get that delegates to appSettings
    const userId = this.currentUserId;
    return appSettings.get(name, userId || undefined);
  }
}

export const userSettings = new UserSettings();
