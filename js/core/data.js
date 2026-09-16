// ===== DADOS E CONSTANTES DO JOGO - DRAGON FURY =====

const gameData = {
    canvas: null,
    ctx: null,
    gameState: 'menu', // menu, playing, paused, gameover, stage_complete
    animationId: null,
    lastTime: 0,
    scrollSpeed: 2,
    scrollOffset: 0,
    distanceTraveled: 0,
    bossActive: false,
    currentWave: 1,
    currentStage: 1, // Sistema de fases
    enemiesKilledThisStage: 0,
    stageTargetKills: 20, // Inimigos necessários para completar fase
    stageCompleteTimer: null, // Timer para transição automática
    stageCompleteCountdown: null, // Interval do contador regressivo
    // Sistema de Combo
    comboMultiplier: 1,
    comboCount: 0,
    lastKillTime: 0,
    bestCombo: parseInt(localStorage.getItem('bestCombo')) || 0,
    // ✨ NOVO: sistema de ovo resgatável (um por fase)
    eggSpawnedThisStage: false,
    eggRescuedThisStage: false
};

const gameStats = {
    coins: parseInt(localStorage.getItem('dragonCoins')) || 0,
    score: 0,
    health: 100,
    firepower: 1,
    totalCoins: parseInt(localStorage.getItem('dragonTotalCoins')) || 0,
    totalScore: parseInt(localStorage.getItem('dragonTotalScore')) || 0,
    gamesPlayed: parseInt(localStorage.getItem('dragonGamesPlayed')) || 0,
    maxDistance: parseInt(localStorage.getItem('dragonMaxDistance')) || 0,
    maxStageReached: parseInt(localStorage.getItem('dragonMaxStage')) || 1,
    powerUpActive: null,
    powerUpTimer: 0
};

const keys = {};

// Arrays de entidades
const gameEntities = {
    obstacles: [],
    coins: [],
    fireballs: [],
    enemies: [],
    particles: [],
    stars: [],
    powerups: [],
    eggs: [], // ✨ NOVO: ovos de dragão para resgatar em cada fase
    boss: null
};

// Definição das Fases
const stages = {
    1: {
        name: 'Céu Sereno',
        description: 'O início da jornada',
        background: {
            color1: '#000033',
            color2: '#000011',
            color3: '#000000'
        },
        enemyMultiplier: 1.0,
        speedMultiplier: 1.0,
        targetKills: 20,
        bossName: 'Guardião Celeste',
        bossHealth: 500
    },
    2: {
        name: 'Tempestade Iminente',
        description: 'As nuvens se agitam',
        background: {
            color1: '#1a0033',
            color2: '#0d0022',
            color3: '#050011'
        },
        enemyMultiplier: 1.3,
        speedMultiplier: 1.2,
        targetKills: 30,
        bossName: 'Senhor das Tempestades',
        bossHealth: 750
    },
    3: {
        name: 'Fúria Ardente',
        description: 'O céu queima em chamas',
        background: {
            color1: '#330011',
            color2: '#220005',
            color3: '#110000'
        },
        enemyMultiplier: 1.6,
        speedMultiplier: 1.4,
        targetKills: 40,
        bossName: 'Dragão de Fogo',
        bossHealth: 1000
    },
    4: {
        name: 'Abismo Sombrio',
        description: 'A escuridão prevalece',
        background: {
            color1: '#110022',
            color2: '#080014',
            color3: '#000008'
        },
        enemyMultiplier: 2.0,
        speedMultiplier: 1.6,
        targetKills: 50,
        bossName: 'Rei das Sombras',
        bossHealth: 1500
    },
    5: {
        name: 'Batalha Final',
        description: 'O confronto definitivo',
        background: {
            color1: '#220033',
            color2: '#110022',
            color3: '#080011'
        },
        enemyMultiplier: 2.5,
        speedMultiplier: 1.8,
        targetKills: 60,
        bossName: 'IMPERADOR SUPREMO',
        bossHealth: 2500
    }
};

// Upgrades do jogo
const upgrades = {
    firepower: {
        name: 'Poder do Fogo',
        description: 'Aumenta o dano e taxa de disparo',
        level: parseInt(localStorage.getItem('upgradeFirepower')) || 0,
        maxLevel: 5,
        baseCost: 50,
        icon: '🔥'
    },
    health: {
        name: 'Vida Máxima',
        description: 'Aumenta a vida máxima do dragão',
        level: parseInt(localStorage.getItem('upgradeHealth')) || 0,
        maxLevel: 5,
        baseCost: 75,
        icon: '❤️'
    },
    speed: {
        name: 'Velocidade',
        description: 'Aumenta a velocidade de movimento',
        level: parseInt(localStorage.getItem('upgradeSpeed')) || 0,
        maxLevel: 5,
        baseCost: 60,
        icon: '⚡'
    },
    multishot: {
        name: 'Tiro Múltiplo',
        description: 'Dispara múltiplos projéteis',
        level: parseInt(localStorage.getItem('upgradeMultishot')) || 0,
        maxLevel: 3,
        baseCost: 100,
        icon: '🎯'
    },
    bulletSpeed: {
        name: 'Velocidade do Tiro',
        description: 'Seus tiros viajam mais rápido pela tela',
        level: parseInt(localStorage.getItem('upgradeBulletSpeed')) || 0,
        maxLevel: 5,
        baseCost: 80,
        icon: '💨'
    },
    shield: {
        name: 'Escudo Dragão',
        description: 'Reduz o dano recebido',
        level: parseInt(localStorage.getItem('upgradeShield')) || 0,
        maxLevel: 3,
        baseCost: 120,
        icon: '🛡️'
    },
    escorts: {
        name: 'Dragões Escolta',
        description: 'Dois dragões menores lutam ao seu lado',
        level: parseInt(localStorage.getItem('upgradeEscorts')) || 0,
        maxLevel: 1,
        baseCost: 500,
        icon: '🐉'
    }
};

