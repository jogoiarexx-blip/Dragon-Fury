// ===== GEO-UTILS: helpers de polígonos para inimigos e bosses =====
// 🔧 NOVO: antes, a maioria dos corpos de inimigos/bosses era desenhada com
// ctx.arc()/ctx.ellipse() (curvas lisas). Estas funções desenham polígonos
// regulares (e "gemas" com pontas) que são usadas no lugar dessas curvas
// para dar um visual mais facetado/anguloso aos inimigos e chefes.

// Desenha (sem preencher/traçar) um polígono regular de N lados,
// centrado em (x, y), com raio `radius` e rotação opcional em radianos.
function drawPolygonPath(ctx, x, y, radius, sides, rotation = 0) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 / sides) * i + rotation;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

// Desenha um polígono "gema/estrela": alterna entre raio externo e interno
// a cada vértice, criando pontas — bom para núcleos/cristais mais agressivos.
function drawGemPath(ctx, x, y, outerRadius, innerRadius, points, rotation = 0) {
    ctx.beginPath();
    const total = points * 2;
    for (let i = 0; i < total; i++) {
        const angle = (Math.PI / points) * i + rotation;
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

// Atalho: polígono já preenchido com o fillStyle atual
function fillPolygon(ctx, x, y, radius, sides, rotation = 0) {
    drawPolygonPath(ctx, x, y, radius, sides, rotation);
    ctx.fill();
}

// Atalho: pequeno diamante (losango) — usado em detalhes pequenos
// (escamas, cristais) que antes eram pontinhos circulares (ctx.arc).
function fillDiamond(ctx, x, y, radius, rotation = 0) {
    fillPolygon(ctx, x, y, radius, 4, rotation + Math.PI / 4);
}

// 🔧 NOVO: polígono preenchido com gradiente radial (centro mais claro,
// borda na cor base) — dá um acabamento "metálico"/3D em vez de cor chapada,
// além de facetado. Usado nos corpos de inimigos e bosses.
function fillPolygonGradient(ctx, x, y, radius, sides, colorCenter, colorEdge, rotation = 0) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, colorCenter);
    gradient.addColorStop(1, colorEdge);
    ctx.fillStyle = gradient;
    fillPolygon(ctx, x, y, radius, sides, rotation);
}

// 🔧 NOVO: contorno facetado com brilho sutil — dá definição às bordas
// dos polígonos (sem isso, um polígono preenchido liso pode parecer "chapado")
function strokePolygon(ctx, x, y, radius, sides, color, lineWidth = 1.5, rotation = 0) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    drawPolygonPath(ctx, x, y, radius, sides, rotation);
    ctx.stroke();
}

// 🔧 NOVO: desenha um tiro/bola de fogo como um "cristal" alongado
// orientado na direção do movimento, em vez de um quadrado liso.
// (x, y) = centro, size = raio aproximado, angle = direção do movimento em radianos.
function drawFireballShape(ctx, x, y, size, angle, colorCore, colorEdge) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    const gradient = ctx.createRadialGradient(0, -size * 0.2, 0, 0, 0, size * 1.6);
    gradient.addColorStop(0, colorCore);
    gradient.addColorStop(0.6, colorEdge);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.5);       // ponta frontal (direção do movimento)
    ctx.lineTo(size * 0.55, -size * 0.1);
    ctx.lineTo(size * 0.3, size * 1.1);  // cauda
    ctx.lineTo(-size * 0.3, size * 1.1);
    ctx.lineTo(-size * 0.55, -size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

if (typeof window !== 'undefined') {
    window.drawPolygonPath = drawPolygonPath;
    window.drawGemPath = drawGemPath;
    window.fillPolygon = fillPolygon;
    window.fillDiamond = fillDiamond;
    window.fillPolygonGradient = fillPolygonGradient;
    window.strokePolygon = strokePolygon;
    window.drawFireballShape = drawFireballShape;
}
