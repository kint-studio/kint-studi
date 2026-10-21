import {SceneEngine,FORMATION_DONE_MS} from './scene-engine.js?v=s3-1';
import {penImage} from './scene-images.js?v=s3-1';
export {FORMATION_DONE_MS};
// Where the drawing sits inside the image (fractions 0-1), measured once: the page knows how big the pen will be before the image arrives.
export const BOUNDS={top:.208,bottom:.792,left:.229,right:.792};
// Relief used to turn the pen: close to its real thickness (the relief grows twice the distance from the edge, up to .05 image widths), as in the landing's KfScene. A dome bent the thin pen and tore the nib when it turned.
export const DEPTH_STYLE={kind:'lineare',gain:2,cap:.05};
// The pen stands large in the middle of the screen, like the vase in the main site's hero (68% of the height); the text sits bottom right, and on phones below the object.
export function layout(w,h){const b=BOUNDS,wf=Math.max(.2,b.right-b.left),hf=Math.max(.45,b.bottom-b.top),cx=(b.left+b.right)/2;
 // the pen is long and thin: on large screens it is drawn a little bigger
 if(w>=760){const k=1.08,ih=Math.min(h*.68*k/hf,w*.36*k/(wf*(2/3))),iw=ih*2/3;return {x:w*.5-iw*cx,y:h*.9-ih*b.bottom,w:iw,h:ih};}
 // phone: between the header and the text block at the bottom
 const ih=Math.min(Math.min(h*.44,370)/hf,w*.95/(wf*(2/3))),iw=ih*2/3;return {x:w*.5-iw*cx,y:h-266-ih*b.bottom,w:iw,h:ih};}
// Maximum drawing resolution per CSS pixel: 2, on computers too, because a long thin object shows the grain of its edges at once.
export const MAX_DPR=2;
// The smallest image that is enough for the size the pen is drawn at (the photo covers the object rect, with the screen resolution capped as in the engine): 2048 px, 1024 or 640. Touch devices never download the 2048 px one.
export function imageUrl(kind,rectWidth,{touch=globalThis.matchMedia?.('(hover: none)').matches??false,dpr=globalThis.devicePixelRatio??1}={}){const need=rectWidth*Math.min(dpr,MAX_DPR),size=need<=560?'-640':need<=1024||touch?'-1024':'';return penImage(kind,size);}
// The main site's scene, configured for the pen: its layout, maximum resolution and relief, and no floor under an object that fades out at the bottom.
export class PenScene extends SceneEngine {
 constructor(options){super({layout,maxDpr:MAX_DPR,grounded:false,depthStyle:DEPTH_STYLE,...options});}
}
