// ===== LÓGICA PRINCIPAL DO JOGO - DRAGON FURY =====
// 🔧 VERSÃO CORRIGIDA - Problema de timers resolvido

const game = {
    
    init() {
        gameData.canvas = document.getElementById('gameCanvas');
        gameData.ctx = gameData.canvas.getContext('2d');
        
        this.setupEventListeners();
        entities.initStars();
        ui.renderAchievements();
        ui.renderUpgrades();
        ui.updateHUD();
    },
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            
            if (gameData.gameState === 'playing') {
                if (e.key === 'Escape') {
                    this.pauseGame();
                }
            } else if (gameData.gameState === 'stage_complete') {
                // Atalho de teclado: Enter/Espaço = "Próxima Fase" (mesmo botão do seletor)
                if (e.key === 'Enter' || e.key === ' ') {
                    this.nextStage();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });
    },
    
    startGame() {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('hud').style.display = 'block';
        
        // 🔧 NOVO: mostrar controles touch (só existem em telas sensíveis ao toque)
        if (typeof touchControls !== 'undefined' && touchControls.active) {
            document.getElementById('touch-controls').style.display = 'flex';
        }
        
        // 🔧 BUGFIX: Limpar timers ANTES de iniciar novo jogo
        this.clearAllTimers();
        
        gameData.gameState = 'playing';
        this.reset();
        this.loop();
    },
    
    // ✨ NOVO: inicia o jogo diretamente numa fase específica, usado pelo
    // seletor de fases. Reaproveita reset() (vida cheia, moedas/pontuação
    // zeradas etc.) e depois pula direto pra fase escolhida.
    startAtStage(stage) {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('hud').style.display = 'block';
        
        if (typeof touchControls !== 'undefined' && touchControls.active) {
            document.getElementById('touch-controls').style.display = 'flex';
        }
        
        this.clearAllTimers();
        
        gameData.gameState = 'playing';
        this.reset();
        
        // Pula direto pra fase escolhida (reset() já deixou tudo em fase 1)
        stage = Math.max(1, Math.min(stage, phaseSystem.maxPhases));
        phaseSystem.applyPhase(stage);
        
        gameEntities.eggs = [];
        gameData.eggSpawnedThisStage = false;
        gameData.eggRescuedThisStage = false;
        
        if (typeof parallaxSystem !== 'undefined') parallaxSystem.init(stage);
        if (typeof phaseEffects !== 'undefined') phaseEffects.init(stage);
        if (typeof rankSystem !== 'undefined') rankSystem.startPhase();
        
        ui.updateHUD();
        this.loop();
    },
    
    reset() {
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
        gameData.stageTargetKills = stages[1].targetKills;
        
        // Reset combo
        gameData.comboMultiplier = 1;
        gameData.comboCount = 0;
        gameData.lastKillTime = 0;
        
        gameEntities.coins = [];
        gameEntities.fireballs = [];
        gameEntities.enemies = [];
        gameEntities.particles = [];
        gameEntities.powerups = [];
        gameEntities.eggs = [];
        gameEntities.boss = null;
        
        gameData.eggSpawnedThisStage = false;
        gameData.eggRescuedThisStage = false;
        
        entities.waveTimer = 0;
        
        // Manter estrelas mas reposicionar
        if (gameEntities.stars.length === 0) {
            entities.initStars();
        }
        
        // ✨ NOVO: Inicializar parallax para fase 1
        if (typeof parallaxSystem !== 'undefined') {
            parallaxSystem.init(1);
        }
        
        // ✨ NOVO: Inicializar efeitos ambientais da fase 1
        if (typeof phaseEffects !== 'undefined') {
            phaseEffects.init(1);
        }
        
        // ✨ RANK SYSTEM: Iniciar tracking
        if (typeof rankSystem !== 'undefined') {
            rankSystem.startPhase();
        }
        
        gameStats.gamesPlayed++;
        localStorage.setItem('dragonGamesPlayed', gameStats.gamesPlayed);
        
        ui.updateHUD();
    },
    
    // 🔧 NOVO: Função centralizada para limpar todos os timers
    clearAllTimers() {
        console.log('🧹 Limpando todos os timers...');
        
        // Limpar timer de auto-avanço de fase
        if (gameData.stageCompleteTimer) {
            clearTimeout(gameData.stageCompleteTimer);
            gameData.stageCompleteTimer = null;
            console.log('  ✅ stageCompleteTimer limpo');
        }
        
        // Limpar contador regressivo visual
        if (gameData.stageCompleteCountdown) {
            clearInterval(gameData.stageCompleteCountdown);
            gameData.stageCompleteCountdown = null;
            console.log('  ✅ stageCompleteCountdown limpo');
        }
        
        // 🔧 ADICIONAL: Limpar animationFrame se existir
        if (gameData.animationId) {
            cancelAnimationFrame(gameData.animationId);
            gameData.animationId = null;
            console.log('  ✅ animationFrame cancelado');
        }
    },
    
    pauseGame() {
        if (gameData.gameState === 'playing') {
            gameData.gameState = 'paused';
            ui.showPauseMenu();
            
            // 🔧 BUGFIX: Usar função centralizada de limpeza
            this.clearAllTimers();
            
            // 🔧 BUGFIX: soltar botões touch presos (dedo ainda em cima do
            // botão quando o jogo pausa), senão o dragão continua se
            // movendo/atirando sozinho depois de despausar.
            if (typeof touchControls !== 'undefined') touchControls.releaseAll();
        }
    },
    
    resumeGame() {
        gameData.gameState = 'playing';
        ui.hidePauseMenu();
        gameData.lastTime = performance.now();
        this.loop();
    },
    
    returnToMenu() {
        console.log('🏠 Retornando ao menu principal...');
        
        // 🔧 BUGFIX: Limpar timers PRIMEIRO (antes de mudar estado)
        this.clearAllTimers();
        
        // 🔧 BUGFIX: soltar botões touch presos
        if (typeof touchControls !== 'undefined') touchControls.releaseAll();
        
        gameData.gameState = 'menu';
        document.getElementById('gameCanvas').style.display = 'none';
        document.getElementById('hud').style.display = 'none';
        document.getElementById('touch-controls').style.display = 'none';
        
        // Esconder todos os overlays
        ui.hidePauseMenu();
        ui.hideGameOver();
        ui.hideStageComplete();
        ui.hideGameComplete(); // 🔧 ADICIONAL: Garantir que game complete também suma
        if (typeof phaseLoadingScreen !== 'undefined') phaseLoadingScreen.hide();
        
        document.getElementById('main-menu').style.display = 'block';
        
        console.log('✅ Retorno ao menu concluído');
    },
    
    restartGame() {
        console.log('🔄 Reiniciando jogo...');
        
        // 🔧 BUGFIX: Limpar timers antes de reiniciar
        this.clearAllTimers();
        
        ui.hideGameOver();
        ui.hideGameComplete(); // 🔧 ADICIONAL
        
        gameData.gameState = 'playing';
        this.reset();
        this.loop();
    },
    
    completeStage() {
        // 🔧 BUGFIX: alguns caminhos de colisão podem tentar "matar" o boss
        // mais de uma vez no mesmo frame (ex.: dano múltiplo do upgrade Tiro
        // Múltiplo acertando o boss simultaneamente). Sem essa guarda,
        // completeStage() rodava 2x, dobrando bônus/moedas e recriando a
        // tela de fase completa por cima dela mesma.
        if (gameData.gameState === 'stage_complete') return;
        
        console.log(`🎉 Fase ${gameData.currentStage} completa!`);
        
        // 🔧 BUGFIX: Limpar timers antigos ANTES de criar novos
        this.clearAllTimers();
        
        gameData.gameState = 'stage_complete';
        
        // 🔧 NOVO: efeito sonoro de fase completa
        if (typeof audioSystem !== 'undefined') audioSystem.playPhaseComplete();
        
        // Recompensas por completar fase
        const stageBonus = gameData.currentStage * 100;
        gameStats.coins += stageBonus;
        gameStats.totalCoins += stageBonus;
        gameStats.score += stageBonus * 10;
        
        // Atualizar fase máxima alcançada
        if (gameData.currentStage > gameStats.maxStageReached) {
            gameStats.maxStageReached = gameData.currentStage;
            localStorage.setItem('dragonMaxStage', gameStats.maxStageReached);
        }
        
        localStorage.setItem('dragonCoins', gameStats.coins);
        localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
        
        // ✨ NOVO: em vez de avançar sozinho após alguns segundos, mostra a
        // pontuação e o seletor de fase (Próxima Fase / Repetir Fase /
        // Comprar Upgrade) e espera a escolha do jogador.
        ui.showStageComplete();
        achievementManager.check();
    },
    
    async nextStage() {
        // Impede clique/atalho duplicado durante a troca de fase.
        if (gameData.gameState !== 'stage_complete') return;

        const previousStage = gameData.currentStage;
        const targetStage = previousStage + 1;

        if (targetStage > phaseSystem.maxPhases) {
            console.log('🏆 Todas as fases completadas!');
            this.clearAllTimers();
            ui.hideStageComplete();
            this.gameComplete();
            return;
        }

        console.log(`➡️ Preparando fase ${targetStage}...`);
        this.clearAllTimers();
        ui.hideStageComplete();

        // Estado exclusivo de loading: o loop, spawns, timers e controles de
        // gameplay ficam bloqueados até os recursos da próxima fase terminarem.
        gameData.gameState = 'loading';

        if (typeof phaseLoadingScreen !== 'undefined') {
            phaseLoadingScreen.show(previousStage, targetStage);
            try {
                await phaseLoadingScreen.loadPhase(targetStage);
            } catch (err) {
                // O loading nunca deve prender o jogador. Falhas são registradas
                // e a fase segue com os fallbacks/procedurais disponíveis.
                console.warn('⚠️ Loading da fase concluiu com falha recuperável:', err);
            }
        }

        // Só agora a nova fase vira a fase ativa.
        phaseSystem.applyPhase(targetStage);
        gameData.currentWave = 1;
        entities.waveTimer = 0;

        console.log(`📍 Nova fase: ${gameData.currentStage} - ${phaseSystem.getCurrentPhase().name}`);

        // Limpar entidades antigas antes de liberar a nova fase.
        gameEntities.enemies = [];
        gameEntities.fireballs = gameEntities.fireballs.filter(f => f.type === 'player');
        gameEntities.powerups = [];
        gameEntities.eggs = [];
        gameEntities.boss = null;

        gameData.eggSpawnedThisStage = false;
        gameData.eggRescuedThisStage = false;

        const healAmount = 50;
        gameStats.health = Math.min(100 + (upgrades.health.level * 20),
                                    gameStats.health + healAmount);

        const transitionTypes = {
            1: 'fade',
            2: 'shake',
            3: 'flash',
            4: 'fade',
            5: 'warp'
        };

        if (typeof phaseTransitions !== 'undefined') {
            phaseTransitions.startTransition(
                previousStage,
                targetStage,
                transitionTypes[targetStage] || 'fade'
            );
        }

        // Caso o loading system não exista por algum motivo, mantém a
        // inicialização antiga como fallback.
        if (typeof phaseLoadingScreen === 'undefined') {
            if (typeof parallaxSystem !== 'undefined') parallaxSystem.init(targetStage);
            if (typeof phaseEffects !== 'undefined') phaseEffects.init(targetStage);
        }

        if (typeof rankSystem !== 'undefined') rankSystem.startPhase();

        ui.updateHUD();
        gameData.lastTime = performance.now();
        gameData.gameState = 'playing';

        if (typeof phaseLoadingScreen !== 'undefined') {
            phaseLoadingScreen.hide();
        }

        this.loop(performance.now());
    },

    // ✨ NOVO: Repetir a fase atual (mesmo número de fase) a partir do
    // seletor de fase, em vez de avançar. Útil para tentar melhorar o
    // rank/pontuação ou farmar moedas antes de seguir em frente.
    repeatStage() {
        if (gameData.gameState !== 'stage_complete') return;
        
        console.log(`🔁 Repetindo fase ${gameData.currentStage}...`);
        
        this.clearAllTimers();
        ui.hideStageComplete();
        
        const stageToRepeat = gameData.currentStage;
        
        // Reaplica a mesma fase: zera kills, boss ativo, velocidade etc,
        // sem incrementar o número da fase.
        phaseSystem.applyPhase(stageToRepeat);
        
        gameData.currentWave = 1;
        entities.waveTimer = 0;
        
        gameEntities.enemies = [];
        gameEntities.fireballs = gameEntities.fireballs.filter(f => f.type === 'player');
        gameEntities.powerups = [];
        gameEntities.eggs = [];
        gameEntities.boss = null;
        
        // ✨ NOVO: reseta o objetivo do ovo para a nova tentativa
        gameData.eggSpawnedThisStage = false;
        gameData.eggRescuedThisStage = false;
        
        // Vida cheia para uma nova tentativa
        gameStats.health = 100 + (upgrades.health.level * 20);
        
        if (typeof phaseTransitions !== 'undefined') {
            phaseTransitions.startTransition(stageToRepeat, stageToRepeat, 'fade');
        }
        
        if (typeof parallaxSystem !== 'undefined') {
            parallaxSystem.init(stageToRepeat);
        }
        
        if (typeof phaseEffects !== 'undefined') {
            phaseEffects.init(stageToRepeat);
        }
        
        if (typeof rankSystem !== 'undefined') {
            rankSystem.startPhase();
        }
        
        gameData.gameState = 'playing';
        ui.updateHUD();
        this.loop();
    },
    
    gameComplete() {
        console.log('🏆 Jogo completado!');
        
        // 🔧 BUGFIX: Limpar timers ao completar jogo
        this.clearAllTimers();
        
        // Bonus especial por completar o jogo
        gameStats.coins += 1000;
        gameStats.totalCoins += 1000;
        gameStats.score += 10000;
        
        localStorage.setItem('dragonCoins', gameStats.coins);
        localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
        
        ui.showGameComplete();
        achievementManager.check();
    },
    
    update() {
        // ✨ NOVO: Atualizar transições visuais
        if (typeof phaseTransitions !== 'undefined') {
            phaseTransitions.update();
        }
        
        // ✨ NOVO: Atualizar parallax
        if (typeof parallaxSystem !== 'undefined') {
            parallaxSystem.update();
        }
        
        // Atualizar jogador
        dragon.update();
        
        // ✨ NOVO: Atualizar efeitos ambientais da fase
        if (typeof phaseEffects !== 'undefined') {
            phaseEffects.update();
        }
        
        // Spawn de elementos
        entities.spawnEnemy();
        entities.spawnCoin();
        entities.spawnPowerUp();
        
        // Atualizar todas as entidades
        entities.updateAll();
        
        // Incrementar distância e pontuação
        gameData.distanceTraveled += gameData.scrollSpeed * 0.1;
        gameData.scrollOffset += gameData.scrollSpeed;
        gameStats.score += Math.ceil(gameData.currentStage * 0.5);
        
        // Verificar se completou a fase
        const currentStageData = stages[gameData.currentStage];
        if (gameData.enemiesKilledThisStage >= currentStageData.targetKills && !gameData.bossActive) {
            // Spawnar boss da fase
            entities.spawnStageBoss();
        }
        
        // Verificar conquistas
        achievementManager.check();
        
        // Verificar game over
        if (gameStats.health <= 0) {
            this.gameOver();
        }
        
        ui.updateHUD();
    },
    
    draw() {
        const ctx = gameData.ctx;
        
        // ✨ NOVO: Aplicar offset de tremor se houver transição shake
        let shakeOffset = { x: 0, y: 0 };
        if (typeof phaseTransitions !== 'undefined' && phaseTransitions.isInTransition()) {
            shakeOffset = phaseTransitions.getShakeOffset();
        }
        
        ctx.save();
        ctx.translate(shakeOffset.x, shakeOffset.y);
        
        // Fundo baseado na fase atual
        const currentStageData = stages[gameData.currentStage];
        const gradient = ctx.createLinearGradient(0, 0, 0, gameData.canvas.height);
        gradient.addColorStop(0, currentStageData.background.color1);
        gradient.addColorStop(0.5, currentStageData.background.color2);
        gradient.addColorStop(1, currentStageData.background.color3);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
        
        // ✨ NOVO: Desenhar camadas de parallax (estrelas, nuvens, etc)
        if (typeof parallaxSystem !== 'undefined') {
            parallaxSystem.draw(ctx);
        }
        
        // ✨ NOVO: Desenhar efeitos ambientais da fase (nuvens, raios, fogo, etc)
        if (typeof phaseEffects !== 'undefined') {
            phaseEffects.draw(ctx);
        }
        
        // Desenhar elementos
        entities.drawAll();
        dragon.draw();
        
        ctx.restore();
        
        // ✨ NOVO: Desenhar overlay de transição (sem tremor)
        if (typeof phaseTransitions !== 'undefined') {
            phaseTransitions.draw(ctx);
        }
        
        // Informações na tela (sempre no topo, sem tremor)
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000';
        
        // Fase atual
        ctx.fillText(`Fase: ${gameData.currentStage} - ${currentStageData.name}`, 20, 30);
        
        // Progresso da fase
        const progress = Math.floor((gameData.enemiesKilledThisStage / gameData.stageTargetKills) * 100);
        ctx.fillText(`Progresso: ${gameData.enemiesKilledThisStage}/${gameData.stageTargetKills} (${progress}%)`, 20, 55);
        
        // Distância
        ctx.fillText(`Distância: ${Math.floor(gameData.distanceTraveled)}m`, 20, 80);
        
        // Indicador de power-up
        if (gameStats.powerUpActive) {
            ctx.fillStyle = '#00FF00';
            const timeLeft = Math.ceil(gameStats.powerUpTimer / 60);
            ctx.fillText(`⚡ ${gameStats.powerUpActive.toUpperCase().replace('_', ' ')}: ${timeLeft}s`, 
                        20, 105);
        }
        
        // Sistema de Combo - Indicador Visual
        if (gameData.comboCount > 1) {
            const timeSinceLastKill = Date.now() - gameData.lastKillTime;
            const timeLeft = 2000 - timeSinceLastKill;
            const alpha = Math.min(1, timeLeft / 2000);
            
            ctx.save();
            
            // Fundo do combo
            ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * alpha})`;
            ctx.fillRect(gameData.canvas.width / 2 - 100, gameData.canvas.height - 80, 200, 40);
            
            // Borda animada
            const hue = (Date.now() / 10) % 360;
            ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(gameData.canvas.width / 2 - 100, gameData.canvas.height - 80, 200, 40);
            
            // Texto do combo
            ctx.fillStyle = gameData.comboCount >= 10 ? '#FFD700' : 
                           gameData.comboCount >= 5 ? '#FF6B35' : '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            
            const scale = 1 + Math.sin(Date.now() / 100) * 0.1;
            ctx.save();
            ctx.translate(gameData.canvas.width / 2, gameData.canvas.height - 60);
            ctx.scale(scale, scale);
            ctx.fillText(`🔥 COMBO ${gameData.comboCount}x`, 0, 0);
            ctx.restore();
            
            // Subtexto com multiplicador
            ctx.font = '14px Arial';
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.shadowBlur = 5;
            ctx.fillText(`${gameData.comboMultiplier.toFixed(1)}x PONTOS`, 
                        gameData.canvas.width / 2, 
                        gameData.canvas.height - 45);
            
            // Barra de tempo
            const barWidth = 180;
            const barProgress = timeLeft / 2000;
            ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
            ctx.fillRect(gameData.canvas.width / 2 - barWidth / 2, 
                        gameData.canvas.height - 85, 
                        barWidth, 3);
            ctx.fillStyle = barProgress > 0.5 ? '#00FF00' : 
                           barProgress > 0.25 ? '#FFD700' : '#FF0000';
            ctx.fillRect(gameData.canvas.width / 2 - barWidth / 2, 
                        gameData.canvas.height - 85, 
                        barWidth * barProgress, 3);
            
            ctx.restore();
        }
        
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    },
    
    loop(currentTime = 0) {
        if (gameData.gameState !== 'playing') return;

        // PERFORMANCE: limita o gameplay a 60 FPS. Em monitores 120/144/165 Hz
        // o requestAnimationFrame chamava update+draw em cada refresh, duplicando
        // ou triplicando o trabalho e também acelerando sistemas frame-based.
        const FRAME_INTERVAL = 1000 / 60;
        if (currentTime && gameData.lastTime) {
            const elapsed = currentTime - gameData.lastTime;
            if (elapsed < FRAME_INTERVAL - 0.75) {
                gameData.animationId = requestAnimationFrame((time) => this.loop(time));
                return;
            }
        }
        const deltaTime = currentTime && gameData.lastTime ? currentTime - gameData.lastTime : FRAME_INTERVAL;
        gameData.lastTime = currentTime || performance.now();
        
        // 🔧 NOVO: rede de segurança contra travamentos silenciosos.
        // Antes, se update() ou draw() lançassem uma exceção (por
        // qualquer motivo - um inimigo novo, um boss, etc.), o loop
        // simplesmente parava de chamar requestAnimationFrame e o jogo
        // "congelava" sem nenhuma mensagem visível, só um erro escondido
        // no console. Agora, qualquer erro é capturado, mostrado na tela
        // (com a fase atual e a mensagem exata) e logado no console -
        // então dá pra saber na hora o que quebrou, em vez de só "travou".
        try {
            this.update();
            this.draw();
        } catch (err) {
            console.error('💥 ERRO NO LOOP DO JOGO:', err);
            this.showCrashOverlay(err);
            return; // não re-agenda o loop; o jogo realmente para aqui
        }
        
        gameData.animationId = requestAnimationFrame((time) => this.loop(time));
    },
    
    // 🔧 NOVO: mostra o erro na tela em vez de travar sem explicação
    showCrashOverlay(err) {
        const ctx = gameData.ctx;
        if (!ctx || !gameData.canvas) return;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
        
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ Erro no jogo (fase ' + gameData.currentStage + ')',
                      gameData.canvas.width / 2, gameData.canvas.height / 2 - 40);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px monospace';
        const message = (err && err.message) ? err.message : String(err);
        // Quebra a mensagem em linhas para caber na tela
        const maxCharsPerLine = 46;
        const words = message.split(' ');
        let line = '';
        let lineY = gameData.canvas.height / 2 - 5;
        words.forEach(word => {
            if ((line + word).length > maxCharsPerLine) {
                ctx.fillText(line, gameData.canvas.width / 2, lineY);
                line = word + ' ';
                lineY += 20;
            } else {
                line += word + ' ';
            }
        });
        ctx.fillText(line, gameData.canvas.width / 2, lineY);
        
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '13px Arial';
        ctx.fillText('Tira um print desta tela e manda pra mim analisar',
                      gameData.canvas.width / 2, lineY + 35);
        ctx.textAlign = 'left';
    },
    
    gameOver() {
        console.log('💀 Game Over');
        
        // 🔧 BUGFIX: Limpar timers ao dar game over
        this.clearAllTimers();
        
        // 🔧 BUGFIX: soltar botões touch presos
        if (typeof touchControls !== 'undefined') touchControls.releaseAll();
        
        gameData.gameState = 'gameover';
        
        // 🔧 NOVO: efeito sonoro de game over
        if (typeof audioSystem !== 'undefined') audioSystem.playGameOver();
        
        // Atualizar estatísticas totais
        gameStats.totalScore += gameStats.score;
        localStorage.setItem('dragonTotalScore', gameStats.totalScore);
        
        // Atualizar distância máxima
        if (gameData.distanceTraveled > gameStats.maxDistance) {
            gameStats.maxDistance = Math.floor(gameData.distanceTraveled);
            localStorage.setItem('dragonMaxDistance', gameStats.maxDistance);
        }
        
        ui.showGameOver();
        achievementManager.check();
    }
};
