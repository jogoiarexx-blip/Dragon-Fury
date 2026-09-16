// ===== GERENCIADOR DE UPGRADES - VERSÃO CORRIGIDA =====

const upgradeManager = {
    
    getCost(upgradeKey) {
        const upgrade = upgrades[upgradeKey];
        return Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
    },
    
    canAfford(upgradeKey) {
        return gameStats.coins >= this.getCost(upgradeKey);
    },
    
    isMaxed(upgradeKey) {
        const upgrade = upgrades[upgradeKey];
        return upgrade.level >= upgrade.maxLevel;
    },
    
    buy(upgradeKey) {
        const upgrade = upgrades[upgradeKey];
        const cost = this.getCost(upgradeKey);
        
        if (this.canAfford(upgradeKey) && !this.isMaxed(upgradeKey)) {
            gameStats.coins -= cost;
            upgrade.level++;
            
            // Salvar no localStorage
            localStorage.setItem('dragonCoins', gameStats.coins);
            localStorage.setItem(`upgrade${upgradeKey.charAt(0).toUpperCase() + upgradeKey.slice(1)}`, 
                                upgrade.level);
            
            // ⭐ ATIVAÇÃO ESPECIAL PARA ESCORTS
            if (upgradeKey === 'escorts') {
                console.log('🐉 Ativando dragões escolta após compra!');
                
                // Dar um pequeno delay para garantir que tudo está carregado
                setTimeout(() => {
                    if (typeof escortManager !== 'undefined') {
                        escortManager.activate();
                        console.log('✅ Escorts ativados com sucesso!');
                    } else {
                        console.error('❌ escortManager não encontrado!');
                    }
                }, 100);
            }
            
            // ⭐ CHAMAR MÉTODOS DE ATIVAÇÃO SE EXISTIREM
            if (typeof upgrade.apply === 'function') {
                console.log(`📞 Chamando apply() para ${upgradeKey}`);
                upgrade.apply();
            }
            
            if (typeof upgrade.onActivate === 'function') {
                console.log(`📞 Chamando onActivate() para ${upgradeKey}`);
                upgrade.onActivate();
            }
            
            ui.updateHUD();
            ui.renderUpgrades();
            ui.showNotification(`⚡ ${upgrade.name} melhorado para nível ${upgrade.level}!`);
            achievementManager.check();
            
            return true;
        }
        
        return false;
    },
    
    getBonus(upgradeKey) {
        const upgrade = upgrades[upgradeKey];
        
        switch(upgradeKey) {
            case 'firepower':
                return `+${upgrade.level * 10} dano`;
            case 'health':
                return `+${upgrade.level * 20} HP`;
            case 'speed':
                return `+${(upgrade.level * 30).toFixed(0)}% velocidade`;
            case 'multishot':
                return `${upgrade.level + 1}x projéteis`;
            case 'bulletSpeed':
                return `+${upgrade.level * 2} vel. do tiro`;
            case 'shield':
                return `-${(upgrade.level * 15).toFixed(0)}% dano recebido`;
            case 'escorts':
                return upgrade.level > 0 ? '✅ Ativo' : '❌ Inativo';
            default:
                return '';
        }
    },
    
    getTotalInvested() {
        let total = 0;
        for (const [key, upgrade] of Object.entries(upgrades)) {
            for (let i = 0; i < upgrade.level; i++) {
                total += Math.floor(upgrade.baseCost * Math.pow(1.5, i));
            }
        }
        return total;
    }
};
