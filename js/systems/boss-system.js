// ===== SISTEMA DE BOSSES MELHORADO - DRAGON FURY V2 =====

// Classe base melhorada para bosses
class BaseBoss {
    constructor(config) {
        this.x = config.x || gameData.canvas.width / 2 - 75;
        this.y = config.y || -200;
        this.width = config.width || 150;
        this.height = config.height || 150;
        this.health = config.health || 1000;
        this.maxHealth = this.health;
        this.speed = config.speed || 1;
        this.color = config.color || '#4B0082';
        this.name = config.name || 'Boss';
        this.points = config.points || 5000;
        this.coins = config.coins || 50;
        this.phase = 1;
        this.maxPhases = config.maxPhases || 3;
        this.state = 'entering';
        this.stateTimer = 0;
        this.patternTimer = 0;
        this.invulnerable = false;
        this.animationFrame = 0;
        this.hitFlash = 0;
        // 🔧 BUGFIX: sem essa flag, upgrades como Tiro Múltiplo podiam
        // acertar o boss com 2+ fireballs no MESMO frame. A primeira já
        // zerava a vida e chamava destroy()/completeStage(); a(s) seguinte(s)
        // chamavam takeDamage() de novo no mesmo boss "morto", disparando
        // destroy() e completeStage() outra(s) vez (bônus/moedas duplicados,
        // tela de fase completa reaberta por cima dela mesma).
        this.destroyed = false;
    }
    
    takeDamage(damage) {
        if (this.invulnerable || this.state === 'entering' || this.destroyed) return false;
        
        this.health -= damage;
        this.hitFlash = 15;
        
        // Trocar de fase baseado na vida
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent <= 0.66 && this.phase === 1) {
            this.phase = 2;
            this.onPhaseChange();
        } else if (healthPercent <= 0.33 && this.phase === 2) {
            this.phase = 3;
            this.onPhaseChange();
        }
        
