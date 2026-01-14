/**
 * Theme Toggle - Iron & Vitality (Dark) / Restoration & Care (Light)
 * Supports theme switching with localStorage persistence
 */

function toggleTheme() {
  const body = document.body;
  const html = document.documentElement;
  
  // Toggle between themes
  const isDark = body.classList.contains('theme-dark');
  
  if (isDark) {
    // Switch to light theme
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    html.classList.remove('theme-dark');
    html.classList.add('theme-light');
    localStorage.setItem('theme', 'light');
  } else {
    // Switch to dark theme (default)
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    html.classList.remove('theme-light');
    html.classList.add('theme-dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Apply saved theme preference on page load
(function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  const html = document.documentElement;
  
  // Default to dark theme if no preference saved
  if (savedTheme === 'light') {
    body.classList.add('theme-light');
    html.classList.add('theme-light');
    body.classList.remove('theme-dark');
    html.classList.remove('theme-dark');
  } else {
    body.classList.add('theme-dark');
    html.classList.add('theme-dark');
    body.classList.remove('theme-light');
    html.classList.remove('theme-light');
  }
})();
