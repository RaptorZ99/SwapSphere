import js from "@eslint/js";
import tseslint from "typescript-eslint";

const config = tseslint.config(
  {
    ignores: ["**/dist/**", "**/build/**", "**/.turbo/**", "**/generated/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  }
);

export default config;
