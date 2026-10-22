import * as T from './vendor/three.module.js';
import {person,box,ball,bar,mesh,colors,poseHand,tote,resetArms} from './models.js';
const V=(x,y,z)=>new T.Vector3(x,y,z),clamp=T.MathUtils.clamp,lerp=T.MathUtils.lerp;
const ease=(t,a,b)=>{const q=clamp((t-a)/(b-a),0,1);return q*q*(3-2*q)};
const arc=(o,a,b,q,h=.16)=>{o.position.copy(a).lerp(b,q);o.position.y+=Math.sin(q*Math.PI)*h};
function base(tone=0xd7dfd6){const g=new T.Group();box(g,tone,0,-.10,0,3.45,.2,1.95,.001);return g;}
function hero(g,x=-.68,z=.30){const p=person({bag:false});p.group.scale.setScalar(.43);p.group.position.set(x,0,z);p.group.rotation.set(0,.32,0);g.add(p.group);return p;}
function freezeable(g,p,animate,extra={}){const rest=[];g.traverse(o=>{if(o!==g)rest.push({o,p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone(),v:o.visible})});return{group:g,hero:p,...extra,update(t){for(const r of rest){r.o.position.copy(r.p);r.o.quaternion.copy(r.q);r.o.scale.copy(r.s);r.o.visible=r.v}resetArms(p);p.actionTargets=new Map();animate(t);
 // Turn the whole person toward the task BEFORE solving the hands again.
 if(p.actionTargets.size){const targets=[...p.actionTargets.entries()];let x=0,z=0;for(const [,pt] of targets){const dx=pt[0]-p.group.position.x,dz=pt[2]-p.group.position.z,len=Math.max(.01,Math.hypot(dx,dz));x+=dx/len;z+=dz/len;}if(Math.hypot(x,z)>.08){p.group.rotation.set(0,Math.atan2(x,z),0);p.head.rotation.y=0;}for(const [i,pt] of targets)poseHand(p,i,g,pt);}
 g.updateMatrixWorld(true)}};}
function grip(p,i,g,o,offset=[0,0,0]){g.updateMatrixWorld(true);const target=g.worldToLocal(o.localToWorld(new T.Vector3(...offset)));poseHand(p,i,g,target.toArray());}
function reach(p,i,g,point,q=1){g.updateMatrixWorld(true);const start=g.worldToLocal(p.hands[i].getWorldPosition(new T.Vector3()));poseHand(p,i,g,start.lerp(new T.Vector3(...point),q).toArray())}
function counter(g,x=.48){box(g,0xf2ecdc,x,.91,.16,1.50,.08,.62,.055);for(const dx of [-.61,.61])for(const z of [-.08,.40])bar(g,0xb6aa8e,[x+dx,.04,z],[x+dx,.87,z],.04);}
function sink(g,x=.45){counter(g,x);box(g,0x8b9e99,x,.962,-.03,.58,.02,.46,.1);box(g,0xb5c8c5,x,.973,-.03,.47,.012,.34,.09);bar(g,0x82958f,[x,.95,-.40],[x,1.34,-.40],.025);bar(g,0x82958f,[x,1.34,-.40],[x,1.34,-.06],.025);const stream=bar(g,0xb0d0d1,[x,1.29,-.06],[x,.99,-.06],.012);return stream;}
function fridge(g,x=1.1){const f=new T.Group();f.position.x=x;g.add(f);
 const solids=[];const part=(...args)=>{const o=box(f,...args);solids.push(o);return o;};
 part(0xd3ded7,0,.98,-.76,.80,1.96,.07,.025);for(const xx of [-.38,.38])part(0xd3ded7,xx,.98,-.46,.06,1.96,.60,.025);for(const y of [.04,1.92])part(0xd3ded7,0,y,-.46,.80,.08,.60,.025);
 for(const y of [.43,.94,1.45])part(0xedeee2,0,y,-.43,.68,.035,.56,.008);
 const door=new T.Group();door.position.set(.42,0,-.13);f.add(door);const panel=box(door,0xe9ece1,-.40,.98,0,.80,1.96,.07,.025);bar(door,0x81938a,[-.65,.99,.055],[-.65,1.49,.055],.025);
 return{group:f,door,solids,panel};}
