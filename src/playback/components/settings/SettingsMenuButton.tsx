import React from "react";
import { LucideIcon } from "lucide-react";

interface SettingsMenuButtonProps {
  icon: LucideIcon;
  isOpen: boolean;
  onClick?: () => void;
  title: string;
}

export const SettingsMenuButton = React.forwardRef<
  HTMLButtonElement,
  SettingsMenuButtonProps
>(({ icon: Icon, isOpen, onClick, title }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className="glass-button rounded-full w-10 h-10 flex items-center justify-center border border-white/10 transition-all duration-300 backdrop-blur-sm"
      style={{
        background: isOpen
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(255, 255, 255, 0.05)",
        borderColor: isOpen
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(255, 255, 255, 0.1)",
        color: isOpen ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.7)",
      }}
      title={title}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
});

SettingsMenuButton.displayName = "SettingsMenuButton";
