import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  test: {
    root: __dirname,
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.ts"],
    setupFiles: [path.resolve(__dirname, "src/test/setup.ts")],
  },
});
