import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    ".test-build/**",
    "next-env.d.ts",
    "Dashboard.tsx",
    "Quiz.tsx",
    "TopicExplainer.tsx",
  ]),
  {
    rules: {
      // Existing pages use effect-driven async loading patterns. Keep this non-blocking
      // until those flows are migrated to query hooks/server loaders page by page.
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["tests/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
