// ===== SISTEMA DE DRAGÕES ESCOLTA - DRAGON FURY (VERSÃO MELHORADA) =====

class DragaoEscolta {
    constructor(side, playerRef) {
        // Validação crítica
        if (!playerRef) {
            console.error('❌ DragaoEscolta: playerRef é null ou undefined!');
            this.active = false;
            this.player = null;
            return;
        }
        
        this.side = side; // 'left' ou 'right'
        this.player = playerRef;
        this.x = 0;
        this.y = 0;
        this.width = 35;
        this.height = 35;
        this.color = '#FF8C00';
        this.offsetX = side === 'left' ? -70 : 70;
        this.offsetY = -30;
        this.fireRate = 350;
        this.lastShot = 0;
        this.bobOffset = side === 'left' ? 0 : Math.PI; // Offset diferente para cada lado
        this.bobSpeed = 0.12;
        this.wingAnimation = 0;
        this.active = true;
    }
    
    update() {
        if (!this.active || !this.player) return;
        
        // Seguir o jogador com offset suave
        const targetX = this.player.x + this.offsetX;
        const targetY = this.player.y + this.offsetY;
        
        // Movimento suave (interpolação)
        this.x += (targetX - this.x) * 0.15;
        this.y += (targetY - this.y) * 0.15;
        
        // Efeito de flutuação
        this.bobOffset += this.bobSpeed;
        const bob = Math.sin(this.bobOffset) * 6;
        this.y += bob;
        
        // Animação das asas
        this.wingAnimation += 0.2;
        
        // Limites da tela
        this.x = Math.max(0, Math.min(gameData.canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(gameData.canvas.height - this.height, this.y));
        
        // Ataque automático
        this.autoShoot();
    }
    
    autoShoot() {
        if (!this.active || !this.player) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastShot < this.fireRate) return;
        
        this.lastShot = currentTime;
        const fireballSpeed = 2 + (upgrades.bulletSpeed.level * 2);
        const fireballSize = 9;
        // Dano = 60% do dano do player (firepower base é 10, então 10 * firepower * 0.6)
        const damage = Math.floor(10 * gameStats.firepower * 0.6);
        
        // Tiro reto para cima
        gameEntities.fireballs.push({
            x: this.x + this.width / 2 - fireballSize / 2,
            y: this.y - 10,
            width: fireballSize,
            height: fireballSize,
            speed: fireballSpeed,
            damage: damage,
            type: 'player',
            color: '#FFA500'
        });
        
        // Efeito visual de disparo
        this.flashEffect = 5;
    }
    
    draw() {
        if (!this.active) {
            console.warn('⚠️ Dragão escolta não está ativo');
            return;
        }
        
        if (!gameData || !gameData.ctx) {
            console.error('❌ gameData.ctx não disponível');
            return;
        }
        
        const ctx = gameData.ctx;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.save();
        
        // ===== ASAS =====
        this.drawWings(ctx, centerX, centerY);
        
        // ===== CORPO =====
        this.drawBody(ctx, centerX, centerY);
        
        // ===== CABEÇA =====
        this.drawHead(ctx, centerX, centerY);
        
        // ===== CAUDA =====
        this.drawTail(ctx, centerX, centerY);
        
        // Efeito de flash ao atirar
        if (this.flashEffect && this.flashEffect > 0) {
            ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(centerX, centerY - 10, 20, 0, Math.PI * 2);
            ctx.fill();
            this.flashEffect--;
        }
        
        ctx.restore();
    }
    
