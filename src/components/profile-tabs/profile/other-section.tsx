import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../../ui/form";
import { Checkbox } from "../../ui/checkbox";
import { ProfileFormValues } from "./schema";

export function OtherSection() {
  const form = useFormContext<ProfileFormValues>();

  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Other</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="IsDisabled"
          render={({ field }) => (
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
  );
}
