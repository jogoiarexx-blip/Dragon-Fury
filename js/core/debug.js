// ===== DEBUG LOGGER - DRAGON FURY =====
// Logs de desenvolvimento só aparecem quando a URL contém ?debug=1.
const DEBUG_MODE = new URLSearchParams(window.location.search).get('debug') === '1';
function debugLog(...args) { if (DEBUG_MODE) console.log(...args); }
function debugWarn(...args) { if (DEBUG_MODE) console.warn(...args); }
window.DEBUG_MODE = DEBUG_MODE;
window.debugLog = debugLog;
window.debugWarn = debugWarn;
