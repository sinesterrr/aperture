import { LibraryOptions } from "@jellyfin/sdk/lib/generated-client/models/library-options";
import { AddLibraryFormValues } from "../scheme";

type FetcherSource = {
  Name?: string | null;
  DefaultEnabled?: boolean | null;
};

type FetcherItem = {
  Name: string;
  Enabled: boolean;
};

export const mapFetcherList = (items?: FetcherSource[]) =>
  (items ?? [])
    .filter((item) => item?.Name && item.Name.trim().length > 0)
    .map((item) => {
      const name = item!.Name!.trim();
      return {
        Name: name,
        Enabled: item?.DefaultEnabled ?? false,
        id: name,
      };
    });

const toEnabledNames = (items: FetcherItem[]) =>
  items
    .filter((item) => item.Enabled)
    .map((item) => item.Name.trim())
    .filter(Boolean);

const toAllNames = (items: Array<{ Name: string }>) =>
  items.map((item) => item.Name.trim()).filter(Boolean);

const buildTypeOptions = (data: AddLibraryFormValues) => {
  const typeOptions = [];

  typeOptions.push({
    Type: data.CollectionType === "movies" ? "Movie" : "Series",
    MetadataFetchers: toEnabledNames(data.MetadataFetchers),
    MetadataFetcherOrder: toEnabledNames(data.MetadataFetchers),
    ImageFetchers: toEnabledNames(data.ImageFetchers),
    ImageFetcherOrder: toEnabledNames(data.ImageFetchers),
    ImageOptions: [],
  });

  if (data.CollectionType === "tvshows") {
    typeOptions.push({
      Type: "Season",
      MetadataFetchers: toEnabledNames(data.SeasonMetadataFetchers),
      MetadataFetcherOrder: toEnabledNames(data.SeasonMetadataFetchers),
      ImageFetchers: toEnabledNames(data.SeasonImageFetchers),
      ImageFetcherOrder: toEnabledNames(data.SeasonImageFetchers),
      ImageOptions: [],
    });

    typeOptions.push({
      Type: "Episode",
      MetadataFetchers: toEnabledNames(data.EpisodeMetadataFetchers),
      MetadataFetcherOrder: toEnabledNames(data.EpisodeMetadataFetchers),
      ImageFetchers: toEnabledNames(data.EpisodeImageFetchers),
      ImageFetcherOrder: toEnabledNames(data.EpisodeImageFetchers),
      ImageOptions: [],
    });
  }

  return typeOptions;
};

export const buildLibraryOptions = (
  data: AddLibraryFormValues
): LibraryOptions => ({
  Enabled: data.LibrarySettings.Enabled,
  EnableRealtimeMonitor: data.LibrarySettings.EnableRealtimeMonitor,
  PreferredMetadataLanguage: data.LibrarySettings.PreferredMetadataLanguage,
  MetadataCountryCode: data.LibrarySettings.MetadataCountryCode,
  SeasonZeroDisplayName: data.LibrarySettings.SeasonZeroDisplayName,
  EnableEmbeddedTitles: data.MovieOptions.EnableEmbeddedTitles,
  EnableEmbeddedExtrasTitles: data.MovieOptions.EnableEmbeddedExtrasTitles,
  EnableEmbeddedEpisodeInfos: data.MovieOptions.EnableEmbeddedEpisodeInfos,
  AllowEmbeddedSubtitles: data.MovieOptions.AllowEmbeddedSubtitles as any,
  AutomaticallyAddToCollection: data.MovieOptions.AutomaticallyAddToCollection,
  EnableAutomaticSeriesGrouping: data.MovieOptions.EnableAutomaticSeriesGrouping,
  AutomaticRefreshIntervalDays: Number(
    data.MovieOptions.AutomaticRefreshIntervalDays
  ),
  SaveLocalMetadata: data.SaveLocalMetadata,
  EnableChapterImageExtraction:
    data.ChapterImages.EnableChapterImageExtraction,
  ExtractChapterImagesDuringLibraryScan:
    data.ChapterImages.ExtractChapterImagesDuringLibraryScan,
  EnableTrickplayImageExtraction:
    data.Trickplay.EnableTrickplayImageExtraction,
  ExtractTrickplayImagesDuringLibraryScan:
    data.Trickplay.ExtractTrickplayImagesDuringLibraryScan,
  SaveTrickplayWithMedia: data.Trickplay.SaveTrickplayImagesIntoMediaFolders,
  SubtitleDownloadLanguages: data.SubtitleDownloads.DownloadLanguages,
  RequirePerfectSubtitleMatch:
    data.SubtitleDownloads.RequirePerfectSubtitleMatch,
  SkipSubtitlesIfAudioTrackMatches:
    data.SubtitleDownloads.SkipSubtitlesIfAudioTrackMatches,
  SkipSubtitlesIfEmbeddedSubtitlesPresent:
    data.SubtitleDownloads.SkipSubtitlesIfEmbeddedSubtitlesPresent,
  SaveSubtitlesWithMedia: data.SubtitleDownloads.SaveSubtitlesWithMedia,

  MetadataSavers: toEnabledNames(data.MetadataSavers),
  DisabledLocalMetadataReaders: [],
  LocalMetadataReaderOrder: [],

  DisabledSubtitleFetchers: data.SubtitleDownloads.SubtitleFetchers.filter(
    (s) => !s.Enabled
  )
    .map((s) => s.Name.trim())
    .filter(Boolean),
  SubtitleFetcherOrder: toAllNames(data.SubtitleDownloads.SubtitleFetchers),

  DisabledMediaSegmentProviders: data.MediaSegmentProviders.filter(
    (s) => !s.Enabled
  )
    .map((s) => s.Name.trim())
    .filter(Boolean),
  MediaSegmentProvideOrder: toAllNames(data.MediaSegmentProviders),

  TypeOptions: buildTypeOptions(data),
});
