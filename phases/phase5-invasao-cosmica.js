// ===== FASE 5: BATALHA FINAL =====

const phase5_batalhaFinal = {
    id: 5,
    name: 'Batalha Final',
    description: 'O confronto definitivo - O destino de todos está em suas mãos',
    
    // Configurações gerais
    config: {
        targetKills: 60,
        speedMultiplier: 1.8,
        enemyMultiplier: 2.5,
        bossHealth: 2500,
        bossName: 'IMPERADOR SUPREMO'
    },
    
    // Background
    background: {
        color1: '#220033',
        color2: '#110022',
        color3: '#080011'
    },
    
    // Efeitos ambientais
    ambience: {
        starDensity: 120,
        starSpeed: 2.0,
        cloudDensity: 0,
        cosmic: true,
        warpEffect: true,
        effects: ['cosmic', 'warp', 'particles']
    },
    
    // ===== INIMIGOS EXCLUSIVOS =====
    enemies: {
        cosmicDrone: {
            name: 'Drone Cósmico',
            width: 38,
            height: 36,
            health: 60,
            speed: 3.5,
            damage: 22,
            color: '#00CED1',
            scoreValue: 220,
            spawnWeight: 0.3,
            behavior: 'formation', // Voa em formação
            shootable: true,
            shootRate: 70,
            projectileType: 'plasma'
        },
        
        voidCruiser: {
            name: 'Cruzador do Vazio',
            width: 52,
            height: 48,
            health: 90,
            speed: 2.5,
            damage: 28,
            color: '#4B0082',
            scoreValue: 260,
            spawnWeight: 0.25,
            behavior: 'patrol',
            shootable: true,
            shootRate: 90,
            projectileType: 'laser',
            shielded: true
        },
        
        nebulaWing: {
            name: 'Asa Nebular',
            width: 45,
            height: 42,
            health: 75,
            speed: 4,
            damage: 25,
            color: '#FF1493',
            scoreValue: 240,
            spawnWeight: 0.25,
            behavior: 'dash', // Dash rápido
            shootable: false,
            dashCooldown: 120
        },
        
        quantumHorror: {
            name: 'Horror Quântico',
            width: 58,
            height: 55,
            health: 120,
            speed: 1.8,
            damage: 35,
            color: '#9400D3',
            scoreValue: 300,
            spawnWeight: 0.15,
            behavior: 'quantum', // Existe em múltiplas posições
            shootable: true,
            shootRate: 110,
            projectileType: 'quantum',
            quantumPhases: 3
        },
        
        galaxyTitan: {
            name: 'Titã Galáctico',
            width: 70,
            height: 65,
            health: 180,
            speed: 1.2,
            damage: 50,
            color: '#FFD700',
            scoreValue: 400,
            spawnWeight: 0.05,
            behavior: 'boss_mini', // Mini-boss
            shootable: true,
            shootRate: 140,
            projectileType: 'mega',
            armored: true
        }
    },
    
    // ===== OBSTÁCULOS EXCLUSIVOS =====
    obstacles: {
        asteroid: {
            name: 'Asteroide',
            width: 60,
            height: 60,
            health: 15,
            damage: 30,
            speed: 2,
            color: '#696969',
            scoreValue: 80,
            spawnChance: 0.018,
            effect: 'knockback',
            destructible: true
        },
        
        cosmicRift: {
            name: 'Fenda Cósmica',
            width: 50,
            height: 100,
            health: 0,
            damage: 40,
            speed: 1.5,
            color: 'rgba(138, 43, 226, 0.5)',
            scoreValue: 0,
            spawnChance: 0.01,
            effect: 'warp', // Teletransporta para posição aleatória
            destructible: false
        },
        
        solarFlare: {
            name: 'Erupção Solar',
            width: 80,
            height: 80,
            health: 0,
            damage: 35,
            speed: 3,
            color: 'rgba(255, 215, 0, 0.6)',
            scoreValue: 0,
            spawnChance: 0.008,
            effect: 'burn',
            destructible: false,
            expandingRadius: true
        },
        
        blackHole: {
            name: 'Buraco Negro',
            width: 50,
            height: 50,
            health: 0,
            damage: 999, // Morte instantânea se tocar
            speed: 0.8,
            color: '#000000',
            scoreValue: 0,
            spawnChance: 0.004,
            effect: 'death',
            destructible: false,
            gravityRange: 120
        },
        
        spaceMine: {
            name: 'Mina Espacial',
            width: 35,
            height: 35,
            health: 1,
            damage: 45,
            speed: 0.5,
            color: '#DC143C',
            scoreValue: 100,
            spawnChance: 0.012,
            effect: 'explode',
            destructible: true,
            explosionRadius: 100,
            proximity: 60 // Explode quando jogador se aproxima
        }
    },
    
    // ===== POWER-UPS ESPECÍFICOS =====
    specialPowerUps: {
        cosmicShield: {
            name: 'Escudo Cósmico',
            effect: 'invulnerability',
            duration: 4,
            color: '#00CED1',
            spawnChance: 0.002
        },
        
        quantumCannon: {
            name: 'Canhão Quântico',
            effect: 'ultimate_weapon',
            duration: 6,
            color: '#9400D3',
            spawnChance: 0.0015
        },
        
        timeDilation: {
            name: 'Dilatação Temporal',
            effect: 'slow_time',
            duration: 5,
            color: '#FFD700',
            spawnChance: 0.003
        }
    },
    
    // ===== MÚSICA/SOM =====
    audio: {
        bgm: 'final_battle.mp3',
        ambient: ['cosmic_winds.mp3', 'energy_hum.mp3', 'space_tension.mp3']
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
        
        return this.createEnemy('cosmicDrone', this.enemies.cosmicDrone);
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
            shielded: config.shielded || false,
            armored: config.armored || false,
            quantumPhases: config.quantumPhases || 1,
            phase: 5,
            patternTimer: 0,
            shootTimer: 0,
            dashCooldown: config.dashCooldown || 0,
            quantumOffset: { x: 0, y: 0 }
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
            gravityRange: config.gravityRange || 0,
            explosionRadius: config.explosionRadius || 0,
            proximity: config.proximity || 0,
            expandingRadius: config.expandingRadius || false,
            currentRadius: config.width/2,
            phase: 5,
            angle: 0,
            pulseTime: 0
        };
    },
    
    // Renderizar inimigo específico da fase
    drawEnemy(ctx, enemy) {
        ctx.save();
        
        // Efeito quântico (múltiplas posições)
        if (enemy.quantumPhases > 1) {
            for (let i = 1; i < enemy.quantumPhases; i++) {
                ctx.globalAlpha = 0.3;
                const offsetX = Math.sin(Date.now() / 200 + i * Math.PI) * 40;
                const offsetY = Math.cos(Date.now() / 200 + i * Math.PI) * 30;
                this.drawEnemyShape(ctx, enemy, enemy.x + offsetX, enemy.y + offsetY);
            }
            ctx.globalAlpha = 1;
        }
        
        this.drawEnemyShape(ctx, enemy, enemy.x, enemy.y);
        
        ctx.restore();
        
        // Barra de vida
        this.drawHealthBar(ctx, enemy);
    },
    
    drawEnemyShape(ctx, enemy, x, y) {
        ctx.save();
        ctx.translate(x + enemy.width/2, y + enemy.height/2);
        
        // Aura cósmica
        ctx.shadowBlur = 20;
        ctx.shadowColor = enemy.color;
        
        ctx.fillStyle = enemy.color;
        
        if (enemy.type === 'cosmicDrone') {
            // Drone triangular
            ctx.beginPath();
            ctx.moveTo(0, -enemy.height/2);
            ctx.lineTo(enemy.width/2, enemy.height/3);
            ctx.lineTo(-enemy.width/2, enemy.height/3);
            ctx.closePath();
            ctx.fill();
            
            // Núcleo brilhante
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (enemy.type === 'voidCruiser') {
            // Nave grande
            ctx.beginPath();
            ctx.ellipse(0, 0, enemy.width/2, enemy.height/2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Asas
            ctx.beginPath();
            ctx.moveTo(-enemy.width/3, 0);
            ctx.lineTo(-enemy.width/2, -enemy.height/3);
            ctx.lineTo(-enemy.width/2, enemy.height/3);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(enemy.width/3, 0);
            ctx.lineTo(enemy.width/2, -enemy.height/3);
            ctx.lineTo(enemy.width/2, enemy.height/3);
            ctx.closePath();
            ctx.fill();
            
            // Escudo (se tiver)
            if (enemy.shielded) {
                ctx.strokeStyle = 'rgba(0, 206, 209, 0.4)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, enemy.width/1.8, 0, Math.PI * 2);
                ctx.stroke();
            }
            
        } else if (enemy.type === 'nebulaWing') {
            // Criatura alada cósmica
            const wingFlap = Math.sin(Date.now() / 40) * 12;
            
            ctx.beginPath();
            ctx.ellipse(0, 0, enemy.width/2.5, enemy.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Asas nebulares
            ctx.fillStyle = 'rgba(255, 20, 147, 0.6)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-enemy.width/2 - wingFlap, -enemy.height/2, -enemy.width/1.5, 0);
            ctx.quadraticCurveTo(-enemy.width/2 - wingFlap, enemy.height/2, 0, 0);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(enemy.width/2 + wingFlap, -enemy.height/2, enemy.width/1.5, 0);
            ctx.quadraticCurveTo(enemy.width/2 + wingFlap, enemy.height/2, 0, 0);
            ctx.fill();
            
        } else if (enemy.type === 'quantumHorror') {
            // Forma quântica instável
            const segments = 8;
            ctx.beginPath();
            for (let i = 0; i < segments; i++) {
                const angle = (Math.PI * 2 / segments) * i + Date.now() / 500;
                const radius = enemy.width/2 + Math.sin(angle * 3 + Date.now() / 200) * 12;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // Núcleo pulsante
            const pulseSize = 8 + Math.sin(Date.now() / 150) * 4;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (enemy.type === 'galaxyTitan') {
            // Titã massivo
            ctx.beginPath();
            ctx.arc(0, 0, enemy.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Anéis orbitais
            for (let i = 1; i <= 3; i++) {
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, (enemy.width/2) + (i * 8), 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Armadura
            if (enemy.armored) {
                ctx.fillStyle = 'rgba(192, 192, 192, 0.6)';
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    const x = Math.cos(angle) * enemy.width/2.5;
                    const y = Math.sin(angle) * enemy.height/2.5;
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Olhos/sensores
        ctx.fillStyle = '#00FFFF';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00FFFF';
        ctx.beginPath();
        ctx.arc(-enemy.width/6, -enemy.height/8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.width/6, -enemy.height/8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },
    
    // Renderizar obstáculo específico da fase
    drawObstacle(ctx, obstacle) {
        ctx.save();
        
        if (obstacle.type === 'asteroid') {
            // Asteroide rochoso
            ctx.fillStyle = obstacle.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#696969';
            
            ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            ctx.rotate(Date.now() / 1000);
            
            // Forma irregular
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                const radius = obstacle.width/2 * (0.8 + Math.random() * 0.4);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // Crateras
            ctx.fillStyle = '#555555';
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * obstacle.width/4;
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (obstacle.type === 'cosmicRift') {
            // Fenda dimensional
            const time = Date.now() / 300;
            
            for (let i = 0; i < 10; i++) {
                const progress = i / 10;
                const x = obstacle.x + obstacle.width/2 + Math.sin(time + progress * Math.PI) * 20;
                const y = obstacle.y + progress * obstacle.height;
                
                ctx.fillStyle = `rgba(138, 43, 226, ${0.8 - progress * 0.5})`;
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#8A2BE2';
                ctx.beginPath();
                ctx.ellipse(x, y, obstacle.width/2, 10, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (obstacle.type === 'solarFlare') {
            // Erupção solar expansiva
            if (obstacle.expandingRadius) {
                obstacle.currentRadius += 1;
                if (obstacle.currentRadius > obstacle.width) {
                    obstacle.currentRadius = obstacle.width/2;
                }
            }
            
            const gradient = ctx.createRadialGradient(
                obstacle.x + obstacle.width/2,
                obstacle.y + obstacle.height/2,
                0,
                obstacle.x + obstacle.width/2,
                obstacle.y + obstacle.height/2,
                obstacle.currentRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, 
                   obstacle.currentRadius, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (obstacle.type === 'blackHole') {
            // Buraco negro com disco de acreção
            const time = Date.now() / 1000;
            
            // Disco de acreção
            for (let i = 0; i < 30; i++) {
                const angle = (Math.PI * 2 / 30) * i + time * 2;
                const radius = obstacle.width/2 + 30 + Math.sin(time * 3 + i) * 15;
                const x = obstacle.x + obstacle.width/2 + Math.cos(angle) * radius;
                const y = obstacle.y + obstacle.height/2 + Math.sin(angle) * radius;
                
                const hue = (i * 12 + time * 50) % 360;
                ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.6)`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Buraco negro central
            const gradient = ctx.createRadialGradient(
                obstacle.x + obstacle.width/2,
                obstacle.y + obstacle.height/2,
                0,
                obstacle.x + obstacle.width/2,
                obstacle.y + obstacle.height/2,
                obstacle.width/2
            );
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(0.8, '#1a0033');
            gradient.addColorStop(1, 'rgba(26, 0, 51, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, 
                   obstacle.width/2, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (obstacle.type === 'spaceMine') {
            // Mina espacial
            ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            
            const pulse = 1 + Math.sin(Date.now() / 150) * 0.3;
            ctx.scale(pulse, pulse);
            
            // Corpo
            ctx.fillStyle = obstacle.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#DC143C';
            ctx.beginPath();
            ctx.arc(0, 0, obstacle.width/2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Espinhos
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * obstacle.width/3, Math.sin(angle) * obstacle.width/3);
                ctx.lineTo(Math.cos(angle) * obstacle.width/2, Math.sin(angle) * obstacle.width/2);
                ctx.lineWidth = 4;
                ctx.strokeStyle = obstacle.color;
                ctx.stroke();
            }
            
            // LED piscante
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.fillStyle = '#FF0000';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#FF0000';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
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
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x, enemy.y - 10, barWidth, barHeight);
        
        ctx.fillStyle = '#00CED1';
        ctx.fillRect(enemy.x, enemy.y - 10, barWidth * healthPercent, barHeight);
    }
};
