import * as T from './vendor/three.module.js';
import {replaceAssets} from './assets.js';
import {contents,themes} from './content.js';
import {person,medalFrame,refineExhibitionFigure} from './models.js';
import {sceneFactories} from './scenes.js';
import {createHotspots,pickHotspot} from './hotspots.js';
import {createReticles} from './reticles.js';
import {applyTypography} from './typography.js';
applyTypography();
const canvas=document.querySelector('#canvas'),cursor=document.querySelector('#cursor'),hint=document.querySelector('#hint');
try{await start();}catch(e){console.error(e);document.querySelector('#loading').hidden=true;document.querySelector('#loading').style.display='none';document.querySelector('#error').hidden=false;}
async function start(){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0xffffff);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.05,100);scene.add(new T.HemisphereLight(0xffffff,0xada99b,2.7));const key=new T.DirectionalLight(0xfff4df,4);key.position.set(-3,8,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-7,right:7,top:8,bottom:-5,near:.1,far:25});key.shadow.bias=-.0005;key.shadow.normalBias=.025;key.shadow.radius=4;scene.add(key);const fill=new T.DirectionalLight(0xe5efff,1.5);fill.position.set(5,4,-3);scene.add(fill);
 const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;scene.add(floor);
 const theme=themes[new URLSearchParams(location.search).get('theme')]||themes.housework;const routes=contents.filter(x=>x.themeId===theme.id&&x.enabled);let route=routes[0];const worker=refineExhibitionFigure(person());worker.group.rotation.y=0;scene.add(worker.group);
 // Per-object material copies allow the whole figure to dissolve without affecting the miniature.
 worker.group.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.userData.initialOpacity=1;}});
 const world=new T.Group();world.position.set(0,.25,.15);scene.add(world);world.visible=false;
 const worlds=new Map();
 for(const [i,entry] of routes.entries()){const diorama=sceneFactories[entry.animationType]();const medal=medalFrame({ribbonColor:entry.ribbonColor});const assetMixers=await replaceAssets({theme:i===0?theme:{},route:entry,worker,diorama,medal});worlds.set(entry.id,{diorama,medal,assetMixers});}
 let {diorama,medal,assetMixers}=worlds.get(route.id);world.add(diorama.group,medal.group);medal.group.visible=false;
 worker.group.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.userData.baseColor=o.material.color.clone();}});
 const visited=new Set();const hotspots=createHotspots(worker,routes);let selected=null,keyboardIndex=0;
 const anchor=new T.Vector3(0,.25,.15),transitionAnchor=new T.Vector3();
 function selectRoute(id){route=routes.find(r=>r.id===id);({diorama,medal,assetMixers}=worlds.get(id));world.clear();world.add(diorama.group,medal.group);medal.group.visible=false;diorama.group.scale.setScalar(1);diorama.group.position.set(0,0,0);diorama.update(0);zoomPos.fromArray(route.cameraPosition);zoomTarget.fromArray(route.cameraTarget);transitionAnchor.copy(zoomTarget);world.position.copy(transitionAnchor);document.querySelector('#award-full').textContent=route.caption;document.querySelector('#award-title').textContent=route.shortTitle;}
 const ray=new T.Raycaster(),pointer=new T.Vector2(9,9),target=new T.Vector3(),homePos=new T.Vector3(),homeTarget=new T.Vector3(0,2.30,0);const worldPos=new T.Vector3(0,3.3,9),worldTarget=new T.Vector3(0,1.17,0);const medalPos=new T.Vector3(0,2,11),medalTarget=new T.Vector3(0,.1,0);const zoomPos=new T.Vector3(...route.cameraPosition),zoomTarget=new T.Vector3(...route.cameraTarget);let state='explore',elapsed=0,hover=false,clock=0,returnStart,returnTarget,returnScale=1,returnFigure=0,worldVisible=false;let figureOpacity=1;const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};const mix=(a,b,t)=>T.MathUtils.lerp(a,b,t);const v=new T.Vector3();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const setState=s=>{state=s;elapsed=0;document.body.dataset.state=s;};setState('explore');
 function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();const aspect=w/h;homePos.set(0,3.2,Math.max(10.5,6.3/aspect));worldPos.set(0,3.3,Math.max(8.8,6.1/aspect));medalPos.set(0,2.0,Math.max(10.8,7.0/aspect));if(state==='explore'||state==='discovered'){camera.position.copy(homePos);target.copy(homeTarget);}}
 resize();addEventListener('resize',resize);camera.position.copy(homePos);target.copy(homeTarget);
 function opacity(value){figureOpacity=value;floor.visible=value>.05;floor.material.opacity=.12*value;worker.group.visible=value>.001;worker.group.traverse(o=>{if(o.isMesh&&!o.userData.hotspot){o.material.opacity=value;o.castShadow=value>.5;}});}
 function highlight(id){selected=id;worker.group.traverse(o=>{if(o.isMesh&&o.userData.baseColor)o.material.color.copy(o.userData.baseColor);});if(id)hotspots.visuals.get(id)?.forEach(o=>o.material.color.setHex(0xD20001));cursor.classList.toggle('found',!!id);if(state==='explore'||state==='discovered')setState(id?'discovered':'explore');}
 const reticles=createReticles({worker,routes,camera,visited,highlight,enter,cursor});
 function hit(){ray.setFromCamera(pointer,camera);return pickHotspot(ray,hotspots.proxies);}
 function enter(id=selected||routes[keyboardIndex].id){if(!['explore','discovered'].includes(state))return;highlight(null);selectRoute(id);document.body.dataset.started='true';cursor.classList.add('pressed');setTimeout(()=>cursor.classList.remove('pressed'),160);setState('zoom');hint.textContent='';world.visible=false;world.scale.setScalar(.02);world.rotation.set(0,0,0);}
 function back(){if(['explore','discovered','return'].includes(state))return;returnStart=camera.position.clone();returnTarget=target.clone();returnScale=world.scale.x;returnFigure=figureOpacity;worldVisible=world.visible;setState('return');hint.textContent='';}
 canvas.addEventListener('pointermove',e=>{pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);if(e.pointerType==='mouse'){document.body.classList.add('mouse');cursor.style.display='block';cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';}if(['explore','discovered'].includes(state))highlight(hit());});
 canvas.addEventListener('pointerleave',()=>{cursor.style.display='none';if(['explore','discovered'].includes(state))highlight(null);});
 canvas.addEventListener('pointerdown',e=>{pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);if(['explore','discovered'].includes(state)){const id=hit();if(id)enter(id);}else if(state==='medal'){ray.setFromCamera(pointer,camera);if(!ray.intersectObject(world,true).length)back();}});
 addEventListener('keydown',e=>{if(e.key==='Escape')back();if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&document.activeElement===canvas&&['explore','discovered'].includes(state)){e.preventDefault();keyboardIndex=(keyboardIndex+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+routes.length)%routes.length;highlight(routes[keyboardIndex].id);canvas.setAttribute('aria-label',routes[keyboardIndex].title+'。Enterで探索、矢印キーで場所を変更。');}if((e.key==='Enter'||e.key===' ')&&document.activeElement===canvas){e.preventDefault();enter();}});
 document.addEventListener('visibilitychange',()=>{last=performance.now();});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.querySelector('#error').hidden=false;});
 let last=performance.now();
 function draw(now){const dt=Math.min((now-last)/1000,.04);last=now;clock+=dt;elapsed+=dt;
 if(state==='explore'||state==='discovered'){worker.torso.rotation.z=Math.sin(clock*.9)*.012;worker.head.rotation.y=Math.sin(clock*.5)*.025;}
 if(state==='zoom'){const p=smooth(elapsed/1.25);camera.position.lerpVectors(homePos,zoomPos,p);target.lerpVectors(homeTarget,zoomTarget,p);worker.torso.rotation.z*=.92;if(elapsed>=1.25)setState('reveal');}
 if(state==='reveal'){const p=smooth(elapsed/1.25);world.visible=true;world.scale.setScalar(mix(.02,1,p));world.position.lerpVectors(transitionAnchor,anchor,p);camera.position.lerpVectors(zoomPos,worldPos,p);target.lerpVectors(zoomTarget,worldTarget,p);opacity(1-smooth(elapsed/.8));if(elapsed>=1.25){opacity(0);setState('world');}}
 if(['reveal','world','freeze','forming','medal'].includes(state)){
 const time=state==='world'?Math.min(elapsed,route.duration):state==='reveal'?0:route.duration;
 if(!route.sceneAsset)diorama.update(time);assetMixers.forEach(m=>m.sample(time));
 if(state==='world'&&elapsed>=route.duration)setState('freeze');
 if(state==='freeze'&&elapsed>=route.freezeDuration){medal.group.visible=true;medal.pieces.forEach(piece=>piece.scale.setScalar(.001));setState('forming');}
 }
 if(state==='forming'){const p=smooth(elapsed/1.4);camera.position.lerpVectors(worldPos,medalPos,p);target.lerpVectors(worldTarget,medalTarget,p);diorama.group.scale.setScalar(mix(1,.78,p));diorama.group.position.y=mix(0,.17,p);medal.pieces.forEach((piece,i)=>{const q=T.MathUtils.clamp((elapsed-i*.065)/.68,0,1);const pop=q===1?1:1+2.70158*Math.pow(q-1,3)+1.70158*Math.pow(q-1,2);piece.scale.copy(piece.userData.rest).multiplyScalar(Math.max(.001,pop));});world.rotation.y=0;if(elapsed>=1.5){visited.add(route.id);setState('medal');hint.textContent='余白をクリックすると、もとの世界へ。';}}
 if(state==='medal'){world.position.y=.25+Math.sin(clock*1.1)*.025;world.rotation.y=0;}
 if(state==='return'){const p=smooth(elapsed/1.3);camera.position.lerpVectors(returnStart,homePos,p);target.lerpVectors(returnTarget,homeTarget,p);world.scale.setScalar(mix(returnScale,.005,p));world.visible=worldVisible&&p<.9;opacity(mix(returnFigure,1,p));world.position.y=.25;if(elapsed>=1.3){world.visible=false;world.rotation.set(0,0,0);opacity(1);setState('explore');hint.textContent='';pointer.set(9,9);}}
 camera.lookAt(target);renderer.render(scene,camera);reticles.update(state,selected);requestAnimationFrame(draw);
 }
 renderer.render(scene,camera);document.querySelector('#loading').remove();requestAnimationFrame(draw);
 function reset(){document.body.dataset.started='false';
 visited.clear();highlight(null);setState('explore');clock=0;keyboardIndex=0;pointer.set(9,9);
 world.visible=false;world.rotation.set(0,0,0);world.scale.setScalar(1);world.position.copy(anchor);
 for(const {diorama,medal,assetMixers} of worlds.values()){diorama.update(0);diorama.group.scale.setScalar(1);diorama.group.position.set(0,0,0);medal.group.visible=false;assetMixers.forEach(m=>m.sample(0));}
 worker.torso.rotation.set(0,0,0);worker.head.rotation.set(0,0,0);opacity(1);camera.position.copy(homePos);target.copy(homeTarget);camera.lookAt(target);
 cursor.classList.remove('found','pressed');cursor.style.display='none';hint.textContent='';last=performance.now();reticles.update(state,null);
 }
 document.querySelector('#reset').addEventListener('click',reset);
 document.querySelector('#back').addEventListener('click',back);
 addEventListener('pageshow',e=>{if(e.persisted)reset();});
 addEventListener('exhibition:start',reset);
 // Read-only diagnostics for exhibition QA, with no on-screen developer controls.
 window.exhibition={reset,get visited(){return [...visited]},get state(){return state},get enabledRoutes(){return contents.filter(c=>c.enabled).map(c=>c.id)},get theme(){return theme.id},get route(){return route.id}};
}
