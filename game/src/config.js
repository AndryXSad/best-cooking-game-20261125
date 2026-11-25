// config.js — Dapur Kilat: all tuning, recipes and the kitchen layout.
// One clear job: constants only. No logic lives here.

const CFG = {
  canvasW: 1280,
  canvasH: 720,
  shiftSeconds: 150,
  chefSpeed: 270,
  chefRadius: 22,
  interactRange: 100,
  chopSeconds: 1.6,
  grillSeconds: 6,
  grillBurnSeconds: 4,
  fryerSeconds: 8,
  maxOrders: 4,
  orderPatience: 42,
  friesPatience: 26,
  comboWindow: 10,
  maxComboMult: 2.0,
};

// Floor bounds the chef can walk in (below the HUD + order board).
const FLOOR = { x: 8, y: 152, w: 1264, h: 560 };

// Item catalogue. `prep` says what a raw item must go through before it
// can go on a plate: 'chop', 'grill', 'fry' or 'none'.
const ITEMS = {
  bun:        { name: 'Roti',        prep: 'none',  color: '#e8a85c', dark: '#b97e2e' },
  patty_raw:  { name: 'Daging Mentah', prep: 'grill', color: '#d96a7a', dark: '#a03d4c' },
  patty:      { name: 'Daging Panggang', prep: 'done', color: '#7a4a28', dark: '#54301a' },
  patty_burnt:{ name: 'Daging Gosong', prep: 'done', color: '#2b2b2b', dark: '#111111' },
  tomato_raw: { name: 'Tomat',       prep: 'chop',  color: '#e23b2e', dark: '#a01f16' },
  tomato:     { name: 'Tomat Potong', prep: 'done', color: '#f0564a', dark: '#c22e22' },
  lettuce_raw:{ name: 'Selada',      prep: 'chop',  color: '#5da53a', dark: '#3c7424' },
  lettuce:    { name: 'Selada Potong', prep: 'done', color: '#7cc24e', dark: '#4d8a2c' },
  cheese:     { name: 'Keju',        prep: 'none',  color: '#f7c948', dark: '#d9a41f' },
  onion_raw:  { name: 'Bawang',      prep: 'chop',  color: '#efe3d0', dark: '#c9b18c' },
  onion:      { name: 'Bawang Potong', prep: 'done', color: '#f6ead2', dark: '#c9b18c' },
  potato_raw: { name: 'Kentang',     prep: 'fry',   color: '#d9b06a', dark: '#a67c33' },
  fries:      { name: 'Kentang Goreng', prep: 'done', color: '#f2c14e', dark: '#d99e22' },
  plate:      { name: 'Piring',      prep: 'none',  color: '#f4f6f8', dark: '#b9c2cc' },
};


// Recipes: the multiset of items a plate must hold to satisfy the order.
const RECIPES = {
  klasik:  { name: 'Burger Klasik',  items: ['bun', 'patty', 'lettuce'],            reward: 18, minTime: 0 },
  kentang: { name: 'Kentang Goreng', items: ['fries'],                               reward: 10, minTime: 0 },
  keju:    { name: 'Burger Keju',    items: ['bun', 'patty', 'cheese', 'tomato'],    reward: 24, minTime: 25 },
  dobel:   { name: 'Burger Dobel',   items: ['bun', 'patty', 'patty', 'cheese'],     reward: 32, minTime: 55 },
  spesial: { name: 'Burger Spesial', items: ['bun', 'patty', 'cheese', 'tomato', 'onion'], reward: 30, minTime: 80 },
};
const RECIPE_KEYS = Object.keys(RECIPES);

// Kitchen stations. Each is an obstacle the chef walks around plus an
// interaction point. `kind` drives the logic in game.js.
const STATIONS = [
  { id: 'crate_bun',     kind: 'crate', item: 'bun',        x: 16,  y: 170, w: 88, h: 56, label: 'Roti' },
  { id: 'crate_patty',   kind: 'crate', item: 'patty_raw',  x: 112, y: 170, w: 88, h: 56, label: 'Daging' },
  { id: 'crate_tomato',  kind: 'crate', item: 'tomato_raw', x: 16,  y: 246, w: 88, h: 56, label: 'Tomat' },
  { id: 'crate_lettuce', kind: 'crate', item: 'lettuce_raw',x: 112, y: 246, w: 88, h: 56, label: 'Selada' },
  { id: 'crate_cheese',  kind: 'crate', item: 'cheese',     x: 16,  y: 322, w: 88, h: 56, label: 'Keju' },
  { id: 'crate_onion',   kind: 'crate', item: 'onion_raw',  x: 112, y: 322, w: 88, h: 56, label: 'Bawang' },
  { id: 'crate_potato',  kind: 'crate', item: 'potato_raw', x: 16,  y: 398, w: 88, h: 56, label: 'Kentang' },
  { id: 'board',         kind: 'board',  x: 260, y: 180, w: 180, h: 84, label: 'Talenan' },
  { id: 'grill',         kind: 'grill',  x: 480, y: 180, w: 220, h: 84, label: 'Panggangan' },
  { id: 'fryer',         kind: 'fryer',  x: 740, y: 180, w: 120, h: 84, label: 'Penggorengan' },
  { id: 'plates',        kind: 'plates', x: 900, y: 180, w: 96,  h: 84, label: 'Piring' },
  { id: 'counter',       kind: 'counter',x: 260, y: 500, w: 600, h: 110, label: 'Meja Rakit' },
  { id: 'window',        kind: 'window', x: 1060,y: 180, w: 204, h: 160, label: 'Jendela Saji' },
  { id: 'trash',         kind: 'trash',  x: 1060,y: 500, w: 110, h: 84, label: 'Sampah' },
];

function stationById(id) {
  for (const s of STATIONS) if (s.id === id) return s;
  return null;
}
function stationCenter(s) {
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}
