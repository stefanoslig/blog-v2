// src/layouts/components/theme-init.ts
// Exported as a string so Base.astro can inline it into <head> with is:inline.
// It runs before paint to prevent a flash of the wrong theme.
export const themeInitScript = `
(function () {
  function applyTheme() {
    try {
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (e) { /* ignore: no localStorage, etc. */ }
  }
  applyTheme();
  // Re-apply after Astro view transitions, since the swapped-in <html> from the
  // SSR'd page never carries the .dark class that was set client-side.
  document.addEventListener('astro:after-swap', applyTheme);
})();
`;
