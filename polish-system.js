// ===== POLISH / PERFORMANCE / CAMERA / UX - DRAGON FURY v2 =====
const gameStateManager = {
    set(state) { gameData.gameState = state; document.body.dataset.gameState = state; },
    get() { return gameData.gameState; },
    is(state) { return gameData.gameState === state; }
};

const polishSystem = {
    settings: { quality:'auto', shake:true, hitstop:true, particles:true },
    effectiveQuality:'high', fps:60, fpsFrames:0, fpsLast:performance.now(),
    camera:{x:0,y:0,power:0,until:0}, hitStopUntil:0, lastImpactStop:0,
    bossIntro:{active:false,start:0,duration:5000,name:'',boss:null,healthReveal:0,phase:'idle'}, initialized:false,

    init(){
        if(this.initialized) return;
        this.loadSettings(); this.bindSettings(); this.wrapGameFlow(); this.wrapCombat(); this.installHud(); this.disableLegacyBossHud(); this.updateMenuStats();
        this.applyQuality(true); this.initialized=true;
    },
    loadSettings(){
        try { const saved=JSON.parse(localStorage.getItem('dragonPolishSettings')||'{}'); Object.assign(this.settings,saved); } catch(e){}
    },
    saveSettings(){ localStorage.setItem('dragonPolishSettings',JSON.stringify(this.settings)); },
    bindSettings(){
        const q=document.getElementById('quality-select'), sh=document.getElementById('shake-toggle'), hs=document.getElementById('hitstop-toggle'), pt=document.getElementById('particles-toggle');
        if(q){q.value=this.settings.quality;q.onchange=()=>{this.settings.quality=q.value;this.saveSettings();this.applyQuality(true);};}
        if(sh){sh.checked=this.settings.shake;sh.onchange=()=>{this.settings.shake=sh.checked;this.saveSettings();};}
        if(hs){hs.checked=this.settings.hitstop;hs.onchange=()=>{this.settings.hitstop=hs.checked;this.saveSettings();};}
        if(pt){pt.checked=this.settings.particles;pt.onchange=()=>{this.settings.particles=pt.checked;this.saveSettings();};}
    },
    detectQuality(){
        const cores=navigator.hardwareConcurrency||4, mem=navigator.deviceMemory||4;
        if(cores<=2||mem<=2) return 'low'; if(cores<=4||mem<=4) return 'medium'; return 'high';
    },
    applyQuality(force=false){
        let q=this.settings.quality==='auto'?this.detectQuality():this.settings.quality;
        if(this.settings.quality==='auto' && !force){ if(this.fps<43) q='low'; else if(this.fps<54 && q==='high') q='medium'; }
        this.effectiveQuality=q;
        document.body.dataset.quality=q;
        if(typeof menuSystem!=='undefined') menuSystem.setQuality(q);
        const el=document.getElementById('settings-quality'); if(el) el.textContent=q.toUpperCase();
    },
    tickFps(now){
        this.fpsFrames++;
        if(now-this.fpsLast>=1000){ this.fps=Math.round(this.fpsFrames*1000/(now-this.fpsLast)); this.fpsFrames=0; this.fpsLast=now;
            ['settings-fps','menu-performance'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=this.fps+' FPS';});
            if(this.settings.quality==='auto') this.applyQuality(false);
        }
    },
    getParticleLimit(){ return !this.settings.particles?18:this.effectiveQuality==='low'?55:this.effectiveQuality==='medium'?95:150; },
    openSettings(){ const p=document.getElementById('settings-panel'); if(p)p.style.display='flex'; },
    closeSettings(){ const p=document.getElementById('settings-panel'); if(p)p.style.display='none'; },
    shake(power=8,duration=180){ if(!this.settings.shake)return; this.camera.power=Math.max(this.camera.power,power); this.camera.until=performance.now()+duration; },
    getCameraOffset(){
        let x=0,y=0;
        if(this.settings.shake&&performance.now()<=this.camera.until){const p=this.camera.power;x+=(Math.random()-.5)*p*2;y+=(Math.random()-.5)*p*2;}else this.camera.power=0;
        // Durante a entrada, a câmera acompanha a descida do boss de forma suave.
        if(this.bossIntro.active&&this.bossIntro.boss){
            const age=performance.now()-this.bossIntro.start;
            if(age>=1450&&age<=3900){
                const bossCenter=this.bossIntro.boss.y+this.bossIntro.boss.height/2;
                const follow=Math.max(-14,Math.min(24,(210-bossCenter)*0.06));
                const fade=Math.min(1,(age-1450)/450,Math.max(0,(3900-age)/600));
                y+=follow*fade;
            }
        }
        return{x,y};
    },
    getCinematicScale(){
        if(!this.bossIntro.active)return 1;
        const age=performance.now()-this.bossIntro.start;
        if(age<1200||age>4300)return 1;
        const up=Math.min(1,(age-1200)/900),down=Math.min(1,(4300-age)/900);
        return 1+0.055*Math.max(0,Math.min(up,down));
    },
    hitStop(ms=28){ if(!this.settings.hitstop)return; const now=performance.now(); this.hitStopUntil=Math.max(this.hitStopUntil,now+ms); },
    easeOutCubic(t){return 1-Math.pow(1-Math.max(0,Math.min(1,t)),3);},
    startBossIntro(name){
        const boss=gameEntities.boss;
        if(!boss)return;
        const now=performance.now();
        this.bossIntro={active:true,start:now,duration:5000,name:name||boss.name||'AMEAÇA DESCONHECIDA',boss,healthReveal:0,phase:'warning'};
        boss.state='cinematic'; boss.invulnerable=true; boss.y=-220; boss.x=gameData.canvas.width/2-boss.width/2;

        // Limpa a arena sem contabilizar eliminações extras: inimigos restantes
        // viram um pequeno efeito de dispersão e projéteis desaparecem.
        const leftovers=gameEntities.enemies.slice();
        leftovers.forEach(e=>{const cx=e.x+(e.width||20)/2,cy=e.y+(e.height||20)/2;for(let i=0;i<5;i++)gameEntities.particles.push({x:cx,y:cy,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,size:Math.random()*3+2,color:e.color||'#ff8a42',life:24});});
        gameEntities.enemies.length=0;
        gameEntities.fireballs.length=0;
        if(gameEntities.enemyProjectiles)gameEntities.enemyProjectiles.length=0;

        this.shake(9,420);
        if(typeof audioSystem!=='undefined'){
            if(audioSystem.duckForBossIntro)audioSystem.duckForBossIntro();
            audioSystem.playBossWarning();
        }
    },
    updateBossIntro(){
        if(!this.bossIntro.active)return false;
        const intro=this.bossIntro,b=intro.boss,age=performance.now()-intro.start;
        if(!b||!gameData.bossActive){this.cancelBossIntro();return false;}

        // Mantém apenas os sistemas visuais vivos; gameplay, colisão, spawn,
        // jogador e IA permanecem congelados até o FIGHT.
        if(typeof parallaxSystem!=='undefined')parallaxSystem.update();
        if(typeof phaseEffects!=='undefined')phaseEffects.update();

        if(age<650)intro.phase='clear';
        else if(age<1500)intro.phase='warning';
        else if(age<3300){
            intro.phase='entrance';
            const t=this.easeOutCubic((age-1500)/1800);
            b.y=-220+(58+220)*t;
            b.x=gameData.canvas.width/2-b.width/2;
            if(age>=1550&&!intro.revealSound){intro.revealSound=true;if(typeof audioSystem!=='undefined'&&audioSystem.playBossReveal)audioSystem.playBossReveal();}
        }else if(age<4400){
            intro.phase='reveal'; b.y=58; b.x=gameData.canvas.width/2-b.width/2;
            intro.healthReveal=this.easeOutCubic((age-3300)/900);
        }else if(age<5000){
            intro.phase='fight'; b.y=58; intro.healthReveal=1;
            if(!intro.fightSound){intro.fightSound=true;this.shake(13,260);if(typeof audioSystem!=='undefined'&&audioSystem.playFight)audioSystem.playFight();}
        }else{
            this.finishBossIntro();
        }
        return true;
    },
    finishBossIntro(){
        const intro=this.bossIntro,b=intro.boss;
        if(b){b.y=58;b.state='active';b.invulnerable=false;b.stateTimer=0;b.patternTimer=0;}
        intro.active=false;intro.phase='done';intro.healthReveal=1;
        if(typeof audioSystem!=='undefined'&&audioSystem.restoreAfterBossIntro)audioSystem.restoreAfterBossIntro();
    },
    cancelBossIntro(){
        if(this.bossIntro.boss){this.bossIntro.boss.invulnerable=false;}
        this.bossIntro.active=false;this.bossIntro.phase='idle';
        if(typeof audioSystem!=='undefined'&&audioSystem.restoreAfterBossIntro)audioSystem.restoreAfterBossIntro();
    },
    drawBossIntro(ctx){
        if(!this.bossIntro.active)return;
        const intro=this.bossIntro,age=performance.now()-intro.start,w=gameData.canvas.width,h=gameData.canvas.height;
        ctx.save();
        // escurecimento + letterbox cinematográfico
        const darkness=age<500?0.44*(age/500):age>4550?0.44*Math.max(0,(5000-age)/450):0.44;
        ctx.fillStyle=`rgba(1,2,8,${darkness})`;ctx.fillRect(0,0,w,h);
        const bars=Math.min(1,age/400);ctx.fillStyle='rgba(0,0,0,.92)';ctx.fillRect(0,0,w,44*bars);ctx.fillRect(0,h-44*bars,w,44*bars);

        ctx.textAlign='center';
        if(age>=650&&age<1850){
            const a=Math.min(1,(age-650)/180,Math.max(0,(1850-age)/280));
            ctx.globalAlpha=a;ctx.fillStyle='rgba(9,5,8,.88)';ctx.fillRect(0,245,w,158);
            ctx.fillStyle='#ff3b24';ctx.fillRect(0,245,w,3);ctx.fillRect(0,400,w,3);
            ctx.shadowBlur=20;ctx.shadowColor='#ff351e';ctx.fillStyle='#ffb02f';ctx.font='900 20px Arial';ctx.fillText('⚠ ALERTA DE AMEAÇA',w/2,304);
            ctx.shadowBlur=0;ctx.fillStyle='#d9dce4';ctx.font='700 12px Arial';ctx.fillText('ASSINATURA HOSTIL DE ALTA POTÊNCIA DETECTADA',w/2,341);
            ctx.fillStyle='#8e96aa';ctx.font='700 10px Arial';ctx.fillText('ARENA BLOQUEADA • SISTEMAS DE COMBATE EM ESPERA',w/2,370);
            ctx.globalAlpha=1;
        }
        if(age>=2550&&age<4550){
            const a=Math.min(1,(age-2550)/350,Math.max(0,(4550-age)/300));ctx.globalAlpha=a;
            ctx.shadowBlur=18;ctx.shadowColor='#ff3b18';ctx.fillStyle='#fff';ctx.font='900 32px Arial';ctx.fillText(intro.name.toUpperCase(),w/2,470);ctx.shadowBlur=0;
            ctx.fillStyle='#8c96aa';ctx.font='800 10px Arial';ctx.fillText('ALVO PRIORITÁRIO',w/2,493);ctx.globalAlpha=1;
        }
        // Barra enche de zero até 100%, representando a inicialização do confronto.
        if(age>=3300){
            const p=Math.max(0,Math.min(1,intro.healthReveal||0));
            ctx.fillStyle='rgba(5,4,9,.9)';this.roundRect(ctx,78,516,444,48,10);ctx.fill();
            ctx.fillStyle='rgba(255,255,255,.12)';this.roundRect(ctx,103,541,394,9,5);ctx.fill();
            if(p>0){const g=ctx.createLinearGradient(103,0,497,0);g.addColorStop(0,'#b80e22');g.addColorStop(1,'#ff6239');ctx.fillStyle=g;this.roundRect(ctx,103,541,394*p,9,5);ctx.fill();}
            ctx.fillStyle='#ff754e';ctx.font='900 10px Arial';ctx.fillText('INTEGRIDADE DO BOSS',w/2,535);
        }
        if(age>=4400){
            const pulse=1+Math.sin((age-4400)*0.025)*0.055;ctx.save();ctx.translate(w/2,650);ctx.scale(pulse,pulse);ctx.shadowBlur=28;ctx.shadowColor='#ff4a20';ctx.fillStyle='#fff4d7';ctx.font='900 48px Arial';ctx.fillText('FIGHT!',0,0);ctx.restore();
        }
        ctx.restore();
    },
    updateMenuStats(){
        const coins=document.getElementById('menu-coins'); if(coins)coins.textContent=gameStats.coins||0;
        const ac=document.getElementById('menu-achievements'); if(ac)ac.textContent=(typeof achievements!=='undefined'?achievements.filter(a=>a.unlocked).length:0)+'/'+(typeof achievements!=='undefined'?achievements.length:0);
        const stage=Math.max(1,Math.min(5,gameStats.maxStageReached||1)), name=document.getElementById('continue-stage-name'); if(name&&typeof stages!=='undefined'&&stages[stage])name.textContent=stages[stage].name;
    },
    wrapGameFlow(){
        const wrap=(name,before,after)=>{const old=game[name];if(typeof old!=='function')return;game[name]=function(...args){if(before)before();const r=old.apply(game,args);if(after)after(r);return r;};};
        wrap('startGame',()=>{polishSystem.cancelBossIntro();if(typeof menuSystem!=='undefined')menuSystem.stop();gameStateManager.set('playing');});
        wrap('startAtStage',()=>{if(typeof menuSystem!=='undefined')menuSystem.stop();});
        wrap('returnToMenu',()=>polishSystem.cancelBossIntro(),()=>{gameStateManager.set('menu');if(typeof menuSystem!=='undefined')menuSystem.start();polishSystem.updateMenuStats();});
        wrap('pauseGame',null,()=>gameStateManager.set('paused'));
        wrap('resumeGame',()=>gameStateManager.set('playing'));
        const oldUpdate=game.update.bind(game);
        game.update=function(){ if(polishSystem.updateBossIntro())return; if(performance.now()<polishSystem.hitStopUntil)return; oldUpdate(); const lim=polishSystem.getParticleLimit(); if(gameEntities.particles.length>lim)gameEntities.particles.splice(0,gameEntities.particles.length-lim); };
        const oldDraw=game.draw.bind(game);
        game.draw=function(){ polishSystem.tickFps(performance.now()); oldDraw(); polishSystem.drawProjectileTrails(gameData.ctx); polishSystem.drawBossIntro(gameData.ctx); };
    },
    wrapCombat(){
        if(typeof collisionSystem!=='undefined'&&collisionSystem.createImpactEffect){const old=collisionSystem.createImpactEffect.bind(collisionSystem);collisionSystem.createImpactEffect=function(...args){const r=old(...args);const now=performance.now();if(now-polishSystem.lastImpactStop>140){polishSystem.hitStop(22);polishSystem.lastImpactStop=now;}return r;};}
        if(typeof phaseSystem!=='undefined'&&phaseSystem.spawnBoss){const old=phaseSystem.spawnBoss.bind(phaseSystem);phaseSystem.spawnBoss=function(...args){const was=gameData.bossActive,r=old(...args);if(!was&&gameData.bossActive&&gameEntities.boss)polishSystem.startBossIntro(gameEntities.boss.name);return r;};}
        if(typeof dragon!=='undefined'&&dragon.takeDamage){const old=dragon.takeDamage.bind(dragon);dragon.takeDamage=function(...args){polishSystem.shake(7,180);polishSystem.hitStop(32);return old(...args);};}
    },
    drawProjectileTrails(ctx){
        if(this.effectiveQuality==='low')return; ctx.save();ctx.lineCap='round';
        gameEntities.fireballs.forEach(f=>{const vx=f.vx||0,vy=f.vy!==undefined?f.vy:(f.type==='player'?-f.speed:f.speed),m=Math.hypot(vx,vy)||1;const len=f.type==='player'?18:12;ctx.globalAlpha=.22;ctx.strokeStyle=f.color||(f.type==='player'?'#ffb23d':'#ff394f');ctx.lineWidth=Math.max(2,(f.width||8)*.45);ctx.beginPath();ctx.moveTo(f.x+(f.width||8)/2,f.y+(f.height||8)/2);ctx.lineTo(f.x+(f.width||8)/2-vx/m*len,f.y+(f.height||8)/2-vy/m*len);ctx.stroke();});ctx.restore();
    },
    disableLegacyBossHud(){
        // O boss-system antigo desenhava outra barra sobre o novo HUD.
        try { if (typeof BaseBoss !== 'undefined') BaseBoss.prototype.drawHealthBar = function(){}; } catch(e){}
    },
    installHud(){
        if(typeof hudSystem==='undefined')return;
        hudSystem.draw=(ctx)=>this.drawHud(ctx);
    },
    roundRect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();},
    drawHud(ctx){
        const max=100+(upgrades.health.level*20), hp=Math.max(0,Math.min(1,gameStats.health/max)), stage=phaseSystem.getCurrentPhase?phaseSystem.getCurrentPhase():stages[gameData.currentStage];
        ctx.save();
        // compact top deck
        ctx.fillStyle='rgba(5,7,16,.72)';this.roundRect(ctx,12,12,576,72,12);ctx.fill();ctx.strokeStyle='rgba(255,173,49,.24)';ctx.stroke();
        ctx.fillStyle='#9ba6bc';ctx.font='700 9px Arial';ctx.fillText('INTEGRIDADE',28,31);ctx.fillStyle='rgba(255,255,255,.12)';this.roundRect(ctx,28,39,214,14,7);ctx.fill();
        const hg=ctx.createLinearGradient(28,0,242,0);hg.addColorStop(0,hp>.3?'#ffb62f':'#ff3e38');hg.addColorStop(1,hp>.5?'#ff6b25':'#b51624');ctx.fillStyle=hg;this.roundRect(ctx,28,39,214*hp,14,7);ctx.fill();
        ctx.fillStyle='#fff';ctx.font='800 10px Arial';ctx.fillText(Math.ceil(gameStats.health)+' / '+max,28,68);
        ctx.textAlign='right';ctx.fillStyle='#ffd258';ctx.font='900 18px Arial';ctx.fillText('🪙 '+gameStats.coins,568,37);ctx.fillStyle='#e7ebf4';ctx.font='800 12px Arial';ctx.fillText(String(gameStats.score).padStart(7,'0'),568,59);
        ctx.textAlign='center';ctx.fillStyle='#7f8aa1';ctx.font='700 9px Arial';ctx.fillText('FASE '+gameData.currentStage,330,31);ctx.fillStyle='#fff';ctx.font='800 12px Arial';ctx.fillText((stage&&stage.name)||'',330,50);
        const target=Math.max(1,gameData.stageTargetKills||1), prog=Math.min(1,gameData.enemiesKilledThisStage/target);ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(278,62,104,3);ctx.fillStyle='#ff9c28';ctx.fillRect(278,62,104*prog,3);
        // rank pill
        if(typeof rankSystem!=='undefined'){const rr=rankSystem.getCurrentRank?rankSystem.getCurrentRank():'C'; const rank=(rr&&rr.letter)||rr||'C';ctx.textAlign='left';ctx.fillStyle='rgba(5,7,16,.75)';this.roundRect(ctx,12,94,88,34,9);ctx.fill();ctx.fillStyle='#ffd34a';ctx.font='900 16px Arial';ctx.fillText('RANK '+rank,25,117);}
        // active powerup
        if(gameStats.powerUpActive){ctx.textAlign='right';ctx.fillStyle='rgba(5,7,16,.76)';this.roundRect(ctx,410,94,178,34,9);ctx.fill();ctx.fillStyle='#62f3ff';ctx.font='800 11px Arial';ctx.fillText('⚡ '+gameStats.powerUpActive.replace('_',' ').toUpperCase(),575,116);}
        // boss bar
        if(gameData.bossActive&&gameEntities.boss&&!this.bossIntro.active){const b=gameEntities.boss,bp=Math.max(0,b.health/b.maxHealth);ctx.textAlign='center';ctx.fillStyle='rgba(7,5,10,.88)';this.roundRect(ctx,75,142,450,54,10);ctx.fill();ctx.fillStyle='#ff6542';ctx.font='900 12px Arial';ctx.fillText((b.name||b.stageName||'BOSS').toUpperCase(),300,161);ctx.fillStyle='rgba(255,255,255,.12)';this.roundRect(ctx,98,171,404,9,5);ctx.fill();ctx.fillStyle='#e8352c';this.roundRect(ctx,98,171,404*bp,9,5);ctx.fill();}
        // combo
        if(gameData.comboCount>1){ctx.textAlign='center';ctx.fillStyle='#ffd45a';ctx.font='900 24px Arial';ctx.shadowBlur=10;ctx.shadowColor='#ff6a20';ctx.fillText('COMBO '+gameData.comboCount+'x',300,748);ctx.shadowBlur=0;}
        ctx.restore();
    }
};

document.addEventListener('DOMContentLoaded',()=>polishSystem.init());
