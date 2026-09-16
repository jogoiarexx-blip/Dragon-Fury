// ===== LOADING REAL ENTRE FASES =====
// Carrega assets reais (sprites/imagens) registrados para a próxima fase
// e só libera o gameplay quando todas as tarefas de preparação terminarem.

const phaseLoadingScreen = {
    imageCache: new Map(),
    active: false,

    getElements() {
        return {
            root: document.getElementById('phase-loading-screen'),
            from: document.getElementById('phase-loading-from'),
            to: document.getElementById('phase-loading-to'),
            name: document.getElementById('phase-loading-name'),
            fill: document.getElementById('phase-loading-fill'),
            percent: document.getElementById('phase-loading-percent'),
            status: document.getElementById('phase-loading-status'),
            detail: document.getElementById('phase-loading-detail'),
            spriteCount: document.getElementById('phase-loading-sprites'),
            taskCount: document.getElementById('phase-loading-tasks')
        };
    },

    show(fromStage, toStage) {
        const el = this.getElements();
        if (!el.root) return;
        const phase = phaseSystem.phases[toStage];
        this.active = true;
        el.from.textContent = `FASE ${fromStage}`;
        el.to.textContent = `FASE ${toStage}`;
        el.name.textContent = phase?.name || 'Próxima Fase';
        el.fill.style.width = '0%';
        el.percent.textContent = '0%';
        el.status.textContent = 'Analisando recursos da fase...';
        el.detail.textContent = 'Preparando carregamento real';
        el.spriteCount.textContent = 'Sprites: 0/0';
        el.taskCount.textContent = 'Tarefas: 0/0';
        el.root.classList.add('active');
        el.root.setAttribute('aria-hidden', 'false');
    },

    hide() {
        const el = this.getElements();
        if (!el.root) return;
        this.active = false;
        el.root.classList.remove('active');
        el.root.setAttribute('aria-hidden', 'true');
    },

    // Aceita assets declarados futuramente de três formas:
    // phaseSystem.phases[n].assets = ['sprites/x.webp', ...]
    // phaseSystem.phases[n].sprites = ['sprites/x.webp', ...]
    // window.DRAGON_FURY_PHASE_ASSETS[n] = ['sprites/x.webp', ...]
    getPhaseAssets(phaseNumber) {
        const phase = phaseSystem?.phases?.[phaseNumber] || {};
        const externalRegistry = window.DRAGON_FURY_PHASE_ASSETS?.[phaseNumber] || [];
        const candidates = [
            ...(Array.isArray(phase.assets) ? phase.assets : []),
            ...(Array.isArray(phase.sprites) ? phase.sprites : []),
            ...(Array.isArray(externalRegistry) ? externalRegistry : [])
        ];

        return [...new Set(candidates.filter(src =>
            typeof src === 'string' && /\.(png|webp|jpe?g|gif|avif)(\?.*)?$/i.test(src)
        ))];
    },

    loadImage(src) {
        if (this.imageCache.has(src)) return this.imageCache.get(src);

        const promise = new Promise(resolve => {
            const img = new Image();
            let finished = false;
            const done = (ok, error = null) => {
                if (finished) return;
                finished = true;
                clearTimeout(timeout);
                resolve({ src, ok, image: ok ? img : null, error });
            };

            const timeout = setTimeout(() => done(false, 'timeout'), 8000);
            img.onload = async () => {
                try {
                    if (img.decode) await img.decode().catch(() => {});
                } finally {
                    done(true);
                }
            };
            img.onerror = () => done(false, 'erro de carregamento');
            img.src = src;
        });

        this.imageCache.set(src, promise);
        return promise;
    },

    updateProgress(done, total, status, detail, spritesDone, spritesTotal) {
        const el = this.getElements();
        if (!el.root) return;
        const progress = total > 0 ? Math.round((done / total) * 100) : 100;
        el.fill.style.width = `${progress}%`;
        el.percent.textContent = `${progress}%`;
        el.status.textContent = status;
        el.detail.textContent = detail;
        el.spriteCount.textContent = `Sprites: ${spritesDone}/${spritesTotal}`;
        el.taskCount.textContent = `Tarefas: ${done}/${total}`;
    },

    nextPaint() {
        return new Promise(resolve => requestAnimationFrame(() => resolve()));
    },

    async loadPhase(phaseNumber) {
        const assets = this.getPhaseAssets(phaseNumber);
        let spritesDone = 0;

        // Tarefas reais de preparação. Assets são tarefas individuais,
        // além da preparação dos subsistemas da fase.
        const tasks = assets.map(src => ({
            label: `Carregando ${src.split('/').pop()}`,
            detail: src,
            isSprite: true,
            run: () => this.loadImage(src)
        }));

        tasks.push(
            {
                label: 'Preparando cenário',
                detail: 'Inicializando parallax da próxima fase',
                run: async () => {
                    if (typeof parallaxSystem !== 'undefined') parallaxSystem.init(phaseNumber);
                    await this.nextPaint();
                }
            },
            {
                label: 'Preparando efeitos',
                detail: 'Inicializando efeitos ambientais',
                run: async () => {
                    if (typeof phaseEffects !== 'undefined') phaseEffects.init(phaseNumber);
                    await this.nextPaint();
                }
            },
            {
                label: 'Sincronizando sistemas',
                detail: 'Finalizando recursos da fase',
                run: async () => {
                    // Força o browser a finalizar layout/pintura antes do gameplay.
                    await this.nextPaint();
                }
            }
        );

        const total = tasks.length;
        let done = 0;
        this.updateProgress(0, total, 'Preparando próxima fase...', assets.length
            ? `${assets.length} sprite(s) encontrado(s)`
            : 'Nenhum sprite externo registrado nesta versão', 0, assets.length);

        const failures = [];
        for (const task of tasks) {
            this.updateProgress(done, total, task.label, task.detail, spritesDone, assets.length);
            try {
                const result = await task.run();
                if (task.isSprite) {
                    spritesDone++;
                    if (result && result.ok === false) failures.push(result.src);
                }
            } catch (err) {
                console.warn('⚠️ Falha durante loading de fase:', task.label, err);
                if (task.isSprite) spritesDone++;
            }
            done++;
            this.updateProgress(done, total,
                done === total ? 'Fase pronta!' : 'Carregando...',
                done === total ? 'Todos os recursos disponíveis foram processados' : task.detail,
                spritesDone, assets.length);
        }

        if (failures.length) {
            console.warn('⚠️ Assets que falharam e foram ignorados para evitar travamento:', failures);
        }

        await this.nextPaint();
        return { assets: assets.length, failures };
    }
};
