// ===== SISTEMA DE INIMIGOS MELHORADO - DRAGON FURY V2 =====

// Classe base melhorada para todos os inimigos
class BaseEnemy {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.width = config.width || 40;
        this.height = config.height || 40;
        this.health = config.health || 50;
        this.maxHealth = this.health;
        this.speed = config.speed || 2;
        this.color = config.color || '#8B0000';
        this.points = config.points || 50;
        this.damage = config.damage || 10;
        this.type = config.type || 'basic';
        this.state = 'active';
        this.stateTimer = 0;
        this.animationFrame = 0;
        this.hitFlash = 0;
        this.deathAnimation = 0;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        this.hitFlash = 10; // Flash branco ao tomar dano
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }
    
    destroy() {
        // Explosão (🔧 reduzida: tinha 52 partículas por inimigo morto,
        // que é MUITO considerando que vários inimigos morrem por segundo -
        // isso empilhava centenas de partículas e pesava o jogo, principalmente
        // em celular. Cortada para bem menos, mantendo o efeito visual.)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Partículas principais
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            gameEntities.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * 8,
                vy: Math.sin(angle) * 8,
                size: Math.random() * 6 + 3,
                color: this.color,
                life: 40,
                gravity: 0.1
            });
        }
        
        // Partículas secundárias
        for (let i = 0; i < 4; i++) {
            gameEntities.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 4 + 2,
                color: '#FFD700',
                life: 30,
                gravity: 0.15
            });
        }
        
        // Anel de choque
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            gameEntities.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                size: 2,
                color: '#FFFFFF',
                life: 20,
                gravity: 0
            });
        }
        
        // Drop de moedas
        // 🔧 BUGFIX: antes essas moedas tinham vx/vy próprios + gravidade
        // acumulando a cada frame (em integration.js), então caíam cada vez
        // mais rápido - bem diferente/mais brusco que as moedas que caem
        // do topo do mapa (que só têm "speed" fixo, sem gravidade). Agora
        // usam a mesma queda simples e constante das moedas do mapa.
        const coinChance = 0.4;
        if (Math.random() < coinChance) {
            const coinCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < coinCount; i++) {
                gameEntities.coins.push({
                    x: centerX - 10 + (Math.random() - 0.5) * 20,
                    y: centerY - 10,
                    width: 20,
                    height: 20,
                    value: Math.floor(this.points / 10),
                    speed: 2
                });
            }
        }
        
        // Atualizar stats
        gameStats.score += Math.floor(this.points * gameData.comboMultiplier);
        gameData.enemiesKilledThisStage++;
        
        // Sistema de combo
        const now = Date.now();
        if (now - gameData.lastKillTime < 2000) {
            gameData.comboCount++;
            gameData.comboMultiplier = Math.min(3, 1 + (gameData.comboCount * 0.1));
        } else {
            gameData.comboCount = 1;
            gameData.comboMultiplier = 1;
        }
        gameData.lastKillTime = now;
        
        const enemiesDefeated = (parseInt(localStorage.getItem('enemiesDefeated')) || 0) + 1;
        localStorage.setItem('enemiesDefeated', enemiesDefeated);
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 5;
        const healthPercent = this.health / this.maxHealth;
        
        // Fundo da barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x - 2, this.y - 10, barWidth + 4, barHeight + 2);
        
        // Barra de vida com gradiente
        const gradient = ctx.createLinearGradient(this.x, 0, this.x + barWidth * healthPercent, 0);
        if (healthPercent > 0.5) {
            gradient.addColorStop(0, '#00FF00');
            gradient.addColorStop(1, '#7FFF00');
        } else if (healthPercent > 0.25) {
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
        } else {
            gradient.addColorStop(0, '#FF4500');
            gradient.addColorStop(1, '#FF0000');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y - 9, barWidth * healthPercent, barHeight);
        
        // Borda
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y - 9, barWidth, barHeight);
    }
    
    update() {
        this.y += this.speed;
        this.animationFrame++;
        if (this.hitFlash > 0) this.hitFlash--;
    }
    
    draw(ctx) {
        // Flash branco ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = this.hitFlash / 10;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
            ctx.globalAlpha = 1;
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.drawHealthBar(ctx);
    }
}

