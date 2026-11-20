import * as THREE from 'three';
import './style.css';
import { MAP_CENTER } from './map-data.js';

const sceneRoot=document.querySelector('#scene'), connection=document.querySelector('#connection'), playersLabel=document.querySelector('#players'), clockLabel=document.querySelector('#clock');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xbac7c7); scene.fog=new THREE.Fog(0xbac7c7,330,1050);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,1800);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;sceneRoot.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe7f0f3,0x78664e,2.1));
const sun=new THREE.DirectionalLight(0xffe6c5,3.1);sun.position.set(-220,330,170);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-380;sun.shadow.camera.right=380;sun.shadow.camera.top=380;sun.shadow.camera.bottom=-380;scene.add(sun);
const mat=(c,r=.88)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600),mat(0xc5b697));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function box(w,h,d,x,y,z,c,rough=.9){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,rough));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function world(lat,lon){return{x:(lon-MAP_CENTER.lon)*111320*Math.cos(MAP_CENTER.lat*Math.PI/180),z:-(lat-MAP_CENTER.lat)*111320}}
function road(w,d,x,z){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat(0x41484a,1));m.rotation.x=-Math.PI/2;m.position.set(x,.035,z);m.receiveShadow=true;scene.add(m);return m}
function line(w,d,x,z,c=0xd4c8a4){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({color:c}));m.rotation.x=-Math.PI/2;m.position.set(x,.055,z);scene.add(m)}
// A coherent first-pass street grid: asphalt, sidewalks, intersections and lane markings.
for(let p=-360;p<=360;p+=120){road(15,760,p,0);road(760,15,0,p);road(19,760,p+8,0);road(760,19,0,p+8)}
for(let p=-360;p<=360;p+=120){for(let q=-360;q<=360;q+=120){box(2,.18,2,p, .1,q,0x8b877b)}}
for(let p=-360;p<=360;p+=120){for(let z=-350;z<350;z+=24){line(.18,9,p-3,z,0xe0d2aa);line(.18,9,p+3,z,0xe0d2aa)}for(let x=-350;x<350;x+=24){line(9,.18,x,p-3,0xe0d2aa);line(9,.18,x,p+3,0xe0d2aa)}}
// Landmark massing at known anchor coordinates; detailed architectural assets are a later art pass.
const castle=world(29.81115,39.86717);
const mound=new THREE.Mesh(new THREE.CylinderGeometry(39,51,10,12),mat(0x99846a));mound.position.set(castle.x,5,castle.z);mound.receiveShadow=true;scene.add(mound);
box(44,16,36,castle.x,13,castle.z,0xa98962);for(const [dx,dz] of [[-21,-17],[21,-17],[-21,17],[21,17]]){const t=new THREE.Mesh(new THREE.CylinderGeometry(4.5,5.2,21,10),mat(0xa88761));t.position.set(castle.x+dx,16,castle.z+dz);t.castShadow=true;scene.add(t)}
function label(txt,x,y,z){const c=document.createElement('canvas');c.width=512;c.height=100;const ctx=c.getContext('2d');ctx.fillStyle='#172027dd';ctx.beginPath();ctx.roundRect(6,6,500,88,18);ctx.fill();ctx.fillStyle='#f4dfb4';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,256,52);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));s.position.set(x,y,z);s.scale.set(30,6,1);scene.add(s)}
label('قلعة مارد',castle.x,32,castle.z);
const mosque=world(29.81203,39.86762);box(29,7,20,mosque.x,3.5,mosque.z,0xd7cbb4);const minaret=new THREE.Mesh(new THREE.CylinderGeometry(1.4,2,15,10),mat(0xb8a17e));minaret.position.set(mosque.x-12,11,mosque.z+7);scene.add(minaret);label('مسجد عمر بن الخطاب',mosque.x,22,mosque.z);
// Dense but varied blocks around the old town; this is procedural placeholder geometry, not a survey-accurate city model.
let seed=2026;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const palette=[0xd6c9b1,0xc8baa2,0xb7a58a,0xe0d6c4,0xaaa18e];
for(let bx=-330;bx<=330;bx+=120)for(let bz=-330;bz<=330;bz+=120){
 if(Math.hypot(bx-castle.x,bz-castle.z)<72)continue;
 for(let i=0;i<5;i++){const x=bx+(rand()-.5)*75,z=bz+(rand()-.5)*75,w=12+rand()*17,d=12+rand()*18,h=5+rand()*11;box(w,h,d,x,h/2,z,palette[Math.floor(rand()*palette.length)]);box(w*.9,.45,d*.9,x,h+.2,z,0x9b8d78)}
}
// Street lamps and date palms as repeating visual details.
for(let x=-330;x<=330;x+=60)for(let z=-330;z<=330;z+=120){if(rand()<.45)continue;const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.17,5,8),mat(0x555653));pole.position.set(x,2.5,z);scene.add(pole);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.34,8,8),new THREE.MeshBasicMaterial({color:0xffe2a1}));lamp.position.set(x,5,z);scene.add(lamp)}
function palm(x,z){const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.38,5,7),mat(0x806342));trunk.position.y=2.5;g.add(trunk);for(let i=0;i<8;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.28,4.2,5),mat(0x526b45));leaf.rotation.z=Math.PI/2;leaf.rotation.y=i*Math.PI/4;leaf.position.set(Math.cos(i*Math.PI/4)*1.5,5.1,Math.sin(i*Math.PI/4)*1.5);g.add(leaf)}g.position.set(x,0,z);scene.add(g)}
for(let i=0;i<34;i++)palm(-300+rand()*600,-300+rand()*600);

