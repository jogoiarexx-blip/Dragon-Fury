// ===== INTEGRAÇÃO DOS NOVOS SISTEMAS - DRAGON FURY =====

/**
 * Este arquivo integra todos os novos sistemas ao jogo principal
 * Sistemas incluídos:
 * - Dragon Escorts (Dragões Escolta)
 * - Enemy System (6 tipos de inimigos)
 * - Boss System (3 bosses únicos)
 * - Phase System (6 fases progressivas)
 * - Spawn System (Sistema inteligente de spawn)
 * - Collision System (Detecção otimizada)
 * - HUD System (Interface desenhada no Canvas)
 * - Rank System (Sistema de classificação)
 */

const gameIntegration = {
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        console.log('🔧 Inicializando sistemas avançados...');
        
        // 🔧 BUGFIX CRÍTICO: gameIntegration.init() roda no DOMContentLoaded
        // ANTES de game.init() (integration.js registra seu listener antes
        // de main.js, pela ordem dos <script> no index.html). Isso significa
        // que gameData.canvas ainda era `null` aqui embaixo, e
        // parallaxSystem.init(1) quebrava com "Cannot read properties of
        // null (reading 'width')" — o que interrompia esta função NO MEIO,
        // antes de chegar em integrateWithGameLoop()/integrateWithDraw()/
        // integrateWithReset(). Resultado: game.update/draw/reset NUNCA
        // eram sobrescritos, e o jogo inteiro caía de volta no código antigo
        // (entities.drawEnemies()/drawCoins(), que só faz ctx.fillRect() —
        // quadrados lisos, sem forma nenhuma). Garantindo o canvas aqui,
        // isso não depende mais da ordem de carregamento dos scripts.
        if (!gameData.canvas) {
            gameData.canvas = document.getElementById('gameCanvas');
            gameData.ctx = gameData.canvas.getContext('2d');
        }
        
        // Inicializar sistemas
        phaseSystem.init();
        spawnSystem.init();
        rankSystem.init();
        escortManager.init();
        escortManager.checkAndRestore();
        
        // 🔧 BUGFIX: inicializar os sistemas visuais na fase 1 desde o início
        if (typeof parallaxSystem !== 'undefined') parallaxSystem.init(1);
        if (typeof phaseEffects !== 'undefined') phaseEffects.init(1);
        
        // ✨ MELHORIA: Sistemas visuais de moedas e power-ups (existiam mas nunca eram chamados)
        if (typeof coinEffects !== 'undefined') coinEffects.init();
        if (typeof powerUpEffects !== 'undefined') powerUpEffects.init();
        
        // Sobrescrever métodos do jogo original
        this.integrateWithGameLoop();
        this.integrateWithReset();
        this.integrateWithDraw();
        
        this.initialized = true;
        console.log('✅ Sistemas avançados carregados!');
    },
    
    integrateWithGameLoop() {
        // Salvar update original
        const originalUpdate = game.update.bind(game);
        
        // Sobrescrever update
        game.update = function() {
            // 🔧 BUGFIX: estes sistemas visuais existiam mas nunca eram
            // atualizados porque só o update() original (substituído por
            // este aqui) os chamava. Sem isso, transições entre fases,
            // parallax e efeitos ambientais (nuvens, raios, fogo, névoa,
            // warp) ficavam com código morto, nunca executando.
            if (typeof phaseTransitions !== 'undefined') phaseTransitions.update();
            if (typeof parallaxSystem !== 'undefined') parallaxSystem.update();
            if (typeof phaseEffects !== 'undefined') phaseEffects.update();
            
            // Update do jogador
            dragon.update();
            
            // Update dos sistemas novos
            spawnSystem.update();
            spawnSystem.spawnPowerUp();
            spawnSystem.spawnCoin();
            
            // ✨ NOVO: Update do ovo resgatável
            if (typeof eggSystem !== 'undefined') eggSystem.update();
            
            // Update de dragões escolta
            if (escortManager.isActive()) {
                escortManager.updateAll();
            }
            
            // Update de inimigos (novo sistema)
            gameEntities.enemies.forEach(enemy => enemy.update());
            
            // Update de boss
            if (gameData.bossActive && gameEntities.boss) {
                gameEntities.boss.update();
            }
            
            // Update de fireballs
            for (let fbIndex = 0; fbIndex < gameEntities.fireballs.length; fbIndex++) {
                const fb = gameEntities.fireballs[fbIndex];
                if (fb.vx !== undefined) fb.x += fb.vx;
                if (fb.vy !== undefined) {
                    fb.y += fb.vy;
                } else {
                    fb.y += fb.type === 'player' ? -fb.speed : fb.speed;
                }
            }
            
            // Update de moedas
            gameEntities.coins.forEach(coin => {
                if (coin.vx) coin.x += coin.vx;
                if (coin.vy) {
                    coin.y += coin.vy;
                } else {
                    coin.y += coin.speed || 2;
                }
                
                // Gravidade suave
                if (coin.vy !== undefined) {
                    coin.vy += 0.2;
                }
            });
            
            // ✨ MELHORIA: Efeitos visuais 3D/partículas/trail das moedas
            if (typeof coinEffects !== 'undefined') {
                coinEffects.update(gameEntities.coins);
            }
            
            // ✨ MELHORIA: Efeitos visuais e magnetismo dos power-ups
            if (typeof powerUpEffects !== 'undefined') {
                powerUpEffects.update(gameEntities.powerups, dragon.x + dragon.width / 2, dragon.y + dragon.height / 2);
            }
            
            // Update de power-ups
            gameEntities.powerups.forEach(pu => {
                pu.y += pu.speed;
            });
            
            // Update de partículas
            // CORREÇÃO: loop reverso para não pular partículas ao usar splice
            for (let index = gameEntities.particles.length - 1; index >= 0; index--) {
                const particle = gameEntities.particles[index];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
                
                if (particle.life <= 0) {
                    gameEntities.particles.splice(index, 1);
                }
            }
            
            // 🔧 BUGFIX (desempenho): sem limite, um combo grande ou a morte
            // de um boss (64+ partículas de uma vez, em BaseBoss.destroy())
            // podiam empilhar centenas de partículas simultâneas e derrubar
            // o FPS, principalmente em celular. Descarta as mais antigas
            // (já estão desbotando/somem primeiro mesmo) acima do limite.
            const MAX_PARTICLES = (typeof polishSystem !== 'undefined' && polishSystem.getParticleLimit)
                ? polishSystem.getParticleLimit() : 90;
            if (gameEntities.particles.length > MAX_PARTICLES) {
                gameEntities.particles.splice(0, gameEntities.particles.length - MAX_PARTICLES);
            }
            
            // Sistema de colisão
            collisionSystem.checkAll();
            
            // Limpeza
            spawnSystem.cleanupOffscreen();
            
            // Verificar spawn de boss
            if (phaseSystem.shouldSpawnBoss()) {
                phaseSystem.spawnBoss();
            }
            
            // Incrementar distância e pontuação
            gameData.distanceTraveled += gameData.scrollSpeed * 0.1;
            gameData.scrollOffset += gameData.scrollSpeed;
            gameStats.score += Math.ceil(gameData.currentStage * 0.5);
            
            // Verificar conquistas
            achievementManager.check();
            
            // Verificar game over
            if (gameStats.health <= 0) {
                game.gameOver();
            }
            
            // Atualizar HUD
            ui.updateHUD();
        };
    },
    
    integrateWithDraw() {
        // Salvar draw original
        const originalDraw = game.draw.bind(game);
        
        // Sobrescrever draw
        game.draw = function() {
            const ctx = gameData.ctx;
            
            // 🔧 BUGFIX: aplicar tremor de câmera durante transições de fase
            let shakeOffset = { x: 0, y: 0 };
            if (typeof phaseTransitions !== 'undefined' && phaseTransitions.isInTransition()) {
                shakeOffset = phaseTransitions.getShakeOffset();
            }
            // CameraSystem adicional: impactos/dano/boss sem mover o HUD.
            if (typeof polishSystem !== 'undefined') {
                const impactShake = polishSystem.getCameraOffset();
                shakeOffset.x += impactShake.x;
                shakeOffset.y += impactShake.y;
            }
            ctx.save();
            ctx.translate(shakeOffset.x, shakeOffset.y);
            // Zoom cinematográfico suave durante a chegada do boss. O HUD é
            // desenhado depois do restore(), então permanece estável e legível.
            if (typeof polishSystem !== 'undefined' && polishSystem.getCinematicScale) {
                const cinematicScale = polishSystem.getCinematicScale();
                if (cinematicScale !== 1) {
                    const cx = gameData.canvas.width / 2;
                    const cy = gameData.canvas.height * 0.42;
                    ctx.translate(cx, cy);
                    ctx.scale(cinematicScale, cinematicScale);
                    ctx.translate(-cx, -cy);
                }
            }
            
            // Fundo da fase
            phaseSystem.drawBackground(ctx);
            
            // 🔧 BUGFIX: parallax e efeitos ambientais nunca eram desenhados
            // porque só o draw() original (substituído por este) os chamava.
            if (typeof parallaxSystem !== 'undefined') parallaxSystem.draw(ctx);
            if (typeof phaseEffects !== 'undefined') phaseEffects.draw(ctx);
            
            // Desenhar estrelas
            entities.drawStars();
            
            // ✨ NOVO: desenhar ovo resgatável
            if (typeof eggSystem !== 'undefined') eggSystem.draw(ctx);
            
            // ✨ MELHORIA: Moedas com efeito 3D, brilho pulsante, partículas e trail
            if (typeof coinEffects !== 'undefined') {
                coinEffects.draw(ctx, gameEntities.coins);
            } else {
                // Fallback simples caso coin-effects.js não esteja carregado
                gameEntities.coins.forEach(coin => {
                    ctx.fillStyle = '#FFD700';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, 
                           coin.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
            }
            
            // ✨ MELHORIA: Power-ups com ícones customizados, glow, partículas e magnetismo
            if (typeof powerUpEffects !== 'undefined') {
                powerUpEffects.draw(ctx, gameEntities.powerups);
            } else {
                // Fallback simples caso powerup-effects.js não esteja carregado
                gameEntities.powerups.forEach(pu => {
                    const icons = {
                        'health': '❤️',
                        'rapid_fire': '⚡',
                        'shield': '🛡️',
                        'bomb': '💣'
                    };
                    
                    ctx.fillStyle = '#00FF00';
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#00FF00';
                    ctx.fillRect(pu.x, pu.y, pu.width, pu.height);
                    
                    ctx.font = '24px Arial';
                    ctx.fillText(icons[pu.type] || '?', pu.x + 3, pu.y + 22);
                    ctx.shadowBlur = 0;
                });
            }
            
            // Desenhar somente entidades próximas da tela. Evita gastar Canvas
            // com objetos que ainda estão muito acima/abaixo da área visível.
            const viewW = gameData.canvas.width, viewH = gameData.canvas.height;
            for (let i = 0; i < gameEntities.enemies.length; i++) {
                const enemy = gameEntities.enemies[i];
                if (enemy.x + enemy.width < -80 || enemy.x > viewW + 80 ||
                    enemy.y + enemy.height < -120 || enemy.y > viewH + 120) continue;
                enemy.draw(ctx);
            }
            
            // Desenhar boss
            if (gameData.bossActive && gameEntities.boss) {
                gameEntities.boss.draw(ctx);
            }
            
            // Desenhar dragões escolta
            if (escortManager.isActive()) {
                escortManager.drawAll();
            }
            
            // Desenhar jogador
            dragon.draw();
            
            // Desenhar fireballs com culling fora da tela
            for (let fbIndex = 0; fbIndex < gameEntities.fireballs.length; fbIndex++) {
                const fb = gameEntities.fireballs[fbIndex];
                if (fb.x + fb.width < -40 || fb.x > viewW + 40 || fb.y + fb.height < -60 || fb.y > viewH + 60) continue;
                const centerX = fb.x + fb.width / 2;
                const centerY = fb.y + fb.height / 2;
                
                let angle;
                if (fb.vx !== undefined || fb.vy !== undefined) {
                    angle = Math.atan2(fb.vy || 0, fb.vx || 0);
                } else {
                    angle = fb.type === 'player' ? -Math.PI / 2 : Math.PI / 2;
                }
                
                const isPlayer = fb.type === 'player';
                const colorCore = fb.color || (isPlayer ? '#FFF3B0' : '#FFB0B0');
                const colorEdge = fb.color || (isPlayer ? '#FF6B35' : '#FF0000');
                const lowProjectileFx = typeof polishSystem !== 'undefined' && polishSystem.effectiveQuality === 'low';
                if (!lowProjectileFx) {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = colorEdge;
                }
                drawFireballShape(ctx, centerX, centerY, fb.width / 2, angle, colorCore, colorEdge);
                ctx.shadowBlur = 0;
            }
            
            // Desenhar partículas. Em qualidade baixa usa quadrados leves no
            // lugar de arcos, reduzindo bastante o custo em explosões grandes.
            const lowFx = typeof polishSystem !== 'undefined' && polishSystem.effectiveQuality === 'low';
            for (let pIndex = 0; pIndex < gameEntities.particles.length; pIndex++) {
                const particle = gameEntities.particles[pIndex];
                if (particle.x < -20 || particle.x > viewW + 20 || particle.y < -20 || particle.y > viewH + 20) continue;
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = Math.max(0, Math.min(1, particle.life / 30));
                if (lowFx) {
                    const size = Math.max(1, particle.size * 1.4);
                    ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
                } else {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
            
            // 🔧 BUGFIX: fechar o translate do tremor ANTES do HUD/overlay,
            // senão o HUD também tremeria durante transições de fase.
            ctx.restore();
            
            // Overlay de transição entre fases (sem tremor)
            if (typeof phaseTransitions !== 'undefined') phaseTransitions.draw(ctx);
            
            // HUD Sistema
            hudSystem.draw(ctx);
        };
    },
    
    integrateWithReset() {
        // Salvar reset original
        const originalReset = game.reset.bind(game);
        
        // Sobrescrever reset
        game.reset = function() {
            // Reset original
            dragon.reset();
            
            gameStats.score = 0;
            gameStats.health = 100 + (upgrades.health.level * 20);
            gameStats.firepower = 1 + upgrades.firepower.level;
            gameStats.powerUpActive = null;
            gameStats.powerUpTimer = 0;
            
            gameData.scrollSpeed = 2;
            gameData.scrollOffset = 0;
            gameData.distanceTraveled = 0;
            gameData.bossActive = false;
            gameData.currentWave = 1;
            gameData.currentStage = 1;
            gameData.enemiesKilledThisStage = 0;
            
            gameEntities.coins = [];
            gameEntities.fireballs = [];
            gameEntities.enemies = [];
            gameEntities.particles = [];
            gameEntities.powerups = [];
            gameEntities.boss = null;
            
            // Reset dos novos sistemas
            phaseSystem.init();
            spawnSystem.init();
            rankSystem.init();
            escortManager.init();
            
            // 🔧 BUGFIX: reiniciar sistemas visuais na fase 1 ao reiniciar o jogo
            if (typeof parallaxSystem !== 'undefined') parallaxSystem.init(1);
            if (typeof phaseEffects !== 'undefined') phaseEffects.init(1);
            
            // Aplicar upgrade de escolta se comprado
            if (upgrades.escorts && upgrades.escorts.level > 0) {
                escortManager.activate();
            }
            
            gameStats.gamesPlayed++;
            localStorage.setItem('dragonGamesPlayed', gameStats.gamesPlayed);
            
            ui.updateHUD();
        };
    },
    
    // Método auxiliar para completar fase
    completePhase() {
        const finalRank = rankSystem.getFinalRank();
        
        // Bônus de rank
        gameStats.coins += finalRank.bonus;
        gameStats.totalCoins += finalRank.bonus;
        
        localStorage.setItem('dragonCoins', gameStats.coins);
        localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
        
        // Mostrar rank
        ui.showNotification(`🏆 Rank ${finalRank.letter} - Bônus: ${finalRank.bonus} moedas!`);
        
        // Avançar fase
        const hasNextPhase = phaseSystem.nextPhase();
        
        if (hasNextPhase) {
            // Curar jogador
            const healAmount = 50;
            gameStats.health = Math.min(
                100 + (upgrades.health.level * 20),
                gameStats.health + healAmount
            );
            
            // Reset do rank para próxima fase
            rankSystem.init();
            
            ui.showNotification(`✨ Fase ${phaseSystem.currentPhase} iniciada!`);
        } else {
            // Jogo completo!
            game.gameComplete();
        }
    }
};

// Auto-inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gameIntegration.init();
    });
} else {
    gameIntegration.init();
}

// Exportar para debug
if (typeof window !== 'undefined') {
    window.advancedSystems = {
        phaseSystem,
        spawnSystem,
        collisionSystem,
        hudSystem,
        rankSystem,
        escortManager
    };
}
