/* eslint-disable @typescript-eslint/no-explicit-any */
import browser from "./browser";
import { appSettings, userSettings } from "./settings";

// Add type definition for webapis
declare const webapis: any;

function canPlayH264(videoTestElement: HTMLVideoElement): boolean {
  return !!videoTestElement
    .canPlayType?.('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
    .replace(/no/, "");
}

function canPlayHevc(
  videoTestElement: HTMLVideoElement,
  options: any
): boolean {
  if (
    browser.tizen ||
    browser.xboxOne ||
    browser.web0s ||
    options.supportsHevc
  ) {
    return true;
  }

  if (browser.ps4) {
    return false;
  }

  // hevc main level 4.0
  return (
    !!videoTestElement.canPlayType &&
    (!!videoTestElement
      .canPlayType('video/mp4; codecs="hvc1.1.L120"')
      .replace(/no/, "") ||
      !!videoTestElement
        .canPlayType('video/mp4; codecs="hev1.1.L120"')
        .replace(/no/, "") ||
      !!videoTestElement
        .canPlayType('video/mp4; codecs="hvc1.1.0.L120"')
        .replace(/no/, "") ||
      !!videoTestElement
        .canPlayType('video/mp4; codecs="hev1.1.0.L120"')
        .replace(/no/, ""))
  );
}

function canPlayAv1(videoTestElement: HTMLVideoElement): boolean {
  if ((browser.tizenVersion || 0) >= 5.5 || (browser.web0sVersion || 0) >= 5) {
    return true;
  }

  // av1 main level 5.3
  return (
    !!videoTestElement.canPlayType &&
    !!videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.15M.08"')
      .replace(/no/, "") &&
    !!videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.15M.10"')
      .replace(/no/, "")
  );
}

let _supportsTextTracks: boolean;
function supportsTextTracks(): boolean {
  if (browser.tizen) {
    return true;
  }

  if (_supportsTextTracks == null) {
    _supportsTextTracks = document.createElement("video").textTracks != null;
  }

  // For now, until ready
  return _supportsTextTracks;
}

let _supportsCanvas2D: boolean;
function supportsCanvas2D(): boolean {
  if (_supportsCanvas2D == null) {
    _supportsCanvas2D =
      document.createElement("canvas").getContext("2d") != null;
  }

  return _supportsCanvas2D;
}

let _canPlayHls: boolean;
function canPlayHls(): boolean {
  if (_canPlayHls == null) {
    _canPlayHls = canPlayNativeHls() || canPlayHlsWithMSE();
  }

  return _canPlayHls;
}

function canPlayNativeHls(): boolean {
  if (browser.tizen) {
    return true;
  }

  const media = document.createElement("video");
  return !!(
    media.canPlayType("application/x-mpegURL").replace(/no/, "") ||
    media.canPlayType("application/vnd.apple.mpegURL").replace(/no/, "")
  );
}

function canPlayNativeHlsInFmp4(): boolean {
  if ((browser.tizenVersion || 0) >= 5 || (browser.web0sVersion || 0) >= 3.5) {
    return true;
  }

  return (
    (browser.iOS && (browser.iOSVersion || 0) >= 11) || browser.osx || false
  );
}

function canPlayHlsWithMSE(): boolean {
  // text tracks don’t work with this in firefox
  return (window as any).MediaSource != null;
}

function supportsAc3(videoTestElement: HTMLVideoElement): boolean {
  if (browser.edgeUwp || browser.tizen || browser.web0s) {
    return true;
  }

  // iPhones 5c and older and old model iPads do not support AC-3/E-AC-3
  // These models can only run iOS 10.x or lower
  if (browser.iOS && (browser.iOSVersion || 0) < 11) {
    return false;
  }

  return !!videoTestElement
    .canPlayType('audio/mp4; codecs="ac-3"')
    .replace(/no/, "");
}

function canPlayDts(videoTestElement: HTMLVideoElement): boolean | null {
  // DTS audio is not supported by Samsung TV 2018+ (Tizen 4.0+) and LG TV 2020-2022 (webOS 5.0, 6.0 and 22) models
  if (
    (browser.tizenVersion || 0) >= 4 ||
    ((browser.web0sVersion || 0) >= 5 && (browser.web0sVersion || 0) < 23)
  ) {
    return false;
  }

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="dts-"')
      .replace(/no/, "") ||
    videoTestElement.canPlayType('video/mp4; codecs="dts+"').replace(/no/, "")
  ) {
    return true;
  }

  return null;
}

function supportsEac3(videoTestElement: HTMLVideoElement): boolean {
  if (browser.tizen || browser.web0s) {
    return true;
  }

  // iPhones 5c and older and old model iPads do not support AC-3/E-AC-3
  // These models can only run iOS 10.x or lower
  if (browser.iOS && (browser.iOSVersion || 0) < 11) {
    return false;
  }

  return !!videoTestElement
    .canPlayType('audio/mp4; codecs="ec-3"')
    .replace(/no/, "");
}

function supportsAc3InHls(videoTestElement: HTMLVideoElement): boolean {
  if (browser.tizen || browser.web0s) {
    return true;
  }

  if (videoTestElement.canPlayType) {
    return (
      !!videoTestElement
        .canPlayType('application/x-mpegurl; codecs="avc1.42E01E, ac-3"')
        .replace(/no/, "") ||
      !!videoTestElement
        .canPlayType(
          'application/vnd.apple.mpegURL; codecs="avc1.42E01E, ac-3"'
        )
        .replace(/no/, "")
    );
  }

  return false;
}

function supportsMp3InHls(videoTestElement: HTMLVideoElement): boolean {
  if (videoTestElement.canPlayType) {
    return (
      !!videoTestElement
        .canPlayType('application/x-mpegurl; codecs="avc1.64001E, mp4a.40.34"')
        .replace(/no/, "") ||
      !!videoTestElement
        .canPlayType(
          'application/vnd.apple.mpegURL; codecs="avc1.64001E, mp4a.40.34"'
        )
        .replace(/no/, "")
    );
  }

  return false;
}

