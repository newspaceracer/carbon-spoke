// Shared helpers for the carbon-first PreToolUse hook. Node-only (no bash, no
// jq) so it behaves identically on macOS and Windows.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

/** Nearest EXISTING ancestor dir of p — Write targets may not exist yet. */
export function nearestExistingDir(p) {
  let dir = path.dirname(p);
  while (!existsSync(dir)) {
    const up = path.dirname(dir);
    if (up === dir) break; // filesystem root (works for both / and C:\)
    dir = up;
  }
  return dir;
}

function readPkg(dir) {
  try {
    return JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Classify the repo containing `startDir` with ONE upward walk:
 *  - 'carbon-spoke' — some package.json on the walk lists @carbon/web-components
 *                     in dependencies/devDependencies.
 *  - 'other'        — it does not. The hook stays inert (fails open) so this file
 *                     can be copied around without surprising unrelated repos.
 */
export function classifyDir(startDir) {
  let dir;
  try {
    dir = realpathSync(startDir);
  } catch {
    dir = path.resolve(startDir);
  }
  for (;;) {
    const pkg = readPkg(dir);
    if (pkg) {
      if (
        pkg.dependencies?.['@carbon/web-components'] ||
        pkg.devDependencies?.['@carbon/web-components']
      ) {
        return 'carbon-spoke';
      }
    }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return 'other';
}

/** Parse the hook payload from stdin; null on any failure (callers fail open). */
export function readPayload() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

/** Every piece of proposed text across Write / Edit / MultiEdit payloads. */
export function proposedContent(toolInput) {
  const parts = [];
  if (typeof toolInput.content === 'string') parts.push(toolInput.content);
  if (typeof toolInput.new_string === 'string') parts.push(toolInput.new_string);
  for (const e of toolInput.edits ?? []) {
    if (typeof e.new_string === 'string') parts.push(e.new_string);
  }
  return parts.join('\n');
}

/** Absolute target path — relative file_path resolves against the payload cwd. */
export function targetPath(payload) {
  const fp = payload?.tool_input?.file_path;
  if (!fp) return null;
  if (path.isAbsolute(fp)) return fp;
  const base = payload.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  return path.resolve(base, fp);
}
