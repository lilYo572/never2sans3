'use strict';
/* N2S3 — script.js v3.0.0 */

// ── CONFIG ──────────────────────────────────────────────────
const CFG = {
  youtubeId: 'VIDEO_ID_ICI',
  targetDate: new Date('2026-06-17T11:00:00+02:00'),
  phaseCodes: { 'BRADDY-ALPHA':1,'BRADDY-BRAVO':2,'BRADDY-CHARLIE':3,'BRADDY-DELTA':4,'BRADDY-OMEGA':5 },
  costs: {
    gageSecondaire:      {hippolyte:15,nathanael:10,edwin:5,teo:10},
    laisserPasser:       {hippolyte:12,nathanael:8,edwin:4,teo:8},
    refaireRoue:         {hippolyte:8,nathanael:6,edwin:3,teo:6},
    doubleTimbre:        {hippolyte:20,nathanael:15,edwin:8,teo:15},
    imposerGage:         {hippolyte:18,nathanael:12,edwin:6,teo:12},
    declencherEvenement: {hippolyte:25,nathanael:18,edwin:10,teo:18},
  },
  initStock: {
    gageSecondaire:{hippolyte:1,nathanael:1,edwin:1,teo:1},
    laisserPasser:{hippolyte:1,nathanael:1,edwin:1,teo:1},
    refaireRoue:{hippolyte:2,nathanael:2,edwin:2,teo:2},
    doubleTimbre:{hippolyte:1,nathanael:1,edwin:1,teo:1},
    imposerGage:{hippolyte:1,nathanael:1,edwin:1,teo:1},
    declencherEvenement:{hippolyte:1,nathanael:1,edwin:1,teo:1},
  },
  phaseCoins:[0,10,10,15,15,20],
};

// ── STATE ────────────────────────────────────────────────────
function loadState() {
  try { const s=localStorage.getItem('n2s3'); if(s) return JSON.parse(s); } catch(e){}
  return {
    phase:0,
    coins:{hippolyte:0,nathanael:0,edwin:0,teo:0},
    stock:JSON.parse(JSON.stringify(CFG.initStock)),
    chatHistory:[],
    introComplete:false,
    chatBadge:0,
    lastView:'home',
  };
}
let S = loadState();
function save() { try{localStorage.setItem('n2s3',JSON.stringify(S));}catch(e){} }

// ── AUDIO ─────────────────────────────────────────────────────
let AC=null;
function initAudio(){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
function res(){if(AC?.state==='suspended')AC.resume();}
function beep(f=440,d=.1,v=.08,t='square'){if(!AC)return;res();try{const o=AC.createOscillator(),g=AC.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d);}catch(e){}}
function glitchSnd(v=.14){if(!AC)return;res();try{const sz=AC.sampleRate*.08,buf=AC.createBuffer(1,sz,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<sz;i++)d[i]=Math.random()*2-1;const src=AC.createBufferSource();src.buffer=buf;const g=AC.createGain(),bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1000+Math.random()*1000;bp.Q.value=2;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.08);src.connect(bp);bp.connect(g);g.connect(AC.destination);src.start();}catch(e){}}
function sweep(f0=80,f1=1400,dur=2.5,v=.12){if(!AC)return;res();try{const o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f0,AC.currentTime);o.frequency.exponentialRampToValueAtTime(f1,AC.currentTime+dur*.65);o.frequency.exponentialRampToValueAtTime(f0*.4,AC.currentTime+dur);g.gain.setValueAtTime(0,AC.currentTime);g.gain.linearRampToValueAtTime(v,AC.currentTime+.1);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+dur);}catch(e){}}
function impact(v=.28){if(!AC)return;res();try{const sz=AC.sampleRate*.4,buf=AC.createBuffer(1,sz,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<sz;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(AC.sampleRate*.09));const src=AC.createBufferSource();src.buffer=buf;const g=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=280;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.4);src.connect(lp);lp.connect(g);g.connect(AC.destination);src.start();}catch(e){}}
function drone(){if(!AC)return;res();try{const g=AC.createGain();g.gain.setValueAtTime(0,AC.currentTime);g.gain.linearRampToValueAtTime(.055,AC.currentTime+4);g.connect(AC.destination);[40,61,82].forEach((f,i)=>{const o=AC.createOscillator();o.type=i===0?'sawtooth':'sine';o.frequency.value=f;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=140;o.connect(lp);lp.connect(g);o.start();});}catch(e){}}

// ── PARTICLES ─────────────────────────────────────────────────
const cvBg=document.getElementById('cv-bg'),ctxBg=cvBg.getContext('2d');
let parts=[],pSpd=1;
function resizeBg(){cvBg.width=window.innerWidth;cvBg.height=window.innerHeight;}
function initParts(n=55){parts=Array.from({length:n},()=>({x:Math.random()*cvBg.width,y:Math.random()*cvBg.height,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.3+.2,a:Math.random()*.22+.03,c:Math.random()>.84?'#cc0000':'#fff'}));}
function tickParts(){ctxBg.clearRect(0,0,cvBg.width,cvBg.height);parts.forEach(p=>{p.x+=p.vx*pSpd;p.y+=p.vy*pSpd;if(p.x<0)p.x=cvBg.width;if(p.x>cvBg.width)p.x=0;if(p.y<0)p.y=cvBg.height;if(p.y>cvBg.height)p.y=0;ctxBg.beginPath();ctxBg.arc(p.x,p.y,p.r,0,Math.PI*2);ctxBg.fillStyle=p.c;ctxBg.globalAlpha=p.a;ctxBg.fill();});ctxBg.globalAlpha=1;requestAnimationFrame(tickParts);}

