// Single source for the identity "initials chip" used across the app. The shared
// Avatar.astro component (server-rendered) and the client-rendered tables/cards
// (JS) both go through here, so the chip's initials rule, markup, and class names
// never drift. The chip's STYLES live once in src/styles/theme.css (.avatar,
// global) so server- and runtime-created chips are styled from the same place.

export type AvatarSize = 'sm' | 'md' | 'lg';

/** Initials for a name: up to two letters, ignoring a Dr./Prof. honorific. */
export const initials = (name: string): string =>
  name
    .replace(/^(Dr\.?|Prof\.?)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

/** Markup for the initials chip — for CLIENT-rendered rows/cards. Server code
 *  uses the <Avatar> component, which emits the same class + initials. Initials
 *  are letters only, so no escaping is needed. */
export const avatarHTML = (name: string, size: AvatarSize = 'md'): string =>
  `<span class="avatar avatar--${size}" aria-hidden="true">${initials(name)}</span>`;
