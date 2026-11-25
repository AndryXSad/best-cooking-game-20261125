// render.js — Dapur Kilat: everything the player sees.
// One clear job: draw the kitchen, the chef, the HUD, the tickets and the
// screens on one canvas. No game logic lives here.

const Render = {
  ctx: null,
  canvas: null,

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  },

  rr(x, y, w, h, r) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  },

  text(str, x, y, size, color, align, weight) {
    const c = this.ctx;
    c.fillStyle = color;
    c.font = (weight || '700') + ' ' + size + 'px "Trebuchet MS", Verdana, sans-serif';
    c.textAlign = align || 'center';
    c.textBaseline = 'middle';
    c.fillText(str, x, y);
  },

  // ---- ingredient icons (all drawn, no image files) ----------------------
  drawIngredient(type, x, y, s) {
    const c = this.ctx;
    const it = ITEMS[type];
    c.save();
    c.translate(x, y);
    c.scale(s / 32, s / 32);
    c.lineWidth = 2;
    c.strokeStyle = 'rgba(0,0,0,0.25)';
    switch (type) {
      case 'bun':
        c.fillStyle = '#e8a85c';
        this.rr(-14, -8, 28, 12, 6); c.fill(); c.stroke();
        c.fillStyle = '#f7d08a';
        c.beginPath(); c.ellipse(0, -8, 14, 8, 0, Math.PI, 0); c.fill(); c.stroke();
        c.fillStyle = '#fff3d6';
        c.beginPath(); c.arc(-6, -11, 1.6, 0, 7); c.arc(3, -13, 1.6, 0, 7); c.arc(8, -10, 1.6, 0, 7); c.fill();
        break;
      case 'patty_raw':
        c.fillStyle = '#d96a7a';
        this.rr(-15, -9, 30, 18, 9); c.fill(); c.stroke();
        c.fillStyle = '#e88a97';
        c.beginPath(); c.arc(-7, -2, 2.5, 0, 7); c.arc(5, 3, 2.5, 0, 7); c.arc(8, -4, 2, 0, 7); c.fill();
        break;
      case 'patty':
        c.fillStyle = '#7a4a28';
        this.rr(-15, -9, 30, 18, 9); c.fill(); c.stroke();
        c.strokeStyle = '#54301a'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(-10, -4); c.lineTo(10, -4); c.moveTo(-10, 3); c.lineTo(10, 3); c.stroke();
        break;
      case 'patty_burnt':
        c.fillStyle = '#2b2b2b';
        this.rr(-15, -9, 30, 18, 9); c.fill(); c.stroke();
        c.fillStyle = '#555';
        c.beginPath(); c.arc(-5, -2, 2, 0, 7); c.arc(6, 3, 2, 0, 7); c.fill();
        break;
      case 'tomato_raw':
        c.fillStyle = '#e23b2e';
        c.beginPath(); c.arc(0, 1, 13, 0, 7); c.fill(); c.stroke();
        c.fillStyle = '#3c7424';
        c.beginPath(); c.moveTo(0, -10); c.lineTo(-6, -16); c.lineTo(0, -13); c.lineTo(6, -16); c.lineTo(0, -10); c.fill();
        break;
      case 'tomato':
        c.fillStyle = '#f0564a';
        c.beginPath(); c.arc(-4, 0, 9, 0, 7); c.arc(7, 2, 9, 0, 7); c.fill(); c.stroke();
        c.fillStyle = '#ffd9d4';
        c.beginPath(); c.arc(-4, 0, 4, 0, 7); c.arc(7, 2, 4, 0, 7); c.fill();
        break;
      case 'lettuce_raw':
        c.fillStyle = '#5da53a';
        c.beginPath(); c.ellipse(0, 0, 14, 10, -0.4, 0, 7); c.fill(); c.stroke();
        c.strokeStyle = '#3c7424'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(-10, 4); c.quadraticCurveTo(0, -6, 11, -4); c.stroke();
        break;
      case 'lettuce':
        c.strokeStyle = '#4d8a2c'; c.lineWidth = 3;
        c.beginPath();
        for (let i = -1; i <= 1; i++) {
          c.moveTo(-14, i * 7);
          c.quadraticCurveTo(0, i * 7 - 7, 14, i * 7);
        }
        c.stroke();
        break;
      case 'cheese':
        c.fillStyle = '#f7c948';
        this.rr(-13, -11, 26, 22, 3); c.fill(); c.stroke();
        c.fillStyle = '#d9a41f';
        c.beginPath(); c.arc(-5, -3, 2.6, 0, 7); c.arc(6, 4, 2.6, 0, 7); c.arc(4, -6, 1.8, 0, 7); c.fill();
        break;
      case 'onion_raw':
        c.fillStyle = '#efe3d0';
        c.beginPath(); c.arc(0, 1, 12, 0, 7); c.fill(); c.stroke();
        c.strokeStyle = '#c9b18c'; c.lineWidth = 1.8;
        c.beginPath(); c.arc(0, 1, 8, 0, 7); c.arc(0, 1, 4, 0, 7); c.stroke();
        c.fillStyle = '#5da53a';
        c.beginPath(); c.moveTo(0, -10); c.lineTo(-3, -17); c.lineTo(3, -17); c.lineTo(0, -10); c.fill();
        break;
      case 'onion':
        c.fillStyle = '#efe6f2';
        c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill();
        c.strokeStyle = '#a88fc0'; c.lineWidth = 3;
        c.beginPath(); c.arc(0, 0, 11, 0, 7); c.arc(0, 0, 6, 0, 7); c.stroke();
        break;
      case 'potato_raw':
        c.fillStyle = '#d9b06a';
        c.beginPath(); c.ellipse(0, 0, 13, 10, 0.3, 0, 7); c.fill(); c.stroke();
        c.fillStyle = '#a67c33';
        c.beginPath(); c.arc(-5, -2, 1.6, 0, 7); c.arc(4, 3, 1.6, 0, 7); c.arc(7, -3, 1.4, 0, 7); c.fill();
        break;
      case 'fries':
        c.fillStyle = '#f2c14e';
        for (let i = -2; i <= 2; i++) {
          c.fillRect(i * 5 - 2, -16 - Math.abs(i), 4, 22);
        }
        c.fillStyle = '#d9382b';
        this.rr(-13, -6, 26, 18, 3); c.fill(); c.stroke();
        break;
      case 'plate':
        c.fillStyle = '#f4f6f8';
        c.beginPath(); c.ellipse(0, 0, 16, 7, 0, 0, 7); c.fill(); c.stroke();
        c.strokeStyle = '#b9c2cc'; c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(0, 0, 11, 4.5, 0, 0, 7); c.stroke();
        break;
      default:
        c.fillStyle = it ? it.color : '#888';
        c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill(); c.stroke();
    }
    c.restore();
  },

  drawPlateWithContents(contents, x, y, s) {
    this.drawIngredient('plate', x, y, s);
    if (!contents || !contents.length) return;
    // Stack the items on the plate, slightly offset so each reads.
    const offsets = [[0, -8], [0, -13], [0, -18], [0, -23], [0, -28]];
    for (let i = 0; i < contents.length; i++) {
      const o = offsets[Math.min(i, offsets.length - 1)];
      this.drawIngredient(contents[i], x + o[0], y + o[1], s * 0.85);
    }
  },

  // ---- kitchen ------------------------------------------------------------
  drawKitchen() {
    const c = this.ctx;
    // Wall + floor.
    c.fillStyle = '#3d2b1f';
    c.fillRect(0, 0, CFG.canvasW, FLOOR.y);
    c.fillStyle = '#8a5a34';
    for (let x = 0; x < CFG.canvasW; x += 64) c.fillRect(x, FLOOR.y - 14, 62, 14);
    c.fillStyle = '#c89b6a';
    for (let y = FLOOR.y; y < CFG.canvasH; y += 56) {
      for (let x = 0; x < CFG.canvasW; x += 56) {
        c.fillStyle = ((x + y) / 56) % 2 === 0 ? '#c89b6a' : '#bd8f5e';
        c.fillRect(x, y, 54, 54);
      }
    }
    // Floor mat in front of the work line.
    c.fillStyle = 'rgba(60,40,20,0.25)';
    c.fillRect(230, 470, 660, 200);
    for (const s of STATIONS) this.drawStation(s);
  },

  drawStation(s) {
    const c = this.ctx;
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    const near = Game.screen === 'playing' && World.nearestStation() === s;
    if (near) {
      c.save();
      c.strokeStyle = '#ffd34d';
      c.lineWidth = 4;
      c.setLineDash([8, 6]);
      this.rr(s.x - 6, s.y - 6, s.w + 12, s.h + 12, 10);
      c.stroke();
      c.restore();
    }
    switch (s.kind) {
      case 'crate': {
        c.fillStyle = '#a9713d';
        this.rr(s.x, s.y, s.w, s.h, 6); c.fill();
        c.strokeStyle = '#6e451f'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#8a5a2e';
        c.fillRect(s.x + 4, s.y + s.h / 2 - 2, s.w - 8, 4);
        this.drawIngredient(s.item, cx, cy - 4, 30);
        break;
      }
      case 'board': {
        c.fillStyle = '#e8c99a';
        this.rr(s.x, s.y, s.w, s.h, 8); c.fill();
        c.strokeStyle = '#a67c33'; c.lineWidth = 2; c.stroke();
        if (World.board) {
          this.drawIngredient(World.board.item, cx, cy - 6, 34);
          if (!World.board.done) {
            c.fillStyle = '#333';
            c.fillRect(cx - 40, s.y + s.h - 12, 80, 7);
            c.fillStyle = '#7cc24e';
            c.fillRect(cx - 40, s.y + s.h - 12, 80 * World.board.progress, 7);
          }
        } else {
          c.fillStyle = 'rgba(0,0,0,0.35)';
          c.beginPath(); c.arc(cx - 30, cy, 3, 0, 7); c.arc(cx + 25, cy + 8, 3, 0, 7); c.fill();
        }
        break;
      }
      case 'grill': {
        c.fillStyle = '#3a3f45';
        this.rr(s.x, s.y, s.w, s.h, 8); c.fill();
        c.strokeStyle = '#1c1f22'; c.lineWidth = 2; c.stroke();
        c.strokeStyle = '#565d66'; c.lineWidth = 2;
        for (let i = 1; i < 6; i++) {
          c.beginPath(); c.moveTo(s.x + (s.w / 6) * i, s.y + 8); c.lineTo(s.x + (s.w / 6) * i, s.y + s.h - 8); c.stroke();
        }
        for (let i = 0; i < 2; i++) {
          const g = World.grill[i];
          const gx = s.x + 55 + i * 110;
          if (g) {
            this.drawIngredient(g.item, gx, cy - 2, 36);
            // Progress ring around the patty.
            const total = g.item === 'patty_raw' ? CFG.grillSeconds : CFG.grillBurnSeconds;
            const frac = Math.min(1, g.t / total);
            c.strokeStyle = g.item === 'patty_burnt' ? '#e23b2e' : (g.item === 'patty' ? '#ffd34d' : '#ff8a5c');
            c.lineWidth = 4;
            c.beginPath(); c.arc(gx, cy - 2, 24, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); c.stroke();
          } else {
            c.fillStyle = 'rgba(255,255,255,0.12)';
            c.beginPath(); c.arc(gx, cy - 2, 16, 0, 7); c.fill();
          }
        }
        break;
      }
      case 'fryer': {
        c.fillStyle = '#7d838c';
        this.rr(s.x, s.y, s.w, s.h, 8); c.fill();
        c.strokeStyle = '#4a4f55'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#e8a83c';
        this.rr(s.x + 12, s.y + 12, s.w - 24, s.h - 24, 6); c.fill();
        if (World.fryer) {
          this.drawIngredient(World.fryer.item, cx, cy - 2, 32);
          const frac = Math.min(1, World.fryer.t / CFG.fryerSeconds);
          c.fillStyle = '#333';
          c.fillRect(cx - 34, s.y + s.h - 10, 68, 6);
          c.fillStyle = '#ffd34d';
          c.fillRect(cx - 34, s.y + s.h - 10, 68 * frac, 6);
        }
        break;
      }
      case 'plates': {
        c.fillStyle = '#a9713d';
        this.rr(s.x, s.y, s.w, s.h, 6); c.fill();
        c.strokeStyle = '#6e451f'; c.lineWidth = 2; c.stroke();
        for (let i = 0; i < 4; i++) this.drawIngredient('plate', cx, cy - 12 + i * 8, 30);
        break;
      }
      case 'counter': {
        c.fillStyle = '#b98a56';
        this.rr(s.x, s.y, s.w, s.h, 10); c.fill();
        c.strokeStyle = '#7a5230'; c.lineWidth = 2; c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.15)';
        c.fillRect(s.x + 6, s.y + 6, s.w - 12, 10);
        if (World.counter) {
          if (isPlate(World.counter)) this.drawPlateWithContents(World.counter.contents, cx, cy + 6, 40);
          else this.drawIngredient(World.counter.type, cx, cy, 36);
        }
        break;
      }
      case 'window': {
        // Awning.
        for (let i = 0; i < 6; i++) {
          c.fillStyle = i % 2 ? '#f4f6f8' : '#d9382b';
          c.fillRect(s.x + i * (s.w / 6), s.y - 26, s.w / 6, 26);
        }
        c.fillStyle = '#5b4632';
        this.rr(s.x, s.y, s.w, s.h, 8); c.fill();
        c.fillStyle = '#2b1d12';
        c.fillRect(s.x + 10, s.y + 10, s.w - 20, s.h - 60);
        c.fillStyle = '#ffd34d';
        c.font = '700 15px "Trebuchet MS", Verdana, sans-serif';
        c.textAlign = 'center';
        c.fillText('SAJIKAN DI SINI', cx, s.y + s.h - 26);
        // Service bell.
        c.fillStyle = '#ffd34d';
        c.beginPath(); c.arc(cx, s.y + 44, 14, Math.PI, 0); c.fill();
        c.fillRect(cx - 14, s.y + 44, 28, 5);
        c.fillStyle = '#d9a41f';
        c.beginPath(); c.arc(cx + 16, s.y + 52, 3, 0, 7); c.fill();
        break;
      }
      case 'trash': {
        c.fillStyle = '#5d6670';
        this.rr(s.x, s.y, s.w, s.h, 8); c.fill();
        c.strokeStyle = '#33383e'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#7d838c';
        this.rr(s.x - 4, s.y - 8, s.w + 8, 12, 5); c.fill();
        c.fillStyle = '#2b2b2b';
        c.beginPath(); c.arc(cx, cy + 4, 12, 0, 7); c.fill();
        break;
      }
    }
    // Station label.
    this.text(s.label, cx, s.y + s.h + 14, 12, '#fff', 'center', '600');
  },

  drawChef() {
    const c = this.ctx;
    const ch = World.chef;
    const bob = ch.moving ? Math.sin(ch.walkPhase) * 2 : 0;
    c.save();
    c.translate(ch.x, ch.y + bob);
    // Shadow.
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.beginPath(); c.ellipse(0, 20 - bob, 20, 7, 0, 0, 7); c.fill();
    // Body (apron).
    c.fillStyle = '#f4f6f8';
    c.beginPath(); c.arc(0, 2, 20, 0, 7); c.fill();
    c.strokeStyle = '#9aa5b1'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#3f7fd1';
    c.fillRect(-12, -2, 24, 18);
    // Head.
    c.fillStyle = '#f2c89b';
    c.beginPath(); c.arc(0, -22, 13, 0, 7); c.fill();
    c.strokeStyle = '#c98f4e'; c.lineWidth = 1.5; c.stroke();
    // Chef hat.
    c.fillStyle = '#ffffff';
    c.beginPath(); c.arc(-8, -32, 8, 0, 7); c.arc(0, -36, 9, 0, 7); c.arc(8, -32, 8, 0, 7); c.fill();
    c.fillRect(-13, -34, 26, 6);
    // Eyes look toward movement.
    c.fillStyle = '#222';
    c.beginPath(); c.arc(-4 + ch.dir * 2, -22, 1.8, 0, 7); c.arc(5 + ch.dir * 2, -22, 1.8, 0, 7); c.fill();
    // Held item floats above the hands.
    if (World.hands) {
      if (isPlate(World.hands)) this.drawPlateWithContents(World.hands.contents, 0, -52, 34);
      else this.drawIngredient(World.hands.type, 0, -52, 34);
    }
    c.restore();
  },

  // ---- HUD + order board ----------------------------------------------------
  drawHUD() {
    const c = this.ctx;
    c.fillStyle = '#241a12';
    c.fillRect(0, 0, CFG.canvasW, 64);
    c.fillStyle = '#ffd34d';
    c.font = '800 26px "Trebuchet MS", Verdana, sans-serif';
    c.textAlign = 'left';
    c.fillText('DAPUR KILAT', 16, 33);
    c.fillStyle = '#ff8a5c';
    c.font = '700 12px "Trebuchet MS", Verdana, sans-serif';
    c.fillText('masak • sajikan • cuan', 16, 52);

    // Shift timer (centre).
    const frac = Game.timeLeft / CFG.shiftSeconds;
    const tx = 330, tw = 360;
    c.fillStyle = '#3a2c1e';
    this.rr(tx, 14, tw, 36, 8); c.fill();
    c.fillStyle = frac > 0.3 ? '#7cc24e' : '#e23b2e';
    this.rr(tx + 3, 17, (tw - 6) * frac, 30, 6); c.fill();
    const mm = Math.floor(Game.timeLeft / 60);
    const ss = Math.floor(Game.timeLeft % 60);
    this.text(mm + ':' + String(ss).padStart(2, '0'), tx + tw / 2, 32, 20, '#fff', 'center', '800');

    // Coins + served (right).
    c.fillStyle = '#ffd34d';
    c.beginPath(); c.arc(760, 32, 13, 0, 7); c.fill();
    c.fillStyle = '#8a6d00';
    c.font = '800 15px "Trebuchet MS", Verdana, sans-serif';
    c.textAlign = 'center';
    c.fillText('¢', 760, 33);
    this.text(Game.coins + ' koin', 780, 32, 20, '#fff', 'left', '800');
    this.text('Tersaji: ' + Game.served + '  •  Hangus: ' + Game.missed, 930, 32, 14, '#e8dcc8', 'left', '700');
    if (Game.combo >= 2) {
      c.fillStyle = '#ff8a5c';
      this.rr(1164, 16, 104, 32, 8); c.fill();
      this.text('KOMBO x' + Game.combo, 1216, 33, 16, '#fff', 'center', '800');
    }
  },

  drawOrders() {
    const c = this.ctx;
    const shake = Game.boardShake || 0;
    const ox = shake ? (Math.random() - 0.5) * shake : 0;
    this.text('PAPAN PESANAN', 16, 84, 13, '#ffd34d', 'left', '800');
    if (!Game.orders.length) {
      c.fillStyle = 'rgba(255,255,255,0.55)';
      c.font = '600 14px "Trebuchet MS", Verdana, sans-serif';
      c.textAlign = 'left';
      c.fillText('Belum ada pesanan — siapkan dapurmu!', 150, 108);
    }
    Game.orders.forEach((o, i) => {
      const x = 16 + ox + i * 218;
      const y = 92;
      const frac = Math.max(0, o.patience / o.maxPatience);
      c.fillStyle = '#fff8ec';
      this.rr(x, y, 208, 52, 8); c.fill();
      c.strokeStyle = frac < 0.3 ? '#e23b2e' : '#c9b18c';
      c.lineWidth = frac < 0.3 ? 3 : 2;
      c.stroke();
      this.text(o.name, x + 10, y + 13, 13, '#3d2b1f', 'left', '800');
      this.text(o.reward + '¢', x + 198, y + 13, 13, '#8a6d00', 'right', '800');
      o.items.forEach((it, j) => this.drawIngredient(it, x + 22 + j * 30, y + 33, 24));
      c.fillStyle = '#ddd';
      c.fillRect(x + 10, y + 46, 188, 4);
      c.fillStyle = frac > 0.5 ? '#7cc24e' : frac > 0.25 ? '#f2a93b' : '#e23b2e';
      c.fillRect(x + 10, y + 46, 188 * frac, 4);
    });
  },

  drawPrompt() {
    const st = World.nearestStation();
    if (!st || Game.screen !== 'playing') return;
    const ch = World.chef;
    const c = this.ctx;
    const label = st.kind === 'crate' ? ITEMS[st.item].name
      : st.kind === 'board' ? (World.board ? 'Potong (tahan E)' : 'Taruh bahan')
      : st.kind === 'grill' ? 'Panggangan'
      : st.kind === 'fryer' ? 'Penggorengan'
      : st.kind === 'plates' ? 'Ambil piring'
      : st.kind === 'counter' ? 'Meja Rakit'
      : st.kind === 'window' ? 'Sajikan!'
      : st.kind === 'trash' ? 'Buang'
      : st.label;
    c.fillStyle = 'rgba(20,12,6,0.85)';
    const w = 30 + label.length * 8;
    this.rr(ch.x - w / 2, ch.y - 78, w, 26, 8); c.fill();
    this.text('E — ' + label, ch.x, ch.y - 64, 13, '#ffd34d', 'center', '700');
  },

  drawParticles() {
    const c = this.ctx;
    for (const p of Game.particles) {
      c.globalAlpha = Math.max(0, p.life / p.max);
      c.fillStyle = p.color;
      c.beginPath(); c.arc(p.x, p.y, p.size, 0, 7); c.fill();
    }
    c.globalAlpha = 1;
    for (const f of Game.floats) {
      c.globalAlpha = Math.min(1, f.life / f.max);
      this.text(f.text, f.x, f.y, 20, f.color, 'center', '800');
    }
    c.globalAlpha = 1;
  },

  drawMessage() {
    if (Game.messageTimer <= 0 || !Game.message) return;
    const c = this.ctx;
    c.fillStyle = 'rgba(20,12,6,0.8)';
    const w = 40 + Game.message.length * 8.5;
    this.rr(CFG.canvasW / 2 - w / 2, CFG.canvasH - 46, w, 32, 8); c.fill();
    this.text(Game.message, CFG.canvasW / 2, CFG.canvasH - 29, 15, '#fff', 'center', '700');
  },

  // ---- screens --------------------------------------------------------------
  drawTitle() {
    const c = this.ctx;
    c.fillStyle = 'rgba(20,12,6,0.72)';
    c.fillRect(0, 0, CFG.canvasW, CFG.canvasH);
    this.text('DAPUR KILAT', 640, 190, 84, '#ffd34d', 'center', '800');
    this.text('Game masak seru: pesan, potong, panggang, sajikan!', 640, 250, 24, '#fff', 'center', '700');
    const lines = [
      'Gerak: WASD / Panah  •  Interaksi: E / Spasi / Klik  •  Tahan E untuk memotong',
      'Ambil bahan dari peti → olah di talenan / panggangan / penggorengan',
      'Rakit di piring → sajikan di Jendela Saji sebelum pelanggan pergi!',
      'Sajikan cepat untuk tip + kombo. Shift 2,5 menit — berapa koin bisa kau raih?',
    ];
    lines.forEach((l, i) => this.text(l, 640, 310 + i * 30, 17, '#e8dcc8', 'center', '600'));
    const pulse = 0.7 + Math.sin(performance.now() / 300) * 0.3;
    c.globalAlpha = pulse;
    this.text('TEKAN ENTER ATAU KLIK UNTUK MULAI', 640, 480, 26, '#ffd34d', 'center', '800');
    c.globalAlpha = 1;
    this.text('M = suara  •  P = jeda  •  R = ulang', 640, 530, 14, '#b9a98f', 'center', '600');
  },

  drawPaused() {
    const c = this.ctx;
    c.fillStyle = 'rgba(20,12,6,0.7)';
    c.fillRect(0, 0, CFG.canvasW, CFG.canvasH);
    this.text('JEDA', 640, 330, 64, '#ffd34d', 'center', '800');
    this.text('Tekan P untuk lanjut  •  R untuk mulai ulang', 640, 390, 20, '#fff', 'center', '700');
  },

  drawShiftEnd() {
    const c = this.ctx;
    c.fillStyle = 'rgba(20,12,6,0.78)';
    c.fillRect(0, 0, CFG.canvasW, CFG.canvasH);
    c.fillStyle = '#fff8ec';
    this.rr(390, 130, 500, 430, 16); c.fill();
    c.strokeStyle = '#ffd34d'; c.lineWidth = 4; c.stroke();
    this.text('SHIFT SELESAI!', 640, 180, 40, '#3d2b1f', 'center', '800');
    this.text('Nilai: ' + Game.grade, 640, 240, 52, '#e23b2e', 'center', '800');
    const rows = [
      ['Koin diraih', Game.coins + ' koin'],
      ['Pesanan tersaji', String(Game.served)],
      ['Pesanan hangus', String(Game.missed)],
      ['Kombo terbaik', 'x' + Math.max(1, Game.bestCombo)],
    ];
    rows.forEach((r, i) => {
      this.text(r[0], 450, 300 + i * 36, 19, '#5b4632', 'left', '700');
      this.text(r[1], 830, 300 + i * 36, 19, '#3d2b1f', 'right', '800');
    });
    this.text('Tekan R untuk shift berikutnya', 640, 480, 20, '#8a6d00', 'center', '800');
    this.text('Dapur Kilat — terima kasih sudah memasak!', 640, 520, 14, '#b9a98f', 'center', '600');
  },

  draw() {
    const c = this.ctx;
    c.clearRect(0, 0, CFG.canvasW, CFG.canvasH);
    if (Game.screen === 'title') {
      this.drawKitchen();
      this.drawChef();
      this.drawHUD();
      this.drawTitle();
      return;
    }
    this.drawKitchen();
    this.drawChef();
    this.drawParticles();
    this.drawHUD();
    this.drawOrders();
    this.drawPrompt();
    this.drawMessage();
    if (Game.screen === 'paused') this.drawPaused();
    if (Game.screen === 'shiftend') this.drawShiftEnd();
  },
};