function food(g,kind,x,y,z,s=.13){const f=new T.Group();f.position.set(x,y,z);g.add(f);if(kind==='veg'){ball(f,0x86a26c,0,0,0,s,s*.85,s);for(const dx of [-.5,0,.5])bar(f,0x587b52,[0,s*.6,0],[s*dx,s*1.4,0],s*.13)}else if(kind==='fish'){ball(f,0x85aeb5,0,0,0,s*1.3,s*.54,s*.4);const tail=box(f,0x739aa4,-s*1.4,0,0,s*.7,s*.8,s*.25,.01);tail.rotation.z=Math.PI/4;ball(f,0x3d5455,s*.7,s*.1,s*.37,s*.07)}else{ball(f,0xc78c78,0,0,0,s*1.1,s*.75,s*.55);ball(f,0xf0d5bc,s*.2,0,s*.5,s*.5,s*.28,s*.1)}return f;}
function note(g,x,y,z,w=.49,h=.55){const n=new T.Group();n.position.set(x,y,z);g.add(n);box(n,0xfff7de,0,0,0,w,h,.025,.025);for(let i=0;i<3;i++)bar(n,0xbac2ad,[-w*.32,h*.2-i*h*.2,.022],[w*.28,h*.2-i*h*.2,.022],.008);return n;}
function pencil(g){const pen=new T.Group();g.add(pen);bar(pen,0xd5aa61,[0,0,0],[.13,.12,0],.014);ball(pen,0x525d55,0,0,0,.015);return pen;}
function bottle(g,x,y,z){const b=new T.Group();b.position.set(x,y,z);g.add(b);box(b,0x88aca3,0,.13,0,.2,.27,.16,.05);box(b,0xf1e9ce,0,.14,.086,.13,.11,.015,.02);box(b,0x678e86,0,.29,0,.12,.07,.12,.02);return b;}
function crouch(p,q){p.torso.position.y=1.46-.90*q;for(let i=0;i<2;i++){const x=i?.29:-.29;const hip=V(x,1.46-.90*q,0),knee=V(x,.80-.28*q,.42*q),ankle=V(x,.25,0);p.legs[i].visible=false;const parts=p.knees[i];for(const [j,a,b] of [[0,hip,knee],[1,knee,ankle]]){const d=b.clone().sub(a),m=parts[j];m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());m.scale.set(.205,a.distanceTo(b)/2+.07,.225)}}}
function bendingRig(p){p.knees=[[],[]];for(let i=0;i<2;i++)for(let j=0;j<2;j++){const m=ball(p.group,0x65736e,0,0,0,.2,.3,.22);p.knees[i].push(m)}}
// 1. Compare what is in the fridge with seven days, swap an overlapping meal, write.
export function meal(){const g=base(),p=hero(g,-.32,.35),f=fridge(g,1.14);f.door.rotation.y=1.5;food(f.group,'veg',-.14,.56,-.35);food(f.group,'fish',.13,1.05,-.35);food(f.group,'meat',-.1,1.56,-.35);
 const board=new T.Group();board.position.set(-1.10,1.28,-.35);g.add(board);box(board,0xc1b08d,0,0,0,.93,1.05,.07,.05);box(board,0xfff8e3,0,0,.052,.85,.96,.02,.025);
 const tokens=[];for(let i=0;i<7;i++){const x=(i%3-1)*.27,y=.31-Math.floor(i/3)*.29;box(board,0xe6e7d6,x,y,.074,.24,.25,.01,.02);tokens.push(food(board,['veg','fish','meat','veg','fish','meat','veg'][i],x,y,.12,.075))}
 const pen=pencil(g),mark=bar(board,0x678d79,[-.06,-.36,.10],[.10,-.36,.10],.015);mark.visible=false;
 return freezeable(g,p,t=>{p.group.position.set(lerp(-.32,-.95,ease(t,2.8,4.1)),0,.30);p.head.rotation.y=lerp(.65,-.5,ease(t,1.1,2.2));p.head.rotation.x=.06;const swap=ease(t,2.2,3.7);tokens[3].position.x=lerp(-.27,0,swap);tokens[4].position.x=lerp(0,-.27,swap);tokens[3].position.z=.12+Math.sin(swap*Math.PI)*.13;const q=ease(t,4.1,4.7);pen.position.set(-1.15+.13*ease(t,4.8,6.3),.92,-.18);pen.visible=t>=4.1;reach(p,0,g,[-1.08,1.01,-.16],q);if(t>4.7&&t<6.5)grip(p,0,g,pen,[.08,.075,0]);mark.visible=t>5.1;mark.scale.x=ease(t,5.1,6.3);p.head.rotation.x=.12*ease(t,4.1,5);},{kind:'meal-plan',tokens});}