function createPlayer(color=0xf2eee5){
 // Detailed human-proportioned Gulf male avatar: layered thobe, articulated limbs,
 // facial features, ghutra folds, agal, hands and leather sandals.
 const root=new THREE.Group();
 const makeMat=(color,rough=.82,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness});
 const thobeMat=makeMat(color,.94), skin=makeMat(0x986b50,.9), skinLight=makeMat(0xb98564,.88);
 const dark=makeMat(0x242321,.8), ghutraMat=makeMat(0xf7f4eb,.96), ghutraShade=makeMat(0xd9d5ca,.98);
 const seamMat=makeMat(0xd6d0c3,1), shoeMat=makeMat(0x33271f,.8);
 const add=(parent,geo,material,pos,rot)=>{const m=new THREE.Mesh(geo,material);m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const capsule=(r,len,material,parent,pos)=>add(parent,new THREE.CapsuleGeometry(r,len,7,12),material,pos);
 // Neck and body, with a gently tapered flowing thobe silhouette.
 const body=new THREE.Group();root.add(body);
 add(body,new THREE.CylinderGeometry(.205,.29,.16,24),thobeMat,[0,1.53,0]);
 const robePts=[new THREE.Vector2(.19,0),new THREE.Vector2(.205,.12),new THREE.Vector2(.235,.38),new THREE.Vector2(.27,.78),new THREE.Vector2(.31,1.12),new THREE.Vector2(.28,1.42),new THREE.Vector2(.20,1.50),new THREE.Vector2(0,1.50)];
 const robe=add(body,new THREE.LatheGeometry(robePts,32),thobeMat,[0,.08,0]);robe.scale.z=1.08;
 // front placket and buttons
 add(body,new THREE.BoxGeometry(.025,.55,.012),seamMat,[0,1.19,.274]);
 for(let y=1.36;y>0.92;y-=.11)add(body,new THREE.SphereGeometry(.018,8,8),dark,[.035,y,.285]);
 // neck and head
 capsule(.105,.12,skin,root,[0,1.67,0]);
 const head=new THREE.Group();head.position.set(0,1.91,0);root.add(head);
 add(head,new THREE.SphereGeometry(.17,24,20),skin,[0,0,0]);
 add(head,new THREE.SphereGeometry(.105,16,12),skinLight,[0,-.045,.115]).scale.set(1,.68,.65);
 // ears
 for(const s of [-1,1])add(head,new THREE.SphereGeometry(.042,12,10),skin,[s*.17,-.005,0]);
 // eyes, brows, nose and mouth facing +Z
 for(const s of [-1,1]){
  add(head,new THREE.SphereGeometry(.018,10,8),makeMat(0xf5eee4),[s*.064,.025,.148]);
  add(head,new THREE.SphereGeometry(.009,8,8),dark,[s*.064,.025,.164]);
  add(head,new THREE.BoxGeometry(.055,.012,.018),dark,[s*.064,.066,.145],[0,0,s*-.08]);
 }
 add(head,new THREE.ConeGeometry(.025,.075,8),skinLight,[0,-.005,.17],[Math.PI/2,0,0]);
 add(head,new THREE.BoxGeometry(.055,.009,.012),makeMat(0x593b32),[0,-.09,.15]);
 // Ghutra crown and two natural hanging side panels.
 const crown=add(head,new THREE.SphereGeometry(.205,24,14,0,Math.PI*2,0,Math.PI/2),ghutraMat,[0,.13,0]);crown.scale.set(1.12,.75,1.08);
 const panelGeo=new THREE.BoxGeometry(.13,.39,.035);
 const left=add(head,panelGeo,ghutraMat,[-.145,-.12,-.005],[0,0,-.08]);
 const right=add(head,panelGeo,ghutraMat,[.145,-.12,-.005],[0,0,.08]);
 left.scale.y=1.2;right.scale.y=1.2;
 // black agal rings resting on the ghutra
 const agal=add(head,new THREE.TorusGeometry(.17,.025,10,32),dark,[0,.135,0],[Math.PI/2,0,0]);agal.scale.set(1.08,1,1);
 add(head,new THREE.TorusGeometry(.145,.012,8,28),makeMat(0x39332b),[0,.16,0],[Math.PI/2,0,0]);
 // articulated shoulders, upper arms, sleeves, hands
 const arms=[];
 for(const s of [-1,1]){
  const shoulder=new THREE.Group();shoulder.position.set(s*.285,1.48,0);root.add(shoulder);
  capsule(.105,.28,thobeMat,shoulder,[s*.025,-.20,0]).rotation.z=s*-.12;
  capsule(.082,.24,thobeMat,shoulder,[s*.04,-.43,.005]).rotation.z=s*-.08;
  const cuff=add(shoulder,new THREE.CylinderGeometry(.083,.09,.055,16),seamMat,[s*.04,-.55,0]);
  const hand=new THREE.Group();hand.position.set(s*.04,-.65,.01);shoulder.add(hand);
  capsule(.055,.10,skin,hand,[0,-.015,.005]);
  for(let f=0;f<4;f++)capsule(.012,.045,skin,hand,[s*(f-1.5)*.022,-.07,.025]);
  arms.push(shoulder);
 }
 // trousers and legs with knees, ankles, shoes
 const legs=[];
 for(const s of [-1,1]){
  const leg=new THREE.Group();leg.position.set(s*.105,.43,0);root.add(leg);
  capsule(.105,.40,dark,leg,[0,-.12,0]);
  add(leg,new THREE.CylinderGeometry(.072,.078,.12,14),dark,[0,-.39,0]);
  add(leg,new THREE.BoxGeometry(.14,.085,.25),shoeMat,[0,-.47,.045]);
  legs.push(leg);
 }
 // subtle shoulder seam and collar
 add(body,new THREE.TorusGeometry(.09,.012,8,24),seamMat,[0,1.54,.01],[Math.PI/2,0,0]);
 root.userData={arms,legs,body,head};root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 scene.add(root);return root;
}
const player=createPlayer(), remotes=new Map();player.position.set(-42,0,80);
const keys={};let yaw=0,pitch=-.12,mode='third',elapsed=0,lastSend=0;
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyV')mode=mode==='third'?'first':'third'});addEventListener('keyup',e=>keys[e.code]=false);
const stick=document.querySelector('#stick'),knob=document.querySelector('#knob'),runBtn=document.querySelector('#runBtn'),cameraBtn=document.querySelector('#cameraBtn');
let joy={x:0,y:0},joyId=null,running=false,lookId=null,lastLookX=0,lastLookY=0;
stick.addEventListener('pointerdown',e=>{joyId=e.pointerId;stick.setPointerCapture(joyId);updateJoy(e)});
stick.addEventListener('pointermove',e=>{if(e.pointerId===joyId)updateJoy(e)});
function updateJoy(e){const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy),max=42,k=Math.min(1,max/(len||1));joy.x=dx*k/max;joy.y=dy*k/max;knob.style.transform='translate('+dx*k+'px,'+dy*k+'px)'}
function releaseJoy(e){if(e.pointerId!==joyId)return;joyId=null;joy={x:0,y:0};knob.style.transform='translate(0,0)'}stick.addEventListener('pointerup',releaseJoy);stick.addEventListener('pointercancel',releaseJoy);
runBtn.addEventListener('pointerdown',()=>{running=true;runBtn.classList.add('active')});['pointerup','pointercancel','pointerleave'].forEach(ev=>runBtn.addEventListener(ev,()=>{running=false;runBtn.classList.remove('active')}));
cameraBtn.addEventListener('click',()=>mode=mode==='third'?'first':'third');
renderer.domElement.addEventListener('pointerdown',e=>{if(e.clientX>innerWidth*.48&&innerWidth<950){lookId=e.pointerId;lastLookX=e.clientX;lastLookY=e.clientY}});
renderer.domElement.addEventListener('pointermove',e=>{if(lookId!==e.pointerId)return;yaw-=(e.clientX-lastLookX)*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastLookY)*.003,-.7,.25);lastLookX=e.clientX;lastLookY=e.clientY});
['pointerup','pointercancel'].forEach(ev=>renderer.domElement.addEventListener(ev,e=>{if(e.pointerId===lookId)lookId=null}));
let socket,myId=null,online=false;
function connect(){const url=import.meta.env.VITE_WS_URL||'wss://lamhah-life-multiplayer.onrender.com';socket=new WebSocket(url);socket.addEventListener('open',()=>{online=true;connection.textContent='متصل بالخادم'});socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='welcome'){myId=m.id;return}if(m.type!=='state')return;const list=m.players||[];playersLabel.textContent=list.length;const seen=new Set();for(const p of list){if(p.id===myId)continue;seen.add(p.id);let a=remotes.get(p.id);if(!a){a=createPlayer(0x9caaaf);remotes.set(p.id,a)}a.position.set(p.x,0,p.z);a.rotation.y=p.rotation||0}for(const[id,a]of remotes)if(!seen.has(id)){scene.remove(a);remotes.delete(id)}});socket.addEventListener('close',()=>{online=false;connection.textContent='إعادة الاتصال…';setTimeout(()=>{if(!online)connect()},3500)});socket.addEventListener('error',()=>{connection.textContent='الاتصال غير مستقر'})}connect();

