// ===== SISTEMA DE IA DOS INIMIGOS =====

const enemyAI = {
    // Atualizar comportamento de ataque de um inimigo
    updateAttackBehavior(enemy) {
        if (!enemy.canShoot) return;
        
        // Incrementar timer
        enemy.shootTimer++;
        
        // Verificar se pode atirar
        if (enemy.shootTimer >= enemy.shootCooldown) {
            this.performAttack(enemy);
            enemy.shootTimer = 0;
        }
    },
    
    // Executar ataque
    performAttack(enemy) {
        if (!enemy.shootPattern || !enemy.projectileType) return;
        
        // Verificar se está na tela visível
        if (enemy.y < -20 || enemy.y > gameData.canvas.height + 20) return;
        
        // Executar padrão de ataque
        const pattern = enemyProjectiles.patterns[enemy.shootPattern];
        if (pattern) {
            pattern(enemy, enemy.projectileType);
        }
        
        // Efeito visual de disparo
        this.createMuzzleFlash(enemy);
    },
    
    // Efeito visual de disparo
    createMuzzleFlash(enemy) {
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height;
        
        // Partículas do disparo
        for (let i = 0; i < 5; i++) {
            gameEntities.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2 + 1,
                size: Math.random() * 3 + 1,
                color: enemy.color,
                life: 10,
                alpha: 0.8
            });
        }
    },
    
    // Sistema de decisão de ataque avançado
    decideAttackStrategy(enemy) {
        if (!enemy.aggressive) return;
        
        // Calcular distância até o jogador
        const dx = dragon.x - enemy.x;
        const dy = dragon.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Ajustar cooldown baseado na distância
        if (distance < 200 && enemy.aggressive) {
            // Mais agressivo quando perto
            enemy.shootCooldown = Math.max(30, enemy.shootCooldown * 0.8);
        }
        
        // Mudar padrão baseado em vida
        if (enemy.health < enemy.maxHealth * 0.3) {
            // Modo desespero - ataque frenético
            if (enemy.shootPattern !== 'circle' && enemy.shootPattern !== 'burst') {
                enemy.shootCooldown *= 0.7;
            }
        }
    },
    
    // Lógica de esquiva (para inimigos mais inteligentes)
    updateDodgeBehavior(enemy) {
        if (!enemy.aggressive || Math.random() > 0.01) return;
        
        // Verificar se há projéteis do jogador próximos
        gameEntities.fireballs.forEach(fireball => {
            if (fireball.type !== 'player') return;
            
            const dx = fireball.x - enemy.x;
            const dy = fireball.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Se projétil está próximo, tentar esquivar
            if (distance < 100) {
                // Mover perpendicular à trajetória do projétil
                const dodgeX = -dy / distance * 5;
                enemy.x += dodgeX;
                
                // Manter dentro dos limites
                enemy.x = Math.max(0, Math.min(gameData.canvas.width - enemy.width, enemy.x));
            }
        });
    },
    
    // Sistema de formação (inimigos coordenam ataques)
    updateFormationAttack(enemies) {
        if (enemies.length < 3) return;
        
        // A cada 5 segundos, coordenar um ataque em formação
        if (Math.random() < 0.003) {
            let formation = enemies.slice(0, Math.min(5, enemies.length));
            
            formation.forEach((enemy, index) => {
                if (!enemy.canShoot) return;
                
                // Sincronizar tiro
                setTimeout(() => {
                    if (enemy.state === 'active') {
                        enemyProjectiles.patterns.aimed(enemy, enemy.projectileType);
                    }
                }, index * 100); // Delay sequencial
            });
        }
    },
    
    // Atualizar todos os inimigos
    updateAll(enemies) {
        // Atualizar comportamento individual
        enemies.forEach(enemy => {
            this.updateAttackBehavior(enemy);
            this.decideAttackStrategy(enemy);
            this.updateDodgeBehavior(enemy);
        });
        
        // Comportamentos de grupo
        this.updateFormationAttack(enemies);
    }
};

