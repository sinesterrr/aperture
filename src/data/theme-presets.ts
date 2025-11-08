export interface ThemeVariant {
  name: string;
  description?: string;
  gradient: [string, string, string?];
}

export interface ThemeVariantEntry {
  name: string;
  description: string;
  variants: ThemeVariant[];
}

export const THEME_VARIANTS: ThemeVariantEntry[] = [
  {
    name: "Default",
    description: "Core Jellyfin experience with adaptive panels.",
    variants: [
      {
        name: "Light",
        gradient: ["#f9fafb", "#e5e7eb", "#d1d5db"],
      },
      {
        name: "Dark",
        gradient: ["#111827", "#1f2937", "#334155"],
      },
      {
        name: "Auto",
        gradient: ["#f9fafb", "#1f2937", "#38bdf8"],
      },
    ],
  },
  {
    name: "Glassmorphism",
    description: "Translucent surfaces with frosted depth.",
    variants: [
      {
        name: "Refracted",
        gradient: ["rgba(255,255,255,0.65)", "rgba(147,197,253,0.6)", "#a78bfa"],
      },
      {
        name: "Blurred",
        gradient: ["rgba(255,255,255,0.4)", "rgba(165,243,252,0.45)", "rgba(209,213,219,0.6)"],
      },
    ],
  },
  {
    name: "Neobrutalism",
    description: "Bold layout blocks and playful grids.",
    variants: [
      {
        name: "Sunset Blocks",
        description: "Tangerine slabs with magenta shadows.",
        gradient: ["#f97316", "#fde047", "#c026d3"],
      },
      {
        name: "Crimson Obelisk",
        description: "Pitch blocks with crimson slashes.",
        gradient: ["#0f0f0f", "#ef4444", "#7f1d1d"],
      },
    ],
  },
  {
    name: "Retro Futurism",
    description: "Nostalgic neon gradients and chrome glow.",
    variants: [
      {
        name: "Neon Grid",
        description: "Magenta to cyan arcade glow.",
        gradient: ["#f472b6", "#c084fc", "#60a5fa"],
      },
      {
        name: "Chrome Pulse",
        description: "Deep violet meets teal chrome.",
        gradient: ["#4c1d95", "#0891b2", "#facc15"],
      },
    ],
  },
  {
    name: "Aesthetial",
    description: "Soft pastels, serif accents, editorial spacing.",
    variants: [
      {
        name: "Peach Sorbet",
        description: "Creamy peach with rosy highlights.",
        gradient: ["#fde68a", "#f9a8d4", "#fef9c3"],
      },
      {
        name: "Lilac Dream",
        description: "Lavender fields with cotton candy light.",
        gradient: ["#ddd6fe", "#c4b5fd", "#f5d0fe"],
      },
    ],
  },
  {
    name: "Beyond Flat",
    description: "Layered panels with subtle noise and depth.",
    variants: [
      {
        name: "Matte Slate",
        description: "Stone blues with graphite shading.",
        gradient: ["#e2e8f0", "#cbd5f5", "#94a3b8"],
      },
      {
        name: "Deep Velvet",
        description: "Indigo velvet with brushed steel.",
        gradient: ["#312e81", "#4c1d95", "#64748b"],
      },
    ],
  },
];
