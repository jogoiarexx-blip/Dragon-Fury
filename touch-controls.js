// ===== CONTROLES TOUCH (MOBILE) - DRAGON FURY =====
// 🔧 NOVO: o jogo só respondia a teclado (keys[]). Este arquivo liga os
// botões touch nas mesmas teclas que dragon.update() já lê, então nenhuma
// outra parte do jogo precisa mudar.

const touchControls = {
    active: false,

    init() {
        // Só mostra os controles touch em dispositivos com tela sensível ao toque
        this.active = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

        if (!this.active) return;

        const container = document.getElementById('touch-controls');
        if (container) container.style.display = 'flex';

        const buttons = document.querySelectorAll('#touch-controls [data-key]');
        buttons.forEach(btn => this.bindButton(btn));
    },

    bindButton(btn) {
        const key = btn.dataset.key;

        const press = (e) => {
            e.preventDefault();
            keys[key] = true;
            btn.classList.add('pressed');
        };

        const release = (e) => {
            e.preventDefault();
            keys[key] = false;
            btn.classList.remove('pressed');
        };

        // touchstart/touchend cobrem o toque; pointerdown/up dão suporte
        // extra em tablets/notebooks híbridos com caneta ou mouse.
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });
        btn.addEventListener('pointerdown', press);
        btn.addEventListener('pointerup', release);
        btn.addEventListener('pointerleave', release);

        // Evita que o navegador trate o botão como texto selecionável/zoom
        btn.addEventListener('contextmenu', (e) => e.preventDefault());
    },

    // 🔧 BUGFIX de segurança: se o jogo for pausado/reiniciado enquanto um
    // dedo ainda está em cima de um botão, o keydown correspondente pode
    // ficar "preso" em true para sempre. Isso zera tudo.
    releaseAll() {
        document.querySelectorAll('#touch-controls [data-key]').forEach(btn => {
            keys[btn.dataset.key] = false;
            btn.classList.remove('pressed');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    touchControls.init();
});
