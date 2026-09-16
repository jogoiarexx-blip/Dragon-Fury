// ===== SISTEMA DE TRANSIÇÕES ENTRE FASES =====

const phaseTransitions = {
    // Estado da transição
    isTransitioning: false,
    transitionType: 'fade', // 'fade', 'shake', 'flash', 'warp'
    transitionProgress: 0,
    transitionDuration: 120, // frames (2 segundos a 60fps)
    fromPhase: null,
    toPhase: null,
    
    // Controles de tremor
    shakeIntensity: 0,
    shakeOffsetX: 0,
    shakeOffsetY: 0,
    
    // Controles de flash
    flashAlpha: 0,
    flashColor: '#FFFFFF',
    
    // Controles de warp
    warpLines: [],
    warpIntensity: 0,
    
    // Iniciar transição entre fases
    startTransition(fromPhaseNum, toPhaseNum, type = 'fade') {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.transitionType = type;
        this.transitionProgress = 0;
        this.fromPhase = fromPhaseNum;
        this.toPhase = toPhaseNum;
        
        console.log(`🎬 Iniciando transição ${type}: Fase ${fromPhaseNum} → Fase ${toPhaseNum}`);
        
        // Configurações específicas por tipo
        switch(type) {
            case 'shake':
                this.shakeIntensity = 20;
                break;
            case 'flash':
                this.flashAlpha = 0;
                this.flashColor = this.getFlashColorForPhase(toPhaseNum);
                break;
            case 'warp':
                this.initWarpTransition();
                break;
        }
        
        // Tocar som de transição
        if (typeof gameData !== 'undefined' && gameData.audioEnabled) {
            // this.playTransitionSound(type);
        }
    },
    
    // Obter cor do flash baseado na fase de destino
    getFlashColorForPhase(phaseNum) {
        const colors = {
            1: '#87CEEB', // Azul céu sereno
            2: '#4B0082', // Roxo tempestade
            3: '#FF4500', // Laranja fúria ardente
            4: '#000000', // Preto abismo
            5: '#8B00FF'  // Roxo cósmico
        };
        return colors[phaseNum] || '#FFFFFF';
    },
    
    // Inicializar efeito warp
    initWarpTransition() {
        this.warpLines = [];
        for (let i = 0; i < 30; i++) {
            this.warpLines.push({
                x: Math.random() * gameData.canvas.width,
                y: Math.random() * gameData.canvas.height,
                length: Math.random() * 100 + 50,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 10 + 5,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    },
    
    // Atualizar transição
    update() {
        if (!this.isTransitioning) return;
        
        this.transitionProgress++;
        const progress = this.transitionProgress / this.transitionDuration;
        
        // Atualizar efeitos específicos
        switch(this.transitionType) {
            case 'fade':
                this.updateFade(progress);
                break;
            case 'shake':
                this.updateShake(progress);
                break;
            case 'flash':
                this.updateFlash(progress);
                break;
            case 'warp':
                this.updateWarp(progress);
                break;
        }
        
        // Finalizar transição
        if (this.transitionProgress >= this.transitionDuration) {
            this.endTransition();
        }
    },
    
    // Atualizar fade
    updateFade(progress) {
        // Nada específico - o alpha é calculado no draw
    },
    
    // Atualizar tremor
    updateShake(progress) {
        // Intensidade diminui ao longo do tempo
        const curve = 1 - Math.pow(progress, 2); // Ease-out quadrático
        this.shakeIntensity = 20 * curve;
        
        // Calcular offset do tremor
        if (this.shakeIntensity > 0) {
            this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity;
        }
    },
    
    // Atualizar flash
    updateFlash(progress) {
        // Flash rápido no início, depois fade out
        if (progress < 0.2) {
            // Flash in (0 → 1)
            this.flashAlpha = progress / 0.2;
        } else {
            // Fade out (1 → 0)
            this.flashAlpha = 1 - ((progress - 0.2) / 0.8);
        }
        this.flashAlpha = Math.max(0, Math.min(1, this.flashAlpha));
    },
    
    // Atualizar warp
    updateWarp(progress) {
        this.warpIntensity = Math.sin(progress * Math.PI); // 0 → 1 → 0
        
        // Atualizar linhas de warp
        this.warpLines.forEach(line => {
            line.x += Math.cos(line.angle) * line.speed * this.warpIntensity;
            line.y += Math.sin(line.angle) * line.speed * this.warpIntensity;
            
            // Reciclar linhas que saíram da tela
            if (line.x < -100 || line.x > gameData.canvas.width + 100 ||
                line.y < -100 || line.y > gameData.canvas.height + 100) {
                line.x = Math.random() * gameData.canvas.width;
                line.y = Math.random() * gameData.canvas.height;
            }
        });
    },
    
    // Finalizar transição
    endTransition() {
        this.isTransitioning = false;
        this.shakeIntensity = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.flashAlpha = 0;
        this.warpIntensity = 0;
        
        console.log(`✅ Transição concluída: Fase ${this.toPhase}`);
        
        // Callback de conclusão se necessário
        if (this.onTransitionComplete) {
            this.onTransitionComplete(this.toPhase);
        }
    },
    
    // Desenhar overlay de transição
    draw(ctx) {
        if (!this.isTransitioning) return;
        
        ctx.save();
        
        switch(this.transitionType) {
            case 'fade':
                this.drawFade(ctx);
                break;
            case 'shake':
                this.drawShake(ctx);
                break;
            case 'flash':
                this.drawFlash(ctx);
                break;
            case 'warp':
                this.drawWarp(ctx);
                break;
        }
        
        ctx.restore();
    },
    
    // Desenhar fade
    drawFade(ctx) {
        const progress = this.transitionProgress / this.transitionDuration;
        
        // Fade out (0 → 1 na primeira metade)
        let alpha;
        if (progress < 0.5) {
            alpha = progress * 2; // 0 → 1
        } else {
            alpha = 2 - (progress * 2); // 1 → 0
        }
        
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
    },
    
    // Desenhar tremor (aplicado via transform)
    drawShake(ctx) {
        // O tremor é aplicado no draw principal do jogo
        // Aqui apenas desenhamos um overlay sutil
        if (this.shakeIntensity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.shakeIntensity / 100})`;
            ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
        }
    },
    
    // Desenhar flash
    drawFlash(ctx) {
        ctx.fillStyle = this.flashColor;
        ctx.globalAlpha = this.flashAlpha * 0.8; // Max 80% opacidade
        ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
        ctx.globalAlpha = 1;
    },
    
    // Desenhar warp
    drawWarp(ctx) {
        // Linhas de distorção espacial
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(100, 150, 255, 0.8)';
        
        this.warpLines.forEach(line => {
            ctx.globalAlpha = line.opacity * this.warpIntensity;
            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(
                line.x + Math.cos(line.angle) * line.length,
                line.y + Math.sin(line.angle) * line.length
            );
            ctx.stroke();
        });
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        
        // Overlay de distorção
        const distortAlpha = this.warpIntensity * 0.3;
        ctx.fillStyle = `rgba(100, 150, 255, ${distortAlpha})`;
        ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
    },
    
    // Obter offset de tremor para aplicar no canvas
    getShakeOffset() {
        if (!this.isTransitioning || this.transitionType !== 'shake') {
            return { x: 0, y: 0 };
        }
        return {
            x: this.shakeOffsetX,
            y: this.shakeOffsetY
        };
    },
    
    // Verificar se está em meio de transição
    isInTransition() {
        return this.isTransitioning;
    },
    
    // Obter progresso da transição (0 a 1)
    getProgress() {
        return this.transitionProgress / this.transitionDuration;
    }
};
