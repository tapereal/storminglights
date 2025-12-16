/* ========================================
   StormingLights Main JavaScript
   Particle Animation, Interactions, Navigation
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticleAnimation();
  initNavigation();
  initScrollAnimations();
  initSmoothScroll();
  initContactForm();
});

/* ========================================
   Particle Animation (Floating Lights)
   ======================================== */
function initParticleAnimation() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  let time = 0;

  // Resize canvas to full screen
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Aurora colors - greens, magentas, purples
  const auroraColors = [
    { hue: 140, sat: 70, light: 55, alpha: 0.15 },  // Green
    { hue: 160, sat: 65, light: 50, alpha: 0.12 },  // Teal-green
    { hue: 280, sat: 55, light: 60, alpha: 0.10 },  // Purple
    { hue: 310, sat: 60, light: 58, alpha: 0.08 },  // Magenta
  ];

  // Pre-generate random wave parameters for organic look
  const waveParams = [];
  for (let i = 0; i < 12; i++) {
    waveParams.push({
      xBase: Math.random() * 0.9 + 0.05,
      yBase: Math.random() * 0.3,
      width: Math.random() * 200 + 100,
      height: Math.random() * 0.4 + 0.3,
      speed: Math.random() * 0.00008 + 0.00004,  // Much slower individual speeds
      phase: Math.random() * Math.PI * 2,
      colorIndex: Math.floor(Math.random() * auroraColors.length),
      curve: Math.random() * 0.3 + 0.1,
    });
  }

  // Draw organic aurora borealis effect
  function drawAurora() {
    const slowTime = time * 0.0000002;  // Almost imperceptible - glacial drift

    // Draw multiple organic aurora bands
    waveParams.forEach((wave, i) => {
      const color = auroraColors[wave.colorIndex];

      // Organic movement
      const xOffset = Math.sin(slowTime / wave.speed + wave.phase) * 80;
      const yOffset = Math.sin(slowTime / wave.speed * 0.7 + wave.phase) * 30;
      const alphaWave = 0.5 + Math.sin(slowTime / wave.speed * 0.5 + wave.phase * 2) * 0.5;

      const x = canvas.width * wave.xBase + xOffset;
      const y = canvas.height * wave.yBase + yOffset;
      const height = canvas.height * wave.height;
      const width = wave.width + Math.sin(slowTime / wave.speed * 0.3) * 50;

      // Create flowing gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + height);
      const baseAlpha = color.alpha * alphaWave;

      gradient.addColorStop(0, `hsla(${color.hue}, ${color.sat}%, ${color.light}%, 0)`);
      gradient.addColorStop(0.1, `hsla(${color.hue}, ${color.sat}%, ${color.light}%, ${baseAlpha * 0.3})`);
      gradient.addColorStop(0.3, `hsla(${color.hue}, ${color.sat}%, ${color.light}%, ${baseAlpha})`);
      gradient.addColorStop(0.6, `hsla(${color.hue}, ${color.sat}%, ${color.light + 10}%, ${baseAlpha * 0.7})`);
      gradient.addColorStop(1, `hsla(${color.hue}, ${color.sat}%, ${color.light}%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();

      // Draw organic curved shape with bezier waves
      const curveAmount = wave.curve * 100;
      const wobble1 = Math.sin(slowTime / wave.speed * 2 + i) * curveAmount;
      const wobble2 = Math.sin(slowTime / wave.speed * 1.5 + i * 2) * curveAmount;

      ctx.moveTo(x - width / 2, y);

      // Flowing top edge
      ctx.bezierCurveTo(
        x - width / 4 + wobble1, y - 20,
        x + width / 4 + wobble2, y - 15,
        x + width / 2, y
      );

      // Right flowing edge
      ctx.bezierCurveTo(
        x + width / 2 + wobble2 * 0.5, y + height * 0.25,
        x + width / 2 - wobble1 * 0.5, y + height * 0.5,
        x + width / 2 + wobble1 * 0.3, y + height * 0.75
      );
      ctx.lineTo(x + width / 2, y + height);

      // Bottom edge
      ctx.bezierCurveTo(
        x + width / 4 - wobble2, y + height + 10,
        x - width / 4 + wobble1, y + height + 5,
        x - width / 2, y + height
      );

      // Left flowing edge
      ctx.bezierCurveTo(
        x - width / 2 - wobble1 * 0.3, y + height * 0.75,
        x - width / 2 + wobble2 * 0.5, y + height * 0.5,
        x - width / 2 - wobble2 * 0.5, y + height * 0.25
      );

      ctx.closePath();
      ctx.fill();
    });

    // Ambient glow overlay
    const glowGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.65);
    glowGradient.addColorStop(0, 'rgba(91, 192, 190, 0.06)');
    glowGradient.addColorStop(0.3, 'rgba(91, 192, 190, 0.04)');
    glowGradient.addColorStop(0.6, 'rgba(58, 80, 107, 0.03)');
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.65);
  }

  // Particle class
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.hue = Math.random() > 0.7 ? 175 : 210; // Cyan or blue tint
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Pulse opacity
      const pulse = Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset);
      this.currentOpacity = this.opacity + pulse * 0.2;

      // Wrap around screen
      if (this.x < -50) this.x = canvas.width + 50;
      if (this.x > canvas.width + 50) this.x = -50;
      if (this.y < -50) this.y = canvas.height + 50;
      if (this.y > canvas.height + 50) this.y = -50;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.currentOpacity);

      // Glow effect
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 4
      );
      gradient.addColorStop(0, `hsla(${this.hue}, 70%, 70%, 1)`);
      gradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 50%, 0.3)`);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core (brighter star)
      ctx.fillStyle = `hsla(${this.hue}, 80%, 85%, 1)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Create particles
  const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Draw connection lines between nearby particles
  function drawConnections() {
    const maxDist = 120;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.12;
          ctx.strokeStyle = `rgba(91, 192, 190, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    time = Date.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles and connections only (aurora is now the background image)
    drawConnections();

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationId);
  });
}

/* ========================================
   Navigation
   ======================================== */
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  // Scroll effect
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
      }
    });
  }
}

/* ========================================
   Scroll Animations
   ======================================== */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElements.forEach(el => observer.observe(el));
}

/* ========================================
   Smooth Scroll
   ======================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/* ========================================
   Contact Form
   ======================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Basic validation
    if (!name || !email || !message) {
      showFormMessage('Please fill in all fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFormMessage('Please enter a valid email address.', 'error');
      return;
    }

    // Simulate form submission
    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // In a real implementation, you would send to a backend
    setTimeout(() => {
      showFormMessage('Thank you! We\'ll be in touch soon.', 'success');
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 1500);
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showFormMessage(message, type) {
  // Remove existing message
  const existingMessage = document.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageEl = document.createElement('div');
  messageEl.className = `form-message form-message--${type}`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
    ${type === 'success'
      ? 'background: rgba(91, 192, 190, 0.2); color: #5BC0BE; border: 1px solid #5BC0BE;'
      : 'background: rgba(255, 107, 107, 0.2); color: #FF6B6B; border: 1px solid #FF6B6B;'
    }
  `;

  const form = document.getElementById('contact-form');
  form.appendChild(messageEl);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageEl.remove();
  }, 5000);
}
