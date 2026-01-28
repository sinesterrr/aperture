import { ChevronDown, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";

export default function SeerrSection() {
  const [seerrOpen, setSeerrOpen] = useState(false);
  return (
    <Collapsible open={seerrOpen} onOpenChange={setSeerrOpen}>
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 font-poppins text-lg">
            <Eye className="h-5 w-5" />
            Seerr Integration
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[11px]">
              Beta
            </Badge>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={seerrOpen}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                {seerrOpen ? "Hide" : "Show"}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    seerrOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="w-full">
            Configure your Overseerr or Jellyseerr instance to handle media
            requests directly.
          </CardDescription>
        </CardHeader>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-up data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-down">
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seerr-url">Server URL</Label>
                <Input
                  id="seerr-url"
                  placeholder="https://requests.yourdomain.com"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seerr-key">API Key</Label>
                <Input
                  id="seerr-key"
                  type="password"
                  placeholder="Your 64-character API key"
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Note:</span>{" "}
                requests will be synced automatically.
              </div>
              <Button size="sm" variant="secondary">
                Test Connection
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
