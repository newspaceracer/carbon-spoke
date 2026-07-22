#!/usr/bin/env node
// Astro Frontmatter Guard (PreToolUse: Write|Edit|MultiEdit).
//
// BLOCKS a literal `<script>` / `<style>` tag inside an .astro FRONTMATTER
// (the `---` fence) — including inside `//` or `/* */` comments. Astro's compiler
// and Vite's dependency scanner mis-detect it as a real block, corrupt the script
// extraction, and emit `Unexpected "."` / `Failed to scan for dependencies`. The
// failure is only FATAL when node_modules/.vite is cold, so it hides behind a warm
// cache and surfaces later as a blank page with no obvious cause. (Burned ~40k
// tokens finding this once — see the memory of the same name.)
//
// Frontmatter is pure JS/TS: NO html tags belong there, in code or comments.
// Write "client script block" / "style block" in prose instead.
import { existsSync, readFileSync } from 'node:fs';
import { classifyDir, nearestExistingDir, readPayload, targetPath } from './lib.mjs';

const payload = readPayload();
if (!payload) process.exit(0); // unparseable — fail open

const file = targetPath(payload);
if (!file || !/\.astro$/i.test(file)) process.exit(0);

// Only enforce inside this kind of repo (same gate as the carbon-first hook).
if (classifyDir(nearestExistingDir(file)) !== 'carbon-spoke') process.exit(0);

// Reconstruct the FULL resulting file so we can scope the check to the frontmatter
// even when the tool is a partial Edit (whose snippet has no `---` fences).
const ti = payload.tool_input ?? {};
let full;
if (typeof ti.content === 'string') {
  full = ti.content; // Write — full file
} else {
  let base = '';
  try {
    base = existsSync(file) ? readFileSync(file, 'utf8') : '';
  } catch {
    process.exit(0); // can't read existing file — fail open
  }
  const edits = ti.edits ?? (ti.old_string != null ? [{ old_string: ti.old_string, new_string: ti.new_string }] : []);
  full = base;
  for (const e of edits) {
    if (typeof e.old_string === 'string' && typeof e.new_string === 'string') {
      full = full.replace(e.old_string, e.new_string); // first occurrence, mirrors Edit
    }
  }
}

// Extract frontmatter: the block between the leading `---` and the next `---`.
const m = full.match(/^\s*---\r?\n([\s\S]*?)\r?\n---/);
if (!m) process.exit(0); // no frontmatter — nothing to guard
const frontmatter = m[1];

const bad = frontmatter.match(/<\/?(script|style)[\s>]/i);
if (bad) {
  const tag = /style/i.test(bad[0]) ? '<style>' : '<script>';
  process.stderr.write(
    `BLOCKED by astro-frontmatter guard: a literal ${tag} appears in the .astro ` +
      `frontmatter (--- fence) of ${file.split('/').pop()}.\n\n` +
      `Even inside a // or /* */ comment, this makes Astro/Vite mis-detect a block, ` +
      `corrupts the script extraction, and throws "Unexpected \\".\\"" / "Failed to ` +
      `scan for dependencies" — a blank page once the .vite cache is cold.\n\n` +
      `Fix: write it in prose without angle brackets, e.g. "client script block" or ` +
      `"style block". Real ${tag} blocks belong BELOW the frontmatter, in the template.\n`,
  );
  process.exit(2); // deny the tool call
}

process.exit(0);
