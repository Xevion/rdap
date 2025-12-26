import nextConfig from "eslint-config-next";
import tseslint from "typescript-eslint";

export default [
	// Base configuration with ignores
	{
		ignores: [
			".media/**",
			"coverage/**",
			".next/**",
			"node_modules/**",
			"out/**",
			"*.config.mjs",
			"*.config.js",
		],
	},

	// Next.js core web vitals config
	...nextConfig,

	// TypeScript recommended rules
	...tseslint.configs.recommended,

	// TypeScript rules requiring type checking
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
		rules: {
			"@typescript-eslint/consistent-type-imports": "warn",
		},
	},

	// Allow CommonJS require in .cjs files
	{
		files: ["**/*.cjs"],
		rules: {
			"@typescript-eslint/no-require-imports": "off",
		},
	},
];