// Conquistas do jogo
const achievements = [
    {
        id: 'first_kill',
        name: 'Primeira Vitória',
        description: 'Derrote seu primeiro inimigo',
        icon: '⚔️',
        unlocked: localStorage.getItem('ach_first_kill') === 'true',
        check: () => (parseInt(localStorage.getItem('enemiesDefeated')) || 0) >= 1
    },
    {
        id: 'enemy_hunter',
        name: 'Caçador',
        description: 'Derrote 50 inimigos',
        icon: '🎯',
        unlocked: localStorage.getItem('ach_enemy_hunter') === 'true',
        check: () => (parseInt(localStorage.getItem('enemiesDefeated')) || 0) >= 50
    },
    {
        id: 'enemy_slayer',
        name: 'Exterminador',
        description: 'Derrote 200 inimigos',
        icon: '💀',
        unlocked: localStorage.getItem('ach_enemy_slayer') === 'true',
        check: () => (parseInt(localStorage.getItem('enemiesDefeated')) || 0) >= 200
    },
    {
        id: 'first_boss',
        name: 'Matador de Chefe',
        description: 'Derrote seu primeiro boss',
        icon: '👑',
        unlocked: localStorage.getItem('ach_first_boss') === 'true',
        check: () => (parseInt(localStorage.getItem('bossesDefeated')) || 0) >= 1
    },
    {
        id: 'high_scorer',
        name: 'Pontuador',
        description: 'Alcance 5000 pontos em uma partida',
        icon: '🌟',
        unlocked: localStorage.getItem('ach_high_scorer') === 'true',
        check: () => gameStats.score >= 5000
    },
    {
        id: 'survivor',
        name: 'Sobrevivente',
        description: 'Percorra 1000 metros',
        icon: '🏃',
        unlocked: localStorage.getItem('ach_survivor') === 'true',
        check: () => gameData.distanceTraveled >= 1000
    },
    {
        id: 'veteran',
        name: 'Veterano',
        description: 'Jogue 25 partidas',
        icon: '🎮',
        unlocked: localStorage.getItem('ach_veteran') === 'true',
        check: () => gameStats.gamesPlayed >= 25
    },
    {
        id: 'master_dragon',
        name: 'Mestre Dragão',
        description: 'Maximize todos os upgrades',
        icon: '🐉',
        unlocked: localStorage.getItem('ach_master_dragon') === 'true',
        check: () => {
            return Object.values(upgrades).every(u => u.level >= u.maxLevel);
        }
    },
    {
        id: 'stage_master',
        name: 'Mestre das Fases',
        description: 'Complete a Fase 3',
        icon: '🏆',
        unlocked: localStorage.getItem('ach_stage_master') === 'true',
        check: () => gameStats.maxStageReached >= 3
    },
    {
        id: 'perfect_score',
        name: 'Pontuação Perfeita',
        description: 'Alcance 10000 pontos',
        icon: '✨',
        unlocked: localStorage.getItem('ach_perfect_score') === 'true',
        check: () => gameStats.score >= 10000
    },
    {
        id: 'perfect_flight',
        name: 'Voo Perfeito',
        description: 'Voe 200m sem tomar dano',
        icon: '🦅',
        unlocked: localStorage.getItem('ach_perfect_flight') === 'true',
        check: () => false // Verificado separadamente no achievementManager
    },
    {
        id: 'fury_master',
        name: 'Mestre da Fúria',
        description: 'Complete todas as 5 fases',
        icon: '🔱',
        unlocked: localStorage.getItem('ach_fury_master') === 'true',
        check: () => gameStats.maxStageReached >= 5
    },
    {
        id: 'combo_master',
        name: 'Mestre do Combo',
        description: 'Alcance combo 20x',
        icon: '🎯',
        unlocked: localStorage.getItem('ach_combo_master') === 'true',
        check: () => gameData.comboCount >= 20 || gameData.bestCombo >= 20
    }
];

// Configurações do jogo
const config = {
    spawnRates: {
        enemy: 0.02,
        coin: 0.015,
        powerup: 0.004 // Aumentado ligeiramente
    },
    colors: {
        dragon: '#FF6B35',
        enemy: '#8B0000',
        boss: '#4B0082',
        fireball: '#FF6B35',
        star: '#FFFFFF',
        powerup: '#00FF00',
        coin: '#FFD700'
    },
    enemyPatterns: [
        'straight',
        'wave',
        'zigzag',
        'circle',
        'formation'
    ],
    // Novos tipos de power-ups
    powerUpTypes: [
        {
            type: 'health',
            name: 'Vida',
            icon: '❤️',
            color: '#FF0000',
            weight: 0.3 // 30% de chance
        },
        {
            type: 'rapid_fire',
            name: 'Tiro Rápido',
            icon: '⚡',
            color: '#FF6B35',
            weight: 0.25
        },
        {
            type: 'shield',
            name: 'Escudo',
            icon: '🛡️',
            color: '#00FFFF',
            weight: 0.2
        },
        {
            type: 'bomb',
            name: 'Bomba',
            icon: '💣',
            color: '#8B0000',
            weight: 0.15
        },
        {
            type: 'double_damage',
            name: 'Dano Duplo',
            icon: '💥',
            color: '#FF1493',
            weight: 0.1
        }
    ]
};