// Sistema de renderização de inimigos com visual melhorado
const enemyRenderer = {
    // Desenhar inimigo individual
    draw(ctx, enemy) {
        ctx.save();
        
        // Flash de dano
        if (enemy.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#FFFFFF';
            enemy.hitFlash--;
        } else {
            ctx.fillStyle = enemy.color;
        }
        
        // Phasing (transparência)
        if (enemy.phasing) {
            enemy.alphaPhase = (enemy.alphaPhase || 0) + 0.05;
            ctx.globalAlpha = Math.sin(enemy.alphaPhase) * 0.3 + 0.7;
        }
        
        // Desenhar corpo do inimigo baseado no tipo
        this.drawEnemyShape(ctx, enemy);
        
        // Barra de vida
        if (enemy.health < enemy.maxHealth) {
            this.drawHealthBar(ctx, enemy);
        }
        
        // Indicador de escudo
        if (enemy.shield) {
            this.drawShield(ctx, enemy);
        }
        
        // Nome (quando próximo)
        if (Math.abs(enemy.y - dragon.y) < 150) {
            this.drawName(ctx, enemy);
        }
        
        ctx.restore();
    },
    
    // Desenhar forma do inimigo
    drawEnemyShape(ctx, enemy) {
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height / 2;
        
        // Animação de batida de asas
        enemy.animationFrame = (enemy.animationFrame || 0) + 0.1;
        const wingFlap = Math.sin(enemy.animationFrame) * 3;
        
        // Corpo principal
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Asas (se for voador)
        if (!enemy.name || enemy.name.toLowerCase().includes('dragão') || 
            enemy.name.toLowerCase().includes('fênix') ||
            enemy.name.toLowerCase().includes('águia') ||
            enemy.name.toLowerCase().includes('falcão')) {
            
            ctx.fillStyle = this.adjustBrightness(enemy.color, -20);
            
            // Asa esquerda
            ctx.beginPath();
            ctx.ellipse(
                centerX - enemy.width / 2,
                centerY,
                enemy.width / 3,
                enemy.height / 2 + wingFlap,
                -Math.PI / 6,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Asa direita
            ctx.beginPath();
            ctx.ellipse(
                centerX + enemy.width / 2,
                centerY,
                enemy.width / 3,
                enemy.height / 2 + wingFlap,
                Math.PI / 6,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Detalhes adicionais (olhos)
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(centerX - enemy.width / 4, centerY - enemy.height / 6, 3, 0, Math.PI * 2);
        ctx.arc(centerX + enemy.width / 4, centerY - enemy.height / 6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Brilho se for tipo energia
        if (enemy.name && (enemy.name.includes('Alien') || 
            enemy.name.includes('Cósmico') ||
            enemy.name.includes('Plasma'))) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = enemy.color;
            ctx.strokeStyle = this.adjustBrightness(enemy.color, 50);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    },
    
    // Desenhar barra de vida
    drawHealthBar(ctx, enemy) {
        const barWidth = enemy.width;
        const barHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(enemy.x - 2, enemy.y - 12, barWidth + 4, barHeight + 2);
        
        const gradient = ctx.createLinearGradient(enemy.x, 0, enemy.x + barWidth * healthPercent, 0);
        if (healthPercent > 0.6) {
            gradient.addColorStop(0, '#00FF00');
            gradient.addColorStop(1, '#7FFF00');
        } else if (healthPercent > 0.3) {
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
        } else {
            gradient.addColorStop(0, '#FF4500');
            gradient.addColorStop(1, '#FF0000');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(enemy.x, enemy.y - 11, barWidth * healthPercent, barHeight);
    },
    
    // Desenhar escudo
    drawShield(ctx, enemy) {
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height / 2;
        
        const shieldPulse = Math.sin(Date.now() * 0.005) * 5;
        
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00CCFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, enemy.width / 2 + 10 + shieldPulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    },
    
    // Desenhar nome
    drawName(ctx, enemy) {
        if (!enemy.name) return;
        
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000000';
        ctx.fillText(enemy.name, enemy.x + enemy.width / 2, enemy.y - 20);
        ctx.shadowBlur = 0;
    },
    
    // Ajustar brilho da cor
    adjustBrightness(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
};
