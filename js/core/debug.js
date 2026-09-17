// ===== DEBUG LOGGER - DRAGON FURY =====
// Logs de desenvolvimento só aparecem quando a URL contém ?debug=1.
window.DEBUG_MODE = new URLSearchParams(window.location.search).get('debug') === '1';
window.debugLog = (...args) => { if (window.DEBUG_MODE) console.log(...args); };
window.debugWarn = (...args) => { if (window.DEBUG_MODE) console.warn(...args); };
