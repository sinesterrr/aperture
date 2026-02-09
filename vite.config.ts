import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [react(), tailwindcss()],
  build: {
    target: "esnext", // modern browsers
    minify: "esbuild",
    sourcemap: false, // change to true if you want dev sourcemaps
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "lucide-react",
            "framer-motion",
            "sonner",
            "embla-carousel-react",
            "@lobehub/icons",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
          ],
          "vendor-radix": [
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          "vendor-utils": [
            "axios",
            "lodash",
            "zod",
            "uuid",
            "node-vibrant",
            "blurhash",
          ],
        },
      },
    },
  },
  server: {
    port: 3000, // optional, remove strictPort
  },
});
