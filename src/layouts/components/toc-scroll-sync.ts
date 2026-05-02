// src/layouts/components/toc-scroll-sync.ts
// Exported as a string so pages can inline it with <script is:inline set:html>.
// It runs on first load and on every ClientRouter page-load event.
// Uses a window-scoped guard to avoid double-binding the astro:page-load listener
// when the script is re-inlined by a new page, and disconnects any prior
// IntersectionObserver to prevent observer accumulation across navigations.
export const tocScrollSyncScript = `
(function () {
  var w = window;

  function initTOC() {
    if (w.__tocObserver) { w.__tocObserver.disconnect(); w.__tocObserver = null; }

    var links = Array.prototype.slice.call(document.querySelectorAll('.toc-link'));
    if (links.length === 0) return;

    var ids = links.map(function (l) { return l.getAttribute('data-target'); }).filter(Boolean);
    var headings = ids.map(function (id) { return document.getElementById(id); }).filter(function (e) { return !!e; });
    if (headings.length === 0) return;

    function setActive(id) {
      links.forEach(function (a) {
        if (a.getAttribute('data-target') === id) a.classList.add('active');
        else a.classList.remove('active');
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });

    headings.forEach(function (h) { observer.observe(h); });
    setActive(headings[0].id);
    w.__tocObserver = observer;
  }

  if (!w.__tocSyncBound) {
    w.__tocSyncBound = true;
    document.addEventListener('astro:page-load', initTOC);
    document.addEventListener('astro:before-swap', function () {
      if (w.__tocObserver) { w.__tocObserver.disconnect(); w.__tocObserver = null; }
    });
  }

  if (document.readyState !== 'loading') initTOC();
  else document.addEventListener('DOMContentLoaded', initTOC);
})();
`;
