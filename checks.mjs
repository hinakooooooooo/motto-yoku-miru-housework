import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from './dist/vendor/three.module.js';
import {contents} from './dist/content.js';
import {person,medalFrame,refineExhibitionFigure} from './dist/models.js';
import {sceneFactories} from './dist/scenes.js';
import {createHotspots,pickHotspot} from './dist/hotspots.js';
assert.equal(contents.length,8);assert.equal(contents.filter(c=>c.enabled).length,8);
const signatures=new Set();
for(const c of contents){for(const key of ['id','themeId','hotspotId','targetObjectName','title','sceneDescription','medalTitle','cameraPosition','cameraTarget','sceneAsset','medalAsset','animationType','shortTitle','duration'])assert.ok(key in c,`${c.id}: ${key}`);
 const d=sceneFactories[c.animationType]();assert.equal(typeof d.update,'function');const signature=()=>{const coords=[];d.group.traverse(o=>{coords.push(...o.position.toArray(),...o.quaternion.toArray(),o.visible);});return JSON.stringify(coords);};d.update(0);const initial=signature();d.update(c.duration);assert.notEqual(signature(),initial,`${c.id} has no motion`);const final=signature();d.update(c.duration);assert.equal(signature(),final,`${c.id} drifts while frozen`);signatures.add(d.kind);
 for(let t=0;t<=c.duration;t+=.1){d.update(t);d.group.updateMatrixWorld(true);d.group.traverse(o=>{for(const n of [...o.matrixWorld.elements])assert.ok(Number.isFinite(n),c.id);});}

}
assert.equal(signatures.size,8);
const worker=refineExhibitionFigure(person());worker.group.rotation.y=0;const hot=createHotspots(worker,contents);worker.group.updateMatrixWorld(true);const camera=new T.PerspectiveCamera(36,1920/1080,.05,100);camera.position.set(1.6,3.2,10.5);camera.lookAt(0,2.3,0);camera.updateMatrixWorld(true);const ray=new T.Raycaster();for(const c of contents){const proxy=hot.proxies.find(p=>p.userData.hotspot===c.id);const pos=proxy.getWorldPosition(new T.Vector3()).project(camera);assert.ok(Math.abs(pos.x)<1&&Math.abs(pos.y)<1);ray.setFromCamera(new T.Vector2(pos.x,pos.y),camera);assert.equal(pickHotspot(ray,hot.proxies),c.id,'Overlapping hotspot: '+c.id);}
for(const file of ['app.js','models.js','assets.js','content.js','scenes.js','hotspots.js'])for(const m of fs.readFileSync('dist/'+file,'utf8').matchAll(/from ['"](.+?)['"]/g))assert.ok(fs.existsSync('dist/'+m[1]),m[1]);
console.log('PASS: eight distinct animated worlds; finite transforms; deterministic freeze; eight individually raycastable hotspots; local imports.');