// ── LOGS ──────────────────────────────────────────────────────
const logsEl=document.getElementById('logs');
const LOGS=['> INITIALIZING BRAD PROTOCOL...','> Bradification level: UNSTABLE','> Synchronisation secteur Lille: OK','> Agent détecté — surveillance active','> OTacos incident: ARCHIVÉ [ref:2024-11-07]','> Paintball casualties: ACCEPTABLE','> WARNING: Never trust sector 3','> BRAD.exe running [PID 3110]','> Subject rejected by BRAD protocol','> Chargement des gages... [███████░] 87%','> Connexion Bradford: ÉTABLIE','> Niveau de chaos: CRITIQUE','> Memory override: édition III actif','> CLASSIFIED: NE PAS LIRE CE TEXTE','> Brad.init() — SUCCESS','> DO NOT PANIC — protocol nominal','> Taux de bradification: 94.7%','> ERROR: shame.dll not found','> Sector 7G: agents in position','> ALERT: Dignity levels critical','> Kirby67.exe has been detected','> Anti-serrano protocols: LOADING'];
function startLogs(){logsEl.style.opacity='1';document.getElementById('hline').classList.add('show');setInterval(()=>{const el=document.createElement('div');el.className='log-entry';el.textContent=LOGS[Math.floor(Math.random()*LOGS.length)];el.style.top=(Math.random()*88)+'%';el.style.left=(Math.random()*22)+'%';logsEl.appendChild(el);setTimeout(()=>el.remove(),5100);},650);}

