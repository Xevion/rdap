import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	// Base configuration with ignores
	{
		ignores: [
			".next/**",
			"node_modules/**",
			"out/**",
			"*.config.mjs",
			"*.config.js",
			"next-env.d.ts", // Next.js generated file
		],
	},

	// Next.js core web vitals using FlatCompat
	...compat.extends("next/core-web-vitals"),

	// TypeScript recommended rules
	...compat.extends("plugin:@typescript-eslint/recommended"),

	// Base TypeScript configuration
	{
		plugins: {
			"@typescript-eslint": typescriptEslint,
		},

		languageOptions: {
			parser: tsParser,
			ecmaVersion: "latest",
			sourceType: "module",
			parserOptions: {
				project: "./tsconfig.json",
			},
		},

		rules: {
			"@typescript-eslint/consistent-type-imports": "warn",
		},
	},

	// Additional strict TypeScript rules for .ts and .tsx files
	{
		files: ["**/*.ts", "**/*.tsx"],
		...compat.extends("plugin:@typescript-eslint/recommended-requiring-type-checking")[0],

		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parserOptions: {
				project: "./tsconfig.json",
			},
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
