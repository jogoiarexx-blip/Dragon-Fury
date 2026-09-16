// ===== SISTEMA DE SPAWN - DRAGON FURY =====

const spawnSystem = {
    spawnTimer: 0,
    enemyCount: 0,
    formationTimer: 0,
    wavePatterns: ['single', 'double', 'triple', 'formation'],
    
    init() {
        this.spawnTimer = 0;
        this.enemyCount = 0;
        this.formationTimer = 0;
    },
    
    update() {
        this.spawnTimer++;
        this.formationTimer++;
        
        const phase = phaseSystem.getCurrentPhase();
        const config = phase.spawnConfig;
        
        // Contar inimigos ativos
        this.enemyCount = gameEntities.enemies.length;
        
        // Não spawnar se boss estiver ativo
        if (gameData.bossActive) return;
        
        // Não spawnar se atingiu máximo
        if (this.enemyCount >= config.maxEnemies) return;
        
        // Spawn baseado na taxa da fase
        const adjustedRate = config.spawnRate * (1 / gameData.scrollSpeed);
        
        if (Math.random() < adjustedRate) {
            this.spawnWave(config);
        }
        
        // Formações especiais a cada 10 segundos
        if (this.formationTimer > 600) {
            this.spawnFormation(config);
            this.formationTimer = 0;
        }
    },
    
    spawnWave(config) {
        const pattern = this.wavePatterns[Math.floor(Math.random() * this.wavePatterns.length)];
        
        switch(pattern) {
            case 'single':
                this.spawnSingle(config);
                break;
            case 'double':
                this.spawnDouble(config);
                break;
            case 'triple':
                this.spawnTriple(config);
                break;
            case 'formation':
                this.spawnFormation(config);
                break;
        }
    },
    
    spawnSingle(config) {
        const enemyType = this.getRandomEnemyType(config.enemies);
        const x = Math.random() * (gameData.canvas.width - 50);
        
        this.createEnemy(enemyType, x, -50, config.difficultyMultiplier);
    },
    
    spawnDouble(config) {
        const enemyType = this.getRandomEnemyType(config.enemies);
        const spacing = 100;
        const startX = Math.random() * (gameData.canvas.width - spacing - 50);
        
        this.createEnemy(enemyType, startX, -50, config.difficultyMultiplier);
        this.createEnemy(enemyType, startX + spacing, -50, config.difficultyMultiplier);
    },
    
    spawnTriple(config) {
        const enemyType = this.getRandomEnemyType(config.enemies);
        const spacing = 80;
        const startX = Math.random() * (gameData.canvas.width - spacing * 2 - 50);
        
        for (let i = 0; i < 3; i++) {
            this.createEnemy(enemyType, startX + (spacing * i), -50 - (i * 30), config.difficultyMultiplier);
        }
    },
    
    spawnFormation(config) {
        const formations = ['v', 'line', 'circle', 'square'];
        const formation = formations[Math.floor(Math.random() * formations.length)];
        const enemyType = this.getRandomEnemyType(config.enemies);
        
        switch(formation) {
            case 'v':
                this.spawnVFormation(enemyType, config.difficultyMultiplier);
                break;
            case 'line':
                this.spawnLineFormation(enemyType, config.difficultyMultiplier);
                break;
            case 'circle':
                this.spawnCircleFormation(enemyType, config.difficultyMultiplier);
                break;
            case 'square':
                this.spawnSquareFormation(enemyType, config.difficultyMultiplier);
                break;
        }
    },
    
    spawnVFormation(enemyType, difficulty) {
        const centerX = gameData.canvas.width / 2;
        const spacing = 60;
        
        // Centro
        this.createEnemy(enemyType, centerX, -50, difficulty);
        
        // Laterais
        for (let i = 1; i <= 2; i++) {
            this.createEnemy(enemyType, centerX - (spacing * i), -50 - (i * 40), difficulty);
            this.createEnemy(enemyType, centerX + (spacing * i), -50 - (i * 40), difficulty);
        }
    },
    
    spawnLineFormation(enemyType, difficulty) {
        const count = 5;
        const spacing = (gameData.canvas.width - 100) / (count - 1);
        
        for (let i = 0; i < count; i++) {
            this.createEnemy(enemyType, 50 + (spacing * i), -50, difficulty);
        }
    },
    
    spawnCircleFormation(enemyType, difficulty) {
        const count = 6;
        const centerX = gameData.canvas.width / 2;
        const centerY = -100;
        const radius = 80;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            this.createEnemy(enemyType, x, y, difficulty);
        }
    },
    
    spawnSquareFormation(enemyType, difficulty) {
        const size = 3;
        const spacing = 70;
        const startX = (gameData.canvas.width - (spacing * (size - 1))) / 2;
        const startY = -50;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                this.createEnemy(enemyType, 
                               startX + (col * spacing), 
                               startY - (row * spacing), 
                               difficulty);
            }
        }
    },
    
    getRandomEnemyType(availableTypes) {
        return availableTypes[Math.floor(Math.random() * availableTypes.length)];
    },
    
    createEnemy(type, x, y, difficulty) {
        if (!window.EnemyClasses) {
            console.error('EnemyClasses não carregado!');
            return;
        }
        
        let enemy;
        
        switch(type) {
            case 'basic':
                // 🔧 BUGFIX CRÍTICO: estava instanciando window.EnemyClasses.BaseEnemy
                // (a classe abstrata/genérica, cujo draw() é só um
                // ctx.fillRect() — um quadrado liso, sem asas, sem olhos,
                // sem nenhum dos polígonos). O correto é BasicEnemy, a
                // subclasse com o visual completo (guerreiro voador
                // facetado). Por isso os inimigos "básicos" apareciam
                // como quadrados mesmo depois de eu ter desenhado os
                // polígonos — a classe certa nunca era usada.
                enemy = new window.EnemyClasses.BasicEnemy(x, y, {
                    width: 40,
                    height: 40,
                    health: 50 * difficulty,
                    speed: 2 * (difficulty * 0.5 + 0.5),
                    color: '#8B0000',
                    points: Math.floor(50 * difficulty),
                    type: 'basic'
                });
                break;
                
            case 'zigzag':
                enemy = new window.EnemyClasses.ZigZagEnemy(x, y);
                enemy.health *= difficulty;
                enemy.maxHealth = enemy.health;
                enemy.points = Math.floor(enemy.points * difficulty);
                break;
                
            case 'tank':
                enemy = new window.EnemyClasses.TankEnemy(x, y);
                enemy.health *= difficulty;
                enemy.maxHealth = enemy.health;
                enemy.points = Math.floor(enemy.points * difficulty);
                break;
                
            case 'sniper':
                enemy = new window.EnemyClasses.SniperEnemy(x, y);
                enemy.health *= difficulty;
                enemy.maxHealth = enemy.health;
                enemy.points = Math.floor(enemy.points * difficulty);
                break;
                
            case 'kamikaze':
                enemy = new window.EnemyClasses.KamikazeEnemy(x, y);
                enemy.health *= difficulty;
                enemy.maxHealth = enemy.health;
                enemy.points = Math.floor(enemy.points * difficulty);
                break;
                
            case 'parasite':
                enemy = new window.EnemyClasses.ParasiteEnemy(x, y);
                enemy.health *= difficulty;
                enemy.maxHealth = enemy.health;
                enemy.points = Math.floor(enemy.points * difficulty);
                break;
                
            case 'summoner':
                enemy = new window.EnemyClasses.SummonerEnemy(x, y);
                enemy.health *= difficulty;
                enemy.maxHealth = enemy.health;
                enemy.points = Math.floor(enemy.points * difficulty);
                break;
                
            default:
                console.warn('Tipo de inimigo desconhecido:', type);
                return;
        }
        
        if (enemy) {
            gameEntities.enemies.push(enemy);
        }
    },
    
    // Spawn de power-ups
    spawnPowerUp() {
        if (Math.random() < 0.003) {
            const types = ['health', 'rapid_fire', 'shield', 'bomb'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            gameEntities.powerups.push({
                x: Math.random() * (gameData.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                type: type,
                speed: 2
            });
        }
    },
    
    // Spawn de moedas
    spawnCoin() {
        if (Math.random() < 0.01) {
            gameEntities.coins.push({
                x: Math.random() * (gameData.canvas.width - 20),
                y: -20,
                width: 20,
                height: 20,
                value: 5,
                speed: 2
            });
        }
    },
    
    // Limpar inimigos fora da tela
    cleanupOffscreen() {
        gameEntities.enemies = gameEntities.enemies.filter(enemy => {
            if (enemy.y > gameData.canvas.height + 100) {
                return false;
            }
            return true;
        });
        
        gameEntities.fireballs = gameEntities.fireballs.filter(fb => {
            return fb.y > -50 && fb.y < gameData.canvas.height + 50 &&
                   fb.x > -50 && fb.x < gameData.canvas.width + 50;
        });
        
        gameEntities.powerups = gameEntities.powerups.filter(pu => {
            return pu.y < gameData.canvas.height + 50;
        });
        
        gameEntities.coins = gameEntities.coins.filter(coin => {
            return coin.y < gameData.canvas.height + 50;
        });
    }
};
