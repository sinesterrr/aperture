import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AuroraBackground } from "../../components/aurora-background";
import { SearchBar } from "../../components/search-component";
import { Badge } from "../../components/ui/badge";
import { Settings2, Palette, Check } from "lucide-react";
import { THEME_VARIANTS } from "../../data/theme-presets";
import { cn } from "../../lib/utils";
import { themeSelectionAtom } from "../../lib/atoms";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useAtom(themeSelectionAtom);

  const ThemePreview = ({ themeId }: { themeId: string }) => {
    const Panel = () => (
      <div className="flex h-10 gap-1" aria-hidden="true">
        <div
          className="flex-1 rounded-md border"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
          }}
        />
        <div
          className="flex-1 rounded-md border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        />
        <div
          className="w-3 rounded-md border"
          style={{
            background: "var(--primary)",
            borderColor: "var(--primary)",
          }}
        />
      </div>
    );

    if (themeId === "system") {
      return (
        <div className="flex gap-1">
          <div className="flex-1 rounded-lg border p-1 light">
            <Panel />
          </div>
          <div className="flex-1 rounded-lg border p-1 dark">
            <Panel />
          </div>
        </div>
      );
    }

    const previewClass =
      themeId === "light" || themeId === "dark" ? themeId : themeId || "";

    return (
      <div className={cn("rounded-lg border p-1", previewClass)}>
        <Panel />
      </div>
    );
  };

  useEffect(() => {
    if (!theme) return;

    const variantFromTheme = THEME_VARIANTS.variants.find(
      (variant) => variant.themeId === theme
    );

    if (
      variantFromTheme &&
      (selectedTheme.variant !== variantFromTheme.name ||
        selectedTheme.family !== THEME_VARIANTS.name)
    ) {
      setSelectedTheme({
        family: THEME_VARIANTS.name,
        variant: variantFromTheme.name,
      });
    }
  }, [theme, selectedTheme.family, selectedTheme.variant, setSelectedTheme]);

  const handleVariantSelect = useCallback(
    (variantName: string, themeId: string) => {
      if (
        selectedTheme.family === THEME_VARIANTS.name &&
        selectedTheme.variant === variantName
      ) {
        return;
      }

      setSelectedTheme({
        family: THEME_VARIANTS.name,
        variant: variantName,
      });
      setTheme(themeId);
    },
    [selectedTheme.family, selectedTheme.variant, setSelectedTheme, setTheme]
  );

  return (
    <div className="relative px-4 py-6 max-w-full overflow-hidden">
      <AuroraBackground colorStops={["#34d399", "#38bdf8", "#2dd4bf"]} />
      <div className="relative z-10">
        <div className="mb-6">
          <SearchBar />
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2 font-poppins flex items-center gap-2">
            <Settings2 className="h-8 w-8" />
            Settings
          </h2>
          <p className="text-muted-foreground">
            Customize the interface and preview upcoming dashboard themes.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-lg">
                <Palette className="h-5 w-5" />
                Dashboard Themes
              </CardTitle>
              <CardDescription>
                Explore the palette families that power the dashboard theming
                system and apply any variant instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {THEME_VARIANTS.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quickly preview each palette and lock in your favorite look.
                  </p>
                </div>
                <Badge variant="secondary" className="text-[11px]">
                  {THEME_VARIANTS.variants.length} variant
                  {THEME_VARIANTS.variants.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {THEME_VARIANTS.variants.map((variant) => {
                  const isSelected = selectedTheme?.variant === variant.name;

                  return (
                    <button
                      key={`${THEME_VARIANTS.name}-${variant.name}`}
                      type="button"
                      onClick={() =>
                        handleVariantSelect(variant.name, variant.themeId)
                      }
                      className={cn(
                        "group flex flex-col gap-1.5 rounded-2xl border bg-background/70 p-2.5 text-left transition focus-visible:outline focus-visible:outline-primary/40",
                        isSelected
                          ? "border-primary/60 bg-primary/5 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                          : "border-border/60 hover:-translate-y-0.5 hover:border-primary/40"
                      )}
                    >
                      <div className="relative">
                        <ThemePreview themeId={variant.themeId} />
                        {isSelected ? (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-primary shadow">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm font-medium text-foreground">
                        <span className="truncate">{variant.name}</span>
                        <span
                          className={cn(
                            "text-[11px] font-normal",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {isSelected ? "Active" : "Preview"}
                        </span>
                      </div>
                      {variant.description ? (
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                          {variant.description}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
