import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".kilo/**", // Agent Manager worktrees are separate checkouts, not part of the app
  ]),
  {
    rules: {
      // All pages load data via fetch-in-useEffect (client-side SPA pattern).
      // The new set-state-in-effect rule flags this valid data-fetching pattern
      // as an error and breaks `next build`, so it is disabled here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
