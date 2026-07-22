// @ts-check
import { defineConfig } from 'astro/config';

// Carbon web components (cds-*) are plain custom elements — Astro renders them
// as-is and they upgrade client-side once their module is imported in a
// <script>. No integration needed; the only job here is telling Astro these
// hyphenated tags are custom elements so it never tries to treat them as
// Astro/JSX components.
export default defineConfig({
  vite: {
    // Carbon ships pre-compiled styles (button.scss.js etc.), so no Sass step
    // is required — the only stylesheet we pull in is @carbon/styles/css/styles.css.

    // Pre-bundle Tiptap (the sc-rich-text editor's engine) up front, by name,
    // instead of relying on Vite's on-demand dependency SCAN to discover it. The
    // scan runs esbuild over every .astro <script> as an entry; a single script it
    // can't parse makes the whole scan fail ("Failed to scan for dependencies"),
    // which leaves these CJS-ish deps un-optimized and serving 504 — and any page
    // that imports them (special-conditions, the apply flow) then renders blank.
    // Listing them here makes their optimization deterministic and scan-independent.
    optimizeDeps: {
      include: ['@tiptap/core', '@tiptap/starter-kit', '@tiptap/extension-placeholder'],
    },
  },
});
