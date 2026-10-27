import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the server routes and rules (tests/). They never reach Supabase, SES or Creem: those are replaced
// by tests/fake-db.ts and mocks, so `npm test` is safe to run anywhere, including CI.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // The real package throws outside React Server Components; in tests every module is server code.
      "server-only": fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    env: { CREEM_WEBHOOK_SECRET: "test-webhook-secret", SUPABASE_SECRET_KEY: "test-secret-key" },
  },
});
