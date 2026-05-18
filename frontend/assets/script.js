/* =============================================================
   HELIX PLATFORM — SCRIPT.JS
   Full-Spectrum Cybersecurity Operations & Intelligence Platform
   Version: 1.0.0
   ============================================================= */

'use strict';

// ─────────────────────────────────────────────────────────────
// 1. THEME MANAGER (Dark / Light Mode with localStorage)
// ─────────────────────────────────────────────────────────────
const ThemeManager = (() => {
  const STORAGE_KEY = 'helix-theme';
  const html        = document.documentElement;
  const toggleBtn   = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');

  /** Apply a theme ('dark' | 'light') to the document */
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark'
        ? 'bi bi-moon-stars-fill'
        : 'bi bi-sun-fill';
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /** Toggle between dark and light */
  function toggle() {
    const current = html.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /** Initialise: read preference from storage or default to dark */
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
    applyTheme(saved);
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
    }
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 2. PARTICLE CANVAS — Grid / Particle Background
// ─────────────────────────────────────────────────────────────
const ParticleCanvas = (() => {
  const canvas = document.getElementById('helix-canvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');

  // Configuration
  const CONFIG = {
    particleCount: 70,
    particleSpeed: 0.3,
    connectionDistance: 130,
    particleRadius: 1.5,
    gridOpacity: 0.035,
    gridSize: 60,
  };

  let particles = [];
  let animId;
  let W, H;

  // Particle class
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * CONFIG.particleSpeed;
      this.vy = (Math.random() - 0.5) * CONFIG.particleSpeed;
      this.life = Math.random();
      // Color: blue, purple, or red (weighted toward blue)
      const r  = Math.random();
      if (r < 0.6)       this.color = '#00d4ff';
      else if (r < 0.85) this.color = '#a855f7';
      else               this.color = '#e02d3c';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      // Bounce off edges
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, CONFIG.particleRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /** Draw the faint dot grid */
  function drawGrid() {
    ctx.globalAlpha = CONFIG.gridOpacity;
    ctx.fillStyle = '#00d4ff';
    for (let x = 0; x < W; x += CONFIG.gridSize) {
      for (let y = 0; y < H; y += CONFIG.gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /** Draw connection lines between nearby particles */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDistance) {
          const alpha = (1 - dist / CONFIG.connectionDistance) * 0.3;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  /** Main animation loop */
  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(animate);
  }

  /** Resize handler */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
    animate();
    window.addEventListener('resize', resize);
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 3. NAVBAR — Scroll behaviour (compact on scroll)
// ─────────────────────────────────────────────────────────────
const NavbarManager = (() => {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return { init: () => {} };

  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        // Close mobile menu if open
        const bsCollapse = document.getElementById('helixNav');
        if (bsCollapse && bsCollapse.classList.contains('show')) {
          const bsInstance = window.bootstrap?.Collapse?.getInstance(bsCollapse);
          if (bsInstance) bsInstance.hide();
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function init() {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    initSmoothScroll();
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 4. AOS-STYLE SCROLL ANIMATIONS (Intersection Observer)
// ─────────────────────────────────────────────────────────────
const ScrollAnimations = (() => {
  function init() {
    const elements = document.querySelectorAll('[data-aos]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          // Don't unobserve — keep animation state
        }
      });
    }, {
      threshold:  0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 5. HERO STAT COUNTERS (animated count-up)
// ─────────────────────────────────────────────────────────────
const StatCounters = (() => {
  /** Count up a number from 0 to target */
  function animateCount(el, target, duration = 1800) {
    const start     = performance.now();
    const isDecimal = String(target).includes('.');
    const decimals  = isDecimal ? (String(target).split('.')[1] || '').length : 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = eased * target;

      el.textContent = decimals
        ? value.toFixed(decimals)
        : Math.floor(value).toLocaleString();

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
    }

    requestAnimationFrame(step);
  }

  function init() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseFloat(el.dataset.count);
          animateCount(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 6. HEALTH BAR ANIMATIONS (animate width when visible)
// ─────────────────────────────────────────────────────────────
const HealthBars = (() => {
  function init() {
    const bars = document.querySelectorAll('.health-bar');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          // Trigger width animation by reading the CSS var
          const target = getComputedStyle(bar).getPropertyValue('--hw').trim();
          bar.style.width = target;
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(bar => {
      bar.style.width = '0';
      observer.observe(bar);
    });
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 7. ACTIVITY FEED — Simulated live event stream
// ─────────────────────────────────────────────────────────────
const ActivityFeed = (() => {
  const feedEl = document.getElementById('activityFeed');
  if (!feedEl) return { init: () => {} };

  // Feed event templates
  const EVENTS = [
    { color: 'red',    msg: 'ALERT: Ransomware signature detected — endpoint WIN-SRV-042' },
    { color: 'blue',   msg: 'INFO: Firewall rule updated — policy ID 1337 applied' },
    { color: 'red',    msg: 'CRITICAL: Brute-force attempt — SSH 192.168.12.45' },
    { color: 'purple', msg: 'INTEL: New IOC ingested from MISP feed — CVE-2024-3833' },
    { color: 'green',  msg: 'RESOLVED: Incident INC-2041 closed — false positive' },
    { color: 'orange', msg: 'WARNING: Unusual outbound traffic — 34.2MB to 203.0.113.5' },
    { color: 'blue',   msg: 'INFO: AI model retrained — accuracy 97.4%' },
    { color: 'red',    msg: 'ALERT: C2 beacon detected — process explorer.exe' },
    { color: 'purple', msg: 'INTEL: TTP mapping updated — TA0001 Initial Access' },
    { color: 'green',  msg: 'RESOLVED: DDoS mitigation active — traffic scrubbed' },
    { color: 'orange', msg: 'WARNING: Expired SSL cert — api.internal.corp expires in 3d' },
    { color: 'blue',   msg: 'INFO: Log ingestion rate — 42,000 EPS sustained' },
    { color: 'red',    msg: 'CRITICAL: SQL injection attempt — web-app prod-01' },
    { color: 'green',  msg: 'RESOLVED: Patch deployed — KB5034441 on 128 endpoints' },
    { color: 'purple', msg: 'INTEL: Dark web mention — company credentials listed' },
  ];

  let eventIndex = 0;
  const MAX_ITEMS = 8;

  function getTimestamp() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  }

  function addFeedItem() {
    const event = EVENTS[eventIndex % EVENTS.length];
    eventIndex++;

    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `
      <div class="feed-dot feed-dot-${event.color}"></div>
      <div class="feed-content">
        <div class="feed-msg">${event.msg}</div>
        <div class="feed-time">${getTimestamp()}</div>
      </div>
    `;

    // Prepend new item at top
    feedEl.insertBefore(item, feedEl.firstChild);

    // Remove oldest item if over limit
    while (feedEl.children.length > MAX_ITEMS) {
      feedEl.removeChild(feedEl.lastChild);
    }
  }

  function init() {
    // Populate initial items
    for (let i = 0; i < 5; i++) addFeedItem();

    // Add new event every 3.5 seconds
    setInterval(addFeedItem, 3500);
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 8. LIVE COUNTER ANIMATION — Flickering threat numbers
// ─────────────────────────────────────────────────────────────
const LiveCounters = (() => {
  function jitter(el) {
    const base  = parseInt(el.dataset.liveCount, 10);
    const delta = Math.floor(Math.random() * 5) - 2; // ±2
    const next  = Math.max(0, base + delta);
    el.textContent = next.toLocaleString();

    // Save as new base with slight drift
    el.dataset.liveCount = base + (Math.random() > 0.5 ? 1 : -1);
  }

  function init() {
    const counters = document.querySelectorAll('[data-live-count]');
    if (!counters.length) return;

    // Jitter counters every 2 seconds
    setInterval(() => {
      counters.forEach(el => jitter(el));
    }, 2000);
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 9. NAVBAR ACTIVE LINK — Highlight current section
// ─────────────────────────────────────────────────────────────
const ActiveNavLink = (() => {
  function init() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.helix-nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}`);
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(section => observer.observe(section));
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 10. ROADMAP PANEL CONTROLS — Tab switching (chart time)
// ─────────────────────────────────────────────────────────────
const PanelControls = (() => {
  function init() {
    document.querySelectorAll('.panel-ctrl').forEach(ctrl => {
      ctrl.addEventListener('click', function () {
        const siblings = this.closest('.panel-controls').querySelectorAll('.panel-ctrl');
        siblings.forEach(s => s.classList.remove('active'));
        this.classList.add('active');
        // Future: fetch new chart data based on selected timeframe
      });
    });
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 11. CHART SVG GRADIENT INJECTION (Blue fill for chart area)
// ─────────────────────────────────────────────────────────────
const ChartGradient = (() => {
  function init() {
    const svgEl = document.querySelector('.fake-chart');
    if (!svgEl) return;

    // Inject SVG defs with gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#00d4ff" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#00d4ff" stop-opacity="0"/>
      </linearGradient>
    `;
    svgEl.insertBefore(defs, svgEl.firstChild);
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 12. TYPING HEADLINE EFFECT (optional tagline typewriter)
// ─────────────────────────────────────────────────────────────
const TypingEffect = (() => {
  function typeWrite(el, texts, speed = 80, pauseMs = 2000) {
    let textIndex = 0;
    let charIndex = 0;
    let deleting  = false;

    function tick() {
      const current = texts[textIndex];

      if (!deleting) {
        el.textContent = current.slice(0, ++charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, pauseMs);
          return;
        }
      } else {
        el.textContent = current.slice(0, --charIndex);
        if (charIndex === 0) {
          deleting  = false;
          textIndex = (textIndex + 1) % texts.length;
        }
      }

      setTimeout(tick, deleting ? speed / 2 : speed);
    }

    tick();
  }

  function init() {
    // Reserved for optional typing elements — add class="typing-target" to use
    document.querySelectorAll('.typing-target').forEach(el => {
      const texts = el.dataset.texts
        ? JSON.parse(el.dataset.texts)
        : [el.textContent];
      el.textContent = '';
      el.classList.add('typing-cursor');
      typeWrite(el, texts);
    });
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 13. TOOLTIP INITIALISATION (Bootstrap tooltips)
// ─────────────────────────────────────────────────────────────
const TooltipInit = (() => {
  function init() {
    const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipEls.forEach(el => {
      if (window.bootstrap?.Tooltip) {
        new bootstrap.Tooltip(el);
      }
    });
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 14. PAGE LOAD REVEAL — Fade-in hero on load
// ─────────────────────────────────────────────────────────────
const PageLoadReveal = (() => {
  function init() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    window.addEventListener('load', () => {
      document.body.style.opacity = '1';
    });

    // Fallback if load fires late
    setTimeout(() => { document.body.style.opacity = '1'; }, 800);
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────────
// 15. MASTER INITIALISATION — Boot all modules
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  PageLoadReveal.init();
  ThemeManager.init();
  ParticleCanvas.init();
  NavbarManager.init();
  ScrollAnimations.init();
  StatCounters.init();
  HealthBars.init();
  ActivityFeed.init();
  LiveCounters.init();
  ActiveNavLink.init();
  PanelControls.init();
  ChartGradient.init();
  TypingEffect.init();
  TooltipInit.init();

  // Log to confirm boot (remove in production)
  console.log('%c[ HELIX ] Platform UI Initialized', 'color:#00d4ff;font-family:monospace;font-weight:bold;');
  console.log('%cFull-Spectrum Cybersecurity Operations & Intelligence Platform v1.0', 'color:#a855f7;font-family:monospace;');
});

/* =============================================================
   FUTURE INTEGRATION HOOKS
   These stubs are placeholders for upcoming real-time modules.
   ============================================================= */

/**
 * WebSocket Manager stub — connect to live threat feeds
 * Usage: WebSocketManager.connect('wss://helix.platform/ws/threats')
 */
const WebSocketManager = {
  socket: null,

  connect(url) {
    // Future: this.socket = new WebSocket(url);
    // this.socket.onmessage = (e) => this.handleMessage(JSON.parse(e.data));
    console.log('%c[WS] WebSocket endpoint ready:', 'color:#22c55e;font-family:monospace;', url);
  },

  handleMessage(data) {
    // Route incoming data to appropriate module
    switch (data.type) {
      case 'threat':   /* updateThreatCounters(data); */ break;
      case 'alert':    /* addFeedItem(data); */          break;
      case 'metric':   /* updateHealthBars(data); */     break;
      default: break;
    }
  },

  disconnect() {
    if (this.socket) this.socket.close();
  }
};

/**
 * SIEM Data Adapter stub — parse and render SIEM events
 * Future integration point for Splunk, ELK, Wazuh, etc.
 */
const SIEMAdapter = {
  sources: ['Splunk', 'Elastic', 'Wazuh', 'QRadar'],

  ingest(source, events) {
    // Future: normalize events and push to feed/charts
    console.log(`[SIEM] Ingesting ${events.length} events from ${source}`);
  },

  normalizeEvent(raw) {
    // Future: map raw SIEM event fields to HELIX schema
    return {
      timestamp: raw.timestamp || Date.now(),
      severity:  raw.severity  || 'info',
      message:   raw.message   || raw.msg || '',
      source:    raw.host      || raw.source || 'unknown',
    };
  }
};

/**
 * Auth Module stub — JWT/OAuth2 integration point
 * Future: connect to backend auth service
 */
const AuthModule = {
  token: null,

  async login(credentials) {
    // Future: POST /api/v1/auth/login
    console.log('[AUTH] Login endpoint ready');
  },

  async logout() {
    this.token = null;
    // Future: redirect to login page
  },

  isAuthenticated() {
    return !!this.token;
  }
};