// 2. The same pitcher travels out of the fridge, through washing/filling, and back.
export function tea(){const g=base(0xd4deda),p=hero(g,.27,.49),f=fridge(g,.91);
 const counterTop=box(g,0xeadfc9,-.89,.87,-.38,.78,.09,.58,.035);for(const x of [-1.20,-.57])bar(g,0xb5aa91,[x,.03,-.45],[x,.82,-.45],.035);
 const basin=box(g,0xa2b8b1,-.91,.925,-.32,.47,.025,.38,.065);bar(g,0x879d97,[-.91,.92,-.61],[-.91,1.48,-.61],.022);bar(g,0x879d97,[-.91,1.48,-.61],[-.91,1.48,-.30],.022);const water=bar(g,0xb6d8d8,[-.91,1.45,-.30],[-.91,.96,-.30],.009);
 const jug=new T.Group();g.add(jug);const glass=mesh(jug,new T.CylinderGeometry(.11,.10,.34,24,1,true),0xc5d9cf,0,.18,0);glass.material=glass.material.clone();glass.material.transparent=true;glass.material.opacity=.42;glass.material.side=T.DoubleSide;
 const liquid=mesh(jug,new T.CylinderGeometry(.09,.085,.27,24),0xb68645,0,.15,0);mesh(jug,new T.TorusGeometry(.085,.021,8,20),0xa8bdb1,-.13,.21,0);
 const lid=box(g,0x7e998c,-1.13,.95,-.36,.23,.035,.22,.03),bag=box(g,0xa67a47,-.65,.95,-.30,.10,.025,.10,.01);
 const A=V(.91,.965,-.32),clear=V(.91,.99,.22),work=V(-.91,.95,-.30),walkEnd=V(-.91,1.00,.22);
 return freezeable(g,p,t=>{p.group.rotation.set(0,Math.PI,0);f.door.rotation.y=1.6*ease(t,0,.7)*(1-ease(t,6.9,7.5));water.visible=t>=3.3&&t<4.8;
 let held=false;
 if(t<1.5){arc(jug,A,clear,ease(t,.8,1.5),.02);held=t>=.8;p.group.position.set(lerp(.05,.46,ease(t,.7,1.1)),0,.75);}
 else if(t<2.5){arc(jug,clear,walkEnd,ease(t,1.5,2.5),.02);held=true;p.group.position.set(lerp(.46,-.51,ease(t,1.5,2.5)),0,.75);}
 else if(t<3.1){arc(jug,walkEnd,work,ease(t,2.5,3.1),.04);held=true;p.group.position.set(-.51,0,.75);}
 else if(t<5.1){jug.position.copy(work);p.group.position.set(-.51,0,.75);reach(p,1,g,[-.91,1.12,-.19],ease(t,3.1,3.4));arc(bag,V(-.65,.95,-.30),V(-.91,1.19,-.30),ease(t,4.1,4.7),.16);bag.visible=t<4.7;if(t>4.1&&t<4.7)grip(p,0,g,bag,[0,.04,0]);}
 else if(t<5.7){arc(jug,work,walkEnd,ease(t,5.1,5.7),.04);held=true;p.group.position.set(-.51,0,.75);}
 else if(t<6.6){arc(jug,walkEnd,clear,ease(t,5.7,6.6),.02);held=true;p.group.position.set(lerp(-.51,.46,ease(t,5.7,6.6)),0,.75);}
 else{arc(jug,clear,A,ease(t,6.6,6.95),.02);held=t<6.95;p.group.position.set(lerp(.46,.05,ease(t,6.95,7.4)),0,.75);}
 if(held)grip(p,0,g,jug,[-.20,.21,0]);else if(t<.8)reach(p,0,g,[.71,1.175,-.32],ease(t,.25,.8));
 liquid.scale.y=t<3.3?.10:lerp(.01,1,ease(t,4.2,4.9));liquid.position.y=.02+.135*liquid.scale.y;p.head.rotation.x=.12;
 },{kind:'tea',jug,fridge:f,counterTop,clearance:[...f.solids,f.panel,counterTop]});}
