// ===== INICIALIZAÇÃO DO JOGO - DRAGON FURY =====

// Inicializar o jogo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    game.init();
    
    // Atualizar display da fase máxima no menu
    document.getElementById('max-stage-display').textContent = gameStats.maxStageReached;
    
    debugLog('🐉 Dragon Fury carregado com sucesso!');
    debugLog('📊 Estatísticas:', gameStats);
    debugLog('⚡ Upgrades:', upgrades);
    debugLog('🎮 Fase Máxima:', gameStats.maxStageReached);
});

// Prevenir scroll da página com as teclas de seta
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

// Debug protegido: ative com ?debug=1 apenas durante desenvolvimento.
const DEBUG_MODE = new URLSearchParams(location.search).get('debug') === '1';
if (DEBUG_MODE) {

window.dragonGame = {
    gameData,
    gameStats,
    dragon,
    upgrades,
    achievements,
    stages,
    
    // Funções de debug
    addCoins(amount) {
        gameStats.coins += amount;
        gameStats.totalCoins += amount;
        localStorage.setItem('dragonCoins', gameStats.coins);
        localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
        ui.updateHUD();
        debugLog(`✅ Adicionadas ${amount} moedas`);
    },
    
    unlockAllAchievements() {
        achievements.forEach(ach => {
            if (!ach.unlocked) {
                achievementManager.unlock(ach);
            }
        });
        debugLog('✅ Todas as conquistas desbloqueadas');
    },
    
    maxAllUpgrades() {
        Object.keys(upgrades).forEach(key => {
            const upgrade = upgrades[key];
            upgrade.level = upgrade.maxLevel;
            localStorage.setItem(`upgrade${key.charAt(0).toUpperCase() + key.slice(1)}`, 
                                upgrade.level);
        });
        ui.renderUpgrades();
        debugLog('✅ Todos os upgrades maximizados');
    },
    
    setStage(stage) {
        if (stage >= 1 && stage <= 5) {
            gameData.currentStage = stage;
            gameStats.maxStageReached = Math.max(gameStats.maxStageReached, stage);
            localStorage.setItem('dragonMaxStage', gameStats.maxStageReached);
            document.getElementById('max-stage-display').textContent = gameStats.maxStageReached;
            debugLog(`✅ Fase definida para: ${stage}`);
        } else {
            debugLog('❌ Fase inválida (1-5)');
        }
    },
    
    resetProgress() {
        if (confirm('⚠️ Tem certeza que deseja resetar todo o progresso?')) {
            localStorage.clear();
            location.reload();
            debugLog('✅ Progresso resetado');
        }
    },
    
    getStats() {
        return {
            coins: gameStats.coins,
            totalCoins: gameStats.totalCoins,
            totalScore: gameStats.totalScore,
            gamesPlayed: gameStats.gamesPlayed,
            maxDistance: gameStats.maxDistance,
            maxStageReached: gameStats.maxStageReached,
            enemiesDefeated: localStorage.getItem('enemiesDefeated'),
            bossesDefeated: localStorage.getItem('bossesDefeated'),
            achievementsUnlocked: achievements.filter(a => a.unlocked).length,
            achievementsTotal: achievements.length,
            upgradesLevel: Object.entries(upgrades).map(([key, u]) => 
                `${u.name}: ${u.level}/${u.maxLevel}`
            )
        };
    }
};

debugLog('%c🐉 DRAGON FURY 🐉', 'font-size: 24px; color: #FF6B35; font-weight: bold;');
debugLog('%cSistema de Fases Implementado!', 'font-size: 18px; color: #00FF00;');
debugLog('%cComandos de Debug:', 'font-size: 16px; color: #FFD700;');
debugLog('dragonGame.addCoins(amount) - Adicionar moedas');
debugLog('dragonGame.unlockAllAchievements() - Desbloquear todas conquistas');
debugLog('dragonGame.maxAllUpgrades() - Maximizar todos upgrades');
debugLog('dragonGame.setStage(1-5) - Definir fase atual');
debugLog('dragonGame.resetProgress() - Resetar progresso');
debugLog('dragonGame.getStats() - Ver estatísticas');
debugLog('%cBom jogo! 🎮🔥', 'font-size: 14px; color: #00FF00;');

}
