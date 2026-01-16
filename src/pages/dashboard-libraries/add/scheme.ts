import { z } from "zod";

export const addLibraryFormSchema = z.object({
  CollectionType: z.string().min(1, "Please select a content type."),
  Name: z.string().min(1, "Display name is required"),
  Paths: z.array(z.string()).min(1, "At least one folder path is required"),
  LibrarySettings: z.object({
    Enabled: z.boolean().default(true),
    EnableRealtimeMonitor: z.boolean().default(true),
    PreferredMetadataLanguage: z.string().optional(),
    MetadataCountryCode: z.string().optional(),
  }),
  MovieOptions: z.object({
    EnableEmbeddedTitles: z.boolean().default(false),
    EnableEmbeddedExtrasTitles: z.boolean().default(false),
    AllowEmbeddedSubtitles: z
      .enum(["AllowAll", "AllowText", "AllowImage", "AllowNone"])
      .default("AllowAll"),
    AutomaticallyAddToCollection: z.boolean().default(false),
    AutomaticRefreshIntervalDays: z.string().default("0"), // Using string for Select, convert to number on submit
  }),
  // Lists
  MetadataFetchers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(), // for dnd-kit
    })
  ),
  ImageFetchers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  SaveLocalMetadata: z.boolean().default(false),
  MetadataSavers: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  MediaSegmentProviders: z.array(
    z.object({
      Name: z.string(),
      Enabled: z.boolean(),
      id: z.string(),
    })
  ),
  Trickplay: z.object({
    EnableTrickplayImageExtraction: z.boolean().default(false),
    ExtractTrickplayImagesDuringLibraryScan: z.boolean().default(false),
    SaveTrickplayImagesIntoMediaFolders: z.boolean().default(false),
  }),
  ChapterImages: z.object({
    EnableChapterImageExtraction: z.boolean().default(false),
    ExtractChapterImagesDuringLibraryScan: z.boolean().default(false),
  }),
  SubtitleDownloads: z.object({
    DownloadLanguages: z.array(z.string()).default([]),
    SubtitleFetchers: z.array(
      z.object({
        Name: z.string(),
        Enabled: z.boolean(),
        id: z.string(),
      })
    ),
    RequirePerfectSubtitleMatch: z.boolean().default(true),
    SkipSubtitlesIfAudioTrackMatches: z.boolean().default(false),
    SkipSubtitlesIfEmbeddedSubtitlesPresent: z.boolean().default(false),
    SaveSubtitlesWithMedia: z.boolean().default(true),
  }),
});

export type AddLibraryFormValues = z.infer<typeof addLibraryFormSchema>;

export const defaultAddLibraryFormValues: AddLibraryFormValues = {
  CollectionType: "",
  Name: "",
  Paths: [],
  LibrarySettings: {
    Enabled: true,
    EnableRealtimeMonitor: true,
    PreferredMetadataLanguage: undefined,
    MetadataCountryCode: undefined,
  },
  MovieOptions: {
    EnableEmbeddedTitles: false,
    EnableEmbeddedExtrasTitles: false,
    AllowEmbeddedSubtitles: "AllowAll",
    AutomaticallyAddToCollection: false,
    AutomaticRefreshIntervalDays: "0",
  },
  MetadataFetchers: [],
  ImageFetchers: [],
  SaveLocalMetadata: false,
  MetadataSavers: [],
  MediaSegmentProviders: [],
  Trickplay: {
    EnableTrickplayImageExtraction: false,
    ExtractTrickplayImagesDuringLibraryScan: false,
    SaveTrickplayImagesIntoMediaFolders: false,
  },
  ChapterImages: {
    EnableChapterImageExtraction: false,
    ExtractChapterImagesDuringLibraryScan: false,
  },
  SubtitleDownloads: {
    DownloadLanguages: [],
    SubtitleFetchers: [],
    RequirePerfectSubtitleMatch: true,
    SkipSubtitlesIfAudioTrackMatches: false,
    SkipSubtitlesIfEmbeddedSubtitlesPresent: false,
    SaveSubtitlesWithMedia: true,
  },
};