    drawWings(ctx, centerX, centerY) {
        const wingFlap = Math.sin(this.wingAnimation) * 10;
        const wingExtend = Math.abs(Math.sin(this.wingAnimation)) * 8;
        
        ctx.fillStyle = '#FF4500';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF4500';
        
        if (this.side === 'left') {
            // Asa esquerda
            ctx.beginPath();
            ctx.moveTo(centerX - 5, centerY);
            ctx.quadraticCurveTo(centerX - 18 - wingExtend, centerY - 8 + wingFlap, centerX - 25 - wingExtend, centerY + 3 + wingFlap);
            ctx.quadraticCurveTo(centerX - 20 - wingExtend, centerY + 10 + wingFlap, centerX - 8, centerY + 12);
            ctx.closePath();
            ctx.fill();
            
            // Detalhes da asa
            ctx.fillStyle = '#FF6B35';
            ctx.beginPath();
            ctx.moveTo(centerX - 8, centerY + 2);
            ctx.quadraticCurveTo(centerX - 15 - wingExtend * 0.6, centerY - 3 + wingFlap * 0.7, centerX - 18 - wingExtend * 0.6, centerY + 5 + wingFlap * 0.7);
            ctx.quadraticCurveTo(centerX - 15, centerY + 8, centerX - 10, centerY + 8);
            ctx.closePath();
            ctx.fill();
        } else {
            // Asa direita
            ctx.beginPath();
            ctx.moveTo(centerX + 5, centerY);
            ctx.quadraticCurveTo(centerX + 18 + wingExtend, centerY - 8 + wingFlap, centerX + 25 + wingExtend, centerY + 3 + wingFlap);
            ctx.quadraticCurveTo(centerX + 20 + wingExtend, centerY + 10 + wingFlap, centerX + 8, centerY + 12);
            ctx.closePath();
            ctx.fill();
            
            // Detalhes da asa
            ctx.fillStyle = '#FF6B35';
            ctx.beginPath();
            ctx.moveTo(centerX + 8, centerY + 2);
            ctx.quadraticCurveTo(centerX + 15 + wingExtend * 0.6, centerY - 3 + wingFlap * 0.7, centerX + 18 + wingExtend * 0.6, centerY + 5 + wingFlap * 0.7);
            ctx.quadraticCurveTo(centerX + 15, centerY + 8, centerX + 10, centerY + 8);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
    }
    
    drawBody(ctx, centerX, centerY) {
        // Corpo principal com gradiente
        const bodyGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 18);
        bodyGradient.addColorStop(0, '#FF8C00');
        bodyGradient.addColorStop(0.7, '#FF6B35');
        bodyGradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = bodyGradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 15, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Barriga
        ctx.fillStyle = '#FFB366';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 3, 11, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Escamas
        ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.beginPath();
                ctx.arc(centerX - 6 + j * 12, centerY - 4 + i * 8, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    drawHead(ctx, centerX, centerY) {
        const headY = centerY - 15;
        
        // Pescoço
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(centerX - 5, centerY - 8, 10, 8);
        
        // Cabeça
        ctx.fillStyle = '#FF6B35';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF6B35';
        ctx.beginPath();
        ctx.ellipse(centerX, headY, 11, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Focinho
        ctx.fillStyle = '#FF8C00';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(centerX, headY - 5, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Chifres pequenos
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(centerX - 6, headY - 3);
        ctx.lineTo(centerX - 9, headY - 10);
        ctx.lineTo(centerX - 5, headY - 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 6, headY - 3);
        ctx.lineTo(centerX + 9, headY - 10);
        ctx.lineTo(centerX + 5, headY - 4);
        ctx.closePath();
        ctx.fill();
        
        // Olhos
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX - 4, headY - 1, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 4, headY - 1, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilas
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 4, headY - 1, 1.5, 0, Math.PI * 2);
        ctx.arc(centerX + 4, headY - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Reflexo
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(centerX - 3.5, headY - 1.5, 0.8, 0, Math.PI * 2);
        ctx.arc(centerX + 4.5, headY - 1.5, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawTail(ctx, centerX, centerY) {
        const tailSway = Math.sin(this.bobOffset * 1.5) * 5;
        
        ctx.fillStyle = '#FF6B35';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#FF6B35';
        
        // Segmentos da cauda
        ctx.fillRect(centerX - 4 + tailSway * 0.3, centerY + 16, 8, 8);
        ctx.fillRect(centerX - 3 + tailSway * 0.6, centerY + 23, 6, 6);
        
        // Chama na ponta
        ctx.fillStyle = '#FF0000';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(centerX + tailSway, centerY + 29);
        ctx.lineTo(centerX - 3 + tailSway, centerY + 34);
        ctx.lineTo(centerX + tailSway, centerY + 36);
        ctx.lineTo(centerX + 3 + tailSway, centerY + 34);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(centerX + tailSway, centerY + 30);
        ctx.lineTo(centerX - 2 + tailSway, centerY + 33);
        ctx.lineTo(centerX + tailSway, centerY + 34);
        ctx.lineTo(centerX + 2 + tailSway, centerY + 33);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

// ===== GERENCIADOR DE ESCOLTA =====
const escortManager = {
    escorts: [],
    maxEscorts: 2,
    initialized: false,
    
    init() {
        this.escorts = [];
        this.initialized = true;
        console.log('🐉 Escort Manager Inicializado');
    },
    
    activate() {
        console.log('🐉 Tentando ativar dragões escolta...');
        console.log('🐉 dragon disponível:', typeof dragon !== 'undefined' && dragon !== null);
        
        // Verificar se dragon existe
        if (typeof dragon === 'undefined' || dragon === null) {
            console.error('❌ ERRO: Objeto dragon não encontrado!');
            setTimeout(() => this.activate(), 100);
            return;
        }
        
        // Limpar escorts existentes
        this.escorts.forEach(e => e.active = false);
        this.escorts = [];
        
        // Criar novos escorts com validação
        try {
            const leftEscort = new DragaoEscolta('left', dragon);
            const rightEscort = new DragaoEscolta('right', dragon);
            
            if (leftEscort.active && rightEscort.active) {
                this.escorts.push(leftEscort);
                this.escorts.push(rightEscort);
                console.log(`✅ ${this.escorts.length} dragões escolta criados com sucesso!`);
                
                // Mostrar notificação se UI estiver disponível
                if (typeof ui !== 'undefined' && ui.showNotification) {
                    ui.showNotification('🐉 Dragões Escolta Ativados!');
                }
                
                // Salvar no localStorage
                localStorage.setItem('escortsActive', 'true');
            } else {
                console.error('❌ Falha ao criar dragões escolta - não estão ativos');
            }
        } catch (error) {
            console.error('❌ Erro ao criar dragões escolta:', error);
        }
    },
    
    deactivate() {
        this.escorts.forEach(escort => escort.active = false);
        this.escorts = [];
        localStorage.setItem('escortsActive', 'false');
        console.log('❌ Dragões escolta desativados');
    },
    
    updateAll() {
        if (!this.initialized) this.init();
        this.escorts.forEach(escort => escort.update());
    },
    
    drawAll() {
        if (!this.initialized) return;
        this.escorts.forEach(escort => escort.draw());
    },
    
    isActive() {
        return this.escorts.length > 0 && this.escorts.some(e => e.active);
    },
    
    // Verificar e restaurar estado ao carregar
    checkAndRestore() {
        const wasActive = localStorage.getItem('escortsActive') === 'true';
        const upgradeLevel = parseInt(localStorage.getItem('upgradeEscorts')) || 0;
        
        if (wasActive && upgradeLevel > 0) {
            console.log('🔄 Restaurando dragões escolta...');
            this.activate();
        }
    }
};

// ===== INTEGRAÇÃO COM SISTEMA DE UPGRADES =====
// O upgrade 'escorts' agora está definido em data.js
// Aqui apenas garantimos que os métodos apply/onActivate funcionem
if (typeof upgrades !== 'undefined' && upgrades.escorts) {
    // Adicionar método apply ao upgrade existente
    upgrades.escorts.apply = function() {
        console.log('🛒 Upgrade de Escolta aplicado!');
        // Ativar os dragões escolta
        setTimeout(() => {
            if (typeof escortManager !== 'undefined') {
                escortManager.activate();
                console.log('✅ Escorts ativados via apply()!');
            }
        }, 100);
    };
    
    // Método alternativo
    upgrades.escorts.onActivate = function() {
        console.log('🔥 onActivate chamado!');
        escortManager.activate();
    };
    
    console.log('✅ Métodos de ativação adicionados ao upgrade escorts');
}

// ===== INICIALIZAÇÃO =====
// 🔧 BUGFIX: NÃO inicializar aqui via DOMContentLoaded — integration.js já
// chama escortManager.init() dentro de gameIntegration.init() (que roda no
// próprio DOMContentLoaded). Ter os dois ouvindo o mesmo evento é uma corrida:
// o segundo a rodar sempre apagava o que o primeiro (este bloco) tivesse
// restaurado via checkAndRestore(), tornando checkAndRestore() morto na
// prática. escortManager.init() continua exportado e é chamado normalmente
// por integration.js e pelo game.reset() sobrescrito.

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.escortManager = escortManager;
    window.DragaoEscolta = DragaoEscolta;
}

console.log('🐉 Sistema de Dragões Escolta carregado!');