// ── UTILS ─────────────────────────────────────────────────────
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function flash(dur=80,red=false){const el=document.getElementById(red?'fl-r':'fl-w');el.style.opacity='1';setTimeout(()=>el.style.opacity='0',dur);}
function setPh(id){document.querySelectorAll('.ph').forEach(p=>p.classList.remove('on'));document.getElementById(id).classList.add('on');}
function shake(px=5,ms=280){const end=Date.now()+ms;(function go(){if(Date.now()>end){document.body.style.transform='';return;}document.body.style.transform=`translate(${(Math.random()-.5)*px}px,${(Math.random()-.5)*px*.5}px)`;requestAnimationFrame(go);})();return wait(ms);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// ── TRANSITION CANVAS ─────────────────────────────────────────
function runTransition(){
  const cv=document.getElementById('cv-trans');
  cv.width=window.innerWidth;cv.height=window.innerHeight;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  const lines=Array.from({length:28},()=>({y:Math.random()*H,vy:(Math.random()-.25)*7,w:Math.random()*W*.7+W*.3,h:Math.random()*2.5+.4,a:Math.random()*.55+.2,red:Math.random()>.65}));
  const pts=Array.from({length:70},()=>({x:W/2+(Math.random()-.5)*W,y:H/2+(Math.random()-.5)*H,spd:Math.random()*4+2,sz:Math.random()*1.8+.4}));
  const TXT=['BRAD','N2S3','LILLESECTOR','INIT','PROTOCOL','3X','>>>','K67'];
  let f=0;
  (function frame(){
    f++;const t=f/145;
    ctx.fillStyle=`rgba(5,5,8,${.18+t*.22})`;ctx.fillRect(0,0,W,H);
    if(t<.65)lines.forEach(l=>{l.y+=l.vy;if(l.y>H+5)l.y=-5;if(l.y<-5)l.y=H+5;ctx.fillStyle=l.red?`rgba(204,0,0,${l.a*(1-t)})`:`rgba(255,255,255,${l.a*(1-t)*.55})`;ctx.fillRect(0,l.y,l.w,l.h);});
    if(t>.22){const ph=Math.min((t-.22)/.78,1);pts.forEach(p=>{const dx=W/2-p.x,dy=H/2-p.y,dist=Math.hypot(dx,dy);if(dist>4){p.x+=(dx/dist)*p.spd*ph*2.5;p.y+=(dy/dist)*p.spd*ph*2.5;}ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${.3-.2*t})`;ctx.fill();});}
    if(f%6<2&&t<.8){ctx.font=`${8+Math.floor(Math.random()*4)}px 'Share Tech Mono'`;ctx.fillStyle=`rgba(0,255,65,${Math.random()*.22})`;ctx.fillText(TXT[Math.floor(Math.random()*TXT.length)],Math.random()*W*.8,Math.random()*H);}
    if(t>.72){ctx.fillStyle=`rgba(255,255,255,${(t-.72)/.28*.92})`;ctx.fillRect(0,0,W,H);}
    if(f<145)requestAnimationFrame(frame);
  })();
}

// ── BOOT SEQUENCE ─────────────────────────────────────────────
const BOOT=['BRADDY3000 FIRMWARE v3.0.0 loading...','Checking memory banks: OK [90% utilized]','Calibrating Serrano detectors...','Loading Kirby 67 threat profile...','Establishing Lille sector connection...','Verifying agent credentials...','BradProtocol.init() — initialized','Loading Édition III parameters...','Anti-raclette firewall: ACTIVE','Checking Temu outfit database...','BRADDY3000 ready. Sort of.','>> TRANSMISSION EN COURS...'];
async function runBoot(){
  const lEl=document.getElementById('boot-lines'),bEl=document.getElementById('boot-bar'),lbEl=document.getElementById('boot-label');
  lEl.textContent='';
  for(let i=0;i<BOOT.length;i++){
    const el=document.createElement('div');lEl.appendChild(el);
    for(const ch of BOOT[i]){el.textContent+=ch;await wait(18+Math.random()*14);}
    const pct=Math.round(((i+1)/BOOT.length)*100);
    bEl.style.width=pct+'%';lbEl.textContent=pct<100?`INITIALISATION... ${pct}%`:'SYSTÈME OPÉRATIONNEL';
    beep(200+Math.random()*200,.05,.05,'square');await wait(80+Math.random()*100);
  }
  await wait(350);
}

// ── COUNTDOWN ─────────────────────────────────────────────────
let cdTimer=null;
function pad(n){return String(n).padStart(2,'0');}
function setCD(id,v){const el=document.getElementById(id);const s=pad(v);if(el.textContent!==s){el.textContent=s;el.dataset.v=s;}}
function tickCD(){const diff=CFG.targetDate-new Date();if(diff<=0){setCD('cd-d',0);setCD('cd-h',0);setCD('cd-m',0);setCD('cd-s',0);return true;}setCD('cd-d',Math.floor(diff/864e5));setCD('cd-h',Math.floor((diff%864e5)/36e5));setCD('cd-m',Math.floor((diff%36e5)/6e4));setCD('cd-s',Math.floor((diff%6e4)/1e3));return false;}
function startCD(){if(tickCD()){setPh('p6');return;}cdTimer=setInterval(()=>{if(tickCD()){clearInterval(cdTimer);triggerCDEnd();}},1000);}
async function triggerCDEnd(){flash(600);await shake(10,500);sweep(350,40,1.5,.2);impact(.28);await wait(700);flash(300);await wait(500);setPh('p6');}

// ── INTRO SEQUENCE ────────────────────────────────────────────
document.getElementById('btn-start').addEventListener('click',activate);

async function activate(){
  initAudio();drone();pSpd=3.5;
  document.getElementById('btn-start').classList.add('glitch');
  document.querySelector('#p0 .hud-tr').textContent='SYSTÈME ONLINE';
  startLogs();
  glitchSnd(.18);await wait(220);flash(55);shake(3,180);
  await wait(280);glitchSnd(.15);flash(40);shake(5,150);
  await wait(350);glitchSnd(.2);flash(120);shake(8,280);
  await wait(280);
  setPh('p1');pSpd=1.5;
  // Logos
  await wait(380);document.getElementById('logo-imagine').classList.add('on');beep(1200,.35,.05);
  await wait(920);document.getElementById('logo-div').classList.add('on');
  await wait(500);document.getElementById('logo-hwr').classList.add('on');beep(600,.22,.04);
  await wait(720);document.getElementById('logo-presents').classList.add('on');
  await wait(1350);flash(55);shake(4,200);glitchSnd(.12);await wait(260);
  // Boot
  setPh('p2');beep(300,.8,.06,'sine');await runBoot();
  flash(80);glitchSnd(.15);await wait(200);
  // Transition
  setPh('p3');sweep(55,2000,2.6,.14);pSpd=6;runTransition();await wait(2750);
  // Title
  setPh('p4');pSpd=1;impact(.22);
  await wait(180);document.getElementById('t-edition').classList.add('on');beep(440,.5,.04);
  await wait(480);document.getElementById('t-main').classList.add('on');beep(220,.8,.06);beep(330,.6,.04);shake(3,280);
  await wait(580);document.getElementById('t-line').classList.add('on');
  await wait(580);document.getElementById('t-tagline').classList.add('on');
  await wait(1000);
  // Kirby alert
  document.getElementById('kirby-alert').classList.remove('hidden');
  flash(200,true);glitchSnd(.2);shake(6,400);beep(150,.5,.15,'sawtooth');
  await wait(2000);
  document.getElementById('btn-proto').classList.add('on');beep(880,.1,.04);
}

document.getElementById('btn-proto').addEventListener('click',async()=>{flash(90);glitchSnd(.1);shake(4,180);await wait(280);setPh('p5');startCD();});
document.getElementById('btn-skip-cd').addEventListener('click',async()=>{clearInterval(cdTimer);flash(90);glitchSnd(.1);await wait(200);setPh('p6');});
document.getElementById('btn-action').addEventListener('click',async()=>{glitchSnd(.15);flash(140);shake(5,280);await wait(380);setPh('p7');document.getElementById('yt-frame').src=`https://www.youtube.com/embed/${CFG.youtubeId}?autoplay=1&rel=0&modestbranding=1`;setTimeout(()=>{document.getElementById('btn-enter-app').style.opacity='1';},8000);});
document.getElementById('btn-enter-app').addEventListener('click',enterApp);

function enterApp(){
  S.introComplete=true;save();
  document.getElementById('yt-frame').src='about:blank';
  document.querySelectorAll('.ph').forEach(p=>p.classList.remove('on'));
  document.getElementById('app').classList.add('show');
  initApp();
}

// ── APP INIT ──────────────────────────────────────────────────
function initApp(){
  startClock();startBradStatus();initMap();renderGages();renderBraddy();renderDossiers();updateBadge();
  if(S.chatHistory.length===0){setTimeout(()=>bradMsg('Ah. Vous voilà enfin. Le BRADDY3000 vous attendait. Moi aussi, je suppose.'),1500);}
  else{renderHistory();}
  // Events
  document.getElementById('topbar-chat').addEventListener('click',()=>nav('chat'));
  document.getElementById('chat-send-btn').addEventListener('click',sendMsg);
  document.getElementById('chat-inp').addEventListener('keydown',e=>{if(e.key==='Enter')sendMsg();});
  document.querySelectorAll('.back-btn').forEach(b=>b.addEventListener('click',goBack));
  document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.nav)));
  document.querySelectorAll('.bonus-row').forEach(b=>b.addEventListener('click',()=>openBonus(b.dataset.bonus)));
  document.querySelectorAll('.player-btn').forEach(b=>b.addEventListener('click',()=>selPlayer(b.dataset.player)));
  document.querySelectorAll('.aide-btn').forEach(b=>b.addEventListener('click',()=>openAide(b.dataset.aide)));
  document.getElementById('purch-yes').addEventListener('click',confirmPurch);
  document.getElementById('purch-no').addEventListener('click',cancelPurch);
  showPage(S.lastView||'home');
}

// ── NAVIGATION ────────────────────────────────────────────────
let navStack=['home'];
function nav(to){navStack.push(to);showPage(to);}
function goBack(){if(navStack.length>1)navStack.pop();showPage(navStack[navStack.length-1]);}
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  const p=document.getElementById('page-'+name);if(p)p.classList.add('on');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));
  S.lastView=name;save();
  if(name==='chat'){S.chatBadge=0;save();updateBadge();}
}

