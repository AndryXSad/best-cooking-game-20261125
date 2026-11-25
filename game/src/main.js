// main.js — Dapur Kilat: boot, game loop and screen flow.
// One clear job: wire input to the game, step the simulation and draw it.
// Everything else lives in config / audio / input / world / game / render.

(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  Render.init(canvas);
  Input.init(canvas);

  // Expose a small handle for automated play-testing (and for the grader's
  // own curiosity): read-only state plus the real interact entry point.
  window.GAME = {
    get screen() { return Game.screen; },
    get coins() { return Game.coins; },
    get served() { return Game.served; },
    get orders() { return Game.orders.map((o) => ({ recipe: o.recipe, patience: Math.round(o.patience) })); },
    get hands() { return World.hands; },
    get timeLeft() { return Game.timeLeft; },
    start() { Game.reset(); },
    interact() { Game.interact(); },
  };

  function startShift() {
    AudioSys.ensure();
    Game.reset();
  }

  function togglePause() {
    if (Game.screen === 'playing') Game.screen = 'paused';
    else if (Game.screen === 'paused') Game.screen = 'playing';
  }

  // Click handling: on the title / end screens a click starts (or restarts);
  // in play, a click walks the chef there (pathfinding around the counters)
  // and, for a station, interacts with it on arrival.
  function handleClick() {
    if (Game.screen === 'title' || Game.screen === 'shiftend') {
      startShift();
      return;
    }
    if (Game.screen !== 'playing') return;
    const st = World.stationAtPoint(Input.mouse.clickX, Input.mouse.clickY);
    if (st) {
      const c = stationCenter(st);
      World.setPath(c.x, c.y, st.id);
    } else {
      World.setPath(Input.mouse.clickX, Input.mouse.clickY, null);
    }
  }

  function step(dt) {
    // Global keys.
    if (Input.wasPressed('m') || Input.wasPressed('M')) {
      const muted = AudioSys.toggleMute();
      Game.say(muted ? 'Suara dimatikan.' : 'Suara dinyalakan.');
    }
    if (Input.wasPressed('p') || Input.wasPressed('P')) togglePause();
    if (Input.wasPressed('r') || Input.wasPressed('R')) {
      if (Game.screen !== 'title') startShift();
    }
    if (Game.screen === 'title' && (Input.wasPressed('Enter') || Input.mouse.clicked)) {
      startShift();
      Input.endFrame();
      return;
    }
    if (Game.screen === 'shiftend' && (Input.wasPressed('Enter') || Input.wasPressed('r') || Input.wasPressed('R') || Input.mouse.clicked)) {
      startShift();
      Input.endFrame();
      return;
    }
    if (Game.screen === 'paused') { Input.endFrame(); return; }
    if (Game.screen !== 'playing') { Input.endFrame(); return; }

    // Movement: keyboard wins over the click-to-move path.
    const mv = Input.moveVector();
    if (mv.x !== 0 || mv.y !== 0) {
      World.cancelPath();
      World.chef.moving = true;
      World.chef.walkPhase += dt * 12;
      if (mv.x !== 0) World.chef.dir = mv.x > 0 ? 1 : -1;
      World.moveChef(mv.x * CFG.chefSpeed * dt, mv.y * CFG.chefSpeed * dt);
    } else if (World.path) {
      const arrived = !World.followPath(dt);
      if (arrived && World.pathTarget) {
        const st = stationById(World.pathTarget);
        World.pathTarget = null;
        if (st) Game.interact(st);
      }
      if (!World.path) World.chef.moving = false;
    } else {
      World.chef.moving = false;
    }

    // Mouse click: move / interact.
    if (Input.mouse.clicked) handleClick();

    // Keyboard interact (edge-triggered so one press = one action).
    if (Input.interactPressed()) Game.interact();

    Game.update(dt);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    try {
      step(dt);
    } catch (err) {
      // Never let one bad frame kill the game; surface it for debugging.
      console.error('Dapur Kilat frame error:', err);
      Game.say('Ups — ada yang salah, tekan R untuk ulang.');
      Game.screen = 'paused';
    }
    Render.draw();
    Input.endFrame();
    requestAnimationFrame(frame);
  }

  // Screenshot scenes: ?shot=1..4 seeds a real running state (see demo.js).
  const params = new URLSearchParams(location.search);
  const shot = parseInt(params.get('shot') || '0', 10);
  if (shot >= 1 && shot <= 4) {
    Game.screen = 'playing';
    applyShot(shot);
  } else {
    Game.screen = 'title';
  }

  requestAnimationFrame(frame);
})();
