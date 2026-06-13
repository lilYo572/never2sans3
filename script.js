'use strict';
/* N2S3 PROTOCOL v3.1 */

const CFG = {
  youtubeId: 'VIDEO_ID_ICI',
  targetDate: new Date('2026-06-17T11:00:00+02:00'),
  phaseCodes: {'BRADDY-ALPHA':1,'BRADDY-BRAVO':2,'BRADDY-CHARLIE':3,'BRADDY-DELTA':4,'BRADDY-OMEGA':5},
  costs: {
    gageSecondaire:{hippolyte:15,nathanael:10,edwin:5,teo:10},
    refaireRoue:{hippolyte:20,nathanael:20,edwin:20,teo:20},
    laisserPasser:{hippolyte:25,nathanael:25,edwin:25,teo:25},
    doubleTimbre:{hippolyte:25,nathanael:25,edwin:25,teo:25},
    imposerGage:{hippolyte:30,nathanael:30,edwin:30,teo:30},
    declencherEvenement:{hippolyte:50,nathanael:50,edwin:50,teo:50},
  },
  initStock:{
    gageSecondaire:{hippolyte:1,nathanael:1,edwin:1,teo:1},
    refaireRoue:{hippolyte:2,nathanael:2,edwin:2,teo:2},
    laisserPasser:{hippolyte:1,nathanael:1,edwin:1,teo:1},
    doubleTimbre:{hippolyte:1,nathanael:1,edwin:1,teo:1},
    imposerGage:{hippolyte:1,nathanael:1,edwin:1,teo:1},
    declencherEvenement:{hippolyte:1,nathanael:1,edwin:1,teo:1},
  },
  phaseCoins:[0,5,5,5,5,10],
};

const R_PLAYERS = ['Hippolyte','Teo','Edwin','Nathanael'];
const R_KEYS    = ['hippolyte','teo','edwin','nathanael'];
const R_COLORS  = ['#5a0000','#380000','#7a0000','#440000'];

const PHASES = [
  {name:'INITIALISATION',desc:'En attente de mission',gages:[],contracts:[],dt:null},
  {
    name:'PHASE 1 — ARRIVÉE À LILLE',desc:'Premières collectes de données',
    gages:[
      {id:'p1g1',name:'Expert Raclette',desc:"Entrer dans un magasin d'électroménager et demander des informations très précises sur un appareil à raclette : nombre de fromages par minute, rendement de fonte, compatibilité avec le Serrano.",bc:5},
      {id:'p1g2',name:'Carte Miaouscarade',desc:"Trouver une carte Miaouscarade dans une boutique spécialisée et l'acheter.",bc:5},
      {id:'p1g3',name:'Objet Mystère',desc:"Acheter un objet coûtant moins de 2€ et le garder secret jusqu'à la fin de la journée.",bc:5},
      {id:'p1g4',name:'Demande de la plus haute importance',desc:'Envoyer une proposition à Brets afin de suggérer une saveur Raclette Serrano.',bc:5},
    ],
    contracts:[
      {name:'Synchronisation BRADDY3000',desc:'Deux participants se tiennent la main pendant 20 minutes.',reward:'Multiplicateur x1.5'},
      {name:'Liaison Satellite',desc:"Deux participants restent à moins de 2 mètres l'un de l'autre pendant une durée déterminée.",reward:'+BC'},
      {name:'Communication Prioritaire',desc:"Deux participants terminent les phrases de l'autre.",reward:'+BC'},
      {name:'Opération Serrano',desc:'Intégrer naturellement le mot "Serrano" dans plusieurs conversations.',reward:'+BC'},
    ],
    dt:{a:'Équipe Fromage — Trouver du fromage à raclette.',b:'Équipe Charcuterie — Trouver du Serrano.',bonus:'+5 BC bonus par participant pour la première équipe revenue.'}
  },
  {
    name:'PHASE 2 — DÉJEUNER',desc:'Collecte intensive',
    gages:[
      {id:'p2g1',name:'Commande Contrôlée',desc:"Le participant choisit uniquement la taille de son repas. Le reste est décidé par un autre joueur.",bc:5},
      {id:'p2g2',name:"Collaboration O'Tacos",desc:"Demander au personnel si une collaboration O'Tacos x Serrano est prévue.",bc:5},
      {id:'p2g3',name:'Serrano Secret',desc:'Intégrer le Serrano acheté précédemment dans son repas.',bc:5},
      {id:'p2g4',name:'Influenceur Culinaire',desc:'Présenter son repas comme une révolution technologique.',bc:5},
    ],
    contracts:[],dt:null
  },
  {
    name:'PHASE 3 — RUPTURE NARRATIVE',desc:'Événement spécial',rupture:true,
    gages:[],contracts:[],dt:null
  },
  {
    name:'PHASE 4 — RELOOKING',desc:'Phase critique — Contrats BRADDY3000',
    gages:[
      {id:'p4g1',name:'Relooking Brad Corporation',desc:'Trois participants choisissent chaussures, haut et accessoire. Le quatrième essaie la tenue, demande un avis et prend une photo.',bc:5,team:true},
    ],
    contracts:[
      {name:'Synchronisation BRADDY3000',desc:'Deux participants se tiennent la main pendant 20 minutes.',reward:'Multiplicateur x1.5'},
      {name:'Liaison Satellite',desc:'Deux participants restent à moins de 2m.',reward:'+BC'},
      {name:'Communication Prioritaire',desc:"Deux participants terminent les phrases de l'autre.",reward:'+BC'},
      {name:'Opération Serrano',desc:'Intégrer "Serrano" dans plusieurs conversations.',reward:'+BC'},
    ],
    dt:null
  },
  {
    name:'PHASE 5 — FINALE',desc:'Attribution directe par Brad',directAssignment:true,
    gages:[
      {id:'p5g1',name:'Mario Kart',desc:"Demander à quelqu'un à la FNAC de faire une partie sur une borne de démonstration.",bc:10},
      {id:'p5g2',name:'Micro-Trottoir Raclette',desc:'"Pensez-vous que la raclette est un plat réservé aux fêtes de fin d\'année ou qu\'elle peut être consommée toute l\'année ?"',bc:10},
      {id:'p5g3',name:"Livre d'Or",desc:"Acheter un carnet et obtenir la dédicace d'un inconnu.",bc:10},
      {id:'p5g4',name:'La Story Salée',desc:'Défendre les mérites de la raclette dans une story publiée à un cercle restreint de personnes.',bc:10},
    ],
    contracts:[],dt:null
  },
];

