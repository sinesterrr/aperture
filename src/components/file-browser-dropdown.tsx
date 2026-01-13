import { useMemo, useState } from "react";
import { File, Folder, Search, ArrowUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

type FileNode = {
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
};

type FileBrowserDropdownProps = {
  ariaLabel: string;
  className?: string;
  onSelect: (path: string) => void;
};

const DUMMY_FILE_SYSTEM: FileNode = {
  name: "",
  type: "folder",
  children: [
    {
      name: "var",
      type: "folder",
      children: [
        {
          name: "cache",
          type: "folder",
          children: [
            { name: "jellyfin", type: "folder", children: [] },
            { name: "transcode", type: "folder", children: [] },
          ],
        },
        {
          name: "lib",
          type: "folder",
          children: [
            { name: "jellyfin", type: "folder", children: [] },
            { name: "metadata", type: "folder", children: [] },
          ],
        },
      ],
    },
    {
      name: "mnt",
      type: "folder",
      children: [
        {
          name: "media",
          type: "folder",
          children: [
            { name: "movies", type: "folder", children: [] },
            { name: "series", type: "folder", children: [] },
          ],
        },
      ],
    },
    {
      name: "Users",
      type: "folder",
      children: [
        { name: "alex", type: "folder", children: [] },
        { name: "guest", type: "folder", children: [] },
      ],
    },
    { name: "README.txt", type: "file" },
  ],
};

function getNodeAtPath(root: FileNode, segments: string[]) {
  let current = root;
  for (const segment of segments) {
    const next = current.children?.find(
      (child) => child.type === "folder" && child.name === segment
    );
    if (!next) break;
    current = next;
  }
  return current;
}

function formatPath(segments: string[]) {
  return segments.length ? `/${segments.join("/")}` : "/";
}

export function FileBrowserDropdown({
  ariaLabel,
  className,
  onSelect,
}: FileBrowserDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pathSegments, setPathSegments] = useState<string[]>([]);

  const currentNode = useMemo(
    () => getNodeAtPath(DUMMY_FILE_SYSTEM, pathSegments),
    [pathSegments]
  );

  const entries = useMemo(() => {
    const items = currentNode.children ?? [];
    return items.slice().sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "folder" ? -1 : 1;
    });
  }, [currentNode.children]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPathSegments([]);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "rounded-md p-1 text-muted-foreground transition hover:text-foreground",
            className
          )}
        >
          <Search className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-3"
        sideOffset={6}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Select path</p>
            <p className="text-xs text-muted-foreground">
              Dummy file system
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPathSegments((prev) => prev.slice(0, -1))}
            disabled={pathSegments.length === 0}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition disabled:opacity-40 hover:text-foreground"
          >
            <ArrowUp className="h-3 w-3" />
            Up
          </button>
        </div>

        <div className="mt-2 rounded-md border border-border/70 bg-muted/30 px-2 py-1 text-xs font-mono text-muted-foreground">
          {formatPath(pathSegments)}
        </div>

        <div className="mt-2 max-h-48 overflow-auto rounded-md border border-border/60">
          {entries.length === 0 ? (
            <div className="px-2 py-3 text-xs text-muted-foreground">
              This folder is empty.
            </div>
          ) : (
            <div className="p-1">
              {entries.map((entry) => (
                <button
                  key={`${entry.type}-${entry.name}`}
                  type="button"
                  onClick={() => {
                    if (entry.type === "folder") {
                      setPathSegments((prev) => [...prev, entry.name]);
                      return;
                    }
                    onSelect(formatPath([...pathSegments, entry.name]));
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-accent"
                >
                  {entry.type === "folder" ? (
                    <Folder className="h-4 w-4 text-primary" />
                  ) : (
                    <File className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="truncate">{entry.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => {
            onSelect(formatPath(pathSegments));
            setOpen(false);
          }}
        >
          Use this folder
        </Button>
      </PopoverContent>
    </Popover>
  );
}
