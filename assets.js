import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
const loader=new GLTFLoader();
// Optional GLB replacement. Models retain their authored axes and sizes; see README.
export async function replaceAssets({theme,route,worker,diorama,medal}) {
 const mixers=[];
 async function load(path){const gltf=await loader.loadAsync(path);gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return gltf;}
 if(theme.characterAsset){const gltf=await load(theme.characterAsset);const shoes=gltf.scene.getObjectByName(route.targetObjectName);if(!shoes)throw new Error('Character GLB is missing target object: '+route.targetObjectName);worker.group.clear();worker.group.add(gltf.scene);worker.shoes=shoes;}
 if(route.sceneAsset){const gltf=await load(route.sceneAsset);diorama.group.clear();diorama.group.add(gltf.scene);if(gltf.animations.length){const mixer=new T.AnimationMixer(gltf.scene);const action=mixer.clipAction(gltf.animations[0]);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();mixer.sample=(time)=>{action.reset().play();mixer.setTime(time);};mixers.push(mixer);}}
 if(route.medalAsset){const gltf=await load(route.medalAsset);medal.group.clear();medal.group.add(gltf.scene);medal.pieces=[gltf.scene];gltf.scene.userData.rest=gltf.scene.scale.clone();}
 return mixers;
}