/* STATE */
function loadState(){try{const s=localStorage.getItem('n2s3');if(s)return JSON.parse(s);}catch(e){}
  return{phase:0,coins:{hippolyte:0,nathanael:0,edwin:0,teo:0},stock:JSON.parse(JSON.stringify(CFG.initStock)),chatHistory:[],introComplete:false,chatBadge:0,lastView:'home',doneGages:[]};}
let S=loadState();
function save(){try{localStorage.setItem('n2s3',JSON.stringify(S));}catch(e){}}

/* AUDIO */
let AC=null;
function initAudio(){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
function res(){if(AC&&AC.state==='suspended')AC.resume();}
function beep(f=440,d=.1,v=.08,t='square'){if(!AC)return;res();try{const o=AC.createOscillator(),g=AC.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d);}catch(e){}}
function glitchSnd(v=.14){if(!AC)return;res();try{const sz=AC.sampleRate*.08,buf=AC.createBuffer(1,sz,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<sz;i++)d[i]=Math.random()*2-1;const src=AC.createBufferSource();src.buffer=buf;const g=AC.createGain(),bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1000+Math.random()*1000;bp.Q.value=2;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.08);src.connect(bp);bp.connect(g);g.connect(AC.destination);src.start();}catch(e){}}
function sweep(f0=80,f1=1400,dur=2.5,v=.12){if(!AC)return;res();try{const o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f0,AC.currentTime);o.frequency.exponentialRampToValueAtTime(f1,AC.currentTime+dur*.65);o.frequency.exponentialRampToValueAtTime(f0*.4,AC.currentTime+dur);g.gain.setValueAtTime(0,AC.currentTime);g.gain.linearRampToValueAtTime(v,AC.currentTime+.1);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+dur);}catch(e){}}
function impact(v=.28){if(!AC)return;res();try{const sz=AC.sampleRate*.4,buf=AC.createBuffer(1,sz,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<sz;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(AC.sampleRate*.09));const src=AC.createBufferSource();src.buffer=buf;const g=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=280;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.4);src.connect(lp);lp.connect(g);g.connect(AC.destination);src.start();}catch(e){}}
function drone(){if(!AC)return;res();try{const g=AC.createGain();g.gain.setValueAtTime(0,AC.currentTime);g.gain.linearRampToValueAtTime(.055,AC.currentTime+4);g.connect(AC.destination);[40,61,82].forEach((f,i)=>{const o=AC.createOscillator();o.type=i===0?'sawtooth':'sine';o.frequency.value=f;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=140;o.connect(lp);lp.connect(g);o.start();});}catch(e){}}

/* PARTICLES */
const cvBg=document.getElementById('cv-bg'),ctxBg=cvBg.getContext('2d');
let parts=[],pSpd=1;
function resizeBg(){cvBg.width=window.innerWidth;cvBg.height=window.innerHeight;}
function initParts(n=55){parts=Array.from({length:n},()=>({x:Math.random()*cvBg.width,y:Math.random()*cvBg.height,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.3+.2,a:Math.random()*.22+.03,c:Math.random()>.84?'#cc0000':'#fff'}));}
function tickParts(){ctxBg.clearRect(0,0,cvBg.width,cvBg.height);parts.forEach(p=>{p.x+=p.vx*pSpd;p.y+=p.vy*pSpd;if(p.x<0)p.x=cvBg.width;if(p.x>cvBg.width)p.x=0;if(p.y<0)p.y=cvBg.height;if(p.y>cvBg.height)p.y=0;ctxBg.beginPath();ctxBg.arc(p.x,p.y,p.r,0,Math.PI*2);ctxBg.fillStyle=p.c;ctxBg.globalAlpha=p.a;ctxBg.fill();});ctxBg.globalAlpha=1;requestAnimationFrame(tickParts);}

/* LOGS */
const logsEl=document.getElementById('logs');
const LOGS=['> INITIALIZING BRAD PROTOCOL...','> Bradification level: UNSTABLE','> Synchronisation secteur Lille: OK','> OTacos incident: ARCHIVED [ref:2024]','> Paintball casualties: ACCEPTABLE','> WARNING: Never trust sector 3','> BRAD.exe running [PID 3110]','> Chargement des gages... [87%]','> Connexion Bradford: ÉTABLIE','> Niveau de chaos: CRITIQUE','> CLASSIFIED: NE PAS LIRE CE TEXTE','> Brad.init() -- SUCCESS','> Taux de bradification: 94.7%','> ERROR: shame.dll not found','> Kirby67.exe has been detected','> Anti-serrano protocols: LOADING','> Raclette database: ONLINE'];
function startLogs(){logsEl.style.opacity='1';document.getElementById('hline').classList.add('show');setInterval(()=>{const el=document.createElement('div');el.className='log-entry';el.textContent=LOGS[Math.floor(Math.random()*LOGS.length)];el.style.top=(Math.random()*88)+'%';el.style.left=(Math.random()*22)+'%';logsEl.appendChild(el);setTimeout(()=>el.remove(),5100);},650);}

