import {Game} from './game.js';import {WORLDS} from './levels.js';import {load,save} from './save.js';import {loadAssets} from './assets.js';
const cv=document.getElementById('c'),ctx=cv.getContext('2d'),ui=document.getElementById('ui');
let S=load(),game=null,open=true,last=0,ac;loadAssets();
const F={jump:[440,.08],flip:[300,.12],dash:[200,.1],coin:[880,.07],die:[110,.3],chk:[660,.15],kill:[520,.1],win:[990,.4]};
function sfx(n){if(!S.settings.sfx||!F[n])return;try{ac=ac||new AudioContext();const[f,d]=F[n],o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(S.settings.sfx*.08,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(t+d)}catch{}}
const MAP={left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],jump:['Space','KeyZ'],flip:['KeyX','KeyW','ArrowUp'],dash:['KeyC','ShiftLeft','ShiftRight']};
const keys=new Set();
const inp={pressed:{},held:a=>MAP[a].some(k=>keys.has(k))};
addEventListener('keydown',e=>{if(/^(Space|Arrow)/.test(e.code))e.preventDefault();if(e.repeat)return;keys.add(e.code);
  for(const a in MAP)if(MAP[a].includes(e.code))inp.pressed[a]=true;
  if(game&&(e.code==='Escape'||e.code==='KeyP')){open?resume():pause()}
  if(game&&!open&&e.code==='KeyR')game.reset()});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();if(game&&!open&&!game.done)pause()});
const show=h=>{ui.innerHTML=h?`<div class="panel">${h}</div>`:'';open=!!h};
const medalOf=i=>S.best[i]?S.best[i].medal:'NO MEDAL';
function menu(){game=null;show(`<h1>FLIP<b>SHIFT</b></h1><p class="sub">Flip gravity. Dash. Reach the gate.</p>
<button data-a="worlds">PLAY</button><button data-a="settings">SETTINGS</button>
<div class="ctl">Move A/D or ←/→ · Jump Space/Z<br>Flip gravity X/W/↑ · Dash C/Shift · Pause Esc · Restart R</div>`)}
function worlds(){show(`<h2>WORLDS</h2><div class="grid">${WORLDS.map((w,i)=>`<button data-a="play" data-i="${i}" ${i>=S.unlocked?'disabled':''}>${i+1}. ${w.name}<small>${i>=S.unlocked?'LOCKED':`${medalOf(i)}${S.best[i]?' · '+S.best[i].time.toFixed(1)+'s · '+S.best[i].score:''}`}</small></button>`).join('')}</div><button data-a="menu">BACK</button>`)}
function settings(back='menu'){const s=S.settings;show(`<h2>SETTINGS</h2>
<label>Sound volume<input type="range" min="0" max="1" step=".1" value="${s.sfx}" data-s="sfx"></label>
<label>Screen shake<input type="checkbox" ${s.shake?'checked':''} data-s="shake"></label>
<label>Show timer<input type="checkbox" ${s.timer?'checked':''} data-s="timer"></label><button data-a="${back}">BACK</button>`)}
function play(i){game=new Game(i,(e,r)=>{sfx(e);if(e==='win')complete(r)});show('')}
function pause(){if(game&&!game.done)show(`<h2>PAUSED</h2><button data-a="resume">RESUME</button><button data-a="restart">RESTART</button><button data-a="psettings">SETTINGS</button><button data-a="menu">QUIT TO MENU</button>`)}
function resume(){if(game&&!game.done)show('')}
function complete(r){const i=game.idx,b=S.best[i];if(!b||r.score>b.score)S.best[i]={...r};S.unlocked=Math.max(S.unlocked,Math.min(WORLDS.length,i+2));save(S);
  setTimeout(()=>{if(game&&game.idx===i)show(`<h2>WORLD ${i+1} CLEAR</h2><div class="medal">${r.medal}</div><p>Time ${r.time.toFixed(1)}s · Coins ${r.coins}/${r.total} · Deaths ${r.deaths}<br>Score <b>${r.score}</b></p>
${i<WORLDS.length-1?'<button data-a="next">NEXT WORLD</button>':''}<button data-a="restart">REPLAY</button><button data-a="worlds">WORLDS</button>`)},600)}
const A={menu,worlds,settings:()=>settings('menu'),play:e=>play(+e.dataset.i),resume,restart:()=>play(game.idx),next:()=>play(game.idx+1),psettings:()=>settings('pause')};
ui.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t&&A[t.dataset.a])A[t.dataset.a](t)});
ui.addEventListener('input',e=>{const k=e.target.dataset.s;if(!k)return;S.settings[k]=e.target.type==='checkbox'?e.target.checked:+e.target.value;save(S)});
function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;
  if(game){if(!open||game.done)game.frame(dt,inp);game.draw(ctx,S)}else{ctx.fillStyle='#0a1424';ctx.fillRect(0,0,960,560)}
  requestAnimationFrame(loop)}
menu();requestAnimationFrame(loop);
