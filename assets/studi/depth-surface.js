import {makeDepth as makeRowDepth,drawDepth} from '../depth-surface.js?v=rt-7';
export {drawDepth};
// Variant of the main site's makeDepth for the pen. Same GPU program and same 2D fallback; only the relief texture differs: style {kind:'lineare',gain,cap} rises with the distance from the silhouette edge (gain times, capped at cap image widths), blurred 3x3, as in the landing's depth-surface.ts. The main site's per-row dome made the thin pen far too thick: it bent, and the nib tore when it turned.
// Everything is built the first time a tilt needs it (drawDepth calls prepare()): the main site's depth and program, then the linear relief uploaded over its texture. Touch screens never tilt the pen, so they never pay for it (the main site computes its per-row relief in the constructor, while the page loads); computers warm it up in idle time, as in the main site.
export function makeDepth(base,createCanvas,style){if(style?.kind!=='lineare')return makeRowDepth(base,createCanvas);
 const depth={gpu:undefined,prepare(){if(depth.gpu!==undefined)return depth.gpu;depth.gpu=null;const gpu=makeRowDepth(base,createCanvas).prepare();
  // If the linear relief cannot be computed or uploaded, the main site's row texture stays: drawDepth never sees the error.
  if(gpu)try{const {w,h,data}=linearRelief(base,createCanvas,style),gl=gpu.gl;gl.activeTexture(gl.TEXTURE1);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.R8,w,h,0,gl.RED,gl.UNSIGNED_BYTE,data);}catch(e){console.warn('linear relief unavailable, row relief kept',e);}
  return depth.gpu=gpu;}};
 if(!globalThis.matchMedia?.('(hover: none)').matches)(globalThis.requestIdleCallback||(cb=>setTimeout(cb,1)))(()=>depth.prepare(),{timeout:3000});
 return depth;}
export function linearRelief(base,createCanvas,{gain,cap}){const w=Math.min(512,base.width),h=Math.round(w*base.height/base.width),c=createCanvas();c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(base,0,0,w,h);const {data}=x.getImageData(0,0,w,h),n=w*h;
 const inside=new Uint8Array(n),dist=new Float32Array(n),BIG=1e6;for(let i=0;i<n;i++){inside[i]=data[i*4+3]>100?1:0;dist[i]=inside[i]?BIG:0;}
 // Two-pass chamfer distance from the edge.
 const at=(xx,yy)=>xx<0||yy<0||xx>=w||yy>=h?0:dist[yy*w+xx];
 for(let y=0;y<h;y++)for(let px=0;px<w;px++){const i=y*w+px;if(dist[i])dist[i]=Math.min(dist[i],at(px-1,y)+1,at(px,y-1)+1,at(px-1,y-1)+1.414,at(px+1,y-1)+1.414);}
 for(let y=h-1;y>=0;y--)for(let px=w-1;px>=0;px--){const i=y*w+px;if(dist[i])dist[i]=Math.min(dist[i],at(px+1,y)+1,at(px,y+1)+1,at(px+1,y+1)+1.414,at(px-1,y+1)+1.414);}
 const raw=new Float32Array(n);for(let i=0;i<n;i++)if(inside[i])raw[i]=Math.min(dist[i]*gain,cap*w)/w*.7/.36*255;
 // A 3x3 blur removes the ridges where opposite edges meet.
 const out=new Uint8Array(n);for(let y=0;y<h;y++)for(let px=0;px<w;px++){const i=y*w+px;if(!inside[i])continue;let sum=0,k=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=px+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h||!inside[yy*w+xx])continue;sum+=raw[yy*w+xx];k++;}out[i]=Math.min(255,sum/k);}
 return {w,h,data:out};}
