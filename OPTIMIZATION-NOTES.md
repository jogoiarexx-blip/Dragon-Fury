# Dragon Fury - Otimizações v2.4

- Gameplay limitado a 60 FPS para evitar renderização duplicada em monitores 120/144/165 Hz.
- Colisões circulares usam distância ao quadrado, evitando `Math.sqrt()` no hot path.
- Culling de inimigos, projéteis e partículas fora da área visível.
- Limite de partículas ligado à qualidade gráfica (Auto/Baixo/Médio/Alto).
- Explosões, impactos, moedas e power-ups usam quantidades adaptativas de partículas.
- Qualidade baixa reduz `shadowBlur`, trails, ondas de choque e partículas secundárias.
- Efeitos ambientais (fogo, warp, caos e névoa) usam menos objetos no modo Baixo/Médio.
- Recompensa total da chuva de moedas do boss preservada mesmo com menos objetos visuais.
- Dificuldade, vida, dano, número máximo de inimigos e comportamento de boss não foram reduzidos.
