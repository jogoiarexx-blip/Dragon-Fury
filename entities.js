// ===== ENTIDADES DO JOGO =====

const entities = {
    
    waveTimer: 0,
    enemyFormation: 0,
    
    // Selecionar power-up baseado em peso
    getRandomPowerUpType() {
        const types = config.powerUpTypes;
        const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const powerUp of types) {
            random -= powerUp.weight;
            if (random <= 0) {
                return powerUp.type;
            }
        }
        
        return 'health'; // Fallback
    },
    
    // Spawn de inimigos com padrões
    spawnEnemy() {
        if (gameData.bossActive) return;
        
        this.waveTimer++;
        
        // Sistema de ondas
        if (this.waveTimer > 600) { // Nova onda a cada 10 segundos
            this.waveTimer = 0;
            gameData.currentWave++;
            this.spawnEnemyWave();
        }
        
        // ===== USAR INIMIGOS ESPECÍFICOS DA FASE =====
        const phaseData = this.getCurrentPhaseData();
        if (phaseData && phaseData.spawnEnemy) {
            // Usar sistema de spawn da fase específica
            if (Math.random() < config.spawnRates.enemy * (1 + gameData.currentWave * 0.1)) {
                const enemy = phaseData.spawnEnemy();
                if (enemy) {
                    gameEntities.enemies.push(enemy);
                }
            }
        } else {
            // Fallback para sistema antigo
            if (Math.random() < config.spawnRates.enemy * (1 + gameData.currentWave * 0.1)) {
                const enemyType = this.getRandomEnemyType();
                this.createEnemy(enemyType);
            }
        }
    },
    
    // Obter dados da fase atual
    getCurrentPhaseData() {
        const phaseMap = {
            1: typeof phase1_ceuSereno !== 'undefined' ? phase1_ceuSereno : null,
            2: typeof phase2_tempestadeIminente !== 'undefined' ? phase2_tempestadeIminente : null,
            3: typeof phase3_furiaArdente !== 'undefined' ? phase3_furiaArdente : null,
            4: typeof phase4_abismoSombrio !== 'undefined' ? phase4_abismoSombrio : null,
            5: typeof phase5_batalhaFinal !== 'undefined' ? phase5_batalhaFinal : null
        };
        return phaseMap[gameData.currentStage];
    },
    
    getRandomEnemyType() {
        const rand = Math.random();
        if (rand < 0.6) return 'basic';
        if (rand < 0.85) return 'fast';
        if (rand < 0.95) return 'tank';
        return 'shooter';
    },
    
    createEnemy(type, x = null, y = -80) {
        const enemy = {
            x: x !== null ? x : Math.random() * (gameData.canvas.width - 40),
            y: y,
            width: 40,
            height: 40,
            health: 30,
            maxHealth: 30,
            type: type,
            shootTimer: 0,
            pattern: config.enemyPatterns[Math.floor(Math.random() * config.enemyPatterns.length)],
            patternTimer: 0,
            speed: 2
        };
        
        // Configurar por tipo
        switch(type) {
            case 'basic':
                enemy.speed = 2 + (gameData.currentWave * 0.1);
                enemy.health = 30;
                enemy.maxHealth = 30;
                enemy.scoreValue = 100;
                break;
            case 'fast':
                enemy.speed = 4 + (gameData.currentWave * 0.15);
                enemy.health = 20;
                enemy.maxHealth = 20;
                enemy.scoreValue = 150;
                enemy.color = '#FF4500';
                break;
            case 'tank':
                enemy.speed = 1.5;
                enemy.health = 60;
                enemy.maxHealth = 60;
                enemy.scoreValue = 200;
                enemy.width = 50;
                enemy.height = 50;
                enemy.color = '#2F4F4F';
                break;
            case 'shooter':
                enemy.speed = 1.8;
                enemy.health = 25;
                enemy.maxHealth = 25;
                enemy.scoreValue = 250;
                enemy.color = '#8B008B';
                enemy.canShoot = true;
                break;
        }
        
        gameEntities.enemies.push(enemy);
    },
    
    spawnEnemyWave() {
        const patterns = ['line', 'v-formation', 'circle', 'zigzag'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        switch(pattern) {
            case 'line':
                for (let i = 0; i < 5; i++) {
                    this.createEnemy('basic', 100 + i * 80, -80 - i * 50);
                }
                break;
            case 'v-formation':
                for (let i = 0; i < 5; i++) {
                    const offset = Math.abs(i - 2) * 60;
                    this.createEnemy('fast', 200 + i * 40, -80 - offset);
                }
                break;
            case 'circle':
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = 300 + Math.cos(angle) * 100;
                    const y = -200 + Math.sin(angle) * 100;
                    this.createEnemy('basic', x, y);
                }
                break;
            case 'zigzag':
                for (let i = 0; i < 4; i++) {
                    this.createEnemy('tank', 100 + i * 120, -80 - i * 40);
                }
                break;
        }
    },
    
    // Spawn de boss
    spawnBoss() {
        gameData.bossActive = true;
        gameEntities.boss = {
            x: gameData.canvas.width / 2 - 75,
            y: -150,
            width: 150,
            height: 100,
            health: 500 + (gameData.currentWave * 100),
            maxHealth: 500 + (gameData.currentWave * 100),
            speed: 1,
            phase: 1,
            shootTimer: 0,
            moveTimer: 0,
            targetY: 100,
            pattern: 0
        };
    },
    
    // Spawn de boss de fase
    spawnStageBoss() {
        gameData.bossActive = true;
        const currentStageData = stages[gameData.currentStage];
        
        ui.showNotification(`🔥 BOSS: ${currentStageData.bossName}!`);
        
        gameEntities.boss = {
            x: gameData.canvas.width / 2 - 100,
            y: -180,
            width: 200,
            height: 120,
            health: currentStageData.bossHealth * currentStageData.enemyMultiplier,
            maxHealth: currentStageData.bossHealth * currentStageData.enemyMultiplier,
            speed: 1.5,
            phase: 1,
            shootTimer: 0,
            moveTimer: 0,
            targetY: 80,
            pattern: 0,
            stageBoss: true,
            stageName: currentStageData.bossName
        };
    },
    
    // Spawn de power-ups
    spawnPowerUp() {
        if (Math.random() < config.spawnRates.powerup) {
            const types = ['health', 'rapid_fire', 'shield', 'bomb'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            gameEntities.powerups.push({
                x: Math.random() * (gameData.canvas.width - 30),
                y: -50,
                width: 30,
                height: 30,
                speed: 2,
                type: type,
                angle: 0
            });
        }
    },
    
    // Spawn de moedas
    spawnCoin() {
        if (Math.random() < config.spawnRates.coin) {
            gameEntities.coins.push({
                x: Math.random() * (gameData.canvas.width - 20),
                y: -50,
                width: 20,
                height: 20,
                speed: 2,
                value: 1,
                angle: 0
            });
        }
    },
    
    // Criar partículas
    createParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            gameEntities.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 5 + 2,
                color: color,
                life: 30
            });
        }
    },
    
    // Criar estrelas de fundo
    initStars() {
        for (let i = 0; i < 100; i++) {
            gameEntities.stars.push({
                x: Math.random() * gameData.canvas.width,
                y: Math.random() * gameData.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1
            });
        }
    },
    
    // Verificar colisão
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    // Atualizar todas as entidades
    updateAll() {
        this.updateStars();
        this.updateEnemies();
        this.updateBoss();
        this.updateFireballs();
        this.updateCoins();
        this.updatePowerUps();
        this.updateParticles();
        
        // Verificar spawn de boss
        if (!gameData.bossActive && gameData.currentWave % 5 === 0 && 
            this.waveTimer === 300 && gameEntities.enemies.length === 0) {
            this.spawnBoss();
        }
    },
    
    updateStars() {
        gameEntities.stars.forEach(star => {
            star.y += star.speed;
            
            if (star.y > gameData.canvas.height) {
                star.y = 0;
                star.x = Math.random() * gameData.canvas.width;
            }
        });
    },
    
    updateEnemies() {
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.enemies.length - 1; index >= 0; index--) {
            const enemy = gameEntities.enemies[index];
            enemy.patternTimer++;
            
            // Movimento baseado no padrão
            switch(enemy.pattern) {
                case 'straight':
                    enemy.y += enemy.speed;
                    break;
                case 'wave':
                    enemy.y += enemy.speed;
                    enemy.x += Math.sin(enemy.patternTimer * 0.1) * 3;
                    break;
                case 'zigzag':
                    enemy.y += enemy.speed;
                    enemy.x += (enemy.patternTimer % 40 < 20) ? 2 : -2;
                    break;
                case 'circle':
                    enemy.y += enemy.speed * 0.5;
                    enemy.x += Math.cos(enemy.patternTimer * 0.05) * 2;
                    break;
            }
            
            // Inimigos atiradores
            if (enemy.canShoot && enemy.y > 0 && enemy.y < 300) {
                enemy.shootTimer++;
                if (enemy.shootTimer > 120) {
                    enemy.shootTimer = 0;
                    this.enemyShoot(enemy);
                }
            }
            
            // Remover se saiu da tela
            if (enemy.y > gameData.canvas.height) {
                gameEntities.enemies.splice(index, 1);
                continue;
            }
            
            // Colisão com jogador
            if (this.checkCollision(dragon, enemy)) {
                dragon.takeDamage(20);
                gameEntities.enemies.splice(index, 1);
                this.createParticles(enemy.x, enemy.y, '#8B0000');
            }
        }
    },
    
    updateBoss() {
        if (!gameEntities.boss) return;
        
        const boss = gameEntities.boss;
        boss.moveTimer++;
        boss.shootTimer++;
        
        // Movimento do boss
        if (boss.y < boss.targetY) {
            boss.y += boss.speed;
            // ✨ CORREÇÃO: Garantir que não ultrapasse o targetY
            if (boss.y > boss.targetY) {
                boss.y = boss.targetY;
            }
        } else {
            // Movimento lateral
            if (boss.moveTimer % 180 < 90) {
                boss.x += boss.speed;
            } else {
                boss.x -= boss.speed;
            }
            boss.x = Math.max(0, Math.min(gameData.canvas.width - boss.width, boss.x));
        }
        
        // ✨ CORREÇÃO: Garantir que o boss SEMPRE fique dentro dos limites visíveis
        boss.y = Math.max(50, Math.min(250, boss.y));
        
        // Padrões de ataque do boss
        if (boss.shootTimer > 60) {
            boss.shootTimer = 0;
            boss.pattern = (boss.pattern + 1) % 3;
            
            switch(boss.pattern) {
                case 0: // Spray de projéteis
                    for (let i = -2; i <= 2; i++) {
                        gameEntities.fireballs.push({
                            x: boss.x + boss.width / 2,
                            y: boss.y + boss.height,
                            width: 15,
                            height: 15,
                            speed: 5,
                            damage: 15,
                            type: 'enemy',
                            vx: i * 2,
                            vy: 5
                        });
                    }
                    break;
                case 1: // Projéteis direcionados
                    const dx = dragon.x - boss.x;
                    const dy = dragon.y - boss.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    gameEntities.fireballs.push({
                        x: boss.x + boss.width / 2,
                        y: boss.y + boss.height,
                        width: 20,
                        height: 20,
                        speed: 4,
                        damage: 20,
                        type: 'enemy',
                        vx: (dx / dist) * 4,
                        vy: (dy / dist) * 4
                    });
                    break;
                case 2: // Círculo de projéteis
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        gameEntities.fireballs.push({
                            x: boss.x + boss.width / 2,
                            y: boss.y + boss.height / 2,
                            width: 12,
                            height: 12,
                            speed: 3,
                            damage: 10,
                            type: 'enemy',
                            vx: Math.cos(angle) * 3,
                            vy: Math.sin(angle) * 3
                        });
                    }
                    break;
            }
        }
        
        // Colisão com jogador
        if (this.checkCollision(dragon, boss)) {
            dragon.takeDamage(30);
        }
    },
    
    enemyShoot(enemy) {
        const dx = dragon.x - enemy.x;
        const dy = dragon.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        gameEntities.fireballs.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            width: 10,
            height: 10,
            speed: 4,
            damage: 10,
            type: 'enemy',
            vx: (dx / dist) * 4,
            vy: (dy / dist) * 4
        });
    },
    
    updateFireballs() {
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.fireballs.length - 1; index >= 0; index--) {
            const fireball = gameEntities.fireballs[index];
            
            if (fireball.type === 'player') {
                fireball.y -= fireball.speed;
                if (fireball.vx) fireball.x += fireball.vx;
            } else {
                if (fireball.vx !== undefined) {
                    fireball.x += fireball.vx;
                    fireball.y += fireball.vy;
                } else {
                    fireball.y += fireball.speed;
                }
            }
            
            // Remover se saiu da tela
            if (fireball.y < -50 || fireball.y > gameData.canvas.height + 50 ||
                fireball.x < -50 || fireball.x > gameData.canvas.width + 50) {
                
                // ✨ RANK SYSTEM: Registrar disparo que errou (saiu da tela)
                if (fireball.type === 'player' && typeof rankSystem !== 'undefined') {
                    rankSystem.registerShot(false);
                }
                
                gameEntities.fireballs.splice(index, 1);
                continue;
            }
            
            // Projéteis inimigos colidem com jogador
            if (fireball.type === 'enemy' && this.checkCollision(fireball, dragon)) {
                dragon.takeDamage(fireball.damage);
                gameEntities.fireballs.splice(index, 1);
                this.createParticles(fireball.x, fireball.y, '#FF0000');
                continue;
            }
            
            // Projéteis do jogador colidem com inimigos
            if (fireball.type === 'player') {
                // Colisão com inimigos normais
                let hit = false;
                for (let eIndex = gameEntities.enemies.length - 1; eIndex >= 0; eIndex--) {
                    const enemy = gameEntities.enemies[eIndex];
                    if (this.checkCollision(fireball, enemy)) {
                        enemy.health -= fireball.damage;
                        gameEntities.fireballs.splice(index, 1);
                        this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#FF6B35');
                        
                        if (enemy.health <= 0) {
                            gameEntities.enemies.splice(eIndex, 1);
                            
                            // Sistema de Combo
                            const timeSinceLastKill = Date.now() - gameData.lastKillTime;
                            
                            if (timeSinceLastKill < 2000) { // 2 segundos para manter combo
                                gameData.comboCount++;
                                gameData.comboMultiplier = Math.min(1 + (gameData.comboCount * 0.1), 3); // Max 3x
                                
                                if (gameData.comboCount > 2) {
                                    ui.showNotification(`🔥 COMBO ${gameData.comboCount}x!`);
                                }
                                
                                // Salvar melhor combo
                                if (gameData.comboCount > gameData.bestCombo) {
                                    gameData.bestCombo = gameData.comboCount;
                                    localStorage.setItem('bestCombo', gameData.bestCombo);
                                }
                                
                                // Efeito visual extra para combos altos
                                if (gameData.comboCount >= 10) {
                                    for (let i = 0; i < 20; i++) {
                                        const angle = (Math.PI * 2 / 20) * i;
                                        gameEntities.particles.push({
                                            x: enemy.x + enemy.width / 2,
                                            y: enemy.y + enemy.height / 2,
                                            vx: Math.cos(angle) * 5,
                                            vy: Math.sin(angle) * 5,
                                            life: 30,
                                            color: '#FFD700',
                                            size: 4
                                        });
                                    }
                                }
                            } else {
                                if (gameData.comboCount > 5) {
                                    ui.showNotification(`Combo encerrado: ${gameData.comboCount}x 😢`);
                                }
                                gameData.comboCount = 1;
                                gameData.comboMultiplier = 1;
                            }
                            
                            gameData.lastKillTime = Date.now();
                            
                            // Aplicar multiplicador de combo à pontuação
                            const bonusScore = Math.floor((enemy.scoreValue || 100) * gameData.comboMultiplier);
                            gameStats.score += bonusScore;
                            
                            // Contador de inimigos mortos na fase
                            gameData.enemiesKilledThisStage++;
                            
                            let defeated = parseInt(localStorage.getItem('enemiesDefeated')) || 0;
                            defeated++;
                            localStorage.setItem('enemiesDefeated', defeated);
                            
                            // Drop de moedas
                            if (Math.random() < 0.4) {
                                gameEntities.coins.push({
                                    x: enemy.x + enemy.width / 2,
                                    y: enemy.y + enemy.height / 2,
                                    width: 20,
                                    height: 20,
                                    speed: 2,
                                    value: 5,
                                    angle: 0
                                });
                            }
                            
                            // Drop de power-ups (melhorado)
                            if (Math.random() < 0.15) {
                                const type = this.getRandomPowerUpType();
                                gameEntities.powerups.push({
                                    x: enemy.x + enemy.width / 2,
                                    y: enemy.y + enemy.height / 2,
                                    width: 30,
                                    height: 30,
                                    speed: 2,
                                    type: type,
                                    angle: 0
                                });
                            }
                            
                            achievementManager.check();
                        }
                        hit = true;
                        break; // Fireball acertou, sair do loop
                    }
                }
                
                if (hit) continue; // Pular para próximo fireball
                
                // Colisão com boss
                if (gameEntities.boss && this.checkCollision(fireball, gameEntities.boss)) {
                    gameEntities.boss.health -= fireball.damage;
                    gameEntities.fireballs.splice(index, 1);
                    this.createParticles(fireball.x, fireball.y, '#FF6B35', 5);
                    
                    if (gameEntities.boss.health <= 0) {
                        const isStageBoss = gameEntities.boss.stageBoss;
                        
                        gameStats.score += 5000;
                        gameStats.coins += 50;
                        gameStats.totalCoins += 50;
                        localStorage.setItem('dragonCoins', gameStats.coins);
                        localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
                        
                        let bossesDefeated = parseInt(localStorage.getItem('bossesDefeated')) || 0;
                        bossesDefeated++;
                        localStorage.setItem('bossesDefeated', bossesDefeated);
                        
                        this.createParticles(gameEntities.boss.x + gameEntities.boss.width/2, 
                                           gameEntities.boss.y + gameEntities.boss.height/2, 
                                           '#4B0082', 30);
                        
                        gameEntities.boss = null;
                        gameData.bossActive = false;
                        
                        if (isStageBoss) {
                            // Boss de fase derrotado - completar fase
                            ui.showNotification(`🏆 ${stages[gameData.currentStage].bossName} DERROTADO!`);
                            setTimeout(() => {
                                game.completeStage();
                            }, 2000);
                        } else {
                            ui.showNotification('🏆 BOSS DERROTADO! +5000 pontos');
                        }
                        
                        achievementManager.check();
                    }
                }
            }
        }
    },
    
    updateCoins() {
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.coins.length - 1; index >= 0; index--) {
            const coin = gameEntities.coins[index];
            coin.y += coin.speed;
            coin.angle += 0.1;
            
            if (coin.y > gameData.canvas.height) {
                gameEntities.coins.splice(index, 1);
                continue;
            }
            
            if (this.checkCollision(dragon, coin)) {
                gameStats.coins += coin.value;
                gameStats.totalCoins += coin.value;
                gameStats.score += 25;
                localStorage.setItem('dragonCoins', gameStats.coins);
                localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
                gameEntities.coins.splice(index, 1);
                this.createParticles(coin.x, coin.y, '#FFD700', 8);
            }
        }
    },
    
    updatePowerUps() {
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.powerups.length - 1; index >= 0; index--) {
            const powerup = gameEntities.powerups[index];
            powerup.y += powerup.speed;
            powerup.angle += 0.05;
            
            if (powerup.y > gameData.canvas.height) {
                gameEntities.powerups.splice(index, 1);
                continue;
            }
            
            if (this.checkCollision(dragon, powerup)) {
                this.activatePowerUp(powerup.type);
                gameEntities.powerups.splice(index, 1);
                this.createParticles(powerup.x, powerup.y, '#00FF00', 12);
            }
        }
    },
    
    activatePowerUp(type) {
        switch(type) {
            case 'health':
                gameStats.health = Math.min(100 + (upgrades.health.level * 20), 
                                           gameStats.health + 30);
                ui.showNotification('❤️ +30 Vida!');
                break;
            case 'rapid_fire':
                gameStats.powerUpActive = 'rapid_fire';
                gameStats.powerUpTimer = 300; // 5 segundos
                ui.showNotification('⚡ Tiro Rápido Ativado!');
                break;
            case 'shield':
                dragon.invulnerable = true;
                dragon.invulnerableTimer = 180; // 3 segundos
                ui.showNotification('🛡️ Escudo Ativado!');
                break;
            case 'bomb':
                // Limpar todos os inimigos na tela
                gameEntities.enemies.forEach(enemy => {
                    gameStats.score += enemy.scoreValue || 100;
                    this.createParticles(enemy.x, enemy.y, '#FF6B35', 15);
                });
                gameEntities.enemies = [];
                gameEntities.fireballs = gameEntities.fireballs.filter(f => f.type === 'player');
                ui.showNotification('💣 Bomba! Inimigos Eliminados!');
                break;
        }
    },
    
    updateParticles() {
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.particles.length - 1; index >= 0; index--) {
            const particle = gameEntities.particles[index];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.size *= 0.95;
            
            if (particle.life <= 0) {
                gameEntities.particles.splice(index, 1);
            }
        }
    },
    
    // Desenhar todas as entidades
    drawAll() {
        this.drawStars();
        this.drawCoins();
        this.drawPowerUps();
        this.drawEnemies();
        this.drawBoss();
        this.drawFireballs();
        
        // ✨ NOVO: Desenhar projéteis dos inimigos
        if (typeof enemyProjectiles !== 'undefined') {
            enemyProjectiles.draw(gameData.ctx);
        }
        
        this.drawParticles();
    },
    
    // ✨ NOVO: Método para desenhar inimigos
    drawEnemies() {
        const ctx = gameData.ctx;
        const phaseData = this.getCurrentPhaseData();
        
        gameEntities.enemies.forEach(enemy => {
            // Verificar se o inimigo pertence à fase atual e usar renderizador customizado
            if (phaseData && phaseData.drawEnemy && enemy.phase === gameData.currentStage) {
                phaseData.drawEnemy(ctx, enemy);
            } else if (typeof enemyRenderer !== 'undefined' && enemy.name) {
                // Usar novo renderizador se disponível
                enemyRenderer.draw(ctx, enemy);
            } else {
                // Fallback para renderização simples
                ctx.fillStyle = enemy.color || '#8B0000';
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                // Barra de vida simples
                if (enemy.health < enemy.maxHealth) {
                    const healthPercent = enemy.health / enemy.maxHealth;
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
                    ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : '#FF0000';
                    ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
                }
            }
        });
    },
    
    drawStars() {
        const ctx = gameData.ctx;
        ctx.fillStyle = '#FFFFFF';
        gameEntities.stars.forEach(star => {
            ctx.globalAlpha = 0.5 + Math.random() * 0.5;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        ctx.globalAlpha = 1;
    },
    
    drawCoins() {
        const ctx = gameData.ctx;
        gameEntities.coins.forEach(coin => {
            ctx.save();
            ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2);
            ctx.rotate(coin.angle);
            
            ctx.fillStyle = config.colors.coin;
            ctx.shadowBlur = 15;
            ctx.shadowColor = config.colors.coin;
            ctx.fillRect(-coin.width/2, -coin.height/2, coin.width, coin.height);
            
            ctx.restore();
        });
        ctx.shadowBlur = 0;
    },
    
    drawPowerUps() {
    const ctx = gameData.ctx;
    gameEntities.powerups.forEach(powerup => {
        ctx.save();
        ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
        ctx.rotate(powerup.angle);

        // Cor baseada no tipo
        let color = '#00FF00';
        const powerUpConfig = config.powerUpTypes.find(p => p.type === powerup.type);
        if (powerUpConfig) {
            color = powerUpConfig.color;
        }

        ctx.fillStyle = color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.fillRect(
            -powerup.width / 2,
            -powerup.height / 2,
            powerup.width,
            powerup.height
        );

        // Borda pulsante
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        const pulse = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        ctx.globalAlpha = pulse;
        ctx.strokeRect(
            -powerup.width / 2,
            -powerup.height / 2,
            powerup.width,
            powerup.height
        );
        ctx.globalAlpha = 1;

        // Símbolo
        const symbols = {
            health: '❤️',
            rapid_fire: '⚡',
            shield: '🛡',
            bomb: '💣',
            double_damage: '💥'
        };

        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(symbols[powerup.type] || '?', 0, 0);

        ctx.restore();
    });

    ctx.shadowBlur = 0;
},

    
    drawBoss() {
        if (!gameEntities.boss) return;
        
        const ctx = gameData.ctx;
        const boss = gameEntities.boss;
        
        // ✨ CORREÇÃO: Verificação de segurança - se o boss está fora da tela, reposicionar
        if (boss.y < -200 || boss.y > gameData.canvas.height) {
            console.warn('Boss fora da tela! Reposicionando...', boss.y);
            boss.y = boss.targetY || 80;
        }
        
        if (boss.x < -boss.width || boss.x > gameData.canvas.width) {
            console.warn('Boss fora da tela (X)! Reposicionando...', boss.x);
            boss.x = gameData.canvas.width / 2 - boss.width / 2;
        }
        
        // Corpo do boss
        ctx.fillStyle = config.colors.boss;
        ctx.shadowBlur = 25;
        ctx.shadowColor = config.colors.boss;
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        
        // Detalhes do boss
        ctx.shadowBlur = 0;
        
        // Olhos brilhantes
        ctx.fillStyle = '#FF0000';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF0000';
        ctx.fillRect(boss.x + 30, boss.y + 20, 20, 20);
        ctx.fillRect(boss.x + boss.width - 50, boss.y + 20, 20, 20);
        
        // Barra de vida grande
        ctx.shadowBlur = 0;
        const healthPercent = boss.health / boss.maxHealth;
        
        // Borda da barra
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 20, gameData.canvas.width - 100, 20);
        
        // Fundo da barra
        ctx.fillStyle = '#333';
        ctx.fillRect(52, 22, gameData.canvas.width - 104, 16);
        
        // Barra de vida colorida
        const gradient = ctx.createLinearGradient(52, 0, 52 + (gameData.canvas.width - 104) * healthPercent, 0);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.5, '#FF8C00');
        gradient.addColorStop(1, '#FFD700');
        ctx.fillStyle = gradient;
        ctx.fillRect(52, 22, (gameData.canvas.width - 104) * healthPercent, 16);
        
        // Texto do boss
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        
        // ✨ CORREÇÃO: Mostrar nome do boss se disponível
        const bossName = boss.stageName || 'BOSS';
        ctx.fillText(bossName, gameData.canvas.width / 2, 50);
        
        // ✨ DEBUG: Mostrar informações do boss (remover após corrigir)
        ctx.fillStyle = '#00FF00';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`HP: ${Math.floor(boss.health)}/${boss.maxHealth} | Pos: ${Math.floor(boss.x)},${Math.floor(boss.y)}`, 10, 70);
    },
    
    drawFireballs() {
        const ctx = gameData.ctx;
        gameEntities.fireballs.forEach(fireball => {
            const isPlayerFireball = fireball.type === 'player';
            let color = isPlayerFireball ? config.colors.fireball : '#8B008B';
            
            // Efeito especial se double damage ativo
            if (isPlayerFireball && gameStats.powerUpActive === 'double_damage') {
                color = '#FF1493'; // Rosa choque
                ctx.shadowBlur = 30;
            } else {
                ctx.shadowBlur = 20;
            }
            
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(fireball.x + fireball.width/2, fireball.y + fireball.height/2, 
                   fireball.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Efeito extra de double damage - anel externo
            if (isPlayerFireball && gameStats.powerUpActive === 'double_damage') {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(fireball.x + fireball.width/2, fireball.y + fireball.height/2, 
                       fireball.width/2 + 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            
            // Rastro
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(fireball.x + fireball.width/2, 
                   fireball.y + fireball.height/2 + (fireball.type === 'player' ? 5 : -5), 
                   fireball.width/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;
    },
    
    drawParticles() {
        const ctx = gameData.ctx;
        gameEntities.particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life / 30;
            ctx.shadowBlur = 5;
            ctx.shadowColor = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
};
