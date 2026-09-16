// ===== DEFINIÇÕES DE TIPOS DE INIMIGOS =====

const enemyTypes = {
    // ========== FASE 1: CÉU SERENO ==========
    
    // Águia Scout - inimigo básico
    eagleScout: {
        name: 'Águia Exploradora',
        width: 35,
        height: 35,
        health: 30,
        speed: 2,
        color: '#8B7355',
        points: 50,
        damage: 10,
        
        // Sistema de ataque
        canShoot: true,
        shootCooldown: 90, // frames entre tiros
        shootPattern: 'straight',
        projectileType: 'basic',
        
        // Comportamento
        movement: 'zigzag',
        aggressive: false
    },
    
    // Falcão Atirador
    hawkSniper: {
        name: 'Falcão Atirador',
        width: 40,
        height: 40,
        health: 50,
        speed: 1.5,
        color: '#CD853F',
        points: 100,
        damage: 15,
        
        canShoot: true,
        shootCooldown: 120,
        shootPattern: 'aimed',
        projectileType: 'laser',
        
        movement: 'wave',
        aggressive: true
    },
    
    // Corvo Bombardeiro
    ravenBomber: {
        name: 'Corvo Bombardeiro',
        width: 45,
        height: 45,
        health: 70,
        speed: 1.8,
        color: '#2F4F4F',
        points: 150,
        damage: 20,
        
        canShoot: true,
        shootCooldown: 150,
        shootPattern: 'spread',
        projectileType: 'basic',
        
        movement: 'dive',
        aggressive: true
    },
    
    // ========== FASE 2: TEMPESTADE IMINENTE ==========
    
    // Harpia Elétrica
    electricHarpy: {
        name: 'Harpia Elétrica',
        width: 50,
        height: 50,
        health: 80,
        speed: 2.5,
        color: '#4B0082',
        points: 200,
        damage: 25,
        
        canShoot: true,
        shootCooldown: 100,
        shootPattern: 'aimed',
        projectileType: 'plasma',
        
        movement: 'erratic',
        aggressive: true
    },
    
    // Dragão Tempestade (mini)
    stormDrake: {
        name: 'Dragão Tempestade',
        width: 60,
        height: 55,
        health: 120,
        speed: 1.5,
        color: '#191970',
        points: 300,
        damage: 30,
        
        canShoot: true,
        shootCooldown: 80,
        shootPattern: 'circle',
        projectileType: 'shockwave',
        
        movement: 'circle',
        aggressive: true
    },
    
    // Fênix Relâmpago
    lightningPhoenix: {
        name: 'Fênix Relâmpago',
        width: 55,
        height: 50,
        health: 100,
        speed: 2.8,
        color: '#FFD700',
        points: 250,
        damage: 28,
        
        canShoot: true,
        shootCooldown: 60,
        shootPattern: 'spiral',
        projectileType: 'laser',
        
        movement: 'swoop',
        aggressive: true,
        revival: true // Pode reviver uma vez
    },
    
    // ========== FASE 3: FÚRIA ARDENTE ==========
    
    // Salamandra de Fogo
    fireSalamander: {
        name: 'Salamandra de Fogo',
        width: 45,
        height: 40,
        health: 90,
        speed: 2.2,
        color: '#FF4500',
        points: 220,
        damage: 25,
        
        canShoot: true,
        shootCooldown: 70,
        shootPattern: 'aimed',
        projectileType: 'fireball',
        
        movement: 'wave',
        aggressive: true
    },
    
    // Demônio Flamejante
    flameDemon: {
        name: 'Demônio Flamejante',
        width: 65,
        height: 60,
        health: 150,
        speed: 1.8,
        color: '#8B0000',
        points: 350,
        damage: 35,
        
        canShoot: true,
        shootCooldown: 90,
        shootPattern: 'wall',
        projectileType: 'fireball',
        
        movement: 'aggressive',
        aggressive: true
    },
    
    // Fênix Renascida
    phoenixReborn: {
        name: 'Fênix Renascida',
        width: 70,
        height: 65,
        health: 180,
        speed: 2.5,
        color: '#FF6347',
        points: 400,
        damage: 40,
        
        canShoot: true,
        shootCooldown: 50,
        shootPattern: 'burst',
        projectileType: 'fireball',
        
        movement: 'swoop',
        aggressive: true,
        revival: true,
        revivalCount: 2 // Pode reviver 2 vezes!
    },
    
    // ========== FASE 4: ABISMO SOMBRIO ==========
    
    // Espectro Sombrio
    shadowSpecter: {
        name: 'Espectro Sombrio',
        width: 40,
        height: 45,
        health: 70,
        speed: 2.8,
        color: '#483D8B',
        points: 280,
        damage: 30,
        
        canShoot: true,
        shootCooldown: 80,
        shootPattern: 'aimed',
        projectileType: 'shadowSpike',
        
        movement: 'phase', // Pode atravessar
        aggressive: true,
        phasing: true
    },
    
    // Quimera das Trevas
    darkChimera: {
        name: 'Quimera das Trevas',
        width: 75,
        height: 70,
        health: 200,
        speed: 1.5,
        color: '#2F2F4F',
        points: 450,
        damage: 45,
        
        canShoot: true,
        shootCooldown: 100,
        shootPattern: 'circle',
        projectileType: 'shadowSpike',
        
        movement: 'teleport',
        aggressive: true
    },
    
    // Lich Voador
    flyingLich: {
        name: 'Lich Voador',
        width: 60,
        height: 65,
        health: 160,
        speed: 2.0,
        color: '#8B008B',
        points: 380,
        damage: 40,
        
        canShoot: true,
        shootCooldown: 60,
        shootPattern: 'spiral',
        projectileType: 'energyOrb', // Split em 3
        
        movement: 'wave',
        aggressive: true
    },
    
    // ========== FASE 5: INVASÃO CÓSMICA ==========
    
    // Sentinela Alienígena
    alienSentinel: {
        name: 'Sentinela Alien',
        width: 50,
        height: 50,
        health: 120,
        speed: 2.5,
        color: '#00CED1',
        points: 320,
        damage: 35,
        
        canShoot: true,
        shootCooldown: 70,
        shootPattern: 'aimed',
        projectileType: 'plasma',
        
        movement: 'strafe',
        aggressive: true
    },
    
    // Nave Mãe (mini)
    mothershipScout: {
        name: 'Nave Exploradora',
        width: 80,
        height: 75,
        health: 250,
        speed: 1.2,
        color: '#4169E1',
        points: 500,
        damage: 50,
        
        canShoot: true,
        shootCooldown: 50,
        shootPattern: 'wall',
        projectileType: 'laser',
        
        movement: 'stationary',
        aggressive: true,
        shield: true // Tem escudo
    },
    
    // Caçador Cósmico
    cosmicHunter: {
        name: 'Caçador Cósmico',
        width: 55,
        height: 55,
        health: 140,
        speed: 3.5,
        color: '#9370DB',
        points: 380,
        damage: 38,
        
        canShoot: true,
        shootCooldown: 40,
        shootPattern: 'burst',
        projectileType: 'missile', // Rastreador
        
        movement: 'swarm',
        aggressive: true
    },
    
    // Dreadnought Alien
    alienDreadnought: {
        name: 'Dreadnought',
        width: 90,
        height: 85,
        health: 300,
        speed: 1.0,
        color: '#6A5ACD',
        points: 600,
        damage: 60,
        
        canShoot: true,
        shootCooldown: 30,
        shootPattern: 'circle',
        projectileType: 'plasma',
        
        movement: 'tank',
        aggressive: true,
        shield: true,
        armor: 2 // Reduz dano recebido
    }
};

