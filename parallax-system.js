// ===== SISTEMA DE PARALLAX POR FASE =====

const parallaxSystem = {
    // Camadas de parallax
    layers: [],
    
    // Configurações por fase
    phaseConfigs: {
        1: { // Céu Sereno
            layers: [
                { 
                    name: 'stars_far',
                    color: 'rgba(200, 200, 255, 0.3)',
                    size: 1,
                    count: 100,
                    speedMultiplier: 0.2
                },
                { 
                    name: 'stars_mid',
                    color: 'rgba(255, 255, 255, 0.5)',
                    size: 1.5,
                    count: 60,
                    speedMultiplier: 0.4
                },
                { 
                    name: 'stars_near',
                    color: 'rgba(255, 255, 255, 0.8)',
                    size: 2,
                    count: 40,
                    speedMultiplier: 0.7
                },
                {
                    name: 'clouds',
                    type: 'cloud',
                    color: 'rgba(255, 255, 255, 0.2)',
                    count: 8,
                    speedMultiplier: 0.5
                }
            ]
        },
        2: { // Tempestade Iminente
            layers: [
                { 
                    name: 'stars_far',
                    color: 'rgba(150, 150, 200, 0.2)',
                    size: 1,
                    count: 80,
                    speedMultiplier: 0.3
                },
                { 
                    name: 'storm_clouds_far',
                    type: 'cloud',
                    color: 'rgba(60, 60, 80, 0.4)',
                    count: 12,
                    speedMultiplier: 0.6
                },
                { 
                    name: 'lightning_flashes',
                    type: 'lightning',
                    speedMultiplier: 1.0
                },
                { 
                    name: 'rain',
                    type: 'rain',
                    count: 100,
                    speedMultiplier: 1.5
                }
            ]
        },
        3: { // Fúria Ardente
            layers: [
                { 
                    name: 'embers_far',
                    type: 'ember',
                    color: 'rgba(255, 100, 0, 0.3)',
                    size: 2,
                    count: 50,
                    speedMultiplier: 0.3,
                    floatY: true
                },
                { 
                    name: 'smoke_clouds',
                    type: 'cloud',
                    color: 'rgba(40, 40, 40, 0.5)',
                    count: 10,
                    speedMultiplier: 0.5
                },
                { 
                    name: 'fire_particles',
                    type: 'ember',
                    color: 'rgba(255, 150, 0, 0.6)',
                    size: 3,
                    count: 80,
                    speedMultiplier: 0.8,
                    floatY: true
                },
                { 
                    name: 'ash',
                    type: 'ash',
                    count: 120,
                    speedMultiplier: 1.2
                }
            ]
        },
        4: { // Abismo Sombrio
            layers: [
                { 
                    name: 'void_particles',
                    color: 'rgba(100, 0, 200, 0.2)',
                    size: 1,
                    count: 60,
                    speedMultiplier: 0.2,
                    twinkle: true
                },
                { 
                    name: 'shadow_wisps',
                    type: 'wisp',
                    count: 15,
                    speedMultiplier: 0.4
                },
                { 
                    name: 'dark_fog',
                    type: 'fog',
                    color: 'rgba(0, 0, 0, 0.3)',
                    count: 8,
                    speedMultiplier: 0.3
                },
                { 
                    name: 'spectral_orbs',
                    type: 'orb',
                    count: 20,
                    speedMultiplier: 0.6
                }
            ]
        },
        5: { // Invasão Cósmica
            layers: [
                { 
                    name: 'nebula_far',
                    type: 'nebula',
                    color: 'rgba(150, 0, 255, 0.1)',
                    speedMultiplier: 0.1
                },
                { 
                    name: 'stars_cosmic',
                    color: 'rgba(200, 100, 255, 0.4)',
                    size: 1.5,
                    count: 100,
                    speedMultiplier: 0.3,
                    twinkle: true
                },
                { 
                    name: 'warp_lines',
                    type: 'warp',
                    count: 25,
                    speedMultiplier: 1.0
                },
                { 
                    name: 'cosmic_dust',
                    color: 'rgba(255, 100, 255, 0.3)',
                    size: 1,
                    count: 150,
                    speedMultiplier: 0.8
                }
            ]
        }
    },
    
    // Inicializar parallax para uma fase
    init(phaseNumber) {
        this.layers = [];
        const config = this.phaseConfigs[phaseNumber];
        
        if (!config) {
            console.warn('⚠️ Configuração de parallax não encontrada para fase', phaseNumber);
            return;
        }
        
        console.log(`🌌 Inicializando parallax para Fase ${phaseNumber}`);
        
        // Criar cada camada
        config.layers.forEach(layerConfig => {
            const layer = {
                name: layerConfig.name,
                type: layerConfig.type || 'star',
                speedMultiplier: layerConfig.speedMultiplier,
                particles: []
            };
            
            // Criar partículas para a camada
            const count = layerConfig.count || 50;
            for (let i = 0; i < count; i++) {
                layer.particles.push(this.createParticle(layerConfig));
            }
            
            this.layers.push(layer);
        });
        
        console.log(`✅ ${this.layers.length} camadas de parallax criadas`);
    },
    
    // Criar uma partícula baseada na configuração
    createParticle(config) {
        const particle = {
            x: Math.random() * gameData.canvas.width,
            y: Math.random() * gameData.canvas.height,
            type: config.type || 'star',
            size: config.size || 1,
            color: config.color || '#FFFFFF',
            speedY: 0,
            opacity: Math.random() * 0.5 + 0.5
        };
        
        // Propriedades específicas por tipo
        switch(particle.type) {
            case 'star':
                particle.twinklePhase = Math.random() * Math.PI * 2;
                particle.twinkleSpeed = config.twinkle ? 0.05 : 0;
                break;
                
            case 'cloud':
                particle.width = Math.random() * 100 + 60;
                particle.height = Math.random() * 40 + 30;
                particle.segments = 3;
                break;
                
            case 'ember':
                particle.floatAmplitude = config.floatY ? Math.random() * 2 : 0;
                particle.floatPhase = Math.random() * Math.PI * 2;
                particle.glow = true;
                break;
                
            case 'rain':
                particle.length = Math.random() * 15 + 10;
                particle.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.2;
                particle.color = 'rgba(150, 150, 255, 0.4)';
                break;
                
            case 'ash':
                particle.size = Math.random() * 2 + 1;
                particle.driftX = (Math.random() - 0.5) * 0.5;
                particle.color = 'rgba(200, 200, 200, 0.3)';
                break;
                
            case 'wisp':
                particle.width = Math.random() * 30 + 20;
                particle.segments = 5;
                particle.color = 'rgba(100, 0, 200, 0.3)';
                particle.wavePhase = Math.random() * Math.PI * 2;
                break;
                
            case 'fog':
                particle.width = Math.random() * 150 + 100;
                particle.height = Math.random() * 80 + 60;
                particle.opacity = Math.random() * 0.2 + 0.1;
                break;
                
            case 'orb':
                particle.size = Math.random() * 8 + 4;
                // 🔧 BUGFIX: guardamos o tamanho "base" separado do tamanho
                // usado pra desenhar. Ver correção em updateParticleBehavior.
                particle.baseSize = particle.size;
                particle.color = `rgba(${100 + Math.random() * 155}, 0, ${100 + Math.random() * 155}, 0.5)`;
                particle.pulsePhase = Math.random() * Math.PI * 2;
                break;
                
            case 'warp':
                particle.length = Math.random() * 100 + 50;
                particle.angle = Math.random() * Math.PI * 2;
                particle.color = 'rgba(100, 100, 255, 0.4)';
                break;
                
            case 'nebula':
                particle.width = gameData.canvas.width;
                particle.height = gameData.canvas.height;
                particle.opacity = 0.1;
                break;
        }
        
        return particle;
    },
    
    // Atualizar todas as camadas
    update() {
        this.layers.forEach(layer => {
            layer.particles.forEach(particle => {
                // Movimento base (scrolling)
                particle.speedY = gameData.scrollSpeed * layer.speedMultiplier;
                particle.y += particle.speedY;
                
                // Comportamentos específicos
                this.updateParticleBehavior(particle);
                
                // Reciclar partículas que saíram da tela
                if (particle.y > gameData.canvas.height + (particle.height || particle.size || 10)) {
                    particle.y = -(particle.height || particle.size || 10);
                    particle.x = Math.random() * gameData.canvas.width;
                }
            });
        });
    },
    
    // Atualizar comportamento específico de partícula
    updateParticleBehavior(particle) {
        switch(particle.type) {
            case 'star':
                if (particle.twinkleSpeed > 0) {
                    particle.twinklePhase += particle.twinkleSpeed;
                    particle.opacity = Math.sin(particle.twinklePhase) * 0.3 + 0.7;
                }
                break;
                
            case 'ember':
                if (particle.floatAmplitude > 0) {
                    particle.floatPhase += 0.05;
                    particle.x += Math.sin(particle.floatPhase) * particle.floatAmplitude;
                }
                break;
                
            case 'rain':
                particle.x += Math.cos(particle.angle) * 2;
                break;
                
            case 'ash':
                particle.x += particle.driftX;
                break;
                
            case 'wisp':
                particle.wavePhase += 0.05;
                particle.x += Math.sin(particle.wavePhase) * 1;
                break;
                
            case 'orb':
                // 🔧 BUGFIX CRÍTICO (causa real do "fase 4 não inicia"):
                // este código fazia `particle.size = particle.size + seno(...)`
                // TODO frame, ou seja, somava em cima do próprio valor
                // anterior a cada quadro, sem nenhum limite - um "random
                // walk" que ia crescendo ou encolhendo sem parar. Depois de
                // alguns segundos, o tamanho de alguma bolinha (das 20
                // "spectral_orbs" que só existem na fase 4) acabava indo
                // abaixo de zero, e `ctx.arc(x, y, tamanhoNegativo, ...)`
                // lança uma exceção ("radius provided is negative") -
                // travando o jogo inteiro exatamente ao entrar na fase 4.
                // A correção: pulsar sempre em torno do tamanho ORIGINAL
                // (baseSize), nunca acumulando, e nunca deixando passar de
                // um mínimo positivo.
                particle.pulsePhase += 0.08;
                particle.size = Math.max(1, particle.baseSize + Math.sin(particle.pulsePhase) * 2);
                break;
        }
        
        // Manter dentro dos limites horizontais
        if (particle.x < -50) particle.x = gameData.canvas.width + 50;
        if (particle.x > gameData.canvas.width + 50) particle.x = -50;
    },
    
    // Desenhar todas as camadas
    draw(ctx) {
        this.layers.forEach(layer => {
            layer.particles.forEach(particle => {
                this.drawParticle(ctx, particle);
            });
        });
    },
    
    // Desenhar uma partícula específica
    drawParticle(ctx, p) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        
        switch(p.type) {
            case 'star':
                if (p.glow) {
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = p.color;
                }
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'cloud':
                ctx.fillStyle = p.color;
                for (let i = 0; i < p.segments; i++) {
                    const offsetX = (i - 1) * p.width * 0.25;
                    ctx.beginPath();
                    ctx.ellipse(p.x + offsetX, p.y, p.width / 3, p.height / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'ember':
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'rain':
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(
                    p.x + Math.cos(p.angle) * p.length,
                    p.y + Math.sin(p.angle) * p.length
                );
                ctx.stroke();
                break;
                
            case 'ash':
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'wisp':
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                for (let i = 1; i < p.segments; i++) {
                    const segX = p.x + Math.sin(p.wavePhase + i * 0.5) * 10;
                    const segY = p.y + (p.height / p.segments) * i;
                    ctx.lineTo(segX, segY);
                }
                ctx.stroke();
                break;
                
            case 'fog':
                const gradient = ctx.createRadialGradient(
                    p.x, p.y, 0,
                    p.x, p.y, p.width / 2
                );
                gradient.addColorStop(0, p.color.replace(/[\d.]+\)$/, '0.3)'));
                gradient.addColorStop(1, p.color.replace(/[\d.]+\)$/, '0)'));
                ctx.fillStyle = gradient;
                ctx.fillRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
                break;
                
            case 'orb':
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'warp':
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(
                    p.x + Math.cos(p.angle) * p.length,
                    p.y + Math.sin(p.angle) * p.length
                );
                ctx.stroke();
                break;
                
            case 'nebula':
                const nebGrad = ctx.createRadialGradient(
                    p.x, p.y, 0,
                    gameData.canvas.width / 2, gameData.canvas.height / 2, gameData.canvas.width
                );
                nebGrad.addColorStop(0, p.color);
                nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = nebGrad;
                ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
                break;
        }
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
};