// 1. INIMIGO BÁSICO - GUERREIRO VOADOR
class BasicEnemy extends BaseEnemy {
    constructor(x, y, config = {}) {
        super(x, y, {
            width: 40,
            height: 40,
            health: 50,
            speed: 2,
            color: '#8B0000',
            points: 50,
            type: 'basic',
            ...config
        });
    }
    
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const pulse = Math.sin(this.animationFrame * 0.1) * 2;
        
        ctx.save();
        
        // Flash ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFFFFF';
        }
        
        // Asas (🔧 NOVO: pipa de 4 pontas em vez de triângulo simples — mais facetas)
        ctx.fillStyle = '#A52A2A';
        ctx.beginPath();
        ctx.moveTo(centerX - 15, centerY);
        ctx.lineTo(centerX - 25 - pulse, centerY - 10);
        ctx.lineTo(centerX - 32 - pulse, centerY);
        ctx.lineTo(centerX - 20 - pulse, centerY + 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 15, centerY);
        ctx.lineTo(centerX + 25 + pulse, centerY - 10);
        ctx.lineTo(centerX + 32 + pulse, centerY);
        ctx.lineTo(centerX + 20 + pulse, centerY + 10);
        ctx.closePath();
        ctx.fill();
        
        // Corpo (🔧 MELHORADO: gradiente radial + contorno em vez de cor chapada)
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        fillPolygonGradient(ctx, centerX, centerY, 17, 7, '#FF6B47', this.color, -Math.PI / 2);
        strokePolygon(ctx, centerX, centerY, 17, 7, 'rgba(0,0,0,0.4)', 1.5, -Math.PI / 2);
        
        // 🔧 NOVO: anel externo facetado (contorno decagonal) para reforçar o visual poligonal
        ctx.strokeStyle = 'rgba(255, 69, 0, 0.6)';
        ctx.lineWidth = 1.5;
        drawPolygonPath(ctx, centerX, centerY, 20, 10, this.animationFrame * 0.02);
        ctx.stroke();
        
        // Detalhes (🔧 NOVO: pentágono interno)
        ctx.fillStyle = '#FF4500';
        fillPolygon(ctx, centerX, centerY + 5, 11, 5, -Math.PI / 2);
        
        // Olhos (🔧 NOVO: losangos em vez de círculos)
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#FFD700';
        fillDiamond(ctx, centerX - 5, centerY - 5, 3);
        fillDiamond(ctx, centerX + 5, centerY - 5, 3);
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// 2. INIMIGO ZIGZAG - CAÇADOR ÁGIL
class ZigZagEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, {
            width: 35,
            height: 35,
            health: 40,
            speed: 3,
            color: '#FF1493',
            points: 75,
            type: 'zigzag'
        });
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.moveTimer = 0;
        this.trail = [];
    }
    
    update() {
        this.y += this.speed;
        this.animationFrame++;
        if (this.hitFlash > 0) this.hitFlash--;
        
        // Movimento em zigzag
        this.moveTimer++;
        if (this.moveTimer % 30 === 0) {
            this.direction *= -1;
        }
        this.x += this.direction * 3;
        
        // Limites laterais
        if (this.x < 0 || this.x > gameData.canvas.width - this.width) {
            this.direction *= -1;
        }
        
        // Trilha
        this.trail.push({ x: this.x + this.width / 2, y: this.y + this.height / 2 });
        if (this.trail.length > 10) this.trail.shift();
    }
    
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();
        
        // Desenhar trilha
        ctx.strokeStyle = 'rgba(255, 20, 147, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        this.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        
        // Flash ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFFFFF';
        }
        
        // Corpo (🔧 NOVO: pentágono em forma de flecha em vez de triângulo simples — mais uma face)
        const rotation = Math.sin(this.animationFrame * 0.2);
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * 0.3);
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-15, 8);
        ctx.lineTo(-8, 15);
        ctx.lineTo(8, 15);
        ctx.lineTo(15, 8);
        ctx.closePath();
        // 🔧 MELHORADO: gradiente linear no corpo em flecha em vez de cor chapada
        const zzGradient = ctx.createLinearGradient(0, -20, 0, 15);
        zzGradient.addColorStop(0, '#FFB6C1');
        zzGradient.addColorStop(1, this.color);
        ctx.fillStyle = zzGradient;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Núcleo (🔧 NOVO: hexágono em vez de círculo)
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFD700';
        fillPolygon(ctx, 0, 0, 6, 6, this.animationFrame * 0.05);
        
        // Lâminas (🔧 NOVO: losangos facetados em vez de retângulos lisos)
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i + this.animationFrame * 0.1;
            ctx.save();
            ctx.rotate(angle);
            ctx.fillStyle = '#FF69B4';
            fillPolygon(ctx, 0, -10, 6, 4, 0);
            ctx.restore();
        }
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// 3. INIMIGO TANQUE - FORTALEZA VOADORA
class TankEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, {
            width: 55,
            height: 55,
            health: 200,
            speed: 1,
            color: '#4B4B4B',
            points: 150,
            damage: 25,
            type: 'tank'
        });
        this.armor = 3;
    }
    
    takeDamage(damage) {
        // Reduzir dano pela armadura
        const reducedDamage = Math.max(1, damage - this.armor);
        this.health -= reducedDamage;
        this.hitFlash = 10;
        
        // Partículas de impacto
        for (let i = 0; i < 3; i++) {
            gameEntities.particles.push({
                x: this.x + Math.random() * this.width,
                y: this.y + Math.random() * this.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: 3,
                color: '#FFA500',
                life: 15
            });
        }
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }
    
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();
        
        // Flash ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.5;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#FFA500';
        }
        
        // Corpo principal blindado (🔧 NOVO: casco octogonal chanfrado em vez de retângulo reto)
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#000';
        const bevel = 10;
        ctx.beginPath();
        ctx.moveTo(this.x + bevel, this.y);
        ctx.lineTo(this.x + this.width - bevel, this.y);
        ctx.lineTo(this.x + this.width, this.y + bevel);
        ctx.lineTo(this.x + this.width, this.y + this.height - bevel);
        ctx.lineTo(this.x + this.width - bevel, this.y + this.height);
        ctx.lineTo(this.x + bevel, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height - bevel);
        ctx.lineTo(this.x, this.y + bevel);
        ctx.closePath();
        // 🔧 MELHORADO: gradiente diagonal no casco (efeito de luz metálica) em vez de cor chapada
        const tankGradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        tankGradient.addColorStop(0, '#8FA68E');
        tankGradient.addColorStop(0.5, this.color);
        tankGradient.addColorStop(1, '#3D4A3C');
        ctx.fillStyle = tankGradient;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Placas de armadura (🔧 NOVO: octógonos chanfrados em vez de quadrados)
        ctx.fillStyle = '#696969';
        ctx.strokeStyle = '#2F4F4F';
        ctx.lineWidth = 2;
        const armorCenters = [
            [this.x + 12, this.y + 12],
            [this.x + this.width - 12, this.y + 12],
            [this.x + 12, this.y + this.height - 12],
            [this.x + this.width - 12, this.y + this.height - 12]
        ];
        armorCenters.forEach(([px, py]) => {
            drawPolygonPath(ctx, px, py, 10, 8, Math.PI / 8);
            ctx.fill();
            ctx.stroke();
        });
        
        // Torre central (🔧 NOVO: octógono blindado em vez de círculo)
        ctx.fillStyle = '#363636';
        drawPolygonPath(ctx, centerX, centerY, 12, 8);
        ctx.fill();
        ctx.strokeStyle = '#1C1C1C';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Canhão
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(centerX - 3, centerY - 18, 6, 20);
        
        // Luzes de alerta (🔧 NOVO: losangos em vez de círculos)
        const lightColor = Math.floor(this.animationFrame / 30) % 2 === 0 ? '#FF0000' : '#8B0000';
        ctx.fillStyle = lightColor;
        ctx.shadowBlur = 8;
        ctx.shadowColor = lightColor;
        fillDiamond(ctx, centerX - 15, centerY - 15, 3);
        fillDiamond(ctx, centerX + 15, centerY - 15, 3);
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// 4. INIMIGO SNIPER - ATIRADOR DE ELITE
class SniperEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, {
            width: 32,
            height: 32,
            health: 35,
            speed: 1.5,
            color: '#9370DB',
            points: 100,
            type: 'sniper'
        });
        this.fireRate = 120;
        this.shootTimer = Math.random() * 60;
        this.charging = false;
        this.chargeTime = 0;
        this.targetLock = null;
    }
    
    update() {
        super.update();
        this.shootTimer++;
        
        if (this.shootTimer > this.fireRate - 60 && !this.charging) {
            this.charging = true;
            this.chargeTime = 0;
        }
        
        if (this.charging) {
            this.chargeTime++;
            if (this.chargeTime >= 60) {
                this.shoot();
                this.charging = false;
                this.shootTimer = 0;
            }
        }
    }
    
    shoot() {
        // Laser preciso
        const dx = dragon.x - this.x;
        const dy = dragon.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        gameEntities.fireballs.push({
            x: this.x + this.width / 2 - 3,
            y: this.y + this.height,
            width: 6,
            height: 16,
            speed: 6,
            damage: 20,
            type: 'enemy',
            vx: (dx / distance) * 6,
            vy: (dy / distance) * 6,
            color: '#9370DB'
        });
        
        // Efeito de disparo
        for (let i = 0; i < 8; i++) {
            gameEntities.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2 + 1,
                size: 3,
                color: '#9370DB',
                life: 20
            });
        }
    }
    
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();
        
        // Efeito de carregamento
        if (this.charging) {
            const chargePercent = this.chargeTime / 60;
            ctx.strokeStyle = `rgba(147, 112, 219, ${chargePercent})`;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15 * chargePercent;
            ctx.shadowColor = '#9370DB';
            // 🔧 NOVO: anel de mira em dodecágono facetado em vez de círculo
            drawPolygonPath(ctx, centerX, centerY, 20 + chargePercent * 5, 12, this.animationFrame * 0.04);
            ctx.stroke();
        }
        
        // Flash ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFFFFF';
        }
        
        // Corpo hexagonal (🔧 MELHORADO: usa o helper de polígonos + gradiente + contorno)
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        fillPolygonGradient(ctx, centerX, centerY, 16, 6, '#C9A0FF', this.color);
        strokePolygon(ctx, centerX, centerY, 16, 6, 'rgba(0,0,0,0.4)', 1.5);
        
        // Núcleo (🔧 NOVO: pentágono em vez de círculo)
        ctx.fillStyle = '#BA55D3';
        fillPolygon(ctx, centerX, centerY, 8, 5, -Math.PI / 2);
        
        // 🔧 NOVO: anel externo facetado (dodecágono) para reforçar o corpo cristalino
        ctx.strokeStyle = 'rgba(147, 112, 219, 0.5)';
        ctx.lineWidth = 1.5;
        drawPolygonPath(ctx, centerX, centerY, 20, 12, -this.animationFrame * 0.02);
        ctx.stroke();
        
        // Mira laser
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(dragon.x + dragon.width / 2, dragon.y + dragon.height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Cristais (🔧 NOVO: losangos facetados em vez de pontinhos redondos)
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i + this.animationFrame * 0.05;
            const x = centerX + Math.cos(angle) * 10;
            const y = centerY + Math.sin(angle) * 10;
            ctx.fillStyle = '#FFD700';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#FFD700';
            fillDiamond(ctx, x, y, 3, angle);
        }
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// 5. INIMIGO KAMIKAZE - BOMBA VIVA
class KamikazeEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, {
            width: 28,
            height: 28,
            health: 25,
            speed: 2,
            color: '#FF4500',
            points: 60,
            damage: 35,
            type: 'kamikaze'
        });
        this.chaseSpeed = 6;
        this.activated = false;
        this.explosionRadius = 80;
    }
    
    update() {
        this.animationFrame++;
        if (this.hitFlash > 0) this.hitFlash--;
        
        // Detectar player em range
        const dx = dragon.x - this.x;
        const dy = dragon.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200 || this.activated) {
            this.activated = true;
            // Perseguir player acelerando
            this.x += (dx / distance) * this.chaseSpeed;
            this.y += (dy / distance) * this.chaseSpeed;
            this.chaseSpeed += 0.1; // Acelera com o tempo
        } else {
            this.y += this.speed;
        }
    }
    
    destroy() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Explosão (🔧 reduzida de 32+48=80 para 30 partículas no total -
        // mesmo motivo do BaseEnemy.destroy(): muitas partículas de uma vez
        // pesam o jogo, ainda mais com vários kamikazes explodindo seguidos)
        for (let i = 0; i < 14; i++) {
            const angle = (Math.PI * 2 / 14) * i;
            gameEntities.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * 12,
                vy: Math.sin(angle) * 12,
                size: Math.random() * 8 + 4,
                color: ['#FF4500', '#FFA500', '#FFD700', '#FFFFFF'][Math.floor(Math.random() * 4)],
                life: 50
            });
        }
        
        // Onda de choque
        for (let r = 0; r < 2; r++) {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                setTimeout(() => {
                    gameEntities.particles.push({
                        x: centerX + Math.cos(angle) * r * 20,
                        y: centerY + Math.sin(angle) * r * 20,
                        vx: Math.cos(angle) * 6,
                        vy: Math.sin(angle) * 6,
                        size: 4,
                        color: '#FFA500',
                        life: 30
                    });
                }, r * 100);
            }
        }
        
        // Stats
        gameStats.score += Math.floor(this.points * gameData.comboMultiplier);
        gameData.enemiesKilledThisStage++;
        
        const enemiesDefeated = (parseInt(localStorage.getItem('enemiesDefeated')) || 0) + 1;
        localStorage.setItem('enemiesDefeated', enemiesDefeated);
    }
    
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const pulseSize = this.activated ? Math.sin(this.animationFrame * 0.3) * 6 : 0;
        
        ctx.save();
        
        // Onda de explosão iminente
        if (this.activated) {
            ctx.strokeStyle = `rgba(255, 69, 0, ${Math.sin(this.animationFrame * 0.2) * 0.5 + 0.5})`;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FF4500';
            ctx.beginPath();
            // 🔧 NOVO: onda de choque em octógono facetado em vez de círculo
            drawPolygonPath(ctx, centerX, centerY, 25 + pulseSize, 8, -this.animationFrame * 0.05);
            ctx.stroke();
        }
        
        // Flash ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#FFFFFF';
        }
        
        // Corpo pulsante (🔧 NOVO: gema de 6 pontas em vez de círculo — reforça o visual de "bomba instável")
        ctx.shadowBlur = 15 + Math.abs(pulseSize);
        ctx.shadowColor = this.color;
        const kamiGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 14 + pulseSize);
        kamiGradient.addColorStop(0, '#FFE066');
        kamiGradient.addColorStop(0.5, this.color);
        kamiGradient.addColorStop(1, '#5A0000');
        ctx.fillStyle = kamiGradient;
        drawGemPath(ctx, centerX, centerY, 14 + pulseSize, 9 + pulseSize * 0.6, 6, this.animationFrame * 0.03);
        ctx.fill();
        
        // Núcleo instável (🔧 NOVO: pentágono em vez de círculo)
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFD700';
        fillPolygon(ctx, centerX, centerY, 7 + pulseSize * 0.5, 5, -Math.PI / 2);
        
        // Raios de energia
        if (this.activated) {
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FFFF00';
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + this.animationFrame * 0.1;
                const length = 10 + pulseSize;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(angle) * length,
                    centerY + Math.sin(angle) * length
                );
                ctx.stroke();
            }
        }
        
        // Símbolo de perigo
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', centerX, centerY);
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// 6. INIMIGO PARASITA - SUGADOR DE ENERGIA
class ParasiteEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, {
            width: 22,
            height: 22,
            health: 20,
            speed: 4,
            color: '#32CD32',
            points: 40,
            type: 'parasite'
        });
        this.attached = false;
        this.drainRate = 60;
        this.drainTimer = 0;
        this.tentacles = [];
        for (let i = 0; i < 6; i++) {
            this.tentacles.push({
                angle: (Math.PI * 2 / 6) * i,
                length: 8,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    update() {
        this.animationFrame++;
        if (this.hitFlash > 0) this.hitFlash--;
        
        if (!this.attached) {
            // Movimento errático em direção ao player
            const dx = dragon.x - this.x;
            const dy = dragon.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.x += (dx / distance) * this.speed + Math.sin(this.animationFrame * 0.2) * 2;
            this.y += (dy / distance) * this.speed + Math.cos(this.animationFrame * 0.2) * 2;
            
            // Verificar colisão para attach
            if (distance < 35) {
                this.attached = true;
            }
        } else {
            // Grudado no player
            this.x = dragon.x + dragon.width / 2 - this.width / 2;
            this.y = dragon.y + dragon.height / 2 - this.height / 2;
            
            this.drainTimer++;
            if (this.drainTimer >= this.drainRate) {
                dragon.takeDamage(3);
                this.drainTimer = 0;
                
                // Partículas de drenagem
                for (let i = 0; i < 5; i++) {
                    gameEntities.particles.push({
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -Math.random() * 3,
                        size: 2,
                        color: '#00FF00',
                        life: 20
                    });
                }
            }
        }
    }
    
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();
        
        // Flash ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFFFFF';
        }
        
        // Tentáculos ondulantes
        this.tentacles.forEach((tentacle, i) => {
            const wave = Math.sin(this.animationFrame * 0.15 + tentacle.phase) * 5;
            const angle = tentacle.angle + wave * 0.1;
            const length = tentacle.length + wave;
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            const midX = centerX + Math.cos(angle) * (length / 2);
            const midY = centerY + Math.sin(angle) * (length / 2);
            const endX = centerX + Math.cos(angle) * length;
            const endY = centerY + Math.sin(angle) * length;
            
            ctx.quadraticCurveTo(
                midX + Math.sin(angle) * wave,
                midY + Math.cos(angle) * wave,
                endX, endY
            );
            ctx.stroke();
            
            // Ponta da tentáculo (🔧 NOVO: losango em vez de círculo)
            ctx.fillStyle = '#7FFF00';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#7FFF00';
            fillDiamond(ctx, endX, endY, 2.5, angle);
        });
        
        // Corpo orgânico (🔧 NOVO: heptágono irregular em vez de círculo)
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        fillPolygonGradient(ctx, centerX, centerY, 11, 7, '#B8FF6B', this.color, this.animationFrame * 0.02);
        strokePolygon(ctx, centerX, centerY, 11, 7, 'rgba(0,0,0,0.35)', 1, this.animationFrame * 0.02);
        
        // Membrana pulsante (🔧 NOVO: hexágono)
        ctx.fillStyle = 'rgba(127, 255, 0, 0.5)';
        const pulse = Math.sin(this.animationFrame * 0.2) * 2;
        fillPolygon(ctx, centerX, centerY, 8 + pulse, 6, -this.animationFrame * 0.03);
        
        // Núcleo (🔧 NOVO: losango)
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FFD700';
        fillDiamond(ctx, centerX, centerY, 4, this.animationFrame * 0.05);
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// 7. INIMIGO INVOCADOR - NECROMANTE
class SummonerEnemy extends BaseEnemy {
    constructor(x, y) {
        super(x, y, {
            width: 48,
            height: 48,
            health: 90,
            speed: 1,
            color: '#8B008B',
            points: 200,
            type: 'summoner'
        });
        this.summonRate = 200;
        this.summonTimer = 60;
        this.maxSummons = 3;
        this.currentSummons = 0;
        this.runes = [];
        for (let i = 0; i < 5; i++) {
            this.runes.push({
                angle: (Math.PI * 2 / 5) * i,
                distance: 20,
                phase: (Math.PI * 2 / 5) * i
            });
        }
    }
    
    update() {
        super.update();
        
        this.summonTimer++;
        if (this.summonTimer >= this.summonRate && this.currentSummons < this.maxSummons) {
            this.summon();
            this.summonTimer = 0;
        }
    }
    
    summon() {
        // Invocar inimigo básico
        const side = Math.random() < 0.5 ? -1 : 1;
        const summonedEnemy = new BasicEnemy(
            this.x + side * 60,
            this.y,
            {
                width: 30,
                height: 30,
                health: 30,
                speed: 2.5,
                color: '#DDA0DD',
                points: 30,
                type: 'summoned'
            }
        );
        gameEntities.enemies.push(summonedEnemy);
        
        this.currentSummons++;
        
        // Efeito de invocação
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        for (let i = 0; i < 20; i++) {
            gameEntities.particles.push({
                x: centerX + side * 60,
                y: centerY,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 6 - 2,
                size: 4,
                color: '#8B008B',
                life: 30
            });
        }
    }
    
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const pulse = Math.sin(this.animationFrame * 0.05) * 3;
        
        ctx.save();
        
        // Flash ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#FFFFFF';
        }
        
        // Círculo de invocação (🔧 NOVO: anel em dodecágono facetado em vez de círculo)
        ctx.strokeStyle = `rgba(139, 0, 139, ${Math.sin(this.animationFrame * 0.1) * 0.3 + 0.5})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#8B008B';
        drawPolygonPath(ctx, centerX, centerY, 30 + pulse, 12, this.animationFrame * 0.015);
        ctx.stroke();
        
        // Runas orbitantes (🔧 NOVO: hexágonos em vez de quadrados simples)
        this.runes.forEach((rune, i) => {
            const angle = rune.angle + this.animationFrame * 0.02;
            const x = centerX + Math.cos(angle) * (rune.distance + pulse);
            const y = centerY + Math.sin(angle) * (rune.distance + pulse);
            
            ctx.fillStyle = '#BA55D3';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#BA55D3';
            fillPolygon(ctx, x, y, 4.5, 6, angle);
        });
        
        // Corpo (pentagrama)
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15 + pulse;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (24 + pulse);
            const y = centerY + Math.sin(angle) * (24 + pulse);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Círculo central místico (🔧 NOVO: octógono cristalino em vez de círculo)
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#8B008B');
        gradient.addColorStop(1, 'rgba(139, 0, 139, 0)');
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
        fillPolygon(ctx, centerX, centerY, 15, 8, this.animationFrame * 0.02);
        strokePolygon(ctx, centerX, centerY, 15, 8, 'rgba(255,215,0,0.5)', 1.5, this.animationFrame * 0.02);
        
        // Olho místico (🔧 NOVO: hexágono)
        ctx.fillStyle = '#FF00FF';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF00FF';
        fillPolygon(ctx, centerX, centerY, 5, 6, -this.animationFrame * 0.04);
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// Exportar classes
if (typeof window !== 'undefined') {
    window.EnemyClasses = {
        BaseEnemy,
        BasicEnemy,
        ZigZagEnemy,
        TankEnemy,
        SniperEnemy,
        KamikazeEnemy,
        ParasiteEnemy,
        SummonerEnemy
    };
}

console.log('✨ Sistema de Inimigos V2 carregado com sucesso!');
