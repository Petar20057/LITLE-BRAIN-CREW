import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Pages synced from design/ run their own scripts on load, so moving to them must be a full page load:
    // plain <a> links on purpose, not next/link.
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design assets synced from the artifact (scripts/sync-design.mjs), kept as-is.
    "public/**",
    "design/**",
  ]),
]);

export default eslintConfig;
