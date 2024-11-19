import { defineConfig } from "vite";
import arraybuffer from "vite-plugin-arraybuffer";

export default defineConfig({
    plugins: [arraybuffer()],
    build: {
        lib: {
            name: "PixelationEngine",
            entry: "./src/index.ts",
            fileName: (format) =>
                `bundle.${format}.${format === "es" ? "m" : ""}js`,
            formats: ["es", "umd", "cjs"],
        },
    },
});
