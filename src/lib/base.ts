// Prefix an internal, app-absolute path with the deploy base path so links work
// under GitHub Pages' project sub-path (/carbon-spoke/) AND at root in dev.
//
// import.meta.env.BASE_URL is Astro's configured `base`. Its trailing slash is
// not guaranteed across versions, so we normalize: strip any trailing slash off
// the base, ensure the path has a leading one, then join. That makes
//   withBase('/')          -> '/carbon-spoke/'
//   withBase('/districts') -> '/carbon-spoke/districts'
// Non-internal targets — '#', in-page fragments, and absolute/scheme URLs
// (mailto:, http:, //cdn) — pass through untouched.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string = '/'): string {
  if (!path || path === '#' || path.startsWith('#') || /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) {
    return path;
  }
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}`;
}