/* UTILS */
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function flash(dur=80,red=false){const el=document.getElementById(red?'fl-r':'fl-w');el.style.opacity='1';setTimeout(()=>el.style.opacity='0',dur);}
function setPh(id){document.querySelectorAll('.ph').forEach(p=>p.classList.remove('on'));document.getElementById(id).classList.add('on');}
function shake(px=5,ms=280){const end=Date.now()+ms;(function go(){if(Date.now()>end){document.body.style.transform='';return;}document.body.style.transform=`translate(${(Math.random()-.5)*px}px,${(Math.random()-.5)*px*.5}px)`;requestAnimationFrame(go);})();return wait(ms);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* TRANSITION */
function runTransition(){
  const cv=document.getElementById('cv-trans');cv.width=window.innerWidth;cv.height=window.innerHeight;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  const lines=Array.from({length:28},()=>({y:Math.random()*H,vy:(Math.random()-.25)*7,w:Math.random()*W*.7+W*.3,h:Math.random()*2.5+.4,a:Math.random()*.55+.2,red:Math.random()>.65}));
  const pts=Array.from({length:70},()=>({x:W/2+(Math.random()-.5)*W,y:H/2+(Math.random()-.5)*H,spd:Math.random()*4+2,sz:Math.random()*1.8+.4}));
  const TXT=['BRAD','N2S3','LILLESECTOR','PROTOCOL','K67','SERRANO'];
  let f=0;
  (function frame(){f++;const t=f/145;ctx.fillStyle=`rgba(5,5,8,${.18+t*.22})`;ctx.fillRect(0,0,W,H);
    if(t<.65)lines.forEach(l=>{l.y+=l.vy;if(l.y>H+5)l.y=-5;if(l.y<-5)l.y=H+5;ctx.fillStyle=l.red?`rgba(204,0,0,${l.a*(1-t)})`:`rgba(255,255,255,${l.a*(1-t)*.55})`;ctx.fillRect(0,l.y,l.w,l.h);});
    if(t>.22){const ph=Math.min((t-.22)/.78,1);pts.forEach(p=>{const dx=W/2-p.x,dy=H/2-p.y,dist=Math.hypot(dx,dy);if(dist>4){p.x+=(dx/dist)*p.spd*ph*2.5;p.y+=(dy/dist)*p.spd*ph*2.5;}ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${.3-.2*t})`;ctx.fill();});}
    if(f%6<2&&t<.8){ctx.font=`${8+Math.floor(Math.random()*4)}px monospace`;ctx.fillStyle=`rgba(0,255,65,${Math.random()*.22})`;ctx.fillText(TXT[Math.floor(Math.random()*TXT.length)],Math.random()*W*.8,Math.random()*H);}
    if(t>.72){ctx.fillStyle=`rgba(255,255,255,${(t-.72)/.28*.92})`;ctx.fillRect(0,0,W,H);}
    if(f<145)requestAnimationFrame(frame);})();
}

/* BOOT */
const BOOT=['BRADDY3000 FIRMWARE v3.0.0 loading...','Checking memory banks: OK [90% utilized]','Calibrating Serrano detectors...','Loading Kirby 67 threat profile...','Establishing Lille sector connection...','Verifying agent credentials...','BradProtocol.init() -- initialized','Loading Edition III parameters...','Anti-raclette firewall: ACTIVE','Checking Temu outfit database...','BRADDY3000 ready. Sort of.','>> TRANSMISSION EN COURS...'];
async function runBoot(){
  const lEl=document.getElementById('boot-lines'),bEl=document.getElementById('boot-bar'),lbEl=document.getElementById('boot-label');lEl.textContent='';
  for(let i=0;i<BOOT.length;i++){const el=document.createElement('div');lEl.appendChild(el);for(const ch of BOOT[i]){el.textContent+=ch;await wait(18+Math.random()*14);}
    const pct=Math.round(((i+1)/BOOT.length)*100);bEl.style.width=pct+'%';lbEl.textContent=pct<100?`INITIALISATION... ${pct}%`:'SYSTEME OPERATIONNEL';beep(200+Math.random()*200,.05,.05,'square');await wait(80+Math.random()*100);}await wait(350);}

/* COUNTDOWN */
let cdTimer=null;
function pad(n){return String(n).padStart(2,'0');}
function setCD(id,v){const el=document.getElementById(id);const s=pad(v);if(el.textContent!==s){el.textContent=s;el.dataset.v=s;}}
function tickCD(){const diff=CFG.targetDate-new Date();if(diff<=0){['cd-d','cd-h','cd-m','cd-s'].forEach(id=>setCD(id,0));return true;}setCD('cd-d',Math.floor(diff/864e5));setCD('cd-h',Math.floor((diff%864e5)/36e5));setCD('cd-m',Math.floor((diff%36e5)/6e4));setCD('cd-s',Math.floor((diff%6e4)/1e3));return false;}
function startCD(){if(tickCD()){setPh('p6');return;}cdTimer=setInterval(()=>{if(tickCD()){clearInterval(cdTimer);triggerCDEnd();}},1000);}
async function triggerCDEnd(){flash(600);await shake(10,500);sweep(350,40,1.5,.2);impact(.28);await wait(700);flash(300);await wait(500);setPh('p6');}

/* INTRO SEQUENCE */
document.getElementById('btn-start').addEventListener('click',activate);
async function activate(){
  initAudio();drone();pSpd=3.5;
  document.getElementById('btn-start').classList.add('glitch');
  document.querySelector('#p0 .hud-tr').textContent='SYSTEME ONLINE';
  startLogs();
  glitchSnd(.18);await wait(220);flash(55);shake(3,180);
  await wait(280);glitchSnd(.15);flash(40);shake(5,150);
  await wait(350);glitchSnd(.2);flash(120);shake(8,280);await wait(280);
  setPh('p1');pSpd=1.5;
  await wait(380);document.getElementById('logo-imagine').classList.add('on');beep(1200,.35,.05);
  await wait(920);document.getElementById('logo-div').classList.add('on');
  await wait(500);document.getElementById('logo-hwr').classList.add('on');beep(600,.22,.04);
  await wait(720);document.getElementById('logo-presents').classList.add('on');await wait(1350);
  flash(55);shake(4,200);glitchSnd(.12);await wait(260);
  setPh('p2');beep(300,.8,.06,'sine');await runBoot();
  flash(80);glitchSnd(.15);await wait(200);
  setPh('p3');sweep(55,2000,2.6,.14);pSpd=6;runTransition();await wait(2750);
  setPh('p4');pSpd=1;impact(.22);
  await wait(180);document.getElementById('t-edition').classList.add('on');beep(440,.5,.04);
  await wait(480);document.getElementById('t-main').classList.add('on');beep(220,.8,.06);beep(330,.6,.04);shake(3,280);
  await wait(580);document.getElementById('t-line').classList.add('on');
  await wait(580);document.getElementById('t-tagline').classList.add('on');await wait(1000);
  document.getElementById('kirby-alert').classList.remove('hidden');
  flash(200,true);glitchSnd(.2);shake(6,400);beep(150,.5,.15,'sawtooth');await wait(2000);
  document.getElementById('btn-proto').classList.add('on');beep(880,.1,.04);
}
document.getElementById('btn-proto').addEventListener('click',async()=>{flash(90);glitchSnd(.1);shake(4,180);await wait(280);setPh('p5');startCD();});
document.getElementById('btn-skip-cd').addEventListener('click',async()=>{clearInterval(cdTimer);flash(90);glitchSnd(.1);await wait(200);setPh('p6');});
document.getElementById('btn-action').addEventListener('click',async()=>{glitchSnd(.15);flash(140);shake(5,280);await wait(380);setPh('p7');document.getElementById('yt-frame').src=`https://www.youtube.com/embed/${CFG.youtubeId}?autoplay=1&rel=0&modestbranding=1`;setTimeout(()=>{document.getElementById('btn-enter-app').style.opacity='1';},8000);});
document.getElementById('btn-enter-app').addEventListener('click',enterApp);
function enterApp(){S.introComplete=true;save();document.getElementById('yt-frame').src='about:blank';document.querySelectorAll('.ph').forEach(p=>p.classList.remove('on'));document.getElementById('app').classList.add('show');initApp();}

/* APP INIT */
function initApp(){
  startClock();startBradStatus();initMap();renderGages();renderBraddy();renderDossiers();updateBadge();
  if(!S.chatHistory||S.chatHistory.length===0){setTimeout(()=>bradMsg("Ah. Vous voila enfin. Le BRADDY3000 vous attendait. Moi aussi, je suppose."),1500);}else{renderHistory();}
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
  document.getElementById('roll-btn').addEventListener('click',spinRoulette);
  document.getElementById('roll-start-btn').addEventListener('click',startMissionFromRoulette);
  document.getElementById('roll-close-btn').addEventListener('click',()=>document.getElementById('roulette-ol').classList.add('hidden'));
  document.getElementById('ms-ok').addEventListener('click',completeMission);
  document.getElementById('ms-fail').addEventListener('click',failMission);
  document.getElementById('ms-close').addEventListener('click',()=>document.getElementById('mission-ol').classList.add('hidden'));
  showPage(S.lastView||'home');
}

/* NAVIGATION */
let navStack=['home'];
function nav(to){navStack.push(to);showPage(to);}
function goBack(){if(navStack.length>1)navStack.pop();showPage(navStack[navStack.length-1]);}
function showPage(name){document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));const p=document.getElementById('page-'+name);if(p)p.classList.add('on');document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));S.lastView=name;save();if(name==='chat'){S.chatBadge=0;save();updateBadge();}}

/* CLOCK */
function startClock(){function u(){const n=new Date();document.getElementById('time-disp').textContent=`${String(n.getHours()).padStart(2,'0')}h${String(n.getMinutes()).padStart(2,'0')}`;}u();setInterval(u,10000);}

/* BRAD STATUS */
const DEF_STATUS=['Brad en ligne','Brad analyse les données','Brad recherche Kirby 67','Brad compile les rapports','Brad prépare une transmission','Brad surveille le BRADDY3000','Brad traite une anomalie','Brad est en pause déjeuner','Brad est temporairement indisponible'];
function startBradStatus(){function u(){const el=document.getElementById('brad-status-lbl');if(el)el.textContent=DEF_STATUS[Math.floor(Math.random()*DEF_STATUS.length)];}u();setInterval(u,3*60*1000);}

/* MAP */
const ZONES=[{id:'alpha',name:'ZONE ALPHA',x:18,y:22,ph:0},{id:'beta',name:'ZONE BETA',x:68,y:38,ph:1},{id:'gamma',name:'ZONE GAMMA',x:32,y:60,ph:2},{id:'delta',name:'ZONE DELTA',x:72,y:68,ph:3},{id:'omega',name:'[ CLASSIFIE ]',x:50,y:47,ph:5}];
function initMap(){const c=document.getElementById('zones-container');c.innerHTML='';ZONES.forEach(z=>{const u=S.phase>=z.ph;const d=document.createElement('div');d.className='zone-marker'+(u?'':' locked');d.style.cssText=`left:${z.x}%;top:${z.y}%`;d.innerHTML=`<div class="zone-dot${u?'':' locked'}"></div><div class="zone-name">${z.name}</div>${u?'':'<div style="font-size:10px">&#128274;</div>'}`;c.appendChild(d);});const b=document.getElementById('kirby-blip');if(b){b.style.left='48%';b.style.top='44%';}setTimeout(drawMap,150);}
function drawMap(){const cv=document.getElementById('cv-map'),wrap=document.getElementById('map-wrap');cv.width=wrap.offsetWidth||window.innerWidth;cv.height=wrap.offsetHeight||300;const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;ctx.strokeStyle='rgba(204,0,0,.08)';ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.strokeStyle='rgba(204,0,0,.04)';for(let i=-H;i<W;i+=80){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}const ul=ZONES.filter(z=>S.phase>=z.ph);if(ul.length>1){ctx.strokeStyle='rgba(204,0,0,.2)';ctx.lineWidth=1;ctx.setLineDash([4,6]);for(let i=0;i<ul.length-1;i++){const a=ul[i],b=ul[i+1];ctx.beginPath();ctx.moveTo(a.x*W/100,a.y*H/100);ctx.lineTo(b.x*W/100,b.y*H/100);ctx.stroke();}ctx.setLineDash([]);}ctx.font='8px monospace';ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillText('50.63N',4,12);ctx.textAlign='right';ctx.fillText('3.07E',W-4,12);ctx.textAlign='left';}

/* GAGES */
function renderGages(){
  const body=document.getElementById('gages-body');if(!S.doneGages)S.doneGages=[];
  if(S.phase===0){body.innerHTML=`<div class="phase-indicator"><div class="phase-name">SYSTEME EN VEILLE</div><div class="phase-desc">En attente du début de l'opération</div></div><div class="braddy-analyzing"><div class="adots"><div class="adot"></div><div class="adot"></div><div class="adot"></div></div><p>En attente de mission</p></div>`;return;}
  const ph=PHASES[Math.min(S.phase,5)];let html=`<div class="phase-indicator"><div class="phase-name">${ph.name}</div><div class="phase-desc">${ph.desc}</div></div>`;
  if(ph.rupture){html+=`<div class="rupture-block"><div class="rupture-title">&#9888; ERREUR SYSTEME &#9888;</div><p class="rupture-error">> FAUX POSITIF DÉTECTÉ</p><p class="rupture-error">> KIRBY 67 NON CONFIRMÉ</p><p class="rupture-error">> RECALIBRATION EN COURS...</p><div class="rupture-msg">Le BRADDY3000 a détecté ce qui semblait être Kirby 67. Il s'agissait d'un sosie. Les coordonnées transmises mènent à l'activité suivante. Les ingénieurs travaillent sur le problème.</div></div><div class="brad-msg-block pacifico">"Aucun traitement de données ne sera possible durant cette opération. Profitez-en pour vous détendre."<span class="brad-sign">— Brad Bitt</span></div>`;body.innerHTML=html;return;}
  if(ph.directAssignment){html+=`<div class="brad-msg-block pacifico">"Les données collectées aujourd'hui me permettent enfin d'attribuer les missions optimales. Le hasard n'est plus nécessaire."<span class="brad-sign">— Brad Bitt</span></div>`;}
  if(ph.gages&&ph.gages.length){ph.gages.forEach(g=>{const done=S.doneGages.includes(g.id);html+=`<div class="gage-card${done?' done':''}" data-gid="${g.id}"><div class="gage-card-header"><div class="gage-card-name">${g.team?'<span class="gage-team-tag">[ÉQUIPE] </span>':''}${g.name}</div><div class="gage-card-bc">+${g.bc} BC</div></div><div class="gage-card-desc">${g.desc}</div><div class="gage-card-footer">${done?'<span class="gage-done-lbl">&#10003; ACCOMPLI</span>':ph.directAssignment?'<span class="gage-direct-tag">&#9658; ATTRIBUTION DIRECTE</span>':'<span class="gage-card-tap">&#9658; APPUYER POUR TIRER AU SORT</span>'}</div></div>`;});}
  if(ph.dt){html+=`<div class="dt-block"><div class="dt-title">&#9889; DOUBLE TROUBLE &#9889;</div><div class="dt-teams"><div class="dt-team"><div class="dt-team-name">ÉQUIPE A</div><div class="dt-team-desc">${ph.dt.a}</div></div><div class="dt-team"><div class="dt-team-name">ÉQUIPE B</div><div class="dt-team-desc">${ph.dt.b}</div></div></div><div class="dt-bonus">${ph.dt.bonus}</div></div>`;}
  if(ph.contracts&&ph.contracts.length){html+=`<div class="contracts-section"><div class="contracts-title">CONTRATS BRADDY3000</div>`;ph.contracts.forEach(c=>{html+=`<div class="contract-card"><div class="contract-name">${c.name}</div><div class="contract-desc">${c.desc}</div><div class="contract-reward">${c.reward}</div></div>`;});html+='</div>';}
  html+=`<div class="braddy-analyzing"><div class="adots"><div class="adot"></div><div class="adot"></div><div class="adot"></div></div><p>Brad analyse votre position actuelle</p></div>`;
  body.innerHTML=html;
  document.querySelectorAll('.gage-card:not(.done)').forEach(card=>{card.addEventListener('click',()=>{const gid=card.dataset.gid;const ph2=PHASES[Math.min(S.phase,5)];const g=ph2.gages.find(x=>x.id===gid);if(!g)return;if(ph2.directAssignment){flash(100,true);setTimeout(()=>openMission(g,Math.floor(Math.random()*4)),200);}else{openRoulette(g);}});});
}

/* ROULETTE */
let rAngle=0,rSpinning=false,rCurrentGage=null,rWinnerIdx=-1;
function openRoulette(gage){rCurrentGage=gage;rWinnerIdx=-1;document.getElementById('roll-phase-lbl').textContent=`PHASE ${S.phase}`;document.getElementById('roll-gname').textContent=gage.name;document.getElementById('roll-gdesc').textContent=gage.desc;document.getElementById('roll-bc-lbl').textContent=`+${gage.bc} BC`;document.getElementById('roll-result').classList.add('hidden');document.getElementById('roll-btn').disabled=false;document.getElementById('roulette-ol').classList.remove('hidden');setTimeout(()=>drawRoulette(rAngle),50);}
function drawRoulette(angle){const cv=document.getElementById('roll-cv');if(!cv)return;const ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2,cy=H/2,r=Math.min(W,H)*.44;ctx.clearRect(0,0,W,H);const gl=ctx.createRadialGradient(cx,cy,r*.85,cx,cy,r*1.1);gl.addColorStop(0,'rgba(204,0,0,0)');gl.addColorStop(.7,'rgba(204,0,0,.3)');gl.addColorStop(1,'rgba(204,0,0,0)');ctx.beginPath();ctx.arc(cx,cy,r*1.08,0,Math.PI*2);ctx.fillStyle=gl;ctx.fill();for(let i=0;i<4;i++){const sA=angle-Math.PI/2+i*Math.PI/2-Math.PI/4,eA=sA+Math.PI/2,mA=sA+Math.PI/4;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,sA,eA);ctx.closePath();ctx.fillStyle=R_COLORS[i];ctx.fill();ctx.strokeStyle='rgba(204,0,0,.8)';ctx.lineWidth=2;ctx.stroke();const tx=cx+Math.cos(mA)*r*.65,ty=cy+Math.sin(mA)*r*.65;ctx.save();ctx.translate(tx,ty);ctx.rotate(mA+Math.PI/2);ctx.fillStyle='rgba(255,255,255,.9)';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(R_PLAYERS[i],0,0);ctx.restore();}for(let i=0;i<4;i++){const a=angle-Math.PI/2+i*Math.PI/2-Math.PI/4;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.strokeStyle='rgba(204,0,0,.6)';ctx.lineWidth=1.5;ctx.stroke();}ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='#cc0000';ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,13,0,Math.PI*2);ctx.fillStyle='#000';ctx.fill();ctx.strokeStyle='#cc0000';ctx.lineWidth=2;ctx.stroke();}
function spinRoulette(){if(rSpinning)return;rSpinning=true;document.getElementById('roll-btn').disabled=true;const target=Math.floor(Math.random()*4);rWinnerIdx=target;const tBase=(4-target)*Math.PI/2;const nC=((rAngle%(2*Math.PI))+2*Math.PI)%(2*Math.PI);let diff=((tBase-nC)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);if(diff<.05)diff+=2*Math.PI;const tot=diff+(4+Math.floor(Math.random()*3))*2*Math.PI;const sA=rAngle,eA=sA+tot,dur=4000+Math.random()*1500,t0=performance.now();(function animate(now){const t=Math.min((now-t0)/dur,1);rAngle=sA+tot*(1-Math.pow(1-t,4));drawRoulette(rAngle);if(t<1){requestAnimationFrame(animate);}else{rAngle=eA;rSpinning=false;drawRoulette(rAngle);flash(200,true);beep(880,.3,.1);setTimeout(()=>shake(5,300),100);document.getElementById('roll-winner-name').textContent=R_PLAYERS[target].toUpperCase();document.getElementById('roll-result').classList.remove('hidden');};})(performance.now());}
function startMissionFromRoulette(){if(!rCurrentGage||rWinnerIdx<0)return;document.getElementById('roulette-ol').classList.add('hidden');openMission(rCurrentGage,rWinnerIdx);}

