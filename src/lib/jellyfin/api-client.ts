/* eslint-disable @typescript-eslint/no-explicit-any */
import { Jellyfin } from "@jellyfin/sdk";
import { getItemsApi } from "@jellyfin/sdk/lib/utils/api/items-api";
import { getMediaInfoApi } from "@jellyfin/sdk/lib/utils/api/media-info-api";
import { getTvShowsApi } from "@jellyfin/sdk/lib/utils/api/tv-shows-api";
import { getVideosApi } from "@jellyfin/sdk/lib/utils/api/videos-api";
import { getSessionApi } from "@jellyfin/sdk/lib/utils/api/session-api";
import { getSystemApi } from "@jellyfin/sdk/lib/utils/api/system-api";
import { getUserViewsApi } from "@jellyfin/sdk/lib/utils/api/user-views-api";
import { getPlaystateApi } from "@jellyfin/sdk/lib/utils/api/playstate-api";

export class ApiClient {
  private sdk: Jellyfin;
  private api: any;
  private serverUrl: string;
  private token: string;
  private userId: string;
  private _deviceId: string;

  constructor(
    serverUrl: string,
    token: string,
    userId: string,
    deviceId: string
  ) {
    this.serverUrl = serverUrl;
    this.token = token;
    this.userId = userId;
    this._deviceId = deviceId;

    this.sdk = new Jellyfin({
      clientInfo: {
        name: "Aperture",
        version: "1.0.0",
      },
      deviceInfo: {
        name: "Web Client",
        id: deviceId,
      },
    });

    this.api = this.sdk.createApi(serverUrl);
    this.api.accessToken = token;
  }

  getCurrentUserId() {
    return this.userId;
  }

  deviceId() {
    return this._deviceId;
  }

  accessToken() {
    return this.token;
  }

  serverId() {
    // Assuming single server for now
    return "server";
  }

  getUrl(url: string, query?: any) {
    let fullUrl = this.serverUrl;
    if (fullUrl.endsWith("/"))
      fullUrl = fullUrl.substring(0, fullUrl.length - 1);
    if (!url.startsWith("/")) url = "/" + url;
    fullUrl += url;

    if (query) {
      const params = new URLSearchParams();
      Object.keys(query).forEach((key) => {
        if (query[key] != null) {
          params.append(key, query[key]);
        }
      });
      if (fullUrl.includes("?")) {
        fullUrl += "&" + params.toString();
      } else {
        fullUrl += "?" + params.toString();
      }
    }
    return fullUrl;
  }

  async getItems(userId: string, query: any) {
    const itemsApi = getItemsApi(this.api);
    const response = await itemsApi.getItems({ userId, ...query });
    return response.data;
  }

  async getItem(userId: string, itemId: string) {
    const itemsApi = getItemsApi(this.api);
    const response = await itemsApi.getItems({ userId, ids: [itemId] });
    return response.data.Items?.[0];
  }

  async getPostedPlaybackInfo(itemId: string, query: any) {
    const mediaInfoApi = getMediaInfoApi(this.api);
    const response = await mediaInfoApi.getPostedPlaybackInfo({
      itemId,
      playbackInfoDto: query,
    });
    return response.data;
  }

  async getEpisodes(seriesId: string, query: any) {
    const tvShowsApi = getTvShowsApi(this.api);
    const response = await tvShowsApi.getEpisodes({ seriesId, ...query });
    return response.data;
  }

  async getNextUpEpisodes(query: any) {
    const tvShowsApi = getTvShowsApi(this.api);
    const response = await tvShowsApi.getNextUp({ ...query });
    return response.data;
  }

  async getAdditionalVideoParts(userId: string, itemId: string) {
    const videosApi = getVideosApi(this.api);
    const response = await videosApi.getAdditionalPart({ userId, itemId });
    return response.data;
  }

  async getIntros(itemId: string) {
    // Not implemented in SDK?
    return { Items: [] };
  }

  async getEndpointInfo() {
    return { IsInNetwork: true, IsLocal: true };
  }

  async detectBitrate(expand?: boolean) {
    return 100000000; // Mock high bitrate
  }

  async stopActiveEncodings(playSessionId: string) {
    const sessionApi = getSessionApi(this.api);
    // Not straightforward in SDK, mostly fire and forget
    return Promise.resolve();
  }

  async getLiveStreamMediaInfo(liveStreamId: string) {
    // Not implemented
    return Promise.reject();
  }

  async getLocalTrailers(userId: string, itemId: string) {
    const itemsApi = getItemsApi(this.api);
    // SDK doesn't have specific getLocalTrailers, maybe normal items query
    return [];
  }

  async getInstantMixFromItem(itemId: string, options: any) {
    // The Jellyfin SDK does not have getInstantMixFromItem on ItemsApi,
    // so use fetch directly
    const url = `${this.api.basePath}/Items/${itemId}/InstantMix`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Emby-Token": this.token,
      },
      // options could include extra query params, handle if needed
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch Instant Mix: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  async reportPlaybackStart(info: any) {
    const playStateApi = getPlaystateApi(this.api);
    return playStateApi.reportPlaybackStart({ playbackStartInfo: info });
  }

  async reportPlaybackProgress(info: any) {
    const playStateApi = getPlaystateApi(this.api);
    return playStateApi.reportPlaybackProgress({ playbackProgressInfo: info });
  }

  async reportPlaybackStopped(info: any) {
    const playStateApi = getPlaystateApi(this.api);
    return playStateApi.reportPlaybackStopped({ playbackStopInfo: info });
  }

  async getUser(userId: string) {
    // Mock user config
    return {
      Configuration: {
        EnableNextEpisodeAutoPlay: true,
        RememberAudioSelections: true,
        RememberSubtitleSelections: true,
      },
    };
  }

  // Add ajax method for generic requests if needed
  async ajax(options: any) {
    // Basic fetch wrapper
    const response = await fetch(options.url, {
      method: options.type || "GET",
      headers: {
        "Content-Type": options.contentType || "application/json",
        "X-Emby-Token": this.token,
      },
      body: options.data,
    });
    return response.json();
  }
}
