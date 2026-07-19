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
		// Live-network tests are a separate tier; see vitest.live.config.ts
		exclude: ["**/node_modules/**", "**/.next/**", "**/*.live.test.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			// Without an explicit include, only files a test imports are reported, so an
			// entirely untested module vanishes from the denominator instead of showing 0%.
			// This is what let resolver.ts sit at 52% while the headline number read 81%.
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"**/*.config.*",
				"**/dist/**",
				"**/node_modules/**",
				"**/.next/**",
				"**/test/**",
				"**/*.test.{ts,tsx}",
				"**/src/env/**",
				"**/*.d.ts",
				// The presentation layer is deliberately out of scope: bugs of the kind
				// this suite targets live in resolution and parsing, not in rendering.
				"**/src/app/**",
				"**/src/pages/**",
				"**/src/components/**",
				"**/src/contexts/**",
				"**/src/rdap/components/**",
				"**/src/rdap/hooks/**",
				"**/src/telemetry/**",
			],
			// Ratchet: the logic layer is covered, so a regression should fail rather
			// than quietly lower the average.
			thresholds: {
				statements: 90,
				branches: 85,
				functions: 90,
				lines: 90,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
