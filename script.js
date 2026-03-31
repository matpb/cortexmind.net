// === NEURAL NETWORK CANVAS ===
const neuralCanvas = document.getElementById('neural-canvas');
const ctx = neuralCanvas.getContext('2d');

let width, height;
const nodes = [];
const connections = [];
const memoryParticles = [];
const NODE_COUNT = 60;

function resize() {
  width = neuralCanvas.width = window.innerWidth;
  height = neuralCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Create neural network nodes
class Node {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.radius = Math.random() * 2 + 1;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.01 + Math.random() * 0.02;
    this.activated = false;
    this.activationTime = 0;
  }

  update(time) {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges with padding
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    this.pulsePhase += this.pulseSpeed;

    // Random activation
    if (!this.activated && Math.random() < 0.001) {
      this.activated = true;
      this.activationTime = time;
    }

    if (this.activated && time - this.activationTime > 2000) {
      this.activated = false;
    }
  }

  draw(time) {
    const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5;
    const r = this.radius + pulse * 1.5;

    if (this.activated) {
      const activationProgress = Math.min((time - this.activationTime) / 500, 1);
      const glow = Math.sin(activationProgress * Math.PI) * 20;

      ctx.beginPath();
      ctx.arc(this.x, this.y, r + glow, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110, 231, 183, ${0.05 * (1 - activationProgress)})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, r + 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110, 231, 183, ${0.8})`;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110, 231, 183, ${0.15 + pulse * 0.2})`;
      ctx.fill();
    }
  }
}

// Memory particles — emerge from activated nodes
class MemoryParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -Math.random() * 1.5 - 0.5;
    this.life = 1;
    this.decay = 0.005 + Math.random() * 0.01;
    this.size = Math.random() * 3 + 1;
    this.type = Math.random() > 0.5 ? 'accent' : 'purple';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy *= 0.99;
    this.vx *= 0.99;
    this.life -= this.decay;
  }

  draw() {
    if (this.life <= 0) return;
    const alpha = this.life * 0.6;
    const color = this.type === 'accent'
      ? `rgba(110, 231, 183, ${alpha})`
      : `rgba(167, 139, 250, ${alpha})`;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// Initialize nodes
for (let i = 0; i < NODE_COUNT; i++) {
  nodes.push(new Node());
}

// Draw connections between nearby nodes
function drawConnections(time) {
  const maxDist = 150;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.12;
        const activated = nodes[i].activated || nodes[j].activated;

        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);

        if (activated) {
          ctx.strokeStyle = `rgba(110, 231, 183, ${alpha * 3})`;
          ctx.lineWidth = 1.5;

          // Spawn memory particles along activated connections
          if (Math.random() < 0.02) {
            const mx = (nodes[i].x + nodes[j].x) / 2;
            const my = (nodes[i].y + nodes[j].y) / 2;
            memoryParticles.push(new MemoryParticle(mx, my));
          }
        } else {
          ctx.strokeStyle = `rgba(110, 231, 183, ${alpha})`;
          ctx.lineWidth = 0.5;
        }

        ctx.stroke();
      }
    }
  }
}