// ── CLOCK & STATUS ────────────────────────────────────────────
function startClock(){
  function upd(){const n=new Date();document.getElementById('time-disp').textContent=`${String(n.getHours()).padStart(2,'0')}h${String(n.getMinutes()).padStart(2,'0')}`;}
  upd();setInterval(upd,10000);
}
const STATUS_BY_H={10:['Calibration du BRADDY3000','Analyse des données'],11:['En ligne','Réunion avec lui-même','Analyse des données'],12:['En train de déjeuner','Toujours en train de déjeuner'],13:['Fin du déjeuner','Digestion en cours'],14:['Analyse des résultats','Calibration avancée'],15:['Discussion stratégique avec un grille-pain','A temporairement perdu son grille-pain'],16:['Surveillance maximum','En stand-by'],17:['Bilan de l\'opération','Félicitation mode activé'],18:['En train de se régaler','Mission accomplie'],19:['Rapport final','Archivage des données']};
const DEF_STATUS=['En ligne','Analyse des données','Calibration du BRADDY3000','Synchronisation en cours','Réunion importante avec lui-même','En train de se régaler','Discussion avec un grille-pain'];
function startBradStatus(){
  function upd(){const h=new Date().getHours();const pool=STATUS_BY_H[h]||DEF_STATUS;const el=document.getElementById('brad-status-lbl');if(el)el.textContent=pool[Math.floor(Math.random()*pool.length)];}
  upd();setInterval(upd,3*60*1000);
}

// ── MAP ───────────────────────────────────────────────────────
const ZONES=[{id:'alpha',name:'ZONE ALPHA',x:18,y:22,ph:0},{id:'beta',name:'ZONE BETA',x:68,y:38,ph:1},{id:'gamma',name:'ZONE GAMMA',x:32,y:60,ph:2},{id:'delta',name:'ZONE DELTA',x:72,y:68,ph:3},{id:'omega',name:'[ CLASSIFIÉ ]',x:50,y:47,ph:5}];
function initMap(){
  const c=document.getElementById('zones-container');c.innerHTML='';
  ZONES.forEach(z=>{
    const unlocked=S.phase>=z.ph;
    const d=document.createElement('div');
    d.className='zone-marker'+(unlocked?'':' locked');
    d.style.cssText=`left:${z.x}%;top:${z.y}%`;
    d.innerHTML=`<div class="zone-dot${unlocked?'':(z.id==='omega'?' class':' locked')}"></div><div class="zone-name">${z.name}</div>${unlocked?'':'<div style="font-size:10px">🔒</div>'}`;
    c.appendChild(d);
  });
  const b=document.getElementById('kirby-blip');if(b){b.style.left='48%';b.style.top='44%';}
  setTimeout(drawMap,150);
}
function drawMap(){
  const cv=document.getElementById('cv-map'),wrap=document.getElementById('map-wrap');
  cv.width=wrap.offsetWidth||window.innerWidth;cv.height=wrap.offsetHeight||300;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  ctx.strokeStyle='rgba(204,0,0,.08)';ctx.lineWidth=1;
  for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='rgba(204,0,0,.04)';
  for(let i=-H;i<W;i+=80){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}
  const unlocked=ZONES.filter(z=>S.phase>=z.ph);
  if(unlocked.length>1){ctx.strokeStyle='rgba(204,0,0,.2)';ctx.lineWidth=1;ctx.setLineDash([4,6]);for(let i=0;i<unlocked.length-1;i++){const a=unlocked[i],b=unlocked[i+1];ctx.beginPath();ctx.moveTo(a.x*W/100,a.y*H/100);ctx.lineTo(b.x*W/100,b.y*H/100);ctx.stroke();}ctx.setLineDash([]);}
  ctx.font='8px Share Tech Mono';ctx.fillStyle='rgba(255,255,255,.12)';
  ctx.fillText('50.63N',4,12);ctx.textAlign='right';ctx.fillText('3.07E',W-4,12);ctx.textAlign='left';
}

