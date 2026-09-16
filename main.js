// ===== INICIALIZAÇÃO DO JOGO - DRAGON FURY =====

// Inicializar o jogo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    game.init();
    
    // Atualizar display da fase máxima no menu
    document.getElementById('max-stage-display').textContent = gameStats.maxStageReached;
    
    console.log('🐉 Dragon Fury carregado com sucesso!');
    console.log('📊 Estatísticas:', gameStats);
    console.log('⚡ Upgrades:', upgrades);
    console.log('🎮 Fase Máxima:', gameStats.maxStageReached);
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
        console.log(`✅ Adicionadas ${amount} moedas`);
    },
    
    unlockAllAchievements() {
        achievements.forEach(ach => {
            if (!ach.unlocked) {
                achievementManager.unlock(ach);
            }
        });
        console.log('✅ Todas as conquistas desbloqueadas');
    },
    
    maxAllUpgrades() {
        Object.keys(upgrades).forEach(key => {
            const upgrade = upgrades[key];
            upgrade.level = upgrade.maxLevel;
            localStorage.setItem(`upgrade${key.charAt(0).toUpperCase() + key.slice(1)}`, 
                                upgrade.level);
        });
        ui.renderUpgrades();
        console.log('✅ Todos os upgrades maximizados');
    },
    
    setStage(stage) {
        if (stage >= 1 && stage <= 5) {
            gameData.currentStage = stage;
            gameStats.maxStageReached = Math.max(gameStats.maxStageReached, stage);
            localStorage.setItem('dragonMaxStage', gameStats.maxStageReached);
            document.getElementById('max-stage-display').textContent = gameStats.maxStageReached;
            console.log(`✅ Fase definida para: ${stage}`);
        } else {
            console.log('❌ Fase inválida (1-5)');
        }
    },
    
    resetProgress() {
        if (confirm('⚠️ Tem certeza que deseja resetar todo o progresso?')) {
            localStorage.clear();
            location.reload();
            console.log('✅ Progresso resetado');
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

console.log('%c🐉 DRAGON FURY 🐉', 'font-size: 24px; color: #FF6B35; font-weight: bold;');
console.log('%cSistema de Fases Implementado!', 'font-size: 18px; color: #00FF00;');
console.log('%cComandos de Debug:', 'font-size: 16px; color: #FFD700;');
console.log('dragonGame.addCoins(amount) - Adicionar moedas');
console.log('dragonGame.unlockAllAchievements() - Desbloquear todas conquistas');
console.log('dragonGame.maxAllUpgrades() - Maximizar todos upgrades');
console.log('dragonGame.setStage(1-5) - Definir fase atual');
console.log('dragonGame.resetProgress() - Resetar progresso');
console.log('dragonGame.getStats() - Ver estatísticas');
console.log('%cBom jogo! 🎮🔥', 'font-size: 14px; color: #00FF00;');

}
