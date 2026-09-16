// ===== SELETOR DE FASES (COM ESTRELAS) - DRAGON FURY =====
// ✨ NOVO: tela de seleção de fase, no estilo "Fase 1, Fase 2..." com 0-3
// estrelas por fase, baseadas no rank obtido e em resgatar (ou não) o ovo
// daquela fase. Guardado no localStorage, então persiste entre sessões.

const phaseSelectSystem = {
    STORAGE_PREFIX: 'dragonPhaseStars_',
    
    // Converte rank (D..SS) + resgate do ovo em 1-3 estrelas.
    // 3 estrelas exige rank S/SS *e* ter resgatado o ovo daquela fase.
    calculateStars(rank, eggRescued) {
        const rankStars = { 'SS': 3, 'S': 3, 'A': 2, 'B': 2, 'C': 1, 'D': 1 }[rank] || 1;
        if (rankStars === 3 && !eggRescued) return 2;
        return rankStars;
    },
    
    // Salva o resultado da fase se for melhor que o recorde anterior
    saveResult(stage, rank, eggRescued) {
        const stars = this.calculateStars(rank, eggRescued);
        const current = this.getStars(stage);
        if (stars > current) {
            localStorage.setItem(this.STORAGE_PREFIX + stage, stars);
        }
        return stars;
    },
    
    getStars(stage) {
        return parseInt(localStorage.getItem(this.STORAGE_PREFIX + stage)) || 0;
    },
    
    starsToString(stars) {
        return '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    },
    
    // Renderiza os cards de fase dentro de #phase-select-list
    render() {
        const container = document.getElementById('phase-select-list');
        if (!container) return;
        
        container.innerHTML = '';
        const maxUnlocked = gameStats.maxStageReached;
        
        for (let stage = 1; stage <= phaseSystem.maxPhases; stage++) {
            const phaseData = phaseSystem.phases[stage];
            const unlocked = stage <= maxUnlocked;
            const stars = this.getStars(stage);
            
            const card = document.createElement('div');
            card.className = 'phase-select-card' + (unlocked ? '' : ' phase-select-card-locked');
            
            if (unlocked) {
                card.onclick = () => phaseSelectSystem.selectPhase(stage);
            }
            
            card.innerHTML = `
                <div class="phase-select-number">${unlocked ? stage : '🔒'}</div>
                <div class="phase-select-info">
                    <div class="phase-select-name">${unlocked ? phaseData.name : '???'}</div>
                    <div class="phase-select-stars">${unlocked ? this.starsToString(stars) : ''}</div>
                </div>
            `;
            
            container.appendChild(card);
        }
    },
    
    show() {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('phase-select-menu').style.display = 'block';
        this.render();
    },
    
    hide() {
        document.getElementById('phase-select-menu').style.display = 'none';
        document.getElementById('main-menu').style.display = 'block';
    },
    
    // Inicia o jogo direto na fase escolhida
    selectPhase(stage) {
        document.getElementById('phase-select-menu').style.display = 'none';
        game.startAtStage(stage);
    }
};
