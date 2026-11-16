// Run before the stylesheet so a saved dark theme never flashes light.
(() => {
  const storageKey = 'word-mine-theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = readPreference();

  function readPreference() {
    try {
      const value = localStorage.getItem(storageKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch { return null; }
  }

  function applyTheme() {
    const theme = preference || (systemTheme.matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    const palettes = { wordmine: {light:'#f5f7f3',dark:'#141714'}, spy: {light:'#f8f6f6',dark:'#151414'} };
    document.querySelector('meta[name="theme-color"]').content = palettes[document.documentElement.dataset.game]?.[theme] || (theme === 'dark' ? '#20211f' : '#f2f0e9');
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      toggle.title = theme === 'dark' ? (toggle.dataset.lightTitle || 'Включить светлую тему') : (toggle.dataset.darkTitle || 'Включить тёмную тему');
    }
  }

  window.addEventListener('wordmine:theme-labels', applyTheme);
  window.addEventListener('wordmine:palette', applyTheme);
  applyTheme();
  systemTheme.addEventListener('change', () => { if (!preference) applyTheme(); });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      preference = readPreference();
      applyTheme();
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.getElementById('theme-toggle').addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(storageKey, preference); } catch {}
      applyTheme();
    });
  });
})();
