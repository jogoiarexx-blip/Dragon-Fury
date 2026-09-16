// ===== FASE 1: CÉU SERENO =====

const phase1_ceuSereno = {
    id: 1,
    name: 'Céu Sereno',
    description: 'O início da jornada - Um céu calmo antes da tempestade',
    
    // Configurações gerais
    config: {
        targetKills: 20,
        speedMultiplier: 1.0,
        enemyMultiplier: 1.0,
        bossHealth: 500,
        bossName: 'Guardião Celeste'
    },
    
    // Background
    background: {
        color1: '#000033',
        color2: '#000011',
        color3: '#000000'
    },
    
    // Efeitos ambientais
    ambience: {
        starDensity: 100,
        starSpeed: 1.0,
        cloudDensity: 0,
        effects: []
    },
    
    // ===== INIMIGOS EXCLUSIVOS =====
    enemies: {
        basicBird: {
            name: 'Pássaro Básico',
            width: 35,
            height: 35,
            health: 25,
            speed: 2,
            damage: 10,
            color: '#87CEEB',
            scoreValue: 100,
            spawnWeight: 0.5, // 50% de chance
            behavior: 'straight',
            shootable: false
        },
        
        swiftBird: {
            name: 'Pássaro Veloz',
            width: 30,
            height: 30,
            health: 15,
            speed: 3.5,
            damage: 8,
            color: '#4682B4',
            scoreValue: 120,
            spawnWeight: 0.3, // 30% de chance
            behavior: 'zigzag',
            shootable: false
        },
        
        cloudGuardian: {
            name: 'Guardião das Nuvens',
            width: 45,
            height: 40,
            health: 40,
            speed: 1.5,
            damage: 15,
            color: '#B0C4DE',
            scoreValue: 150,
            spawnWeight: 0.2, // 20% de chance
            behavior: 'wave',
            shootable: false
        }
    },
    
    // ===== OBSTÁCULOS EXCLUSIVOS =====
    obstacles: {
        softCloud: {
            name: 'Nuvem Macia',
            width: 50,
            height: 35,
            health: 1,
            damage: 5,
            speed: 1.2,
            color: '#FFFFFF',
            scoreValue: 10,
            spawnChance: 0.012,
            effect: 'push', // Empurra o jogador levemente
            destructible: true
        },
        
        windGust: {
            name: 'Rajada de Vento',
            width: 40,
            height: 80,
            health: 0, // Não pode ser destruído
            damage: 3,
            speed: 2.5,
            color: 'rgba(200, 200, 255, 0.3)',
            scoreValue: 0,
            spawnChance: 0.008,
            effect: 'drift', // Desvia a trajetória
            destructible: false
        }
    },
    
    // ===== POWER-UPS ESPECÍFICOS =====
    specialPowerUps: {
        feather: {
            name: 'Pena Mágica',
            effect: 'speed_boost',
            duration: 5,
            color: '#E0FFFF',
            spawnChance: 0.005
        }
    },
    
    // ===== MÚSICA/SOM =====
    audio: {
        bgm: 'peaceful_sky.mp3',
        ambient: ['wind_soft.mp3', 'birds_chirping.mp3']
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
        
        return this.createEnemy('basicBird', this.enemies.basicBird);
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
            phase: 1,
            patternTimer: 0,
            shootTimer: 0
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
            phase: 1,
            angle: 0,
            pulseTime: 0
        };
    },
    
    // Renderizar inimigo específico da fase
    drawEnemy(ctx, enemy) {
        ctx.save();
        ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        
        // Desenhar pássaro (forma básica)
        ctx.fillStyle = enemy.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = enemy.color;
        
        // Corpo (oval)
        ctx.beginPath();
        ctx.ellipse(0, 0, enemy.width/2, enemy.height/2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Asas (triângulos)
        const wingFlap = Math.sin(Date.now() / 100) * 5;
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(-enemy.width/3, 0);
        ctx.lineTo(-enemy.width/2 - wingFlap, -enemy.height/3);
        ctx.lineTo(-enemy.width/3, -enemy.height/4);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(enemy.width/3, 0);
        ctx.lineTo(enemy.width/2 + wingFlap, -enemy.height/3);
        ctx.lineTo(enemy.width/3, -enemy.height/4);
        ctx.fill();
        
        // Olho
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(enemy.width/6, -enemy.height/6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Barra de vida
        this.drawHealthBar(ctx, enemy);
    },
    
    // Renderizar obstáculo específico da fase
    drawObstacle(ctx, obstacle) {
        ctx.save();
        
        if (obstacle.type === 'softCloud') {
            // Nuvem macia
            ctx.fillStyle = obstacle.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFFFFF';
            
            // Múltiplos círculos para formar nuvem
            for (let i = 0; i < 4; i++) {
                const offsetX = (i - 1.5) * obstacle.width / 4;
                ctx.beginPath();
                ctx.arc(obstacle.x + obstacle.width/2 + offsetX, 
                       obstacle.y + obstacle.height/2, 
                       obstacle.width/4, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (obstacle.type === 'windGust') {
            // Rajada de vento (efeito de linhas)
            ctx.strokeStyle = obstacle.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#AAAAFF';
            
            for (let i = 0; i < 5; i++) {
                const offset = (Date.now() / 50 + i * 20) % obstacle.height;
                ctx.beginPath();
                ctx.moveTo(obstacle.x, obstacle.y + offset);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + offset);
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
