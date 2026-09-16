// ===== MELHORIAS VISUAIS AVANÇADAS - DRAGON FURY ENHANCED =====

// Sistema de Rastro do Dragão (Trail Effect)
class DragonTrail {
    constructor() {
        this.trails = [];
        this.maxTrails = 15;
    }
    
    addTrail(x, y, color = 'rgba(255, 107, 53, 0.5)') {
        this.trails.push({
            x: x,
            y: y,
            opacity: 1,
            size: 8,
            color: color,
            life: 20
        });
        
        if (this.trails.length > this.maxTrails) {
            this.trails.shift();
        }
    }
    
    update() {
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.life--;
            trail.opacity = trail.life / 20;
            trail.size *= 0.95;
            
            if (trail.life <= 0) {
                this.trails.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        this.trails.forEach(trail => {
            ctx.globalAlpha = trail.opacity;
            
            // Gradiente radial para o rastro
            const gradient = ctx.createRadialGradient(
                trail.x, trail.y, 0,
                trail.x, trail.y, trail.size
            );
            gradient.addColorStop(0, trail.color.replace('0.5', String(trail.opacity)));
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
}

// Sistema de Partículas de Impulso (Boost Particles)
class BoostParticles {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, vx, vy) {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: vx + (Math.random() - 0.5) * 2,
                vy: vy + Math.random() * 2 + 1,
                size: Math.random() * 4 + 2,
                life: 30,
                maxLife: 30,
                color: Math.random() > 0.5 ? '#FF6B35' : '#FFD700'
            });
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vy += 0.1; // Gravidade
            p.size *= 0.97;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            
            // Gradiente para as partículas
            const gradient = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size
            );
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Brilho extra
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fill();
        });
        ctx.restore();
    }
}

// Sistema de Aura de Power-Up Melhorado
class PowerUpAura {
    constructor() {
        this.rings = [];
        this.particles = [];
    }
    
    createRing(x, y, color) {
        this.rings.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: 60,
            opacity: 1,
            color: color,
            speed: 2
        });
    }
    
    createParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                size: 3,
                life: 40,
                maxLife: 40,
                color: color
            });
        }
    }
    
    update() {
        // Atualizar anéis
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const ring = this.rings[i];
            ring.radius += ring.speed;
            ring.opacity = 1 - (ring.radius / ring.maxRadius);
            
            if (ring.radius >= ring.maxRadius) {
                this.rings.splice(i, 1);
            }
        }
        
        // Atualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Desenhar anéis
        this.rings.forEach(ring => {
            ctx.globalAlpha = ring.opacity;
            ctx.strokeStyle = ring.color;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = ring.color;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // Desenhar partículas
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
}

// Inicializar sistemas
if (typeof window !== 'undefined') {
    window.dragonTrail = new DragonTrail();
    window.boostParticles = new BoostParticles();
    window.powerUpAura = new PowerUpAura();
    
    console.log('✨ Sistemas de efeitos visuais avançados carregados!');
}
