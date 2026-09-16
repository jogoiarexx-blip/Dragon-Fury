// ===== MISSION DIRECTOR - DRAGON FURY =====
// Substitui o antigo "mate X inimigos" por um roteiro de combate por segmentos.
// Kills continuam sendo estatística/rank, mas NÃO liberam mais o boss.

const missionDirector = {
    active: false,
    phase: 1,
    stepIndex: 0,
    stepFrame: 0,
    stepStarted: false,
    bossReady: false,
    spawnedInStep: 0,
    nextSpawnFrame: 0,
    eliteRef: null,
    messageCooldown: 0,

    scripts: {
        1: [
            { type: 'briefing', title: 'ENTRANDO NO CÉU SERENO', subtitle: 'Rompa a patrulha inimiga', duration: 110 },
            { type: 'wave', title: 'PATRULHA AVANÇADA', groups: [
                { pattern: 'line', enemy: 'basic', count: 4 },
                { pattern: 'v', enemy: 'zigzag', count: 5 }
            ]},
            { type: 'wave', title: 'FORMAÇÃO HOSTIL', groups: [
                { pattern: 'v', enemy: 'basic', count: 5 },
                { pattern: 'line', enemy: 'zigzag', count: 4 }
            ]},
            { type: 'elite', title: 'GUARDIÃO DA VANGUARDA', enemy: 'basic', difficulty: 1.55, healthScale: 5.0, sizeScale: 1.35 },
            { type: 'boss_gate', title: 'AMEAÇA PRINCIPAL DETECTADA' }
        ],
        2: [
            { type: 'briefing', title: 'TEMPESTADE IMINENTE', subtitle: 'Atravesse a frente elétrica', duration: 100 },
            { type: 'survival', title: 'FRENTE DE TEMPESTADE', duration: 420, interval: 72, maxEnemies: 7, enemies: ['basic','zigzag'] },
            { type: 'wave', title: 'LINHA DE ATIRADORES', groups: [
                { pattern: 'line', enemy: 'sniper', count: 4 },
                { pattern: 'double', enemy: 'tank', count: 2 }
            ]},
            { type: 'survival', title: 'PRESSÃO ATMOSFÉRICA', duration: 360, interval: 60, maxEnemies: 8, enemies: ['zigzag','sniper','tank'] },
            { type: 'elite', title: 'ARÍETE DA TEMPESTADE', enemy: 'tank', difficulty: 1.6, healthScale: 4.0, sizeScale: 1.25 },
            { type: 'boss_gate', title: 'OLHO DA TEMPESTADE' }
        ],
        3: [
            { type: 'briefing', title: 'FÚRIA ARDENTE', subtitle: 'O corredor de fogo está instável', duration: 100 },
            { type: 'wave', title: 'INVESTIDA INCENDIÁRIA', groups: [
                { pattern: 'v', enemy: 'kamikaze', count: 5 },
                { pattern: 'line', enemy: 'basic', count: 5 }
            ]},
            { type: 'survival', title: 'CHUVA DE CINZAS', duration: 420, interval: 56, maxEnemies: 9, enemies: ['kamikaze','zigzag','sniper'] },
            { type: 'wave', title: 'MURALHA DE MAGMA', groups: [
                { pattern: 'line', enemy: 'tank', count: 4 },
                { pattern: 'v', enemy: 'kamikaze', count: 5 }
            ]},
            { type: 'elite', title: 'COLOSSO ÍGNEO', enemy: 'tank', difficulty: 1.85, healthScale: 5.0, sizeScale: 1.35 },
            { type: 'boss_gate', title: 'A FONTE DA FÚRIA SE APROXIMA' }
        ],
        4: [
            { type: 'briefing', title: 'ABISMO SOMBRIO', subtitle: 'Sinais vitais desaparecendo', duration: 100 },
            { type: 'wave', title: 'EMBOSCADA DO VAZIO', groups: [
                { pattern: 'v', enemy: 'parasite', count: 5 },
                { pattern: 'line', enemy: 'sniper', count: 4 }
            ]},
            { type: 'survival', title: 'ZONA SEM LUZ', duration: 480, interval: 58, maxEnemies: 10, enemies: ['parasite','zigzag','kamikaze'] },
            { type: 'wave', title: 'CERCO SOMBRIO', groups: [
                { pattern: 'line', enemy: 'tank', count: 3 },
                { pattern: 'v', enemy: 'parasite', count: 5 },
                { pattern: 'double', enemy: 'sniper', count: 2 }
            ]},
            { type: 'elite', title: 'ARAUTO DO ABISMO', enemy: 'parasite', difficulty: 2.0, healthScale: 6.0, sizeScale: 1.4 },
            { type: 'boss_gate', title: 'ALGO ENORME SE MOVE NO VAZIO' }
        ],
        5: [
            { type: 'briefing', title: 'INVASÃO CÓSMICA', subtitle: 'Rompa a frota antes do núcleo', duration: 100 },
            { type: 'survival', title: 'CORREDOR DE WARP', duration: 420, interval: 50, maxEnemies: 11, enemies: ['kamikaze','parasite','sniper'] },
            { type: 'wave', title: 'FROTA DE ASSALTO', groups: [
                { pattern: 'line', enemy: 'tank', count: 4 },
                { pattern: 'v', enemy: 'parasite', count: 5 },
                { pattern: 'line', enemy: 'sniper', count: 4 }
            ]},
            { type: 'survival', title: 'NÚCLEO DE INVOCAÇÃO', duration: 480, interval: 55, maxEnemies: 12, enemies: ['summoner','parasite','tank','kamikaze'] },
            { type: 'wave', title: 'ÚLTIMA BARREIRA', groups: [
                { pattern: 'v', enemy: 'summoner', count: 3 },
                { pattern: 'line', enemy: 'tank', count: 4 },
                { pattern: 'v', enemy: 'kamikaze', count: 5 }
            ]},
            { type: 'elite', title: 'COMANDANTE DA FROTA', enemy: 'summoner', difficulty: 2.25, healthScale: 6.0, sizeScale: 1.35 },
            { type: 'boss_gate', title: 'NÚCLEO DO CAOS EXPOSTO' }
        ]
    },

    startPhase(phaseNum) {
        this.phase = phaseNum;
        this.active = !!this.scripts[phaseNum];
        this.stepIndex = 0;
        this.stepFrame = 0;
        this.stepStarted = false;
        this.bossReady = false;
        this.spawnedInStep = 0;
        this.nextSpawnFrame = 0;
        this.eliteRef = null;
        if (this.active) this.announceCurrentStep();
    },

    reset() {
        this.startPhase(this.phase || 1);
    },

    getSteps() {
        return this.scripts[this.phase] || [];
    },

    getCurrentStep() {
        return this.getSteps()[this.stepIndex] || null;
    },

    announceCurrentStep() {
        const step = this.getCurrentStep();
        if (!step) return;
        if (typeof ui !== 'undefined' && ui.showNotification) {
            const text = step.subtitle ? `${step.title} — ${step.subtitle}` : step.title;
            ui.showNotification(`⚔️ ${text}`, step.type === 'elite' ? 'warning' : 'info');
        }
    },

    advanceStep() {
        this.stepIndex++;
        this.stepFrame = 0;
        this.stepStarted = false;
        this.spawnedInStep = 0;
        this.nextSpawnFrame = 0;
        this.eliteRef = null;
        if (this.stepIndex < this.getSteps().length) this.announceCurrentStep();
    },

    update() {
        if (!this.active || this.bossReady || gameData.gameState !== 'playing' || gameData.bossActive) return;
        const step = this.getCurrentStep();
        if (!step) return;
        this.stepFrame++;

        switch (step.type) {
            case 'briefing':
                if (this.stepFrame >= (step.duration || 90)) this.advanceStep();
                break;
            case 'wave':
                this.updateWave(step);
                break;
            case 'survival':
                this.updateSurvival(step);
                break;
            case 'elite':
                this.updateElite(step);
                break;
            case 'boss_gate':
                this.updateBossGate(step);
                break;
        }
    },

    updateWave(step) {
        if (!this.stepStarted) {
            this.stepStarted = true;
            this.groupIndex = 0;
            this.nextSpawnFrame = 20;
        }
        if (this.groupIndex < step.groups.length && this.stepFrame >= this.nextSpawnFrame) {
            this.spawnGroup(step.groups[this.groupIndex]);
            this.groupIndex++;
            this.nextSpawnFrame = this.stepFrame + 95;
        }
        if (this.groupIndex >= step.groups.length && gameEntities.enemies.length === 0 && this.stepFrame > this.nextSpawnFrame - 45) {
            this.advanceStep();
        }
    },

    updateSurvival(step) {
        if (!this.stepStarted) {
            this.stepStarted = true;
            this.nextSpawnFrame = 1;
        }
        const duration = step.duration || 360;
        if (this.stepFrame <= duration && this.stepFrame >= this.nextSpawnFrame) {
            if (gameEntities.enemies.length < (step.maxEnemies || 8)) {
                const type = step.enemies[Math.floor(Math.random() * step.enemies.length)];
                const pattern = Math.random() < 0.35 ? 'double' : 'single';
                this.spawnGroup({ pattern, enemy: type, count: pattern === 'double' ? 2 : 1 });
            }
            this.nextSpawnFrame = this.stepFrame + (step.interval || 60);
        }
        // O relógio termina, mas o segmento só conclui quando o jogador limpa o que restou.
        if (this.stepFrame > duration && gameEntities.enemies.length === 0) this.advanceStep();
    },

    updateElite(step) {
        if (!this.stepStarted) {
            this.stepStarted = true;
            this.eliteRef = this.spawnElite(step);
        }
        // Se morreu ou foi removido do array, o segmento acabou.
        if (this.eliteRef && !gameEntities.enemies.includes(this.eliteRef)) this.advanceStep();
    },

    updateBossGate() {
        // Boss só é liberado com a arena limpa.
        if (gameEntities.enemies.length === 0) {
            this.bossReady = true;
            this.stepFrame = 0;
        }
    },

    spawnGroup(group) {
        const phase = phaseSystem.getCurrentPhase();
        const difficulty = phase.spawnConfig.difficultyMultiplier;
        const type = group.enemy;
        const count = Math.max(1, group.count || 1);
        const w = gameData.canvas.width;

        if (group.pattern === 'v') {
            const spacing = 58;
            const center = w / 2;
            for (let i = 0; i < count; i++) {
                const row = Math.ceil(i / 2);
                const side = i === 0 ? 0 : (i % 2 ? -1 : 1);
                spawnSystem.createEnemy(type, center + side * row * spacing - 20, -55 - row * 35, difficulty);
            }
        } else if (group.pattern === 'line') {
            const gap = w / (count + 1);
            for (let i = 0; i < count; i++) spawnSystem.createEnemy(type, gap * (i + 1) - 20, -55, difficulty);
        } else if (group.pattern === 'double') {
            const x = 90 + Math.random() * Math.max(1, w - 240);
            spawnSystem.createEnemy(type, x, -55, difficulty);
            spawnSystem.createEnemy(type, Math.min(w - 55, x + 110), -75, difficulty);
        } else {
            for (let i = 0; i < count; i++) {
                spawnSystem.createEnemy(type, 25 + Math.random() * Math.max(1, w - 90), -55 - i * 18, difficulty);
            }
        }
    },

    spawnElite(step) {
        const phase = phaseSystem.getCurrentPhase();
        const difficulty = (step.difficulty || 1.5) * phase.spawnConfig.difficultyMultiplier;
        const enemy = spawnSystem.createEnemy(step.enemy, gameData.canvas.width / 2 - 35, -80, difficulty);
        if (!enemy) return null;
        enemy.missionElite = true;
        enemy.width *= step.sizeScale || 1.25;
        enemy.height *= step.sizeScale || 1.25;
        enemy.health *= step.healthScale || 4;
        enemy.maxHealth = enemy.health;
        enemy.points = Math.floor((enemy.points || 500) * 2.5);
        enemy.color = '#FF7A18';
        return enemy;
    },

    isBossReady() {
        return this.active && this.bossReady;
    },

    onBossSpawned() {
        this.bossReady = false;
        this.active = false;
    },

    getProgress() {
        const steps = this.getSteps();
        if (!steps.length) return { current: 0, target: 1, percentage: 0, label: 'Missão', detail: '' };
        if (gameData.bossActive) return { current: steps.length, target: steps.length, percentage: 100, label: 'BOSS', detail: 'Combate principal' };
        const step = this.getCurrentStep();
        let local = 0;
        if (step) {
            if (step.type === 'briefing') local = Math.min(1, this.stepFrame / (step.duration || 90));
            else if (step.type === 'survival') local = Math.min(1, this.stepFrame / (step.duration || 360));
            else if (step.type === 'wave' && step.groups && step.groups.length) local = Math.min(1, (this.groupIndex || 0) / step.groups.length);
            else if (step.type === 'elite') local = this.eliteRef && this.eliteRef.maxHealth ? Math.max(0, 1 - this.eliteRef.health / this.eliteRef.maxHealth) : 0;
            else if (step.type === 'boss_gate') local = 0.9;
        }
        const percentage = Math.min(99, Math.floor(((this.stepIndex + local) / steps.length) * 100));
        return {
            current: Math.min(this.stepIndex + 1, steps.length),
            target: steps.length,
            percentage,
            label: step ? step.title : 'MISSÃO',
            detail: step ? this.describeStep(step) : ''
        };
    },

    describeStep(step) {
        if (step.type === 'briefing') return step.subtitle || 'Preparando combate';
        if (step.type === 'survival') return 'Sobreviva e limpe a área';
        if (step.type === 'wave') return 'Destrua a formação inimiga';
        if (step.type === 'elite') return 'Elimine o alvo de alta prioridade';
        if (step.type === 'boss_gate') return 'Limpe a arena para o confronto';
        return '';
    }
};

window.missionDirector = missionDirector;
