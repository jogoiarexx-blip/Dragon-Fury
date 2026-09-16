// ===== CONTROLE DO JOGADOR (DRAGÃO) - VERSÃO MELHORADA =====

const dragon = {
    x: 275,
    y: 700,
    width: 50,
    height: 50,
    speed: 6,
    color: '#FF6B35',
    fireRate: 500,
    lastShot: 0,
    invulnerable: false,
    invulnerableTimer: 0,
    lastDamageDistance: 0,
    wingAnimation: 0, // Animação das asas
    tailAnimation: 0, // Animação da cauda
    breathAnimation: 0, // Animação da respiração
    
    reset() {
        this.x = 275;
        this.y = 700;
        this.lastShot = 0;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.lastDamageDistance = 0;
        this.wingAnimation = 0;
        this.tailAnimation = 0;
        this.breathAnimation = 0;
    },
    
    update() {
        const speed = this.speed + (upgrades.speed.level * 1.5);
        
        // Movimento horizontal
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x -= speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x += speed;
        }
        
        // Movimento vertical
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.y -= speed;
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            this.y += speed;
        }
        
        // Limites da tela
        this.x = Math.max(0, Math.min(gameData.canvas.width - this.width, this.x));
        this.y = Math.max(gameData.canvas.height * 0.4, Math.min(gameData.canvas.height - this.height, this.y));
        
        // Disparo automático
        if (keys[' '] || keys['f'] || keys['F']) {
            this.shootFireball();
        }
        
        // Atualizar animações
        this.wingAnimation += 0.15;
        this.tailAnimation += 0.1;
        this.breathAnimation += 0.08;
        
        // Atualizar invulnerabilidade
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Atualizar power-up
        if (gameStats.powerUpActive) {
            gameStats.powerUpTimer--;
            if (gameStats.powerUpTimer <= 0) {
                gameStats.powerUpActive = null;
            }
        }
    },
    
    draw() {
        const ctx = gameData.ctx;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();
        
        // Efeito de invulnerabilidade
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // ===== ASAS (atrás do corpo) =====
        this.drawWings(ctx, centerX, centerY);
        
        // ===== CAUDA =====
        this.drawTail(ctx, centerX, centerY);
        
        // ===== CORPO PRINCIPAL =====
        this.drawBody(ctx, centerX, centerY);
        
        // ===== CABEÇA =====
        this.drawHead(ctx, centerX, centerY);
        
        // ===== DETALHES E EFEITOS =====
        this.drawDetails(ctx, centerX, centerY);
        
        // Indicador de power-up
        if (gameStats.powerUpActive) {
            let powerUpColor = 'rgba(0, 255, 255, 0.2)';
            let powerUpStroke = 'rgba(0, 255, 255, 0.8)';
            
            // Cores diferentes por tipo de power-up
            if (gameStats.powerUpActive === 'rapid_fire') {
                powerUpColor = 'rgba(255, 107, 53, 0.2)';
                powerUpStroke = 'rgba(255, 107, 53, 0.8)';
            } else if (gameStats.powerUpActive === 'shield') {
                powerUpColor = 'rgba(0, 255, 255, 0.2)';
                powerUpStroke = 'rgba(0, 255, 255, 0.8)';
            } else if (gameStats.powerUpActive === 'double_damage') {
                powerUpColor = 'rgba(255, 20, 147, 0.2)';
                powerUpStroke = 'rgba(255, 20, 147, 0.8)';
            }
            
            ctx.fillStyle = powerUpColor;
            ctx.strokeStyle = powerUpStroke;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Partículas orbitando
            for (let i = 0; i < 4; i++) {
                const angle = (this.wingAnimation * 2 + i * Math.PI / 2);
                const px = centerX + Math.cos(angle) * 35;
                const py = centerY + Math.sin(angle) * 35;
                ctx.fillStyle = powerUpStroke;
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Barra de tempo do power-up no HUD
            const timePercent = gameStats.powerUpTimer / 600;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(centerX - 30, centerY + 45, 60, 5);
            ctx.fillStyle = powerUpStroke;
            ctx.fillRect(centerX - 30, centerY + 45, 60 * timePercent, 5);
        }
        
        ctx.restore();
    },
    
    drawWings(ctx, centerX, centerY) {
        const wingFlap = Math.sin(this.wingAnimation) * 15;
        const wingExtend = Math.abs(Math.sin(this.wingAnimation)) * 10;
        
        // ASA ESQUERDA
        ctx.save();
        ctx.translate(centerX - 15, centerY);
        
        // Parte externa da asa (maior)
        ctx.fillStyle = '#FF4500';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-25 - wingExtend, -10 + wingFlap, -35 - wingExtend, 5 + wingFlap);
        ctx.quadraticCurveTo(-30 - wingExtend, 15 + wingFlap, -20, 20);
        ctx.quadraticCurveTo(-15, 10, 0, 5);
        ctx.closePath();
        ctx.fill();
        
        // Parte interna da asa (detalhes)
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.moveTo(-5, 2);
        ctx.quadraticCurveTo(-18 - wingExtend * 0.7, -5 + wingFlap * 0.8, -25 - wingExtend * 0.7, 8 + wingFlap * 0.8);
        ctx.quadraticCurveTo(-20 - wingExtend * 0.7, 12 + wingFlap * 0.8, -10, 15);
        ctx.closePath();
        ctx.fill();
        
        // Nervuras da asa
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-5, 3);
            const offsetX = -12 - i * 8 - wingExtend * (i / 3);
            const offsetY = i * 3 + wingFlap * (i / 3);
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // ASA DIREITA (espelhada)
        ctx.save();
        ctx.translate(centerX + 15, centerY);
        
        ctx.fillStyle = '#FF4500';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(25 + wingExtend, -10 + wingFlap, 35 + wingExtend, 5 + wingFlap);
        ctx.quadraticCurveTo(30 + wingExtend, 15 + wingFlap, 20, 20);
        ctx.quadraticCurveTo(15, 10, 0, 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.moveTo(5, 2);
        ctx.quadraticCurveTo(18 + wingExtend * 0.7, -5 + wingFlap * 0.8, 25 + wingExtend * 0.7, 8 + wingFlap * 0.8);
        ctx.quadraticCurveTo(20 + wingExtend * 0.7, 12 + wingFlap * 0.8, 10, 15);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(5, 3);
            const offsetX = 12 + i * 8 + wingExtend * (i / 3);
            const offsetY = i * 3 + wingFlap * (i / 3);
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        }
        
        ctx.restore();
        ctx.shadowBlur = 0;
    },
    
    drawTail(ctx, centerX, centerY) {
        const tailSway = Math.sin(this.tailAnimation) * 8;
        
        ctx.fillStyle = '#FF6B35';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF6B35';
        
        // Segmentos da cauda (3 segmentos para dar movimento)
        const segments = [
            { x: centerX, y: centerY + 25, width: 12, height: 15 },
            { x: centerX + tailSway * 0.5, y: centerY + 38, width: 10, height: 12 },
            { x: centerX + tailSway, y: centerY + 48, width: 8, height: 10 }
        ];
        
        segments.forEach((seg, i) => {
            ctx.fillRect(seg.x - seg.width / 2, seg.y, seg.width, seg.height);
            
            // Escamas na cauda
            if (i < 2) {
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(seg.x - seg.width / 2 + 2, seg.y + 2, seg.width - 4, 3);
                ctx.fillStyle = '#FF6B35';
            }
        });
        
        // Ponta da cauda com chamas
        const flameX = centerX + tailSway;
        const flameY = centerY + 58;
        
        // Chama principal
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(flameX, flameY);
        ctx.lineTo(flameX - 6, flameY + 8 + Math.sin(this.breathAnimation * 2) * 3);
        ctx.lineTo(flameX, flameY + 12);
        ctx.lineTo(flameX + 6, flameY + 8 + Math.cos(this.breathAnimation * 2) * 3);
        ctx.closePath();
        ctx.fill();
        
        // Chama interna
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(flameX, flameY + 2);
        ctx.lineTo(flameX - 3, flameY + 6);
        ctx.lineTo(flameX, flameY + 8);
        ctx.lineTo(flameX + 3, flameY + 6);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
    },
    
    drawBody(ctx, centerX, centerY) {
        const breathe = Math.sin(this.breathAnimation) * 2;
        
        // Corpo principal com gradiente
        const bodyGradient = ctx.createLinearGradient(
            centerX - 25, centerY - 20,
            centerX + 25, centerY + 20
        );
        bodyGradient.addColorStop(0, '#FF8C00');
        bodyGradient.addColorStop(0.5, '#FF6B35');
        bodyGradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = bodyGradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Corpo com formato mais orgânico
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 25 + breathe, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Barriga mais clara
        ctx.fillStyle = '#FFB366';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 5, 18 + breathe * 0.8, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Escamas no corpo
        ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
        ctx.shadowBlur = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const scaleX = centerX - 12 + j * 12;
                const scaleY = centerY - 10 + i * 10;
                ctx.beginPath();
                ctx.arc(scaleX, scaleY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.shadowBlur = 0;
    },
    
    drawHead(ctx, centerX, centerY) {
        const headY = centerY - 25;
        
        // Pescoço
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(centerX - 8, centerY - 15, 16, 15);
        
        // Cabeça principal
        const headGradient = ctx.createRadialGradient(
            centerX, headY, 5,
            centerX, headY, 20
        );
        headGradient.addColorStop(0, '#FF6B35');
        headGradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = headGradient;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#FF6B35';
        ctx.beginPath();
        ctx.ellipse(centerX, headY, 18, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Focinho
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.ellipse(centerX, headY - 8, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Narinas com fumaça
        ctx.fillStyle = '#8B0000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(centerX - 5, headY - 10, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 5, headY - 10, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Fumaça das narinas
        if (Math.random() > 0.7) {
            ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.beginPath();
            ctx.arc(centerX - 5, headY - 13, 3, 0, Math.PI * 2);
            ctx.arc(centerX + 5, headY - 13, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Chifres
        ctx.fillStyle = '#8B0000';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(centerX - 10, headY - 5);
        ctx.lineTo(centerX - 15, headY - 18);
        ctx.lineTo(centerX - 8, headY - 8);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 10, headY - 5);
        ctx.lineTo(centerX + 15, headY - 18);
        ctx.lineTo(centerX + 8, headY - 8);
        ctx.closePath();
        ctx.fill();
        
        // Olhos com brilho
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FFD700';
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX - 7, headY - 2, 4, 0, Math.PI * 2);
        ctx.arc(centerX + 7, headY - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilas
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 7, headY - 2, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 7, headY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Reflexo nos olhos
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(centerX - 6, headY - 3, 1, 0, Math.PI * 2);
        ctx.arc(centerX + 8, headY - 3, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    },
    
    drawDetails(ctx, centerX, centerY) {
        // Aura de energia quando atirando
        if (Date.now() - this.lastShot < 100) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(centerX, centerY - 25, 25, 0, Math.PI * 2);
            ctx.fill();
            
            // Partículas de fogo
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 20 + Math.random() * 10;
                const px = centerX + Math.cos(angle) * distance;
                const py = centerY - 25 + Math.sin(angle) * distance;
                ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${Math.random() * 0.5})`;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },
    
    shootFireball() {
        const currentTime = Date.now();
        let fireRate = this.fireRate - (upgrades.firepower.level * 75);
        
        if (gameStats.powerUpActive === 'rapid_fire') {
            fireRate = fireRate / 3;
        }
        
        // 🔧 AJUSTE: intervalo mínimo entre tiros, mesmo no nível máximo de
        // "Poder do Fogo" ou com o power-up rapid_fire ativo — evita que o
        // tiro fique rápido demais. (base e mínimo escalados para -60% de
        // tiros por segundo em relação à versão anterior)
        fireRate = Math.max(fireRate, 250);
        
        if (currentTime - this.lastShot < fireRate) return;
        
        this.lastShot = currentTime;
        
        // 🔧 NOVO: efeito sonoro de tiro
        if (typeof audioSystem !== 'undefined') audioSystem.playShoot();
        
        // 🔧 AJUSTE: base ainda mais lenta (era 12 → 8 → 5 → agora 2),
        // deixando bastante espaço de progressão no upgrade "Velocidade
        // do Tiro" (+2 por nível, até 5 níveis = até +10 no total).
        const fireballSpeed = 2 + (upgrades.bulletSpeed.level * 2);
        const fireballSize = 10 + (upgrades.firepower.level * 2);
        let damage = gameStats.firepower * 10;
        
        // Aplicar dano duplo se power-up ativo
        if (gameStats.powerUpActive === 'double_damage') {
            damage *= 2;
        }
        
        // 🔧 CORRIGIDO: Tiro Múltiplo agora aumenta 1 projétil por nível
        // comprado (nível 1 = 2 tiros, nível 2 = 3 tiros, nível 3 = 4
        // tiros), batendo com a descrição "Nx projéteis" que já aparecia
        // no painel de upgrades. Antes, o nível 1 já saltava direto para
        // 3 tiros de uma vez.
        //
        // Todos os tiros (incluindo o "central") são gerados numa faixa
        // simétrica em torno do dragão, sem nenhum "vx" (velocidade
        // lateral) - eles só nascem deslocados horizontalmente e sobem
        // retos, então vão para frente (não mais em diagonal/lateral) e
        // ficam espaçados o suficiente (largura do projétil + folga) pra
        // nunca se sobrepor.
        const multishotLevel = upgrades.multishot.level;
        let totalShots = 1 + multishotLevel;
        
        // Power-up Tiro Rápido: mais 2 projéteis extras temporários
        if (gameStats.powerUpActive === 'rapid_fire') {
            totalShots += 2;
        }
        
        const spacing = fireballSize + 6; // folga para não sobrepor
        const centerOffset = (totalShots - 1) / 2;
        
        for (let i = 0; i < totalShots; i++) {
            const offsetX = (i - centerOffset) * spacing;
            
            gameEntities.fireballs.push({
                x: this.x + this.width / 2 - fireballSize / 2 + offsetX,
                y: this.y - 10,
                width: fireballSize,
                height: fireballSize,
                speed: fireballSpeed,
                damage: damage,
                type: 'player'
            });
        }
    },
    
    takeDamage(amount) {
        if (this.invulnerable) return;
        
        // 🔧 NOVO: efeito sonoro de dano
        if (typeof audioSystem !== 'undefined') audioSystem.playPlayerHit();
        
        const shieldReduction = upgrades.shield.level * 0.15;
        const actualDamage = Math.floor(amount * (1 - shieldReduction));
        gameStats.health -= actualDamage;
        
        this.lastDamageDistance = gameData.distanceTraveled;
        
        this.invulnerable = true;
        this.invulnerableTimer = 60;
        
        if (gameStats.health <= 0) {
            gameStats.health = 0;
        }
    }
};
