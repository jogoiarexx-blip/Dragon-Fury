// ===== FASE 3: FÚRIA ARDENTE =====

const phase3_furiaArdente = {
    id: 3,
    name: 'Fúria Ardente',
    description: 'O céu queima em chamas - Meteoros e fogo por toda parte',
    
    // Configurações gerais
    config: {
        targetKills: 40,
        speedMultiplier: 1.4,
        enemyMultiplier: 1.6,
        bossHealth: 1000,
        bossName: 'Dragão de Fogo'
    },
    
    // Background
    background: {
        color1: '#330011',
        color2: '#220005',
        color3: '#110000'
    },
    
    // Efeitos ambientais
    ambience: {
        starDensity: 60,
        starSpeed: 1.4,
        cloudDensity: 0,
        fireParticles: true,
        effects: ['flames', 'heat']
    },
    
    // ===== INIMIGOS EXCLUSIVOS =====
    enemies: {
        flameBat: {
            name: 'Morcego de Fogo',
            width: 38,
            height: 35,
            health: 40,
            speed: 3,
            damage: 15,
            color: '#FF4500',
            scoreValue: 150,
            spawnWeight: 0.35,
            behavior: 'swoop', // Voo em mergulho
            shootable: false,
            onHit: 'burn' // Causa queimadura
        },
        
        infernoWasp: {
            name: 'Vespa Infernal',
            width: 30,
            height: 32,
            health: 30,
            speed: 4,
            damage: 12,
            color: '#FF8C00',
            scoreValue: 140,
            spawnWeight: 0.35,
            behavior: 'aggressive',
            shootable: true,
            shootRate: 90,
            projectileType: 'fireball'
        },
        
        phoenixling: {
            name: 'Filhote de Fênix',
            width: 50,
            height: 45,
            health: 60,
            speed: 2,
            damage: 20,
            color: '#FFD700',
            scoreValue: 200,
            spawnWeight: 0.2,
            behavior: 'resurrect', // Revive 1 vez
            shootable: false,
            revival: true,
            revivalTime: 120
        },
        
        lavaElemental: {
            name: 'Elemental de Lava',
            width: 45,
            height: 48,
            health: 80,
            speed: 1.5,
            damage: 25,
            color: '#B22222',
            scoreValue: 250,
            spawnWeight: 0.1,
            behavior: 'tank',
            shootable: true,
            shootRate: 150,
            projectileType: 'lava'
        }
    },
    
    // ===== OBSTÁCULOS EXCLUSIVOS =====
    obstacles: {
        meteor: {
            name: 'Meteoro',
            width: 55,
            height: 55,
            health: 5,
            damage: 25,
            speed: 3.5,
            color: '#8B4513',
            scoreValue: 60,
            spawnChance: 0.018,
            effect: 'explosion',
            destructible: true,
            trail: true
        },
        
        fireball: {
            name: 'Bola de Fogo',
            width: 35,
            height: 35,
            health: 2,
            damage: 18,
            speed: 4,
            color: '#FF6347',
            scoreValue: 40,
            spawnChance: 0.025,
            effect: 'burn',
            destructible: true,
            glow: true
        },
        
        lavaRock: {
            name: 'Rocha de Lava',
            width: 65,
            height: 60,
            health: 8,
            damage: 30,
            speed: 2,
            color: '#DC143C',
            scoreValue: 80,
            spawnChance: 0.012,
            effect: 'melt', // Derrete projéteis próximos
            destructible: true,
            molten: true
        },
        
        flameWall: {
            name: 'Parede de Chamas',
            width: 80,
            height: 120,
            health: 0,
            damage: 20,
            speed: 2.5,
            color: 'rgba(255, 69, 0, 0.7)',
            scoreValue: 0,
            spawnChance: 0.008,
            effect: 'continuous_damage',
            destructible: false
        }
    },
    
    // ===== POWER-UPS ESPECÍFICOS =====
    specialPowerUps: {
        fireShield: {
            name: 'Escudo de Fogo',
            effect: 'fire_immunity',
            duration: 8,
            color: '#FF4500',
            spawnChance: 0.006
        },
        
        phoenixFeather: {
            name: 'Pena de Fênix',
            effect: 'auto_revive',
            duration: 0, // Efeito único
            color: '#FFD700',
            spawnChance: 0.002
        }
    },
    
    // ===== MÚSICA/SOM =====
    audio: {
        bgm: 'inferno_rising.mp3',
        ambient: ['fire_crackling.mp3', 'lava_bubbling.mp3']
    },
    
    spawnEnemy() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [key, enemy] of Object.entries(this.enemies)) {
            cumulative += enemy.spawnWeight;
            if (rand <= cumulative) {
                return this.createEnemy(key, enemy);
            }
        }
        
        return this.createEnemy('flameBat', this.enemies.flameBat);
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
            onHit: config.onHit || null,
            revival: config.revival || false,
            revivalTime: config.revivalTime || 0,
            phase: 3,
            patternTimer: 0,
            shootTimer: 0,
            hasRevived: false,
            deathTimer: 0
        };
    },
    
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
            trail: config.trail || false,
            glow: config.glow || false,
            molten: config.molten || false,
            phase: 3,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            pulseTime: 0
        };
    },
    
    drawEnemy(ctx, enemy) {
        ctx.save();
        ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = enemy.color;
        
        if (enemy.type === 'flameBat') {
            // Morcego de fogo
            ctx.fillStyle = enemy.color;
            
            // Corpo
            ctx.beginPath();
            ctx.ellipse(0, 0, enemy.width/2.5, enemy.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Asas flamejantes
            const wingFlap = Math.sin(Date.now() / 60) * 0.4;
            ctx.save();
            ctx.rotate(wingFlap);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-enemy.width/2 - 15, -enemy.height/3);
            ctx.lineTo(-enemy.width/2.5, enemy.height/4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            
            ctx.save();
            ctx.rotate(-wingFlap);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(enemy.width/2 + 15, -enemy.height/3);
            ctx.lineTo(enemy.width/2.5, enemy.height/4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            
            // Chamas saindo
            for (let i = 0; i < 3; i++) {
                const flameOffset = (Date.now() / 50 + i * 30) % 20;
                ctx.fillStyle = i % 2 === 0 ? '#FF4500' : '#FFA500';
                ctx.globalAlpha = 1 - (flameOffset / 20);
                ctx.beginPath();
                ctx.arc(0, enemy.height/3 + flameOffset, 3 - i, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            
        } else if (enemy.type === 'infernoWasp') {
            // Vespa infernal
            ctx.fillStyle = enemy.color;
            
            // Corpo segmentado
            ctx.beginPath();
            ctx.ellipse(0, -enemy.height/6, enemy.width/3, enemy.height/3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(0, enemy.height/6, enemy.width/2.5, enemy.height/2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Asas
            ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
            const waspWing = Math.sin(Date.now() / 40) * 0.3;
            ctx.save();
            ctx.rotate(waspWing - 0.3);
            ctx.beginPath();
            ctx.ellipse(-enemy.width/4, -enemy.height/4, enemy.width/3, enemy.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            ctx.save();
            ctx.rotate(-waspWing + 0.3);
            ctx.beginPath();
            ctx.ellipse(enemy.width/4, -enemy.height/4, enemy.width/3, enemy.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
        } else if (enemy.type === 'phoenixling') {
            // Filhote de fênix
            const phoenixPulse = Math.sin(Date.now() / 100) * 0.2 + 1;
            ctx.scale(phoenixPulse, phoenixPulse);
            
            ctx.fillStyle = enemy.color;
            
            // Corpo brilhante
            ctx.beginPath();
            ctx.ellipse(0, 0, enemy.width/2.5, enemy.height/2.2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Asas de fogo
            for (let i = 0; i < 2; i++) {
                const side = i === 0 ? -1 : 1;
                const wingGlow = Math.sin(Date.now() / 80 + i * Math.PI) * 0.2;
                
                ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#FF6347';
                ctx.save();
                ctx.rotate(side * (0.5 + wingGlow));
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(side * enemy.width/2, -enemy.height/2);
                ctx.lineTo(side * enemy.width/2.5, enemy.height/3);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            
            // Cauda de chamas
            for (let i = 0; i < 4; i++) {
                const tailOffset = (Date.now() / 40 + i * 10) % 25;
                ctx.fillStyle = i % 2 === 0 ? '#FF4500' : '#FFA500';
                ctx.globalAlpha = 1 - (tailOffset / 25);
                ctx.beginPath();
                ctx.arc(0, enemy.height/2.5 + tailOffset, 5 - i, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            
        } else if (enemy.type === 'lavaElemental') {
            // Elemental de lava
            ctx.fillStyle = enemy.color;
            
            // Forma irregular de lava
            const segments = 8;
            ctx.beginPath();
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const wobble = Math.sin(Date.now() / 100 + i) * 5;
                const radius = enemy.width/2 + wobble;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // Bolhas de lava
            for (let i = 0; i < 5; i++) {
                const bubbleTime = (Date.now() / 100 + i * 20) % 60;
                if (bubbleTime < 30) {
                    const size = bubbleTime / 3;
                    const angle = (i / 5) * Math.PI * 2;
                    const dist = enemy.width/4;
                    ctx.fillStyle = '#FF6347';
                    ctx.globalAlpha = 1 - (bubbleTime / 30);
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
        }
        
        ctx.restore();
        this.drawHealthBar(ctx, enemy);
    },
    
    drawObstacle(ctx, obstacle) {
        ctx.save();
        
        if (obstacle.type === 'meteor') {
            // Meteoro com rastro de fogo
            ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            ctx.rotate(obstacle.angle);
            
            // Rastro
            if (obstacle.trail) {
                for (let i = 0; i < 5; i++) {
                    const trailY = (i + 1) * 15;
                    const trailSize = obstacle.width / (i + 2);
                    ctx.fillStyle = i % 2 === 0 ? '#FF4500' : '#FFA500';
                    ctx.globalAlpha = 0.7 - (i * 0.15);
                    ctx.beginPath();
                    ctx.arc(0, trailY, trailSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
            
            // Corpo do meteoro
            ctx.fillStyle = obstacle.color;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#FF4500';
            ctx.beginPath();
            ctx.arc(0, 0, obstacle.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Crateras
            ctx.fillStyle = '#5C4033';
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const dist = obstacle.width/4;
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (obstacle.type === 'fireball') {
            // Bola de fogo pulsante
            ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            
            const pulse = Math.sin(Date.now() / 50) * 0.3 + 1;
            ctx.scale(pulse, pulse);
            
            // Camadas de fogo
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#FF6347';
            
            ctx.fillStyle = '#FF6347';
            ctx.beginPath();
            ctx.arc(0, 0, obstacle.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(0, 0, obstacle.width/3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(0, 0, obstacle.width/5, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (obstacle.type === 'lavaRock') {
            // Rocha de lava derretida
            ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            ctx.rotate(obstacle.angle);
            
            // Rocha
            ctx.fillStyle = obstacle.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#DC143C';
            
            const sides = 6;
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const radius = obstacle.width/2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // Lava derretendo
            if (obstacle.molten) {
                for (let i = 0; i < 3; i++) {
                    const dropY = (Date.now() / 30 + i * 20) % 40;
                    ctx.fillStyle = '#FF4500';
                    ctx.globalAlpha = 1 - (dropY / 40);
                    ctx.beginPath();
                    ctx.arc((i - 1) * 10, obstacle.height/2 + dropY, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
            
        } else if (obstacle.type === 'flameWall') {
            // Parede de chamas
            ctx.fillStyle = obstacle.color;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#FF4500';
            
            for (let i = 0; i < 10; i++) {
                const offsetX = (i / 10) * obstacle.width;
                const flameHeight = Math.sin(Date.now() / 50 + i) * 20 + obstacle.height/2;
                const flameWidth = 15 + Math.cos(Date.now() / 60 + i * 2) * 5;
                
                ctx.beginPath();
                ctx.ellipse(obstacle.x + offsetX, obstacle.y + obstacle.height/2, 
                           flameWidth, flameHeight, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    },
    
    drawHealthBar(ctx, enemy) {
        if (enemy.health === enemy.maxHealth) return;
        
        const barWidth = enemy.width;
        const barHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = '#330000';
        ctx.fillRect(enemy.x, enemy.y - 10, barWidth, barHeight);
        
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(enemy.x, enemy.y - 10, barWidth * healthPercent, barHeight);
    }
};