function canPlayAudioFormat(format: string): boolean {
  let typeString;

  if (format === "flac" || format === "asf") {
    if (browser.tizen || browser.web0s || browser.edgeUwp) {
      return true;
    }
  } else if (format === "wma") {
    if (browser.tizen || browser.edgeUwp) {
      return true;
    }
  } else if (format === "opus") {
    if (browser.web0s) {
      // canPlayType lies about OPUS support
      return (browser.web0sVersion || 0) >= 3.5;
    }

    typeString = 'audio/ogg; codecs="opus"';
  } else if (format === "alac") {
    if (browser.iOS || (browser.osx && browser.safari)) {
      return true;
    }
  } else if (format === "mp2") {
    // For now
    return false;
  }

  if (format === "webma") {
    typeString = "audio/webm";
  } else if (format === "mp2") {
    typeString = "audio/mpeg";
  } else if (!typeString) {
    typeString = "audio/" + format;
  }

  return !!document
    .createElement("audio")
    .canPlayType(typeString)
    .replace(/no/, "");
}

function testCanPlayMkv(videoTestElement: HTMLVideoElement): boolean {
  if (browser.vidaa) {
    return false;
  }

  if (browser.tizen || browser.web0s) {
    return true;
  }

  if (browser.firefox) {
    return false;
  }

  if (
    videoTestElement.canPlayType("video/x-matroska").replace(/no/, "") ||
    videoTestElement.canPlayType("video/mkv").replace(/no/, "")
  ) {
    return true;
  }

  if (browser.edgeChromium && (browser as any).windows) {
    return true;
  }

  return !!browser.edgeUwp;
}

function testCanPlayTs(): boolean {
  return !!browser.tizen || !!browser.web0s || !!browser.edgeUwp;
}

function supportsMpeg2Video(): boolean {
  return !!browser.tizen || !!browser.web0s || !!browser.edgeUwp;
}

function supportsVc1(videoTestElement: HTMLVideoElement): boolean {
  return (
    !!browser.tizen ||
    !!browser.web0s ||
    !!browser.edgeUwp ||
    !!videoTestElement.canPlayType('video/mp4; codecs="vc-1"').replace(/no/, "")
  );
}

function supportsHdr10(options: any): boolean {
  return (
    options.supportsHdr10 ??
    (false ||
      browser.vidaa ||
      browser.tizen ||
      browser.web0s ||
      (browser.safari &&
        ((browser.iOS && (browser.iOSVersion || 0) >= 11) || browser.osx)) ||
      (browser.edgeChromium && browser.versionMajor >= 121) ||
      (browser.chrome && !browser.mobile) ||
      (browser.firefox &&
        browser.osx &&
        !browser.iphone &&
        !browser.ipod &&
        !browser.ipad &&
        browser.versionMajor >= 100))
  );
}

function supportsHlg(options: any): boolean {
  return options.supportsHlg ?? supportsHdr10(options);
}

function supportsDolbyVision(options: any): boolean {
  return (
    options.supportsDolbyVision ??
    (false ||
      (browser.safari &&
        ((browser.iOS && (browser.iOSVersion || 0) >= 13) || browser.osx)))
  );
}

function supportedDolbyVisionProfilesHevc(
  videoTestElement: HTMLVideoElement
): number[] {
  if (browser.xboxOne) return [5, 8];

  const supportedProfiles: number[] = [];
  // Profiles 5/8 4k@24fps
  if (videoTestElement.canPlayType) {
    if (
      videoTestElement
        .canPlayType('video/mp4; codecs="dvh1.05.06"')
        .replace(/no/, "")
    ) {
      supportedProfiles.push(5);
    }
    if (
      videoTestElement
        .canPlayType('video/mp4; codecs="dvh1.08.06"')
        .replace(/no/, "") ||
      // LG TVs from at least 2020 onwards should support profile 8, but they don't report it.
      (browser.web0sVersion || 0) >= 4
    ) {
      supportedProfiles.push(8);
    }
  }
  return supportedProfiles;
}

function supportedDolbyVisionProfileAv1(
  videoTestElement: HTMLVideoElement
): string {
  // Profile 10 4k@24fps
  return videoTestElement
    .canPlayType?.('video/mp4; codecs="dav1.10.06"')
    .replace(/no/, "");
}

function getDirectPlayProfileForVideoContainer(
  container: string,
  videoAudioCodecs: string[],
  videoTestElement: HTMLVideoElement,
  options: any
) {
  let supported = false;
  let profileContainer = container;
  const videoCodecs: string[] = [];

  switch (container) {
    case "asf":
    case "wmv":
      supported = !!browser.tizen || !!browser.web0s || !!browser.edgeUwp;
      videoAudioCodecs = [];
      break;
    case "avi":
      supported = !!browser.tizen || !!browser.web0s || !!browser.edgeUwp;
      if ((browser.tizenVersion || 0) >= 4) {
        videoCodecs.push("h264");
        if (canPlayHevc(videoTestElement, options)) {
          videoCodecs.push("hevc");
        }
      }
      break;
    case "mpg":
    case "mpeg":
      supported = !!browser.tizen || !!browser.web0s || !!browser.edgeUwp;
      break;
    case "flv":
      supported = !!browser.tizen;
      break;
    case "3gp":
    case "mts":
    case "trp":
    case "vob":
    case "vro":
      supported = !!browser.tizen;
      break;
    case "mov":
      supported =
        !!browser.safari ||
        !!browser.tizen ||
        !!browser.web0s ||
        !!browser.chrome ||
        !!browser.edgeChromium ||
        !!browser.edgeUwp;
      videoCodecs.push("h264");
      break;
    case "m2ts":
      supported = !!browser.tizen || !!browser.web0s || !!browser.edgeUwp;
      videoCodecs.push("h264");
      if (supportsVc1(videoTestElement)) {
        videoCodecs.push("vc1");
      }
      if (supportsMpeg2Video()) {
        videoCodecs.push("mpeg2video");
      }
      break;
    case "ts":
      supported = testCanPlayTs();
      videoCodecs.push("h264");
      if (
        (browser.tizen || browser.web0s) &&
        canPlayHevc(videoTestElement, options)
      ) {
        videoCodecs.push("hevc");
      }
      if (supportsVc1(videoTestElement)) {
        videoCodecs.push("vc1");
      }
      if (supportsMpeg2Video()) {
        videoCodecs.push("mpeg2video");
      }
      profileContainer = "ts,mpegts";
      break;
    default:
      break;
  }

  return supported
    ? {
        Container: profileContainer,
        Type: "Video",
        VideoCodec: videoCodecs.join(","),
        AudioCodec: videoAudioCodecs.join(","),
      }
    : null;
}

function getMaxBitrate() {
  return 120000000;
}

