import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { FileBrowserDropdown } from "../../components/file-browser-dropdown";

export default function DashboardGeneralPage() {
  const [cachePath, setCachePath] = useState("");
  const [metadataPath, setMetadataPath] = useState("");

  return (
    <form className="w-full space-y-8">
      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Connect</h3>
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 px-3 py-2">
          <Checkbox id="quick-connect-enabled" />
          <label
            htmlFor="quick-connect-enabled"
            className="text-sm font-medium leading-none"
          >
            Enable Quick Connect on this server
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground">Server Info</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="server-name">Server Name</Label>
            <Input
              id="server-name"
              type="text"
              placeholder="My Jellyfin Server"
            />
            <p className="text-xs text-muted-foreground">
              This name will be used to identify the server and will default to
              the server's hostname.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="server-display-language">
              Server display language
            </Label>
            <Select>
              <SelectTrigger id="server-display-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This setting updates the server configuration via Jellyfin
              Weblate. UI translations are not yet implemented in this app.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Paths</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cache-path">Cache Path</Label>
            <div className="relative">
              <Input
                id="cache-path"
                type="text"
                placeholder="/var/cache/jellyfin"
                className="pr-10"
                value={cachePath}
                onChange={(event) => setCachePath(event.target.value)}
              />
              <FileBrowserDropdown
                ariaLabel="Browse cache path"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onSelect={setCachePath}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Specify a custom location for server cache files such as images.
              Leave blank to use the server default.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata-path">Metadata Path</Label>
            <div className="relative">
              <Input
                id="metadata-path"
                type="text"
                placeholder="/var/lib/jellyfin/metadata"
                className="pr-10"
                value={metadataPath}
                onChange={(event) => setMetadataPath(event.target.value)}
              />
              <FileBrowserDropdown
                ariaLabel="Browse metadata path"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onSelect={setMetadataPath}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Specify a custom location for downloaded artwork and metadata.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-5 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Performance</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parallel-library-scan">
              Parallel Library Scan tasks limit
            </Label>
            <Input
              id="parallel-library-scan"
              type="number"
              inputMode="numeric"
              placeholder="Auto"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of parallel tasks during library scans. Leaving
              this empty will choose a limit based on your systems core count.
              WARNING: Setting this number too high may cause issues with
              network file systems; if you encounter problems lower this number.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parallel-image-encoding">
              Parallel image encoding limit
            </Label>
            <Input
              id="parallel-image-encoding"
              type="number"
              inputMode="numeric"
              placeholder="Auto"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of image encodings that are allowed to run in
              parallel. Leaving this empty will choose a limit based on your
              systems core count.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}