// 3. A continuous rinse-and-rack path for each tool; cloth stays on the counter.
export function tidy(){const g=base(),p=hero(g,.10,.81),water=sink(g,.37);const rack=box(g,0x9cad9c,1.01,.98,.09,.40,.06,.61,.03);for(let i=0;i<5;i++)bar(rack,0xe7e7d8,[-.16,.05,-.23+i*.11],[.16,.05,-.23+i*.11],.012);
 const board=box(g,0xbca07b,-.08,.99,.2,.35,.035,.37,.03),knife=new T.Group();knife.position.set(.05,1.04,.27);g.add(knife);box(knife,0x9daaa3,0,0,0,.24,.025,.07,.015);box(knife,0x6e7b71,-.18,0,0,.13,.04,.07,.015);const bowl=mesh(g,new T.SphereGeometry(.14,24,12,0,Math.PI*2,0,Math.PI/2),0xd6b589,.61,1.11,.21);bowl.rotation.x=Math.PI;const cloth=box(g,0xb4c9ba,-.22,.999,.18,.18,.025,.17,.03);const objects=[board,knife,bowl],starts=objects.map(o=>o.position.clone());
 return freezeable(g,p,t=>{p.group.rotation.set(0,Math.PI,0);water.visible=t>.7&&t<4.7;objects.forEach((o,i)=>{const start=.4+i*1.5,end=start+1.35;const q=ease(t,start,end);const mid=V(.37,1.13,-.03),finish=[V(.78,1.22,-.09),V(1.06,1.06,.25),V(1.10,1.20,-.12)][i];if(q<.5)arc(o,starts[i],mid,q*2,.1);else arc(o,mid,finish,(q-.5)*2,.1);if(i===0)o.rotation.x=Math.PI/2*ease(t,start+.65,end);if(t>=start&&t<end){p.group.position.x=o.position.x-.22;grip(p,0,g,o,[-.05,.055,.02]);}});if(t>=4.75)p.group.position.x=lerp(.88,.05,ease(t,4.75,5.4));const wipe=ease(t,5,5.6);cloth.position.x=-.22+.45*ease(t,5.6,7);cloth.position.z=.18+Math.sin(ease(t,5.6,7)*Math.PI*4)*.10;if(t>=5){p.group.position.x=cloth.position.x+.15;p.group.position.z=.81;reach(p,1,g,[cloth.position.x,1.04,cloth.position.z],wipe);}p.head.rotation.x=.17;
 },{kind:'clean-up',objects,cloth});}
// 4. Check the low bottle, take the pocket memo, add a line, put it away.
export function supplies(){const g=base(),p=hero(g,.10,.81);counter(g,.64);const b=bottle(g,.57,.97,.13);const level=box(b,0x527f73,0,.045,.09,.12,.025,.01,.005);const n=note(g,0,0,0,.30,.35),pen=pencil(g),line=bar(n,0x687e65,[-.1,-.12,.025],[.09,-.12,.025],.01);const pocket=p.group.getObjectByName('pocket');
 return freezeable(g,p,t=>{p.group.rotation.set(0,Math.PI,0);const lift=ease(t,.4,1.5)*(1-ease(t,2.1,2.9));b.position.y=.97+lift*.24;b.rotation.z=-.17*lift;if(t<2.9){reach(p,0,g,[b.position.x+.09,b.position.y+.15,b.position.z],ease(t,0,.4));}p.head.rotation.x=.16;p.head.rotation.y=.3*(1-ease(t,2.2,3.1));g.updateMatrixWorld(true);const origin=g.worldToLocal(pocket.getWorldPosition(new T.Vector3())).add(V(0,0,-.09));const dest=V(.1,1.14,.32);const out=ease(t,2.7,3.5),back=ease(t,6.1,7.0);n.position.copy(origin).lerp(dest,out*(1-back));n.visible=t>=2.7&&t<7.0;line.visible=t>4.4;line.scale.x=ease(t,4.4,5.8);if(n.visible)grip(p,1,g,n,[-.13,0,.01]);pen.visible=t>3.6&&t<6.1;pen.position.copy(n.position).add(V(-.1+.18*ease(t,4.4,5.8),-.12,.045));if(pen.visible)grip(p,0,g,pen,[.08,.075,0]);
 },{kind:'shopping-note',b,n});}