// Compact live minimap: local street grid, historic landmarks and current player heading.
const mini=document.querySelector('#minimapCanvas'), miniCtx=mini.getContext('2d');
function drawMinimap(){
 const c=miniCtx,w=mini.width,h=mini.height,scale=w/900;
 c.clearRect(0,0,w,h);c.fillStyle='#c9c0a8';c.fillRect(0,0,w,h);
 // Neighborhood blocks
 c.fillStyle='#b5aa91';
 for(let x=-390;x<420;x+=120)for(let z=-390;z<420;z+=120)c.fillRect((x+450)*scale+5,(z+450)*scale+5,105*scale,105*scale);
 // Street network
 c.strokeStyle='#f0e8d6';c.lineWidth=13*scale;
 for(let p=-360;p<=360;p+=120){c.beginPath();c.moveTo((p+450)*scale,0);c.lineTo((p+450)*scale,h);c.stroke();c.beginPath();c.moveTo(0,(p+450)*scale);c.lineTo(w,(p+450)*scale);c.stroke()}
 c.strokeStyle='#656a68';c.lineWidth=8*scale;
 for(let p=-360;p<=360;p+=120){c.beginPath();c.moveTo((p+450)*scale,0);c.lineTo((p+450)*scale,h);c.stroke();c.beginPath();c.moveTo(0,(p+450)*scale);c.lineTo(w,(p+450)*scale);c.stroke()}
 // Castle / mosque map pins from geographic anchors converted into game coordinates
 const pins=[{p:castle,color:'#b37a35'},{p:mosque,color:'#718b72'}];
 for(const pin of pins){const x=(pin.p.x+450)*scale,y=(pin.p.z+450)*scale;c.fillStyle=pin.color;c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fill();c.strokeStyle='#fff4df';c.lineWidth=1.5;c.stroke()}
 // Player marker and heading
 const px=(player.position.x+450)*scale,py=(player.position.z+450)*scale;
 c.save();c.translate(px,py);c.rotate(player.rotation.y);c.fillStyle='#e65343';c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(0,-9);c.lineTo(6,7);c.lineTo(0,4);c.lineTo(-6,7);c.closePath();c.fill();c.stroke();c.restore();
}