// ── GAGES ─────────────────────────────────────────────────────
const PHASES=[
  {name:'INITIALISATION',desc:'En attente de mission',gages:[]},
  {name:'PHASE 1 — ARRIVÉE À LILLE',desc:'Premières collectes de données',gages:[{t:'[GAGE 1.1 — À DÉFINIR]'},{t:'[GAGE 1.2 — À DÉFINIR]'},{t:'[GAGE ÉQUIPE 1 — À DÉFINIR]',team:true}]},
  {name:'PHASE 2 — DÉJEUNER',desc:'Collecte intensive',gages:[{t:'[GAGE 2.1 — À DÉFINIR]'},{t:'[GAGE 2.2 — À DÉFINIR]'},{t:'[GAGE CORSÉ 1 — À DÉFINIR]'}]},
  {name:'PHASE 3 — ACTIVITÉ PRINCIPALE',desc:'Terrain hostile',gages:[{t:'[GAGE 3.1 — À DÉFINIR]'},{t:'[GAGE 3.2 — À DÉFINIR]'}]},
  {name:'PHASE 4 — INTENSIF',desc:'Phase critique — gages corsés',gages:[{t:'[GAGE 4.1 CORSÉ — À DÉFINIR]'},{t:'[GAGE ÉQUIPE FINAL — À DÉFINIR]',team:true}]},
  {name:'PHASE 5 — ULTIME',desc:'Confrontation finale',gages:[{t:'[GAGE FINAL INDIVIDUEL — À DÉFINIR]'}]},
];
function renderGages(){
  const b=document.getElementById('gages-body');
  if(S.phase===0){b.innerHTML=`<div class="phase-indicator"><div class="phase-name">SYSTÈME EN VEILLE</div><div class="phase-desc">En attente du début de l'opération</div></div><div class="braddy-analyzing"><div class="adots"><div class="adot"></div><div class="adot"></div><div class="adot"></div></div><p>En attente de mission</p></div>`;return;}
  const ph=PHASES[Math.min(S.phase,5)];
  let html=`<div class="phase-indicator"><div class="phase-name">${ph.name}</div><div class="phase-desc">${ph.desc}</div></div>`;
  ph.gages.forEach((g,i)=>{html+=`<div class="gage-item"><div class="gage-num">[${String(i+1).padStart(2,'0')}]</div><div class="gage-text">${g.team?'<span style="color:var(--orange)">[ÉQUIPE] </span>':''}${g.t}</div></div>`;});
  html+=`<div class="braddy-analyzing"><div class="adots"><div class="adot"></div><div class="adot"></div><div class="adot"></div></div><p>Brad analyse votre position actuelle</p></div>`;
  b.innerHTML=html;
}

// ── BRADDY3000 ────────────────────────────────────────────────
function renderBraddy(){
  const b=document.getElementById('braddy-body'),ph=S.phase;
  const dc=ph*20,ka=ph===0?3:Math.min(3+ph*18,97),rl=Math.floor(Math.random()*25+ph*10+20);
  b.innerHTML=`
<div class="stat-block"><div class="stat-label">DONNÉES COLLECTÉES</div><div class="stat-bar-wrap"><div class="stat-bar" style="width:${dc}%"></div></div><div class="stat-value-row"><div class="stat-val">${dc}<span style="font-size:.6em;opacity:.5">%</span></div><div class="stat-unit">PHASE ${ph}/5</div></div></div>
<div class="stat-block"><div class="stat-label">LOCALISATION KIRBY 67</div><div class="stat-bar-wrap"><div class="stat-bar yellow" style="width:${ka}%"></div></div><div class="stat-value-row"><div class="stat-val">${ka}<span style="font-size:.6em;opacity:.5">%</span></div><div class="stat-unit">PRÉCISION</div></div></div>
<div class="stat-block"><div class="stat-label">FIABILITÉ DU BRADDY3000</div><div class="stat-bar-wrap"><div class="stat-bar green" style="width:${rl}%"></div></div><div class="stat-value-row"><div class="stat-val">${rl}<span style="font-size:.6em;opacity:.5">%</span></div><div class="stat-unit">ESTIMÉ</div></div></div>
<div class="fun-stat"><div>> Température du grille-pain de Brad : <span>42°C</span></div><div>> Niveau de sérieux : <span>3%</span></div><div>> Charabia généré : <span>${Math.floor(Math.random()*999)+100} TB</span></div><div>> Taux de bradification : <span>94.7%</span></div><div>> Grille-pains détectés : <span>1 (perdu)</span></div><div>> Probabilité que tout se passe bien : <span>incalculable</span></div></div>
<div style="font-family:var(--mono);font-size:8px;color:rgba(255,255,255,.15);text-align:center;padding:10px;letter-spacing:.2em">FIABILITÉ : ENTRE 3% ET 98% — INGÉNIEURS EN COURS</div>`;
}

// ── PHASE MANAGEMENT ──────────────────────────────────────────
function advancePhase(n){
  if(n<=S.phase)return;
  S.phase=n;
  const coins=CFG.phaseCoins[n]||0;
  Object.keys(S.coins).forEach(p=>S.coins[p]+=coins);
  save();initMap();renderGages();renderBraddy();renderDossiers();
  const msgs=['','Phase 1 initialisée. Données en réception. Bonne chance. Vous en aurez besoin.','Phase 2 débloquée. Votre progression est... acceptable.','Phase 3 active. Terrain hostile détecté. Restez concentrés. Ou pas.','Phase 4 critique. Les gages corsés arrivent. Spoiler : vous n\'êtes pas prêts.','Phase 5 — Ultime. Le BRADDY3000 et moi-même vous regardons.'];
  if(msgs[n])setTimeout(()=>bradMsg(msgs[n]),500);
}

