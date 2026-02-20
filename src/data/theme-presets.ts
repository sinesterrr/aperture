export const DEFAULT_PALETTE: [string, string, string] = [
  "#34d399",
  "#38bdf8",
  "#2dd4bf",
];
const DEFAULT_BACKGROUND_GRADIENT =
  "radial-gradient(circle at 20% 20%, rgba(52, 211, 153, 0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.25), transparent 45%), radial-gradient(circle at 50% 80%, rgba(244, 114, 182, 0.25), transparent 45%)";

export interface ThemeVariant {
  name: string;
  description?: string;
  gradient: [string, string, string];
  themeId: string;
  aurora: {
    colors: [string, string, string];
    background: string;
  };
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
      aurora: {
        colors: DEFAULT_PALETTE,
        background: DEFAULT_BACKGROUND_GRADIENT,
      },
    },
    {
      name: "Light",
      description: "Stone blues with graphite shading.",
      gradient: ["#e2e8f0", "#cbd5f5", "#94a3b8"],
      themeId: "light",
      aurora: {
        colors: ["#fde68a", "#f9a8d4", "#c4b5fd"],
        background:
          "radial-gradient(circle at 15% 20%, rgba(255, 214, 165, 0.45), transparent 55%), radial-gradient(circle at 80% 0%, rgba(199, 210, 254, 0.4), transparent 45%), linear-gradient(120deg, rgba(255, 248, 242, 0.95), rgba(249, 250, 255, 0.85))",
      },
    },
    {
      name: "Dark",
      gradient: ["#111827", "#1f2937", "#334155"],
      themeId: "dark",
      aurora: {
        colors: ["#1e3a8a", "#4c1d95", "#0f172a"],
        background:
          "radial-gradient(circle at 15% 15%, rgba(37, 99, 235, 0.35), transparent 55%), radial-gradient(circle at 70% 0%, rgba(109, 40, 217, 0.35), transparent 45%), linear-gradient(130deg, rgba(3, 7, 18, 0.95), rgba(2, 6, 23, 0.9))",
      },
    },
    {
      name: "Glassmorphism",
      description: "Frosty transparency with soft blurs.",
      gradient: ["#60a5fa", "#38bdf8", "#818cf8"],
      themeId: "glassmorphism",
      aurora: {
        colors: ["#60a5fa", "#a78bfa", "#38bdf8"],
        background:
          "radial-gradient(circle at 20% 25%, rgba(96, 165, 250, 0.15), transparent 50%), radial-gradient(circle at 75% 10%, rgba(167, 139, 250, 0.12), transparent 45%), linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.8))",
      },
    },
    {
      name: "Cinematic Theatre Black",
      description: "Pitch black canvas with ember highlights.",
      gradient: ["#010103", "#0b0b0f", "#f97316"],
      themeId: "cinematic-theatre-black",
      aurora: {
        colors: ["#f97316", "#c1840a", "#030712"],
        background:
          "radial-gradient(circle at 10% 10%, rgba(249, 115, 22, 0.4), transparent 55%), radial-gradient(circle at 80% 0%, rgba(124, 58, 237, 0.3), transparent 50%), linear-gradient(140deg, rgba(3, 3, 7, 0.95), rgba(2, 2, 4, 0.85))",
      },
    },
    {
      name: "Neon Grid",
      description: "Magenta to cyan arcade glow.",
      gradient: ["#f472b6", "#c084fc", "#60a5fa"],
      themeId: "neon-grid",
      aurora: {
        colors: ["#f472b6", "#c084fc", "#60a5fa"],
        background:
          "radial-gradient(circle at 15% 15%, rgba(244, 114, 182, 0.4), transparent 55%), radial-gradient(circle at 80% 5%, rgba(96, 165, 250, 0.35), transparent 45%), linear-gradient(125deg, rgba(10, 8, 25, 0.95), rgba(15, 23, 42, 0.9))",
      },
    },
    {
      name: "Emerald Ember",
      description: "Deep forest blacks with molten gold accents.",
      gradient: ["#022c22", "#16a34a", "#facc15"],
      themeId: "emerald-ember",
      aurora: {
        colors: ["#16a34a", "#facc15", "#022c22"],
        background:
          "radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.4), transparent 55%), radial-gradient(circle at 70% 0%, rgba(251, 191, 36, 0.35), transparent 45%), linear-gradient(135deg, rgba(1, 12, 8, 0.95), rgba(0, 5, 3, 0.9))",
      },
    },
    {
      name: "Sunset Blocks",
      description: "Tangerine slabs with magenta shadows.",
      gradient: ["#f97316", "#fde047", "#c026d3"],
      themeId: "sunset-blocks",
      aurora: {
        colors: ["#f97316", "#fb7185", "#facc15"],
        background:
          "radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.45), transparent 60%), radial-gradient(circle at 80% 10%, rgba(251, 113, 133, 0.35), transparent 45%), linear-gradient(140deg, rgba(67, 20, 7, 0.95), rgba(39, 12, 5, 0.9))",
      },
    },
    {
      name: "Crimson Obelisk",
      description: "Pitch blocks with crimson slashes.",
      gradient: ["#0f0f0f", "#ef4444", "#7f1d1d"],
      themeId: "crimson-obelisk",
      aurora: {
        colors: ["#ef4444", "#f97316", "#0f0f0f"],
        background:
          "radial-gradient(circle at 15% 15%, rgba(239, 68, 68, 0.45), transparent 60%), radial-gradient(circle at 75% 5%, rgba(79, 18, 18, 0.9), transparent 50%), linear-gradient(135deg, rgba(5, 2, 2, 0.95), rgba(15, 4, 4, 0.9))",
      },
    },
    {
      name: "Peach Sorbet",
      description: "Creamy peach with rosy highlights.",
      gradient: ["#fde68a", "#f9a8d4", "#fef9c3"],
      themeId: "peach-sorbet",
      aurora: {
        colors: ["#f9a8d4", "#fde68a", "#fef3c7"],
        background:
          "radial-gradient(circle at 15% 20%, rgba(249, 168, 212, 0.45), transparent 55%), radial-gradient(circle at 80% 0%, rgba(254, 240, 138, 0.35), transparent 45%), linear-gradient(130deg, rgba(255, 248, 242, 0.95), rgba(254, 236, 226, 0.9))",
      },
    },
    {
      name: "Lilac Dream",
      description: "Lavender fields with cotton candy light.",
      gradient: ["#ddd6fe", "#c4b5fd", "#f5d0fe"],
      themeId: "lilac-dream",
      aurora: {
        colors: ["#c4b5fd", "#f472b6", "#a78bfa"],
        background:
          "radial-gradient(circle at 20% 20%, rgba(192, 132, 252, 0.4), transparent 55%), radial-gradient(circle at 75% 5%, rgba(244, 114, 182, 0.35), transparent 45%), linear-gradient(145deg, rgba(40, 0, 70, 0.88), rgba(65, 8, 95, 0.8))",
      },
    },
    {
      name: "Deep Velvet",
      description: "Indigo velvet with brushed steel.",
      gradient: ["#312e81", "#4c1d95", "#64748b"],
      themeId: "deep-velvet",
      aurora: {
        colors: ["#7c3aed", "#0ea5e9", "#0f172a"],
        background:
          "radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.45), transparent 60%), radial-gradient(circle at 80% 5%, rgba(14, 165, 233, 0.35), transparent 45%), linear-gradient(135deg, rgba(7, 4, 20, 0.95), rgba(15, 10, 35, 0.9))",
      },
    },
  ],
};
