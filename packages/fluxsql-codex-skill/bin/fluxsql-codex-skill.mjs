#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(__filename), "..");
const sourceSkill = path.join(packageRoot, "skill", "fluxsql-workbench");

function usage() {
  console.log(`FluxSQL Codex Skill

Usage:
  fluxsql-codex-skill install [--force] [--target <directory>]
  fluxsql-codex-skill --help

Examples:
  npx fluxsql-codex-skill install
  npx fluxsql-codex-skill install --force
  npx fluxsql-codex-skill install --target C:\\path\\to\\project
`);
}

function parseArgs(argv) {
  const result = {
    command: argv[0],
    force: false,
    target: process.cwd()
  };

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--force") {
      result.force = true;
    } else if (arg === "--target") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --target.");
      }
      result.target = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return result;
}

function installSkill({ force, target }) {
  if (!fs.existsSync(sourceSkill)) {
    throw new Error(`Packaged skill was not found at ${sourceSkill}`);
  }

  const projectRoot = path.resolve(target);
  const skillsRoot = path.join(projectRoot, ".agents", "skills");
  const destination = path.join(skillsRoot, "fluxsql-workbench");

  if (fs.existsSync(destination) && !force) {
    throw new Error(
      `Skill already exists at ${destination}. Re-run with --force to overwrite it.`
    );
  }

  fs.mkdirSync(skillsRoot, { recursive: true });
  if (force && fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true, force: true });
  }

  fs.cpSync(sourceSkill, destination, { recursive: true });
  console.log(`Installed FluxSQL Workbench skill at: ${destination}`);
  console.log("Use it in Codex with: $fluxsql-workbench");
}

try {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    usage();
    process.exit(0);
  }

  const options = parseArgs(process.argv.slice(2));
  if (options.command !== "install") {
    usage();
    process.exit(options.command ? 1 : 0);
  }

  installSkill(options);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
