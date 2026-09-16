// ===== INTEGRAÇÃO DE EFEITOS VISUAIS - DRAGON FURY ENHANCED =====

// Estender o update do player para incluir rastros
if (typeof dragon !== 'undefined') {
    const originalUpdate = dragon.update;
    dragon.update = function() {
        originalUpdate.call(this);
        
        // ✨ ENHANCED: Adicionar rastro do dragão ao se mover
        if (typeof dragonTrail !== 'undefined') {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            
            // Cor do rastro baseada no power-up ativo
            let trailColor = 'rgba(255, 107, 53, 0.5)';
            if (gameStats.powerUpActive === 'shield') {
                trailColor = 'rgba(0, 255, 255, 0.5)';
            } else if (gameStats.powerUpActive === 'rapid_fire') {
                trailColor = 'rgba(255, 150, 0, 0.5)';
            } else if (gameStats.powerUpActive === 'double_damage') {
                trailColor = 'rgba(255, 20, 147, 0.5)';
            }
            
            dragonTrail.addTrail(centerX, centerY + 20, trailColor);
        }
        
        // ✨ ENHANCED: Emitir partículas de impulso quando se move para cima
        if (typeof boostParticles !== 'undefined' && 
            (keys['ArrowUp'] || keys['w'] || keys['W'])) {
            const centerX = this.x + this.width / 2;
            const bottomY = this.y + this.height;
            boostParticles.emit(centerX, bottomY, 0, 1);
        }
    };
}

// Estender o update do game para atualizar efeitos visuais
if (typeof game !== 'undefined') {
    const originalGameUpdate = game.update;
    game.update = function() {
        originalGameUpdate.call(this);
        
        // Atualizar sistemas de efeitos visuais
        if (typeof dragonTrail !== 'undefined') {
            dragonTrail.update();
        }
        if (typeof boostParticles !== 'undefined') {
            boostParticles.update();
        }
        if (typeof powerUpAura !== 'undefined') {
            powerUpAura.update();
        }
    };
}

// Estender o draw do game para desenhar efeitos visuais
if (typeof game !== 'undefined') {
    const originalGameDraw = game.draw;
    game.draw = function() {
        const ctx = gameData.ctx;
        
        // ✨ ENHANCED: Desenhar rastro do dragão primeiro (camada de fundo)
        ctx.save();
        if (typeof dragonTrail !== 'undefined') {
            dragonTrail.draw(ctx);
        }
        ctx.restore();
        
        // ✨ ENHANCED: Desenhar partículas de impulso
        ctx.save();
        if (typeof boostParticles !== 'undefined') {
            boostParticles.draw(ctx);
        }
        ctx.restore();
        
        // Desenhar o jogo normalmente
        originalGameDraw.call(this);
        
        // ✨ ENHANCED: Desenhar aura de power-up por cima
        ctx.save();
        if (typeof powerUpAura !== 'undefined') {
            powerUpAura.draw(ctx);
        }
        ctx.restore();
    };
}

// Sistema de criação de aura ao ativar power-up
if (typeof upgrades !== 'undefined') {
    const originalApplyPowerUp = window.applyPowerUp || function() {};
    
    window.applyPowerUp = function(type) {
        originalApplyPowerUp(type);
        
        // Criar efeito visual ao ativar power-up
        if (typeof powerUpAura !== 'undefined' && typeof dragon !== 'undefined') {
            const centerX = dragon.x + dragon.width / 2;
            const centerY = dragon.y + dragon.height / 2;
            
            let color = '#00FFFF';
            switch(type) {
                case 'rapid_fire':
                    color = '#FF6B35';
                    break;
                case 'shield':
                    color = '#00FFFF';
                    break;
                case 'double_damage':
                    color = '#FF1493';
                    break;
                case 'bomb':
                    color = '#FFD700';
                    break;
            }
            
            powerUpAura.createRing(centerX, centerY, color);
            powerUpAura.createParticles(centerX, centerY, color, 12);
        }
    };
}

console.log('✨ Integração de efeitos visuais avançados carregada!');
