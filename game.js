(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const startButton = document.getElementById('start-button');
  const pauseButton = document.getElementById('pause-button');
  const scoreNode = document.getElementById('score');
  const bestNode = document.getElementById('best');
  const levelNode = document.getElementById('level');
  const titleNode = document.getElementById('overlay-title');
  const copyNode = document.getElementById('overlay-copy');
  const kickerNode = document.getElementById('overlay-kicker');

  const W = canvas.width;
  const H = canvas.height;
  const keys = new Set();
  const pointer = { active: false, x: W / 2, y: H - 70 };
  let state = 'ready';
  let player;
  let hazards = [];
  let orbs = [];
  let particles = [];
  let score = 0;
  let best = readBest();
  let elapsed = 0;
  let hazardClock = 0;
  let orbClock = 0;
  let lastTime = 0;
  let animationId = 0;

  function readBest() {
    try { return Number(localStorage.getItem('neon-dodge-best')) || 0; }
    catch { return 0; }
  }

  function updateHud() {
    scoreNode.textContent = String(Math.floor(score)).padStart(5, '0');
    bestNode.textContent = String(best).padStart(5, '0');
    levelNode.textContent = String(1 + Math.floor(elapsed / 18)).padStart(2, '0');
  }

  function reset() {
    player = { x: W / 2, y: H - 72, r: 12, speed: 330, invulnerable: 0 };
    hazards = [];
    orbs = [];
    particles = [];
    score = 0;
    elapsed = 0;
    hazardClock = 0.5;
    orbClock = 1.8;
    updateHud();
  }

  function showOverlay(kicker, title, copy, button) {
    kickerNode.textContent = kicker;
    titleNode.textContent = title;
    copyNode.textContent = copy;
    startButton.innerHTML = button + ' <span>→</span>';
    overlay.classList.remove('hidden');
  }

  function start() {
    cancelAnimationFrame(animationId);
    reset();
    state = 'playing';
    overlay.classList.add('hidden');
    pauseButton.disabled = false;
    pauseButton.innerHTML = 'PAUSE <span>Ⅱ</span>';
    lastTime = performance.now();
    animationId = requestAnimationFrame(loop);
  }

  function pause() {
    if (state === 'playing') {
      state = 'paused';
      cancelAnimationFrame(animationId);
      pauseButton.innerHTML = 'RESUME <span>▶</span>';
      showOverlay('RUN PAUSED', 'Catch your breath.', 'Your run is safe. Resume when ready.', 'RESUME');
    } else if (state === 'paused') {
      state = 'playing';
      overlay.classList.add('hidden');
      pauseButton.innerHTML = 'PAUSE <span>Ⅱ</span>';
      lastTime = performance.now();
      animationId = requestAnimationFrame(loop);
    }
  }

  function endGame() {
    state = 'over';
    cancelAnimationFrame(animationId);
    pauseButton.disabled = true;
    const finalScore = Math.floor(score);
    if (finalScore > best) {
      best = finalScore;
      try { localStorage.setItem('neon-dodge-best', String(best)); } catch { /* Storage may be disabled. */ }
    }
    updateHud();
    pauseButton.innerHTML = 'PAUSE <span>Ⅱ</span>';
    showOverlay('RUN COMPLETE', 'Grid defeated you.', 'Score: ' + finalScore + '. Your best: ' + best + '. Try again and last longer.', 'PLAY AGAIN');
  }

  function spawnHazard() {
    const width = 22 + Math.random() * 48;
    const height = 18 + Math.random() * 28;
    hazards.push({
      x: 18 + Math.random() * (W - width - 36),
      y: -height,
      w: width,
      h: height,
      speed: 180 + Math.random() * 95 + Math.min(elapsed * 3, 180),
      spin: (Math.random() - 0.5) * 1.8,
      angle: Math.random() * Math.PI
    });
  }

  function spawnOrb() {
    orbs.push({ x: 24 + Math.random() * (W - 48), y: -20, r: 7, speed: 145 + Math.min(elapsed * 1.8, 100), pulse: Math.random() * 6 });
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 180;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .35 + Math.random() * .45, max: .8, color });
    }
  }

  function movePlayer(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has('arrowleft') || keys.has('a')) dx--;
    if (keys.has('arrowright') || keys.has('d')) dx++;
    if (keys.has('arrowup') || keys.has('w')) dy--;
    if (keys.has('arrowdown') || keys.has('s')) dy++;
    if (dx || dy) {
      const length = Math.hypot(dx, dy) || 1;
      player.x += dx / length * player.speed * dt;
      player.y += dy / length * player.speed * dt;
    } else if (pointer.active) {
      const dxp = pointer.x - player.x;
      const dyp = pointer.y - player.y;
      const distance = Math.hypot(dxp, dyp);
      const step = Math.min(distance, player.speed * 1.35 * dt);
      if (distance > 1) { player.x += dxp / distance * step; player.y += dyp / distance * step; }
    }
    player.x = Math.max(player.r + 5, Math.min(W - player.r - 5, player.x));
    player.y = Math.max(player.r + 5, Math.min(H - player.r - 5, player.y));
  }

  function update(dt) {
    elapsed += dt;
    score += dt * 10;
    const level = 1 + Math.floor(elapsed / 18);
    hazardClock -= dt;
    orbClock -= dt;
    if (hazardClock <= 0) {
      spawnHazard();
      hazardClock = Math.max(.24, .88 - elapsed * .009) * (.72 + Math.random() * .55);
    }
    if (orbClock <= 0) {
      spawnOrb();
      orbClock = 2.1 + Math.random() * 1.7;
    }
    movePlayer(dt);

    for (const h of hazards) {
      h.y += h.speed * dt * (1 + (level - 1) * .05);
      h.angle += h.spin * dt;
      const cx = Math.max(h.x, Math.min(player.x, h.x + h.w));
      const cy = Math.max(h.y, Math.min(player.y, h.y + h.h));
      if (Math.hypot(player.x - cx, player.y - cy) < player.r + 2) {
        burst(player.x, player.y, '#62e6f5', 28);
        endGame();
        return;
      }
    }
    hazards = hazards.filter(h => h.y < H + 80);

    for (const orb of orbs) {
      orb.y += orb.speed * dt;
      orb.pulse += dt * 5;
      if (Math.hypot(player.x - orb.x, player.y - orb.y) < player.r + orb.r + 2) {
        score += 75;
        burst(orb.x, orb.y, '#ffe078', 12);
        orb.collected = true;
      }
    }
    orbs = orbs.filter(o => !o.collected && o.y < H + 30);

    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= .96;
      p.vy *= .96;
      p.life -= dt;
    }
    particles = particles.filter(p => p.life > 0);
    updateHud();
  }

  function drawBackground() {
    ctx.fillStyle = '#090f1c';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(95,126,167,.10)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    const gradient = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 500);
    gradient.addColorStop(0, 'rgba(24,53,83,.12)');
    gradient.addColorStop(1, 'rgba(4,8,16,.55)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  function drawPlayer() {
    if (!player) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#62e6f5';
    ctx.fillStyle = '#62e6f5';
    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.lineTo(12, 12);
    ctx.lineTo(0, 7);
    ctx.lineTo(-12, 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e9fcff';
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function draw() {
    drawBackground();
    for (const h of hazards) {
      ctx.save();
      ctx.translate(h.x + h.w / 2, h.y + h.h / 2);
      ctx.rotate(h.angle);
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff5478';
      ctx.fillStyle = '#ff5478';
      ctx.fillRect(-h.w / 2, -h.h / 2, h.w, h.h);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffc0cd';
      ctx.globalAlpha = .55;
      ctx.strokeRect(-h.w / 2, -h.h / 2, h.w, h.h);
      ctx.restore();
    }
    for (const o of orbs) {
      const radius = o.r + Math.sin(o.pulse) * 1.5;
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffe078';
      ctx.fillStyle = '#ffe078';
      ctx.beginPath(); ctx.arc(o.x, o.y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;
    drawPlayer();
  }

  function loop(now) {
    if (state !== 'playing') return;
    const dt = Math.min((now - lastTime) / 1000, .033);
    lastTime = now;
    update(dt);
    draw();
    if (state === 'playing') animationId = requestAnimationFrame(loop);
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width * W;
    pointer.y = (event.clientY - rect.top) / rect.height * H;
  }

  canvas.addEventListener('pointerdown', event => {
    pointer.active = true;
    pointerPosition(event);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => { if (pointer.active) pointerPosition(event); });
  canvas.addEventListener('pointerup', () => { pointer.active = false; });
  canvas.addEventListener('pointercancel', () => { pointer.active = false; });

  window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    keys.add(key);
    if (key === 'escape' || key === 'p') pause();
    if (key === 'enter' && (state === 'ready' || state === 'over')) start();
  });
  window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => { keys.clear(); if (state === 'playing') pause(); });
  startButton.addEventListener('click', () => state === 'paused' ? pause() : start());
  pauseButton.addEventListener('click', pause);

  bestNode.textContent = String(best).padStart(5, '0');
  drawBackground();
  ctx.fillStyle = 'rgba(98,230,245,.6)';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PRESS START TO ENTER THE GRID', W / 2, H / 2);
})();