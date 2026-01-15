import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useEffect, useState } from "react";
import { getUserImageUrl, uploadUserImage } from "../../../actions";
import { Upload, X } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // General
  allowRemote: z.boolean().default(true),
  allowManageServer: z.boolean().default(false),
  allowManageCollections: z.boolean().default(false),
  allowEditSubtitles: z.boolean().default(false),
  // Feature Access
  allowLiveTv: z.boolean().default(true),
  allowLiveTvRecording: z.boolean().default(false),
  // Media Playback
  allowPlayback: z.boolean().default(true),
  allowAudioTranscoding: z.boolean().default(true),
  allowVideoTranscoding: z.boolean().default(true),
  allowConversion: z.boolean().default(true),
  forceTranscoding: z.boolean().default(false),
  bitrateLimit: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  // Allow Media Deletion
  allowDeletionFromAll: z.boolean().default(false),
  // Remote Control
  allowRemoteControlUsers: z.boolean().default(false),
  allowRemoteControlDevices: z.boolean().default(true),
  // Other
  isDisabled: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileTab({ user }: { user?: UserDto }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as any,
    defaultValues: {
      name: user?.Name || "",
      allowRemote: true,
      allowManageServer: false,
      allowManageCollections: false,
      allowEditSubtitles: false,
      allowLiveTv: true,
      allowLiveTvRecording: false,
      allowPlayback: true,
      allowAudioTranscoding: true,
      allowVideoTranscoding: true,
      allowConversion: true,
      forceTranscoding: false,
      bitrateLimit: undefined,
      allowDeletionFromAll: false,
      allowRemoteControlUsers: false,
      allowRemoteControlDevices: true,
      isDisabled: false,
    },
  });

  useEffect(() => {
    if (user?.Id) {
      getUserImageUrl(user.Id)
        .then(setAvatarUrl)
        .catch(() => setAvatarUrl(null));

      form.reset({
        name: user.Name || "",
        // In a real app, map other user properties here
        allowRemote: true,
        allowManageServer: false,
        allowManageCollections: false,
        allowEditSubtitles: false,
        allowLiveTv: true,
        allowLiveTvRecording: false,
        allowPlayback: true,
        allowAudioTranscoding: true,
        allowVideoTranscoding: true,
        allowConversion: true,
        forceTranscoding: false,
        bitrateLimit: undefined,
        allowDeletionFromAll: false,
        allowRemoteControlUsers: false,
        allowRemoteControlDevices: true,
        isDisabled: false,
      });
    }
  }, [user, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?.Id) {
      try {
        await uploadUserImage(user.Id, file);
        // Refresh image
        const newUrl = await getUserImageUrl(user.Id);
        setAvatarUrl(`${newUrl}&t=${Date.now()}`);
      } catch (error) {
        console.error("Failed to upload image", error);
      }
    }
  };

  function onSubmit(data: ProfileFormValues) {
    console.log("Submitting form data:", data);
    // TODO: Implement update user API call
  }

  const name = form.watch("name");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full pb-10"
      >
        {/* General Section */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">General</h3>
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            {/* Avatar Picker */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-40 w-40 border-4 border-muted">
                  <AvatarImage
                    src={avatarUrl || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl">
                    {name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer text-white flex flex-col items-center gap-1"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-xs font-medium">Change</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={() => {
                    // TODO: Implement delete image action
                    console.log("Delete image");
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Remove Image
                </Button>
              )}
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control as unknown as any}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="max-w-md" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control as unknown as any}
                  name="allowRemote"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-row items-start gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 px-3 py-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Allow remote connections to this server
                        </FormLabel>
                        <FormDescription>
                          If unchecked, all remote connections will be blocked.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as any}
                  name="allowManageServer"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Allow this user to manage the server
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as any}
                  name="allowManageCollections"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Allow this user to manage collections
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as unknown as any}
                  name="allowEditSubtitles"
                  render={({ field }: { field: any }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Allow this user to edit subtitles
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Access */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">
            Feature access
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField
              control={form.control as unknown as any}
              name="allowLiveTv"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow Live TV access
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="allowLiveTvRecording"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow Live TV recording management
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Media Playback */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">
            Media playback
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField
              control={form.control as unknown as any}
              name="allowPlayback"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow media playback
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="allowAudioTranscoding"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow audio playback that requires transcoding
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="allowVideoTranscoding"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow video playback that requires transcoding
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="allowConversion"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow video playback that requires conversion without
                    re-encoding
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="forceTranscoding"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0 lg:col-span-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Force transcoding of remote media sources such as Live TV
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <p className="text-sm mt-2 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 w-fit">
            Restricting access to transcoding may cause playback failures in
            clients due to unsupported media formats.
          </p>

          <div className="pt-2 max-w-md">
            <FormField
              control={form.control as unknown as any}
              name="bitrateLimit"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Internet streaming bitrate limit (Mbps)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder="Unlimited"
                        value={field.value === undefined ? "" : field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    An optional per-stream bitrate limit for all out of network
                    devices. This is useful to prevent devices from requesting a
                    higher bitrate than your internet connection can handle.
                    This may result in increased CPU load on your server in
                    order to transcode videos on the fly to a lower bitrate.
                  </FormDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    Override the default global value set in server settings,
                    see Dashboard &gt; Playback &gt; Streaming.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Allow Media Deletion */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">
            Allow media deletion from
          </h3>
          <div className="space-y-4">
            <FormField
              control={form.control as unknown as any}
              name="allowDeletionFromAll"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">All libraries</FormLabel>
                </FormItem>
              )}
            />

            {!form.watch("allowDeletionFromAll") && (
              <div className="pl-6 pt-2 text-sm text-muted-foreground">
                {/* Logic to list individual libraries would go here */}
                (Library list would appear here)
              </div>
            )}
          </div>
        </div>

        {/* Remote Control */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">
            Remote Control
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField
              control={form.control as unknown as any}
              name="allowRemoteControlUsers"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow remote control of other users
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as unknown as any}
              name="allowRemoteControlDevices"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Allow remote control of shared devices
                  </FormLabel>
                </FormItem>
              )}
            />

            <p className="text-sm text-muted-foreground lg:col-span-2">
              DLNA devices are considered shared until a user begins controlling
              them.
            </p>
          </div>
        </div>

        {/* Other */}
        <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Other</h3>
          <div className="space-y-4">
            <FormField
              control={form.control as unknown as any}
              name="isDisabled"
              render={({ field }: { field: any }) => (
                <FormItem className="flex flex-row items-start gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 px-3 py-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Disable this user</FormLabel>
                    <FormDescription>
                      The server will not allow any connections from this user.
                      Existing connections will be abruptly ended.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
