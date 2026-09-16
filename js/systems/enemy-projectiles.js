// ===== SISTEMA DE PROJÉTEIS DOS INIMIGOS =====

const enemyProjectiles = {
    projectiles: [],
    
    // Tipos de projéteis disponíveis
    types: {
        // Projétil básico - bola de energia
        basic: {
            width: 8,
            height: 8,
            speed: 4,
            damage: 10,
            color: '#FF0000',
            shape: 'circle',
            trail: true
        },
        
        // Laser - rápido e direto
        laser: {
            width: 4,
            height: 16,
            speed: 8,
            damage: 15,
            color: '#00FF00',
            shape: 'rect',
            glow: true
        },
        
        // Plasma - médio e rastreador
        plasma: {
            width: 12,
            height: 12,
            speed: 3,
            damage: 12,
            color: '#FF00FF',
            shape: 'circle',
            homing: true,
            homingStrength: 0.02
        },
        
        // Míssil - lento mas forte
        missile: {
            width: 10,
            height: 20,
            speed: 2.5,
            damage: 25,
            color: '#FFD700',
            shape: 'missile',
            homing: true,
            homingStrength: 0.05,
            trail: true,
            smokeTrail: true
        },
        
        // Onda de choque - área
        shockwave: {
            width: 30,
            height: 30,
            speed: 2,
            damage: 8,
            color: '#00FFFF',
            shape: 'ring',
            expanding: true
        },
        
        // Bola de fogo - explosiva
        fireball: {
            width: 16,
            height: 16,
            speed: 3.5,
            damage: 20,
            color: '#FF4500',
            shape: 'circle',
            glow: true,
            particles: true
        },
        
        // Raio congelante
        iceShard: {
            width: 8,
            height: 12,
            speed: 5,
            damage: 10,
            color: '#00FFFF',
            shape: 'shard',
            rotation: true
        },
        
        // Espinho sombrio
        shadowSpike: {
            width: 6,
            height: 18,
            speed: 6,
            damage: 15,
            color: '#8B00FF',
            shape: 'spike',
            phasing: true
        },
        
        // Orbe de energia - split em 3
        energyOrb: {
            width: 14,
            height: 14,
            speed: 3,
            damage: 10,
            color: '#FFFF00',
            shape: 'circle',
            glow: true,
            split: true,
            splitCount: 3
        }
    },
    
    // Criar projétil
    create(x, y, type, angle = Math.PI / 2, targetX = null, targetY = null) {
        const config = this.types[type] || this.types.basic;
        
        const projectile = {
            x: x,
            y: y,
            width: config.width,
            height: config.height,
            vx: Math.cos(angle) * config.speed,
            vy: Math.sin(angle) * config.speed,
            speed: config.speed,
            damage: config.damage,
            color: config.color,
            shape: config.shape,
            type: type,
            angle: angle,
            life: 300, // Frames até desaparecer
            active: true,
            
            // Propriedades especiais
            homing: config.homing || false,
            homingStrength: config.homingStrength || 0,
            trail: config.trail || false,
            glow: config.glow || false,
            particles: config.particles || false,
            expanding: config.expanding || false,
            rotation: config.rotation || false,
            phasing: config.phasing || false,
            split: config.split || false,
            splitCount: config.splitCount || 0,
            smokeTrail: config.smokeTrail || false,
            
            // Estado
            rotationAngle: 0,
            pulsePhase: 0,
            targetX: targetX,
            targetY: targetY,
            hasSplit: false,
            alphaPhase: 0
        };
        
        this.projectiles.push(projectile);
        return projectile;
    },
    
    // Padrões de ataque
    patterns: {
        // Atira direto para baixo
        straight(enemy) {
            return enemyProjectiles.create(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height,
                'basic',
                Math.PI / 2
            );
        },
        
        // Atira em direção ao jogador
        aimed(enemy, projectileType = 'basic') {
            const dx = dragon.x - enemy.x;
            const dy = dragon.y - enemy.y;
            const angle = Math.atan2(dy, dx);
            
            return enemyProjectiles.create(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height,
                projectileType,
                angle,
                dragon.x,
                dragon.y
            );
        },
        
        // Atira em leque (3 projéteis)
        spread(enemy, projectileType = 'basic') {
            const centerAngle = Math.PI / 2;
            const spread = Math.PI / 6; // 30 graus
            
            for (let i = -1; i <= 1; i++) {
                enemyProjectiles.create(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height,
                    projectileType,
                    centerAngle + (spread * i)
                );
            }
        },
        
        // Círculo completo (8 direções)
        circle(enemy, projectileType = 'basic') {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                enemyProjectiles.create(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    projectileType,
                    angle
                );
            }
        },
        
        // Espiral rotativa
        spiral(enemy, projectileType = 'basic') {
            if (!enemy.spiralAngle) enemy.spiralAngle = 0;
            
            for (let i = 0; i < 3; i++) {
                const angle = enemy.spiralAngle + (Math.PI * 2 / 3) * i;
                enemyProjectiles.create(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    projectileType,
                    angle
                );
            }
            
            enemy.spiralAngle += 0.2;
        },
        
        // Rajada rápida em sequência
        burst(enemy, projectileType = 'laser') {
            if (!enemy.burstCount) enemy.burstCount = 0;
            
            if (enemy.burstCount < 5) {
                enemyProjectiles.patterns.aimed(enemy, projectileType);
                enemy.burstCount++;
            } else {
                enemy.burstCount = 0;
            }
        },
        
        // Barreira de projéteis
        wall(enemy, projectileType = 'basic') {
            const spacing = 40;
            const count = 5;
            const startX = enemy.x - (spacing * count / 2);
            
            for (let i = 0; i < count; i++) {
                enemyProjectiles.create(
                    startX + (spacing * i),
                    enemy.y + enemy.height,
                    projectileType,
                    Math.PI / 2
                );
            }
        }
    },
    
    // Atualizar todos os projéteis
    update() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            if (!proj.active) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Atualizar posição
            proj.x += proj.vx;
            proj.y += proj.vy;
            
            // Homing (rastreamento)
            if (proj.homing && proj.homingStrength > 0) {
                const dx = dragon.x - proj.x;
                const dy = dragon.y - proj.y;
                const angle = Math.atan2(dy, dx);
                
                proj.vx += Math.cos(angle) * proj.homingStrength;
                proj.vy += Math.sin(angle) * proj.homingStrength;
                
                // Limitar velocidade
                const currentSpeed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
                if (currentSpeed > proj.speed * 1.5) {
                    proj.vx = (proj.vx / currentSpeed) * proj.speed * 1.5;
                    proj.vy = (proj.vy / currentSpeed) * proj.speed * 1.5;
                }
            }
            
            // Rotação
            if (proj.rotation) {
                proj.rotationAngle += 0.2;
            }
            
            // Expansão (onda de choque)
            if (proj.expanding) {
                proj.width += 0.5;
                proj.height += 0.5;
            }
            
            // Phasing (transparência oscilante)
            if (proj.phasing) {
                proj.alphaPhase += 0.1;
            }
            
            // Pulso
            proj.pulsePhase += 0.1;
            
            // Split (dividir em múltiplos)
            if (proj.split && !proj.hasSplit && proj.life < 250) {
                proj.hasSplit = true;
                const baseAngle = Math.atan2(proj.vy, proj.vx);
                
                for (let j = 0; j < proj.splitCount; j++) {
                    const spreadAngle = baseAngle + (Math.PI / 4) * (j - 1);
                    this.create(
                        proj.x,
                        proj.y,
                        'basic',
                        spreadAngle
                    );
                }
            }
            
            // Trail de fumaça
            if (proj.smokeTrail && Math.random() < 0.3) {
                gameEntities.particles.push({
                    x: proj.x,
                    y: proj.y,
                    vx: (Math.random() - 0.5) * 1,
                    vy: (Math.random() - 0.5) * 1,
                    size: Math.random() * 3 + 2,
                    color: '#888888',
                    life: 20,
                    alpha: 0.5
                });
            }
            
            // Partículas de fogo
            if (proj.particles && Math.random() < 0.4) {
                gameEntities.particles.push({
                    x: proj.x,
                    y: proj.y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: Math.random() * 4 + 2,
                    color: proj.color,
                    life: 15,
                    alpha: 0.8
                });
            }
            
            // Decrementar vida
            proj.life--;
            if (proj.life <= 0) {
                proj.active = false;
            }
            
            // Verificar se saiu da tela
            if (proj.y > gameData.canvas.height + 50 ||
                proj.y < -50 ||
                proj.x < -50 ||
                proj.x > gameData.canvas.width + 50) {
                proj.active = false;
            }
        }
    },
    
    // Desenhar todos os projéteis
    draw(ctx) {
        this.projectiles.forEach(proj => {
            ctx.save();
            
            // Glow
            if (proj.glow) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = proj.color;
            }
            
            // Alpha (transparência)
            if (proj.phasing) {
                ctx.globalAlpha = Math.sin(proj.alphaPhase) * 0.3 + 0.7;
            }
            
            // Trail
            if (proj.trail) {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = proj.color;
                ctx.fillRect(proj.x - 2, proj.y + 5, proj.width + 4, 10);
                ctx.globalAlpha = 1;
            }
            
            // Desenhar baseado no shape
            switch(proj.shape) {
                case 'circle':
                    const pulse = Math.sin(proj.pulsePhase) * 2;
                    ctx.fillStyle = proj.color;
                    ctx.beginPath();
                    ctx.arc(
                        proj.x + proj.width / 2,
                        proj.y + proj.height / 2,
                        proj.width / 2 + pulse,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    break;
                    
                case 'rect':
                    ctx.fillStyle = proj.color;
                    ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
                    break;
                    
                case 'missile':
                    ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
                    ctx.rotate(Math.atan2(proj.vy, proj.vx) + Math.PI / 2);
                    ctx.fillStyle = proj.color;
                    ctx.beginPath();
                    ctx.moveTo(0, -proj.height / 2);
                    ctx.lineTo(proj.width / 2, proj.height / 2);
                    ctx.lineTo(-proj.width / 2, proj.height / 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 'ring':
                    ctx.strokeStyle = proj.color;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(
                        proj.x,
                        proj.y,
                        proj.width / 2,
                        0,
                        Math.PI * 2
                    );
                    ctx.stroke();
                    break;
                    
                case 'shard':
                    ctx.translate(proj.x, proj.y);
                    ctx.rotate(proj.rotationAngle);
                    ctx.fillStyle = proj.color;
                    ctx.beginPath();
                    ctx.moveTo(0, -proj.height / 2);
                    ctx.lineTo(proj.width / 3, 0);
                    ctx.lineTo(0, proj.height / 2);
                    ctx.lineTo(-proj.width / 3, 0);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 'spike':
                    ctx.translate(proj.x, proj.y);
                    ctx.rotate(Math.atan2(proj.vy, proj.vx) + Math.PI / 2);
                    ctx.fillStyle = proj.color;
                    ctx.beginPath();
                    ctx.moveTo(0, -proj.height / 2);
                    ctx.lineTo(proj.width / 4, 0);
                    ctx.lineTo(0, proj.height / 2);
                    ctx.lineTo(-proj.width / 4, 0);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
            
            ctx.restore();
        });
    },
    
    // Limpar todos os projéteis
    clear() {
        this.projectiles = [];
    },
    
    // Verificar colisão com o jogador
    checkCollisions() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            // Verificar colisão com dragon
            if (proj.active && 
                proj.x < dragon.x + dragon.width &&
                proj.x + proj.width > dragon.x &&
                proj.y < dragon.y + dragon.height &&
                proj.y + proj.height > dragon.y) {
                
                // Aplicar dano
                gameStats.health -= proj.damage;
                
                // Efeito visual de hit
                for (let j = 0; j < 8; j++) {
                    const angle = (Math.PI * 2 / 8) * j;
                    gameEntities.particles.push({
                        x: proj.x,
                        y: proj.y,
                        vx: Math.cos(angle) * 5,
                        vy: Math.sin(angle) * 5,
                        size: 3,
                        color: proj.color,
                        life: 20
                    });
                }
                
                // Remover projétil
                this.projectiles.splice(i, 1);
            }
        }
    }
};
