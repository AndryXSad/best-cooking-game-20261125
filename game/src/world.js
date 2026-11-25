// world.js — Dapur Kilat: the kitchen itself.
// One clear job: the chef, the station contents (grill slots, fryer, board,
// counter) and movement/collision. No scoring or orders here.

const World = {
  chef: { x: 640, y: 400, dir: 1, moving: false, walkPhase: 0 },
  // Grill: two slots, each {item, t} where t counts seconds on the grill.
  grill: [null, null],
  // Fryer: one slot {item, t}.
  fryer: null,
  // Chopping board: {item, progress} while an item sits on it.
  board: null,
  // Assembly counter: one held thing (a plate or a loose item) or null.
  counter: null,
  // What the chef carries: null, {type} or {type:'plate', contents:[...]}.
  hands: null,

  reset() {
    this.chef = { x: 640, y: 400, dir: 1, moving: false, walkPhase: 0 };
    this.grill = [null, null];
    this.fryer = null;
    this.board = null;
    this.counter = null;
    this.hands = null;
  },

  // Move the chef with simple AABB push-out against station rects and walls.
  moveChef(dx, dy) {
    const c = this.chef;
    c.x += dx;
    c.y += dy;
    c.x = Math.max(FLOOR.x + CFG.chefRadius, Math.min(FLOOR.x + FLOOR.w - CFG.chefRadius, c.x));
    c.y = Math.max(FLOOR.y + CFG.chefRadius, Math.min(FLOOR.y + FLOOR.h - CFG.chefRadius, c.y));
    for (const s of STATIONS) {
      const r = CFG.chefRadius - 2;
      const nx = Math.max(s.x, Math.min(c.x, s.x + s.w));
      const ny = Math.max(s.y, Math.min(c.y, s.y + s.h));
      const ddx = c.x - nx, ddy = c.y - ny;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 < r * r) {
        if (d2 === 0) { c.y = s.y - r; continue; }
        const d = Math.sqrt(d2);
        c.x = nx + (ddx / d) * r;
        c.y = ny + (ddy / d) * r;
      }
    }
  },

  nearestStation() {
    let best = null, bestD = Infinity;
    for (const s of STATIONS) {
      const c = stationCenter(s);
      const dx = this.chef.x - c.x, dy = this.chef.y - c.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestD) { bestD = d; best = s; }
    }
    return bestD <= CFG.interactRange + Math.max(best.w, best.h) / 2 ? best : null;
  },

  stationAtPoint(x, y) {
    for (const s of STATIONS) {
      if (x >= s.x - 6 && x <= s.x + s.w + 6 && y >= s.y - 6 && y <= s.y + s.h + 6) return s;
    }
    return null;
  },

  // Grill helpers.
  grillFreeSlot() {
    for (let i = 0; i < 2; i++) if (!this.grill[i]) return i;
    return -1;
  },
  grillCookedSlot() {
    for (let i = 0; i < 2; i++) {
      const g = this.grill[i];
      if (g && g.item === 'patty' && g.t <= CFG.grillSeconds + CFG.grillBurnSeconds) return i;
    }
    return -1;
  },

  // ---- click-to-move pathfinding -------------------------------------------
  // A small grid BFS over the kitchen floor. Stations (grown by the chef's
  // radius) are walls; everything else is walkable. Returns waypoints from
  // the chef to (tx, ty), or null when the target cannot be reached.
  path: null,          // [{x, y}, ...] waypoints the chef is following
  pathTarget: null,    // station id to interact with on arrival, or null

  _cellBlocked(cx, cy) {
    const x = cx * 32 + 16, y = cy * 32 + 16;
    if (x < FLOOR.x + 16 || x > FLOOR.x + FLOOR.w - 16) return true;
    if (y < FLOOR.y + 16 || y > FLOOR.y + FLOOR.h - 16) return true;
    for (const s of STATIONS) {
      if (x >= s.x - 26 && x <= s.x + s.w + 26 && y >= s.y - 26 && y <= s.y + s.h + 26) return true;
    }
    return false;
  },

  _nearestWalkable(cx, cy) {
    // Spiral out from (cx, cy) until a walkable cell is found.
    for (let r = 0; r < 12; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = cx + dx, y = cy + dy;
          if (x < 0 || y < 0 || x >= 40 || y >= 23) continue;
          if (!this._cellBlocked(x, y)) return { x, y };
        }
      }
    }
    return null;
  },

  findPath(tx, ty) {
    // BFS from the chef over every reachable cell, then take the reachable
    // cell closest to the target. (The geometrically nearest walkable cell
    // can sit in a pocket the chef cannot reach, so distance alone is not
    // enough — reachability decides.)
    const cols = 40, rows = 23;
    const start = {
      x: Math.max(0, Math.min(cols - 1, Math.floor(this.chef.x / 32))),
      y: Math.max(0, Math.min(rows - 1, Math.floor(this.chef.y / 32))),
    };
    if (this._cellBlocked(start.x, start.y)) {
      const near = this._nearestWalkable(start.x, start.y);
      if (!near) return null;
      start.x = near.x; start.y = near.y;
    }
    const key = (x, y) => y * cols + x;
    const dist2 = (c) => {
      const cx = c.x * 32 + 16, cy = c.y * 32 + 16;
      return (cx - tx) * (cx - tx) + (cy - ty) * (cy - ty);
    };
    const prev = new Map();
    const seen = new Set([key(start.x, start.y)]);
    const queue = [start];
    let best = start, bestD = dist2(start);
    while (queue.length) {
      const cur = queue.shift();
      const d = dist2(cur);
      if (d < bestD) { bestD = d; best = cur; }
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of dirs) {
        const nx = cur.x + dx, ny = cur.y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        if (seen.has(key(nx, ny)) || this._cellBlocked(nx, ny)) continue;
        seen.add(key(nx, ny));
        prev.set(key(nx, ny), cur);
        queue.push({ x: nx, y: ny });
      }
    }
    // Reconstruct the route to the best reachable cell.
    const cells = [];
    let cur = best;
    while (cur) {
      cells.unshift(cur);
      cur = prev.get(key(cur.x, cur.y));
    }
    // Waypoints: cell centres, dropping cells that lie on a straight line.
    const pts = cells.map((c) => ({ x: c.x * 32 + 16, y: c.y * 32 + 16 }));
    const smooth = [];
    for (let i = 0; i < pts.length; i++) {
      if (i > 0 && i < pts.length - 1) {
        const a = pts[i - 1], b = pts[i], d = pts[i + 1];
        if ((b.x - a.x) * (d.y - b.y) === (b.y - a.y) * (d.x - b.x)) continue;
      }
      smooth.push(pts[i]);
    }
    return smooth;
  },

  setPath(tx, ty, interactStationId) {
    const pts = this.findPath(tx, ty);
    if (!pts) { this.path = null; this.pathTarget = null; return false; }
    this.path = pts;
    this.pathTarget = interactStationId || null;
    return true;
  },

  // Step the chef along the current path. Returns true while walking.
  followPath(dt) {
    if (!this.path || !this.path.length) return false;
    const target = this.path[0];
    const dx = target.x - this.chef.x, dy = target.y - this.chef.y;
    const d = Math.hypot(dx, dy);
    if (d < 8) {
      this.path.shift();
      if (!this.path.length) {
        this.path = null;
        return false;
      }
      return true;
    }
    const step = CFG.chefSpeed * dt;
    this.chef.dir = dx !== 0 ? (dx > 0 ? 1 : -1) : this.chef.dir;
    this.chef.moving = true;
    this.chef.walkPhase += dt * 12;
    this.moveChef((dx / d) * step, (dy / d) * step);
    return true;
  },

  cancelPath() {
    this.path = null;
    this.pathTarget = null;
  },
};

// A held thing is always one of:
//   null
//   { type: 'bun' | 'patty' | ... }          a loose item
//   { type: 'plate', contents: ['bun', ...] } a plate with items on it
function makeItem(type) { return { type }; }
function makePlate() { return { type: 'plate', contents: [] }; }
function isPlate(thing) { return thing && thing.type === 'plate'; }
function itemName(thing) {
  if (!thing) return '';
  if (isPlate(thing)) return thing.contents.length ? 'Piring (' + thing.contents.length + ' isi)' : 'Piring kosong';
  return ITEMS[thing.type].name;
}
// A loose item can go straight onto a plate when it needs no more prep.
function plateReadyItem(type) {
  return ITEMS[type].prep === 'done' || ITEMS[type].prep === 'none';
}
function choppedOf(rawType) {
  return { tomato_raw: 'tomato', lettuce_raw: 'lettuce', onion_raw: 'onion' }[rawType] || null;
}
function choppable(type) { return !!choppedOf(type); }
