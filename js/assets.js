// FLIPSHIFT visual asset manifest. Artwork supplied separately from gameplay code.
export const MANIFEST={
  player:'assets/player/player.webp',
  tile1:'assets/tiles/tile_world1.webp',tile2:'assets/tiles/tile_world2.webp',tile3:'assets/tiles/tile_world3.webp',tile4:'assets/tiles/tile_world4.webp',
  bg1:'assets/backgrounds/bg_world1.webp',bg2:'assets/backgrounds/bg_world2.webp',bg3:'assets/backgrounds/bg_world3.webp',bg4:'assets/backgrounds/bg_world4.webp',
  coin:'assets/collectibles/coin.webp',checkpoint:'assets/collectibles/checkpoint_off.webp',checkpointOn:'assets/collectibles/checkpoint_on.webp',exit:'assets/collectibles/exit_gate.webp',
  spike:'assets/hazards/spike.webp',drone:'assets/hazards/drone.webp'};
const imgs={};
export function loadAssets(){for(const[k,src]of Object.entries(MANIFEST)){const i=new Image();i.onload=()=>{i.ok=true};i.src=src;imgs[k]=i}}
export const img=k=>imgs[k]&&imgs[k].ok?imgs[k]:null;
export function sprite(ctx,k,x,y,w,h,fx,fy,fallback){
  const i=img(k);if(!i){fallback&&fallback();return}
  ctx.save();ctx.translate(x+w/2,y+h/2);ctx.scale(fx?-1:1,fy?-1:1);ctx.drawImage(i,-w/2,-h/2,w,h);ctx.restore();
}
