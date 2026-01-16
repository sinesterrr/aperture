import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { dashboardLoadingAtom } from "../../../lib/atoms";
import {
  CountryInfo,
  CultureDto,
} from "@jellyfin/sdk/lib/generated-client/models";
import { fetchCountries, fetchCultures } from "../../../actions/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AddLibraryFormValues,
  defaultAddLibraryFormValues,
  addLibraryFormSchema,
} from "./scheme";

const CONTENT_TYPES = [
  { value: "movies", label: "Movies" },
  { value: "tvshows", label: "Shows" },
];

export default function AddLibraryPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const [cultures, setCultures] = useState<CultureDto[]>([]);
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const navigate = useNavigate();

  const form = useForm<AddLibraryFormValues>({
    resolver: zodResolver(addLibraryFormSchema),
    defaultValues: defaultAddLibraryFormValues,
  });

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const [culturesData, countriesData] = await Promise.all([
          fetchCultures(),
          fetchCountries(),
        ]);
        setCultures(culturesData);
        setCountries(countriesData);
      } catch (error) {
        console.error(error);
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading]);

  async function onSubmit(data: AddLibraryFormValues) {
    // TODO: Handle submission
    console.log(data);
    toast.info("Library creation not implemented yet");
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              General Info
            </h3>
            <FormField
              control={form.control}
              name="CollectionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/libraries")}
            >
              Cancel
            </Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
