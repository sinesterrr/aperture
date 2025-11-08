import {
  Monitor,
  Moon,
  Sparkles,
  Sun,
  GlassWater,
  type LucideIcon,
} from "lucide-react";

export interface ThemeOption {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
  {
    id: "aqua",
    label: "Aqua",
    icon: Sparkles,
    description: "Ocean breeze with neon accents",
  },
  {
    id: "liquid-glass",
    label: "Liquid Glass",
    icon: GlassWater,
    description: "Translucent glassmorphism finish",
  },
];
