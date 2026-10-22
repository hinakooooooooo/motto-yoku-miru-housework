import assert from 'node:assert/strict';
import {contents} from './dist/content.js';
import {sceneFactories} from './dist/scenes.js';
import {person} from './dist/models.js';
import {createHotspots} from './dist/hotspots.js';
const hero=person(),hits=createHotspots(hero,contents);assert.equal(hits.proxies.length,8);
const report=[];
for(const c of contents){const d=sceneFactories[c.animationType]();let maxLength=0,maxTime=0;const snapshot=()=>{const a=[];d.group.traverse(o=>a.push([...o.position.toArray(),...o.scale.toArray(),...o.quaternion.toArray(),o.visible]));return JSON.stringify(a)};d.update(0);const initial=snapshot();for(let t=0;t<=7.5;t+=.05){d.update(t);d.group.traverse(o=>{for(const v of [...o.position.toArray(),...o.scale.toArray(),...o.quaternion.toArray()])assert(Number.isFinite(v),c.id+' invalid transform');});for(const r of d.hero.rigs){for(const o of [r.upper,r.lower])if(o.scale.y>maxLength){maxLength=o.scale.y;maxTime=t}}}d.update(0);assert.equal(snapshot(),initial,c.id+' reset deterministic');assert(d.hero.group.getObjectByName('pocket'));assert(d.hero.group.getObjectByName('hem'));assert(!d.hero.group.getObjectByName('tie'));report.push({id:c.id,maxSegmentLength: +(2*(maxLength-.09)).toFixed(2),time:+maxTime.toFixed(2)});}
console.log(JSON.stringify(report,null,2));