// Main animation loop
function animateNeural(time) {
  ctx.clearRect(0, 0, width, height);

  // Update and draw
  nodes.forEach(node => {
    node.update(time);
    node.draw(time);
  });

  drawConnections(time);

  // Update and draw memory particles
  for (let i = memoryParticles.length - 1; i >= 0; i--) {
    memoryParticles[i].update();
    memoryParticles[i].draw();
    if (memoryParticles[i].life <= 0) {
      memoryParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(animateNeural);
}

requestAnimationFrame(animateNeural);


// === CLOCK CANVAS ===
const clockCanvas = document.getElementById('clock-canvas');
const clockCtx = clockCanvas.getContext('2d');
const CW = 200;
const CH = 200;
const centerX = CW / 2;
const centerY = CH / 2;
const clockRadius = 80;

// Each hand is an independent "search agent" with its own speed/direction
class ClockHand {
  constructor(length, maxWidth, color, speedRange) {
    this.angle = Math.random() * Math.PI * 2;
    this.length = length;
    this.maxWidth = maxWidth;
    this.color = color;
    this.speedRange = speedRange;
    this.speed = 0;
    this.targetSpeed = 0;
    this.frozen = false;
    this.freezeUntil = 0;
    this.searchPhase = 'seeking'; // seeking | found | frozen
    this.glowIntensity = 0;
    this.afterglow = 0; // trail effect from last position
    this.prevAngle = this.angle;
  }

  // Called when a memory is emitted — freeze this hand
  triggerFind(time) {
    this.searchPhase = 'found';
    this.freezeUntil = time + 300 + Math.random() * 400; // freeze 300-700ms
    this.glowIntensity = 1;
  }

  // Launch in a new direction after freeze
  launchNewSearch() {
    this.searchPhase = 'seeking';
    // Pick a new random direction and speed
    const dir = Math.random() > 0.35 ? 1 : -1;
    this.targetSpeed = dir * (this.speedRange[0] + Math.random() * (this.speedRange[1] - this.speedRange[0]));
    this.speed = this.targetSpeed * 0.3; // start slower, ramp up
  }

  update(time, dt) {
    this.prevAngle = this.angle;

    if (this.searchPhase === 'found') {
      // Decelerate to frozen
      this.speed *= 0.85;
      if (time > this.freezeUntil) {
        this.searchPhase = 'frozen';
        this.freezeUntil = time + 150 + Math.random() * 250;
        this.speed = 0;
      }
    } else if (this.searchPhase === 'frozen') {
      // Dead stop — the moment of retrieval
      this.speed = 0;
      if (time > this.freezeUntil) {
        this.launchNewSearch();
      }
    } else {
      // Seeking — ramp toward target speed with some jitter
      this.speed += (this.targetSpeed - this.speed) * 0.08;
      // Occasional micro-stutters like it's scanning
      if (Math.random() < 0.03) {
        this.speed *= 0.5;
      }
      // Occasionally change target speed mid-search
      if (Math.random() < 0.008) {
        const dir = Math.random() > 0.3 ? 1 : -1;
        this.targetSpeed = dir * (this.speedRange[0] + Math.random() * (this.speedRange[1] - this.speedRange[0]));
      }
    }

    this.angle += this.speed * dt;
    this.glowIntensity *= 0.95;
    this.afterglow = Math.abs(this.speed) > 0.01 ? Math.min(Math.abs(this.speed) * 3, 0.3) : 0;
  }

  draw() {
    const endX = centerX + Math.cos(this.angle) * this.length;
    const endY = centerY + Math.sin(this.angle) * this.length;

    // Motion trail
    if (this.afterglow > 0.02) {
      clockCtx.beginPath();
      clockCtx.moveTo(centerX, centerY);
      const trailX = centerX + Math.cos(this.prevAngle) * this.length;
      const trailY = centerY + Math.sin(this.prevAngle) * this.length;
      clockCtx.lineTo(trailX, trailY);
      clockCtx.strokeStyle = this.color.replace(/[\d.]+\)$/, `${this.afterglow * 0.3})`);
      clockCtx.lineWidth = this.maxWidth * 0.5;
      clockCtx.lineCap = 'round';
      clockCtx.stroke();
    }

    // Main hand
    const width = this.searchPhase === 'frozen'
      ? this.maxWidth * 1.3 // slightly thicker when frozen (found something)
      : this.maxWidth;

    clockCtx.beginPath();
    clockCtx.moveTo(centerX, centerY);
    clockCtx.lineTo(endX, endY);
    clockCtx.strokeStyle = this.color;
    clockCtx.lineWidth = width;
    clockCtx.lineCap = 'round';
    clockCtx.stroke();

    // Glow at tip when finding
    if (this.glowIntensity > 0.05) {
      clockCtx.beginPath();
      clockCtx.arc(endX, endY, 6 * this.glowIntensity, 0, Math.PI * 2);
      clockCtx.fillStyle = `rgba(110, 231, 183, ${this.glowIntensity * 0.5})`;
      clockCtx.fill();
    }
  }
}

// Three independent hands — different speed ranges for visual variety
const hands = [
  new ClockHand(clockRadius * 0.45, 2.5, 'rgba(110, 231, 183, 0.7)', [0.02, 0.06]),  // hour — slowest
  new ClockHand(clockRadius * 0.65, 1.5, 'rgba(110, 231, 183, 0.5)', [0.04, 0.12]),   // minute — medium
  new ClockHand(clockRadius * 0.75, 0.8, 'rgba(167, 139, 250, 0.6)', [0.08, 0.25]),   // second — fastest
];

// Start them all searching
hands.forEach(h => h.launchNewSearch());

let lastTime = 0;

function drawClock(time) {
  const dt = Math.min((time - lastTime) / 16, 3); // normalize to ~60fps, cap to prevent jumps
  lastTime = time;

  clockCtx.clearRect(0, 0, CW, CH);

  // Outer ring — pulses on memory emission
  const anyFrozen = hands.some(h => h.searchPhase === 'frozen');
  const ringAlpha = anyFrozen ? 0.35 : 0.15 + Math.abs(Math.sin(time * 0.003)) * 0.08;
  clockCtx.beginPath();
  clockCtx.arc(centerX, centerY, clockRadius, 0, Math.PI * 2);
  clockCtx.strokeStyle = `rgba(110, 231, 183, ${ringAlpha})`;
  clockCtx.lineWidth = anyFrozen ? 1.5 : 1;
  clockCtx.stroke();

  // Inner glow ring
  clockCtx.beginPath();
  clockCtx.arc(centerX, centerY, clockRadius - 8, 0, Math.PI * 2);
  clockCtx.strokeStyle = 'rgba(110, 231, 183, 0.08)';
  clockCtx.lineWidth = 0.5;
  clockCtx.stroke();

  // Hour markers
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const inner = clockRadius - 15;
    const outer = clockRadius - 5;
    clockCtx.beginPath();
    clockCtx.moveTo(
      centerX + Math.cos(angle) * inner,
      centerY + Math.sin(angle) * inner
    );
    clockCtx.lineTo(
      centerX + Math.cos(angle) * outer,
      centerY + Math.sin(angle) * outer
    );
    clockCtx.strokeStyle = 'rgba(110, 231, 183, 0.4)';
    clockCtx.lineWidth = i % 3 === 0 ? 2 : 1;
    clockCtx.stroke();
  }

  // Update and draw hands
  hands.forEach(h => {
    h.update(time, dt);
    h.draw();
  });

  // Center dot — glows when any hand is frozen
  const centerGlow = anyFrozen ? 1 : 0.6;
  clockCtx.beginPath();
  clockCtx.arc(centerX, centerY, anyFrozen ? 4 : 3, 0, Math.PI * 2);
  clockCtx.fillStyle = `rgba(110, 231, 183, ${centerGlow})`;
  clockCtx.fill();

  if (anyFrozen) {
    clockCtx.beginPath();
    clockCtx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    clockCtx.fillStyle = 'rgba(110, 231, 183, 0.08)';
    clockCtx.fill();
  }

  // Sweeping arcs
  const sweep1 = (time / 2000) % (Math.PI * 2);
  const sweep2 = -(time / 3500) % (Math.PI * 2);
  clockCtx.beginPath();
  clockCtx.arc(centerX, centerY, clockRadius + 5, sweep1, sweep1 + Math.PI * 0.35);
  clockCtx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
  clockCtx.lineWidth = 2;
  clockCtx.lineCap = 'round';
  clockCtx.stroke();

  clockCtx.beginPath();
  clockCtx.arc(centerX, centerY, clockRadius + 5, sweep2, sweep2 + Math.PI * 0.2);
  clockCtx.strokeStyle = 'rgba(110, 231, 183, 0.15)';
  clockCtx.lineWidth = 1.5;
  clockCtx.stroke();
}

