// ===== SISTEMA DE FASES - DRAGON FURY =====

const phaseSystem = {
    currentPhase: 1,
    // 🔧 BUGFIX: só existem arquivos/conteúdo completos para as fases 1-5
    // (phase1-ceu-sereno.js ... phase5-invasao-cosmica.js, e data.js.stages
    // também só vai até 5). A entrada "6: Batalha Final" abaixo era código
    // morto que nunca tinha assets próprios; se currentPhase chegasse a 6
    // outras partes do jogo que só sabem contar até 5 quebrariam. Fase 5
    // agora é a fase final.
    maxPhases: 5,
    
    phases: {
        1: {
            name: 'Céu Sereno',
            description: 'O início da jornada',
            background: {
                primary: '#000033',
                secondary: '#000055',
                tertiary: '#000011'
            },
            scrollSpeed: 2,
            duration: 0, // Infinito até objetivo
            targetKills: 20,
            
            // Configuração de spawn
            spawnConfig: {
                enemies: ['basic', 'zigzag'],
                spawnRate: 0.02,
                maxEnemies: 8,
                difficultyMultiplier: 1.0
            },
            
            // Boss da fase
            boss: {
                type: 'AncientDragonBoss',
                spawnCondition: 'kills' // Aparece após kills objetivo
            },
            assets: ['assets/bosses/ancient-dragon-boss.webp'],
            
            // Música e efeitos
            ambience: {
                starDensity: 100,
                starSpeed: 1.0,
                cloudDensity: 0
            }
        },
        
        2: {
            name: 'Tempestade Iminente',
            description: 'As nuvens se agitam',
            background: {
                primary: '#1a0033',
                secondary: '#2d0055',
                tertiary: '#0d0022'
            },
            scrollSpeed: 2.5,
            targetKills: 30,
            
            spawnConfig: {
                enemies: ['basic', 'zigzag', 'tank', 'sniper'],
                spawnRate: 0.025,
                maxEnemies: 10,
                difficultyMultiplier: 1.3
            },
            
            boss: {
                type: 'AncientDragonBoss',
                spawnCondition: 'kills'
            },
            assets: ['assets/bosses/ancient-dragon-boss.webp'],
            
            ambience: {
                starDensity: 80,
                starSpeed: 1.2,
                cloudDensity: 3,
                lightning: true
            }
        },
        
        3: {
            name: 'Fúria Ardente',
            description: 'O céu queima em chamas',
            background: {
                primary: '#330011',
                secondary: '#550022',
                tertiary: '#220005'
            },
            scrollSpeed: 3,
            targetKills: 40,
            
            spawnConfig: {
                enemies: ['basic', 'zigzag', 'tank', 'sniper', 'kamikaze'],
                spawnRate: 0.03,
                maxEnemies: 12,
                difficultyMultiplier: 1.6
            },
            
            boss: {
                type: 'SegmentedSerpentBoss',
                spawnCondition: 'kills'
            },
            
            ambience: {
                starDensity: 60,
                starSpeed: 1.4,
                cloudDensity: 0,
                fireParticles: true
            }
        },
        
        4: {
            name: 'Abismo Sombrio',
            description: 'A escuridão prevalece',
            background: {
                primary: '#110022',
                secondary: '#1a0033',
                tertiary: '#080014'
            },
            scrollSpeed: 3.5,
            targetKills: 50,
            
            spawnConfig: {
                enemies: ['zigzag', 'tank', 'sniper', 'kamikaze', 'parasite'],
                spawnRate: 0.035,
                maxEnemies: 14,
                difficultyMultiplier: 2.0
            },
            
            boss: {
                type: 'SegmentedSerpentBoss',
                spawnCondition: 'kills'
            },
            
            ambience: {
                starDensity: 40,
                starSpeed: 1.6,
                cloudDensity: 5,
                darkFog: true
            }
        },
        
        5: {
            name: 'Invasão Cósmica',
            description: 'Forças alienígenas atacam',
            background: {
                primary: '#220033',
                secondary: '#330055',
                tertiary: '#110022'
            },
            scrollSpeed: 4,
            targetKills: 60,
            
            spawnConfig: {
                enemies: ['tank', 'sniper', 'kamikaze', 'parasite', 'summoner'],
                spawnRate: 0.04,
                maxEnemies: 16,
                difficultyMultiplier: 2.5
            },
            
            boss: {
                type: 'ChaosGeometryBoss',
                spawnCondition: 'kills'
            },
            
            ambience: {
                starDensity: 120,
                starSpeed: 2.0,
                cloudDensity: 0,
                warpEffect: true
            }
        },
        
        6: {
            name: 'Batalha Final',
            description: 'O confronto definitivo',
            background: {
                primary: '#330022',
                secondary: '#550033',
                tertiary: '#220011'
            },
            scrollSpeed: 4.5,
            targetKills: 70,
            
            spawnConfig: {
                enemies: ['zigzag', 'tank', 'sniper', 'kamikaze', 'parasite', 'summoner'],
                spawnRate: 0.045,
                maxEnemies: 20,
                difficultyMultiplier: 3.0
            },
            
            boss: {
                type: 'ChaosGeometryBoss',
                spawnCondition: 'kills'
            },
            
            ambience: {
                starDensity: 150,
                starSpeed: 2.5,
                cloudDensity: 8,
                chaosEffect: true
            }
        }
    },
    
    init() {
        this.currentPhase = 1;
        this.applyPhase(1);
    },
    
    applyPhase(phaseNum) {
        if (phaseNum < 1 || phaseNum > this.maxPhases) {
            console.error('Fase inválida:', phaseNum);
            return;
        }
        
        const phase = this.phases[phaseNum];
        
        // 🔧 BUGFIX: antes só gameData.currentStage era atualizado aqui;
        // this.currentPhase só mudava dentro de nextPhase(). Chamar
        // applyPhase() diretamente (como faz repeatStage()/startAtStage(),
        // usado pelo novo seletor de fases) deixava currentPhase
        // dessincronizado de gameData.currentStage, e getCurrentPhase()
        // continuava retornando os dados da fase errada.
        this.currentPhase = phaseNum;
        
        // Atualizar dados do jogo
        gameData.currentStage = phaseNum;
        gameData.stageTargetKills = phase.targetKills;
        gameData.scrollSpeed = phase.scrollSpeed;
        
        // Resetar contador de kills
        gameData.enemiesKilledThisStage = 0;
        gameData.bossActive = false;
        
        console.log(`✅ Fase ${phaseNum} carregada: ${phase.name}`);
        ui.showNotification(`🎮 Fase ${phaseNum}: ${phase.name}`);
    },
    
    nextPhase() {
        if (this.currentPhase < this.maxPhases) {
            this.currentPhase++;
            this.applyPhase(this.currentPhase);
            return true;
        }
        return false; // Jogo completo
    },
    
    getCurrentPhase() {
        return this.phases[this.currentPhase];
    },
    
    drawBackground(ctx) {
        const phase = this.getCurrentPhase();
        
        // Gradiente de fundo
        const gradient = ctx.createLinearGradient(0, 0, 0, gameData.canvas.height);
        gradient.addColorStop(0, phase.background.primary);
        gradient.addColorStop(0.5, phase.background.secondary);
        gradient.addColorStop(1, phase.background.tertiary);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
        
        // Efeitos ambientais
        this.drawAmbience(ctx, phase.ambience);
    },
    
    drawAmbience(ctx, ambience) {
        // Nuvens
        if (ambience.cloudDensity > 0) {
            ctx.fillStyle = 'rgba(50, 50, 70, 0.3)';
            for (let i = 0; i < ambience.cloudDensity; i++) {
                const x = (Math.random() * gameData.canvas.width);
                const y = (Math.random() * gameData.canvas.height + gameData.scrollOffset) % gameData.canvas.height;
                const size = Math.random() * 60 + 40;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Raios (tempestade)
        if (ambience.lightning && Math.random() < 0.01) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            const x = Math.random() * gameData.canvas.width;
            ctx.moveTo(x, 0);
            ctx.lineTo(x + (Math.random() - 0.5) * 100, gameData.canvas.height / 2);
            ctx.lineTo(x + (Math.random() - 0.5) * 100, gameData.canvas.height);
            ctx.stroke();
        }
        
        // Partículas de fogo
        if (ambience.fireParticles) {
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * gameData.canvas.width;
                const y = Math.random() * gameData.canvas.height;
                const size = Math.random() * 3 + 1;
                
                ctx.fillStyle = Math.random() < 0.5 ? '#FF4500' : '#FFA500';
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.fillStyle;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        
        // Névoa escura
        if (ambience.darkFog) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
        }
        
        // Efeito de warp
        if (ambience.warpEffect) {
            const warpLines = 10;
            ctx.strokeStyle = 'rgba(100, 100, 255, 0.3)';
            ctx.lineWidth = 2;
            
            for (let i = 0; i < warpLines; i++) {
                const y = (i * gameData.canvas.height / warpLines + gameData.scrollOffset * 3) % gameData.canvas.height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(gameData.canvas.width, y);
                ctx.stroke();
            }
        }
        
        // Efeito de caos (fase final)
        if (ambience.chaosEffect) {
            ctx.globalAlpha = 0.1;
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * gameData.canvas.width;
                const y = Math.random() * gameData.canvas.height;
                const size = Math.random() * 50 + 10;
                const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000'];
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillRect(x, y, size, size);
            }
            ctx.globalAlpha = 1;
        }
    },
    
    getPhaseProgress() {
        const phase = this.getCurrentPhase();
        return {
            current: gameData.enemiesKilledThisStage,
            target: phase.targetKills,
            percentage: Math.floor((gameData.enemiesKilledThisStage / phase.targetKills) * 100)
        };
    },
    
    shouldSpawnBoss() {
        const phase = this.getCurrentPhase();
        if (gameData.bossActive) return false;
        
        // 🔧 BUGFIX: sem essa checagem, no exato frame em que o boss morre
        // (gameState já virou 'stage_complete', mas enemiesKilledThisStage
        // ainda não foi zerado) esta função voltava a retornar true e
        // recriava um boss novo instantaneamente, antes mesmo da tela de
        // fase completa aparecer.
        if (gameData.gameState !== 'playing') return false;
        
        if (phase.boss.spawnCondition === 'kills') {
            return gameData.enemiesKilledThisStage >= phase.targetKills;
        }
        
        return false;
    },
    
    spawnBoss() {
        const phase = this.getCurrentPhase();
        const bossType = phase.boss.type;
        
        if (typeof window.BossClasses !== 'undefined' && window.BossClasses[bossType]) {
            gameEntities.boss = new window.BossClasses[bossType]();
            gameData.bossActive = true;
            // A apresentação completa é assumida pelo Boss Cinematic System.
            // Fallback: se ele não existir, mantém o alerta legado.
            if (typeof polishSystem === 'undefined' || !polishSystem.startBossIntro) {
                ui.showNotification(`⚠️ BOSS: ${gameEntities.boss.name}!`);
                if (typeof audioSystem !== 'undefined') audioSystem.playBossWarning();
            }
        } else {
            console.error('Boss class não encontrado:', bossType);
        }
    }
};
