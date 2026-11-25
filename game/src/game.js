// game.js — Dapur Kilat: the rules of the shift.
// One clear job: orders, cooking timers, serving, scoring, particles.
// Rendering lives in render.js; the kitchen lives in world.js.

const Game = {
  screen: 'title', // title | playing | paused | shiftend
  time: 0,         // seconds since the shift started
  timeLeft: CFG.shiftSeconds,
  coins: 0,
  served: 0,
  missed: 0,
  combo: 0,
  comboTimer: 0,
  bestCombo: 0,
  orders: [],
  nextOrderIn: 2,
  orderSeq: 0,
  message: '',
  messageTimer: 0,
  particles: [],
  floats: [],
  chopping: false,
  chopSfxTimer: 0,
  sizzleTimer: 0,
  lastTickSecond: -1,
  grade: '',

  reset() {
    World.reset();
    this.screen = 'playing';
    this.time = 0;
    this.timeLeft = CFG.shiftSeconds;
    this.coins = 0;
    this.served = 0;
    this.missed = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.bestCombo = 0;
    this.orders = [];
    this.nextOrderIn = 2;
    this.orderSeq = 0;
    this.message = '';
    this.messageTimer = 0;
    this.particles = [];
    this.floats = [];
    this.chopping = false;
    this.lastTickSecond = -1;
    this.grade = '';
  },

  // ---- orders -----------------------------------------------------------
  availableRecipes() {
    return RECIPE_KEYS.filter((k) => RECIPES[k].minTime <= this.time);
  },
  spawnOrder() {
    const pool = this.availableRecipes();
    const key = pool[Math.floor(Math.random() * pool.length)];
    const rec = RECIPES[key];
    const patience = key === 'kentang' ? CFG.friesPatience : CFG.orderPatience;
    this.orders.push({
      id: ++this.orderSeq,
      recipe: key,
      name: rec.name,
      items: rec.items.slice(),
      reward: rec.reward,
      patience,
      maxPatience: patience,
      born: this.time,
    });
    AudioSys.orderIn();
    this.burst(60, 92, '#ffd34d', 6);
  },

  orderInterval() {
    // Orders arrive faster as the shift goes on.
    return Math.max(8, 15 - this.time / 18);
  },

  plateMatches(order, plate) {
    if (!isPlate(plate)) return false;
    const want = order.items.slice().sort();
    const got = plate.contents.slice().sort();
    if (want.length !== got.length) return false;
    for (let i = 0; i < want.length; i++) if (want[i] !== got[i]) return false;
    return true;
  },

  serveAtWindow() {
    const hands = World.hands;
    if (!isPlate(hands) || hands.contents.length === 0) {
      this.say('Piring kosong — rakit dulu hidangannya!');
      AudioSys.reject();
      return;
    }
    const idx = this.orders.findIndex((o) => this.plateMatches(o, hands));
    if (idx < 0) {
      this.say('Tidak ada pesanan yang cocok!');
      AudioSys.reject();
      this.shakeOrderBoard();
      return;
    }
    const order = this.orders[idx];
    this.orders.splice(idx, 1);
    const patienceFrac = Math.max(0, order.patience / order.maxPatience);
    const tip = Math.round(order.reward * 0.5 * patienceFrac);
    // Combo: serving again within the window keeps the streak alive.
    if (this.comboTimer > 0) this.combo += 1; else this.combo = 1;
    this.comboTimer = CFG.comboWindow;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const mult = Math.min(CFG.maxComboMult, 1 + 0.1 * (this.combo - 1));
    const earned = Math.round((order.reward + tip) * mult);
    this.coins += earned;
    this.served += 1;
    World.hands = null;
    AudioSys.ding();
    AudioSys.coin();
    const w = stationById('window');
    this.burst(w.x + w.w / 2, w.y + 40, '#ffd34d', 18);
    this.burst(w.x + w.w / 2, w.y + 40, '#7cc24e', 10);
    this.addFloat(w.x + w.w / 2, w.y - 6, '+' + earned + ' koin', '#ffd34d');
    if (this.combo >= 2) this.addFloat(w.x + w.w / 2, w.y + 58, 'KOMBO x' + this.combo + '!', '#ff8a5c');
    this.say(order.name + ' tersaji! +' + earned + ' koin');
  },

  // ---- interaction ------------------------------------------------------
  // Pressed E / Space / click while near a station. `st` is the station the
  // player aimed at (click-to-move arrival); without it, the nearest one.
  interact(st) {
    const station = st || World.nearestStation();
    if (!station) return;
    const hands = World.hands;
    switch (station.kind) {
      case 'crate': this.interactCrate(station); break;
      case 'board': this.interactBoard(); break;
      case 'grill': this.interactGrill(); break;
      case 'fryer': this.interactFryer(); break;
      case 'plates':
        if (!hands) { World.hands = makePlate(); AudioSys.pickup(); }
        else this.say('Tangan sudah penuh!');
        break;
      case 'counter': this.interactCounter(); break;
      case 'window': this.serveAtWindow(); break;
      case 'trash':
        if (hands) {
          if (isPlate(hands)) { hands.contents = []; this.say('Piring dikosongkan.'); }
          else { World.hands = null; this.say('Dibuang.'); }
          AudioSys.putdown();
        }
        break;
    }
  },

  interactCrate(st) {
    const hands = World.hands;
    if (isPlate(hands)) {
      // Add a no-prep ingredient straight onto the plate.
      if (plateReadyItem(st.item)) {
        if (hands.contents.includes(st.item) && st.item !== 'patty') {
          // Most items appear once per recipe; doubles are only patties.
          this.say('Sudah ada ' + ITEMS[st.item].name + ' di piring.');
          AudioSys.reject();
          return;
        }
        hands.contents.push(st.item);
        AudioSys.putdown();
        this.say(ITEMS[st.item].name + ' ditambahkan ke piring.');
      } else {
        this.say(ITEMS[st.item].name + ' harus diolah dulu!');
        AudioSys.reject();
      }
      return;
    }
    if (!hands) {
      World.hands = makeItem(st.item);
      AudioSys.pickup();
    } else {
      this.say('Tangan sudah penuh — taruh dulu di Meja Rakit.');
    }
  },

  interactBoard() {
    const hands = World.hands;
    if (World.board) {
      // Pick the chopped result back up when it is done.
      if (World.board.done && !hands) {
        World.hands = makeItem(World.board.item);
        World.board = null;
        AudioSys.pickup();
      } else if (World.board.done && isPlate(hands)) {
        // Drop the chopped item straight onto the held plate.
        if (hands.contents.includes(World.board.item)) {
          this.say('Sudah ada ' + ITEMS[World.board.item].name + ' di piring.');
          AudioSys.reject();
          return;
        }
        hands.contents.push(World.board.item);
        World.board = null;
        AudioSys.putdown();
        this.say(ITEMS[hands.contents[hands.contents.length - 1]].name + ' ditambahkan ke piring.');
      } else if (!World.board.done) {
        this.say('Masih dipotong — tahan E di dekat talenan!');
      } else {
        this.say('Tangan sudah penuh!');
      }
      return;
    }
    if (hands && choppable(hands.type)) {
      World.board = { item: choppedOf(hands.type), progress: 0, done: false };
      World.hands = null;
      AudioSys.putdown();
      this.say('Potong ' + ITEMS[World.board.item].name + ' — tahan E!');
    } else if (hands) {
      this.say('Yang ini tidak bisa dipotong.');
      AudioSys.reject();
    }
  },

  interactGrill() {
    const hands = World.hands;
    const cooked = World.grillCookedSlot();
    if (cooked >= 0 && !hands) {
      const slot = World.grill[cooked];
      World.hands = makeItem(slot.item);
      World.grill[cooked] = null;
      AudioSys.pickup();
      this.say('Daging panggang siap!');
      return;
    }
    if (cooked >= 0 && isPlate(hands)) {
      // Lay the cooked patty straight onto the held plate.
      hands.contents.push('patty');
      World.grill[cooked] = null;
      AudioSys.putdown();
      this.say('Daging panggang ditambahkan ke piring.');
      return;
    }
    const burntIdx = World.grill.findIndex((g) => g && g.item === 'patty_burnt');
    if (burntIdx >= 0 && !hands) {
      World.hands = makeItem('patty_burnt');
      World.grill[burntIdx] = null;
      AudioSys.pickup();
      this.say('Gosong! Buang ke tempat sampah.');
      return;
    }
    if (hands && hands.type === 'patty_raw') {
      const slot = World.grillFreeSlot();
      if (slot >= 0) {
        World.grill[slot] = { item: 'patty_raw', t: 0 };
        World.hands = null;
        AudioSys.sizzle();
        this.say('Daging di panggangan...');
      } else {
        this.say('Panggangan penuh!');
        AudioSys.reject();
      }
      return;
    }
    if (hands) { this.say('Hanya daging mentah yang bisa dipanggang.'); AudioSys.reject(); }
    else this.say('Panggangan kosong — bawa daging mentah.');
  },

  interactFryer() {
    const hands = World.hands;
    if (World.fryer && World.fryer.item === 'fries' && !hands) {
      World.hands = makeItem('fries');
      World.fryer = null;
      AudioSys.pickup();
      this.say('Kentang goreng siap!');
      return;
    }
    if (World.fryer && World.fryer.item === 'fries' && isPlate(hands)) {
      if (hands.contents.includes('fries')) {
        this.say('Sudah ada Kentang Goreng di piring.');
        AudioSys.reject();
        return;
      }
      hands.contents.push('fries');
      World.fryer = null;
      AudioSys.putdown();
      this.say('Kentang Goreng ditambahkan ke piring.');
      return;
    }
    if (hands && hands.type === 'potato_raw') {
      if (!World.fryer) {
        World.fryer = { item: 'potato_raw', t: 0 };
        World.hands = null;
        AudioSys.sizzle();
        this.say('Kentang digoreng...');
      } else { this.say('Penggorengan sedang dipakai!'); AudioSys.reject(); }
      return;
    }
    if (hands) { this.say('Hanya kentang mentah yang bisa digoreng.'); AudioSys.reject(); }
    else this.say('Penggorengan kosong — bawa kentang mentah.');
  },

  interactCounter() {
    const hands = World.hands;
    if (World.counter && !hands) {
      World.hands = World.counter;
      World.counter = null;
      AudioSys.pickup();
    } else if (!World.counter && hands) {
      World.counter = hands;
      World.hands = null;
      AudioSys.putdown();
      this.say('Ditaruh di Meja Rakit.');
    } else if (World.counter && isPlate(World.counter) && hands && !isPlate(hands) && plateReadyItem(hands.type)) {
      // Add a ready item onto the plated dish sitting on the counter.
      if (World.counter.contents.includes(hands.type) && hands.type !== 'patty') {
        this.say('Sudah ada ' + ITEMS[hands.type].name + ' di piring.');
        AudioSys.reject();
        return;
      }
      World.counter.contents.push(hands.type);
      World.hands = null;
      AudioSys.putdown();
      this.say(ITEMS[hands.type].name + ' ditambahkan ke piring.');
    } else if (World.counter) {
      this.say('Meja Rakit sudah terisi.');
    }
  },

  // Holding E near the board chops whatever sits on it.
  updateChopping(dt) {
    const st = World.nearestStation();
    this.chopping = false;
    if (!World.board || World.board.done) return;
    if (!st || st.kind !== 'board') return;
    if (!Input.interactHeld()) return;
    this.chopping = true;
    World.board.progress += dt / CFG.chopSeconds;
    this.chopSfxTimer -= dt;
    if (this.chopSfxTimer <= 0) { AudioSys.chop(); this.chopSfxTimer = 0.28; }
    if (Math.random() < 0.35) this.spawnParticle(st.x + st.w / 2, st.y + 20, '#f6ead2');
    if (World.board.progress >= 1) {
      World.board.progress = 1;
      World.board.done = true;
      AudioSys.chopDone();
      this.say(ITEMS[World.board.item].name + ' selesai dipotong!');
    }
  },

  // ---- per-frame update ---------------------------------------------------
  update(dt) {
    if (this.screen !== 'playing') return;
    this.time += dt;
    this.timeLeft = Math.max(0, CFG.shiftSeconds - this.time);
    const sec = Math.floor(this.timeLeft);
    if (sec !== this.lastTickSecond) {
      this.lastTickSecond = sec;
      if (sec <= 10 && sec > 0) AudioSys.tick();
    }
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    if (this.messageTimer > 0) this.messageTimer -= dt;

    // Orders spawn and age.
    this.nextOrderIn -= dt;
    if (this.nextOrderIn <= 0 && this.orders.length < CFG.maxOrders) {
      this.spawnOrder();
      this.nextOrderIn = this.orderInterval() * (0.85 + Math.random() * 0.3);
    }
    for (let i = this.orders.length - 1; i >= 0; i--) {
      const o = this.orders[i];
      o.patience -= dt;
      if (o.patience <= 0) {
        this.orders.splice(i, 1);
        this.missed += 1;
        this.combo = 0;
        this.comboTimer = 0;
        AudioSys.reject();
        this.say('Pesanan ' + o.name + ' hangus — pelanggan pergi!');
      }
    }

    // Grill timers: raw -> cooked -> burnt.
    for (let i = 0; i < 2; i++) {
      const g = World.grill[i];
      if (!g) continue;
      g.t += dt;
      if (g.item === 'patty_raw' && g.t >= CFG.grillSeconds) {
        g.item = 'patty';
        g.t = 0;
        AudioSys.ding();
        this.say('Daging matang! Angkat sebelum gosong.');
      } else if (g.item === 'patty' && g.t >= CFG.grillBurnSeconds) {
        g.item = 'patty_burnt';
        g.t = 0;
        AudioSys.burnt();
        this.say('Daging gosong!');
      }
    }
    // Fryer timer.
    if (World.fryer) {
      World.fryer.t += dt;
      if (World.fryer.item === 'potato_raw' && World.fryer.t >= CFG.fryerSeconds) {
        World.fryer.item = 'fries';
        AudioSys.ding();
        this.say('Kentang goreng matang!');
      }
    }

    // Sizzle ambience + steam while anything cooks.
    const cooking = World.grill.some(Boolean) || !!World.fryer;
    if (cooking) {
      this.sizzleTimer -= dt;
      if (this.sizzleTimer <= 0) {
        AudioSys.sizzle();
        this.sizzleTimer = 1.4;
        const g = stationById('grill');
        this.spawnSteam(g.x + 60 + Math.random() * 100, g.y + 10);
      }
    }

    this.updateChopping(dt);
    this.updateParticles(dt);
    AudioSys.updateMusic(dt, true);

    if (this.timeLeft <= 0) this.endShift();
  },

  endShift() {
    this.screen = 'shiftend';
    const score = this.coins;
    this.grade = score >= 420 ? 'S' : score >= 320 ? 'A' : score >= 220 ? 'B' : score >= 120 ? 'C' : 'D';
    AudioSys.win();
  },

  // ---- helpers ------------------------------------------------------------
  say(text) {
    this.message = text;
    this.messageTimer = 3;
  },
  shakeOrderBoard() {
    this.boardShake = 6;
  },
  spawnParticle(x, y, color) {
    this.particles.push({ x, y, vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 30, life: 0.7, max: 0.7, color, size: 3 + Math.random() * 3 });
  },
  spawnSteam(x, y) {
    this.particles.push({ x, y, vx: (Math.random() - 0.5) * 12, vy: -46, life: 1.1, max: 1.1, color: 'rgba(255,255,255,0.7)', size: 5 + Math.random() * 4 });
  },
  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 140;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: 0.6 + Math.random() * 0.4, max: 1, color, size: 3 + Math.random() * 4 });
    }
  },
  addFloat(x, y, text, color) {
    this.floats.push({ x, y, text, color, life: 1.4, max: 1.4 });
  },
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 30 * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i];
      f.life -= dt;
      f.y -= 34 * dt;
      if (f.life <= 0) this.floats.splice(i, 1);
    }
    if (this.boardShake) this.boardShake = Math.max(0, this.boardShake - dt * 14);
  },
};
