/* --------------------------------------------------------------------------
   Page transition veil

   A full-reload MPA can still feel continuous: cover the outgoing page, let
   the browser navigate, then lift the cover off the new one. Everything here
   is decorative — if any part fails the link still navigates normally.
   -------------------------------------------------------------------------- */

const veil = document.querySelector('[data-veil]');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (veil && !reduced) {
  // Arriving: the page starts covered and the veil peels upward.
  veil.classList.add('veil--enter');
  veil.addEventListener('animationend', () => veil.classList.remove('veil--enter'), { once: true });

  const isInternal = (link) => {
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return false;
    if (link.origin !== window.location.origin) return false;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    return link.pathname !== window.location.pathname;
  };

  document.addEventListener('click', (event) => {
    // Let the browser handle modified clicks (new tab, download, etc.).
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    const link = event.target.closest('a[href]');
    if (!isInternal(link)) return;

    event.preventDefault();
    veil.classList.add('veil--leave');

    const go = () => { window.location.href = link.href; };
    veil.addEventListener('animationend', go, { once: true });
    // Never let a dropped animation event strand the visitor.
    setTimeout(go, 700);
  });

  // Returning via the back button restores from bfcache with the veil still up.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) veil.classList.remove('veil--leave');
  });
}
