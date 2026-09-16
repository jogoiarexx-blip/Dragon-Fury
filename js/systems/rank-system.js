// ===== SISTEMA DE RANK - DRAGON FURY =====

const rankSystem = {
    // Dados de performance da fase atual
    currentRun: {
        damageReceived: 0,
        shotsTotal: 0,
        shotsHit: 0,
        maxCombo: 0,
        timeStarted: 0,
        enemiesKilled: 0,
        powerUpsCollected: 0
    },
    
    // Iniciar tracking da fase
    startPhase() {
        this.currentRun = {
            damageReceived: 0,
            shotsTotal: 0,
            shotsHit: 0,
            maxCombo: 0,
            timeStarted: Date.now(),
            enemiesKilled: 0,
            powerUpsCollected: 0
        };
    },
    
    // Registrar disparo
    registerShot(hit = false) {
        this.currentRun.shotsTotal++;
        if (hit) this.currentRun.shotsHit++;
    },
    
    // Registrar dano recebido
    registerDamage(amount) {
        this.currentRun.damageReceived += amount;
    },
    
    // Registrar kill
    registerKill() {
        this.currentRun.enemiesKilled++;
        // Atualizar combo máximo
        if (gameData.comboCount > this.currentRun.maxCombo) {
            this.currentRun.maxCombo = gameData.comboCount;
        }
    },
    
    // Registrar power-up coletado
    registerPowerUp() {
        this.currentRun.powerUpsCollected++;
    },
    
    // Inicializar/resetar tracking (usado por integration.js)
    init() {
        this.startPhase();
    },
    
    // Rank em tempo real, para exibir na HUD durante a partida
    getCurrentRank() {
        return {
            letter: this.calculateRank()
        };
    },
    
    // Rank final da fase, com bônus de moedas (usado ao completar a fase)
    getFinalRank() {
        const letter = this.calculateRank();
        return {
            letter,
            bonus: this.getRankBonus(letter),
            color: this.getRankColor(letter),
            description: this.getRankDescription(letter),
            stats: this.getStats()
        };
    },
    
    // Calcular rank baseado em performance
    calculateRank() {
        let score = 0;
        
        // 1. PRECISÃO DE TIRO (até 30 pontos)
        const accuracy = this.currentRun.shotsTotal > 0 
            ? (this.currentRun.shotsHit / this.currentRun.shotsTotal) * 100 
            : 0;
        
        if (accuracy >= 80) score += 30;
        else if (accuracy >= 60) score += 25;
        else if (accuracy >= 40) score += 20;
        else if (accuracy >= 20) score += 15;
        else score += 10;
        
        // 2. DANO RECEBIDO (até 25 pontos)
        const maxHealth = 100 + (upgrades.health.level * 20);
        const damagePercent = maxHealth > 0 ? (this.currentRun.damageReceived / maxHealth) * 100 : 0;
        
        if (damagePercent <= 10) score += 25; // Quase sem dano
        else if (damagePercent <= 30) score += 20;
        else if (damagePercent <= 50) score += 15;
        else if (damagePercent <= 70) score += 10;
        else score += 5;
        
        // 3. COMBO MÁXIMO (até 25 pontos)
        if (this.currentRun.maxCombo >= 20) score += 25;
        else if (this.currentRun.maxCombo >= 15) score += 20;
        else if (this.currentRun.maxCombo >= 10) score += 15;
        else if (this.currentRun.maxCombo >= 5) score += 10;
        else score += 5;
        
        // 4. TEMPO DE CONCLUSÃO (até 20 pontos)
        const timeElapsed = (Date.now() - this.currentRun.timeStarted) / 1000; // em segundos
        const targetTime = 120; // 2 minutos como alvo
        
        if (timeElapsed <= targetTime * 0.5) score += 20; // Muito rápido
        else if (timeElapsed <= targetTime) score += 15;
        else if (timeElapsed <= targetTime * 1.5) score += 10;
        else score += 5;
        
        // 5. PODER-UPS COLETADOS (até 10 pontos bônus)
        score += Math.min(this.currentRun.powerUpsCollected * 2, 10);
        
        // Total máximo: 110 pontos
        
        // Converter pontuação em rank
        return this.scoreToRank(score);
    },
    
    scoreToRank(score) {
        if (score >= 95) return 'SS';  // Perfeito
        if (score >= 85) return 'S';   // Excelente
        if (score >= 75) return 'A';   // Ótimo
        if (score >= 65) return 'B';   // Bom
        if (score >= 50) return 'C';   // Médio
        return 'D';                     // Precisa melhorar
    },
    
    // Calcular bônus de moedas baseado no rank
    getRankBonus(rank) {
        const bonuses = {
            'SS': 500,
            'S': 300,
            'A': 200,
            'B': 150,
            'C': 100,
            'D': 50
        };
        return bonuses[rank] || 50;
    },
    
    // Obter cor do rank para UI
    getRankColor(rank) {
        const colors = {
            'SS': '#FFD700', // Dourado
            'S': '#FF6B35',  // Laranja
            'A': '#00FF00',  // Verde
            'B': '#00CED1',  // Ciano
            'C': '#9370DB',  // Roxo
            'D': '#808080'   // Cinza
        };
        return colors[rank] || '#FFFFFF';
    },
    
    // Obter descrição do rank
    getRankDescription(rank) {
        const descriptions = {
            'SS': '🏆 PERFEITO! Desempenho impecável!',
            'S': '⭐ EXCELENTE! Habilidade impressionante!',
            'A': '✨ ÓTIMO! Performance sólida!',
            'B': '👍 BOM! Continue melhorando!',
            'C': '📊 MÉDIO! Pratique mais!',
            'D': '💪 Continue tentando!'
        };
        return descriptions[rank] || '';
    },
    
    // Obter estatísticas detalhadas
    getStats() {
        const accuracy = this.currentRun.shotsTotal > 0 
            ? ((this.currentRun.shotsHit / this.currentRun.shotsTotal) * 100).toFixed(1)
            : 0;
        
        const timeElapsed = Math.floor((Date.now() - this.currentRun.timeStarted) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        return {
            accuracy: accuracy,
            damageReceived: this.currentRun.damageReceived,
            maxCombo: this.currentRun.maxCombo,
            timeFormatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            enemiesKilled: this.currentRun.enemiesKilled,
            powerUpsCollected: this.currentRun.powerUpsCollected
        };
    }
};

// ===== INTEGRAÇÃO COM UI =====

// Adicionar ao final de showStageComplete no ui.js
function updateStageCompleteWithRank() {
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
    
    // Adicionar descrição do rank
    const rankDisplay = document.getElementById('rank-display');
    if (rankDisplay && !document.getElementById('rank-description')) {
        const descElement = document.createElement('p');
        descElement.id = 'rank-description';
        descElement.style.cssText = `color: ${color}; font-size: 18px; margin-top: 10px;`;
        descElement.textContent = description;
        rankDisplay.appendChild(descElement);
    }
    
    // Adicionar estatísticas detalhadas
    if (rankDisplay && !document.getElementById('rank-stats')) {
        const statsElement = document.createElement('div');
        statsElement.id = 'rank-stats';
        statsElement.style.cssText = 'margin-top: 20px; font-size: 14px; color: #CCCCCC; text-align: left;';
        statsElement.innerHTML = `
            <h4 style="color: #FFD700; margin-bottom: 10px;">📊 Estatísticas:</h4>
            <p>🎯 Precisão: ${stats.accuracy}%</p>
            <p>💔 Dano Recebido: ${stats.damageReceived}</p>
            <p>🔥 Combo Máximo: ${stats.maxCombo}x</p>
            <p>⏱️ Tempo: ${stats.timeFormatted}</p>
            <p>⚡ Power-ups: ${stats.powerUpsCollected}</p>
        `;
        rankDisplay.appendChild(statsElement);
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
        document.getElementById('max-rank-display').textContent = rank;
    }
}
