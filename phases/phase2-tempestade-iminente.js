// ===== FASE 2: TEMPESTADE IMINENTE =====

const phase2_tempestadeIminente = {
    id: 2,
    name: 'Tempestade Iminente',
    description: 'As nuvens se agitam - Raios e trovões ecoam pelo céu',
    
    // Configurações gerais
    config: {
        targetKills: 30,
        speedMultiplier: 1.2,
        enemyMultiplier: 1.3,
        bossHealth: 750,
        bossName: 'Senhor das Tempestades'
    },
    
    // Background
    background: {
        color1: '#1a0033',
        color2: '#0d0022',
        color3: '#050011'
    },
    
    // Efeitos ambientais
    ambience: {
        starDensity: 80,
        starSpeed: 1.2,
        cloudDensity: 15,
        lightning: true,
        effects: ['storm', 'rain', 'lightning']
    },
    
    // ===== INIMIGOS EXCLUSIVOS =====
    enemies: {
        stormRaven: {
            name: 'Corvo da Tempestade',
            width: 40,
            height: 38,
            health: 35,
            speed: 2.5,
            damage: 12,
            color: '#483D8B',
            scoreValue: 130,
            spawnWeight: 0.4, // 40% de chance
            behavior: 'dive', // Mergulho rápido
            shootable: false,
            onHit: 'shock' // Causa pequeno atordoamento
        },
        
        lightningBug: {
            name: 'Inseto Elétrico',
            width: 28,
            height: 28,
            health: 20,
            speed: 4,
            damage: 10,
            color: '#00FFFF',
            scoreValue: 120,
            spawnWeight: 0.35, // 35% de chance
            behavior: 'erratic', // Movimento errático
            shootable: true,
            shootRate: 80,
            projectileType: 'lightning'
        },
        
        thunderHawk: {
            name: 'Falcão Trovejante',
            width: 48,
            height: 42,
            health: 55,
            speed: 2,
            damage: 18,
            color: '#4169E1',
            scoreValue: 180,
            spawnWeight: 0.2, // 20% de chance
            behavior: 'patrol', // Patrulha horizontal
            shootable: true,
            shootRate: 120,
            projectileType: 'thunder'
        },
        
        cloudWraith: {
            name: 'Espectro das Nuvens',
            width: 42,
            height: 45,
            health: 45,
            speed: 1.8,
            damage: 15,
            color: '#9370DB',
            scoreValue: 160,
            spawnWeight: 0.05, // 5% de chance (raro)
            behavior: 'phase', // Pode ficar intangível
            shootable: false,
            phaseChance: 0.3
        }
    },
    
    // ===== OBSTÁCULOS EXCLUSIVOS =====
    obstacles: {
        thunderCloud: {
            name: 'Nuvem Trovejante',
            width: 60,
            height: 45,
            health: 3,
            damage: 12,
            speed: 1.5,
            color: '#2F4F4F',
            scoreValue: 30,
            spawnChance: 0.015,
            effect: 'lightning', // Solta raios ocasionalmente
            destructible: true
        },
        
        rainWall: {
            name: 'Parede de Chuva',
            width: 30,
            height: 100,
            health: 0, // Não pode ser destruído
            damage: 5,
            speed: 2,
            color: 'rgba(100, 100, 200, 0.4)',
            scoreValue: 0,
            spawnChance: 0.01,
            effect: 'slow', // Desacelera o jogador
            destructible: false
        },
        
        lightningBolt: {
            name: 'Raio',
            width: 15,
            height: 120,
            health: 0,
            damage: 25,
            speed: 8, // Muito rápido!
            color: '#FFFF00',
            scoreValue: 0,
            spawnChance: 0.006,
            effect: 'shock',
            destructible: false,
            flashWarning: true // Aviso visual antes
        }
    },
    
    // ===== POWER-UPS ESPECÍFICOS =====
    specialPowerUps: {
        stormShield: {
            name: 'Escudo da Tempestade',
            effect: 'electric_shield',
            duration: 6,
            color: '#00FFFF',
            spawnChance: 0.004
        }
    },
    
    // ===== MÚSICA/SOM =====
    audio: {
        bgm: 'storm_fury.mp3',
        ambient: ['thunder.mp3', 'rain_heavy.mp3', 'wind_strong.mp3']
    },
    
    // Função para spawnar inimigos desta fase
    spawnEnemy() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [key, enemy] of Object.entries(this.enemies)) {
            cumulative += enemy.spawnWeight;
            if (rand <= cumulative) {
                return this.createEnemy(key, enemy);
            }
        }
        
        return this.createEnemy('stormRaven', this.enemies.stormRaven);
    },
    
    createEnemy(type, config) {
        return {
            type: type,
            x: Math.random() * (gameData.canvas.width - config.width),
            y: -config.height - 20,
            width: config.width,
            height: config.height,
            health: config.health,
            maxHealth: config.health,
            speed: config.speed * this.config.enemyMultiplier,
            damage: config.damage,
            color: config.color,
            scoreValue: config.scoreValue,
            behavior: config.behavior,
            shootable: config.shootable,
            shootRate: config.shootRate || 0,
            projectileType: config.projectileType || 'basic',
            phase: 2,
            patternTimer: 0,
            shootTimer: 0,
            phaseTimer: 0,
            isPhasing: false
        };
    },
    
    // Função para spawnar obstáculos desta fase
    spawnObstacle() {
        for (const [key, obstacle] of Object.entries(this.obstacles)) {
            if (Math.random() < obstacle.spawnChance) {
                return this.createObstacle(key, obstacle);
            }
        }
        return null;
    },
    
    createObstacle(type, config) {
        return {
            type: type,
            x: Math.random() * (gameData.canvas.width - config.width),
            y: -config.height - 20,
            width: config.width,
            height: config.height,
            health: config.health,
            maxHealth: config.health,
            speed: config.speed,
            damage: config.damage,
            color: config.color,
            scoreValue: config.scoreValue,
            effect: config.effect,
            destructible: config.destructible,
            flashWarning: config.flashWarning || false,
            phase: 2,
            angle: 0,
            pulseTime: 0,
            warningTimer: config.flashWarning ? 30 : 0
        };
    },
    
    // Renderizar inimigo específico da fase
    drawEnemy(ctx, enemy) {
        ctx.save();
        ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        
        // Efeito de fase (intangível)
        if (enemy.isPhasing) {
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 100) * 0.2;
        }
        
        // Aura elétrica
        if (enemy.type === 'lightningBug' || enemy.type === 'thunderHawk') {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00FFFF';
        }
        
        ctx.fillStyle = enemy.color;
        
        // Desenhar forma baseada no tipo
        if (enemy.type === 'stormRaven' || enemy.type === 'thunderHawk') {
            // Pássaro com asas
            ctx.beginPath();
            ctx.ellipse(0, 0, enemy.width/2, enemy.height/2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            const wingFlap = Math.sin(Date.now() / 80) * 8;
            ctx.beginPath();
            ctx.moveTo(-enemy.width/3, 0);
            ctx.lineTo(-enemy.width/2 - wingFlap, -enemy.height/2.5);
            ctx.lineTo(-enemy.width/3, -enemy.height/4);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(enemy.width/3, 0);
            ctx.lineTo(enemy.width/2 + wingFlap, -enemy.height/2.5);
            ctx.lineTo(enemy.width/3, -enemy.height/4);
            ctx.fill();
            
        } else if (enemy.type === 'lightningBug') {
            // Inseto (círculo com asas)
            ctx.beginPath();
            ctx.arc(0, 0, enemy.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Asas de inseto
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-enemy.width/3, 0, enemy.width/3, enemy.height/2, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(enemy.width/3, 0, enemy.width/3, enemy.height/2, 0.3, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (enemy.type === 'cloudWraith') {
            // Espectro (forma irregular)
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + Date.now() / 500;
                const radius = enemy.width/2 + Math.sin(i + Date.now() / 200) * 5;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }
        
        // Olhos
        if (enemy.type !== 'lightningBug') {
            ctx.fillStyle = enemy.isPhasing ? '#FFFFFF' : '#000000';
            ctx.beginPath();
            ctx.arc(enemy.width/6, -enemy.height/8, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Barra de vida
        this.drawHealthBar(ctx, enemy);
    },
    
    // Renderizar obstáculo específico da fase
    drawObstacle(ctx, obstacle) {
        ctx.save();
        
        if (obstacle.type === 'thunderCloud') {
            // Nuvem escura com raios
            ctx.fillStyle = obstacle.color;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#000055';
            
            for (let i = 0; i < 5; i++) {
                const offsetX = (i - 2) * obstacle.width / 5;
                ctx.beginPath();
                ctx.arc(obstacle.x + obstacle.width/2 + offsetX, 
                       obstacle.y + obstacle.height/2, 
                       obstacle.width/5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Raio ocasional
            if (Math.random() < 0.02) {
                ctx.strokeStyle = '#FFFF00';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#FFFF00';
                ctx.beginPath();
                ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x + obstacle.width/2 + (Math.random() - 0.5) * 20, 
                          obstacle.y + obstacle.height + 30);
                ctx.stroke();
            }
            
        } else if (obstacle.type === 'rainWall') {
            // Parede de chuva (gotas)
            ctx.strokeStyle = obstacle.color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#0000FF';
            
            for (let i = 0; i < 10; i++) {
                const x = obstacle.x + (i % 3) * obstacle.width / 3;
                const offset = (Date.now() / 30 + i * 10) % obstacle.height;
                ctx.beginPath();
                ctx.moveTo(x, obstacle.y + offset);
                ctx.lineTo(x, obstacle.y + offset + 10);
                ctx.stroke();
            }
            
        } else if (obstacle.type === 'lightningBolt') {
            // Raio (linha irregular)
            if (obstacle.warningTimer > 0) {
                // Aviso piscante
                obstacle.warningTimer--;
                ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                ctx.fillRect(obstacle.x - 10, 0, obstacle.width + 20, gameData.canvas.height);
            } else {
                // Raio real
                ctx.strokeStyle = obstacle.color;
                ctx.lineWidth = 8;
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#FFFF00';
                
                ctx.beginPath();
                ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
                let currentY = obstacle.y;
                let currentX = obstacle.x + obstacle.width/2;
                while (currentY < obstacle.y + obstacle.height) {
                    currentY += 20;
                    currentX += (Math.random() - 0.5) * 15;
                    ctx.lineTo(currentX, currentY);
                }
                ctx.stroke();
            }
        }
        
        ctx.restore();
    },
    
    drawHealthBar(ctx, enemy) {
        if (enemy.health === enemy.maxHealth) return;
        
        const barWidth = enemy.width;
        const barHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x, enemy.y - 10, barWidth, barHeight);
        
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(enemy.x, enemy.y - 10, barWidth * healthPercent, barHeight);
    }
};
