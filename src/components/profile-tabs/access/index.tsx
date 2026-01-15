import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  UserDto,
  BaseItemDto,
  DeviceInfoDto,
  UserPolicy,
} from "@jellyfin/sdk/lib/generated-client/models";
import { useEffect, useState } from "react";
import {
  fetchMediaFolders,
  fetchDevices,
  updateUserPolicy,
} from "../../../actions";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { toast } from "sonner";
import { accessFormSchema, AccessFormValues } from "./schema";
import { LibraryAccessSection } from "./library-access-section";
import { DeviceAccessSection } from "./device-access-section";

export default function AccessTab({ user }: { user?: UserDto }) {
  const [libraries, setLibraries] = useState<BaseItemDto[]>([]);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(true);
  const [devices, setDevices] = useState<DeviceInfoDto[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);

  useEffect(() => {
    fetchMediaFolders()
      .then(setLibraries)
      .finally(() => setIsLoadingLibraries(false));

    fetchDevices()
      .then(setDevices)
      .finally(() => setIsLoadingDevices(false));
  }, []);

  const form = useForm<AccessFormValues>({
    resolver: zodResolver(accessFormSchema) as any,
    defaultValues: {
      EnableAllFolders: user?.Policy?.EnableAllFolders ?? true,
      EnabledFolders: user?.Policy?.EnabledFolders || [],
      EnableAllDevices: user?.Policy?.EnableAllDevices ?? true,
      EnabledDevices: user?.Policy?.EnabledDevices || [],
    },
  });

  useEffect(() => {
    if (user?.Id) {
      // Only reset form when user ID changes
      if (form.getFieldState("EnableAllFolders").isDirty === false) {
        form.reset({
          EnableAllFolders: user.Policy?.EnableAllFolders ?? true,
          EnabledFolders: user.Policy?.EnabledFolders || [],
          EnableAllDevices: user.Policy?.EnableAllDevices ?? true,
          EnabledDevices: user.Policy?.EnabledDevices || [],
        });
      }
    }
  }, [user?.Id, form]);

  async function onSubmit(data: AccessFormValues) {
    if (!user?.Id || !user.Policy) return;

    try {
      const updatedPolicy: UserPolicy = {
        ...user.Policy,
        EnableAllFolders: data.EnableAllFolders,
        EnabledFolders: data.EnabledFolders || [],
        EnableAllDevices: data.EnableAllDevices,
        EnabledDevices: data.EnabledDevices || [],
      };

      await updateUserPolicy(user.Id, updatedPolicy);
      toast.success("Access settings updated successfully");
    } catch (error) {
      console.error("Failed to update access settings:", error);
      toast.error("Failed to update access settings");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full pb-10"
      >
        <LibraryAccessSection
          libraries={libraries}
          isLoadingLibraries={isLoadingLibraries}
        />
        <DeviceAccessSection
          devices={devices}
          isLoadingDevices={isLoadingDevices}
        />

        <div className="flex justify-end pt-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
