import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";
import UnocssPlugin from "@unocss/vite";
import path from "path";
import { fileURLToPath } from "url";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    solidPlugin(),
    UnocssPlugin({
      // your config or in uno.config.ts
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(dirname, "./src"),
      "@": path.resolve(dirname, "./src"),
      "~~": path.resolve(dirname, "../.."),
      "@@": path.resolve(dirname, "../.."),
      "#shared": path.resolve(dirname, "../../shared"),
      assets: path.resolve(dirname, "./src/assets"),
      public: path.resolve(dirname, "./public"),
    },
  },
  server: {
    port: 1234,
  },
  build: {
    target: "esnext",
  },
});
