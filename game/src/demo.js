// demo.js — Dapur Kilat: preset scenes for the maker's screenshots.
// One clear job: put a real, running game into a photogenic state when the
// page is opened with ?shot=1..4. The scenes are built only from the game's
// own state (orders, grill, board, plates, timer) — nothing is faked.

function seedOrder(recipeKey, patienceFrac) {
  const rec = RECIPES[recipeKey];
  const patience = recipeKey === 'kentang' ? CFG.friesPatience : CFG.orderPatience;
  Game.orders.push({
    id: ++Game.orderSeq,
    recipe: recipeKey,
    name: rec.name,
    items: rec.items.slice(),
    reward: rec.reward,
    patience: patience * patienceFrac,
    maxPatience: patience,
    born: Game.time,
  });
}

function plateWith(items) {
  const p = makePlate();
  p.contents = items.slice();
  return p;
}

// Shot 1 (cover): the whole game at a glance — order board full, a patty on
// the grill, a tomato mid-chop, fries done, a dish mid-assembly on the
// counter and a finished plate ready to serve, timer running.
function shotCover() {
  Game.time = 32;
  Game.timeLeft = CFG.shiftSeconds - 32;
  Game.coins = 124;
  Game.combo = 3;
  Game.comboTimer = 6;
  Game.served = 5;
  seedOrder('klasik', 0.8);
  seedOrder('keju', 0.55);
  seedOrder('spesial', 0.3);
  World.grill[0] = { item: 'patty', t: 1.5 };
  World.grill[1] = { item: 'patty_raw', t: 3 };
  World.fryer = { item: 'fries', t: 8 };
  World.board = { item: 'tomato', progress: 0.6, done: false };
  World.counter = plateWith(['bun', 'patty', 'lettuce']);
  World.hands = makeItem('tomato');
  World.chef.x = 560; World.chef.y = 380; World.chef.dir = 1;
  Game.say('Burger Klasik siap — sajikan di Jendela Saji!');
}

// Shot 2: chopping in action — the chef at the board, knife work half done.
function shotChopping() {
  Game.time = 54;
  Game.timeLeft = CFG.shiftSeconds - 54;
  Game.coins = 86;
  Game.combo = 2;
  Game.comboTimer = 4;
  Game.served = 3;
  seedOrder('keju', 0.7);
  seedOrder('klasik', 0.45);
  World.board = { item: 'lettuce', progress: 0.62, done: false };
  World.hands = null;
  World.chef.x = 350; World.chef.y = 300; World.chef.dir = 1;
  Game.chopping = true;
  Game.say('Potong selada — tahan E!');
}

// Shot 3: the grill rush — two patties cooking, one nearly done, a low
// patience ticket flashing red, fries ready in the fryer.
function shotGrillRush() {
  Game.time = 76;
  Game.timeLeft = CFG.shiftSeconds - 76;
  Game.coins = 210;
  Game.combo = 4;
  Game.comboTimer = 7;
  Game.served = 8;
  seedOrder('dobel', 0.22);
  seedOrder('spesial', 0.6);
  seedOrder('kentang', 0.85);
  World.grill[0] = { item: 'patty', t: 1.0 };
  World.grill[1] = { item: 'patty_raw', t: 5.2 };
  World.fryer = { item: 'fries', t: 8 };
  World.counter = plateWith(['bun', 'cheese']);
  World.hands = makePlate();
  World.chef.x = 700; World.chef.y = 320; World.chef.dir = -1;
  Game.say('Daging hampir matang — jangan sampai gosong!');
}

// Shot 4: the serve — a finished plate at the window, coins flying, the
// shift nearly done with a big combo on the line.
function shotServe() {
  Game.time = 118;
  Game.timeLeft = CFG.shiftSeconds - 118;
  Game.coins = 348;
  Game.combo = 5;
  Game.comboTimer = 8;
  Game.served = 13;
  seedOrder('spesial', 0.5);
  seedOrder('klasik', 0.75);
  World.counter = plateWith(['bun', 'patty', 'cheese', 'tomato']);
  World.hands = plateWith(['bun', 'patty', 'lettuce']);
  World.chef.x = 1010; World.chef.y = 300; World.chef.dir = 1;
  Game.burst(1160, 260, '#ffd34d', 14);
  Game.addFloat(1160, 300, '+32 koin', '#ffd34d');
  Game.say('Burger Klasik tersaji! +32 koin');
}

function applyShot(n) {
  Game.reset();
  Game.screen = 'playing';
  Game.nextOrderIn = 999; // keep the seeded scene stable for the photo
  if (n === 1) shotCover();
  else if (n === 2) shotChopping();
  else if (n === 3) shotGrillRush();
  else shotServe();
  Game.timeLeft = CFG.shiftSeconds - Game.time;
}