// 5. An ingredient in hand is compared with a small image of the home fridge.
export function shopping(){const g=base(0xddd9c7),p=hero(g,-.40,.64);counter(g,.64);for(let i=0;i<3;i++){box(g,0xbca67e,.2+i*.44,.99,-.11,.39,.08,.44,.02);food(g,['veg','meat','veg'][i],.2+i*.44,1.12,-.1,.11)}const chosen=food(g,'veg',.17,1.13,.06,.12),bag=tote();bag.scale.setScalar(.65);bag.position.set(-1.02,.44,.55);g.add(bag);const thought=new T.Group();thought.position.set(-.69,2.22,-.55);g.add(thought);box(thought,0xfff7df,0,0,0,.91,.53,.06,.14);food(thought,'fish',-.21,.01,.08,.12);food(thought,'veg',.22,.01,.08,.10);for(const [x,y,r] of [[-.23,-.36,.05],[-.34,-.48,.03]])ball(thought,0xfff7df,x,y,0,r);
 return freezeable(g,p,t=>{p.group.rotation.set(0,Math.PI,0);const lift=ease(t,.8,1.8),pack=ease(t,4.3,6.4);arc(chosen,V(.17,1.13,.06),V(-.05,1.22,.10),lift,.12);if(t>=4.3){if(pack<.7)arc(chosen,V(-.05,1.22,.10),V(-1.02,1.02,.12),pack/.7,.12);else arc(chosen,V(-1.02,1.02,.12),V(-1.02,.73,.55),(pack-.7)/.3,.04);}chosen.visible=pack<.98;if(t<.8)reach(p,0,g,[.17,1.15,.06],ease(t,0,.8));else if(pack<.98)grip(p,0,g,chosen,[.07,0,0]);grip(p,1,g,bag,[0,.59,.02]);thought.visible=t>=2&&t<4.4;thought.scale.setScalar(.01+.99*ease(t,2,2.5));p.head.rotation.y=.1-.35*ease(t,2,2.5)+.35*pack;p.head.rotation.x=.12*pack;
 },{kind:'shopping',bag,chosen});}
