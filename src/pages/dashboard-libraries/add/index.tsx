import { useSetAtom } from "jotai";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { dashboardLoadingAtom } from "../../../lib/atoms";
import {
  AddLibraryFormValues,
  defaultAddLibraryFormValues,
  addLibraryFormSchema,
} from "./scheme";
import { addLibrary } from "../../../actions/media";
import { LibraryForm } from "./components/library-form";
import { buildLibraryOptions } from "./lib/library-form-helpers";
import { useLibraryLookups } from "./lib/use-library-lookups";
import { useLibraryOptionsLoader } from "./lib/use-library-options-loader";

export default function AddLibraryPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const navigate = useNavigate();

  const form = useForm<AddLibraryFormValues>({
    resolver: zodResolver(addLibraryFormSchema) as any,
    defaultValues: defaultAddLibraryFormValues,
  });

  const collectionType = useWatch({
    control: form.control,
    name: "CollectionType",
  });

  const { cultures, countries } = useLibraryLookups({
    setLoading: setDashboardLoading,
  });

  useLibraryOptionsLoader({
    collectionType,
    form,
    setLoading: setDashboardLoading,
  });

  async function onSubmit(data: AddLibraryFormValues) {
    setDashboardLoading(true);
    try {
      const libraryOptions = buildLibraryOptions(data);

      await addLibrary(
        data.Name,
        data.CollectionType,
        data.Paths,
        libraryOptions
      );

      toast.success("Library added successfully");
      navigate("/dashboard/libraries");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add library");
    } finally {
      setDashboardLoading(false);
    }
  }

  return (
    <LibraryForm
      form={form}
      cultures={cultures}
      countries={countries}
      onSubmit={onSubmit}
      onCancel={() => navigate("/dashboard/libraries")}
    />
  );
}
