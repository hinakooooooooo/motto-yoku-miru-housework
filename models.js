import * as T from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
export const colors={ink:0x353737,cream:0xeee9dc,red:0xbe483c,gold:0xd8ac54,blue:0x8eafb5};
const mats=new Map();
export function material(color){if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.68,metalness:color===colors.gold?.42:0}));return mats.get(color);}
export function mesh(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
export function ball(g,color,x,y,z,sx,sy=sx,sz=sx){const m=mesh(g,new T.SphereGeometry(1,28,20),color,x,y,z);m.scale.set(sx,sy,sz);return m;}
export function box(g,color,x,y,z,sx,sy,sz,r=.06){const sh=new T.Shape(),w=sx/2,h=sy/2; r=Math.min(r,w,h);sh.moveTo(-w+r,-h);sh.lineTo(w-r,-h);sh.quadraticCurveTo(w,-h,w,-h+r);sh.lineTo(w,h-r);sh.quadraticCurveTo(w,h,w-r,h);sh.lineTo(-w+r,h);sh.quadraticCurveTo(-w,h,-w,h-r);sh.lineTo(-w,-h+r);sh.quadraticCurveTo(-w,-h,-w+r,-h);const geo=new T.ExtrudeGeometry(sh,{depth:sz,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r*.45,bevelThickness:r*.45,curveSegments:6});geo.translate(0,0,-sz/2);return mesh(g,geo,color,x,y,z);}
export function bar(g,color,a,b,r=.055){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);const m=mesh(g,new T.CylinderGeometry(r,r,v.length(),12),color);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
// The original head silhouette and generous limb volumes are shared by every scene.
export function person({bag=true}={}){
 const g=new T.Group(),torso=new T.Group(),head=new T.Group(),shoes=new T.Group();
 g.add(torso,shoes);torso.position.y=1.46;shoes.name='shoes';
 const shoeMat=material(0x9a9d8b),arms=[],hands=[],legs=[],rigs=[];
 for(const x of [-.29,.29]){ball(shoes,0x9a9d8b,x,.16,.15,.255,.16,.40);legs.push(box(g,0x65736e,x,.85,0,.39,1.27,.44,.12));}
 const bodyPoints=[[0,.01],[.35,.01],[.48,.08],[.54,.25],[.55,.65],[.53,1.00],[.47,1.20],[.36,1.37],[.20,1.49],[0,1.49]].map(([x,y])=>new T.Vector2(x,y));
 const bodyGeo=new T.LatheGeometry(bodyPoints,48);bodyGeo.scale(1,1,.68);mesh(torso,bodyGeo,0xeee9dc);
 const apron=new T.Group();apron.name='apron';torso.add(apron);
 // Densely sampled cloth follows the body curvature instead of bending a few large triangles.
 const radius=y=>y<.25?.54:y<1?.55-.02*(y-.25)/.75:.53-.30*Math.max(0,y-1);
 const front=(x,y)=>{const r=radius(Math.max(.25,y));return Math.max(y<.15?.32:0,.68*r*Math.sqrt(Math.max(.04,1-(x/r)**2))+.035);};
 const width=y=>y<.35?.49-.035*(y+.55)/.9:y<.72?.455-(y-.35)/.37*.165:.29;
 const clothGrid=(y0,y1,nx,ny,w,zoff=0)=>{const vertices=[],uv=[],idx=[];for(let j=0;j<=ny;j++){const y=y0+(y1-y0)*j/ny;for(let i=0;i<=nx;i++){const x=(i/nx*2-1)*w(y);vertices.push(x,y,front(x,y)+zoff);uv.push(i/nx,j/ny);}}for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*(nx+1)+i;idx.push(k,k+1,k+nx+2,k,k+nx+2,k+nx+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return geo;};
 const panels=[clothGrid(-.55,1.20,32,48,width)];
 const tape=(points,w)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const v=[],uv=[],idx=[];for(let j=0;j<=32;j++){const c=curve.getPoint(j/32);for(const side of [-1,1]){v.push(c.x+side*w/2,c.y,c.z);uv.push((side+1)/2,j/32);}}for(let j=0;j<32;j++){const k=2*j;idx.push(k,k+1,k+3,k,k+3,k+2);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();panels.push(geo);};
 for(const side of [-1,1])tape([[side*.235,1.18,front(.235,1.18)],[side*.22,1.37,.23],[side*.19,1.58,.16],[side*.19,1.65,-.02],[side*.22,1.48,-.22]],.065);
 const cloth=mesh(apron,mergeGeometries(panels),0xad5f57);cloth.material=material(0xad5f57).clone();cloth.material.side=T.DoubleSide;cloth.name='apron-cloth';
 const hem=new T.Group();hem.name='hem';hem.position.set(0,-.02,front(0,-.02));apron.add(hem);
 const pocket=new T.Group();pocket.name='pocket';pocket.position.set(0,.20,front(0,.20)+.018);apron.add(pocket);
 // Pocket follows the same cloth surface, with only a slight raised opening.
 const pocketGeo=clothGrid(.04,.36,16,12,()=>.22,.018);mesh(apron,pocketGeo,0xb5655c).name='pocket-fabric';
 const seam=new T.CatmullRomCurve3([[-.22,.35],[-.22,.08],[0,.04],[.22,.08],[.22,.35]].map(([x,y])=>new T.Vector3(x,y,front(x,y)+.023)));mesh(apron,new T.TubeGeometry(seam,32,.008,6,false),0xd1907f);
 for(const x of [-.70,.70]){
 const pivot=new T.Group();pivot.position.set(x*.75,1.18,0);torso.add(pivot);
 const sleeve=mesh(pivot,sleeveGeometry(new T.Vector3(x*.25,-.96,.22)),0xeee9dc);sleeve.name='sleeve';
 const upper=new T.Object3D(),lower=new T.Object3D();pivot.add(upper,lower);
 const hand=ball(pivot,colors.cream,x*.25,-.96,.22,.15,.17,.145);hand.name='hand';
 arms.push(pivot);hands.push(hand);rigs.push({upper,lower,sleeve});
 }
 ball(torso,colors.cream,0,1.60,0,.23,.3,.24);
 head.name='head';head.position.set(0,2.23,0);torso.add(head);
 ball(head,colors.cream,0,0,0,.64,.68,.59);ball(head,colors.ink,0,.43,-.07,.64,.30,.54);ball(head,colors.ink,-.45,.26,.14,.16,.23,.35);
 for(const x of [-.22,.22]){const eye=ball(head,0x252827,x,-.015,.559,.046,.054,.026);eye.name='eyes';}
 const mouth=bar(head,0x887a6b,[-.075,-.25,.554],[.075,-.25,.554],.018);mouth.name='mouth';
 for(const x of [-.64,.64])ball(head,colors.cream,x,-.06,0,.105,.17,.13);
 if(bag){const bg=tote();bg.name='bag';bg.position.set(.78,.98,.06);g.add(bg);}
 return{group:g,torso,head,shoes,shoeMat,arms,hands,legs,rigs};
}
export function tote(){const bg=new T.Group();box(bg,0xb9b49a,0,0,0,.68,.70,.31,.13);box(bg,0x8d927e,0,.34,0,.53,.025,.22,.04);for(const z of [-.10,.10]){const c=new T.QuadraticBezierCurve3(new T.Vector3(-.22,.29,z),new T.Vector3(0,.95,z),new T.Vector3(.22,.29,z));mesh(bg,new T.TubeGeometry(c,20,.035,8,false),0xcac5ad);}for(const x of [-.23,.23])bar(bg,0xd2cdb7,[x,-.25,.17],[x,.23,.17],.011);return bg;}
export function refineExhibitionFigure(p){return p;}
// A single tapered sleeve follows a soft curve without visible elbow bulges.
function sleeveGeometry(target){const mid=target.clone().multiplyScalar(.5);mid.z+=.10;const curve=new T.QuadraticBezierCurve3(new T.Vector3(0,.16,0),mid,target.clone().multiplyScalar(.94));const geo=new T.TubeGeometry(curve,22,1,12,false);const a=geo.attributes.position;for(let i=0;i<=22;i++){const center=curve.getPointAt(i/22),r=(.185-.04*(i/22))*Math.min(1,Math.sin(Math.min(1,(i/22)/.16)*Math.PI/2));for(let j=0;j<=12;j++){const k=i*13+j;const v=new T.Vector3().fromBufferAttribute(a,k).sub(center).multiplyScalar(r).add(center);a.setXYZ(k,v.x,v.y,v.z);}}geo.computeVertexNormals();return geo;}
export function resetArms(p){for(let i=0;i<2;i++){p.rigs[i].sleeve.geometry.dispose();p.rigs[i].sleeve.geometry=sleeveGeometry(new T.Vector3(i?.175:-.175,-.96,.22));}}
export function poseHand(p,i,scene,point){if(p.actionTargets)p.actionTargets.set(i,point.slice());scene.updateMatrixWorld(true);const target=p.arms[i].worldToLocal(scene.localToWorld(new T.Vector3(...point)));const r=p.rigs[i];r.sleeve.geometry.dispose();r.sleeve.geometry=sleeveGeometry(target);p.hands[i].position.copy(target);r.upper.scale.y=r.lower.scale.y=target.length()/4+.09;}
function star(g,x,y,z,size){const shape=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?size*.45:size;const px=Math.cos(a)*r,py=Math.sin(a)*r;i?shape.lineTo(px,py):shape.moveTo(px,py);}shape.closePath();return mesh(g,new T.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:true,bevelSegments:2,bevelSize:.025,bevelThickness:.025}),colors.gold,x,y,z);}
export function medalFrame({ribbonColor=colors.red,backColor=0xf4e7c7}={}){const g=new T.Group(),pieces=[];const back=mesh(g,new T.CylinderGeometry(2.08,2.08,.17,80),backColor,0,1,-.93);back.rotation.x=Math.PI/2;pieces.push(back);const ring=mesh(g,new T.TorusGeometry(2.08,.115,14,96),colors.gold,0,1,-.76);pieces.push(ring);const inner=mesh(g,new T.TorusGeometry(1.91,.025,8,96),colors.gold,0,1,-.75);pieces.push(inner);
 for(const sign of [-1,1]){const ribbon=box(g,ribbonColor,sign*.65,-1.05,-.93,.57,1.05,.1,.02);ribbon.rotation.z=sign*-.3;pieces.push(ribbon);const stripe=box(ribbon,0xe0b977,0,0,.068,.065,.75,.01,.009);stripe.name='ribbon-inlay';}
 for(const [x,y,s] of [[0,3.08,.22],[-1.5,2.55,.16],[1.5,2.55,.16],[-2.02,1.3,.12],[2.02,1.3,.12]])pieces.push(star(g,x,y,-.5,s));
 pieces.forEach((p,i)=>{p.userData.rest=p.scale.clone();p.userData.order=i;});return{group:g,pieces};}
