import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			name: "PixelationFocus",
			entry: "./src/index.ts",
			fileName: (format) =>
				`bundle.${format}.${format === "es" ? "m" : ""}js`,
			formats: ["es", "umd", "cjs"],
		},
		rollupOptions: {
			output: {
				globals: (id) => {
					if (id.startsWith("@pixelation/")) {
						const parts = id.substring(1).split("/");
						const name =
							parts[1][0].toUpperCase() + parts[1].substring(1);

						return `Pixelation${name}`;
					} else if (id.startsWith("@")) {
						const parts = id.substring(1).split("/");

						return parts[1] ?? parts[0];
					} else {
						return id;
					}
				},
			},
			external: (id) => {
				return id.startsWith("@pixelation/");
			},
		},
	},
});