function getGlobalMaxVideoBitrate() {
  let isTizenFhd = false;
  if (browser.tizen) {
    try {
      const isTizenUhd = webapis.productinfo.isUdPanelSupported();
      isTizenFhd = !isTizenUhd;
      console.debug("isTizenFhd = " + isTizenFhd);
    } catch (error: any) {
      console.error("isUdPanelSupported() error code = " + error.code);
    }
  }

  let bitrate = null;
  if (browser.ps4) {
    bitrate = 8000000;
  } else if (browser.xboxOne) {
    bitrate = 12000000;
  } else if (browser.tizen && isTizenFhd) {
    bitrate = 20000000;
  }

  return bitrate;
}

let maxChannelCount: number | null = null;

function getSpeakerCount() {
  if (maxChannelCount != null) {
    return maxChannelCount;
  }

  maxChannelCount = -1;

  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext || false;

  if (AudioContext) {
    const audioCtx = new AudioContext();
    maxChannelCount = audioCtx.destination.maxChannelCount;
  }

  return maxChannelCount;
}

function getPhysicalAudioChannels(
  options: any,
  videoTestElement: HTMLVideoElement
): number {
  const allowed = parseInt(userSettings.allowedAudioChannels() || "-1", 10);

  if (allowed > 0) {
    return allowed;
  }

  if (options.audioChannels) {
    return options.audioChannels;
  }

  const isSurroundSoundSupportedBrowser =
    browser.safari ||
    browser.chrome ||
    browser.edgeChromium ||
    (browser as any).firefox ||
    browser.tv ||
    browser.ps4 ||
    browser.xboxOne;
  const isAc3Eac3Supported =
    supportsAc3(videoTestElement) || supportsEac3(videoTestElement);
  const speakerCount = getSpeakerCount();

  if (isAc3Eac3Supported && isSurroundSoundSupportedBrowser) {
    return speakerCount > 6 ? speakerCount : 6;
  }

  if (speakerCount > 2) {
    if (isSurroundSoundSupportedBrowser) {
      return speakerCount;
    }

    return 2;
  }

  if (speakerCount > 0) {
    return speakerCount;
  }

  if (isSurroundSoundSupportedBrowser) {
    return 6;
  }

  return 2;
}

export function canPlaySecondaryAudio(videoTestElement: any): boolean {
  return (
    !!videoTestElement.audioTracks &&
    !(browser as any).firefox &&
    (((browser.tizenVersion || 0) >= 5.5 && (browser.tizenVersion || 0) < 8) ||
      !browser.tizen) &&
    ((browser.web0sVersion || 0) >= 4.0 || !browser.web0sVersion)
  );
}

