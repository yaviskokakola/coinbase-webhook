import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    COINBASE_KEY: z.string(),
  },

  client: {},

  runtimeEnv: {
    COINBASE_KEY: process.env.COINBASE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  },
});
