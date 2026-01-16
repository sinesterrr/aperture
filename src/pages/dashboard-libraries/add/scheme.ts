import { z } from "zod";

export const addLibraryFormSchema = z.object({
  CollectionType: z.string().min(1, "Please select a content type."),
  Name: z.string().min(1, "Display name is required"),
  Paths: z.array(z.string()).min(1, "At least one folder path is required"),
});

export type AddLibraryFormValues = z.infer<typeof addLibraryFormSchema>;

export const defaultAddLibraryFormValues: AddLibraryFormValues = {
  CollectionType: "",
  Name: "",
  Paths: [],
};
