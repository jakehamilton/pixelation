import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            name: "PixelationAseprite",
            entry: "./src/index.ts",
            fileName: (format) =>
                `bundle.${format}.${format === "es" ? "m" : ""}js`,
            formats: ["es", "umd", "cjs"],
        },
    },
});