function garment(g,color=0xd7dfcc){const f=new T.Group();g.add(f);box(f,color,0,-.18,0,.42,.49,.05,.07);for(const sign of [-1,1]){const sleeve=box(f,color,sign*.25,0,0,.22,.25,.05,.04);sleeve.rotation.z=sign*.45}return f;}
function hanger(g){const h=new T.Group();g.add(h);bar(h,0xb29a75,[-.25,-.12,0],[0,.02,0],.014);bar(h,0xb29a75,[0,.02,0],[.25,-.12,0],.014);bar(h,0xb29a75,[-.25,-.12,0],[.25,-.12,0],.014);const curve=new T.CatmullRomCurve3([V(0,.02,0),V(0,.14,0),V(.05,.19,0),V(.11,.16,0)]);mesh(h,new T.TubeGeometry(curve,12,.014,6,false),0xb29a75);return h;}
// 6. Lift the shirt, smooth it, insert a hanger and slide it clear of its neighbour.
export function laundry(){const g=base(0xd6dfdc),p=hero(g,-.36,.47);p.group.rotation.set(0,Math.PI,0);
 // Outdoor rail behind the person; indoor basket to the left, outside the walking lane.
 for(const x of [.35,1.42])bar(g,0x99aaa1,[x,.03,-.47],[x,1.76,-.47],.025);bar(g,0x99aaa1,[.35,1.76,-.47],[1.42,1.76,-.47],.025);
 const basket=new T.Group();basket.position.set(-1.13,.05,.02);g.add(basket);box(basket,0xc8b99b,0,.03,0,.62,.06,.48,.025);for(const x of [-.29,.29])box(basket,0xc8b99b,x,.24,0,.04,.43,.48,.025);for(const z of [-.22,.22])box(basket,0xc8b99b,0,.24,z,.62,.43,.035,.025);
 const clothing=new T.Group();g.add(clothing);const shirt=garment(clothing),h=hanger(clothing);h.position.y=.03;const cloud=new T.Group();cloud.position.set(.60,2.16,-.72);g.add(cloud);for(const [x,y,r] of [[-.25,0,.18],[0,.07,.23],[.25,0,.18]])ball(cloud,0xa8b2b5,x,y,0,r,r*.65,.065);
 const drops=[];for(let i=0;i<4;i++)drops.push(bar(g,0x9ebdc5,[.1+i*.32,1.9,-.79],[.07+i*.32,1.78,-.79],.012));
 const A=V(.80,1.54,-.47),up=V(.80,1.72,-.47),out=V(.80,1.64,.07),inside=V(-1.13,1.0,.02);
 return freezeable(g,p,t=>{p.group.rotation.set(0,Math.PI,0);const notice=ease(t,0,.8);p.head.rotation.y=-.45*notice*(1-ease(t,1,1.8));p.group.position.set(.38,0,.66);
 if(t<2.3)arc(clothing,A,up,ease(t,1.5,2.3),.01);else if(t<3.1)arc(clothing,up,out,ease(t,2.3,3.1),.02);else if(t<5.4){arc(clothing,out,inside,ease(t,3.1,5.4),.04);p.group.position.x=lerp(.38,-.70,ease(t,3.1,5.4));}else{clothing.position.copy(inside);p.group.position.x=-.70;clothing.position.y=1-.36*ease(t,5.4,6.5);shirt.scale.y=1-.55*ease(t,5.4,6.5);}
 if(t<1.5)reach(p,0,g,[.80,1.64,-.47],ease(t,.8,1.5));else if(t<6.6)grip(p,0,g,clothing,[0,.13,0]);
 drops.forEach((d,i)=>{d.visible=t>6.5;d.position.y=-((t-6.5+i*.1)%1)*.3});p.head.rotation.x=.1*ease(t,5.4,6.5);
 },{kind:'laundry-before-rain',shirt,h,clothing,basket});}
// 7. Knee and hip bend keeps the feet planted; the box is lifted before vacuuming.
export function vacuum(){const g=base(),p=hero(g,-.05,-.03);bendingRig(p);const bin=box(g,0xc4b191,.08,.22,.55,.48,.44,.41,.05);box(bin,0xe4dac3,0,.02,.217,.19,.1,.015,.02);const dirt=[];for(let i=0;i<6;i++)dirt.push(ball(g,0xb7ae96,-.12+i*.07,.025,.47+(i%2)*.12,.025,.012,.018));
 const vac=new T.Group();g.add(vac);const head=box(vac,0x8caaa4,0,.065,0,.40,.13,.24,.04);bar(vac,0xa1aaa4,[0,.13,0],[0,1.1,-.20],.025);box(vac,0x6f8f88,0,1.12,-.2,.15,.13,.1,.04);const A=V(.08,.22,.55),B=V(-.92,.22,.52);
 return freezeable(g,p,t=>{const down=(1-ease(t,2,2.3))+ease(t,5.1,5.4)*(1-ease(t,6.8,7.2));p.group.rotation.set(0,0,0);p.group.position.x=.08-1.0*ease(t,.45,1.9)+1.0*ease(t,2,2.6)-1.0*ease(t,5,5.4)+1.0*ease(t,5.4,6.8);p.group.position.z=-.20;crouch(p,down);p.head.rotation.x=.20;const out=ease(t,.45,1.9),back=ease(t,5.4,6.8);if(t<5.4)arc(bin,A,B,out,.18);else arc(bin,B,A,back,.18);
 vac.position.set(1.21,.0,.70);if(t>2.1&&t<5.2){const q=ease(t,2.1,2.7)*(1-ease(t,4.6,5.2));vac.position.x=lerp(1.21,.10,q);vac.position.z=.50-.12*Math.sin(ease(t,2.7,4.6)*Math.PI*3)*q;grip(p,1,g,vac,[0,1.12,-.20]);}if(t>=.4&&t<1.9||t>=5.4&&t<6.8){grip(p,1,g,bin,[.21,.12,0]);grip(p,0,g,bin,[-.21,.12,0]);}else if(t<.4){reach(p,1,g,[.29,.34,.55],ease(t,0,.4));reach(p,0,g,[-.13,.34,.55],ease(t,0,.4));}dirt.forEach((d,i)=>d.visible=t<3.1+i*.23);
 },{kind:'vacuum',bin,vac});}
