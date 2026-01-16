import { z } from "zod";

export const addLibraryFormSchema = z.object({
  CollectionType: z.string().min(1, "Please select a content type."),
  Name: z.string().min(1, "Display name is required"),
});

export type AddLibraryFormValues = z.infer<typeof addLibraryFormSchema>;

export const defaultAddLibraryFormValues: AddLibraryFormValues = {
  CollectionType: "",
  Name: "",
};
