// ---------------------------------------------------------------------------
// Page-scroll lock for open cds-modal dialogs (@carbon/web-components@2.59.0).
//
// carbon-checked: this module builds NO UI. It watches Carbon's OWN `open`
// attribute on already-registered <cds-modal> elements and toggles a class on
// <html>; the actual lock is one token-free CSS rule in src/styles/theme.css.
// No primitive is reinvented — this is a behavioral shim for a library gap.
//
// The gap: Carbon's cds-modal renders a full-viewport overlay but does NOT stop
// the page behind it from scrolling while open (modal.js has no overflow/scroll
// handling on the open transition — Carbon's React layer locks the body, the
// web-components layer doesn't). Result: the wheel/trackpad scrolls the page
// under the dialog, and on a short viewport the dialog scrolls out of view.
//
// The DURABLE fix is upstream (bump Carbon once the WC modal locks scroll).
// Until then: while ANY cds-modal is open, add `.cds-modal-open` to <html>,
// which sets overflow:hidden. We also measure the scrollbar width the lock
// removes and expose it as --modal-scrollbar-comp so the page can pad it back
// and not shift. `open` reflects to an attribute (reflect:true in modal.js), so
// a MutationObserver on that attribute catches every toggle — including the
// `.open = true` the pages set in JS. Ref-free: we just re-query for any open
// modal, so stacked/sequential dialogs settle correctly.
//
// Imported from carbon.ts so it loads with the registry, after cds-modal is
// defined.
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  const root = document.documentElement;

  const anyModalOpen = (): boolean => !!document.querySelector('cds-modal[open]');

  const sync = (): void => {
    const open = anyModalOpen();
    if (open === root.classList.contains('cds-modal-open')) return; // no change
    if (open) {
      // Width the scrollbar occupied (0 with overlay scrollbars, e.g. macOS) —
      // pad it back so hiding overflow doesn't jump the page sideways.
      const sbw = window.innerWidth - root.clientWidth;
      root.style.setProperty('--modal-scrollbar-comp', sbw > 0 ? `${sbw}px` : '0px');
      root.classList.add('cds-modal-open');
    } else {
      root.classList.remove('cds-modal-open');
      root.style.removeProperty('--modal-scrollbar-comp');
    }
  };

  customElements.whenDefined('cds-modal').catch(() => {}).then(sync);

  // `open` toggles the attribute (reflect:true); childList catches modals that
  // are added/removed while already open. sync() is a single querySelector, so
  // firing broadly is cheap.
  new MutationObserver(sync).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open'],
  });
}
