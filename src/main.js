import * as THREE from 'three';
import './style.css';
import { MAP_CENTER, GEO_ANCHORS } from './map-data.js';

const root = document.querySelector('#scene');
const connection = document.querySelector('#connection');
const playersLabel = document.querySelector('#players');
const clockLabel = document.querySelector('#clock');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9c8c8);
scene.fog = new THREE.Fog(0xb9c8c8, 240, 1050);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, .1, 1800);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe8f1f4, 0x77674f, 2));
const sun = new THREE.DirectionalLight(0xffe3bd, 3);
sun.position.set(-260, 420, 180);
sun.castShadow = true;
scene.add(sun);
const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: .9 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1500), material(0xc9b99b));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function box(w,h,d,x,y,z,color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material(color));
  mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  return mesh;
}
function world(lat, lon) {
  return { x:(lon-MAP_CENTER.lon)*111320*Math.cos(MAP_CENTER.lat*Math.PI/180), z:-(lat-MAP_CENTER.lat)*111320 };
}
function label(text, x, y, z) {
  const c=document.createElement('canvas'); c.width=512; c.height=112;
  const ctx=c.getContext('2d'); ctx.fillStyle='rgba(15,20,23,.82)';
  ctx.beginPath(); ctx.roundRect(8,8,496,96,22); ctx.fill();
  ctx.fillStyle='#fff3d7'; ctx.font='bold 36px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,256,58);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));
  sprite.position.set(x,y,z); sprite.scale.set(34,7.4,1); scene.add(sprite);
}
const castle=world(29.81115,39.86717);
const mound=new THREE.Mesh(new THREE.CylinderGeometry(35,48,9,8),material(0x9b896e));
mound.position.set(castle.x,4,castle.z); mound.receiveShadow=true; scene.add(mound);
box(43,13,34,castle.x,12,castle.z,0xa98761);
for(const [dx,dz] of [[-20,-15],[20,-15],[-20,15],[20,15]]) {
  const tower=new THREE.Mesh(new THREE.CylinderGeometry(4.3,5.3,20,8),material(0xa98761));
  tower.position.set(castle.x+dx,14,castle.z+dz); tower.castShadow=true; scene.add(tower);
}
label('قلعة مارد',castle.x,31,castle.z);
const mosque=world(29.81203,39.86762);
box(30,7,19,mosque.x,3.5,mosque.z,0xd0c3a9);
const minaret=new THREE.Mesh(new THREE.CylinderGeometry(1.3,2,13,8),material(0xb49b78));
minaret.position.set(mosque.x-12,13.5,mosque.z+7); scene.add(minaret);
label('مسجد عمر بن الخطاب',mosque.x,25,mosque.z);

let seed=31; const rand=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
for(let x=-250;x<=250;x+=28) for(let z=-235;z<=235;z+=32) {
  if(Math.hypot(x-castle.x,z-castle.z)<65 || rand()<.25) continue;
  const h=5+rand()*12; box(12+rand()*6,h,12+rand()*6,x,h/2,z,[0xe1d8c7,0xd1c6b2,0xc4c9c4][Math.floor(rand()*3)]);
}
for(let i=0;i<22;i++) {
  const a=i*2.399, r=22+(i%5)*8, p=world(29.811186,39.867053);
  const x=p.x+Math.cos(a)*r, z=p.z+Math.sin(a)*r;
  box(8,5,8,x,2.5,z,0x9c8b72);
}
label('وسط دومة الجندل',-165,22,-205);

function avatar(color=0x253d4a) {
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.75,5,10),material(color)); body.position.y=1.05; g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.27,16,12),material(0xb9825d)); head.position.y=1.82; g.add(head);
  const ghutra=new THREE.Mesh(new THREE.ConeGeometry(.34,.2,4),material(0xe9e2d2)); ghutra.position.y=2.05; g.add(ghutra);
  scene.add(g); return g;
}
const player=avatar(); player.position.set(-115,0,155);
const remote=new Map(); const keys={};
let yaw=0, pitch=-.16, mode='third', dragging=false, lastX=0, lastY=0;
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyV')mode=mode==='third'?'first':'third'});
addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;yaw-=(e.clientX-lastX)*.004;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*.003,-.8,.35);lastX=e.clientX;lastY=e.clientY});

let socket, myId=null, online=false;
function connect(){
  const proto=location.protocol==='https:'?'wss':'ws';
  socket=new WebSocket(`${proto}://${location.hostname}:2567`);
  socket.addEventListener('open',()=>{online=true;connection.textContent='متصل بالخادم';connection.style.color='#a8d8ad'});
  socket.addEventListener('message',e=>{
    const msg=JSON.parse(e.data);
    if(msg.type==='welcome'){myId=msg.id;return}
    if(msg.type!=='state')return;
    const list=msg.players||[]; playersLabel.textContent=String(list.length);
    const seen=new Set();
    for(const p of list){if(p.id===myId)continue;seen.add(p.id);let a=remote.get(p.id);if(!a){a=avatar(0x8b5d37);remote.set(p.id,a)}a.position.set(p.x,0,p.z)}
    for(const [id,a] of remote)if(!seen.has(id)){scene.remove(a);remote.delete(id)}
  });
  socket.addEventListener('close',()=>{online=false;connection.textContent='غير متصل — شغّل الخادم';connection.style.color='#e4a09a'});
  socket.addEventListener('error',()=>connection.textContent='تعذّر الاتصال');
}
connect();
let elapsed=0,lastSend=0;
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-(animate.last||now))/1000,.05);animate.last=now;elapsed+=dt;
  const f=(keys.KeyW?1:0)-(keys.KeyS?1:0), s=(keys.KeyD?1:0)-(keys.KeyA?1:0);
  const dir=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const move=dir.multiplyScalar(f).add(right.multiplyScalar(s));
  if(move.lengthSq()){move.normalize().multiplyScalar(((keys.ShiftLeft||keys.ShiftRight)?9:5.2)*dt);player.position.add(move);player.rotation.y=Math.atan2(-move.x,-move.z)}
  player.position.x=THREE.MathUtils.clamp(player.position.x,-420,420);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-420,420);
  const target=new THREE.Vector3(player.position.x,mode==='first'?1.65:1.35,player.position.z);
  if(mode==='third'){camera.position.lerp(target.clone().add(new THREE.Vector3(Math.sin(yaw)*7,3.1,Math.cos(yaw)*7)),.12);camera.lookAt(target)}
  else{camera.position.lerp(target,.35);camera.lookAt(target.clone().add(new THREE.Vector3(-Math.sin(yaw)*10,Math.sin(pitch)*5,-Math.cos(yaw)*10)))}
  if(online&&now-lastSend>65){socket.send(JSON.stringify({type:'move',x:player.position.x,z:player.position.z,rotation:player.rotation.y}));lastSend=now}
  const mins=Math.floor(elapsed*2);clockLabel.textContent=`${String((8+Math.floor(mins/60))%24).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`;
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
