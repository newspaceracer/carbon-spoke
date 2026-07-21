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
  },
});
