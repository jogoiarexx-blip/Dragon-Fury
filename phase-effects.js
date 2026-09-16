// ===== SISTEMA DE EFEITOS AMBIENTAIS DAS FASES =====

const phaseEffects = {
    // Armazenar estado dos efeitos
    clouds: [],
    fireParticles: [],
    warpLines: [],
    chaosShapes: [],
    lightningTimer: 0,
    
    // Obter dados da fase baseado nos arquivos individuais
    getPhaseData(phaseNumber) {
        const phaseMap = {
            1: typeof phase1_ceuSereno !== 'undefined' ? phase1_ceuSereno : null,
            2: typeof phase2_tempestadeIminente !== 'undefined' ? phase2_tempestadeIminente : null,
            3: typeof phase3_furiaArdente !== 'undefined' ? phase3_furiaArdente : null,
            4: typeof phase4_abismoSombrio !== 'undefined' ? phase4_abismoSombrio : null,
            5: typeof phase5_batalhaFinal !== 'undefined' ? phase5_batalhaFinal : null
        };
        return phaseMap[phaseNumber];
    },
    
    // Inicializar efeitos quando a fase muda
    init(phaseNumber) {
        this.clouds = [];
        this.fireParticles = [];
        this.warpLines = [];
        this.chaosShapes = [];
        this.lightningTimer = 0;
        
        // Usar os arquivos de fase individuais
        const phaseData = this.getPhaseData(phaseNumber);
        if (!phaseData) return;
        
        const ambience = phaseData.ambience;
        
        // Inicializar nuvens se necessário
        if (ambience.cloudDensity > 0) {
            this.initClouds(ambience.cloudDensity);
        }
        
        // Inicializar partículas de fogo
        if (ambience.fireParticles) {
            this.initFireParticles();
        }
        
        // Inicializar linhas de warp
        if (ambience.warpEffect) {
            this.initWarpLines();
        }
        
        // Inicializar formas de caos
        if (ambience.chaosEffect) {
            this.initChaosShapes();
        }
    },
    
    // ===== NUVENS =====
    initClouds(density) {
        for (let i = 0; i < density; i++) {
            this.clouds.push({
                x: Math.random() * gameData.canvas.width,
                y: Math.random() * gameData.canvas.height,
                size: Math.random() * 80 + 40,
                speed: Math.random() * 0.5 + 0.3,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    },
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.y += cloud.speed + gameData.scrollSpeed * 0.3;
            
            // Reciclar nuvens que saíram da tela
            if (cloud.y > gameData.canvas.height + cloud.size) {
                cloud.y = -cloud.size;
                cloud.x = Math.random() * gameData.canvas.width;
            }
        });
    },
    
    drawClouds(ctx) {
        ctx.save();
        this.clouds.forEach(cloud => {
            ctx.fillStyle = `rgba(50, 50, 70, ${cloud.opacity})`;
            
            // Desenhar nuvem com múltiplos círculos
            for (let i = 0; i < 3; i++) {
                const offsetX = (i - 1) * cloud.size * 0.3;
                const offsetY = Math.sin(i) * cloud.size * 0.1;
                ctx.beginPath();
                ctx.arc(
                    cloud.x + offsetX, 
                    cloud.y + offsetY, 
                    cloud.size * (0.8 + i * 0.1), 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            }
        });
        ctx.restore();
    },
    
    // ===== RAIOS (LIGHTNING) =====
    drawLightning(ctx) {
        this.lightningTimer++;
        
        // Raio aleatório ocasional
        if (Math.random() < 0.005) { // 0.5% de chance por frame
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFFFFF';
            
            const startX = Math.random() * gameData.canvas.width;
            let currentX = startX;
            let currentY = 0;
            
            ctx.beginPath();
            ctx.moveTo(currentX, currentY);
            
            // Criar raio segmentado
            const segments = 8;
            for (let i = 0; i < segments; i++) {
                currentY += gameData.canvas.height / segments;
                currentX += (Math.random() - 0.5) * 60;
                ctx.lineTo(currentX, currentY);
                
                // Ramificações ocasionais
                if (Math.random() < 0.3) {
                    const branchX = currentX + (Math.random() - 0.5) * 80;
                    const branchY = currentY + 30;
                    ctx.moveTo(currentX, currentY);
                    ctx.lineTo(branchX, branchY);
                    ctx.moveTo(currentX, currentY);
                }
            }
            
            ctx.stroke();
            
            // Flash de luz
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
            
            ctx.restore();
        }
    },
    
    // ===== PARTÍCULAS DE FOGO =====
    initFireParticles() {
        for (let i = 0; i < 30; i++) {
            this.fireParticles.push(this.createFireParticle());
        }
    },
    
    createFireParticle() {
        return {
            x: Math.random() * gameData.canvas.width,
            y: Math.random() * gameData.canvas.height,
            size: Math.random() * 4 + 1,
            speedY: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            color: Math.random() < 0.5 ? '#FF4500' : '#FFA500',
            opacity: Math.random() * 0.8 + 0.2,
            life: Math.random() * 60 + 30
        };
    },
    
    updateFireParticles() {
        this.fireParticles.forEach((particle, index) => {
            particle.y += particle.speedY + gameData.scrollSpeed;
            particle.x += particle.speedX;
            particle.life--;
            particle.opacity -= 0.01;
            
            // Reciclar partícula
            if (particle.y > gameData.canvas.height || particle.life <= 0 || particle.opacity <= 0) {
                this.fireParticles[index] = this.createFireParticle();
                this.fireParticles[index].y = -10;
            }
        });
    },
    
    drawFireParticles(ctx) {
        ctx.save();
        this.fireParticles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.shadowBlur = 15;
            ctx.shadowColor = particle.color;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
    },
    
    // ===== NÉVOA ESCURA (DARK FOG) =====
    drawDarkFog(ctx) {
        ctx.save();
        
        // Névoa com gradiente
        const gradient = ctx.createRadialGradient(
            gameData.canvas.width / 2, 
            gameData.canvas.height / 2, 
            0,
            gameData.canvas.width / 2, 
            gameData.canvas.height / 2, 
            gameData.canvas.width
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, gameData.canvas.width, gameData.canvas.height);
        
        // Névoa animada com ruído
        ctx.globalAlpha = 0.15;
        const time = Date.now() * 0.0005;
        for (let i = 0; i < 10; i++) {
            const x = (Math.sin(time + i) * 0.5 + 0.5) * gameData.canvas.width;
            const y = (Math.cos(time * 0.7 + i) * 0.5 + 0.5) * gameData.canvas.height;
            const size = 150 + Math.sin(time + i) * 50;
            
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        ctx.restore();
    },
    
    // ===== EFEITO WARP =====
    initWarpLines() {
        for (let i = 0; i < 15; i++) {
            this.warpLines.push({
                y: (i / 15) * gameData.canvas.height,
                speed: Math.random() * 2 + 3,
                opacity: Math.random() * 0.3 + 0.2
            });
        }
    },
    
    updateWarpLines() {
        this.warpLines.forEach(line => {
            line.y += line.speed + gameData.scrollSpeed * 2;
            
            // Reciclar linha
            if (line.y > gameData.canvas.height) {
                line.y = 0;
            }
        });
    },
    
    drawWarpEffect(ctx) {
        ctx.save();
        this.warpLines.forEach(line => {
            ctx.strokeStyle = `rgba(100, 100, 255, ${line.opacity})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(100, 100, 255, 0.5)';
            
            ctx.beginPath();
            ctx.moveTo(0, line.y);
            ctx.lineTo(gameData.canvas.width, line.y);
            ctx.stroke();
            
            // Linhas secundárias
            ctx.strokeStyle = `rgba(150, 150, 255, ${line.opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, line.y + 2);
            ctx.lineTo(gameData.canvas.width, line.y + 2);
            ctx.stroke();
        });
        ctx.shadowBlur = 0;
        ctx.restore();
    },
    
    // ===== EFEITO DE CAOS =====
    initChaosShapes() {
        for (let i = 0; i < 25; i++) {
            this.chaosShapes.push(this.createChaosShape());
        }
    },
    
    createChaosShape() {
        const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00'];
        return {
            x: Math.random() * gameData.canvas.width,
            y: Math.random() * gameData.canvas.height,
            size: Math.random() * 60 + 20,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            speedY: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: Math.random() < 0.5 ? 'square' : 'triangle',
            opacity: Math.random() * 0.3 + 0.1
        };
    },
    
    updateChaosShapes() {
        this.chaosShapes.forEach((shape, index) => {
            shape.y += shape.speedY + gameData.scrollSpeed;
            shape.rotation += shape.rotationSpeed;
            
            // Reciclar forma
            if (shape.y > gameData.canvas.height + shape.size) {
                this.chaosShapes[index] = this.createChaosShape();
                this.chaosShapes[index].y = -shape.size;
            }
        });
    },
    
    drawChaosEffect(ctx) {
        ctx.save();
        this.chaosShapes.forEach(shape => {
            ctx.save();
            ctx.translate(shape.x, shape.y);
            ctx.rotate(shape.rotation);
            ctx.globalAlpha = shape.opacity;
            ctx.fillStyle = shape.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = shape.color;
            
            if (shape.shape === 'square') {
                ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
            } else {
                ctx.beginPath();
                ctx.moveTo(0, -shape.size / 2);
                ctx.lineTo(shape.size / 2, shape.size / 2);
                ctx.lineTo(-shape.size / 2, shape.size / 2);
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
    },
    
    // ===== ATUALIZAR TODOS OS EFEITOS =====
    update() {
        const phaseData = this.getPhaseData(gameData.currentStage);
        if (!phaseData) return;
        
        const ambience = phaseData.ambience;
        
        if (ambience.cloudDensity > 0) {
            this.updateClouds();
        }
        
        if (ambience.fireParticles) {
            this.updateFireParticles();
        }
        
        if (ambience.warpEffect) {
            this.updateWarpLines();
        }
        
        if (ambience.chaosEffect) {
            this.updateChaosShapes();
        }
    },
    
    // ===== DESENHAR TODOS OS EFEITOS =====
    draw(ctx) {
        const phaseData = this.getPhaseData(gameData.currentStage);
        if (!phaseData) return;
        
        const ambience = phaseData.ambience;
        
        // Ordem de renderização: trás -> frente
        
        // 1. Nuvens (fundo)
        if (ambience.cloudDensity > 0) {
            this.drawClouds(ctx);
        }
        
        // 2. Raios (meio)
        if (ambience.lightning) {
            this.drawLightning(ctx);
        }
        
        // 3. Partículas de fogo
        if (ambience.fireParticles) {
            this.drawFireParticles(ctx);
        }
        
        // 4. Efeito warp
        if (ambience.warpEffect) {
            this.drawWarpEffect(ctx);
        }
        
        // 5. Formas de caos
        if (ambience.chaosEffect) {
            this.drawChaosEffect(ctx);
        }
        
        // 6. Névoa escura (frente - overlay)
        if (ambience.darkFog) {
            this.drawDarkFog(ctx);
        }
    }
};