/* MISSION */
let mCurrentGage=null,mWinnerIdx=-1;
function openMission(gage,winnerIdx){mCurrentGage=gage;mWinnerIdx=winnerIdx;const now=new Date();const t=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;document.getElementById('ms-phase').textContent=`PHASE ${S.phase}`;document.getElementById('ms-title').textContent=gage.name;document.getElementById('ms-agent').textContent=R_PLAYERS[winnerIdx];document.getElementById('ms-time').textContent=t;document.getElementById('ms-bc').textContent=`+${gage.bc} BC`;document.getElementById('ms-statut').textContent='En attente';document.getElementById('ms-ok').disabled=false;document.getElementById('ms-fail').disabled=false;document.getElementById('mission-ol').classList.remove('hidden');}
function completeMission(){if(!mCurrentGage)return;const pk=R_KEYS[mWinnerIdx];S.coins[pk]=(S.coins[pk]||0)+mCurrentGage.bc;if(!S.doneGages)S.doneGages=[];if(!S.doneGages.includes(mCurrentGage.id))S.doneGages.push(mCurrentGage.id);save();document.getElementById('ms-statut').textContent='✓ ACCOMPLIE';document.getElementById('ms-ok').disabled=true;document.getElementById('ms-fail').disabled=true;beep(440,.5,.1,'sine');bradMsg(`Excellent. ${R_PLAYERS[mWinnerIdx]} a accompli la mission "${mCurrentGage.name}". +${mCurrentGage.bc} BC crédités. Le BRADDY3000 enregistre cette contribution.`);setTimeout(()=>{document.getElementById('mission-ol').classList.add('hidden');renderGages();},2000);}
function failMission(){document.getElementById('ms-statut').textContent='✗ ÉCHOUÉE';document.getElementById('ms-ok').disabled=true;document.getElementById('ms-fail').disabled=true;bradMsg(`Mission échouée. Le BRADDY3000 est déçu. Ce n'est pas un jugement. Si.`);setTimeout(()=>document.getElementById('mission-ol').classList.add('hidden'),1500);}

