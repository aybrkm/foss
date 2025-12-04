#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Ensures that the generated Prisma client includes recently added models.
 * If not, it runs `prisma generate`. This avoids random runtime failures
 * when someone forgets to regenerate after pulling schema changes, while
 * also skipping unnecessary generate calls that would fail when the DLL
 * is locked (Windows).
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const CLIENT_INDEX = path.join(__dirname, "..", "node_modules", ".prisma", "client", "index.js");

function runPrismaGenerate() {
  const bin = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(bin, ["prisma", "generate"], { stdio: "inherit" });

  if (result.error) {
    console.error("[ensure-prisma-client] Failed to spawn `prisma generate`:", result.error);
    return 1;
  }

  if (result.status !== 0) {
    console.error(
      "[ensure-prisma-client] `prisma generate` exited with code",
      result.status,
      "- ensure no other Node process (e.g. `npm run dev`) is locking the Prisma query engine and retry.",
    );
  }

  return result.status ?? 1;
}

function main() {
  console.log("[ensure-prisma-client] Running `prisma generate` to sync schema changes...");
  return runPrismaGenerate();
}

process.exit(main());
