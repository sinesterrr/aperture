import { useFieldArray, useWatch, UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Badge } from "../../../../components/ui/badge";
import { Checkbox } from "../../../../components/ui/checkbox";
import { FileBrowserDropdown } from "../../../../components/file-browser-dropdown";
import { ReorderableList } from "../../../../components/reorderable-list";
import { Plus, Trash2 } from "lucide-react";
import { CountryInfo, CultureDto } from "@jellyfin/sdk/lib/generated-client/models";
import { AddLibraryFormValues } from "../scheme";

const CONTENT_TYPES = [
  { value: "movies", label: "Movies" },
  { value: "tvshows", label: "Shows" },
];

interface LibraryFormProps {
  form: UseFormReturn<AddLibraryFormValues>;
  cultures: CultureDto[];
  countries: CountryInfo[];
  onSubmit: (data: AddLibraryFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

export function LibraryForm({
  form,
  cultures,
  countries,
  onSubmit,
  onCancel,
  submitLabel = "Add Library",
  cancelLabel = "Cancel",
}: LibraryFormProps) {
  const collectionType = useWatch({
    control: form.control,
    name: "CollectionType",
  });

  const enableEmbeddedTitles = useWatch({
    control: form.control,
    name: "MovieOptions.EnableEmbeddedTitles",
  });

  const {
    fields: pathFields,
    append: appendPath,
    remove: removePath,
  } = useFieldArray({
    control: form.control,
    name: "Paths",
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 pb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              General Info
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground bg-background/50 p-2"
              >
                Beta Feature - may not work as expected
              </Badge>
            </h3>
            <FormField
              control={form.control}
              name="CollectionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The type of content this library will contain.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Movies" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name that will be displayed in the dashboard and apps.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {collectionType && (
            <>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Folders
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPath("")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Folder
                  </Button>
                </div>

                <div className="space-y-4">
                  {pathFields.map((field: any, index: number) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`Paths.${index}`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Folder Path
                          </FormLabel>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <FormControl>
                                <Input
                                  {...inputField}
                                  className="pr-10"
                                  placeholder="/media/movies"
                                />
                              </FormControl>
                              <FileBrowserDropdown
                                ariaLabel="Browse folder path"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onSelect={(value) => inputField.onChange(value)}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePath(index)}
                              disabled={
                                pathFields.length === 1 && index === 0
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  {pathFields.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                      No folders added. Please add at least one folder path.
                    </div>
                  )}
                  {form.formState.errors.Paths &&
                    typeof form.formState.errors.Paths.message === "string" && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.Paths.message}
                      </p>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Specify the folders where your media files are located.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Library Settings
                </h3>

                <FormField
                  control={form.control}
                  name="LibrarySettings.Enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable the library</FormLabel>
                        <FormDescription>
                          Disabling the library will hide it from all user
                          views.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="LibrarySettings.PreferredMetadataLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred download language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cultures.map((culture) => (
                            <SelectItem
                              key={culture.TwoLetterISOLanguageName}
                              value={culture.TwoLetterISOLanguageName || ""}
                            >
                              {culture.DisplayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="LibrarySettings.MetadataCountryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country/Region</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem
                              key={country.TwoLetterISORegionName}
                              value={country.TwoLetterISORegionName || ""}
                            >
                              {country.DisplayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {collectionType === "tvshows" && (
                  <FormField
                    control={form.control}
                    name="LibrarySettings.SeasonZeroDisplayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special season display name</FormLabel>
                        <FormControl>
                          <Input placeholder="Specials" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {(collectionType === "movies" || collectionType === "tvshows") && (
                <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {collectionType === "movies" ? "Movie" : "Series"} Options
                  </h3>

                  <FormField
                    control={form.control}
                    name="MovieOptions.EnableEmbeddedTitles"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Prefer embedded titles over filenames
                          </FormLabel>
                          <FormDescription>
                            Determine the display title to use when no internet
                            metadata or local metadata is available.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {enableEmbeddedTitles && (
                    <FormField
                      control={form.control}
                      name="MovieOptions.EnableEmbeddedExtrasTitles"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Prefer embedded titles over filenames for extras
                            </FormLabel>
                            <FormDescription>
                              Extras often have the same embedded name as the
                              parent, check this to use embedded titles for them
                              anyway.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {collectionType === "tvshows" && enableEmbeddedTitles && (
                    <FormField
                      control={form.control}
                      name="MovieOptions.EnableEmbeddedEpisodeInfos"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Prefer embedded episode information over filenames
                            </FormLabel>
                            <FormDescription>
                              Use the episode information from the embedded
                              metadata if available.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="MovieOptions.AllowEmbeddedSubtitles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Disable different types of embedded subtitles
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AllowAll">Allow All</SelectItem>
                            <SelectItem value="AllowText">
                              Allow Text
                            </SelectItem>
                            <SelectItem value="AllowImage">
                              Allow Image
                            </SelectItem>
                            <SelectItem value="AllowNone">
                              Allow None
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Disable subtitles that are packaged within media
                          containers. Requires a full library refresh.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="LibrarySettings.EnableRealtimeMonitor"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable real time monitoring</FormLabel>
                          <FormDescription>
                            Changes to files will be processed immediately on
                            supported file systems.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="MovieOptions.AutomaticallyAddToCollection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Automatically add to collection</FormLabel>
                          <FormDescription>
                            When at least 2 movies have the same collection
                            name, they will be automatically added to the
                            collection.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Metadata downloaders
                  {collectionType === "tvshows" && " (TV Shows)"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enable and rank your preferred metadata downloaders in order
                  of priority. Lower priority downloaders will only be used to
                  fill in missing information.
                </p>

                <FormField
                  control={form.control}
                  name="MetadataFetchers"
                  render={({ field }) => (
                    <ReorderableList
                      items={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {collectionType === "tvshows" && (
                  <>
                    <h4 className="text-sm font-medium mt-4">
                      Metadata downloaders (Seasons)
                    </h4>
                    <FormField
                      control={form.control}
                      name="SeasonMetadataFetchers"
                      render={({ field }) => (
                        <ReorderableList
                          items={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />

                    <h4 className="text-sm font-medium mt-4">
                      Metadata downloaders (Episodes)
                    </h4>
                    <FormField
                      control={form.control}
                      name="EpisodeMetadataFetchers"
                      render={({ field }) => (
                        <ReorderableList
                          items={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="MovieOptions.AutomaticRefreshIntervalDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Automatically refresh metadata from the internet
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Never</SelectItem>
                          <SelectItem value="30">Every 30 days</SelectItem>
                          <SelectItem value="60">Every 60 days</SelectItem>
                          <SelectItem value="90">Every 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Enabling this option may result in significantly longer
                        library scans.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Metadata savers
                </h3>
                <FormField
                  control={form.control}
                  name="MetadataSavers"
                  render={({ field }) => (
                    <ReorderableList
                      items={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Image fetchers
                  {collectionType === "tvshows" && " (TV Shows)"}
                </h3>
                <FormField
                  control={form.control}
                  name="ImageFetchers"
                  render={({ field }) => (
                    <ReorderableList
                      items={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {collectionType === "tvshows" && (
                  <>
                    <h4 className="text-sm font-medium mt-4">
                      Image fetchers (Seasons)
                    </h4>
                    <FormField
                      control={form.control}
                      name="SeasonImageFetchers"
                      render={({ field }) => (
                        <ReorderableList
                          items={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />

                    <h4 className="text-sm font-medium mt-4">
                      Image fetchers (Episodes)
                    </h4>
                    <FormField
                      control={form.control}
                      name="EpisodeImageFetchers"
                      render={({ field }) => (
                        <ReorderableList
                          items={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="SaveLocalMetadata"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Save artwork into media folders</FormLabel>
                        <FormDescription>
                          Saving artwork into media folders will put them in a
                          place where they can be easily edited.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {collectionType === "tvshows" && (
                  <FormField
                    control={form.control}
                    name="MovieOptions.EnableAutomaticSeriesGrouping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Automatically merge series that are spread across
                            multiple folders
                          </FormLabel>
                          <FormDescription>
                            Series that are spread across multiple folders
                            within this library will be automatically merged
                            into a single series.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Media segment providers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enable and rank your preferred media segment providers in
                  order of priority.
                </p>
                <FormField
                  control={form.control}
                  name="MediaSegmentProviders"
                  render={({ field }) => (
                    <ReorderableList
                      items={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Trickplay
                </h3>

                <FormField
                  control={form.control}
                  name="Trickplay.EnableTrickplayImageExtraction"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable trickplay image extraction</FormLabel>
                        <FormDescription>
                          Trickplay images are similar to chapter images, except
                          they span the entire length of the content and are
                          used to show a preview when scrubbing through videos.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Trickplay.ExtractTrickplayImagesDuringLibraryScan"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Extract trickplay images during the library scan
                        </FormLabel>
                        <FormDescription>
                          Generate trickplay images when videos are imported
                          during the library scan. Otherwise, they will be
                          extracted during the trickplay images scheduled task.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Trickplay.SaveTrickplayImagesIntoMediaFolders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Save trickplay images next to media</FormLabel>
                        <FormDescription>
                          Saving trickplay images into media folders will put
                          them next to your media for easy migration and access.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Chapter Images
                </h3>

                <FormField
                  control={form.control}
                  name="ChapterImages.EnableChapterImageExtraction"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable chapter image extraction</FormLabel>
                        <FormDescription>
                          Extracting chapter images will allow clients to
                          display graphical scene selection menus. The process
                          can be slow and resource intensive.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ChapterImages.ExtractChapterImagesDuringLibraryScan"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Extract chapter images during the library scan
                        </FormLabel>
                        <FormDescription>
                          Generate chapter images when videos are imported
                          during the library scan.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Subtitle Downloads
                </h3>

                <div className="space-y-2">
                  <Label>Download languages</Label>
                  <div className="h-32 border rounded-md p-2 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
                    {cultures.map((culture) => (
                      <FormField
                        key={culture.TwoLetterISOLanguageName}
                        control={form.control}
                        name="SubtitleDownloads.DownloadLanguages"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={culture.TwoLetterISOLanguageName}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    culture.TwoLetterISOLanguageName || ""
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          culture.TwoLetterISOLanguageName,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) =>
                                              value !==
                                              culture.TwoLetterISOLanguageName
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {culture.DisplayName}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="text-sm font-medium mt-4">
                  Subtitle downloaders
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Enable and rank your preferred subtitle downloaders in order
                  of priority.
                </p>
                <FormField
                  control={form.control}
                  name="SubtitleDownloads.SubtitleFetchers"
                  render={({ field }) => (
                    <ReorderableList
                      items={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="SubtitleDownloads.RequirePerfectSubtitleMatch"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Only download subtitles that are a perfect match for
                          video files
                        </FormLabel>
                        <FormDescription>
                          Requiring a perfect match will filter subtitles to
                          include only those that have been tested and verified
                          with your exact video file.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="SubtitleDownloads.SkipSubtitlesIfAudioTrackMatches"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Skip if the default audio track matches the download
                          language
                        </FormLabel>
                        <FormDescription>
                          Uncheck this to ensure all videos have subtitles,
                          regardless of audio language.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="SubtitleDownloads.SkipSubtitlesIfEmbeddedSubtitlesPresent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Skip if the video already contains embedded subtitles
                        </FormLabel>
                        <FormDescription>
                          Keeping text versions of subtitles will result in more
                          efficient delivery and decrease the likelihood of
                          video transcoding.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="SubtitleDownloads.SaveSubtitlesWithMedia"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Save subtitles into media folders</FormLabel>
                        <FormDescription>
                          Storing subtitles next to video files will allow them
                          to be more easily managed.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
