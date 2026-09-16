// ===== GERENCIADOR DE INTERFACE =====
// 🔧 VERSÃO CORRIGIDA - Limpeza de timers melhorada

const ui = {
    
    notifications: [],
    maxNotifications: 5,
    
    updateHUD() {
        document.getElementById('coins').textContent = gameStats.coins;
        document.getElementById('score').textContent = gameStats.score;
        document.getElementById('health').textContent = Math.max(0, gameStats.health);
        document.getElementById('firepower').textContent = gameStats.firepower;
    },
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Posicionar baseado em notificações existentes
        const offset = this.notifications.length * 60;
        notification.style.position = 'fixed';
        notification.style.top = `${20 + offset}px`;
        notification.style.right = '20px';
        notification.style.transition = 'all 0.3s ease';
        
        document.body.appendChild(notification);
        this.notifications.push(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remover após 2.5 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                notification.remove();
                this.notifications = this.notifications.filter(n => n !== notification);
                
                // Reposicionar notificações restantes
                this.repositionNotifications();
            }, 300);
        }, 2500);
        
        // Remover notificações antigas se exceder limite
        if (this.notifications.length > this.maxNotifications) {
            const oldest = this.notifications.shift();
            if (oldest && oldest.parentNode) {
                oldest.style.opacity = '0';
                setTimeout(() => oldest.remove(), 300);
            }
        }
    },
    
    repositionNotifications() {
        this.notifications.forEach((notif, index) => {
            if (notif && notif.style) {
                notif.style.top = `${20 + index * 60}px`;
            }
        });
    },
    
    showAchievements() {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('achievements-panel').style.display = 'block';
        this.renderAchievements();
    },
    
    closeAchievements() {
        document.getElementById('achievements-panel').style.display = 'none';
        if (gameData.gameState === 'menu') {
            document.getElementById('main-menu').style.display = 'block';
        } else if (gameData.gameState === 'paused') {
            document.getElementById('pause-menu').style.display = 'block';
        }
    },
    
    renderAchievements() {
        const list = document.getElementById('achievements-list');
        list.innerHTML = '';
        
        const progress = achievementManager.getProgress();
        const progressDiv = document.createElement('div');
        progressDiv.style.cssText = 'text-align: center; margin-bottom: 20px; font-size: 18px; color: #FFD700;';
        progressDiv.innerHTML = `Progresso: ${progress.unlocked}/${progress.total} (${progress.percentage}%)`;
        list.appendChild(progressDiv);
        
        achievements.forEach(ach => {
            const div = document.createElement('div');
            div.className = `achievement ${ach.unlocked ? 'unlocked' : ''}`;
            div.innerHTML = `
                <div class="achievement-icon">${ach.unlocked ? ach.icon : '🔒'}</div>
                <div class="achievement-info">
                    <h3>${ach.name}</h3>
                    <p>${ach.description}</p>
                </div>
            `;
            list.appendChild(div);
        });
    },
    
    showUpgrades() {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('upgrades-panel').style.display = 'block';
        this.renderUpgrades();
    },
    
    showUpgradesFromPause() {
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('upgrades-panel').style.display = 'block';
        this.renderUpgrades();
    },
    
    // ✨ NOVO: abrir upgrades a partir do seletor de fase (tela de fase
    // completa), permitindo gastar as moedas ganhas antes de continuar.
    showUpgradesFromStageComplete() {
        document.getElementById('stage-complete').style.display = 'none';
        document.getElementById('upgrades-panel').style.display = 'block';
        this.renderUpgrades();
    },
    
    closeUpgrades() {
        document.getElementById('upgrades-panel').style.display = 'none';
        if (gameData.gameState === 'menu') {
            document.getElementById('main-menu').style.display = 'block';
        } else if (gameData.gameState === 'paused') {
            document.getElementById('pause-menu').style.display = 'block';
        } else if (gameData.gameState === 'stage_complete') {
            // Voltar para o seletor de fase (pontuação/rank já calculados)
            document.getElementById('stage-complete').style.display = 'block';
        }
    },
    
    renderUpgrades() {
        const list = document.getElementById('upgrades-list');
        list.innerHTML = '';
        
        const totalDiv = document.createElement('div');
        totalDiv.style.cssText = 'text-align: center; margin-bottom: 20px; font-size: 18px; color: #FFD700;';
        totalDiv.innerHTML = `💰 Moedas Disponíveis: ${gameStats.coins}<br>
                             📊 Total Investido: ${upgradeManager.getTotalInvested()} moedas`;
        list.appendChild(totalDiv);
        
        for (const [key, upgrade] of Object.entries(upgrades)) {
            const cost = upgradeManager.getCost(key);
            const canAfford = upgradeManager.canAfford(key);
            const maxed = upgradeManager.isMaxed(key);
            
            const div = document.createElement('div');
            div.className = 'upgrade-item';
            div.innerHTML = `
                <h3>${upgrade.icon} ${upgrade.name}</h3>
                <p>${upgrade.description}</p>
                <div class="upgrade-level">Nível: ${upgrade.level}/${upgrade.maxLevel} ${upgradeManager.getBonus(key)}</div>
                ${!maxed ? `<div class="upgrade-cost">💰 Custo: ${cost} moedas</div>` : 
                           '<div class="upgrade-cost">✅ MAXIMIZADO</div>'}
                <button class="upgrade-button" 
                        onclick="upgradeManager.buy('${key}')" 
                        ${!canAfford || maxed ? 'disabled' : ''}>
                    ${maxed ? '✅ Maximizado' : (canAfford ? '🛒 Comprar' : '❌ Moedas Insuficientes')}
                </button>
            `;
            list.appendChild(div);
        }
    },
    
    showInstructions() {
        const instructions = `
🐉 DRAGON FURY - SHOOT 'EM UP COM FASES

🎮 CONTROLES:
━━━━━━━━━━━━━━━━━━━━━━
⬅️ A / ← - Mover para esquerda
➡️ D / → - Mover para direita  
⬆️ W / ↑ - Mover para cima
⬇️ S / ↓ - Mover para baixo
🔥 F / Espaço - Atirar (segurar para automático)
⏸️ ESC - Pausar jogo

🎯 OBJETIVO:
━━━━━━━━━━━━━━━━━━━━━━
Complete 5 fases épicas destruindo inimigos!
• Derrote inimigos de diferentes tipos 👾
• Colete moedas e power-ups 💰
• Complete objetivos de cada fase 🎯
• Derrote o boss no final de cada fase 👑

🏆 SISTEMA DE FASES:
━━━━━━━━━━━━━━━━━━━━━━
Fase 1: Céu Sereno - Derrote 20 inimigos
Fase 2: Tempestade Iminente - Derrote 30 inimigos
Fase 3: Fúria Ardente - Derrote 40 inimigos
Fase 4: Abismo Sombrio - Derrote 50 inimigos
Fase 5: Invasão Cósmica - Derrote 60 inimigos

💥 TIPOS DE INIMIGOS:
━━━━━━━━━━━━━━━━━━━━━━
🔴 Básico - Inimigo padrão
🟠 Rápido - Move-se rapidamente
⚫ Tanque - Muita vida, lento
🟣 Atirador - Dispara projéteis

⚡ POWER-UPS:
━━━━━━━━━━━━━━━━━━━━━━
❤️ Vida - Recupera +30 HP
⚡ Tiro Rápido - Disparo automático ultra rápido
🛡️ Escudo - Invulnerabilidade temporária
💣 Bomba - Limpa todos os inimigos da tela

🎖️ SISTEMA DE UPGRADES:
━━━━━━━━━━━━━━━━━━━━━━
🔥 Poder do Fogo - Mais dano e taxa de disparo
❤️ Vida Máxima - Aumenta HP máximo
⚡ Velocidade - Move-se mais rápido
🎯 Tiro Múltiplo - Dispara vários projéteis
🛡️ Escudo - Reduz dano recebido

⚠️ DICAS ESTRATÉGICAS:
━━━━━━━━━━━━━━━━━━━━━━
• Cada fase fica progressivamente mais difícil!
• Você ganha cura parcial entre fases
• Priorize inimigos atiradores!
• Colete moedas para upgrades poderosos
• Bosses de fase são mais fortes que bosses normais
• Complete todas as 5 fases para a vitória final!
        `;
        alert(instructions);
    },
    
    showGameOver() {
        document.getElementById('final-stage').textContent = gameData.currentStage;
        document.getElementById('final-score').textContent = gameStats.score;
        document.getElementById('final-coins').textContent = gameStats.coins;
        document.getElementById('final-distance').textContent = Math.floor(gameData.distanceTraveled);
        
        // 🔧 ADICIONAL: Mostrar rank no game over também
        if (typeof rankSystem !== 'undefined') {
            const rank = rankSystem.calculateRank();
            const rankElement = document.getElementById('gameover-rank');
            if (rankElement) {
                rankElement.textContent = rank;
            }
        }
        
        document.getElementById('game-over').style.display = 'block';
    },
    
    hideGameOver() {
        console.log('🔄 Escondendo tela de Game Over...');
        document.getElementById('game-over').style.display = 'none';
    },
    
    showPauseMenu() {
        document.getElementById('pause-menu').style.display = 'block';
    },
    
    hidePauseMenu() {
        document.getElementById('pause-menu').style.display = 'none';
    },
    
    showStageComplete() {
        console.log('🎉 Mostrando tela de Stage Complete...');
        
        // 🔧 BUGFIX: usar phaseSystem.phases (fonte única de verdade, 5 fases)
        // em vez de stages[] (data.js, só tinha 5 fases e travava/crashava
        // ao chegar na Fase 6 porque stages[6] não existia).
        const stage = phaseSystem.phases[gameData.currentStage];
        document.getElementById('stage-complete-title').textContent = `Fase ${gameData.currentStage} Completa!`;
        document.getElementById('stage-complete-name').textContent = stage.name;
        document.getElementById('stage-complete-score').textContent = gameStats.score;
        document.getElementById('stage-complete-coins').textContent = gameStats.coins;
        
        // ===== CALCULAR E EXIBIR RANK =====
        if (typeof rankSystem !== 'undefined') {
            const rank = rankSystem.calculateRank();
            const bonus = rankSystem.getRankBonus(rank);
            const color = rankSystem.getRankColor(rank);
            const description = rankSystem.getRankDescription(rank);
            const stats = rankSystem.getStats();
            
            // Atualizar rank display
            const rankElement = document.getElementById('final-rank');
            if (rankElement) {
                rankElement.textContent = rank;
                rankElement.style.color = color;
                rankElement.style.textShadow = `0 0 10px ${color}`;
                rankElement.style.fontSize = '48px';
            }
            
            // Atualizar bônus
            const bonusElement = document.getElementById('rank-bonus');
            if (bonusElement) {
                bonusElement.textContent = bonus;
            }
            
            // Adicionar descrição do rank (se não existe)
            const rankDisplay = document.getElementById('rank-display');
            let descElement = document.getElementById('rank-description');
            if (rankDisplay && !descElement) {
                descElement = document.createElement('p');
                descElement.id = 'rank-description';
                rankDisplay.appendChild(descElement);
            }
            if (descElement) {
                descElement.style.cssText = `color: ${color}; font-size: 18px; margin-top: 10px;`;
                descElement.textContent = description;
            }
            
            // Adicionar/atualizar estatísticas detalhadas
            let statsElement = document.getElementById('rank-stats');
            if (rankDisplay && !statsElement) {
                statsElement = document.createElement('div');
                statsElement.id = 'rank-stats';
                rankDisplay.appendChild(statsElement);
            }
            if (statsElement) {
                statsElement.style.cssText = 'margin-top: 20px; font-size: 14px; color: #CCCCCC; text-align: left;';
                statsElement.innerHTML = `
                    <h4 style="color: #FFD700; margin-bottom: 10px;">📊 Estatísticas:</h4>
                    <p>🎯 Precisão: ${stats.accuracy}%</p>
                    <p>💔 Dano Recebido: ${stats.damageReceived}</p>
                    <p>🔥 Combo Máximo: ${stats.maxCombo}x</p>
                    <p>⏱️ Tempo: ${stats.timeFormatted}</p>
                    <p>⚡ Power-ups: ${stats.powerUpsCollected}</p>
                `;
            }
            
            // Dar as moedas de bônus
            gameStats.coins += bonus;
            gameStats.totalCoins += bonus;
            localStorage.setItem('dragonCoins', gameStats.coins);
            localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
            
            // Atualizar rank máximo
            const rankValues = { 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5, 'SS': 6 };
            const currentRankValue = rankValues[rank] || 1;
            const maxRankValue = rankValues[localStorage.getItem('maxRank') || 'C'] || 2;
            
            if (currentRankValue > maxRankValue) {
                localStorage.setItem('maxRank', rank);
                const maxRankDisplay = document.getElementById('max-rank-display');
                if (maxRankDisplay) {
                    maxRankDisplay.textContent = rank;
                }
            }
            
            // ✨ NOVO: salva as estrelas dessa fase (rank + ovo resgatado)
            // pro seletor de fases, e mostra o status do ovo nessa run.
            if (typeof phaseSelectSystem !== 'undefined') {
                const eggRescued = !!gameData.eggRescuedThisStage;
                const stars = phaseSelectSystem.saveResult(gameData.currentStage, rank, eggRescued);
                
                let eggElement = document.getElementById('rank-egg-status');
                if (rankDisplay && !eggElement) {
                    eggElement = document.createElement('p');
                    eggElement.id = 'rank-egg-status';
                    eggElement.style.cssText = 'margin-top: 12px; font-size: 16px;';
                    rankDisplay.appendChild(eggElement);
                }
                if (eggElement) {
                    eggElement.innerHTML = eggRescued
                        ? '🥚 Ovo resgatado! <span style="color:#FFD700;">' + phaseSelectSystem.starsToString(stars) + '</span>'
                        : '🥚 Ovo não resgatado — <span style="color:#FFD700;">' + phaseSelectSystem.starsToString(stars) + '</span>';
                }
            }
        }
        
        // ✨ NOVO: seletor de fase. Se essa era a última fase (fase máxima
        // implementada), o botão "Próxima Fase" vira "Ver Resultado Final"
        // (nextStage() já sabe chamar gameComplete() nesse caso). Repetir
        // fase e comprar upgrade continuam disponíveis normalmente.
        const nextBtn = document.getElementById('stage-complete-next-btn');
        if (nextBtn) {
            const isLastPhase = gameData.currentStage >= phaseSystem.maxPhases;
            nextBtn.textContent = isLastPhase ? '🏆 Ver Resultado Final' : '▶️ Próxima Fase';
        }
        
        const stageCompleteDiv = document.getElementById('stage-complete');
        stageCompleteDiv.style.display = 'block';
    },
    
    hideStageComplete() {
        console.log('🔄 Escondendo tela de Stage Complete...');
        document.getElementById('stage-complete').style.display = 'none';
    },
    
    showGameComplete() {
        document.getElementById('game-complete-score').textContent = gameStats.score;
        document.getElementById('game-complete-coins').textContent = gameStats.coins;
        
        // 🔧 ADICIONAL: Mostrar rank final
        if (typeof rankSystem !== 'undefined') {
            const rank = rankSystem.calculateRank();
            const rankElement = document.getElementById('game-complete-rank');
            if (rankElement) {
                rankElement.textContent = rank;
            }
        }
        
        document.getElementById('game-complete').style.display = 'block';
    },
    
    hideGameComplete() {
        document.getElementById('game-complete').style.display = 'none';
    }
};
