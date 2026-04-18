/**
 * Theme Toggle
 * Handles dark/light mode switching with localStorage persistence
 * and system preference detection.
 */
(function() {
  'use strict';

  var THEME_KEY = 'theme';
  var DARK = 'dark';
  var LIGHT = 'light';

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || LIGHT;
  }

  function setTheme(theme) {
    if (theme === DARK) {
      document.documentElement.setAttribute('data-theme', DARK);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    var current = getCurrentTheme();
    setTheme(current === DARK ? LIGHT : DARK);
  }

  function init() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleTheme();
    });

    // Listen for system preference changes when no explicit user preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem(THEME_KEY)) {
          if (e.matches) {
            document.documentElement.setAttribute('data-theme', DARK);
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
