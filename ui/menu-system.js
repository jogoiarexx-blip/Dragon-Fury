// ===== MENU PRINCIPAL OTIMIZADO - DRAGON FURY =====
const menuSystem = {
    canvas: null, ctx: null, animationId: null, particles: [], embers: [],
    running: false, isInitialized: false, lastFrame: 0, targetInterval: 1000 / 30,
    mouseX: 300, mouseY: 400, quality: 'high',

    init() {
        if (this.isInitialized) return;
        const menu = document.getElementById('main-menu');
        if (!menu) return;
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'menuCanvas';
        this.canvas.width = 600; this.canvas.height = 800;
        menu.prepend(this.canvas);
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        menu.addEventListener('pointermove', e => {
            const r = menu.getBoundingClientRect();
            this.mouseX = (e.clientX - r.left) * 600 / r.width;
            this.mouseY = (e.clientY - r.top) * 800 / r.height;
        }, { passive: true });
        const low = /Android|iPhone|iPad/i.test(navigator.userAgent) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
        this.quality = low ? 'medium' : 'high';
        this.createParticles(low ? 38 : 62);
        this.createEmbers(low ? 18 : 32);
        this.isInitialized = true;
        this.start();
    },

    createParticles(count) {
        this.particles = Array.from({length: count}, () => ({
            x: Math.random()*600, y: Math.random()*800, r: Math.random()*1.8+.5,
            vx:(Math.random()-.5)*.12, vy:-(Math.random()*.28+.08), a:Math.random()*.4+.12,
            phase:Math.random()*Math.PI*2
        }));
    },
    createEmbers(count) {
        this.embers = Array.from({length: count}, () => ({
            x:Math.random()*600, y:Math.random()*800, r:Math.random()*2.8+1,
            vy:-(Math.random()*.7+.25), drift:(Math.random()-.5)*.25, a:Math.random()*.65+.2
        }));
    },
    start() {
        if (!this.isInitialized || this.running) return;
        this.running = true; this.lastFrame = 0;
        this.animationId = requestAnimationFrame(t => this.animate(t));
    },
    stop() {
        this.running = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animationId = null;
    },
    setQuality(q) {
        this.quality = q;
        const n = q === 'low' ? 22 : q === 'medium' ? 40 : 62;
        const e = q === 'low' ? 10 : q === 'medium' ? 20 : 32;
        this.createParticles(n); this.createEmbers(e);
    },
    update() {
        this.particles.forEach(p=>{
            p.x += p.vx; p.y += p.vy; p.phase += .02;
            if(p.y < -5){ p.y=805; p.x=Math.random()*600; }
            if(p.x < -5) p.x=605; if(p.x>605) p.x=-5;
        });
        this.embers.forEach(p=>{
            p.y += p.vy; p.x += p.drift + Math.sin(p.y*.02)*.1;
            if(p.y < -10){ p.y=810; p.x=Math.random()*600; }
        });
    },
    drawDragonSilhouette(ctx, t) {
        const px = (this.mouseX-300)*.015, py=(this.mouseY-400)*.008;
        ctx.save(); ctx.translate(430+px, 270+py); ctx.rotate(Math.sin(t*.0003)*.025);
        ctx.globalAlpha=.16;
        const g=ctx.createRadialGradient(0,0,20,0,0,190); g.addColorStop(0,'rgba(255,120,30,.55)'); g.addColorStop(1,'rgba(255,70,0,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,190,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=.28; ctx.fillStyle='#0a0711';
        ctx.beginPath(); ctx.moveTo(-30,-80); ctx.quadraticCurveTo(35,-125,72,-68); ctx.quadraticCurveTo(115,-28,70,5);
        ctx.quadraticCurveTo(108,30,72,70); ctx.quadraticCurveTo(28,112,-25,82); ctx.quadraticCurveTo(-80,118,-120,62);
        ctx.quadraticCurveTo(-155,15,-104,-24); ctx.quadraticCurveTo(-83,-50,-30,-80); ctx.fill();
        ctx.globalAlpha=.75; ctx.fillStyle='#ffb12d'; ctx.beginPath(); ctx.arc(47,-42,5,0,Math.PI*2); ctx.fill();
        ctx.restore();
    },
    draw(t) {
        const c=this.ctx; c.clearRect(0,0,600,800);
        const bg=c.createLinearGradient(0,0,0,800); bg.addColorStop(0,'rgba(5,7,18,.15)'); bg.addColorStop(1,'rgba(35,9,5,.25)'); c.fillStyle=bg; c.fillRect(0,0,600,800);
        c.save(); c.globalAlpha=.08; c.strokeStyle='#ffae31'; c.lineWidth=1;
        const off=(t*.012)%48; for(let y=-48+off;y<850;y+=48){ c.beginPath(); c.moveTo(0,y); c.lineTo(600,y); c.stroke(); }
        c.restore();
        this.drawDragonSilhouette(c,t);
        c.save();
        this.particles.forEach(p=>{ c.globalAlpha=p.a*(.7+.3*Math.sin(p.phase)); c.fillStyle='#ffd77a'; c.beginPath(); c.arc(p.x,p.y,p.r,0,Math.PI*2); c.fill(); });
        this.embers.forEach(p=>{ c.globalAlpha=p.a; c.fillStyle='#ff6b1b'; c.beginPath(); c.arc(p.x,p.y,p.r,0,Math.PI*2); c.fill(); });
        c.restore();
        c.fillStyle='rgba(255,100,20,.06)'; c.fillRect(0,690+Math.sin(t*.001)*8,600,110);
    },
    animate(t) {
        if(!this.running) return;
        if(!this.lastFrame || t-this.lastFrame>=this.targetInterval){ this.lastFrame=t; this.update(); this.draw(t); }
        this.animationId=requestAnimationFrame(n=>this.animate(n));
    }
};

document.addEventListener('DOMContentLoaded',()=>menuSystem.init());
