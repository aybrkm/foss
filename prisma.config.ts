import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

// Load environment variables for Prisma CLI (e.g., DATABASE_URL)
config({ path: ".env" });

export default defineConfig({
  schema: "./prisma/schema.prisma",
});