// 8. Tie the old liner, set it down, unfold the new liner, smooth its rim.
export function rubbish(){const g=base(0xdcdaca),p=hero(g,.15,-.42);bendingRig(p);const can=mesh(g,new T.CylinderGeometry(.27,.23,.67,32),0x9eaea2,.39,.335,.25);mesh(g,new T.CircleGeometry(.235,32),0x61776a,.39,.675,.25).rotation.x=-Math.PI/2;const old=new T.Group();g.add(old);ball(old,0xd8d8c8,0,.20,0,.23,.30,.20);const neck=box(old,0xc2c8b8,0,.48,0,.23,.10,.13,.025);const knot=ball(old,0xc2c8b8,0,.53,0,.06,.05,.05);const fresh=new T.Group();g.add(fresh);const liner=mesh(fresh,new T.CylinderGeometry(.24,.19,.50,32,1,true),0xf1eedf,0,-.25,0);liner.material=liner.material.clone();liner.material.side=T.DoubleSide;const rim=mesh(fresh,new T.TorusGeometry(.265,.025,8,40),0xf7f3e7);rim.rotation.x=Math.PI/2;box(g,0xc8bba2,-.75,.30,.10,.35,.60,.34,.04);const roll=box(g,0xd4dbcd,-.75,.65,.10,.29,.10,.21,.04);
 return freezeable(g,p,t=>{p.group.rotation.set(0,0,0);p.group.position.x=.15+.65*ease(t,2.2,3.2)-1.15*ease(t,3.2,3.7)+.50*ease(t,3.7,5.7);crouch(p,.35+.35*(1-ease(t,5.4,7.2)));const lift=ease(t,.4,1.4),put=ease(t,2.2,3.2);arc(old,V(.39,.21,.25),V(.38,.81,.33),lift,.06);if(t>2.2)arc(old,V(.38,.81,.33),V(1.17,.10,.59),put,.13);neck.scale.x=1-.65*ease(t,1.4,2.1);knot.visible=t>1.8;
 if(t<3.2){grip(p,1,g,old,[.08,.49,0]);grip(p,0,g,old,[-.08,.49,0]);}
 fresh.visible=true;arc(fresh,V(-.75,.65,.10),V(.39,.70,.25),ease(t,3.7,5.7),.15);fresh.scale.setScalar(.15+.85*ease(t,3.7,4.7));if(t>=3.7&&t<5.7){grip(p,0,g,fresh,[-.23,0,0]);grip(p,1,g,fresh,[.23,0,0]);}if(t>=5.7&&t<7){const q=ease(t,5.7,7);poseHand(p,0,g,[.15,.72,.25+.06*Math.sin(q*Math.PI)]);poseHand(p,1,g,[.63,.72,.25+.06*Math.sin(q*Math.PI)]);}p.head.rotation.x=.17;
 },{kind:'bin-liner',old,fresh});}
// Reverse depth only: retain left/right layout, the front camera, and contact paths.
function reverseDepth(factory){return()=>{const d=factory(),display=new T.Group();d.group.scale.z=-1;display.add(d.group);display.updateMatrixWorld(true);return{...d,group:display,update(t){d.update(t);display.updateMatrixWorld(true);}};};}
export const sceneFactories={head:meal,eyes:tea,hand:reverseDepth(tidy),pocket:reverseDepth(supplies),bag:shopping,sleeve:laundry,shoes:vacuum,hem:rubbish};
