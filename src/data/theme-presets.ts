export interface ThemeVariant {
  name: string;
  description?: string;
  gradient: [string, string, string?];
  themeId: string;
}

export interface ThemeVariantEntry {
  name: string;
  variants: ThemeVariant[];
}

export const THEME_VARIANTS: ThemeVariantEntry = {
  name: "Choose theme",
  variants: [
    {
      name: "Auto",
      gradient: ["#f9fafb", "#1f2937", "#38bdf8"],
      themeId: "system",
    },
    {
      name: "Light",
      description: "Stone blues with graphite shading.",
      gradient: ["#e2e8f0", "#cbd5f5", "#94a3b8"],
      themeId: "light",
    },
    {
      name: "Dark",
      gradient: ["#111827", "#1f2937", "#334155"],
      themeId: "dark",
    },
    {
      name: "Glassmorphism",
      description: "Frosty transparency with soft blurs.",
      gradient: ["#60a5fa", "#38bdf8", "#818cf8"],
      themeId: "glassmorphism",
    },
    {
      name: "Cinematic Theatre Black",
      description: "Pitch black canvas with ember highlights.",
      gradient: ["#010103", "#0b0b0f", "#f97316"],
      themeId: "cinematic-theatre-black",
    },
  ],
};
