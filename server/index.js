import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT || 2567);
const wss = new WebSocketServer({ port: PORT });
const players = new Map();

wss.on('connection', (ws) => {
  const id = randomUUID();
  players.set(id, { id, x: 0, z: 4, rotation: 0 });
  ws.send(JSON.stringify({ type: 'welcome', id }));

  ws.on('message', (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }
    if (message.type !== 'move') return;
    const player = players.get(id);
    if (!player) return;
    player.x = Math.max(-500, Math.min(500, Number(message.x) || 0));
    player.z = Math.max(-500, Math.min(500, Number(message.z) || 0));
    player.rotation = Number(message.rotation) || 0;
  });

  ws.on('close', () => players.delete(id));
});

setInterval(() => {
  const payload = JSON.stringify({ type: 'state', players: [...players.values()] });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(payload);
  }
}, 80);

console.log(`LAMHAH Life multiplayer server listening on ws://localhost:${PORT}`);