/* BRADDY3000 */
function renderBraddy(){const b=document.getElementById('braddy-body'),ph=S.phase,dc=ph*20,ka=ph===0?3:Math.min(3+ph*18,97),rl=Math.floor(Math.random()*25+ph*10+20);b.innerHTML=`<div class="stat-block"><div class="stat-label">DONNÉES COLLECTÉES</div><div class="stat-bar-wrap"><div class="stat-bar" style="width:${dc}%"></div></div><div class="stat-value-row"><div class="stat-val">${dc}<span style="font-size:.6em;opacity:.5">%</span></div><div class="stat-unit">PHASE ${ph}/5</div></div></div><div class="stat-block"><div class="stat-label">LOCALISATION KIRBY 67</div><div class="stat-bar-wrap"><div class="stat-bar yellow" style="width:${ka}%"></div></div><div class="stat-value-row"><div class="stat-val">${ka}<span style="font-size:.6em;opacity:.5">%</span></div><div class="stat-unit">PRÉCISION</div></div></div><div class="stat-block"><div class="stat-label">FIABILITÉ DU BRADDY3000</div><div class="stat-bar-wrap"><div class="stat-bar green" style="width:${rl}%"></div></div><div class="stat-value-row"><div class="stat-val">${rl}<span style="font-size:.6em;opacity:.5">%</span></div><div class="stat-unit">ESTIMÉ</div></div></div><div class="fun-stat"><div>> Température du grille-pain de Brad : <span>42°C</span></div><div>> Niveau de sérieux : <span>3%</span></div><div>> Charabia généré : <span>${Math.floor(Math.random()*999)+100} TB</span></div><div>> Taux de bradification : <span>94.7%</span></div><div>> Grille-pains détectés : <span>1 (perdu)</span></div><div>> Probabilité que tout se passe bien : <span>incalculable</span></div></div>`;}

