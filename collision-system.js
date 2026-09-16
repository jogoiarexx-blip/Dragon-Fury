// ===== SISTEMA DE COLISÃO - DRAGON FURY =====

const collisionSystem = {
    
    // Colisão AABB (Axis-Aligned Bounding Box)
    checkAABB(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    // Colisão circular (mais precisa para objetos redondos)
    checkCircle(obj1, obj2) {
        const centerX1 = obj1.x + obj1.width / 2;
        const centerY1 = obj1.y + obj1.height / 2;
        const centerX2 = obj2.x + obj2.width / 2;
        const centerY2 = obj2.y + obj2.height / 2;
        
        const radius1 = Math.min(obj1.width, obj1.height) / 2;
        const radius2 = Math.min(obj2.width, obj2.height) / 2;
        
        const dx = centerX1 - centerX2;
        const dy = centerY1 - centerY2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < radius1 + radius2;
    },
    
    // Sistema principal de verificação de colisões
    checkAll() {
        // Player vs Inimigos
        this.checkPlayerVsEnemies();
        
        // Player vs Fireballs inimigos
        this.checkPlayerVsEnemyFireballs();
        
        // Player vs Moedas
        this.checkPlayerVsCoins();
        
        // Player vs Power-ups
        this.checkPlayerVsPowerUps();
        
        // ✨ NOVO: Player vs Ovo (resgate)
        this.checkPlayerVsEgg();
        
        // Fireballs do player vs Inimigos
        this.checkPlayerFireballsVsEnemies();
        
        // Fireballs do player vs Boss
        this.checkPlayerFireballsVsBoss();
        
        // Player vs Boss
        this.checkPlayerVsBoss();
        
        // Escolta vs Inimigos (se ativo)
        if (typeof escortManager !== 'undefined' && escortManager.isActive()) {
            this.checkEscortsVsEnemies();
        }
    },
    
    checkPlayerVsEnemies() {
        if (dragon.invulnerable) return;
        
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.enemies.length - 1; index >= 0; index--) {
            const enemy = gameEntities.enemies[index];
            if (this.checkAABB(dragon, enemy)) {
                const damage = enemy.damage;
                dragon.takeDamage(damage);
                
                // ✨ RANK SYSTEM: Registrar dano recebido
                if (typeof rankSystem !== 'undefined') {
                    rankSystem.registerDamage(damage);
                }
                
                // Inimigo morre ao colidir (exceto tank e boss)
                if (enemy.type !== 'tank' && enemy.type !== 'parasite') {
                    enemy.destroy();
                    gameEntities.enemies.splice(index, 1);
                    // 🔧 NOVO: efeito sonoro de explosão
                    if (typeof audioSystem !== 'undefined') audioSystem.playExplosion();
                }
            }
        }
    },
    
    checkPlayerVsEnemyFireballs() {
        if (dragon.invulnerable) return;
        
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.fireballs.length - 1; index >= 0; index--) {
            const fb = gameEntities.fireballs[index];
            if (fb.type === 'enemy' && this.checkCircle(dragon, fb)) {
                const damage = fb.damage;
                dragon.takeDamage(damage);
                
                // ✨ RANK SYSTEM: Registrar dano recebido
                if (typeof rankSystem !== 'undefined') {
                    rankSystem.registerDamage(damage);
                }
                
                gameEntities.fireballs.splice(index, 1);
                
                // Efeito de impacto
                this.createImpactEffect(fb.x, fb.y, fb.color || '#FF0000');
            }
        }
    },
    
    checkPlayerVsCoins() {
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.coins.length - 1; index >= 0; index--) {
            const coin = gameEntities.coins[index];
            if (this.checkCircle(dragon, coin)) {
                gameStats.coins += coin.value;
                gameStats.totalCoins += coin.value;
                gameStats.score += coin.value * 10;
                
                localStorage.setItem('dragonCoins', gameStats.coins);
                localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
                
                // 🔧 NOVO: efeito sonoro de moeda
                if (typeof audioSystem !== 'undefined') audioSystem.playCoin();
                
                // Efeito visual
                this.createCollectEffect(coin.x, coin.y, '#FFD700');
                
                // ✨ MELHORIA: Pulso/partículas do coin-effects.js ao coletar
                if (typeof coinEffects !== 'undefined') {
                    coinEffects.onCollect(coin.x + coin.width / 2, coin.y + coin.height / 2, gameData.ctx);
                }
                
                gameEntities.coins.splice(index, 1);
            }
        }
    },
    
    checkPlayerVsPowerUps() {
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.powerups.length - 1; index >= 0; index--) {
            const powerup = gameEntities.powerups[index];
            if (this.checkCircle(dragon, powerup)) {
                // ✨ RANK SYSTEM: Registrar power-up coletado
                if (typeof rankSystem !== 'undefined') {
                    rankSystem.registerPowerUp();
                }
                
                this.activatePowerUp(powerup.type);
                
                // 🔧 NOVO: efeito sonoro de power-up
                if (typeof audioSystem !== 'undefined') audioSystem.playPowerup();
                
                // Efeito visual
                this.createCollectEffect(powerup.x, powerup.y, '#00FF00');
                
                // ✨ MELHORIA: Onda de choque/partículas do powerup-effects.js ao coletar
                if (typeof powerUpEffects !== 'undefined') {
                    powerUpEffects.onCollect(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, powerup.type, gameData.ctx);
                }
                
                gameEntities.powerups.splice(index, 1);
            }
        }
    },
    
    // ✨ NOVO: Player vs Ovo de dragão (objetivo de resgate da fase)
    checkPlayerVsEgg() {
        for (let index = gameEntities.eggs.length - 1; index >= 0; index--) {
            const egg = gameEntities.eggs[index];
            if (this.checkCircle(dragon, egg)) {
                if (typeof eggSystem !== 'undefined') {
                    eggSystem.rescue(egg, index);
                } else {
                    gameEntities.eggs.splice(index, 1);
                }
            }
        }
    },
    
    checkPlayerFireballsVsEnemies() {
        // CORREÇÃO: Usar loops reversos para evitar pular elementos ao usar splice
        for (let fbIndex = gameEntities.fireballs.length - 1; fbIndex >= 0; fbIndex--) {
            const fb = gameEntities.fireballs[fbIndex];
            if (fb.type !== 'player') continue;
            
            for (let enemyIndex = gameEntities.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
                const enemy = gameEntities.enemies[enemyIndex];
                if (this.checkCircle(fb, enemy)) {
                    // ✨ RANK SYSTEM: Registrar acerto
                    if (typeof rankSystem !== 'undefined') {
                        rankSystem.registerShot(true);
                    }
                    
                    // Aplicar dano
                    const destroyed = enemy.takeDamage(fb.damage);
                    
                    // 🔧 NOVO: efeito sonoro de acerto/explosão
                    if (typeof audioSystem !== 'undefined') {
                        if (destroyed) audioSystem.playExplosion();
                        else audioSystem.playHit();
                    }
                    
                    if (destroyed) {
                        // ✨ RANK SYSTEM: Registrar kill
                        if (typeof rankSystem !== 'undefined') {
                            rankSystem.registerKill();
                        }
                        gameEntities.enemies.splice(enemyIndex, 1);
                    }
                    
                    // Remover fireball
                    gameEntities.fireballs.splice(fbIndex, 1);
                    
                    // Efeito de impacto
                    this.createImpactEffect(fb.x, fb.y, fb.color || '#FF6B35');
                    break; // Fireball já foi removido, sair do loop interno
                }
            }
        }
    },
    
    checkPlayerFireballsVsBoss() {
        if (!gameData.bossActive || !gameEntities.boss) return;
        
        const boss = gameEntities.boss;
        
        // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
        for (let index = gameEntities.fireballs.length - 1; index >= 0; index--) {
            const fb = gameEntities.fireballs[index];
            if (fb.type !== 'player') continue;
            
            if (this.checkCircle(fb, boss)) {
                const destroyed = boss.takeDamage(fb.damage);
                
                gameEntities.fireballs.splice(index, 1);
                this.createImpactEffect(fb.x, fb.y, fb.color || '#FF6B35');
                
                // 🔧 NOVO: efeito sonoro de acerto/explosão no boss
                if (typeof audioSystem !== 'undefined') {
                    if (destroyed) audioSystem.playBossExplosion();
                    else audioSystem.playHit();
                }
                
                if (destroyed) {
                    // Boss derrotado - completar fase
                    game.completeStage();
                    // 🔧 BUGFIX: para de processar fireballs restantes contra
                    // este boss (já destruído) neste frame - ver comentário
                    // em BaseBoss.destroyed (boss-system.js).
                    break;
                }
            }
        }
    },
    
    checkPlayerVsBoss() {
        if (!gameData.bossActive || !gameEntities.boss || dragon.invulnerable) return;
        
        const boss = gameEntities.boss;
        
        if (this.checkAABB(dragon, boss)) {
            dragon.takeDamage(30); // Dano alto de colisão com boss
        }
    },
    
    checkEscortsVsEnemies() {
        escortManager.escorts.forEach(escort => {
            // CORREÇÃO: Usar loop reverso para evitar pular elementos ao usar splice
            for (let index = gameEntities.enemies.length - 1; index >= 0; index--) {
                const enemy = gameEntities.enemies[index];
                if (this.checkAABB(escort, enemy)) {
                    // Escolta toma menos dano
                    const destroyed = enemy.takeDamage(20);
                    
                    if (destroyed) {
                        gameEntities.enemies.splice(index, 1);
                    }
                }
            }
        });
    },
    
    // Ativar power-up
    activatePowerUp(type) {
        switch(type) {
            case 'health':
                const maxHealth = 100 + (upgrades.health.level * 20);
                gameStats.health = Math.min(maxHealth, gameStats.health + 30);
                ui.showNotification('❤️ +30 Vida!');
                break;
                
            case 'rapid_fire':
                gameStats.powerUpActive = 'rapid_fire';
                gameStats.powerUpTimer = 600; // 10 segundos
                ui.showNotification('⚡ Tiro Rápido Ativado!');
                break;
                
            case 'shield':
                dragon.invulnerable = true;
                dragon.invulnerableTimer = 300; // 5 segundos
                gameStats.powerUpActive = 'shield';
                gameStats.powerUpTimer = 300;
                ui.showNotification('🛡️ Escudo Ativado!');
                break;
                
            case 'bomb':
                this.activateBomb();
                ui.showNotification('💣 Bomba Ativada!');
                break;
                
            case 'double_damage':
                gameStats.powerUpActive = 'double_damage';
                gameStats.powerUpTimer = 480; // 8 segundos
                ui.showNotification('💥 Dano Duplo Ativado!');
                break;
        }
    },
    
    activateBomb() {
        // Explodir todos os inimigos na tela
        gameEntities.enemies.forEach(enemy => {
            enemy.health = 0;
            enemy.destroy();
        });
        
        gameEntities.enemies = [];
        
        // Limpar projéteis inimigos
        gameEntities.fireballs = gameEntities.fireballs.filter(fb => fb.type === 'player');
        
        // Efeito visual massivo
        for (let i = 0; i < 100; i++) {
            gameEntities.particles.push({
                x: gameData.canvas.width / 2,
                y: gameData.canvas.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 8 + 4,
                color: ['#FF0000', '#FF6B35', '#FFD700', '#FFFFFF'][Math.floor(Math.random() * 4)],
                life: 60
            });
        }
    },
    
    // Efeitos visuais
    createImpactEffect(x, y, color) {
        for (let i = 0; i < 8; i++) {
            gameEntities.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 4 + 2,
                color: color,
                life: 20
            });
        }
    },
    
    createCollectEffect(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            gameEntities.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                size: 3,
                color: color,
                life: 30
            });
        }
    }
};
