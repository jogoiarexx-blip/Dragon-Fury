// ===== GERENCIADOR DE FASES =====

const phaseManager = {
    currentPhase: null,
    phases: {},
    
    // Inicializar todas as fases
    init() {
        this.phases = {
            1: phase1_ceuSereno,
            2: phase2_tempestadeIminente,
            3: phase3_furiaArdente,
            4: phase4_abismoSombrio,
            5: phase5_invasaoCosmica
        };
        
        console.log('✅ PhaseManager inicializado com', Object.keys(this.phases).length, 'fases');
    },
    
    // Carregar uma fase específica
    loadPhase(phaseNumber, transitionType = 'fade') {
        if (!this.phases[phaseNumber]) {
            console.error('❌ Fase', phaseNumber, 'não encontrada!');
            return false;
        }
        
        const previousPhase = this.currentPhase ? this.currentPhase.id : null;
        
        // Iniciar transição se houver fase anterior
        if (previousPhase !== null && typeof phaseTransitions !== 'undefined') {
            phaseTransitions.startTransition(previousPhase, phaseNumber, transitionType);
        }
        
        this.currentPhase = this.phases[phaseNumber];
        console.log('📍 Fase carregada:', this.currentPhase.name);
        
        // Aplicar configurações da fase ao gameData
        gameData.scrollSpeed = 2 * this.currentPhase.config.speedMultiplier;
        gameData.stageTargetKills = this.currentPhase.config.targetKills;
        
        // Inicializar parallax para a nova fase
        if (typeof parallaxSystem !== 'undefined') {
            parallaxSystem.init(phaseNumber);
        }
        
        // Inicializar efeitos da fase
        if (typeof phaseEffects !== 'undefined') {
            phaseEffects.init(phaseNumber);
        }
        
        return true;
    },
    
    // Obter fase atual
    getCurrentPhase() {
        return this.currentPhase;
    },
    
    // Spawnar inimigo da fase atual
    spawnEnemy() {
        if (!this.currentPhase) return null;
        return this.currentPhase.spawnEnemy();
    },
    
    // Spawnar obstáculo da fase atual
    spawnObstacle() {
        if (!this.currentPhase) return null;
        return this.currentPhase.spawnObstacle();
    },
    
    // Desenhar inimigo usando renderizador da fase
    drawEnemy(ctx, enemy) {
        if (!this.currentPhase) return;
        if (enemy.phase === this.currentPhase.id) {
            this.currentPhase.drawEnemy(ctx, enemy);
        }
    },
    
    // Desenhar obstáculo usando renderizador da fase
    drawObstacle(ctx, obstacle) {
        if (!this.currentPhase) return;
        if (obstacle.phase === this.currentPhase.id) {
            this.currentPhase.drawObstacle(ctx, obstacle);
        }
    },
    
    // Atualizar comportamento de inimigo
    updateEnemyBehavior(enemy) {
        if (!enemy || !enemy.behavior) return;
        
        enemy.patternTimer++;
        
        switch(enemy.behavior) {
            case 'straight':
                // Apenas desce reto
                break;
                
            case 'zigzag':
                enemy.x += Math.sin(enemy.patternTimer * 0.05) * 3;
                break;
                
            case 'wave':
                enemy.x += Math.sin(enemy.patternTimer * 0.08) * 2;
                break;
                
            case 'dive':
                // Mergulha em direção ao jogador
                if (enemy.patternTimer % 120 === 0) {
                    const dx = dragon.x - enemy.x;
                    enemy.targetX = enemy.x + dx * 0.5;
                }
                if (enemy.targetX !== undefined) {
                    enemy.x += (enemy.targetX - enemy.x) * 0.05;
                }
                break;
                
            case 'circle':
                const radius = 50;
                enemy.x = enemy.x + Math.cos(enemy.patternTimer * 0.05) * 2;
                break;
                
            case 'erratic':
                if (enemy.patternTimer % 30 === 0) {
                    enemy.velocityX = (Math.random() - 0.5) * 5;
                }
                enemy.x += enemy.velocityX || 0;
                break;
                
            case 'swoop':
                // Voo em mergulho
                if (enemy.patternTimer < 60) {
                    enemy.y += enemy.speed * 0.5;
                } else if (enemy.patternTimer < 120) {
                    enemy.y += enemy.speed * 2;
                } else {
                    enemy.patternTimer = 0;
                }
                break;
                
            case 'aggressive':
                // Persegue o jogador
                const dx2 = dragon.x - enemy.x;
                enemy.x += Math.sign(dx2) * Math.min(Math.abs(dx2), 2);
                break;
                
            case 'resurrect':
                // Fênix revive uma vez
                if (enemy.health <= 0 && !enemy.hasRevived && enemy.revival) {
                    enemy.deathTimer++;
                    if (enemy.deathTimer >= enemy.revivalTime) {
                        enemy.health = enemy.maxHealth * 0.5;
                        enemy.hasRevived = true;
                        enemy.deathTimer = 0;
                        ui.showNotification('🔥 Inimigo Reviveu!');
                    }
                }
                break;
                
            case 'tank':
                // Movimento lento e constante
                break;
                
            case 'phase':
                // Espectro que pode atravessar
                enemy.alpha = Math.sin(enemy.patternTimer * 0.05) * 0.5 + 0.5;
                enemy.x += Math.sin(enemy.patternTimer * 0.03) * 1.5;
                break;
                
            case 'teleport':
                // Teleporta ocasionalmente
                if (enemy.patternTimer % 180 === 0) {
                    enemy.x = Math.random() * (gameData.canvas.width - enemy.width);
                    entities.createParticles(enemy.x, enemy.y, '#8B00FF', 15);
                }
                break;
                
            case 'slither':
                // Movimento ondulante de serpente
                enemy.x += Math.sin(enemy.patternTimer * 0.1) * 2;
                break;
                
            case 'absorb':
                // Orbe que absorve projéteis
                if (enemy.absorption) {
                    // Lógica de absorção será implementada no collision
                }
                break;
                
            case 'strafe':
                // Movimento lateral
                if (!enemy.strafeDirection) enemy.strafeDirection = Math.random() < 0.5 ? -1 : 1;
                enemy.x += enemy.strafeDirection * 2;
                if (enemy.x < 0 || enemy.x > gameData.canvas.width - enemy.width) {
                    enemy.strafeDirection *= -1;
                }
                break;
                
            case 'swarm':
                // Movimento em enxame
                if (!enemy.swarmAngle) enemy.swarmAngle = Math.random() * Math.PI * 2;
                enemy.swarmAngle += 0.1;
                enemy.x += Math.cos(enemy.swarmAngle) * 3;
                break;
                
            case 'stationary':
                // Fica parado atirando
                enemy.y = Math.min(enemy.y + enemy.speed, 100);
                break;
        }
        
        // Manter dentro dos limites
        enemy.x = Math.max(0, Math.min(gameData.canvas.width - enemy.width, enemy.x));
    },
    
    // Atualizar comportamento de obstáculo
    updateObstacleBehavior(obstacle) {
        if (!obstacle || !obstacle.effect) return;
        
        switch(obstacle.effect) {
            case 'gravity':
                // Puxa o jogador
                const distX = dragon.x - obstacle.x;
                const distY = dragon.y - obstacle.y;
                const distance = Math.sqrt(distX * distX + distY * distY);
                if (distance < 150) {
                    const force = (150 - distance) / 150;
                    dragon.x += -distX * force * 0.05;
                    dragon.y += -distY * force * 0.05;
                }
                break;
                
            case 'summon':
                // Portal invoca inimigos
                if (obstacle.summonTimer === undefined) obstacle.summonTimer = 0;
                obstacle.summonTimer++;
                if (obstacle.summonTimer > 120) {
                    const newEnemy = this.spawnEnemy();
                    if (newEnemy) {
                        newEnemy.x = obstacle.x;
                        newEnemy.y = obstacle.y;
                        gameEntities.enemies.push(newEnemy);
                    }
                    obstacle.summonTimer = 0;
                }
                break;
                
            case 'drain':
                // Drena vida continuamente
                if (collision.checkCollision(dragon, obstacle)) {
                    gameStats.health -= 0.5;
                }
                break;
        }
        
        // Rotação
        if (obstacle.rotating) {
            obstacle.angle += obstacle.rotationSpeed || 0.02;
        }
        
        // Pulso
        if (obstacle.pulseEffect) {
            obstacle.pulseTime += 0.05;
        }
        
        // Rotação em espiral
        if (obstacle.swirling) {
            obstacle.angle += 0.05;
        }
    },
    
    // Mudar para próxima fase com transição customizada
    changePhase(newPhaseNumber, transitionType = null) {
        // Determinar tipo de transição baseado na fase se não especificado
        if (!transitionType) {
            const transitions = {
                1: 'fade',
                2: 'shake',
                3: 'flash',
                4: 'fade',
                5: 'warp'
            };
            transitionType = transitions[newPhaseNumber] || 'fade';
        }
        
        return this.loadPhase(newPhaseNumber, transitionType);
    }
};

// Inicializar quando o jogo carregar
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (typeof phase1_ceuSereno !== 'undefined') {
            phaseManager.init();
        }
    });
}