function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-(animate.last||now))/1000,.05);animate.last=now;elapsed+=dt;
 const forward=(keys.KeyW?1:0)-(keys.KeyS?1:0)-joy.y,right=(keys.KeyD?1:0)-(keys.KeyA?1:0)+joy.x;
 const move=new THREE.Vector3(-Math.sin(yaw)*forward+Math.cos(yaw)*right,0,-Math.cos(yaw)*forward-Math.sin(yaw)*right);
 if(move.lengthSq()>.01){move.normalize().multiplyScalar((running||keys.ShiftLeft?8.5:5.2)*dt);player.position.add(move);player.rotation.y=Math.atan2(-move.x,-move.z);const phase=now*.012;player.userData.legs[0].rotation.x=Math.sin(phase)*.48;player.userData.legs[1].rotation.x=-Math.sin(phase)*.48;player.userData.arms[0].rotation.x=-Math.sin(phase)*.22;player.userData.arms[1].rotation.x=Math.sin(phase)*.22}else{[...player.userData.legs,...player.userData.arms].forEach(o=>o.rotation.x*=.8)}
 player.position.x=THREE.MathUtils.clamp(player.position.x,-430,430);player.position.z=THREE.MathUtils.clamp(player.position.z,-430,430);
 const target=new THREE.Vector3(player.position.x,mode==='first'?1.7:1.45,player.position.z);
 if(mode==='third'){camera.position.lerp(target.clone().add(new THREE.Vector3(Math.sin(yaw)*7,3.3,Math.cos(yaw)*7)),.13);camera.lookAt(target)}else{camera.position.lerp(target,.35);camera.lookAt(target.clone().add(new THREE.Vector3(-Math.sin(yaw)*10,Math.sin(pitch)*5,-Math.cos(yaw)*10)))}
 if(online&&now-lastSend>80&&socket.readyState===1){socket.send(JSON.stringify({type:'move',x:player.position.x,z:player.position.z,rotation:player.rotation.y}));lastSend=now}
 const minutes=Math.floor(elapsed*2);clockLabel.textContent=String((8+Math.floor(minutes/60))%24).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');renderer.render(scene,camera);drawMinimap()}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
