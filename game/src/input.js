// input.js — Dapur Kilat: keyboard + mouse state.
// One clear job: remember what the player is pressing and where the mouse is.

const Input = {
  keys: {},
  mouse: { x: 0, y: 0, down: false, clicked: false, clickX: 0, clickY: 0 },
  pressed: {}, // edge-triggered keys, consumed once per frame

  init(canvas) {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!this.keys[e.key]) this.pressed[e.key] = true;
      this.keys[e.key] = true;
      // Also accept WASD in both cases.
      const lower = e.key.toLowerCase();
      if (!this.keys[lower]) this.pressed[lower] = true;
      this.keys[lower] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.keys[e.key.toLowerCase()] = false;
    });
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
      this.mouse.down = true;
      this.mouse.clicked = true;
      this.mouse.clickX = this.mouse.x;
      this.mouse.clickY = this.mouse.y;
    });
    window.addEventListener('mouseup', () => { this.mouse.down = false; });
    window.addEventListener('blur', () => { this.keys = {}; });
  },

  // Movement vector from WASD or arrow keys, normalized.
  moveVector() {
    let x = 0, y = 0;
    if (this.keys['a'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['d'] || this.keys['ArrowRight']) x += 1;
    if (this.keys['w'] || this.keys['ArrowUp']) y -= 1;
    if (this.keys['s'] || this.keys['ArrowDown']) y += 1;
    if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x, y };
  },

  interactHeld() {
    return !!(this.keys['e'] || this.keys[' '] || this.mouse.down);
  },

  // Edge-triggered interact: keyboard only. A mouse click is movement —
  // the chef walks there and interacts on arrival (see main.js) — so a
  // click must never fire an immediate interact with the nearest station.
  interactPressed() {
    return !!(this.pressed['e'] || this.pressed[' ']);
  },

  wasPressed(key) {
    return !!this.pressed[key];
  },

  endFrame() {
    this.pressed = {};
    this.mouse.clicked = false;
  },
};
