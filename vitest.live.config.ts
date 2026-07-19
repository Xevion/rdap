import { defineConfig } from "vitest/config";
import path from "path";

/**
 * The live tier queries IANA and the RIR RDAP servers for real.
 *
 * These catch what offline tests structurally cannot: a URL that looks correct but
 * that a registry rejects. They are excluded from the default suite because a
 * registry outage or rate limit would otherwise fail unrelated pull requests.
 */
export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.live.test.ts"],
		// Registries are slow and occasionally rate-limit; serialize and be patient.
		testTimeout: 30_000,
		hookTimeout: 30_000,
		retry: 2,
		fileParallelism: false,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