        if (this.health <= 0) {
            this.destroyed = true;
            this.destroy();
            return true;
        }
        return false;
    }
    
    destroy() {
        // Explosão épica massiva
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Onda de choque principal (quantidade adaptativa)
        const fxQuality = (typeof polishSystem !== 'undefined') ? polishSystem.effectiveQuality : 'medium';
        const shockCount = fxQuality === 'low' ? 20 : fxQuality === 'medium' ? 36 : 52;
        for (let i = 0; i < shockCount; i++) {
            const angle = (Math.PI * 2 / shockCount) * i;
            gameEntities.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * 15,
                vy: Math.sin(angle) * 15,
                size: Math.random() * 12 + 6,
                color: this.color,
                life: 80
            });
        }
        
        // Explosões secundárias
        const secondaryCount = fxQuality === 'low' ? 8 : fxQuality === 'medium' ? 18 : 28;
        for (let i = 0; i < secondaryCount; i++) {
            setTimeout(() => {
                const offsetX = (Math.random() - 0.5) * this.width;
                const offsetY = (Math.random() - 0.5) * this.height;
                
                for (let j = 0; j < 12; j++) {
                    const angle = (Math.PI * 2 / 12) * j;
                    gameEntities.particles.push({
                        x: centerX + offsetX,
                        y: centerY + offsetY,
                        vx: Math.cos(angle) * 10,
                        vy: Math.sin(angle) * 10,
                        size: Math.random() * 8 + 4,
                        color: ['#FFD700', '#FF6B35', '#FF00FF', '#FFFFFF'][Math.floor(Math.random() * 4)],
                        life: 60
                    });
                }
            }, i * 50);
        }
        
        // Flash branco da tela
        const canvas = gameData.canvas;
        const ctx = gameData.ctx;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Recompensas massivas
        gameStats.score += this.points;
        gameStats.coins += this.coins;
        gameStats.totalCoins += this.coins;
        
        // Chuva de moedas (mantém recompensa, reduz apenas objetos visuais)
        const coinBurstCount = fxQuality === 'low' ? 8 : fxQuality === 'medium' ? 12 : 16;
        for (let i = 0; i < coinBurstCount; i++) {
            setTimeout(() => {
                gameEntities.coins.push({
                    x: centerX + (Math.random() - 0.5) * 200,
                    y: centerY - 100,
                    width: 20,
                    height: 20,
                    value: Math.ceil(200 / coinBurstCount),
                    vx: (Math.random() - 0.5) * 8,
                    vy: -Math.random() * 10 - 5
                });
            }, i * 100);
        }
        
        const bossesDefeated = (parseInt(localStorage.getItem('bossesDefeated')) || 0) + 1;
        localStorage.setItem('bossesDefeated', bossesDefeated);
        
        gameData.bossActive = false;
        gameEntities.boss = null;
        
        ui.showNotification(`🏆 ${this.name} Derrotado! +${this.coins} moedas!`, 'success');
    }
    
    onPhaseChange() {
        this.invulnerable = true;
        setTimeout(() => { this.invulnerable = false; }, 2000);
        
        // Explosão de mudança de fase
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        const phaseFxCount = (typeof polishSystem !== 'undefined' && polishSystem.effectiveQuality === 'low') ? 12 :
            (typeof polishSystem !== 'undefined' && polishSystem.effectiveQuality === 'medium') ? 24 : 36;
        for (let i = 0; i < phaseFxCount; i++) {
            const angle = (Math.PI * 2 / phaseFxCount) * i;
            gameEntities.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * 10,
                vy: Math.sin(angle) * 10,
                size: 6,
                color: '#FFD700',
                life: 40
            });
        }
        
        ui.showNotification(`⚠️ ${this.name} - FASE ${this.phase}!`, 'warning');
    }
    
    drawHealthBar(ctx) {
        const barWidth = gameData.canvas.width - 100;
        const barHeight = 20;
        const x = 50;
        const y = 30;
        const healthPercent = this.health / this.maxHealth;
        
        // Fundo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 5, y - 5, barWidth + 10, barHeight + 10);
        
        // Barra de vida com gradiente
        const gradient = ctx.createLinearGradient(x, 0, x + barWidth * healthPercent, 0);
        if (healthPercent > 0.66) {
            gradient.addColorStop(0, '#00FF00');
            gradient.addColorStop(1, '#7FFF00');
        } else if (healthPercent > 0.33) {
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
        } else {
            gradient.addColorStop(0, '#FF4500');
            gradient.addColorStop(1, '#FF0000');
        }
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = gradient;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        ctx.shadowBlur = 0;
        
        // Marcadores de fase
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + barWidth * 0.66, y);
        ctx.lineTo(x + barWidth * 0.66, y + barHeight);
        ctx.moveTo(x + barWidth * 0.33, y);
        ctx.lineTo(x + barWidth * 0.33, y + barHeight);
        ctx.stroke();
        
        // Borda
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Nome e vida
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000';
        ctx.fillText(`${this.name} [FASE ${this.phase}]`, gameData.canvas.width / 2, y - 10);
        ctx.fillText(`${Math.max(0, Math.floor(this.health))} / ${this.maxHealth}`, 
                     gameData.canvas.width / 2, y + barHeight / 2 + 6);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    }
    
    update() {
        this.animationFrame++;
        if (this.hitFlash > 0) this.hitFlash--;
        
        // Estado de entrada
        if (this.state === 'entering') {
            this.y += 2;
            if (this.y >= 50) {
                this.state = 'active';
                ui.showNotification(`⚠️ BOSS: ${this.name}!`, 'error');
            }
        }
    }
    
    draw(ctx) {
        // Override em subclasses
    }
}


// Assets de sprite dos bosses (fallback para desenho procedural quando necessário)
const bossSpriteAssets = {
    ancientDragon: {
        src: 'assets/bosses/ancient-dragon-boss.webp',
        image: null,
        loaded: false,
        error: false,
        loading: false,
        cols: 4,
        rows: 4,
        cellWidth: 0,
        cellHeight: 0
    }
};

function ensureBossSpriteLoaded(key) {
    const asset = bossSpriteAssets[key];
    if (!asset || asset.loaded || asset.loading) return asset;
    asset.loading = true;
    const img = new Image();
    img.onload = () => {
        asset.image = img;
        asset.loaded = true;
        asset.error = false;
        asset.loading = false;
        asset.cellWidth = img.width / asset.cols;
        asset.cellHeight = img.height / asset.rows;
    };
    img.onerror = () => {
        asset.error = true;
        asset.loading = false;
    };
    img.src = asset.src;
    asset.image = img;
    return asset;
}

// pré-carrega logo no boot para o boss da fase 1 não travar na primeira aparição
ensureBossSpriteLoaded('ancientDragon');


