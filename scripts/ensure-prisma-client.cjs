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
const REQUIRED_SIGNATURES = ["workspaceColumn", "workspaceCard", "digitalSubscription", "assetKind"];

function hasRequiredSignatures() {
  try {
    const contents = fs.readFileSync(CLIENT_INDEX, "utf8");
    return REQUIRED_SIGNATURES.every((signature) => contents.includes(signature));
  } catch {
    // Missing file or unreadable => need to (re)generate.
    return false;
  }
}

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
  if (hasRequiredSignatures()) {
    return 0;
  }

  console.log("[ensure-prisma-client] Prisma client missing required signatures. Running `prisma generate`...");
  return runPrismaGenerate();
}

process.exit(main());