// Helper para criar inimigo baseado no tipo
function createEnemyFromType(typeName, x, y) {
    const type = enemyTypes[typeName];
    if (!type) {
        console.error('Tipo de inimigo não encontrado:', typeName);
        return null;
    }
    
    const enemy = {
        ...type,
        x: x,
        y: y,
        maxHealth: type.health,
        
        // Timers de ataque
        shootTimer: 0,
        lastShotTime: 0,
        
        // Comportamento
        patternTimer: 0,
        state: 'active',
        
        // Efeitos visuais
        hitFlash: 0,
        animationFrame: 0,
        
        // Revival
        hasRevived: false,
        deathTimer: 0,
        revivalTime: 60,
        
        // Outros
        id: Math.random().toString(36).substr(2, 9)
    };
    
    return enemy;
}

// Sistema de spawn por fase
const enemySpawnSystem = {
    spawnTables: {
        1: [ // Céu Sereno
            { type: 'eagleScout', weight: 50 },
            { type: 'hawkSniper', weight: 30 },
            { type: 'ravenBomber', weight: 20 }
        ],
        2: [ // Tempestade
            { type: 'electricHarpy', weight: 40 },
            { type: 'stormDrake', weight: 30 },
            { type: 'lightningPhoenix', weight: 30 }
        ],
        3: [ // Fúria Ardente
            { type: 'fireSalamander', weight: 40 },
            { type: 'flameDemon', weight: 35 },
            { type: 'phoenixReborn', weight: 25 }
        ],
        4: [ // Abismo Sombrio
            { type: 'shadowSpecter', weight: 45 },
            { type: 'darkChimera', weight: 30 },
            { type: 'flyingLich', weight: 25 }
        ],
        5: [ // Invasão Cósmica
            { type: 'alienSentinel', weight: 40 },
            { type: 'mothershipScout', weight: 25 },
            { type: 'cosmicHunter', weight: 25 },
            { type: 'alienDreadnought', weight: 10 }
        ]
    },
    
    // Spawn aleatório baseado na fase
    spawnRandom(phase) {
        const table = this.spawnTables[phase];
        if (!table) return null;
        
        // Calcular peso total
        const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
        
        // Escolher aleatório baseado no peso
        let random = Math.random() * totalWeight;
        
        for (const entry of table) {
            random -= entry.weight;
            if (random <= 0) {
                const x = Math.random() * (gameData.canvas.width - 60) + 30;
                const y = -50;
                return createEnemyFromType(entry.type, x, y);
            }
        }
        
        return null;
    }
};
