// ===== SISTEMA AVANÇADO DE MOEDAS =====
// Sistema completo com efeitos 3D, partículas, brilho e trails

const coinEffects = {
    particles: [], // Partículas ao redor das moedas
    trails: [], // Rastros de movimento
    
    // Configurações de efeitos
    config: {
        // Efeito 3D
        perspective: 0.3, // Intensidade do efeito 3D
        rotationSpeed: 0.08,
        tiltAngle: 0.2,
        
        // Partículas
        particleCount: 3, // Partículas por frame
        particleLifespan: 30,
        particleSize: 2,
        particleSpeed: 0.5,
        
        // Brilho pulsante
        glowMinIntensity: 15,
        glowMaxIntensity: 35,
        glowPulseSpeed: 0.05,
        
        // Trail
        trailLength: 8,
        trailFadeSpeed: 0.15,
        
        // Som
        collectSoundEnabled: true
    },
    
    // Estado do brilho pulsante
    glowPhase: 0,
    
    // Inicializar sistema
    init() {
        this.particles = [];
        this.trails = [];
        this.glowPhase = 0;
    },
    
    // Atualizar estado da moeda (adicionar propriedades 3D)
    enhanceCoin(coin) {
        if (!coin.enhanced) {
            coin.enhanced = true;
            coin.rotation3D = Math.random() * Math.PI * 2;
            coin.tilt = 0;
            coin.scale3D = 1;
            coin.lastX = coin.x;
            coin.lastY = coin.y;
            if (coin.animationOffset === undefined) coin.animationOffset = Math.floor(Math.random() * 8);
        }
    },
    
    // Atualizar efeitos de todas as moedas
    update(coins) {
        this.glowPhase += this.config.glowPulseSpeed;
        const quality = (typeof polishSystem !== 'undefined') ? polishSystem.effectiveQuality : 'medium';
        const particlesEnabled = !(typeof polishSystem !== 'undefined' && !polishSystem.settings.particles);
        
        coins.forEach(coin => {
            this.enhanceCoin(coin);
            
            // Atualizar rotação 3D
            coin.rotation3D += this.config.rotationSpeed;
            coin.tilt = Math.sin(coin.rotation3D) * this.config.tiltAngle;
            coin.scale3D = Math.abs(Math.cos(coin.rotation3D)) * 0.7 + 0.3;
            
            // Criar partículas douradas ao redor
            if (particlesEnabled && quality !== 'low' && Math.random() < (quality === 'high' ? 0.22 : 0.10)) {
                this.createCoinParticle(coin);
            }
            
            // Criar trail se a moeda está se movendo
            const deltaX = coin.x - coin.lastX;
            const deltaY = coin.y - coin.lastY;
            const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (quality === 'high' && speed > 0.8) {
                this.createTrail(coin);
            }
            
            coin.lastX = coin.x;
            coin.lastY = coin.y;
        });
        
        // Atualizar partículas
        this.updateParticles();
        
        // Atualizar trails
        this.updateTrails();
    },
    
    // Criar partícula dourada
    createCoinParticle(coin) {
        const angle = Math.random() * Math.PI * 2;
        const distance = coin.width * 0.5 + Math.random() * 10;
        
        this.particles.push({
            x: coin.x + coin.width / 2 + Math.cos(angle) * distance,
            y: coin.y + coin.height / 2 + Math.sin(angle) * distance,
            vx: Math.cos(angle) * this.config.particleSpeed,
            vy: Math.sin(angle) * this.config.particleSpeed - 0.2, // Sobe levemente
            size: Math.random() * this.config.particleSize + 1,
            life: this.config.particleLifespan,
            maxLife: this.config.particleLifespan,
            color: this.getGoldGradientColor()
        });
    },
    
    // Criar trail de movimento
    createTrail(coin) {
        this.trails.push({
            x: coin.x + coin.width / 2,
            y: coin.y + coin.height / 2,
            width: coin.width * coin.scale3D,
            height: coin.height * 0.3,
            rotation: coin.rotation3D,
            alpha: 1,
            scale: coin.scale3D
        });
        
        // Limitar tamanho do array de trails
        if (this.trails.length > 50) {
            this.trails.splice(0, this.trails.length - 50);
        }
    },
    
    // Atualizar partículas
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            // Leve gravidade
            p.vy += 0.02;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    // Atualizar trails
    updateTrails() {
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            
            trail.alpha -= this.config.trailFadeSpeed;
            
            if (trail.alpha <= 0) {
                this.trails.splice(i, 1);
            }
        }
    },
    
    // Desenhar moeda com efeito 3D
    drawCoin(ctx, coin) {
        this.enhanceCoin(coin);
        const quality = (typeof polishSystem !== 'undefined') ? polishSystem.effectiveQuality : 'medium';
        const centerX = coin.x + coin.width / 2;
        const centerY = coin.y + coin.height / 2;
        const spriteAvailable = ensureCoinSpriteAtlasLoaded().loaded;
        if (quality === 'low' || !spriteAvailable) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(Math.max(0.35, coin.scale3D), 1);
            ctx.fillStyle = '#FFD700';
            fillPolygon(ctx, 0, 0, coin.width / 2, 8, coin.rotation3D);
            ctx.strokeStyle = '#FFEC8B';
            ctx.lineWidth = 1.5;
            drawPolygonPath(ctx, 0, 0, coin.width / 2 - 2, 8, coin.rotation3D);
            ctx.stroke();
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(centerX, centerY);
        const glowIntensity = this.config.glowMinIntensity +
            (Math.sin(this.glowPhase) * 0.5 + 0.5) *
            (this.config.glowMaxIntensity - this.config.glowMinIntensity);
        const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, coin.width * 1.4);
        aura.addColorStop(0, 'rgba(255, 210, 60, 0.32)');
        aura.addColorStop(0.45, 'rgba(255, 160, 0, 0.16)');
        aura.addColorStop(1, 'rgba(255, 140, 0, 0)');
        ctx.fillStyle = aura;
        ctx.fillRect(-coin.width * 1.4, -coin.height * 1.4, coin.width * 2.8, coin.height * 2.8);

        const spinFrames = 12;
        const frame = ((Math.floor((coin.rotation3D / (Math.PI * 2)) * spinFrames) + (coin.animationOffset || 0)) % spinFrames + spinFrames) % spinFrames;
        const pulseFrame = 12 + (Math.floor((this.glowPhase * 6)) % 4);
        const drawW = coin.width * 2.1;
        const drawH = coin.height * 2.1;
        const drawn = drawCoinSpriteFrame(ctx, frame, -drawW / 2, -drawH / 2, drawW, drawH, 1);
        if (drawn) {
            ctx.globalCompositeOperation = 'screen';
            drawCoinSpriteFrame(ctx, pulseFrame, -drawW / 2, -drawH / 2, drawW, drawH, 0.35 + Math.sin(this.glowPhase) * 0.08);
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = glowIntensity;
            ctx.shadowColor = '#FFB300';
            drawCoinSpriteFrame(ctx, frame, -drawW / 2, -drawH / 2, drawW, drawH, 0.12);
        }
        ctx.restore();
    },
    
    // Desenhar partículas
    drawParticles(ctx) {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Partícula com gradiente
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    },
    
    // Desenhar trails
    drawTrails(ctx) {
        this.trails.forEach(trail => {
            ctx.save();
            ctx.globalAlpha = trail.alpha * 0.3;
            ctx.translate(trail.x, trail.y);
            ctx.rotate(trail.rotation);
            ctx.scale(trail.scale, 1);
            
            const gradient = ctx.createLinearGradient(-trail.width/2, 0, trail.width/2, 0);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(-trail.width/2, -trail.height/2, trail.width, trail.height);
            
            ctx.restore();
        });
    },
    
    // Desenhar tudo
    draw(ctx, coins) {
        const quality = (typeof polishSystem !== 'undefined') ? polishSystem.effectiveQuality : 'medium';
        if (quality === 'high') this.drawTrails(ctx);
        for (let i = 0; i < coins.length; i++) this.drawCoin(ctx, coins[i]);
        if (quality !== 'low' && !(typeof polishSystem !== 'undefined' && !polishSystem.settings.particles)) this.drawParticles(ctx);
    },
    
    // Efeito ao coletar moeda
    onCollect(x, y, ctx) {
        // Explosão de partículas douradas adaptativa
        const quality = (typeof polishSystem !== 'undefined') ? polishSystem.effectiveQuality : 'medium';
        const count = quality === 'low' ? 5 : quality === 'medium' ? 10 : 16;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 3 + Math.random() * 3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                life: 40,
                maxLife: 40,
                color: this.getGoldGradientColor()
            });
        }
        
        // Som (simulado visualmente com pulse)
        if (this.config.collectSoundEnabled && ctx && quality !== 'low') {
            this.createCollectPulse(x, y, ctx);
        }
    },
    
    // Criar pulso visual ao coletar
    createCollectPulse(x, y, ctx) {
        let pulseRadius = 0;
        let pulseAlpha = 1;
        const maxRadius = 50;
        
        const animatePulse = () => {
            if (pulseRadius < maxRadius && ctx && ctx.canvas) {
                ctx.save();
                ctx.globalAlpha = pulseAlpha;
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                
                pulseRadius += 3;
                pulseAlpha -= 0.05;
            }
        };
        
        // Animar por alguns frames
        for (let i = 0; i < 15; i++) {
            setTimeout(animatePulse, i * 16);
        }
    },
    
    // Gerar cor aleatória no espectro dourado
    getGoldGradientColor() {
        const colors = [
            'rgba(255, 215, 0, 1)',   // Ouro
            'rgba(255, 223, 0, 1)',   // Ouro claro
            'rgba(255, 165, 0, 1)',   // Laranja dourado
            'rgba(255, 228, 92, 1)',  // Amarelo dourado
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};