// BOSS 1: DRAGÃO ANCESTRAL - Boss das Fases 1-2
class AncientDragonBoss extends BaseBoss {
    constructor() {
        super({
            width: 220,
            height: 220,
            health: 800,
            color: '#8B0000',
            name: 'Dragão Ancestral',
            points: 3000,
            coins: 100
        });
        this.firePattern = 0;
        this.fireTimer = 0;
        this.wingFlap = 0;
        this.breathCharging = false;
        this.breathCharge = 0;
        this.attackPoseTimer = 0;
        this.hurtPoseTimer = 0;
        this.hoverBob = 0;
        this.spriteAssetKey = 'ancientDragon';
        this.spriteFrame = 0;
        ensureBossSpriteLoaded(this.spriteAssetKey);
    }

    update() {
        super.update();
        this.hoverBob += 0.08;
        if (this.attackPoseTimer > 0) this.attackPoseTimer--;
        if (this.hurtPoseTimer > 0) this.hurtPoseTimer--;

        if (this.state !== 'active') return;

        this.wingFlap += 0.1;
        this.patternTimer++;

        // Movimento ondulante
        this.x = gameData.canvas.width / 2 - this.width / 2 + Math.sin(this.animationFrame * 0.02) * 100;

        // Padrão de ataque baseado na fase
        if (this.phase === 1) {
            this.basicFirePattern();
        } else if (this.phase === 2) {
            this.spreadFirePattern();
        } else if (this.phase === 3) {
            this.breathAttack();
        }
    }

    takeDamage(damage) {
        const killed = super.takeDamage(damage);
        this.hurtPoseTimer = 10;
        return killed;
    }

    basicFirePattern() {
        this.fireTimer++;
        if (this.fireTimer > 90) {
            this.shootFireball(0);
            this.fireTimer = 0;
        }
    }

    spreadFirePattern() {
        this.fireTimer++;
        if (this.fireTimer > 60) {
            this.shootFireball(-20);
            this.shootFireball(0);
            this.shootFireball(20);
            this.fireTimer = 0;
        }
    }

    breathAttack() {
        if (!this.breathCharging) {
            this.fireTimer++;
            if (this.fireTimer > 120) {
                this.breathCharging = true;
                this.breathCharge = 0;
                this.fireTimer = 0;
            }
        } else {
            this.breathCharge++;
            if (this.breathCharge >= 90) {
                // Liberar baforada
                for (let i = -3; i <= 3; i++) {
                    this.shootFireball(i * 15);
                }
                this.attackPoseTimer = 12;
                this.breathCharging = false;
                this.breathCharge = 0;
            }
        }
    }

    shootFireball(angleOffset) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height * 0.68;
        this.attackPoseTimer = 10;

