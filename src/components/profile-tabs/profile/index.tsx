import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  UserDto,
  BaseItemDto,
} from "@jellyfin/sdk/lib/generated-client/models";
import { useEffect, useState } from "react";
import {
  getUserImageUrl,
  uploadUserImage,
  fetchMediaFolders,
} from "../../../actions";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { profileFormSchema, ProfileFormValues } from "./schema";
import { GeneralSection } from "./general-section";
import { FeatureAccessSection } from "./feature-access-section";
import { MediaPlaybackSection } from "./media-playback-section";
import { MediaDeletionSection } from "./media-deletion-section";
import { RemoteControlSection } from "./remote-control-section";
import { OtherSection } from "./other-section";

export default function ProfileTab({ user }: { user?: UserDto }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [libraries, setLibraries] = useState<BaseItemDto[]>([]);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(true);

  useEffect(() => {
    fetchMediaFolders()
      .then((libs) => {
        setLibraries(libs);
      })
      .catch((err) => {
        console.error("Failed to fetch media folders:", err);
      })
      .finally(() => setIsLoadingLibraries(false));
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as any,
    defaultValues: {
      Name: user?.Name || "",
      EnableRemoteAccess: user?.Policy?.EnableRemoteAccess ?? true,
      IsAdministrator: user?.Policy?.IsAdministrator ?? false,
      EnableCollectionManagement:
        user?.Policy?.EnableCollectionManagement ?? false,
      EnableSubtitleManagement: user?.Policy?.EnableSubtitleManagement ?? false,
      EnableLiveTvAccess: user?.Policy?.EnableLiveTvAccess ?? true,
      EnableLiveTvManagement: user?.Policy?.EnableLiveTvManagement ?? false,
      EnableMediaPlayback: user?.Policy?.EnableMediaPlayback ?? true,
      EnableAudioPlaybackTranscoding:
        user?.Policy?.EnableAudioPlaybackTranscoding ?? true,
      EnableVideoPlaybackTranscoding:
        user?.Policy?.EnableVideoPlaybackTranscoding ?? true,
      EnablePlaybackRemuxing: user?.Policy?.EnablePlaybackRemuxing ?? true,
      ForceRemoteSourceTranscoding:
        user?.Policy?.ForceRemoteSourceTranscoding ?? false,
      RemoteClientBitrateLimit: user?.Policy?.RemoteClientBitrateLimit
        ? user.Policy.RemoteClientBitrateLimit / 1000000
        : undefined,
      EnableContentDeletion: user?.Policy?.EnableContentDeletion ?? false,
      EnableContentDeletionFromFolders:
        user?.Policy?.EnableContentDeletionFromFolders || [],
      EnableRemoteControlOfOtherUsers:
        user?.Policy?.EnableRemoteControlOfOtherUsers ?? false,
      EnableSharedDeviceControl:
        user?.Policy?.EnableSharedDeviceControl ?? true,
      IsDisabled: user?.Policy?.IsDisabled ?? false,
    },
  });

  useEffect(() => {
    if (user?.Id) {
      getUserImageUrl(user.Id)
        .then(setAvatarUrl)
        .catch(() => setAvatarUrl(null));

      // Only reset form when user ID changes (i.e. different user loaded)
      // to prevent overwriting local state on re-renders
      if (form.getValues("Name") === "") {
        form.reset({
          Name: user.Name || "",
          EnableRemoteAccess: user.Policy?.EnableRemoteAccess ?? true,
          IsAdministrator: user.Policy?.IsAdministrator ?? false,
          EnableCollectionManagement:
            user.Policy?.EnableCollectionManagement ?? false,
          EnableSubtitleManagement:
            user.Policy?.EnableSubtitleManagement ?? false,
          EnableLiveTvAccess: user.Policy?.EnableLiveTvAccess ?? true,
          EnableLiveTvManagement: user.Policy?.EnableLiveTvManagement ?? false,
          EnableMediaPlayback: user.Policy?.EnableMediaPlayback ?? true,
          EnableAudioPlaybackTranscoding:
            user.Policy?.EnableAudioPlaybackTranscoding ?? true,
          EnableVideoPlaybackTranscoding:
            user.Policy?.EnableVideoPlaybackTranscoding ?? true,
          EnablePlaybackRemuxing: user.Policy?.EnablePlaybackRemuxing ?? true,
          ForceRemoteSourceTranscoding:
            user.Policy?.ForceRemoteSourceTranscoding ?? false,
          RemoteClientBitrateLimit: user.Policy?.RemoteClientBitrateLimit
            ? user.Policy.RemoteClientBitrateLimit / 1000000 // Convert back to Mbps
            : undefined,
          EnableContentDeletion: user.Policy?.EnableContentDeletion ?? false,
          EnableContentDeletionFromFolders:
            user.Policy?.EnableContentDeletionFromFolders || [],
          EnableRemoteControlOfOtherUsers:
            user.Policy?.EnableRemoteControlOfOtherUsers ?? false,
          EnableSharedDeviceControl:
            user.Policy?.EnableSharedDeviceControl ?? true,
          IsDisabled: user.Policy?.IsDisabled ?? false,
        });
      }
    }
  }, [user?.Id, form]); // Only depend on ID, not full object

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full pb-10"
      >
        <GeneralSection
          avatarUrl={avatarUrl}
          handleImageUpload={handleImageUpload}
        />
        <FeatureAccessSection />
        <MediaPlaybackSection />
        <MediaDeletionSection
          libraries={libraries}
          isLoadingLibraries={isLoadingLibraries}
        />
        <RemoteControlSection />
        <OtherSection />

        <div className="flex justify-end pt-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
