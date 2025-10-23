import { defineConfig } from "vitest/config";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import path from "path";

export default defineConfig({
	plugins: [
		codecovVitePlugin({
			enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
			bundleName: "rdap",
			uploadToken: process.env.CODECOV_TOKEN,
		}),
	],
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./src/test/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			exclude: [
				"**/*.config.*",
				"**/dist/**",
				"**/node_modules/**",
				"**/.next/**",
				"**/test/**",
				"**/*.test.{ts,tsx}",
				"**/src/env/**",
			],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
