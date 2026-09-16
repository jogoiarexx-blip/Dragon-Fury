// ===== SISTEMA DE HUD - DRAGON FURY =====

const hudSystem = {
    bossWarningAlpha: 0,
    bossWarningDirection: 1,
    rankFlashTimer: 0,
    
    draw(ctx) {
        // Salvar estado do contexto
        ctx.save();
        
        // Desenhar todos os elementos do HUD
        this.drawBackground(ctx);
        this.drawHealthBar(ctx);
        this.drawScore(ctx);
        this.drawCoins(ctx);
        this.drawPhaseInfo(ctx);
        this.drawRank(ctx);
        this.drawPowerUpIndicator(ctx);
        
        // Avisos especiais
        if (phaseSystem.shouldSpawnBoss() && !gameData.bossActive) {
            this.drawBossWarning(ctx);
        }
        
        // Restaurar estado
        ctx.restore();
    },
    
    drawBackground(ctx) {
        // Fundo semi-transparente para o HUD
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, gameData.canvas.width, 100);
    },
    
    drawHealthBar(ctx) {
        const barX = 20;
        const barY = 20;
        const barWidth = 200;
        const barHeight = 20;
        const maxHealth = 100 + (upgrades.health.level * 20);
        const healthPercent = Math.max(0, gameStats.health / maxHealth);
        
        // Fundo da barra
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Barra de vida com gradiente
        const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth * healthPercent, 0);
        if (healthPercent > 0.5) {
            gradient.addColorStop(0, '#00FF00');
            gradient.addColorStop(1, '#00AA00');
        } else if (healthPercent > 0.25) {
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
        } else {
            gradient.addColorStop(0, '#FF0000');
            gradient.addColorStop(1, '#AA0000');
            
            // Piscar se vida crítica
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#FF0000';
            }
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        ctx.shadowBlur = 0;
        
        // Borda
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Texto da vida
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.max(0, Math.floor(gameStats.health))} / ${maxHealth}`, 
                     barX + barWidth / 2, barY + barHeight / 2 + 5);
        
        // Ícone
        ctx.font = '20px Arial';
        ctx.fillText('❤️', barX - 15, barY + barHeight / 2 + 7);
        
        ctx.textAlign = 'left';
    },
    
    drawScore(ctx) {
        const x = 20;
        const y = 55;
        
        // 🔧 BUGFIX (desempenho): estes textos são redesenhados TODO frame
        // (60x/s), sempre. shadowBlur é uma das operações mais caras do
        // Canvas 2D; num blur pequeno como este o ganho visual é quase
        // imperceptível, então trocamos por um contorno sólido de 1px
        // (muito mais barato) para manter a legibilidade sobre o fundo.
        ctx.fillStyle = '#000';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`🎯 ${gameStats.score.toLocaleString()}`, x + 1, y + 1);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`🎯 ${gameStats.score.toLocaleString()}`, x, y);
    },
    
    drawCoins(ctx) {
        const x = 20;
        const y = 80;
        
        // 🔧 BUGFIX (desempenho): ver comentário em drawScore()
        ctx.fillStyle = '#000';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`💰 ${gameStats.coins}`, x + 1, y + 1);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`💰 ${gameStats.coins}`, x, y);
    },
    
    drawPhaseInfo(ctx) {
        const phase = phaseSystem.getCurrentPhase();
        const progress = phaseSystem.getPhaseProgress();
        const x = gameData.canvas.width - 220;
        const y = 25;
        
        // Nome da fase
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000';
        
        ctx.fillText(`Fase ${phaseSystem.currentPhase}: ${phase.name}`, gameData.canvas.width - 20, y);
        
        // Barra de progresso
        const barX = gameData.canvas.width - 220;
        const barY = y + 10;
        const barWidth = 200;
        const barHeight = 15;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(barX, barY, barWidth * (progress.percentage / 100), barHeight);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Texto do progresso
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${progress.current}/${progress.target} (${progress.percentage}%)`, 
                     barX + barWidth / 2, barY + barHeight / 2 + 4);
        
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    },
    
    drawRank(ctx) {
        const rank = rankSystem.getCurrentRank();
        const x = gameData.canvas.width - 80;
        const y = 70;
        
        this.rankFlashTimer++;
        const flash = Math.sin(this.rankFlashTimer * 0.1) * 0.3 + 0.7;
        
        // Fundo do rank
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Borda colorida baseada no rank
        const rankColors = {
            'C': '#8B4513',
            'B': '#C0C0C0',
            'A': '#FFD700',
            'S': '#FF6B35',
            'SS': '#FF00FF'
        };
        
        ctx.strokeStyle = rankColors[rank.letter];
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = rankColors[rank.letter];
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.stroke();
        
        // Letra do rank
        ctx.fillStyle = rankColors[rank.letter];
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.globalAlpha = flash;
        ctx.fillText(rank.letter, x, y + 10);
        ctx.globalAlpha = 1;
        
        // Label
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('RANK', x, y + 50);
        
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    },
    
    drawPowerUpIndicator(ctx) {
        if (!gameStats.powerUpActive) return;
        
        const x = gameData.canvas.width / 2;
        const y = gameData.canvas.height - 40;
        const timeLeft = Math.ceil(gameStats.powerUpTimer / 60);
        
        // Fundo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 100, y - 20, 200, 35);
        
        // Borda
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 100, y - 20, 200, 35);
        
        // Texto
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00FF00';
        
        const powerUpNames = {
            'rapid_fire': '⚡ TIRO RÁPIDO',
            'shield': '🛡️ ESCUDO',
            'health': '❤️ VIDA+',
            'bomb': '💣 BOMBA'
        };
        
        ctx.fillText(`${powerUpNames[gameStats.powerUpActive]}: ${timeLeft}s`, x, y);
        
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    },
    
    drawBossWarning(ctx) {
        // Animação do aviso
        this.bossWarningAlpha += 0.02 * this.bossWarningDirection;
        if (this.bossWarningAlpha >= 1 || this.bossWarningAlpha <= 0) {
            this.bossWarningDirection *= -1;
        }
        
        ctx.globalAlpha = this.bossWarningAlpha;
        
        // Fundo vermelho piscando
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
        
        // Texto de aviso
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF0000';
        
        ctx.fillText('⚠️ BOSS APPROACHING ⚠️', 
                     gameData.canvas.width / 2, 
                     gameData.canvas.height / 2);
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    },
    
    // Mensagens temporárias no centro da tela
    drawCenterMessage(ctx, message, color = '#FFD700', duration = 60) {
        ctx.fillStyle = color;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#000';
        
        ctx.fillText(message, gameData.canvas.width / 2, gameData.canvas.height / 2);
        
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    }
};

// Sistema de Rank: ver rank-system.js (carregado antes deste arquivo).
// A duplicata de "const rankSystem" que existia aqui foi removida porque
// dois "const rankSystem" em <script> separados geram SyntaxError e
// quebravam a execução deste arquivo inteiro (inclusive o hudSystem acima).