// ── DOSSIERS ─────────────────────────────────────────────────
const DOSS={kirby67:{title:'Kirby 67',content:`<div class="class-tag">CLASSIFICATION : ALPHA-ROUGE</div><h3>IDENTIFICATION</h3><p>Kirby 67 est le double maléfique de Kirby 54, capturé lors de l'Édition II.</p><p>Niveau de malveillance : 94% selon le BRADDY3000.</p><h3>DERNIÈRE LOCALISATION</h3><p>Ville de Lille — signal perdu lors de son évasion.</p><h3>MOTIVATIONS</h3><p>Kirby 67 parle obsessionnellement d'un "Monde au Serrano".</p><p class="warn">NE PAS mentionner le Serrano en sa présence.</p><h3>NOTE DE BRAD BITT</h3><p class="warn">Si vous le trouvez, ne le nourrissez pas. Et surtout pas de Serrano.</p>`}};
function renderDossiers(){
  const l=document.getElementById('dossiers-list');
  const rows=[{id:'kirby67',name:'Kirby 67',u:true},{id:'bradbitt',name:'Brad Bitt',u:false},{id:'braddy3k',name:'BRADDY3000',u:false},{id:'incidents',name:'Incidents précédents',u:false},{id:'archives',name:'Archives',u:false}];
  l.innerHTML=rows.map(d=>`<div class="dossier-row ${d.u?'unlocked':'locked'}" ${d.u?`data-dossier="${d.id}"`:''}><span class="dossier-name">${d.name}</span><span class="dossier-badge ${d.u?'open':'closed'}">${d.u?'DÉBLOQUÉ':'🔒 ACCÈS REFUSÉ'}</span></div>`).join('');
  document.querySelectorAll('.dossier-row.unlocked').forEach(r=>r.addEventListener('click',()=>openDoss(r.dataset.dossier)));
}
function openDoss(id){const d=DOSS[id];if(!d)return;document.getElementById('dd-title').textContent=d.title;document.getElementById('dd-body').innerHTML=d.content;nav('dossier-detail');}

// ── BONUS ─────────────────────────────────────────────────────
const BONUS_INFO={gageSecondaire:{title:'Gage secondaire',desc:'Un gage de secours si celui actuel ne convient pas.\nEn stock : 1/Personne'},laisserPasser:{title:'Laisser passer',desc:'Ignorer un gage sans pénalité.\nUtilisable une fois.'},refaireRoue:{title:'Refaire la roue',desc:'Retirer un nouveau gage.\nEn stock : 2/Personne'},doubleTimbre:{title:'Double Tirage',desc:'Deux gages tirés simultanément.\nDeux fois plus de chaos.'},imposerGage:{title:'Imposer un Gage',desc:'Impose un gage supplémentaire à la personne de votre choix.\nBrad Corporation décline toute responsabilité.'},declencherEvenement:{title:'Déclencher un événement',desc:'Active un événement spécial.\nMême Brad ne sait pas toujours ce qui va se passer.'}};
let curBonus=null,selPl=null;
function openBonus(id){
  curBonus=id;selPl=null;
  const info=BONUS_INFO[id];
  document.getElementById('bd-title').textContent=info.title;
  document.getElementById('bd-desc').textContent=info.desc;
  ['hippolyte','nathanael','edwin','teo'].forEach(p=>{
    const cost=CFG.costs[id]?.[p]||0,stock=S.stock[id]?.[p]??0,coins=S.coins[p]||0;
    document.getElementById('cost-'+p).textContent=`${cost} BC (stock: ${stock})`;
    const btn=document.querySelector(`.player-btn[data-player="${p}"]`);
    if(btn){btn.classList.remove('selected');btn.style.opacity=(stock>0&&coins>=cost)?'1':'.4';}
  });
  document.getElementById('bd-stock').textContent=`Vos BittCoins — Hippolyte:${S.coins.hippolyte} | Nathanaël:${S.coins.nathanael} | Edwin:${S.coins.edwin} | Téo:${S.coins.teo}`;
  document.getElementById('purchase-confirm').classList.add('hidden');
  document.getElementById('purch-feedback').classList.add('hidden');
  nav('bonus-detail');
}
function selPlayer(p){
  if(!curBonus)return;
  const cost=CFG.costs[curBonus]?.[p]||0,stock=S.stock[curBonus]?.[p]??0,coins=S.coins[p]||0;
  if(stock<=0||coins<cost)return;
  selPl=p;
  document.querySelectorAll('.player-btn').forEach(b=>b.classList.remove('selected'));
  document.querySelector(`.player-btn[data-player="${p}"]`)?.classList.add('selected');
  const names={hippolyte:'Hippolyte',nathanael:'Nathanaël',edwin:'Edwin',teo:'Téo'};
  document.getElementById('purch-name').textContent=names[p];
  document.getElementById('purchase-confirm').classList.remove('hidden');
  document.getElementById('purch-feedback').classList.add('hidden');
}
function confirmPurch(){
  if(!curBonus||!selPl)return;
  const cost=CFG.costs[curBonus]?.[selPl]||0,stock=S.stock[curBonus]?.[selPl]??0;
  if(stock<=0){showFb('Stock épuisé.',true);return;}
  if((S.coins[selPl]||0)<cost){showFb('BittCoins insuffisants.',true);return;}
  S.coins[selPl]-=cost;S.stock[curBonus][selPl]--;save();
  document.getElementById('purchase-confirm').classList.add('hidden');
  showFb(`✓ "${BONUS_INFO[curBonus].title}" activé !`,false);
  const cmts=['Bonne initiative. Ou catastrophique.','Le BRADDY3000 enregistre.','Hmm. Intéressant.','La Brad Corporation approuve. À moitié.'];
  setTimeout(()=>bradMsg(cmts[Math.floor(Math.random()*cmts.length)]),2000);
}
function cancelPurch(){selPl=null;document.getElementById('purchase-confirm').classList.add('hidden');document.querySelectorAll('.player-btn').forEach(b=>b.classList.remove('selected'));}
function showFb(msg,err){const el=document.getElementById('purch-feedback');el.textContent=msg;el.className=err?'err':'ok';el.classList.remove('hidden');}

