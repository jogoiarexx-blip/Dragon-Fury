// ===== SAVE SYSTEM - DRAGON FURY =====
const saveSystem = {
    getNumber(key, fallback = 0) {
        const value = Number(localStorage.getItem(key));
        return Number.isFinite(value) ? value : fallback;
    },
    getString(key, fallback = '') {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
    },
    getJSON(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (_) { return fallback; }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            return true;
        } catch (err) {
            debugWarn('Falha ao salvar', key, err);
            return false;
        }
    },
    remove(key) { try { localStorage.removeItem(key); return true; } catch (_) { return false; } }
};
window.saveSystem = saveSystem;
