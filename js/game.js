import {T,H,WORLDS,build} from './levels.js';
import {sprite,img} from './assets.js';
const W=960,VH=H*T,GRAV=2000,JUMP=700,SPEED=300,DASH=820;
const THEME=[['#0a1424','#12304a','#19c5d6'],['#08202a','#0f3a47','#3de0d0'],['#161a2c','#242a48','#ff8a3d'],['#140c1c','#2a1a3a','#6df0ff']];
export class Game{
  constructor(idx,cb){this.idx=idx;this.cb=cb;this.L=build(WORLDS[idx]);this.th=THEME[idx];this.reset()}
  reset(){const L=this.L;this.coins=L.coins.map(c=>({...c,got:false}));this.drones=L.drones.map(d=>({...d,dead:false,x:0,y:d.y*T+20}));
    this.cp={...L.start};this.on=new Set();this.time=0;this.deaths=0;this.got=0;this.kills=0;this.shake=0;this.done=false;this.cam=0;this.spawn()}
  spawn(){this.p={x:this.cp.x,y:this.cp.y,vx:0,vy:0,g:1,w:24,h:32,on:false,coy:0,jb:0,fb:0,db:0,dash:0,dcool:0,dd:1,dir:1,dead:0,fcool:0,cut:false}}
  solid(tx,ty){if(tx<0||tx>=this.L.w)return true;if(ty<0||ty>=H)return false;return this.L.g[ty][tx]===1}
  frame(dt,inp){
    const p=this.p;if(inp.pressed.jump)p.jb=.12;if(inp.pressed.flip)p.fb=.12;if(inp.pressed.dash)p.db=.12;
    if(!this.done){const n=Math.ceil(dt/(1/120));for(let i=0;i<n;i++)this.step(dt/n,inp)}
    inp.pressed={};this.shake=Math.max(0,this.shake-dt);
    const tx=Math.max(0,Math.min(this.L.w*T-W,p.x+12-W/2));this.cam+=(tx-this.cam)*Math.min(1,dt*8);
  }
  step(dt,inp){
    const p=this.p,L=this.L;
    if(p.dead>0){p.dead-=dt;if(p.dead<=0)this.spawn();return}
    this.time+=dt;p.jb-=dt;p.fb-=dt;p.db-=dt;p.coy-=dt;p.dcool-=dt;p.fcool-=dt;p.dash-=dt;
    const ax=(inp.held('right')?1:0)-(inp.held('left')?1:0);if(ax)p.dir=ax;
    if(p.db>0&&p.dcool<=0){p.dash=.14;p.dcool=.55;p.dd=ax||p.dir;p.db=0;this.cb('dash')}
    if(p.dash>0){p.vx=p.dd*DASH;p.vy=0}else{
      const acc=(p.on?3600:2600)*dt,t=ax*SPEED;p.vx+=Math.max(-acc,Math.min(acc,t-p.vx));
      if(!ax&&p.on)p.vx*=.82;
      if(p.fb>0&&p.fcool<=0){p.g=-p.g;p.fcool=.2;p.fb=0;p.vy=p.g*120;p.on=false;p.coy=0;this.cb('flip')}
      if(p.jb>0&&p.coy>0){p.vy=-p.g*JUMP;p.jb=0;p.coy=0;p.cut=true;this.cb('jump')}
      if(p.cut&&!inp.held('jump')&&-p.g*p.vy>300){p.vy=-p.g*300;p.cut=false}
      p.vy+=p.g*GRAV*dt;p.vy=Math.max(-900,Math.min(900,p.vy));
    }
    this.mx(p.vx*dt);p.on=false;this.my(p.vy*dt);
    if(p.on){p.coy=.1;p.cut=false}
    if(p.y>(H+3)*T||p.y<-3*T)return this.die();
    const x0=Math.floor(p.x/T),x1=Math.floor((p.x+p.w)/T),y0=Math.floor(p.y/T),y1=Math.floor((p.y+p.h)/T);
    for(let ty=Math.max(0,y0);ty<=Math.min(H-1,y1);ty++)for(let tx=Math.max(0,x0);tx<=Math.min(L.w-1,x1);tx++){
      const v=L.g[ty][tx];if(v<2)continue;const sy=ty*T+(v===2?20:0);
      if(p.x+p.w>tx*T+10&&p.x<tx*T+30&&p.y+p.h>sy+4&&p.y<sy+20)return this.die();
    }
    for(const d of this.drones){if(d.dead)continue;d.x=((d.x1+d.x2+1)/2+Math.sin(this.time*1.3+d.ph)*(d.x2-d.x1)/2)*T;
      if(Math.abs(d.x-(p.x+12))<26&&Math.abs(d.y-(p.y+16))<28){if(p.dash>0){d.dead=true;this.kills++;this.cb('kill')}else return this.die()}}
    for(const c of this.coins)if(!c.got&&Math.abs(c.x-(p.x+12))<24&&Math.abs(c.y-(p.y+16))<28){c.got=true;this.got++;this.cb('coin')}
    L.chk.forEach((k,i)=>{if(!this.on.has(i)&&p.x>k.x*T){this.on.add(i);this.cp={x:k.x*T+8,y:(H-1)*T-32};this.cb('chk')}});
    if(Math.abs(p.x+12-(L.exit*T+20))<24)this.finish();
  }
  mx(dx){const p=this.p;p.x+=dx;
    for(let ty=Math.floor(p.y/T);ty<=Math.floor((p.y+p.h-.01)/T);ty++)for(let tx=Math.floor(p.x/T);tx<=Math.floor((p.x+p.w-.01)/T);tx++)
      if(this.solid(tx,ty)){p.x=dx>0?tx*T-p.w:(tx+1)*T;p.vx=0;return}}
  my(dy){const p=this.p;p.y+=dy;
    for(let ty=Math.floor(p.y/T);ty<=Math.floor((p.y+p.h-.01)/T);ty++)for(let tx=Math.floor(p.x/T);tx<=Math.floor((p.x+p.w-.01)/T);tx++)
      if(this.solid(tx,ty)){if(dy>0){p.y=ty*T-p.h;if(p.g>0)p.on=true}else{p.y=(ty+1)*T;if(p.g<0)p.on=true}p.vy=0;return}}
  die(){if(this.p.dead>0)return;this.p.dead=.6;this.deaths++;this.shake=.3;this.cb('die')}
  finish(){this.done=true;const W_=WORLDS[this.idx],t=this.time,all=this.got===this.coins.length,r=this.got/Math.max(1,this.coins.length);
    const medal=all&&t<=W_.par?'GOLD':(r>=.6&&t<=W_.par*1.5)?'SILVER':'BRONZE';
    const score=Math.max(0,this.got*100+Math.round(Math.max(0,W_.par-t)*20)+this.kills*50-this.deaths*50);
    this.cb('win',{time:t,coins:this.got,total:this.coins.length,deaths:this.deaths,score,medal})}
  draw(ctx,S){
    const th=this.th,L=this.L,cam=Math.round(this.cam),sh=this.shake>0&&S.settings.shake?(Math.random()-.5)*8:0;
    const bg=img('bg'+(this.idx+1));
    if(bg){const bw=bg.width*VH/bg.height,o=-(cam*.3)%bw;for(let x=o;x<W;x+=bw)ctx.drawImage(bg,x,0,bw,VH)}
    else{const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,th[0]);g.addColorStop(1,th[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,VH)}
    ctx.save();ctx.translate(-cam+sh,sh);
    const a=Math.max(0,Math.floor(cam/T)),b=Math.min(L.w-1,Math.ceil((cam+W)/T));
    for(let ty=0;ty<H;ty++)for(let tx=a;tx<=b;tx++){const v=L.g[ty][tx],x=tx*T,y=ty*T;
      if(v===1)sprite(ctx,'tile'+(this.idx+1),x,y,T,T,0,0,()=>{ctx.fillStyle=th[1];ctx.fillRect(x,y,T,T);ctx.strokeStyle=th[2];ctx.globalAlpha=.5;ctx.strokeRect(x+.5,y+.5,T-1,T-1);ctx.globalAlpha=1});
      else if(v>1)sprite(ctx,'spike',x,y,T,T,0,v===3,()=>{ctx.fillStyle='#ff8a3d';ctx.beginPath();const bs=v===2;ctx.moveTo(x+6,bs?y+T:y);ctx.lineTo(x+T/2,bs?y+18:y+22);ctx.lineTo(x+T-6,bs?y+T:y);ctx.fill()})}
    const t=this.time;
    for(const c of this.coins)if(!c.got)sprite(ctx,'coin',c.x-12,c.y-12,24,24,0,0,()=>{ctx.fillStyle='#6df0ff';ctx.beginPath();ctx.arc(c.x,c.y+Math.sin(t*4+c.x)*2,7,0,7);ctx.fill()});
    L.chk.forEach((k,i)=>{const on=this.on.has(i),x=k.x*T,y=(H-1)*T-48;sprite(ctx,on?'checkpointOn':'checkpoint',x,y,T,48,0,0,()=>{ctx.fillStyle=on?'#19c5d6':'#3a5068';ctx.fillRect(x+16,y+4,8,44);ctx.fillRect(x+6,y+4,28,8)})});
    {const x=L.exit*T-10,y=(H-1)*T-80;sprite(ctx,'exit',x,y,60,80,0,0,()=>{ctx.strokeStyle='#ff8a3d';ctx.lineWidth=4;ctx.strokeRect(x+8,y+8,44,72);ctx.fillStyle='rgba(255,138,61,.2)';ctx.fillRect(x+8,y+8,44,72)})}
    for(const d of this.drones)if(!d.dead)sprite(ctx,'drone',d.x-18,d.y-18,36,36,0,0,()=>{ctx.fillStyle='#ff8a3d';ctx.fillRect(d.x-14,d.y-9,28,18);ctx.fillStyle='#0a1424';ctx.fillRect(d.x-6,d.y-3,12,6)});
    const p=this.p;if(p.dead<=0){
      if(p.dash>0){ctx.globalAlpha=.3;ctx.fillStyle='#6df0ff';ctx.fillRect(p.x-p.dd*20,p.y,p.w,p.h);ctx.globalAlpha=1}
      sprite(ctx,'player',p.x-8,p.y-4,40,40,p.dir<0,p.g<0,()=>{ctx.fillStyle='#19c5d6';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#ff8a3d';ctx.fillRect(p.dir>0?p.x+12:p.x,p.g>0?p.y+6:p.y+p.h-12,12,6)})}
    ctx.restore();
    ctx.fillStyle='#d8f3f7';ctx.font='600 16px Segoe UI,sans-serif';ctx.textBaseline='top';
    ctx.fillText(WORLDS[this.idx].name,16,12);ctx.fillText(`COINS ${this.got}/${this.coins.length}`,16,34);
    if(S.settings.timer)ctx.fillText(`${this.time.toFixed(1)}s   DEATHS ${this.deaths}`,16,56);
    ctx.fillStyle=this.p.dcool<=0?'#6df0ff':'#3a5068';ctx.fillRect(W-120,16,100,8);ctx.fillStyle='#d8f3f7';ctx.fillText('DASH',W-120,28);
  }
}
