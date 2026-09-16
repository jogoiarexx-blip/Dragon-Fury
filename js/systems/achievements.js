// ===== GERENCIADOR DE CONQUISTAS =====

const achievementManager = {
    
    check() {
        achievements.forEach(ach => {
            if (!ach.unlocked && ach.check()) {
                this.unlock(ach);
            }
        });
        
        // Verificar conquista de voo perfeito
        const perfectFlight = achievements.find(a => a.id === 'perfect_flight');
        if (!perfectFlight.unlocked && 
            gameData.distanceTraveled - dragon.lastDamageDistance >= 200) {
            this.unlock(perfectFlight);
        }
    },
    
    unlock(achievement) {
        achievement.unlocked = true;
        localStorage.setItem(`ach_${achievement.id}`, 'true');
        ui.showNotification(`🏆 Conquista Desbloqueada: ${achievement.name}!`);
        
        // Recompensa por conquista
        gameStats.coins += 20;
        gameStats.totalCoins += 20;
        localStorage.setItem('dragonCoins', gameStats.coins);
        localStorage.setItem('dragonTotalCoins', gameStats.totalCoins);
        ui.updateHUD();
    },
    
    getProgress() {
        const unlocked = achievements.filter(a => a.unlocked).length;
        const total = achievements.length;
        return {
            unlocked,
            total,
            percentage: Math.floor((unlocked / total) * 100)
        };
    }
};