import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: {
    command:
      "pnpm --filter web exec prisma generate --schema=../server/prisma/schema.prisma && pnpm --filter web dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      E2E_AUTH_ENABLED: "true",
      NEXTAUTH_SECRET: "e2e-test-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      GOOGLE_CLIENT_ID: "e2e-google-client-id",
      GOOGLE_CLIENT_SECRET: "e2e-google-client-secret",
    },
  },
});