// ── AIDE ──────────────────────────────────────────────────────
const AIDE={lore:{title:'Le LORE',body:'<h3>Le LORE</h3><p>Le Lore regroupe l\'ensemble des événements ayant conduit à l\'opération actuelle.</p><p>Vous y trouverez des informations concernant Brad Bitt, Kirby 67, le BRADDY3000, les incidents précédents et les événements classifiés.</p><p class="warn">Certaines informations peuvent être incomplètes, confidentielles ou totalement inventées. <span class="brand">Brad Bitt Corporation</span> ne garantit pas l\'exactitude des données affichées.</p>'},gages:{title:'Les Gages',body:'<h3>Les Gages</h3><p>Les gages constituent la principale source de données du BRADDY3000. Chaque mission accomplie permet d\'obtenir des informations, de gagner des BittCoins et de faire progresser l\'enquête.</p><p>Les gages peuvent être individuels, collectifs, en équipe, secondaires ou classifiés.</p><p class="warn">Refuser un gage n\'est pas interdit. Mais le BRADDY3000 risque fortement de vous juger.</p>'},doubleTrouble:{title:'"Double Trouble"',body:'<h3>Double Trouble</h3><p>Lorsqu\'il est activé : deux joueurs sont concernés, deux équipes peuvent s\'affronter, deux gages peuvent être réalisés simultanément.</p><p>L\'événement peut apparaître à tout moment. Même Brad ne sait pas toujours ce qui va se passer.</p><p class="warn">Et pourtant, c\'est lui qui a créé le système. Enfin normalement.</p>'},chat:{title:'Le CHAT',body:'<h3>Le CHAT</h3><p>Le chat de Brad Bitt a été conçu pour répondre à certains types de messages. Vérifiez le statut de Brad avant de lui envoyer un message.</p><p>Les réponses sont générées automatiquement par le BRADDY3000.</p><p class="warn">Sauf quand elles ne le sont pas. Ce qui est parfois le cas.</p>'},bonus:{title:'Les Bonus',body:'<h3>Les Bonus</h3><p>Les bonus permettent de modifier temporairement les règles du jeu. Ils peuvent être achetés grâce aux BittCoins obtenus durant les missions.</p><p class="warn">Brad Corporation décline toute responsabilité concernant les conséquences sociales, émotionnelles ou gastronomiques.</p>'},monnaie:{title:'La Monnaie',body:'<h3>La Monnaie</h3><p>5 BittCoins sont accordés à chaque fin de phase. La monnaie peut être échangée contre des bonus. Elle est propre à chacun.</p><p class="warn">Brad Bitt Corporation n\'est pas responsable de votre dette.</p>'},braddy3000:{title:'Le BRADDY3000',body:'<h3>Le BRADDY3000</h3><p>Système expérimental développé par Brad Bitt pour retrouver Kirby 67. Il analyse les données, surveille les secteurs et produit des statistiques inutiles.</p><p class="warn">Fiabilité estimée : entre 3% et 98%. Les ingénieurs travaillent encore sur le problème.</p>'},dossiers:{title:'Les Dossiers',body:'<h3>Les Dossiers</h3><p>Les Dossiers regroupent les informations confidentielles de l\'opération. De nouveaux dossiers peuvent être débloqués au cours de la journée.</p><p class="warn">La consultation est autorisée. La compréhension est en revanche facultative.</p>'}};
function openAide(id){const d=AIDE[id];if(!d)return;document.getElementById('ad-title').textContent=d.title;document.getElementById('ad-body').innerHTML=d.body;nav('aide-detail');}