/* PHASE MANAGEMENT */
function advancePhase(n){if(n<=S.phase)return;S.phase=n;const coins=CFG.phaseCoins[n]||0;Object.keys(S.coins).forEach(p=>S.coins[p]+=coins);save();initMap();renderGages();renderBraddy();renderDossiers();const msgs=['','Phase 1 initialisée. Données en réception. Bonne chance.','Phase 2 débloquée. Votre progression est acceptable.','Phase 3 active. Attention, rupture narrative imminente.','Phase 4 critique. Contrats BRADDY3000 prioritaires.','Phase 5 — Ultime. Le BRADDY3000 et moi-même vous regardons.'];if(msgs[n])setTimeout(()=>bradMsg(msgs[n]),500);}

/* DOSSIERS */
const DOSS={kirby67:{title:'Kirby 67',content:`<div class="class-tag">CLASSIFICATION : ALPHA-ROUGE</div><h3>IDENTIFICATION</h3><p>Kirby 67 est le double maléfique de Kirby 54, capturé lors de l'Edition II. Niveau de malveillance : 94% selon le BRADDY3000.</p><h3>DERNIÈRE LOCALISATION</h3><p>Ville de Lille — signal perdu lors de son évasion.</p><h3>MOTIVATIONS</h3><p>Kirby 67 parle obsessionnellement d'un "Monde au Serrano".</p><p class="warn">NE PAS mentionner le Serrano en sa présence.</p><h3>NOTE DE BRAD BITT</h3><p class="warn">Si vous le trouvez, ne le nourrissez pas. Et surtout pas de Serrano.</p>`}};
function renderDossiers(){const l=document.getElementById('dossiers-list');const rows=[{id:'kirby67',name:'Kirby 67',u:true},{id:'bb',name:'Brad Bitt',u:false},{id:'b3k',name:'BRADDY3000',u:false},{id:'inc',name:'Incidents précédents',u:false},{id:'arc',name:'Archives',u:false}];l.innerHTML=rows.map(d=>`<div class="dossier-row ${d.u?'unlocked':'locked'}" ${d.u?`data-dos="${d.id}"`:''}><span class="dossier-name">${d.name}</span><span class="dossier-badge ${d.u?'open':'closed'}">${d.u?'DÉBLOQUÉ':'&#128274; ACCÈS REFUSÉ'}</span></div>`).join('');document.querySelectorAll('.dossier-row.unlocked').forEach(r=>r.addEventListener('click',()=>{const d=DOSS[r.dataset.dos];if(!d)return;document.getElementById('dd-title').textContent=d.title;document.getElementById('dd-body').innerHTML=d.content;nav('dossier-detail');}));}

