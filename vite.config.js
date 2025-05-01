import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "development" ? "/" : "/garden-gnome/",
  build: {
    outDir: mode === "development" ? "dist-development" : "dist",
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