// ── CHAT ──────────────────────────────────────────────────────
const RESPONSES={kirby:["Excellente question. J'aimerais également le savoir.","Kirby 67 est... quelque part. Le BRADDY3000 analyse.","Ce chiffre est plus élevé que 54. Oui. J'étais aussi surpris."],mission:["Si je vous le disais, ce ne serait plus une mission.","Les missions se révèlent d'elles-mêmes. Comme moi."],gage:["Chaque gage accompli rapproche le BRADDY3000 de la vérité.","Le gage est votre destinée. Embrassez-la."],bonjour:["Ah. Vous voilà.","Salutations.","Je savais que vous repasseriez."],salut:["Salut. Revenons aux affaires.","Hmm. Bonjour."],serrano:["Ne. Prononcez. Pas. Ce. Mot.","Le BRADDY3000 a détecté une anomalie. Évitez ce sujet.","...Je vous surveille."],grille:["Mon grille-pain est temporairement indisponible.","Ce sujet est classifié niveau ROUGE."],brad:["C'est moi.","Vous avez mentionné mon nom. Je suis flatté. Ou méfiant."],merci:["De rien. Le BRADDY3000 prend note.","Votre courtoisie est enregistrée."],temu:["Mes vêtements sont une affaire privée.","Ne parlez pas de mon outfit Temu."],où:["Bonne question.","Le BRADDY3000 calcule."],aide:["L'aide est dans la section Aide. C'est logique."]};
const FALLBACK=["Intéressant. Le BRADDY3000 prend note.","Hmm. Je n'ai pas de réponse claire à cela.","Le BRADDY3000 analyse votre message. Résultat : confus.","Votre message a été reçu, archivé et partiellement incompris.","Je pourrais répondre. Mais je choisirais de ne pas le faire.","La réponse est : 42. Ou peut-être 67.","Fascinant. Vraiment. Passons.","Notez que je ne suis pas un assistant. Je suis Brad Bitt."];
function addUserMsg(txt){const m=document.getElementById('chat-msgs');const d=document.createElement('div');d.className='chat-msg';d.innerHTML=`<div class="msg-label">Vous</div><div class="msg-sep">—</div><div class="msg-text">${esc(txt)}</div>`;m.appendChild(d);m.scrollTop=m.scrollHeight;S.chatHistory.push({type:'user',text:txt});save();}
function bradMsg(txt){const m=document.getElementById('chat-msgs'),ty=document.getElementById('chat-typing');ty.classList.remove('hidden');m.scrollTop=m.scrollHeight;setTimeout(()=>{ty.classList.add('hidden');const d=document.createElement('div');d.className='chat-msg brad-msg';d.innerHTML=`<div class="msg-label brad pacifico">Brad Bitt</div><div class="msg-sep">—</div><div class="msg-text">${esc(txt)}</div>`;m.appendChild(d);m.scrollTop=m.scrollHeight;S.chatHistory.push({type:'brad',text:txt});const chatPg=document.getElementById('page-chat');if(!chatPg.classList.contains('on')){S.chatBadge=(S.chatBadge||0)+1;updateBadge();}save();},1000+txt.length*15);}
function renderHistory(){const m=document.getElementById('chat-msgs');m.innerHTML='';S.chatHistory.forEach(h=>{const d=document.createElement('div');if(h.type==='user'){d.className='chat-msg';d.innerHTML=`<div class="msg-label">Vous</div><div class="msg-sep">—</div><div class="msg-text">${esc(h.text)}</div>`;}else{d.className='chat-msg brad-msg';d.innerHTML=`<div class="msg-label brad pacifico">Brad Bitt</div><div class="msg-sep">—</div><div class="msg-text">${esc(h.text)}</div>`;}m.appendChild(d);});m.scrollTop=m.scrollHeight;}
function updateBadge(){const b=document.getElementById('chat-badge');if(!b)return;b.textContent=S.chatBadge>0?S.chatBadge:'';b.style.display=S.chatBadge>0?'flex':'none';}
function sendMsg(){
  const inp=document.getElementById('chat-inp');const txt=inp.value.trim();if(!txt)return;inp.value='';
  // Admin commands
  if(txt==='/admin.p1'){advancePhase(1);addSysMsg('Phase 1 débloquée.');return;}
  if(txt==='/admin.p2'){advancePhase(2);addSysMsg('Phase 2 débloquée.');return;}
  if(txt==='/admin.p3'){advancePhase(3);addSysMsg('Phase 3 débloquée.');return;}
  if(txt==='/admin.p4'){advancePhase(4);addSysMsg('Phase 4 débloquée.');return;}
  if(txt==='/admin.p5'){advancePhase(5);addSysMsg('Phase 5 débloquée.');return;}
  if(txt==='/admin.coins'){Object.keys(S.coins).forEach(p=>S.coins[p]+=5);save();addSysMsg('+5 BittCoins pour tous.');return;}
  if(txt==='/admin.reset'){if(confirm('Réinitialiser ?')){localStorage.removeItem('n2s3');location.reload();}return;}
  // Phase codes
  const upper=txt.toUpperCase();if(CFG.phaseCodes[upper]!==undefined){advancePhase(CFG.phaseCodes[upper]);addSysMsg(`CODE VALIDÉ — Phase ${CFG.phaseCodes[upper]} débloquée.`);return;}
  addUserMsg(txt);
  const lower=txt.toLowerCase();let resp=null;
  for(const[kw,rs]of Object.entries(RESPONSES)){if(lower.includes(kw)){resp=rs[Math.floor(Math.random()*rs.length)];break;}}
  if(!resp)resp=FALLBACK[Math.floor(Math.random()*FALLBACK.length)];
  bradMsg(resp);
}
function addSysMsg(txt){const m=document.getElementById('chat-msgs');const d=document.createElement('div');d.className='chat-msg sys-msg';d.innerHTML=`<div class="msg-text">> ${esc(txt)}</div>`;m.appendChild(d);m.scrollTop=m.scrollHeight;}

// ── BOOTSTRAP ─────────────────────────────────────────────────
window.addEventListener('resize',()=>{resizeBg();initParts();if(document.getElementById('app').classList.contains('show'))drawMap();});
resizeBg();initParts();tickParts();
if(S.introComplete){document.querySelectorAll('.ph').forEach(p=>p.classList.remove('on'));document.getElementById('app').classList.add('show');initApp();}