/* BONUS */
const BONUS_INFO={gageSecondaire:{title:'Gage secondaire',desc:"Un gage de secours si celui actuel ne convient pas. En stock : 1/Personne"},refaireRoue:{title:'Refaire la roue',desc:"Retirer un nouveau gage. En stock : 2/Personne"},laisserPasser:{title:'Laisser Passer',desc:"Ignorer un gage sans pénalité. Utilisable une fois."},doubleTimbre:{title:'Double Tirage',desc:"Deux gages tirés simultanément. Deux fois plus de chaos."},imposerGage:{title:'Imposer un Gage',desc:"Impose un gage supplémentaire à la personne de votre choix."},declencherEvenement:{title:'Déclencher un événement',desc:"Active un événement spécial. Même Brad ne sait pas toujours ce qui va se passer."}};
let curBonus=null,selPl=null;
function openBonus(id){curBonus=id;selPl=null;const info=BONUS_INFO[id];document.getElementById('bd-title').textContent=info.title;document.getElementById('bd-desc').textContent=info.desc;['hippolyte','nathanael','edwin','teo'].forEach(p=>{const cost=CFG.costs[id]?.[p]||0,stock=S.stock[id]?.[p]??0,coins=S.coins[p]||0;document.getElementById('cost-'+p).textContent=`${cost} BC (${stock} en stock)`;const btn=document.querySelector(`.player-btn[data-player="${p}"]`);if(btn){btn.classList.remove('selected');btn.style.opacity=(stock>0&&coins>=cost)?'1':'.4';}});document.getElementById('bd-stock').textContent=`Soldes — Hippolyte:${S.coins.hippolyte} | Nathanaël:${S.coins.nathanael} | Edwin:${S.coins.edwin} | Téo:${S.coins.teo}`;document.getElementById('purchase-confirm').classList.add('hidden');document.getElementById('purch-feedback').classList.add('hidden');nav('bonus-detail');}
function selPlayer(p){if(!curBonus)return;const cost=CFG.costs[curBonus]?.[p]||0,stock=S.stock[curBonus]?.[p]??0,coins=S.coins[p]||0;if(stock<=0||coins<cost)return;selPl=p;document.querySelectorAll('.player-btn').forEach(b=>b.classList.remove('selected'));document.querySelector(`.player-btn[data-player="${p}"]`)?.classList.add('selected');const names={hippolyte:'Hippolyte',nathanael:'Nathanaël',edwin:'Edwin',teo:'Téo'};document.getElementById('purch-name').textContent=names[p];document.getElementById('purchase-confirm').classList.remove('hidden');document.getElementById('purch-feedback').classList.add('hidden');}
function confirmPurch(){if(!curBonus||!selPl)return;const cost=CFG.costs[curBonus]?.[selPl]||0,stock=S.stock[curBonus]?.[selPl]??0;if(stock<=0){showFb('Stock épuisé.',true);return;}if((S.coins[selPl]||0)<cost){showFb('BittCoins insuffisants.',true);return;}S.coins[selPl]-=cost;S.stock[curBonus][selPl]--;save();document.getElementById('purchase-confirm').classList.add('hidden');showFb(`✓ "${BONUS_INFO[curBonus].title}" activé !`,false);const cmts=["Bonne initiative. Ou catastrophique.","Le BRADDY3000 enregistre.","Hmm. Intéressant.","La Brad Corporation approuve. À moitié."];setTimeout(()=>bradMsg(cmts[Math.floor(Math.random()*cmts.length)]),2000);}
function cancelPurch(){selPl=null;document.getElementById('purchase-confirm').classList.add('hidden');document.querySelectorAll('.player-btn').forEach(b=>b.classList.remove('selected'));}
function showFb(msg,err){const el=document.getElementById('purch-feedback');el.textContent=msg;el.className=err?'err':'ok';el.classList.remove('hidden');}

/* AIDE */
const AIDE={lore:{title:'Le LORE',body:'<h3>Le LORE</h3><p>Le Lore regroupe l\'ensemble des événements ayant conduit à l\'opération actuelle. Vous y trouverez des informations concernant Brad Bitt, Kirby 67, le BRADDY3000 et les événements classifiés.</p><p class="warn">Certaines informations peuvent être incomplètes, confidentielles ou totalement inventées. <span class="brand">Brad Bitt Corporation</span> ne garantit pas l\'exactitude des données affichées.</p>'},gages:{title:'Les Gages',body:'<h3>Les Gages</h3><p>Les gages constituent la principale source de données du BRADDY3000. Chaque mission accomplie permet de gagner des BittCoins et de faire progresser l\'enquête.</p><p>Phases 1 à 4 : attribution par roulette. Phase 5 : attribution directe par Brad.</p><p class="warn">Refuser un gage n\'est pas interdit. Mais le BRADDY3000 risque fortement de vous juger.</p>'},doubleTrouble:{title:'"Double Trouble"',body:'<h3>Double Trouble</h3><p>Lorsqu\'il est activé, deux équipes s\'affrontent simultanément. La première équipe revenue gagne un bonus de +5 BC par participant.</p><p class="warn">Et pourtant, c\'est Brad qui a créé le système. Enfin normalement.</p>'},chat:{title:'Le CHAT',body:'<h3>Le CHAT</h3><p>Le chat de Brad Bitt répond à certains types de messages. Vérifiez le statut de Brad avant de lui écrire.</p><p class="warn">Sauf quand elles ne le sont pas. Ce qui est parfois le cas.</p>'},bonus:{title:'Les Bonus',body:'<h3>Les Bonus</h3><p>Les bonus se paient en BittCoins. Ils permettent de modifier temporairement les règles du jeu.</p><p class="warn">Brad Corporation décline toute responsabilité concernant les conséquences sociales, émotionnelles ou gastronomiques.</p>'},monnaie:{title:'La Monnaie',body:'<h3>La Monnaie</h3><p>Les BittCoins s\'obtiennent en accomplissant des gages. Gage individuel : +5 BC. Gage équipe : +10 BC. Phase 5 : +10 BC.</p><p class="warn">Brad Bitt Corporation n\'est pas responsable de votre dette.</p>'},braddy3000:{title:'Le BRADDY3000',body:'<h3>Le BRADDY3000</h3><p>Système expérimental développé par Brad Bitt pour retrouver Kirby 67. Fiabilité estimée : entre 3% et 98%.</p><p class="warn">Les ingénieurs travaillent encore sur le problème.</p>'},dossiers:{title:'Les Dossiers',body:'<h3>Les Dossiers</h3><p>Les Dossiers regroupent les informations confidentielles de l\'opération. De nouveaux dossiers peuvent être débloqués au cours de la journée.</p><p class="warn">La compréhension est facultative.</p>'}};
function openAide(id){const d=AIDE[id];if(!d)return;document.getElementById('ad-title').textContent=d.title;document.getElementById('ad-body').innerHTML=d.body;nav('aide-detail');}