        gameEntities.fireballs.push({
            x: centerX - 6,
            y: centerY,
            width: 12,
            height: 12,
            speed: 4,
            damage: 25,
            type: 'enemy',
            vy: 4,
            vx: Math.sin(angleOffset * Math.PI / 180) * 3,
            color: '#FF4500'
        });
    }

    getCurrentSpriteIndex() {
        const asset = bossSpriteAssets[this.spriteAssetKey];
        const idleFrames = [0, 1, 2, 3];
        if (this.state === 'cinematic' || this.state === 'entering') {
            const descendFrames = [4, 5, 6, 7];
            return descendFrames[Math.floor(this.animationFrame / 8) % descendFrames.length];
        }
        if (this.health <= 0) return 15;
        if (this.hurtPoseTimer > 0 || this.hitFlash > 0) return 13;
        if (this.breathCharging) {
            const chargeFrames = [8, 9, 10, 11];
            const ratio = Math.min(0.999, this.breathCharge / 90);
            return chargeFrames[Math.floor(ratio * chargeFrames.length)];
        }
        if (this.attackPoseTimer > 0) return 12;
        if (asset && asset.loaded) {
            const idleRate = this.phase >= 3 ? 6 : 9;
            return idleFrames[Math.floor(this.animationFrame / idleRate) % idleFrames.length];
        }
        return 0;
    }

    drawSprite(ctx) {
        const asset = bossSpriteAssets[this.spriteAssetKey];
        if (!asset || !asset.loaded || !asset.image) return false;
        const index = this.getCurrentSpriteIndex();
        const sx = (index % asset.cols) * asset.cellWidth;
        const sy = Math.floor(index / asset.cols) * asset.cellHeight;
        const bob = this.state === 'active' ? Math.sin(this.hoverBob) * 6 : 0;
        const drawX = this.x - 18;
        const drawY = this.y - 28 + bob;
        const drawW = this.width + 36;
        const drawH = this.height + 36;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height * 0.75;

        ctx.save();
        // sombra / presença
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 42, this.width * 0.26, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // aura sutil
        const auraRadius = Math.max(this.width, this.height) * 0.75 + Math.sin(this.animationFrame * 0.08) * 10;
        const aura = ctx.createRadialGradient(centerX, centerY - 10, 0, centerX, centerY - 10, auraRadius);
        aura.addColorStop(0, 'rgba(255, 90, 0, 0.18)');
        aura.addColorStop(0.6, 'rgba(255, 40, 0, 0.08)');
        aura.addColorStop(1, 'rgba(255, 40, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 10, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = this.breathCharging ? 34 : 18;
        ctx.shadowColor = this.breathCharging ? '#ff7a1f' : '#c83410';
        ctx.drawImage(asset.image, sx, sy, asset.cellWidth, asset.cellHeight, drawX, drawY, drawW, drawH);
        ctx.shadowBlur = 0;

        if (this.breathCharging) {
            const chargePercent = this.breathCharge / 90;
            ctx.fillStyle = `rgba(255, 130, 40, ${Math.min(0.85, 0.3 + chargePercent * 0.55)})`;
            ctx.beginPath();
            ctx.arc(centerX, this.y + this.height * 0.48 + bob, 14 + chargePercent * 24, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.hitFlash > 0) {
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = this.hitFlash / 18;
            ctx.fillStyle = '#ffffff';
            ctx.drawImage(asset.image, sx, sy, asset.cellWidth, asset.cellHeight, drawX, drawY, drawW, drawH);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }
        ctx.restore();
        return true;
    }

    drawFallback(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.save();

        // Aura de boss
        const auraSize = 120 + Math.sin(this.animationFrame * 0.05) * 20;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, auraSize);
        gradient.addColorStop(0, 'rgba(139, 0, 0, 0.3)');
        gradient.addColorStop(0.5, 'rgba(139, 0, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, auraSize, 0, Math.PI * 2);
        ctx.fill();

        // Efeito de carregamento de baforada
        if (this.breathCharging) {
            const chargePercent = this.breathCharge / 90;
            ctx.fillStyle = `rgba(255, 69, 0, ${chargePercent * 0.7})`;
            ctx.shadowBlur = 30 * chargePercent;
            ctx.shadowColor = '#FF4500';
            ctx.beginPath();
            ctx.arc(centerX, centerY + 40, 30 * chargePercent, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.hitFlash > 0) {
            ctx.globalAlpha = this.hitFlash / 15;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#FFFFFF';
        }

        const wingAngle = Math.sin(this.wingFlap) * 0.3;
        ctx.fillStyle = '#A52A2A';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(centerX - 30, centerY);
        ctx.quadraticCurveTo(centerX - 90, centerY - 40 + Math.sin(this.wingFlap) * 20, centerX - 100, centerY + 20);
        ctx.quadraticCurveTo(centerX - 80, centerY + 40, centerX - 40, centerY + 30);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(centerX + 30, centerY);
        ctx.quadraticCurveTo(centerX + 90, centerY - 40 + Math.sin(this.wingFlap) * 20, centerX + 100, centerY + 20);
        ctx.quadraticCurveTo(centerX + 80, centerY + 40, centerX + 40, centerY + 30);
        ctx.closePath();
        ctx.fill();
        const bodyGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
        bodyGradient.addColorStop(0, '#8B0000');
        bodyGradient.addColorStop(0.6, '#A52A2A');
        bodyGradient.addColorStop(1, '#8B0000');
        ctx.fillStyle = bodyGradient;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(1, 55 / 50);
        fillPolygon(ctx, 0, 0, 50, 10, -Math.PI / 2);
        ctx.restore();
        ctx.fillStyle = 'rgba(139, 0, 0, 0.5)';
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 5; col++) {
                const scaleX = centerX - 35 + col * 18;
                const scaleY = centerY - 40 + row * 20;
                fillDiamond(ctx, scaleX, scaleY, 4.5);
            }
        }
        ctx.fillStyle = '#A52A2A';
        ctx.save();
        ctx.translate(centerX, centerY - 50);
        ctx.scale(1, 30 / 35);
        fillPolygon(ctx, 0, 0, 35, 7, -Math.PI / 2);
        ctx.restore();
        ctx.fillStyle = '#8B0000';
        ctx.save();
        ctx.translate(centerX, centerY - 70);
        ctx.scale(1, 20 / 25);
        fillPolygon(ctx, 0, 0, 25, 6, -Math.PI / 2);
        ctx.restore();
        ctx.fillStyle = '#2F4F4F';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000';
        ctx.beginPath();
        ctx.moveTo(centerX - 25, centerY - 45);
        ctx.quadraticCurveTo(centerX - 35, centerY - 70, centerX - 40, centerY - 85);
        ctx.lineTo(centerX - 38, centerY - 80);
        ctx.quadraticCurveTo(centerX - 33, centerY - 65, centerX - 23, centerY - 47);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(centerX + 25, centerY - 45);
        ctx.quadraticCurveTo(centerX + 35, centerY - 70, centerX + 40, centerY - 85);
        ctx.lineTo(centerX + 38, centerY - 80);
        ctx.quadraticCurveTo(centerX + 33, centerY - 65, centerX + 23, centerY - 47);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX - 12, centerY - 55, 6, 0, Math.PI * 2);
        ctx.arc(centerX + 12, centerY - 55, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF0000';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF0000';
        ctx.beginPath();
        ctx.arc(centerX - 12, centerY - 55, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 12, centerY - 55, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 15;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 50);
        const tailSway = Math.sin(this.animationFrame * 0.08);
        ctx.quadraticCurveTo(centerX + tailSway * 40, centerY + 80, centerX + tailSway * 60, centerY + 110);
        ctx.stroke();
        ctx.fillStyle = '#FF4500';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(centerX + tailSway * 60, centerY + 110);
        ctx.lineTo(centerX + tailSway * 55 - 10, centerY + 125);
        ctx.lineTo(centerX + tailSway * 60, centerY + 130);
        ctx.lineTo(centerX + tailSway * 65 + 10, centerY + 125);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    draw(ctx) {
        ensureBossSpriteLoaded(this.spriteAssetKey);
        const usedSprite = this.drawSprite(ctx);
        if (!usedSprite) {
            this.drawFallback(ctx);
        }
        this.drawHealthBar(ctx);
    }
}

// BOSS 2: SERPENTE SEGMENTADA - Boss das Fases 3-4
class SegmentedSerpentBoss extends BaseBoss {
    constructor() {
        super({
            width: 60,
            height: 60,
            health: 1200,
            color: '#00CED1',
            name: 'Serpente Cósmica',
            points: 5000,
            coins: 150
        });
        
        this.segments = [];
        this.segmentCount = 8;
        
        // Criar segmentos
        for (let i = 0; i < this.segmentCount; i++) {
            this.segments.push({
                x: this.x,
                y: this.y + i * 40,
                size: 50 - i * 3,
                angle: 0
            });
        }
        
        this.movePattern = 0;
        this.shootTimer = 0;
    }
    
    update() {
        super.update();
        
        if (this.state !== 'active') return;
        
        this.patternTimer++;
        
        // Movimento sinuoso
        const speed = 2 + this.phase * 0.5;
        this.x = gameData.canvas.width / 2 + Math.sin(this.animationFrame * 0.03) * 200;
        this.y = 100 + Math.cos(this.animationFrame * 0.02) * 50;
        
        // Atualizar segmentos
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        
        for (let i = 1; i < this.segments.length; i++) {
            const prev = this.segments[i - 1];
            const seg = this.segments[i];
            
            const dx = prev.x - seg.x;
            const dy = prev.y - seg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const targetDistance = 35;
            
            if (distance > targetDistance) {
                seg.x += (dx / distance) * (distance - targetDistance) * 0.3;
                seg.y += (dy / distance) * (distance - targetDistance) * 0.3;
            }
            
            seg.angle = Math.atan2(dy, dx);
        }
        
        // Padrão de tiro
        this.shootTimer++;
        const shootRate = 80 - this.phase * 10;
        if (this.shootTimer > shootRate) {
            this.shootFromSegments();
            this.shootTimer = 0;
        }
    }
    
    shootFromSegments() {
        // Cada segmento atira
        const segmentsToShoot = Math.min(this.phase + 1, 3);
        for (let i = 0; i < segmentsToShoot; i++) {
            const seg = this.segments[i * 2];
            if (!seg) continue;
            
            const angle = seg.angle + Math.PI / 2;
            gameEntities.fireballs.push({
                x: seg.x,
                y: seg.y,
                width: 8,
                height: 8,
                speed: 5,
                damage: 20,
                type: 'enemy',
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                color: '#00CED1'
            });
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Desenhar trilha energética
        ctx.strokeStyle = 'rgba(0, 206, 209, 0.3)';
        ctx.lineWidth = 20;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00CED1';
        ctx.beginPath();
        this.segments.forEach((seg, i) => {
            if (i === 0) ctx.moveTo(seg.x, seg.y);
            else ctx.lineTo(seg.x, seg.y);
        });
        ctx.stroke();
        
        // Flash ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = this.hitFlash / 15;
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#FFFFFF';
        }
        
        // Desenhar segmentos
        this.segments.forEach((seg, i) => {
            const pulse = Math.sin(this.animationFrame * 0.1 + i * 0.5) * 3;
            
            // Corpo do segmento (🔧 NOVO: octógono cristalino em vez de círculo)
            const gradient = ctx.createRadialGradient(seg.x, seg.y, 0, seg.x, seg.y, seg.size);
            gradient.addColorStop(0, '#00FFFF');
            gradient.addColorStop(0.5, '#00CED1');
            gradient.addColorStop(1, '#008B8B');
            
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 15 + pulse;
            ctx.shadowColor = '#00CED1';
            fillPolygon(ctx, seg.x, seg.y, seg.size / 2 + pulse, 8, this.animationFrame * 0.02 + i);
            
            // Escamas cristalinas (🔧 NOVO: losangos em vez de pontinhos redondos)
            if (i % 2 === 0) {
                ctx.fillStyle = '#7FFFD4';
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#7FFFD4';
                for (let j = 0; j < 6; j++) {
                    const angle = (Math.PI * 2 / 6) * j + this.animationFrame * 0.05;
                    const x = seg.x + Math.cos(angle) * (seg.size / 3);
                    const y = seg.y + Math.sin(angle) * (seg.size / 3);
                    fillDiamond(ctx, x, y, 3.5, angle);
                }
            }
        });
        
        // Cabeça (primeiro segmento) com detalhes
        const head = this.segments[0];
        
        // Olhos
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
        ctx.beginPath();
        ctx.arc(head.x - 10, head.y - 8, 6, 0, Math.PI * 2);
        ctx.arc(head.x + 10, head.y - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilas
        ctx.fillStyle = '#FF00FF';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF00FF';
        ctx.beginPath();
        ctx.arc(head.x - 10, head.y - 8, 3, 0, Math.PI * 2);
        ctx.arc(head.x + 10, head.y - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Crista energética
        for (let i = 0; i < 5; i++) {
            const spikeHeight = 20 - i * 3;
            const x = head.x - 20 + i * 10;
            const y = head.y - head.size / 2;
            
            ctx.fillStyle = '#00FFFF';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00FFFF';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 4, y - spikeHeight);
            ctx.lineTo(x + 4, y - spikeHeight);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// BOSS 3: GEOMETRIA DO CAOS - Boss das Fases 5-6
class ChaosGeometryBoss extends BaseBoss {
    constructor() {
        super({
            width: 180,
            height: 180,
            health: 1800,
            color: '#8B008B',
            name: 'Entidade do Caos',
            points: 10000,
            coins: 300
        });
        
        this.geometries = [];
        this.createGeometries();
        this.portalAngle = 0;
        this.attackPattern = 0;
        this.attackTimer = 0;
    }
    
    createGeometries() {
        // Criar formas geométricas orbitantes
        const shapes = ['triangle', 'square', 'pentagon', 'hexagon'];
        for (let i = 0; i < 4; i++) {
            this.geometries.push({
                shape: shapes[i],
                angle: (Math.PI * 2 / 4) * i,
                distance: 80,
                rotation: 0,
                size: 30
            });
        }
    }
    
    update() {
        super.update();
        
        if (this.state !== 'active') return;
        
        this.patternTimer++;
        this.portalAngle += 0.02;
        
        // Movimento teleport
        if (this.patternTimer % 180 === 0) {
            this.x = Math.random() * (gameData.canvas.width - this.width);
            this.y = 50 + Math.random() * 150;
        }
        
        // Atualizar geometrias
        this.geometries.forEach(geo => {
            geo.angle += 0.03;
            geo.rotation += 0.05;
        });
        
        // Padrões de ataque complexos
        this.attackTimer++;
        if (this.phase === 1) {
            this.spiralAttack();
        } else if (this.phase === 2) {
            this.geometryBarrage();
        } else if (this.phase === 3) {
            this.chaosRain();
        }
    }
    
    spiralAttack() {
        if (this.attackTimer % 20 === 0) {
            const angle = this.attackTimer * 0.2;
            this.shootProjectile(angle);
        }
    }
    
    geometryBarrage() {
        if (this.attackTimer % 40 === 0) {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                this.shootProjectile(angle);
            }
        }
    }
    
    chaosRain() {
        if (this.attackTimer % 15 === 0) {
            const x = Math.random() * gameData.canvas.width;
            gameEntities.fireballs.push({
                x: x,
                y: 0,
                width: 12,
                height: 12,
                speed: 6,
                damage: 30,
                type: 'enemy',
                vy: 6,
                vx: 0,
                color: '#FF00FF'
            });
        }
    }
    
    shootProjectile(angle) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        gameEntities.fireballs.push({
            x: centerX,
            y: centerY,
            width: 10,
            height: 10,
            speed: 5,
            damage: 25,
            type: 'enemy',
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            color: '#8B008B'
        });
    }
    
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();
        
        // Portal dimensional
        for (let i = 0; i < 5; i++) {
            const radius = 100 - i * 15 + Math.sin(this.animationFrame * 0.05 + i) * 10;
            const alpha = (5 - i) / 10;
            
            ctx.strokeStyle = `rgba(139, 0, 139, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#8B008B';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Flash ao tomar dano
        if (this.hitFlash > 0) {
            ctx.globalAlpha = this.hitFlash / 15;
            ctx.shadowBlur = 50;
            ctx.shadowColor = '#FFFFFF';
        }
        
        // Núcleo central caótico (🔧 NOVO: gema de 12 pontas em vez de círculo — reforça o caos)
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60);
        coreGradient.addColorStop(0, '#FF00FF');
        coreGradient.addColorStop(0.5, '#8B008B');
        coreGradient.addColorStop(1, 'rgba(139, 0, 139, 0)');
        
        ctx.fillStyle = coreGradient;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#FF00FF';
        drawGemPath(ctx, centerX, centerY, 60, 45, 12, this.animationFrame * 0.015);
        ctx.fill();
        
        // Desenhar geometrias orbitantes
        this.geometries.forEach(geo => {
            const x = centerX + Math.cos(geo.angle) * geo.distance;
            const y = centerY + Math.sin(geo.angle) * geo.distance;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(geo.rotation);
            
            // Determinar número de lados
            let sides;
            switch(geo.shape) {
                case 'triangle': sides = 3; break;
                case 'square': sides = 4; break;
                case 'pentagon': sides = 5; break;
                case 'hexagon': sides = 6; break;
                default: sides = 3;
            }
            
            // Desenhar polígono
            ctx.fillStyle = 'rgba(138, 43, 226, 0.7)';
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#8A2BE2';
            
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i;
                const px = Math.cos(angle) * geo.size;
                const py = Math.sin(angle) * geo.size;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        });
        
        // Olho central hipnótico (🔧 NOVO: decágono + octógono em vez de círculos)
        const pupilSize = 15 + Math.sin(this.animationFrame * 0.1) * 5;
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FFD700';
        fillPolygon(ctx, centerX, centerY, pupilSize, 10, this.animationFrame * 0.03);
        
        ctx.fillStyle = '#FF00FF';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF00FF';
        fillPolygon(ctx, centerX, centerY, pupilSize / 2, 8, -this.animationFrame * 0.05);
        
        // Runas místicas
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i + this.portalAngle;
            const x = centerX + Math.cos(angle) * 45;
            const y = centerY + Math.sin(angle) * 45;
            
            ctx.fillStyle = '#00FFFF';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00FFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const runes = ['◊', '◈', '◇', '◆', '▣', '▢'];
            ctx.fillText(runes[i], x, y);
        }
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// Exportar classes de bosses
if (typeof window !== 'undefined') {
    window.BossClasses = {
        BaseBoss,
        AncientDragonBoss,
        SegmentedSerpentBoss,
        ChaosGeometryBoss
    };
}

console.log('👑 Sistema de Bosses V2 carregado com sucesso!');
