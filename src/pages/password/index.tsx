import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuroraBackground } from "../../components/aurora-background";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function PasswordSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="relative max-w-full overflow-hidden px-4 py-6">
      <AuroraBackground />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Lock className="h-5 w-5" />
          <span className="text-sm uppercase tracking-wide">
            Account Security
          </span>
        </div>

        <div>
          <h2 className="font-poppins text-3xl font-semibold text-foreground">
            Password settings
          </h2>
          <p className="text-muted-foreground">
            We&apos;re preparing secure password management for Apertúre. This
            preview shows the interface we&apos;ll wire up shortly.
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Update password</CardTitle>
            <CardDescription>
              Once backend support ships you&apos;ll be able to complete this
              flow and sync the change back to Jellyfin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Create a strong password"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-type your new password"
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: choose something unique, at least 12 characters, and avoid
              reusing passwords from other services.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate("/settings")}>
                Back to settings
              </Button>
              <Button disabled>Save password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
