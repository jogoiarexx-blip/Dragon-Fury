// ===== SISTEMA AVANÇADO DE POWER-UPS =====
// Sistema completo com formas geométricas, bordas animadas, partículas e magnetismo

const powerUpEffects = {
    particles: [], // Partículas ao redor dos power-ups
    magneticEffects: [], // Efeitos de atração magnética
    borderLayers: [], // Camadas da borda animada
    
    // Configurações
    config: {
        // Formas
        shapeType: 'hexagon', // 'hexagon' ou 'octagon'
        sideCount: {
            hexagon: 6,
            octagon: 8
        },
        
        // Bordas animadas
        borderLayers: 3,
        borderRotationSpeed: 0.02,
        borderPulseSpeed: 0.03,
        
        // Partículas
        particleSpawnRate: 0.4,
        particleLifespan: 40,
        particleDistance: 25,
        
        // Magnetismo
        magnetDistance: 100, // Distância para começar atração
        magnetStrength: 0.3,
        magnetPulseSpeed: 0.05,
        
        // Pulso de energia
        energyPulseSpeed: 0.04,
        energyPulseIntensity: 20,
        
        // Ícones elaborados (canvas drawings em vez de emojis)
        useCustomIcons: true
    },
    
    // Cores por tipo de power-up
    colors: {
        health: {
            primary: '#FF1744',
            secondary: '#FF5252',
            glow: '#FF8A80',
            particles: ['#FF1744', '#FF5252', '#FF8A80', '#FFCDD2']
        },
        rapid_fire: {
            primary: '#FFC107',
            secondary: '#FFD54F',
            glow: '#FFE082',
            particles: ['#FFC107', '#FFD54F', '#FFE082', '#FFECB3']
        },
        shield: {
            primary: '#00BCD4',
            secondary: '#4DD0E1',
            glow: '#80DEEA',
            particles: ['#00BCD4', '#4DD0E1', '#80DEEA', '#B2EBF2']
        },
        bomb: {
            primary: '#9C27B0',
            secondary: '#BA68C8',
            glow: '#CE93D8',
            particles: ['#9C27B0', '#BA68C8', '#CE93D8', '#E1BEE7']
        },
        double_damage: {
            primary: '#FF6F00',
            secondary: '#FFA726',
            glow: '#FFCC80',
            particles: ['#FF6F00', '#FFA726', '#FFCC80', '#FFE0B2']
        }
    },
    
    // Estado de rotação
    rotationPhase: 0,
    pulsePhase: 0,
    energyPhase: 0,
    
    // Inicializar
    init() {
        this.particles = [];
        this.magneticEffects = [];
        this.rotationPhase = 0;
        this.pulsePhase = 0;
        this.energyPhase = 0;
    },
    
    // Melhorar power-up com propriedades extras
    enhancePowerUp(powerup) {
        if (!powerup.enhanced) {
            powerup.enhanced = true;
            powerup.rotationAngle = Math.random() * Math.PI * 2;
            powerup.pulseScale = 1;
            powerup.borderRotations = [0, 0, 0];
            powerup.magneticActive = false;
            powerup.lastX = powerup.x;
            powerup.lastY = powerup.y;
        }
    },
    
    // Atualizar todos os power-ups
    update(powerups, playerX, playerY) {
        this.rotationPhase += this.config.borderRotationSpeed;
        this.pulsePhase += this.config.borderPulseSpeed;
        this.energyPhase += this.config.energyPulseSpeed;
        
        powerups.forEach(powerup => {
            this.enhancePowerUp(powerup);
            
            // Atualizar rotação
            powerup.rotationAngle += 0.03;
            
            // Atualizar pulso
            powerup.pulseScale = 1 + Math.sin(this.pulsePhase) * 0.1;
            
            // Atualizar camadas de borda
            for (let i = 0; i < this.config.borderLayers; i++) {
                powerup.borderRotations[i] = this.rotationPhase * (i + 1) * (i % 2 === 0 ? 1 : -1);
            }
            
            // Criar partículas
            if (Math.random() < this.config.particleSpawnRate) {
                this.createPowerUpParticle(powerup);
            }
            
            // Verificar magnetismo
            if (playerX !== undefined && playerY !== undefined) {
                this.checkMagnetism(powerup, playerX, playerY);
            }
        });
        
        // Atualizar partículas
        this.updateParticles();
        
        // Atualizar efeitos magnéticos
        this.updateMagneticEffects();
    },
    
    // Criar partícula colorida
    createPowerUpParticle(powerup) {
        const colorScheme = this.colors[powerup.type] || this.colors.health;
        const angle = Math.random() * Math.PI * 2;
        const distance = this.config.particleDistance;
        
        this.particles.push({
            x: powerup.x + powerup.width / 2 + Math.cos(angle) * distance,
            y: powerup.y + powerup.height / 2 + Math.sin(angle) * distance,
            vx: Math.cos(angle) * 0.5,
            vy: Math.sin(angle) * 0.5 - 0.3,
            size: Math.random() * 3 + 1,
            life: this.config.particleLifespan,
            maxLife: this.config.particleLifespan,
            color: colorScheme.particles[Math.floor(Math.random() * colorScheme.particles.length)],
            type: powerup.type
        });
    },
    
    // Verificar e aplicar magnetismo
    checkMagnetism(powerup, playerX, playerY) {
        const dx = (playerX + 20) - (powerup.x + powerup.width / 2);
        const dy = (playerY + 20) - (powerup.y + powerup.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.magnetDistance) {
            powerup.magneticActive = true;
            
            // Aplicar força magnética
            const force = (1 - distance / this.config.magnetDistance) * this.config.magnetStrength;
            powerup.x += (dx / distance) * force * 5;
            powerup.y += (dy / distance) * force * 5;
            
            // Criar efeitos visuais de magnetismo
            if (Math.random() < 0.1) {
                this.createMagneticEffect(powerup, playerX, playerY);
            }
        } else {
            powerup.magneticActive = false;
        }
    },
    
    // Criar efeito visual de magnetismo
    createMagneticEffect(powerup, playerX, playerY) {
        const colorScheme = this.colors[powerup.type] || this.colors.health;
        
        this.magneticEffects.push({
            x1: powerup.x + powerup.width / 2,
            y1: powerup.y + powerup.height / 2,
            x2: playerX + 20,
            y2: playerY + 20,
            life: 15,
            maxLife: 15,
            color: colorScheme.glow
        });
    },
    
    // Atualizar partículas
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            // Leve movimento flutuante
            p.vx += (Math.random() - 0.5) * 0.1;
            p.vy += (Math.random() - 0.5) * 0.1;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    // Atualizar efeitos magnéticos
    updateMagneticEffects() {
        for (let i = this.magneticEffects.length - 1; i >= 0; i--) {
            const effect = this.magneticEffects[i];
            effect.life--;
            
            if (effect.life <= 0) {
                this.magneticEffects.splice(i, 1);
            }
        }
    },
    
    // Desenhar forma poligonal (hexágono/octágono)
    drawPolygon(ctx, x, y, radius, sides, rotation) {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 / sides) * i + rotation;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    },
    
    // Desenhar ícone customizado
    drawCustomIcon(ctx, type, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        switch(type) {
            case 'health':
                // Coração
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.2);
                ctx.bezierCurveTo(-size * 0.3, -size * 0.5, -size * 0.6, -size * 0.2, 0, size * 0.3);
                ctx.bezierCurveTo(size * 0.6, -size * 0.2, size * 0.3, -size * 0.5, 0, -size * 0.2);
                ctx.fill();
                break;
                
            case 'rapid_fire':
                // Raio
                ctx.beginPath();
                ctx.moveTo(-size * 0.1, -size * 0.4);
                ctx.lineTo(size * 0.2, -size * 0.1);
                ctx.lineTo(0, -size * 0.1);
                ctx.lineTo(size * 0.1, size * 0.4);
                ctx.lineTo(-size * 0.2, size * 0.1);
                ctx.lineTo(0, size * 0.1);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'shield':
                // Escudo
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.4);
                ctx.quadraticCurveTo(size * 0.4, -size * 0.4, size * 0.4, 0);
                ctx.quadraticCurveTo(size * 0.4, size * 0.3, 0, size * 0.5);
                ctx.quadraticCurveTo(-size * 0.4, size * 0.3, -size * 0.4, 0);
                ctx.quadraticCurveTo(-size * 0.4, -size * 0.4, 0, -size * 0.4);
                ctx.fill();
                break;
                
            case 'bomb':
                // Bomba
                ctx.beginPath();
                ctx.arc(0, size * 0.1, size * 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(size * 0.2, -size * 0.2);
                ctx.lineTo(size * 0.3, -size * 0.4);
                ctx.stroke();
                // Faísca
                ctx.beginPath();
                ctx.arc(size * 0.3, -size * 0.4, size * 0.08, 0, Math.PI * 2);
                ctx.fillStyle = '#FFA500';
                ctx.fill();
                break;
                
            case 'double_damage':
                // Estrela explosiva
                const spikes = 8;
                const outerRadius = size * 0.4;
                const innerRadius = size * 0.2;
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI / spikes) * i;
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                break;
        }
        
        ctx.restore();
    },
    
    // Desenhar power-up completo
    drawPowerUp(ctx, powerup) {
        this.enhancePowerUp(powerup);
        
        const colorScheme = this.colors[powerup.type] || this.colors.health;
        const sides = this.config.sideCount[this.config.shapeType];
        const centerX = powerup.x + powerup.width / 2;
        const centerY = powerup.y + powerup.height / 2;
        const baseRadius = powerup.width / 2;
        
        ctx.save();
        
        // Pulso de energia radiante
        const energyPulse = Math.sin(this.energyPhase) * 0.5 + 0.5;
        const energyRadius = baseRadius * (1.5 + energyPulse * 0.5);
        
        const energyGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, energyRadius
        );
        energyGradient.addColorStop(0, colorScheme.glow + '60');
        energyGradient.addColorStop(0.6, colorScheme.glow + '20');
        energyGradient.addColorStop(1, colorScheme.glow + '00');
        
        ctx.fillStyle = energyGradient;
        ctx.fillRect(
            centerX - energyRadius,
            centerY - energyRadius,
            energyRadius * 2,
            energyRadius * 2
        );
        
        // Camadas de bordas animadas
        for (let i = this.config.borderLayers - 1; i >= 0; i--) {
            const layerRadius = baseRadius * (1.3 + i * 0.15) * powerup.pulseScale;
            const layerAlpha = (0.8 - i * 0.2) * (0.5 + Math.sin(this.pulsePhase + i) * 0.5);
            
            ctx.globalAlpha = layerAlpha;
            ctx.strokeStyle = i === 0 ? colorScheme.secondary : colorScheme.glow;
            ctx.lineWidth = 3 - i * 0.5;
            
            this.drawPolygon(ctx, centerX, centerY, layerRadius, sides, 
                           powerup.borderRotations[i]);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
        
        // Corpo principal do power-up
        const mainGradient = ctx.createRadialGradient(
            centerX - baseRadius * 0.3,
            centerY - baseRadius * 0.3,
            0,
            centerX,
            centerY,
            baseRadius * 1.2
        );
        mainGradient.addColorStop(0, colorScheme.secondary);
        mainGradient.addColorStop(0.5, colorScheme.primary);
        mainGradient.addColorStop(1, colorScheme.primary + 'CC');
        
        ctx.fillStyle = mainGradient;
        ctx.shadowBlur = this.config.energyPulseIntensity * (0.7 + energyPulse * 0.3);
        ctx.shadowColor = colorScheme.glow;
        
        this.drawPolygon(ctx, centerX, centerY, baseRadius * powerup.pulseScale, 
                        sides, powerup.rotationAngle);
        ctx.fill();
        
        // Borda interna brilhante
        ctx.shadowBlur = 0;
        ctx.strokeStyle = colorScheme.glow;
        ctx.lineWidth = 2;
        this.drawPolygon(ctx, centerX, centerY, baseRadius * 0.8 * powerup.pulseScale, 
                        sides, powerup.rotationAngle);
        ctx.stroke();
        
        // Ícone
        if (this.config.useCustomIcons) {
            this.drawCustomIcon(ctx, powerup.type, centerX, centerY, baseRadius * 0.6);
        } else {
            // Fallback para emoji
            const symbols = {
                health: '❤️',
                rapid_fire: '⚡',
                shield: '🛡️',
                bomb: '💣',
                double_damage: '💥'
            };
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold ' + (baseRadius * 1.2) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbols[powerup.type] || '?', centerX, centerY);
        }
        
        // Indicador de magnetismo ativo
        if (powerup.magneticActive) {
            const magnetPulse = Math.sin(Date.now() * this.config.magnetPulseSpeed) * 0.5 + 0.5;
            ctx.strokeStyle = colorScheme.glow;
            ctx.lineWidth = 2;
            ctx.globalAlpha = magnetPulse * 0.5;
            
            this.drawPolygon(ctx, centerX, centerY, baseRadius * (1.8 + magnetPulse * 0.3), 
                           sides, -powerup.rotationAngle);
            ctx.stroke();
        }
        
        ctx.restore();
    },
    
    // Desenhar partículas
    drawParticles(ctx) {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, p.color + '00');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    },
    
    // Desenhar efeitos magnéticos
    drawMagneticEffects(ctx) {
        this.magneticEffects.forEach(effect => {
            const alpha = effect.life / effect.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha * 0.4;
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            ctx.beginPath();
            ctx.moveTo(effect.x1, effect.y1);
            ctx.lineTo(effect.x2, effect.y2);
            ctx.stroke();
            
            ctx.setLineDash([]);
            ctx.restore();
        });
    },
    
    // Desenhar tudo
    draw(ctx, powerups) {
        // Efeitos magnéticos atrás
        this.drawMagneticEffects(ctx);
        
        // Power-ups
        powerups.forEach(powerup => {
            this.drawPowerUp(ctx, powerup);
        });
        
        // Partículas na frente
        this.drawParticles(ctx);
    },
    
    // Efeito ao coletar power-up
    onCollect(x, y, type, ctx) {
        const colorScheme = this.colors[type] || this.colors.health;
        
        // Explosão de partículas
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i;
            const speed = 2 + Math.random() * 4;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 5 + 2,
                life: 50,
                maxLife: 50,
                color: colorScheme.particles[Math.floor(Math.random() * colorScheme.particles.length)],
                type: type
            });
        }
        
        // Ondas de choque
        this.createShockwave(x, y, colorScheme.glow, ctx);
    },
    
    // Criar onda de choque visual
    createShockwave(x, y, color, ctx) {
        let radius = 0;
        let alpha = 1;
        const maxRadius = 80;
        
        const animate = () => {
            if (radius < maxRadius && ctx && ctx.canvas) {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                
                radius += 4;
                alpha -= 0.04;
            }
        };
        
        for (let i = 0; i < 20; i++) {
            setTimeout(animate, i * 16);
        }
    }
};
