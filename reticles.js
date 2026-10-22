import * as T from './vendor/three.module.js';
// Anchors are children of the real moving parts, not fixed screen coordinates.
export function createReticles({worker,routes,camera,visited,highlight,enter,cursor}){
 const layer=document.querySelector('#reticles'),ray=new T.Raycaster(),point=new T.Vector3(),screen=new T.Vector3();
 const meshes=[];worker.group.traverse(o=>{if(o.isMesh&&!o.userData.hotspot)meshes.push(o);});
 const specs={head:[worker.head,[0,.5,.48]],eyes:[worker.head,[.15,-.015,.61]],hand:[worker.hands[0],[0,0,1]],pocket:[worker.group.getObjectByName('pocket'),[0,0,.06]],bag:[worker.group.getObjectByName('bag'),[0,0,.19]],sleeve:[worker.arms[0],[-.1,-.3,.25]],shoes:[worker.shoes.children[0],[0,.75,.45]],hem:[worker.group.getObjectByName('hem'),[-.24,-.34,.08]]};
 const names=Object.fromEntries(routes.map(r=>[r.id,r.title]));
 const marks=routes.map(r=>{const [parent,offset]=specs[r.id],anchor=new T.Object3D();anchor.position.fromArray(offset);parent.add(anchor);const b=document.createElement('button');b.type='button';b.className='reticle';b.setAttribute('aria-label',names[r.id]+'をもっとよくみる');b.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><path class="petals" d="M20 7C25-2 34 4 31 12C41 11 43 22 34 25C40 33 31 41 24 34C20 44 9 40 10 31C0 34-4 23 6 19C-1 11 7 3 14 9C14 3 19 2 20 7Z"/><g class="peek"><circle cx="14" cy="21" r="1.6"/><circle cx="20" cy="21" r="1.6"/><circle cx="26" cy="21" r="1.6"/></g><path class="check" d="m13 21 5 5 10-12"/></svg>';layer.append(b);
 const move=e=>{highlight(r.id);if(e.pointerType==='mouse'){document.body.classList.add('mouse');cursor.style.display='block';cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';}};
 b.addEventListener('pointermove',move);b.addEventListener('pointerenter',move);b.addEventListener('pointerleave',()=>highlight(null));b.addEventListener('focus',()=>highlight(r.id));b.addEventListener('blur',()=>highlight(null));b.addEventListener('click',()=>enter(r.id));return{id:r.id,b,anchor};});
 return {update(state,selected){const exploring=['explore','discovered'].includes(state);layer.hidden=!exploring;if(!exploring)return;worker.group.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 for(const {id,b,anchor} of marks){anchor.getWorldPosition(point);screen.copy(point).project(camera);let visible=Math.abs(screen.x)<.98&&Math.abs(screen.y)<.97&&screen.z>-1&&screen.z<1;
 if(visible){const distance=camera.position.distanceTo(point);ray.set(camera.position,point.clone().sub(camera.position).normalize());const first=ray.intersectObjects(meshes,false)[0];visible=!first||first.distance>=distance-.14;}
 b.hidden=!visible;b.style.left=(screen.x+1)*innerWidth/2+'px';b.style.top=(1-screen.y)*innerHeight/2+'px';b.classList.toggle('visited',visited.has(id));b.classList.toggle('active',selected===id);b.setAttribute('aria-label',names[id]+'をもっとよくみる'+(visited.has(id)?'（発見済み）':''));
 }} };
}
