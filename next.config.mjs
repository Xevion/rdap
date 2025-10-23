// @ts-check
import { withPostHogConfig } from "@posthog/nextjs-config";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
};

// PostHog source map configuration
// Only uploads source maps in production builds when POSTHOG_PERSONAL_API_KEY is set
const postHogConfig = {
	personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY || "",
	envId: "238067", // PostHog project ID for source map correlation
	host: "https://us.i.posthog.com",
	sourcemaps: {
		// Only enable on production builds with API key
		enabled: process.env.NODE_ENV === "production" && !!process.env.POSTHOG_PERSONAL_API_KEY,
		project: "rdap",
		version: process.env.VERCEL_GIT_COMMIT_SHA || "local",
		deleteAfterUpload: true,
	},
};

export default withPostHogConfig(nextConfig, postHogConfig);
