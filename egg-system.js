// ===== SISTEMA DE OVO RESGATÁVEL - DRAGON FURY =====
// ✨ NOVO: em cada fase, um ovo de dragão aparece na metade do caminho até
// o boss. O jogador pode voar até ele para "resgatá-lo" e ganhar um bônus
// de moedas/pontos. Não é obrigatório (não trava a fase se não pegar), só
// um objetivo extra - reduz o risco de reintroduzir travamentos.

const eggSystem = {
    // Tenta spawnar o ovo da fase atual quando o jogador atinge metade
    // dos kills necessários para o boss aparecer
    trySpawnEgg() {
        if (gameData.eggSpawnedThisStage) return;
        if (gameData.bossActive) return;
        if (typeof phaseSystem === 'undefined') return;
        
        const phase = phaseSystem.getCurrentPhase();
        if (!phase) return;
        
        const halfway = Math.floor(phase.targetKills / 2);
        if (gameData.enemiesKilledThisStage >= halfway) {
            this.spawnEgg();
        }
    },
    
    spawnEgg() {
        gameData.eggSpawnedThisStage = true;
        
        const width = 34;
        const x = 50 + Math.random() * (gameData.canvas.width - 100 - width);
        
        gameEntities.eggs.push({
            x: x,
            y: -60,
            width: width,
            height: 40,
            speed: 1.3,
            wobble: Math.random() * Math.PI * 2
        });
        
        if (typeof ui !== 'undefined') {
            ui.showNotification('🥚 Um ovo de dragão apareceu! Vá resgatá-lo!', 'info');
        }
    },
    
    update() {
        this.trySpawnEgg();
        
        for (let index = gameEntities.eggs.length - 1; index >= 0; index--) {
            const egg = gameEntities.eggs[index];
            egg.wobble += 0.05;
            egg.y += egg.speed;
            egg.x += Math.sin(egg.wobble) * 0.6;
            
            // Some da tela sem ser resgatado - só deixa de aparecer
            if (egg.y > gameData.canvas.height + 60) {
                gameEntities.eggs.splice(index, 1);
            }
        }
    },
    
    rescue(egg, index) {
        gameEntities.eggs.splice(index, 1);
        gameData.eggRescuedThisStage = true;
        
        const bonus = 200 * gameData.currentStage;
        gameStats.coins += bonus;
        gameStats.totalCoins += bonus;
        gameStats.score += bonus;
        localStorage.setItem('dragonCoins', gameStats.coins);
        localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
        
        if (typeof audioSystem !== 'undefined' && audioSystem.playCoin) {
            audioSystem.playCoin();
        }
        if (typeof ui !== 'undefined') {
            ui.showNotification(`🥚 Ovo resgatado! +${bonus} moedas!`, 'success');
        }
        
        // Partículas de comemoração
        const cx = egg.x + egg.width / 2;
        const cy = egg.y + egg.height / 2;
        for (let i = 0; i < 14; i++) {
            const angle = (Math.PI * 2 / 14) * i;
            gameEntities.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                size: Math.random() * 4 + 2,
                color: '#FFD700',
                life: 35,
                gravity: 0.1
            });
        }
    },
    
    draw(ctx) {
        gameEntities.eggs.forEach(egg => {
            const cx = egg.x + egg.width / 2;
            const cy = egg.y + egg.height / 2;
            
            ctx.save();
            ctx.translate(cx, cy);
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FFD700';
            
            const gradient = ctx.createRadialGradient(-4, -6, 2, 0, 0, egg.width / 2);
            gradient.addColorStop(0, '#FFF8DC');
            gradient.addColorStop(0.6, '#F4C430');
            gradient.addColorStop(1, '#B8860B');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(0, 0, egg.width / 2, egg.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#8B5A00';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Manchas do ovo
            ctx.fillStyle = 'rgba(139, 90, 0, 0.4)';
            [[-6, -8, 4], [7, -2, 3], [-3, 7, 3.5]].forEach(([dx, dy, r]) => {
                ctx.beginPath();
                ctx.arc(dx, dy, r, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.restore();
        });
    }
};