function animateClock(time) {
  drawClock(time);
  requestAnimationFrame(animateClock);
}

requestAnimationFrame(animateClock);


// === MEMORY STREAM — fragments triggered by the clock ===
const clockContainer = document.querySelector('.clock-container');
const memories = [
  'entity:user_preference → consolidated',
  'episode #847,203 → semantic fact',
  'agent:cortex → heartbeat received',
  'knowledge graph: +127 new edges',
  'overseer: triage batch #12,408 complete',
  'colony: 2.4M episodes indexed',
  'consolidation: 18,741 facts extracted',
  'entity:project_alpha → 342 links resolved',
  'cross-agent synthesis → 89 agents synchronized',
  'semantic search: 0.97 relevance @ 4ms',
  'vector index: 1.2M embeddings hot',
  'graph traversal: 6 hops, 23 entities',
  'memory consolidation cycle #9,847',
  'agent:sentinel → 412 new observations',
  'entity merge: 3 duplicates resolved',
];

let memoryIndex = 0;

function emitMemory() {
  // Pick a random hand to freeze — this hand "found" the memory
  const hand = hands[Math.floor(Math.random() * hands.length)];
  hand.triggerFind(performance.now());

  // Emit the fragment from the tip of that hand
  const fragment = document.createElement('div');
  fragment.className = 'memory-fragment';
  fragment.textContent = memories[memoryIndex % memories.length];

  // Drift direction — outward from the hand's current angle
  const driftAngle = hand.angle + (Math.random() - 0.5) * 0.8;
  const distance = 80 + Math.random() * 100;
  const endX = Math.cos(driftAngle) * distance;
  const endY = Math.sin(driftAngle) * distance;

  fragment.style.setProperty('--drift-x', `${endX}px`);
  fragment.style.setProperty('--drift-y', `${endY}px`);

  clockContainer.appendChild(fragment);
  memoryIndex++;

  setTimeout(() => fragment.remove(), 4000);
}

// Emit memories at irregular intervals — like real agent requests
function scheduleNextMemory() {
  const delay = 800 + Math.random() * 2500; // 0.8-3.3 seconds
  setTimeout(() => {
    emitMemory();
    scheduleNextMemory();
  }, delay);
}

// Kick off
setTimeout(() => {
  emitMemory();
  scheduleNextMemory();
}, 600);
