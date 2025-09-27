import { defineConfig } from "drizzle-kit";

import { env as environment } from "./src/config/env.js";

export default defineConfig({
  schema: "./src/db/schema/index.js",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: environment.database.url,
  },
  verbose: true,
  strict: true,
});