export default function getDeviceProfile(options: any = {}): any {
  const bitrateSetting = getMaxBitrate();

  const videoTestElement = document.createElement("video");

  const physicalAudioChannels = getPhysicalAudioChannels(
    options,
    videoTestElement
  );

  const canPlayVp8 = videoTestElement
    .canPlayType('video/webm; codecs="vp8"')
    .replace(/no/, "");
  const canPlayVp9 = videoTestElement
    .canPlayType('video/webm; codecs="vp9"')
    .replace(/no/, "");
  const safariSupportsOpus =
    browser.safari &&
    browser.versionMajor >= 17 &&
    !!document
      .createElement("audio")
      .canPlayType('audio/x-caf; codecs="opus"')
      .replace(/no/, "");
  const webmAudioCodecs = ["vorbis"];

  const canPlayMkv = testCanPlayMkv(videoTestElement);

  const profile: any = {
    MaxStreamingBitrate: bitrateSetting,
    MaxStaticBitrate: 100000000,
    MusicStreamingTranscodingBitrate: Math.min(bitrateSetting, 384000),
    DirectPlayProfiles: [],
  };

  let videoAudioCodecs: string[] = [];
  let hlsInTsVideoAudioCodecs: string[] = [];
  let hlsInFmp4VideoAudioCodecs: string[] = [];

  const supportsMp3VideoAudio =
    videoTestElement
      .canPlayType('video/mp4; codecs="avc1.640029, mp4a.69"')
      .replace(/no/, "") ||
    videoTestElement
      .canPlayType('video/mp4; codecs="avc1.640029, mp4a.6B"')
      .replace(/no/, "") ||
    videoTestElement
      .canPlayType('video/mp4; codecs="avc1.640029, mp3"')
      .replace(/no/, "");

  let supportsMp2VideoAudio = options.supportsMp2VideoAudio;
  if (supportsMp2VideoAudio == null) {
    supportsMp2VideoAudio = browser.edgeUwp || browser.tizen || browser.web0s;

    if (
      supportsMp3VideoAudio &&
      (browser.chrome ||
        browser.edgeChromium ||
        ((browser as any).firefox && browser.versionMajor >= 83))
    ) {
      supportsMp2VideoAudio = true;
    }
    if ((browser as any).android) {
      supportsMp2VideoAudio = false;
    }
  }

  let maxVideoWidth = browser.xboxOne ? window.screen?.width : null;

  if (options.maxVideoWidth) {
    maxVideoWidth = options.maxVideoWidth;
  }

  const canPlayAacVideoAudio = videoTestElement
    .canPlayType('video/mp4; codecs="avc1.640029, mp4a.40.2"')
    .replace(/no/, "");
  const canPlayMp3VideoAudioInHls = supportsMp3InHls(videoTestElement);
  const canPlayAc3VideoAudio = supportsAc3(videoTestElement);
  const canPlayEac3VideoAudio = supportsEac3(videoTestElement);
  const canPlayAc3VideoAudioInHls = supportsAc3InHls(videoTestElement);

  if (canPlayAacVideoAudio) {
    videoAudioCodecs.push("aac");
    hlsInTsVideoAudioCodecs.push("aac");
    hlsInFmp4VideoAudioCodecs.push("aac");
  }

  if (supportsMp3VideoAudio) {
    videoAudioCodecs.push("mp3");
  }

  if (browser.safari || (supportsMp3VideoAudio && !browser.ps4)) {
    hlsInTsVideoAudioCodecs.push("mp3");
  }

  if (canPlayMp3VideoAudioInHls) {
    hlsInFmp4VideoAudioCodecs.push("mp3");
  }

  if (canPlayAc3VideoAudio) {
    videoAudioCodecs.push("ac3");
    if (browser.edgeChromium) {
      hlsInFmp4VideoAudioCodecs.push("ac3");
    }

    if (canPlayEac3VideoAudio) {
      videoAudioCodecs.push("eac3");
      if (browser.edgeChromium) {
        hlsInFmp4VideoAudioCodecs.push("eac3");
      }
    }

    if (canPlayAc3VideoAudioInHls) {
      hlsInTsVideoAudioCodecs.push("ac3");
      hlsInFmp4VideoAudioCodecs.push("ac3");

      if (canPlayEac3VideoAudio) {
        hlsInTsVideoAudioCodecs.push("eac3");
        hlsInFmp4VideoAudioCodecs.push("eac3");
      }
    }
  }

  if (supportsMp2VideoAudio) {
    videoAudioCodecs.push("mp2");
    hlsInTsVideoAudioCodecs.push("mp2");
    hlsInFmp4VideoAudioCodecs.push("mp2");
  }

  let supportsDts = appSettings.enableDts() || options.supportsDts;
  if (supportsDts == null) {
    supportsDts = canPlayDts(videoTestElement);
  }

  if (supportsDts) {
    videoAudioCodecs.push("dca");
    videoAudioCodecs.push("dts");
  }

  if (browser.tizen || browser.web0s) {
    videoAudioCodecs.push("pcm_s16le");
    videoAudioCodecs.push("pcm_s24le");
  }

  if (appSettings.enableTrueHd() || options.supportsTrueHd) {
    videoAudioCodecs.push("truehd");
  }

  if (browser.tizen) {
    videoAudioCodecs.push("aac_latm");
  }

  if (canPlayAudioFormat("opus")) {
    videoAudioCodecs.push("opus");
    webmAudioCodecs.push("opus");
    if (browser.tizen) {
      hlsInTsVideoAudioCodecs.push("opus");
    }
    hlsInFmp4VideoAudioCodecs.push("opus");
  } else if (safariSupportsOpus) {
    videoAudioCodecs.push("opus");
    webmAudioCodecs.push("opus");
    hlsInFmp4VideoAudioCodecs.push("opus");
  }

  if (canPlayAudioFormat("flac") && !browser.tizen) {
    videoAudioCodecs.push("flac");
    hlsInFmp4VideoAudioCodecs.push("flac");
  }

  if (canPlayAudioFormat("alac")) {
    videoAudioCodecs.push("alac");
    hlsInFmp4VideoAudioCodecs.push("alac");
  }

  videoAudioCodecs = videoAudioCodecs.filter(function (c) {
    return (options.disableVideoAudioCodecs || []).indexOf(c) === -1;
  });

  hlsInTsVideoAudioCodecs = hlsInTsVideoAudioCodecs.filter(function (c) {
    return (options.disableHlsVideoAudioCodecs || []).indexOf(c) === -1;
  });

  hlsInFmp4VideoAudioCodecs = hlsInFmp4VideoAudioCodecs.filter(function (c) {
    return (options.disableHlsVideoAudioCodecs || []).indexOf(c) === -1;
  });

  const mp4VideoCodecs: string[] = [];
  const webmVideoCodecs: string[] = [];
  const hlsInTsVideoCodecs: string[] = [];
  const hlsInFmp4VideoCodecs: string[] = [];

  if (
    canPlayAv1(videoTestElement) &&
    (browser.safari ||
      (!browser.mobile &&
        (browser.edgeChromium ||
          (browser as any).firefox ||
          browser.chrome ||
          browser.opera)))
  ) {
    hlsInFmp4VideoCodecs.push("av1");
  }

  if (
    canPlayHevc(videoTestElement, options) &&
    (browser.edgeChromium ||
      browser.safari ||
      browser.tizen ||
      browser.web0s ||
      (browser.chrome &&
        (!(browser as any).android || browser.versionMajor >= 105)) ||
      (browser.opera && !browser.mobile) ||
      ((browser as any).firefox && browser.versionMajor >= 134))
  ) {
    hlsInFmp4VideoCodecs.push("hevc");
  }

  if (canPlayH264(videoTestElement)) {
    mp4VideoCodecs.push("h264");
    hlsInTsVideoCodecs.push("h264");
    hlsInFmp4VideoCodecs.push("h264");
  }

  if (canPlayHevc(videoTestElement, options)) {
    mp4VideoCodecs.push("hevc");
    if (browser.tizen || browser.web0s || browser.vidaa) {
      hlsInTsVideoCodecs.push("hevc");
    }
  }

  if (supportsMpeg2Video()) {
    mp4VideoCodecs.push("mpeg2video");
  }

  if (supportsVc1(videoTestElement)) {
    mp4VideoCodecs.push("vc1");
  }

  if (browser.tizen) {
    mp4VideoCodecs.push("msmpeg4v2");
  }

  if (canPlayVp8) {
    webmVideoCodecs.push("vp8");
  }

  if (canPlayVp9) {
    if (!browser.iOS && !((browser as any).firefox && browser.osx)) {
      mp4VideoCodecs.push("vp9");
    }
    if (
      browser.safari ||
      browser.edgeChromium ||
      browser.chrome ||
      (browser as any).firefox
    ) {
      hlsInFmp4VideoCodecs.push("vp9");
    }
    if (
      !browser.safari ||
      (browser.safari &&
        browser.versionMajor >= 15 &&
        browser.versionMajor < 17)
    ) {
      webmVideoCodecs.push("vp9");
    }
  }

  if (canPlayAv1(videoTestElement)) {
    mp4VideoCodecs.push("av1");
    if (
      !browser.safari ||
      (browser.safari &&
        browser.versionMajor >= 15 &&
        browser.versionMajor < 17)
    ) {
      webmVideoCodecs.push("av1");
    }
  }

  if ((!browser.safari && canPlayVp8) || browser.tizen) {
    videoAudioCodecs.push("vorbis");
  }

  if (webmVideoCodecs.length) {
    profile.DirectPlayProfiles.push({
      Container: "webm",
      Type: "Video",
      VideoCodec: webmVideoCodecs.join(","),
      AudioCodec: webmAudioCodecs.join(","),
    });
  }

  if (mp4VideoCodecs.length) {
    profile.DirectPlayProfiles.push({
      Container: "mp4,m4v",
      Type: "Video",
      VideoCodec: mp4VideoCodecs.join(","),
      AudioCodec: videoAudioCodecs.join(","),
    });
  }

  if (canPlayMkv && mp4VideoCodecs.length) {
    profile.DirectPlayProfiles.push({
      Container: "mkv",
      Type: "Video",
      VideoCodec: mp4VideoCodecs.join(","),
      AudioCodec: videoAudioCodecs.join(","),
    });
  }

  [
    "m2ts",
    "wmv",
    "ts",
    "asf",
    "avi",
    "mpg",
    "mpeg",
    "flv",
    "3gp",
    "mts",
    "trp",
    "vob",
    "vro",
    "mov",
  ]
    .map(function (container) {
      return getDirectPlayProfileForVideoContainer(
        container,
        videoAudioCodecs,
        videoTestElement,
        options
      );
    })
    .filter(function (i) {
      return i != null;
    })
    .forEach(function (i) {
      profile.DirectPlayProfiles.push(i);
    });

  [
    "opus",
    "mp3",
    "mp2",
    "aac",
    "flac",
    "alac",
    "webma",
    "wma",
    "wav",
    "ogg",
    "oga",
  ]
    .filter(canPlayAudioFormat)
    .forEach(function (audioFormat) {
      if (audioFormat == "mp3" && !canPlayMp3VideoAudioInHls) {
        profile.DirectPlayProfiles.push({
          Container: "ts",
          AudioCodec: "mp3",
          Type: "Audio",
        });
      }

      if (audioFormat === "flac" && appSettings.alwaysRemuxFlac()) {
        profile.DirectPlayProfiles.push({
          Container: "mp4",
          AudioCodec: "flac",
          Type: "Audio",
        });
      } else if (audioFormat !== "mp3" || !appSettings.alwaysRemuxMp3()) {
        profile.DirectPlayProfiles.push({
          Container: audioFormat,
          Type: "Audio",
        });
      }

      if (audioFormat === "opus" || audioFormat === "webma") {
        profile.DirectPlayProfiles.push({
          Container: "webm",
          AudioCodec: audioFormat,
          Type: "Audio",
        });
      }

      if (audioFormat === "aac" || audioFormat === "alac") {
        profile.DirectPlayProfiles.push({
          Container: "m4a",
          AudioCodec: audioFormat,
          Type: "Audio",
        });

        profile.DirectPlayProfiles.push({
          Container: "m4b",
          AudioCodec: audioFormat,
          Type: "Audio",
        });
      }
    });

  if (safariSupportsOpus) {
    profile.DirectPlayProfiles.push({
      Container: "mp4",
      AudioCodec: "opus",
      Type: "Audio",
    });
  }

  profile.TranscodingProfiles = [];

  const hlsBreakOnNonKeyFrames =
    browser.iOS || browser.osx || (browser as any).edge || !canPlayNativeHls();
  let enableFmp4Hls = userSettings.preferFmp4HlsContainer();
  if (
    (browser.safari || browser.tizen || browser.web0s) &&
    !canPlayNativeHlsInFmp4()
  ) {
    enableFmp4Hls = false;
  }

  if (canPlayHls() && (browser as any).enableHlsAudio !== false) {
    profile.TranscodingProfiles.push({
      Container: enableFmp4Hls ? "mp4" : "ts",
      Type: "Audio",
      AudioCodec: "aac",
      Context: "Streaming",
      Protocol: "hls",
      MaxAudioChannels: physicalAudioChannels.toString(),
      MinSegments: browser.iOS || browser.osx ? "2" : "1",
      BreakOnNonKeyFrames: hlsBreakOnNonKeyFrames,
      EnableAudioVbrEncoding: !appSettings.disableVbrAudio(),
    });
  }

  ["aac", "mp3", "opus", "wav"]
    .filter(canPlayAudioFormat)
    .forEach(function (audioFormat) {
      profile.TranscodingProfiles.push({
        Container: audioFormat,
        Type: "Audio",
        AudioCodec: audioFormat,
        Context: "Streaming",
        Protocol: "http",
        MaxAudioChannels: physicalAudioChannels.toString(),
      });
    });

  ["opus", "mp3", "aac", "wav"]
    .filter(canPlayAudioFormat)
    .forEach(function (audioFormat) {
      profile.TranscodingProfiles.push({
        Container: audioFormat,
        Type: "Audio",
        AudioCodec: audioFormat,
        Context: "Static",
        Protocol: "http",
        MaxAudioChannels: physicalAudioChannels.toString(),
      });
    });

  if (canPlayHls() && options.enableHls !== false) {
    const enableLimitedSegmentLength = userSettings.limitSegmentLength();
    if (
      hlsInFmp4VideoCodecs.length &&
      hlsInFmp4VideoAudioCodecs.length &&
      enableFmp4Hls
    ) {
      profile.DirectPlayProfiles.push({
        Container: "hls",
        Type: "Video",
        VideoCodec: hlsInFmp4VideoCodecs.join(","),
        AudioCodec: hlsInFmp4VideoAudioCodecs.join(","),
      });

      profile.TranscodingProfiles.push({
        Container: "mp4",
        Type: "Video",
        AudioCodec: hlsInFmp4VideoAudioCodecs.join(","),
        VideoCodec: hlsInFmp4VideoCodecs.join(","),
        Context: "Streaming",
        Protocol: "hls",
        MaxAudioChannels: physicalAudioChannels.toString(),
        MinSegments: browser.iOS || browser.osx ? "2" : "1",
        BreakOnNonKeyFrames: hlsBreakOnNonKeyFrames,
        SegmentLength: enableLimitedSegmentLength ? 1 : undefined,
      });
    }

    if (hlsInTsVideoCodecs.length && hlsInTsVideoAudioCodecs.length) {
      profile.DirectPlayProfiles.push({
        Container: "hls",
        Type: "Video",
        VideoCodec: hlsInTsVideoCodecs.join(","),
        AudioCodec: hlsInTsVideoAudioCodecs.join(","),
      });

      profile.TranscodingProfiles.push({
        Container: "ts",
        Type: "Video",
        AudioCodec: hlsInTsVideoAudioCodecs.join(","),
        VideoCodec: hlsInTsVideoCodecs.join(","),
        Context: "Streaming",
        Protocol: "hls",
        MaxAudioChannels: physicalAudioChannels.toString(),
        MinSegments: browser.iOS || browser.osx ? "2" : "1",
        BreakOnNonKeyFrames: hlsBreakOnNonKeyFrames,
        SegmentLength: enableLimitedSegmentLength ? 1 : undefined,
      });
    }
  }

  profile.ContainerProfiles = [];

  if ((browser.tizenVersion || 0) < 6.5) {
    profile.ContainerProfiles.push({
      Type: "Video",
      Conditions: [
        {
          Condition: "LessThanEqual",
          Property: "NumStreams",
          Value: "32",
          IsRequired: false,
        },
      ],
    });
  }

  profile.CodecProfiles = [];

  const supportsSecondaryAudio = canPlaySecondaryAudio(videoTestElement);

  const aacCodecProfileConditions = [];

  if (
    !videoTestElement
      .canPlayType('video/mp4; codecs="avc1.640029, mp4a.40.5"')
      .replace(/no/, "")
  ) {
    aacCodecProfileConditions.push({
      Condition: "NotEquals",
      Property: "AudioProfile",
      Value: "HE-AAC",
    });
  }

  if (!supportsSecondaryAudio) {
    aacCodecProfileConditions.push({
      Condition: "Equals",
      Property: "IsSecondaryAudio",
      Value: "false",
      IsRequired: false,
    });
  }

  if (aacCodecProfileConditions.length) {
    profile.CodecProfiles.push({
      Type: "VideoAudio",
      Codec: "aac",
      Conditions: aacCodecProfileConditions,
    });
  }

  const globalAudioCodecProfileConditions = [];
  const globalVideoAudioCodecProfileConditions = [];

  if (parseInt(userSettings.allowedAudioChannels() || "0", 10) > 0) {
    globalAudioCodecProfileConditions.push({
      Condition: "LessThanEqual",
      Property: "AudioChannels",
      Value: physicalAudioChannels.toString(),
      IsRequired: false,
    });

    globalVideoAudioCodecProfileConditions.push({
      Condition: "LessThanEqual",
      Property: "AudioChannels",
      Value: physicalAudioChannels.toString(),
      IsRequired: false,
    });
  }

  if (!supportsSecondaryAudio) {
    globalVideoAudioCodecProfileConditions.push({
      Condition: "Equals",
      Property: "IsSecondaryAudio",
      Value: "false",
      IsRequired: false,
    });
  }

  if (globalAudioCodecProfileConditions.length) {
    profile.CodecProfiles.push({
      Type: "Audio",
      Conditions: globalAudioCodecProfileConditions,
    });
  }

  if (globalVideoAudioCodecProfileConditions.length) {
    profile.CodecProfiles.push({
      Type: "VideoAudio",
      Conditions: globalVideoAudioCodecProfileConditions,
    });
  }

  if (browser.web0s) {
    const flacConditions = [
      {
        Condition: "LessThanEqual",
        Property: "AudioChannels",
        Value: "2",
        IsRequired: false,
      },
    ];

    profile.CodecProfiles.push({
      Type: "VideoAudio",
      Codec: "flac",
      Conditions: flacConditions,
    });

    const flacTranscodingProfiles: any[] = [];

    profile.TranscodingProfiles.forEach((transcodingProfile: any) => {
      if (transcodingProfile.Type !== "Video") return;

      const audioCodecs = transcodingProfile.AudioCodec.split(",");

      if (!audioCodecs.includes("flac")) return;

      const flacTranscodingProfile = { ...transcodingProfile };
      flacTranscodingProfile.AudioCodec = "flac";
      flacTranscodingProfile.ApplyConditions = [
        ...(flacTranscodingProfile.ApplyConditions || []),
        ...flacConditions,
      ];

      flacTranscodingProfiles.push(flacTranscodingProfile);

      transcodingProfile.AudioCodec = audioCodecs
        .filter((codec: string) => codec != "flac")
        .join(",");
    });

    profile.TranscodingProfiles.push(...flacTranscodingProfiles);
  }

  if (safariSupportsOpus) {
    const opusConditions = [
      {
        Condition: "LessThanEqual",
        Property: "AudioChannels",
        Value: "2",
        IsRequired: false,
      },
    ];

    profile.CodecProfiles.push({
      Type: "VideoAudio",
      Codec: "opus",
      Conditions: opusConditions,
    });

    const opusTranscodingProfiles: any[] = [];

    profile.TranscodingProfiles.forEach((transcodingProfile: any) => {
      if (transcodingProfile.Type !== "Video") return;

      const audioCodecs = transcodingProfile.AudioCodec.split(",");

      if (!audioCodecs.includes("opus")) return;

      const opusTranscodingProfile = { ...transcodingProfile };
      opusTranscodingProfile.AudioCodec = "opus";
      opusTranscodingProfile.ApplyConditions = [
        ...(opusTranscodingProfile.ApplyConditions || []),
        ...opusConditions,
      ];

      opusTranscodingProfiles.push(opusTranscodingProfile);

      transcodingProfile.AudioCodec = audioCodecs
        .filter((codec: string) => codec != "opus")
        .join(",");
    });

    profile.TranscodingProfiles.push(...opusTranscodingProfiles);
  }

  let maxH264Level = 42;
  let h264Profiles = "high|main|baseline|constrained baseline";

  if (
    browser.tizen ||
    browser.web0s ||
    videoTestElement
      .canPlayType('video/mp4; codecs="avc1.640833"')
      .replace(/no/, "")
  ) {
    maxH264Level = 51;
  }

  if (
    ((browser.tizenVersion || 0) >= 5 && (window as any).NativeShell) ||
    videoTestElement
      .canPlayType('video/mp4; codecs="avc1.640834"')
      .replace(/no/, "")
  ) {
    maxH264Level = 52;
  }

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="avc1.6e0033"')
      .replace(/no/, "") &&
    !browser.safari &&
    !browser.iOS &&
    !browser.web0s &&
    !(browser as any).edge &&
    !browser.mobile &&
    !browser.tizen
  ) {
    h264Profiles += "|high 10";
  }

  let maxHevcLevel = 120;
  let hevcProfiles = "main";

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="hvc1.1.4.L123"')
      .replace(/no/, "") ||
    videoTestElement
      .canPlayType('video/mp4; codecs="hev1.1.4.L123"')
      .replace(/no/, "")
  ) {
    maxHevcLevel = 123;
  }

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="hvc1.2.4.L123"')
      .replace(/no/, "") ||
    videoTestElement
      .canPlayType('video/mp4; codecs="hev1.2.4.L123"')
      .replace(/no/, "")
  ) {
    maxHevcLevel = 123;
    hevcProfiles = "main|main 10";
  }

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="hvc1.2.4.L153"')
      .replace(/no/, "") ||
    videoTestElement
      .canPlayType('video/mp4; codecs="hev1.2.4.L153"')
      .replace(/no/, "")
  ) {
    maxHevcLevel = 153;
    hevcProfiles = "main|main 10";
  }

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="hvc1.2.4.L183"')
      .replace(/no/, "") ||
    videoTestElement
      .canPlayType('video/mp4; codecs="hev1.2.4.L183"')
      .replace(/no/, "")
  ) {
    maxHevcLevel = 183;
    hevcProfiles = "main|main 10";
  }

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="hvc1.2.4.L186"')
      .replace(/no/, "") ||
    videoTestElement
      .canPlayType('video/mp4; codecs="hev1.2.4.L186"')
      .replace(/no/, "")
  ) {
    maxHevcLevel = 186;
    hevcProfiles = "main|main 10";
  }

  let maxAv1Level = 15; // level 5.3
  const av1Profiles = "main"; // av1 main covers 4:2:0 8 & 10 bits

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.16M.08"')
      .replace(/no/, "") &&
    videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.16M.10"')
      .replace(/no/, "")
  ) {
    maxAv1Level = 16;
  }

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.17M.08"')
      .replace(/no/, "") &&
    videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.17M.10"')
      .replace(/no/, "")
  ) {
    maxAv1Level = 17;
  }

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.18M.08"')
      .replace(/no/, "") &&
    videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.18M.10"')
      .replace(/no/, "")
  ) {
    maxAv1Level = 18;
  }

  if (
    videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.19M.08"')
      .replace(/no/, "") &&
    videoTestElement
      .canPlayType('video/mp4; codecs="av01.0.19M.10"')
      .replace(/no/, "")
  ) {
    maxAv1Level = 19;
  }

  const h264VideoRangeTypes = "SDR";
  let hevcVideoRangeTypes = "SDR";
  let vp9VideoRangeTypes = "SDR";
  let av1VideoRangeTypes = "SDR";

  if ((browser.tizenVersion || 0) >= 3) {
    hevcVideoRangeTypes += "|DOVIWithSDR";
  }

  if (supportsHdr10(options)) {
    hevcVideoRangeTypes += "|HDR10|HDR10Plus";
    vp9VideoRangeTypes += "|HDR10|HDR10Plus";
    av1VideoRangeTypes += "|HDR10|HDR10Plus";

    if ((browser.tizenVersion || 0) >= 3 || browser.vidaa) {
      hevcVideoRangeTypes +=
        "|DOVIWithHDR10|DOVIWithHDR10Plus|DOVIWithEL|DOVIWithELHDR10Plus|DOVIInvalid";
      av1VideoRangeTypes +=
        "|DOVIWithHDR10|DOVIWithHDR10Plus|DOVIWithEL|DOVIWithELHDR10Plus|DOVIInvalid";
    }
  }

  if (supportsHlg(options)) {
    hevcVideoRangeTypes += "|HLG";
    vp9VideoRangeTypes += "|HLG";
    av1VideoRangeTypes += "|HLG";

    if ((browser.tizenVersion || 0) >= 3) {
      hevcVideoRangeTypes += "|DOVIWithHLG";
    }
  }

  if (supportsDolbyVision(options)) {
    const profiles = supportedDolbyVisionProfilesHevc(videoTestElement);
    if (profiles.includes(5)) {
      hevcVideoRangeTypes += "|DOVI";
    }
    if (profiles.includes(8)) {
      hevcVideoRangeTypes +=
        "|DOVIWithHDR10|DOVIWithHLG|DOVIWithSDR|DOVIWithHDR10Plus";
    }

    if (browser.web0s) {
      hevcVideoRangeTypes += "|DOVIWithEL|DOVIWithELHDR10Plus|DOVIInvalid";
    }

    if (supportedDolbyVisionProfileAv1(videoTestElement)) {
      av1VideoRangeTypes +=
        "|DOVI|DOVIWithHDR10|DOVIWithHLG|DOVIWithSDR|DOVIWithHDR10Plus";
      if (browser.web0s) {
        av1VideoRangeTypes += "|DOVIWithEL|DOVIWithELHDR10Plus|DOVIInvalid";
      }
    }
  }

  const h264CodecProfileConditions: any[] = [
    {
      Condition: "NotEquals",
      Property: "IsAnamorphic",
      Value: "true",
      IsRequired: false,
    },
    {
      Condition: "EqualsAny",
      Property: "VideoProfile",
      Value: h264Profiles,
      IsRequired: false,
    },
    {
      Condition: "EqualsAny",
      Property: "VideoRangeType",
      Value: h264VideoRangeTypes,
      IsRequired: false,
    },
    {
      Condition: "LessThanEqual",
      Property: "VideoLevel",
      Value: maxH264Level.toString(),
      IsRequired: false,
    },
  ];

  const hevcCodecProfileConditions: any[] = [
    {
      Condition: "NotEquals",
      Property: "IsAnamorphic",
      Value: "true",
      IsRequired: false,
    },
    {
      Condition: "EqualsAny",
      Property: "VideoProfile",
      Value: hevcProfiles,
      IsRequired: false,
    },
    {
      Condition: "EqualsAny",
      Property: "VideoRangeType",
      Value: hevcVideoRangeTypes,
      IsRequired: false,
    },
    {
      Condition: "LessThanEqual",
      Property: "VideoLevel",
      Value: maxHevcLevel.toString(),
      IsRequired: false,
    },
  ];

  const vp9CodecProfileConditions = [
    {
      Condition: "EqualsAny",
      Property: "VideoRangeType",
      Value: vp9VideoRangeTypes,
      IsRequired: false,
    },
  ];

  const av1CodecProfileConditions = [
    {
      Condition: "NotEquals",
      Property: "IsAnamorphic",
      Value: "true",
      IsRequired: false,
    },
    {
      Condition: "EqualsAny",
      Property: "VideoProfile",
      Value: av1Profiles,
      IsRequired: false,
    },
    {
      Condition: "EqualsAny",
      Property: "VideoRangeType",
      Value: av1VideoRangeTypes,
      IsRequired: false,
    },
    {
      Condition: "LessThanEqual",
      Property: "VideoLevel",
      Value: maxAv1Level.toString(),
      IsRequired: false,
    },
  ];

  if (!browser.edgeUwp && !browser.tizen && !browser.web0s) {
    h264CodecProfileConditions.push({
      Condition: "NotEquals",
      Property: "IsInterlaced",
      Value: "true",
      IsRequired: false,
    });

    hevcCodecProfileConditions.push({
      Condition: "NotEquals",
      Property: "IsInterlaced",
      Value: "true",
      IsRequired: false,
    });
  }

  if (maxVideoWidth) {
    h264CodecProfileConditions.push({
      Condition: "LessThanEqual",
      Property: "Width",
      Value: maxVideoWidth.toString(),
      IsRequired: false,
    });

    hevcCodecProfileConditions.push({
      Condition: "LessThanEqual",
      Property: "Width",
      Value: maxVideoWidth.toString(),
      IsRequired: false,
    });

    av1CodecProfileConditions.push({
      Condition: "LessThanEqual",
      Property: "Width",
      Value: maxVideoWidth.toString(),
      IsRequired: false,
    });
  }

  const globalMaxVideoBitrate = (getGlobalMaxVideoBitrate() || "").toString();

  const h264MaxVideoBitrate = globalMaxVideoBitrate;
  const hevcMaxVideoBitrate = globalMaxVideoBitrate;
  const av1MaxVideoBitrate = globalMaxVideoBitrate;

  if (h264MaxVideoBitrate) {
    h264CodecProfileConditions.push({
      Condition: "LessThanEqual",
      Property: "VideoBitrate",
      Value: h264MaxVideoBitrate,
      IsRequired: true,
    });
  }

  if (hevcMaxVideoBitrate) {
    hevcCodecProfileConditions.push({
      Condition: "LessThanEqual",
      Property: "VideoBitrate",
      Value: hevcMaxVideoBitrate,
      IsRequired: true,
    });
  }

  if (av1MaxVideoBitrate) {
    av1CodecProfileConditions.push({
      Condition: "LessThanEqual",
      Property: "VideoBitrate",
      Value: av1MaxVideoBitrate,
      IsRequired: true,
    });
  }

  if (browser.safari) {
    hevcCodecProfileConditions.push({
      Condition: "EqualsAny",
      Property: "VideoCodecTag",
      Value: "hvc1|dvh1",
      IsRequired: true,
    });

    hevcCodecProfileConditions.push({
      Condition: "LessThanEqual",
      Property: "VideoFramerate",
      Value: "60",
      IsRequired: true,
    });
  }

  if (browser.iOS && (browser.iOSVersion || 0) < 13) {
    const codecProfileTS: any = {
      Type: "Video",
      Codec: "h264",
      Container: "ts",
      Conditions: h264CodecProfileConditions.filter((condition) => {
        return condition.Property !== "VideoLevel";
      }),
    };

    codecProfileTS.Conditions.push({
      Condition: "LessThanEqual",
      Property: "VideoLevel",
      Value: "42",
      IsRequired: false,
    });

    profile.CodecProfiles.push(codecProfileTS);

    const codecProfileMp4: any = {
      Type: "Video",
      Codec: "h264",
      Container: "mp4",
      Conditions: h264CodecProfileConditions.filter((condition) => {
        return condition.Property !== "VideoLevel";
      }),
    };

    codecProfileMp4.Conditions.push({
      Condition: "LessThanEqual",
      Property: "VideoLevel",
      Value: "42",
      IsRequired: false,
    });

    profile.CodecProfiles.push(codecProfileMp4);
  }

  if (browser.safari && appSettings.enableHi10p()) {
    profile.CodecProfiles.push({
      Type: "Video",
      Container: "hls",
      SubContainer: "mp4",
      Codec: "h264",
      Conditions: [
        {
          Condition: "EqualsAny",
          Property: "VideoProfile",
          Value: h264Profiles + "|high 10",
          IsRequired: false,
        },
      ],
    });
  }

  profile.CodecProfiles.push({
    Type: "Video",
    Codec: "h264",
    Conditions: h264CodecProfileConditions,
  });

  if (browser.web0s && supportsDolbyVision(options)) {
    profile.CodecProfiles.push({
      Type: "Video",
      Container: "-mp4,ts",
      Codec: "hevc",
      Conditions: [
        {
          Condition: "EqualsAny",
          Property: "VideoRangeType",
          Value: hevcVideoRangeTypes
            .split("|")
            .filter((v) => !v.startsWith("DOVI"))
            .join("|"),
          IsRequired: false,
        },
      ],
    });
  }

  profile.CodecProfiles.push({
    Type: "Video",
    Codec: "hevc",
    Conditions: hevcCodecProfileConditions,
  });

  profile.CodecProfiles.push({
    Type: "Video",
    Codec: "vp9",
    Conditions: vp9CodecProfileConditions,
  });

  profile.CodecProfiles.push({
    Type: "Video",
    Codec: "av1",
    Conditions: av1CodecProfileConditions,
  });

  const globalVideoConditions = [];

  if (globalMaxVideoBitrate) {
    globalVideoConditions.push({
      Condition: "LessThanEqual",
      Property: "VideoBitrate",
      Value: globalMaxVideoBitrate,
    });
  }

  if (maxVideoWidth) {
    globalVideoConditions.push({
      Condition: "LessThanEqual",
      Property: "Width",
      Value: maxVideoWidth.toString(),
      IsRequired: false,
    });
  }

  if (globalVideoConditions.length) {
    profile.CodecProfiles.push({
      Type: "Video",
      Conditions: globalVideoConditions,
    });
  }

  profile.SubtitleProfiles = [];
  const subtitleBurninSetting = appSettings.get("subtitleburnin");
  const subtitleRenderPgsSetting =
    appSettings.get("subtitlerenderpgs") === "true";
  if (subtitleBurninSetting !== "all") {
    if (supportsTextTracks()) {
      profile.SubtitleProfiles.push({
        Format: "vtt",
        Method: "External",
      });
    }
    if (
      options.enableSsaRender !== false &&
      !options.isRetry &&
      subtitleBurninSetting !== "allcomplexformats"
    ) {
      profile.SubtitleProfiles.push({
        Format: "ass",
        Method: "External",
      });
      profile.SubtitleProfiles.push({
        Format: "ssa",
        Method: "External",
      });
    }

    if (
      supportsCanvas2D() &&
      options.enablePgsRender !== false &&
      !options.isRetry &&
      subtitleRenderPgsSetting &&
      subtitleBurninSetting !== "allcomplexformats" &&
      subtitleBurninSetting !== "onlyimageformats"
    ) {
      profile.SubtitleProfiles.push({
        Format: "pgssub",
        Method: "External",
      });
    }
  }

  profile.ResponseProfiles = [];
  profile.ResponseProfiles.push({
    Type: "Video",
    Container: "m4v",
    MimeType: "video/mp4",
  });

  return profile;
}
