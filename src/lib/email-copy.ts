// One delegated "copy this email" handler, shared by every surface that renders a
// copy-email affordance (ContactCard, AnalysisTeam, …). Any element carrying a
// `data-copy-email="<address>"` attribute becomes a copy button — click it and the
// address goes to the clipboard with a confirming toast. The listener installs
// ONCE per page (module singletons are shared across Astro's bundled component
// scripts), so multiple components can call installEmailCopy() without stacking
// duplicate listeners (which would fire the toast more than once).
import { showToast } from './toast';

let installed = false;

export function installEmailCopy(): void {
  if (installed) return;
  installed = true;
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest?.('[data-copy-email]');
    if (!btn) return;
    const email = (btn as HTMLElement).dataset.copyEmail?.trim();
    if (!email) return;
    navigator.clipboard?.writeText(email).then(
      () => showToast('Email copied', email),
      () => showToast('Couldn’t copy the email', 'Select and copy the address manually.', 'error'),
    );
  });
}
