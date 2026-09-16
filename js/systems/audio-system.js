// ===== SISTEMA DE ÁUDIO - DRAGON FURY =====
// 🔧 NOVO: o projeto não tinha NENHUM sistema de áudio funcional.
// Existiam apenas objetos de configuração mortos em phase1-5-*.js
// (ex: `audio: { bgm: 'peaceful_sky.mp3', ... }`) — mas nenhum arquivo
// .mp3 existia no projeto, nenhum <audio> no HTML, e nenhum código em
// lugar nenhum chamava .play(). Ou seja: 0% funcional, só metadado morto.
//
// Em vez de exigir que você grave/baixe arquivos de música e efeitos
// (o que não cabe aqui), este sistema GERA os efeitos sonoros na hora,
// via Web Audio API (osciladores + ruído), no estilo chiptune/arcade —
// combina com a estética do jogo e funciona 100% offline, sem assets.

const audioSystem = {
    ctx: null,
    masterGain: null,
    muted: false,
    unlocked: false,

    init() {
        // Restaurar preferência salva
        this.muted = localStorage.getItem('dragonAudioMuted') === 'true';

        // 🔧 Navegadores bloqueiam áudio até haver uma interação do
        // usuário (clique/toque/tecla). Criamos o AudioContext só na
        // primeira interação para evitar erros no console e garantir
        // que o som realmente toque.
        const unlock = () => {
            if (this.unlocked) return;
            this.unlocked = true;
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AC();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = this.muted ? 0 : 0.35;
                this.masterGain.connect(this.ctx.destination);
            } catch (e) {
                debugWarn('🔇 Web Audio API indisponível neste navegador:', e.message);
            }
        };
        ['click', 'touchstart', 'keydown'].forEach(evt => {
            document.addEventListener(evt, unlock, { once: true });
        });

        // Som de clique em qualquer botão de menu (delegado — não precisa
        // editar cada onclick do HTML)
        document.addEventListener('click', (e) => {
            if (e.target.closest && e.target.closest('.menu-button, .close-button')) {
                this.playClick();
            }
        });

        this.updateMuteButton();
    },

    // Garante que o contexto está pronto e "acordado" (alguns navegadores
    // suspendem o AudioContext automaticamente)
    ready() {
        if (!this.ctx) return false;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return true;
    },

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('dragonAudioMuted', this.muted);
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : 0.35;
        }
        this.updateMuteButton();
    },

    updateMuteButton() {
        const btn = document.getElementById('mute-toggle-btn');
        if (btn) btn.textContent = this.muted ? '🔇' : '🔊';
    },

    // ---- construtor genérico de "beep" (oscilador com envelope) ----
    tone(freq, duration, { type = 'square', volume = 0.5, freqEnd = null, delay = 0 } = {}) {
        if (!this.ready()) return;
        const t0 = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        if (freqEnd !== null) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration);
        }

        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t0);
        osc.stop(t0 + duration + 0.02);
    },

    // ---- ruído branco (explosões/impactos) ----
    noise(duration, { volume = 0.4, delay = 0, filterFreq = 1200 } = {}) {
        if (!this.ready()) return;
        const t0 = this.ctx.currentTime + delay;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, t0);
        filter.frequency.exponentialRampToValueAtTime(80, t0 + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        source.start(t0);
    },



    // Reduz temporariamente o volume geral durante sequências cinematográficas.
    // Como o jogo gera áudio em tempo real (não há BGM externo), este ducking
    // representa a queda de intensidade sonora antes da entrada do boss.
    setMasterLevel(level = 0.35, ramp = 0.18) {
        if (!this.ready() || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const target = this.muted ? 0 : Math.max(0, Math.min(0.6, level));
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(target, now + Math.max(0.01, ramp));
    },

    duckForBossIntro() {
        this.setMasterLevel(0.11, 0.22);
    },

    restoreAfterBossIntro() {
        this.setMasterLevel(0.35, 0.28);
    },

    playBossReveal() {
        this.tone(82, 0.65, { type: 'sawtooth', volume: 0.22, freqEnd: 42 });
        this.noise(0.28, { volume: 0.16, delay: 0.12, filterFreq: 900 });
    },

    playFight() {
        this.tone(392, 0.08, { type: 'square', volume: 0.2 });
        this.tone(523, 0.10, { type: 'square', volume: 0.22, delay: 0.07 });
        this.tone(784, 0.16, { type: 'square', volume: 0.24, delay: 0.14 });
    },

    // ================= EFEITOS DO JOGO =================

    playShoot() {
        this.tone(880, 0.08, { type: 'square', volume: 0.15, freqEnd: 440 });
    },

    playHit() {
        this.tone(220, 0.07, { type: 'triangle', volume: 0.25, freqEnd: 80 });
    },

    playExplosion() {
        this.noise(0.35, { volume: 0.4, filterFreq: 1500 });
        this.tone(120, 0.25, { type: 'sawtooth', volume: 0.2, freqEnd: 40 });
    },

    playBossExplosion() {
        this.noise(0.7, { volume: 0.5, filterFreq: 2000 });
        this.tone(90, 0.6, { type: 'sawtooth', volume: 0.3, freqEnd: 30 });
        this.tone(60, 0.8, { type: 'sawtooth', volume: 0.25, freqEnd: 20, delay: 0.08 });
    },

    playPlayerHit() {
        this.tone(150, 0.15, { type: 'sawtooth', volume: 0.3, freqEnd: 60 });
        this.noise(0.15, { volume: 0.2, filterFreq: 600 });
    },

    playCoin() {
        this.tone(988, 0.06, { type: 'square', volume: 0.2 });
        this.tone(1319, 0.09, { type: 'square', volume: 0.2, delay: 0.05 });
    },

    playPowerup() {
        this.tone(523, 0.09, { type: 'square', volume: 0.2 });
        this.tone(659, 0.09, { type: 'square', volume: 0.2, delay: 0.07 });
        this.tone(784, 0.14, { type: 'square', volume: 0.22, delay: 0.14 });
    },

    playBossWarning() {
        this.tone(140, 0.3, { type: 'sawtooth', volume: 0.25 });
        this.tone(140, 0.3, { type: 'sawtooth', volume: 0.25, delay: 0.35 });
    },

    playPhaseComplete() {
        [523, 659, 784, 1047].forEach((f, i) => {
            this.tone(f, 0.18, { type: 'square', volume: 0.22, delay: i * 0.12 });
        });
    },

    playGameOver() {
        [392, 349, 294, 220].forEach((f, i) => {
            this.tone(f, 0.35, { type: 'triangle', volume: 0.25, delay: i * 0.18 });
        });
    },

    playClick() {
        this.tone(660, 0.05, { type: 'square', volume: 0.12 });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    audioSystem.init();
});
