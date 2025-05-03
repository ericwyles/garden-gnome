import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: "/garden-gnome/",
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: "src/main.ts", // Set the correct entry point
      output: {
        format: "iife", // Immediately Invoked Function Expression
        entryFileNames: "gardenGnome.js", // Force output file name
      },
    },
  },
}));
