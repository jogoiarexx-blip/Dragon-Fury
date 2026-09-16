// ===== FASE 4: ABISMO SOMBRIO =====

const phase4_abismoSombrio = {
    id: 4,
    name: 'Abismo Sombrio',
    description: 'A escuridão prevalece - Sombras e terror nas profundezas',
    
    // Configurações gerais
    config: {
        targetKills: 50,
        speedMultiplier: 1.6,
        enemyMultiplier: 2.0,
        bossHealth: 1500,
        bossName: 'Rei das Sombras'
    },
    
    // Background
    background: {
        color1: '#110022',
        color2: '#080014',
        color3: '#000008'
    },
    
    // Efeitos ambientais
    ambience: {
        starDensity: 40,
        starSpeed: 1.6,
        cloudDensity: 0,
        fog: true,
        darkness: 0.3,
        effects: ['shadows', 'void', 'fog']
    },
    
    // ===== INIMIGOS EXCLUSIVOS =====
    enemies: {
        shadowBat: {
            name: 'Morcego Sombrio',
            width: 36,
            height: 34,
            health: 50,
            speed: 3.5,
            damage: 18,
            color: '#2E0854',
            scoreValue: 180,
            spawnWeight: 0.35,
            behavior: 'teleport', // Pode teletransportar
            shootable: false,
            teleportChance: 0.15
        },
        
        voidWraith: {
            name: 'Espectro do Vazio',
            width: 42,
            height: 40,
            health: 45,
            speed: 2.5,
            damage: 20,
            color: '#1C1C3C',
            scoreValue: 200,
            spawnWeight: 0.3,
            behavior: 'invisible', // Fica invisível periodicamente
            shootable: true,
            shootRate: 100,
            projectileType: 'void',
            invisibleCycle: 180
        },
        
        nightHowler: {
            name: 'Uivador Noturno',
            width: 44,
            height: 42,
            health: 70,
            speed: 2,
            damage: 25,
            color: '#4B0082',
            scoreValue: 230,
            spawnWeight: 0.25,
            behavior: 'howl', // Uivo que atordoa
            shootable: false,
            howlRange: 150,
            howlCooldown: 240
        },
        
        abyssalHorror: {
            name: 'Horror Abissal',
            width: 55,
            height: 50,
            health: 100,
            speed: 1.2,
            damage: 35,
            color: '#0D0D1F',
            scoreValue: 300,
            spawnWeight: 0.1,
            behavior: 'split', // Divide em 2 ao morrer
            shootable: true,
            shootRate: 180,
            projectileType: 'shadow',
            splitOnDeath: true
        }
    },
    
    // ===== OBSTÁCULOS EXCLUSIVOS =====
    obstacles: {
        voidPortal: {
            name: 'Portal do Vazio',
            width: 50,
            height: 50,
            health: 5,
            damage: 20,
            speed: 1,
            color: '#1A0033',
            scoreValue: 50,
            spawnChance: 0.012,
            effect: 'teleport', // Teletransporta o jogador
            destructible: true
        },
        
        shadowWall: {
            name: 'Parede de Sombras',
            width: 80,
            height: 60,
            health: 10,
            damage: 15,
            speed: 1.5,
            color: 'rgba(20, 0, 40, 0.8)',
            scoreValue: 40,
            spawnChance: 0.015,
            effect: 'slow', // Desacelera muito
            destructible: true
        },
        
        darkMatter: {
            name: 'Matéria Escura',
            width: 40,
            height: 40,
            health: 0, // Indestrutível
            damage: 30,
            speed: 2,
            color: '#000000',
            scoreValue: 0,
            spawnChance: 0.008,
            effect: 'gravity', // Puxa o jogador
            destructible: false,
            pullRange: 100
        },
        
        voidCrystal: {
            name: 'Cristal do Vazio',
            width: 30,
            height: 35,
            health: 3,
            damage: 10,
            speed: 1.8,
            color: '#9400D3',
            scoreValue: 60,
            spawnChance: 0.01,
            effect: 'explode', // Explode quando destruído
            destructible: true,
            explosionRadius: 80
        }
    },
    
    // ===== POWER-UPS ESPECÍFICOS =====
    specialPowerUps: {
        shadowCloak: {
            name: 'Manto das Sombras',
            effect: 'invisibility',
            duration: 5,
            color: '#2E0854',
            spawnChance: 0.003
        },
        voidSight: {
            name: 'Visão do Vazio',
            effect: 'see_invisible',
            duration: 8,
            color: '#9400D3',
            spawnChance: 0.004
        }
    },
    
    // ===== MÚSICA/SOM =====
    audio: {
        bgm: 'abyss_depths.mp3',
        ambient: ['whispers.mp3', 'void_ambient.mp3', 'distant_screams.mp3']
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
        
        return this.createEnemy('shadowBat', this.enemies.shadowBat);
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
            phase: 4,
            patternTimer: 0,
            shootTimer: 0,
            teleportCooldown: 0,
            invisibleTimer: 0,
            isInvisible: false,
            howlCooldown: config.howlCooldown || 0,
            splitOnDeath: config.splitOnDeath || false
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
            pullRange: config.pullRange || 0,
            explosionRadius: config.explosionRadius || 0,
            phase: 4,
            angle: 0,
            pulseTime: 0
        };
    },
    
    // Renderizar inimigo específico da fase
    drawEnemy(ctx, enemy) {
        // Inimigo invisível
        if (enemy.isInvisible) {
            ctx.globalAlpha = 0.15 + Math.sin(Date.now() / 100) * 0.1;
        }
        
        ctx.save();
        ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        
        // Aura sombria
        ctx.shadowBlur = 25;
        ctx.shadowColor = enemy.color;
        
        ctx.fillStyle = enemy.color;
        
        // Desenhar baseado no tipo
        if (enemy.type === 'shadowBat') {
            // Morcego sombrio
            ctx.beginPath();
            ctx.ellipse(0, 0, enemy.width/2, enemy.height/2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Asas pontiagudas
            const wingSpread = Math.sin(Date.now() / 60) * 10;
            ctx.beginPath();
            ctx.moveTo(-enemy.width/4, 0);
            ctx.lineTo(-enemy.width/2 - wingSpread, -enemy.height/3);
            ctx.lineTo(-enemy.width/2 - wingSpread, enemy.height/4);
            ctx.lineTo(-enemy.width/4, enemy.height/6);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(enemy.width/4, 0);
            ctx.lineTo(enemy.width/2 + wingSpread, -enemy.height/3);
            ctx.lineTo(enemy.width/2 + wingSpread, enemy.height/4);
            ctx.lineTo(enemy.width/4, enemy.height/6);
            ctx.fill();
            
        } else if (enemy.type === 'voidWraith') {
            // Espectro flutuante
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i + Date.now() / 300;
                const radius = enemy.width/2 + Math.sin(angle * 3 + Date.now() / 150) * 8;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (enemy.type === 'nightHowler') {
            // Criatura lupina
            ctx.beginPath();
            ctx.ellipse(0, 5, enemy.width/2, enemy.height/2.2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Cabeça
            ctx.beginPath();
            ctx.arc(0, -enemy.height/4, enemy.width/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Orelhas pontiagudas
            ctx.beginPath();
            ctx.moveTo(-enemy.width/5, -enemy.height/3);
            ctx.lineTo(-enemy.width/4, -enemy.height/2);
            ctx.lineTo(-enemy.width/8, -enemy.height/3.5);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(enemy.width/5, -enemy.height/3);
            ctx.lineTo(enemy.width/4, -enemy.height/2);
            ctx.lineTo(enemy.width/8, -enemy.height/3.5);
            ctx.fill();
            
        } else if (enemy.type === 'abyssalHorror') {
            // Horror tentacular
            ctx.beginPath();
            ctx.arc(0, 0, enemy.width/2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Tentáculos
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i + Date.now() / 200;
                const length = enemy.height/2 + Math.sin(angle * 2 + Date.now() / 100) * 10;
                
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(
                    Math.cos(angle) * length/2 + Math.sin(Date.now() / 150) * 8,
                    Math.sin(angle) * length/2 + Math.cos(Date.now() / 150) * 8,
                    Math.cos(angle) * length,
                    Math.sin(angle) * length
                );
                ctx.lineWidth = 3;
                ctx.strokeStyle = enemy.color;
                ctx.stroke();
            }
        }
        
        // Olhos brilhantes
        ctx.fillStyle = '#FF0000';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF0000';
        ctx.beginPath();
        ctx.arc(-enemy.width/6, -enemy.height/8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.width/6, -enemy.height/8, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        ctx.globalAlpha = 1;
        
        // Barra de vida
        this.drawHealthBar(ctx, enemy);
    },
    
    // Renderizar obstáculo específico da fase
    drawObstacle(ctx, obstacle) {
        ctx.save();
        
        if (obstacle.type === 'voidPortal') {
            // Portal espiral
            const time = Date.now() / 500;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#9400D3';
            
            for (let i = 0; i < 20; i++) {
                const angle = (Math.PI * 2 / 20) * i + time;
                const radius = (obstacle.width/2) * (1 - i/20);
                const x = obstacle.x + obstacle.width/2 + Math.cos(angle) * radius;
                const y = obstacle.y + obstacle.height/2 + Math.sin(angle) * radius;
                
                ctx.fillStyle = `rgba(148, 0, 211, ${1 - i/20})`;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (obstacle.type === 'shadowWall') {
            // Parede nebulosa
            ctx.fillStyle = obstacle.color;
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#000000';
            
            for (let i = 0; i < 6; i++) {
                const offsetX = Math.sin(Date.now() / 200 + i) * 15;
                const offsetY = Math.cos(Date.now() / 200 + i) * 10;
                ctx.beginPath();
                ctx.ellipse(
                    obstacle.x + obstacle.width/2 + offsetX,
                    obstacle.y + obstacle.height/2 + offsetY,
                    obstacle.width/3,
                    obstacle.height/3,
                    0, 0, Math.PI * 2
                );
                ctx.fill();
            }
            
        } else if (obstacle.type === 'darkMatter') {
            // Buraco negro
            const time = Date.now() / 1000;
            const gradient = ctx.createRadialGradient(
                obstacle.x + obstacle.width/2,
                obstacle.y + obstacle.height/2,
                0,
                obstacle.x + obstacle.width/2,
                obstacle.y + obstacle.height/2,
                obstacle.width/2
            );
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(0.7, '#1A0033');
            gradient.addColorStop(1, 'rgba(26, 0, 51, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                obstacle.x + obstacle.width/2,
                obstacle.y + obstacle.height/2,
                obstacle.width/2 + Math.sin(time * 3) * 3,
                0, Math.PI * 2
            );
            ctx.fill();
            
            // Partículas sendo sugadas
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i + time * 2;
                const radius = obstacle.width/2 + 20 + Math.sin(time * 5 + i) * 10;
                const x = obstacle.x + obstacle.width/2 + Math.cos(angle) * radius;
                const y = obstacle.y + obstacle.height/2 + Math.sin(angle) * radius;
                
                ctx.fillStyle = '#9400D3';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#9400D3';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (obstacle.type === 'voidCrystal') {
            // Cristal pulsante
            ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            ctx.rotate(Date.now() / 500);
            
            const pulse = 1 + Math.sin(Date.now() / 200) * 0.2;
            ctx.scale(pulse, pulse);
            
            ctx.fillStyle = obstacle.color;
            ctx.shadowBlur = 25;
            ctx.shadowColor = obstacle.color;
            
            // Diamante
            ctx.beginPath();
            ctx.moveTo(0, -obstacle.height/2);
            ctx.lineTo(obstacle.width/3, 0);
            ctx.lineTo(0, obstacle.height/2);
            ctx.lineTo(-obstacle.width/3, 0);
            ctx.closePath();
            ctx.fill();
            
            // Brilho interno
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(0, -obstacle.height/3);
            ctx.lineTo(obstacle.width/6, 0);
            ctx.lineTo(0, obstacle.height/4);
            ctx.lineTo(-obstacle.width/6, 0);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    },
    
    drawHealthBar(ctx, enemy) {
        if (enemy.health === enemy.maxHealth || enemy.isInvisible) return;
        
        const barWidth = enemy.width;
        const barHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x, enemy.y - 10, barWidth, barHeight);
        
        ctx.fillStyle = '#9400D3';
        ctx.fillRect(enemy.x, enemy.y - 10, barWidth * healthPercent, barHeight);
    }
};