/* CHAT */
const RESPONSES={kirby:["Excellente question. J'aimerais également le savoir.","Kirby 67 est... quelque part. Le BRADDY3000 analyse."],mission:["Si je vous le disais, ce ne serait plus une mission.","Les missions se révèlent d'elles-mêmes. Comme moi."],gage:["Chaque gage accompli rapproche le BRADDY3000 de la vérité.","Le gage est votre destinée. Embrassez-la."],bonjour:["Ah. Vous voilà.","Salutations.","Je savais que vous repasseriez."],salut:["Salut. Revenons aux affaires.","Hmm."],serrano:["Ne. Prononcez. Pas. Ce. Mot.","...Je vous surveille."],grille:["Mon grille-pain est temporairement indisponible.","Ce sujet est classifié."],brad:["C'est moi.","Vous avez mentionné mon nom. Je suis méfiant."],merci:["Le BRADDY3000 prend note de votre gratitude."],temu:["Mes vêtements sont une affaire privée."],raclette:["Sujet délicat. Continuons.","Le BRADDY3000 enregistre votre intérêt culinaire."]};
const FALLBACK=["Intéressant. Le BRADDY3000 prend note.","Hmm. Je n'ai pas de réponse claire à cela.","Le BRADDY3000 analyse votre message. Résultat : confus.","Votre message a été reçu, archivé et partiellement incompris.","Je pourrais répondre. Mais je choisirais de ne pas le faire.","La réponse est 42. Ou peut-être 67.","Notez que je ne suis pas un assistant. Je suis Brad Bitt."];
function addUserMsg(txt){const m=document.getElementById('chat-msgs');const d=document.createElement('div');d.className='chat-msg';d.innerHTML=`<div class="msg-label">Vous</div><div class="msg-sep">—</div><div class="msg-text">${esc(txt)}</div>`;m.appendChild(d);m.scrollTop=m.scrollHeight;S.chatHistory.push({type:'user',text:txt});save();}
function bradMsg(txt){const m=document.getElementById('chat-msgs'),ty=document.getElementById('chat-typing');ty.classList.remove('hidden');m.scrollTop=m.scrollHeight;setTimeout(()=>{ty.classList.add('hidden');const d=document.createElement('div');d.className='chat-msg brad-msg';d.innerHTML=`<div class="msg-label brad pacifico">Brad Bitt</div><div class="msg-sep">—</div><div class="msg-text">${esc(txt)}</div>`;m.appendChild(d);m.scrollTop=m.scrollHeight;S.chatHistory.push({type:'brad',text:txt});const chatPg=document.getElementById('page-chat');if(!chatPg.classList.contains('on')){S.chatBadge=(S.chatBadge||0)+1;updateBadge();}save();},1000+txt.length*15);}
function renderHistory(){const m=document.getElementById('chat-msgs');m.innerHTML='';S.chatHistory.forEach(h=>{const d=document.createElement('div');if(h.type==='user'){d.className='chat-msg';d.innerHTML=`<div class="msg-label">Vous</div><div class="msg-sep">—</div><div class="msg-text">${esc(h.text)}</div>`;}else{d.className='chat-msg brad-msg';d.innerHTML=`<div class="msg-label brad pacifico">Brad Bitt</div><div class="msg-sep">—</div><div class="msg-text">${esc(h.text)}</div>`;}m.appendChild(d);});m.scrollTop=m.scrollHeight;}
function updateBadge(){const b=document.getElementById('chat-badge');if(!b)return;b.textContent=S.chatBadge>0?S.chatBadge:'';b.style.display=S.chatBadge>0?'flex':'none';}
function addSysMsg(txt){const m=document.getElementById('chat-msgs');const d=document.createElement('div');d.className='chat-msg sys-msg';d.innerHTML=`<div class="msg-text">> ${esc(txt)}</div>`;m.appendChild(d);m.scrollTop=m.scrollHeight;}
function sendMsg(){const inp=document.getElementById('chat-inp');const txt=inp.value.trim();if(!txt)return;inp.value='';
  if(txt==='/admin.p1'){advancePhase(1);addSysMsg('Phase 1 débloquée.');return;}
  if(txt==='/admin.p2'){advancePhase(2);addSysMsg('Phase 2 débloquée.');return;}
  if(txt==='/admin.p3'){advancePhase(3);addSysMsg('Phase 3 débloquée.');return;}
  if(txt==='/admin.p4'){advancePhase(4);addSysMsg('Phase 4 débloquée.');return;}
  if(txt==='/admin.p5'){advancePhase(5);addSysMsg('Phase 5 débloquée.');return;}
  if(txt==='/admin.coins'){Object.keys(S.coins).forEach(p=>S.coins[p]+=5);save();addSysMsg('+5 BC pour tous.');return;}
  if(txt==='/admin.reset'){if(confirm('Réinitialiser ?')){localStorage.removeItem('n2s3');location.reload();}return;}
  const upper=txt.toUpperCase();if(CFG.phaseCodes[upper]!==undefined){advancePhase(CFG.phaseCodes[upper]);addSysMsg(`CODE VALIDE — Phase ${CFG.phaseCodes[upper]} débloquée.`);return;}
  addUserMsg(txt);const lower=txt.toLowerCase();let resp=null;for(const[kw,rs]of Object.entries(RESPONSES)){if(lower.includes(kw)){resp=rs[Math.floor(Math.random()*rs.length)];break;}}if(!resp)resp=FALLBACK[Math.floor(Math.random()*FALLBACK.length)];bradMsg(resp);}

/* BOOTSTRAP */
window.addEventListener('resize',()=>{resizeBg();initParts();if(document.getElementById('app').classList.contains('show'))drawMap();});
resizeBg();initParts();tickParts();
if(S.introComplete){document.querySelectorAll('.ph').forEach(p=>p.classList.remove('on'));document.getElementById('app').classList.add('show');initApp();}
