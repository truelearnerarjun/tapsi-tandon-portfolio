/* ============================================================
   TAPSI TANDON — Creative Director & Fashion Stylist Portfolio
   script.js — Interactive logic, animations & parallax
   ============================================================ */

'use strict';

/* ── Utility: DOM query shorthand ───────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Dynamic Hero Title Splitter (Letter-Rise Animation) ── */
(function initHeroTitle() {
  const title = qs('#heroTitle');
  if (!title) return;
  const text = title.textContent.trim();
  title.innerHTML = text.split('').map((char, i) => {
    if (char === ' ') return '<span class="hero__clip hero__clip--space" aria-hidden="true"><span class="hero__letter hero__letter--g1">&nbsp;</span></span>';
    const g = (i % 3 === 0) ? 'g3' : (i % 3 === 1) ? 'g2' : 'g1';
    return `<span class="hero__clip"><span class="hero__letter hero__letter--${g}">${char}</span></span>`;
  }).join('');
})();

/* ============================================================
   1. MOBILE NAVBAR CONTROLLER
   Hamburger is visible only on mobile/tablet and toggles the middle navbar links.
   ============================================================ */
(function initMobileNavbar() {
  const navOpen     = qs('#navOpen');
  const navbarLinks = qs('#navbarLinks');
  const backdrop    = qs('#navBackdrop');

  if (!navOpen || !navbarLinks) return;

  function toggleMenu() {
    const isOpen = navbarLinks.classList.toggle('is-open');
    navOpen.classList.toggle('is-active', isOpen);
    if (backdrop) backdrop.classList.toggle('is-open', isOpen);
    navOpen.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    navbarLinks.classList.remove('is-open');
    navOpen.classList.remove('is-active');
    if (backdrop) backdrop.classList.remove('is-open');
    navOpen.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  navOpen.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  backdrop?.addEventListener('click', closeMenu);

  // Close when clicking any nav link
  qsa('.navbar__link', navbarLinks).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbarLinks.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Automatically close if window is resized past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && navbarLinks.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();

/* ============================================================
   3. HERO PARALLAX & STICKY SCROLL
   Text stays pinned in the center while image glides down.
   Only after the image finishes moving does the hero unpin and scroll away.
   ============================================================ */
(function initHeroParallax() {
  const hero   = qs('.hero');
  const heroBg = qs('.hero__bg');
  const scrollIndicator = qs('.hero__scroll-indicator');
  if (!hero || !heroBg) return;

  let ticking = false;

  function updateParallax() {
    const heroRect   = hero.getBoundingClientRect();
    const heroH      = hero.offsetHeight;
    const windowH    = window.innerHeight;
    const scrollDist = heroH - windowH;

    if (scrollDist <= 0) {
      ticking = false;
      return;
    }

    // Scroll progress strictly within the hero's sticky track (0 to 1)
    const scrolled = -heroRect.top;
    const progress = Math.min(1, Math.max(0, scrolled / scrollDist));

    // Smoothly glide the image down as user scrolls (revealing from top to bottom)
    heroBg.style.backgroundPosition = `center ${progress * 100}%`;

    // Fade out scroll indicator during scroll
    if (scrollIndicator) {
      scrollIndicator.style.opacity = Math.max(0, 1 - progress * 2.5);
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
})();

/* ============================================================
   4. SCROLL REVEAL (Intersection Observer)
   ============================================================ */
(function initScrollReveal() {
  const revealEls = qsa('.reveal-up, .reveal-left, .reveal-right');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Fire once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. NAVBAR — Scroll shadow + active link highlighting
   ============================================================ */
(function initNavbar() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  // Add a stronger shadow when scrolled
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });

  // Highlight active nav link via scroll position
  const sections  = qsa('main section[id], main [id]');
  const navLinks  = qsa('.navbar__link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle(
              'navbar__link--active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach(sec => sectionObserver.observe(sec));
})();

/* ============================================================
   6. CONSTELLATION SVG LINES
   Draws dashed connecting lines between the floating product
   cards, animated via stroke-dashoffset on scroll into view.
   ============================================================ */
(function initConstellationLines() {
  const area = qs('#constellationArea');
  const svg  = qs('#constellationSvg');
  const card1 = qs('#card1');
  const card2 = qs('#card2');
  const card3 = qs('#card3');

  if (!area || !svg || !card1 || !card2 || !card3) return;

  function getCardCenter(card) {
    const areaRect = area.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    return {
      x: cardRect.left - areaRect.left + cardRect.width / 2,
      y: cardRect.top  - areaRect.top  + cardRect.height / 2,
    };
  }

  function createLine(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const len  = Math.hypot(x2 - x1, y2 - y1);

    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'rgba(200,172,152,0.35)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-dasharray', '6 5');
    line.setAttribute('stroke-dashoffset', len);
    line.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)';

    // Animate in
    requestAnimationFrame(() => {
      setTimeout(() => {
        line.setAttribute('stroke-dashoffset', '0');
      }, 200);
    });

    return line;
  }

  let drawn = false;

  function drawLines() {
    if (drawn) return;
    drawn = true;

    // Clear any existing
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const c1 = getCardCenter(card1);
    const c2 = getCardCenter(card2);
    const c3 = getCardCenter(card3);

    svg.appendChild(createLine(c1.x, c1.y, c2.x, c2.y));
    svg.appendChild(createLine(c2.x, c2.y, c3.x, c3.y));
    svg.appendChild(createLine(c1.x, c1.y, c3.x, c3.y));
  }

  // Trigger lines when constellation section enters view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Wait for layout + float animations to settle
          setTimeout(drawLines, 400);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(area);

  // Redraw lines on window resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      drawn = false;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const rect = area.getBoundingClientRect();
      if (rect.top < window.innerHeight) drawLines();
    }, 200);
  }, { passive: true });
})();

/* ============================================================
   7. NEWSLETTER FORM — Submission handling
   ============================================================ */
(function initNewsletterForm() {
  const form  = qs('#newsletterForm');
  const input = qs('#newsletterEmail');
  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFormFeedback(form, 'Please enter a valid email address.', 'error');
      input.focus();
      return;
    }

    // Simulate successful subscription
    showFormFeedback(form, 'Thank you for subscribing!', 'success');
    input.value = '';
  });

  function showFormFeedback(form, message, type) {
    // Remove old feedback
    const existing = qs('.form-feedback', form);
    if (existing) existing.remove();

    const el = document.createElement('p');
    el.className = `form-feedback form-feedback--${type}`;
    el.textContent = message;
    el.style.cssText = `
      margin-top: 0.75rem;
      font-size: 0.8rem;
      font-family: 'Jost', sans-serif;
      color: ${type === 'success' ? '#8bc5a4' : '#e07a7a'};
      animation: fadeInUp 0.4s ease both;
    `;
    form.appendChild(el);

    if (type === 'success') {
      setTimeout(() => el.remove(), 5000);
    }
  }
})();

/* ============================================================
   8. FOOTER NEWSLETTER FORM
   ============================================================ */
(function initFooterForm() {
  const form = qs('.footer__newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input && input.value.trim()) {
      input.value = '';
      input.placeholder = 'Subscribed! ✓';
      setTimeout(() => { input.placeholder = 'Email Address'; }, 3000);
    }
  });
})();

/* ============================================================
   9. SMOOTH SCROLL for anchor links (fallback enhancement)
   ============================================================ */
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId  = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = qs(targetId);
      if (!target) return;

      e.preventDefault();
      const navH   = qs('#navbar')?.offsetHeight || 60;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   10. PRESS LOGOS — Stagger fade on scroll
   ============================================================ */
(function initPressLogos() {
  const logos = qsa('.press__logo');
  if (!logos.length) return;

  logos.forEach((logo, i) => {
    logo.style.opacity = '0';
    logo.style.transform = 'translateY(16px)';
    logo.style.transition = `opacity 0.5s ease ${0.05 + i * 0.05}s, transform 0.5s ease ${0.05 + i * 0.05}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          logos.forEach(logo => {
            logo.style.opacity = '';
            logo.style.transform = '';
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const pressSection = qs('.press__logos');
  if (pressSection) observer.observe(pressSection);
})();

/* ============================================================
   11. ART CARDS — Mouse tilt effect (brand story section)
   ============================================================ */
(function initArtCardTilt() {
  const artCards = qsa('.art-card');
  if (!artCards.length) return;

  artCards.forEach(card => {
    const isLeft  = card.classList.contains('art-card--left');
    const baseRot = isLeft ? -8 : 5;

    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = -dy * 8;
      const tiltY  =  dx * 8;
      const tx     = isLeft ? -60 : 60;
      const ty     = isLeft ? -30 : 30;

      card.style.transition = 'transform 0.15s ease';
      card.style.transform  = `rotate(${baseRot + tiltY * 0.3}deg) translate(${tx}px, ${ty}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.04)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      const tx = isLeft ? -60 : 60;
      const ty = isLeft ? -30 :  30;
      card.style.transform  = `rotate(${baseRot}deg) translate(${tx}px, ${ty}px)`;
    });
  });
})();

/* ============================================================
   12. IMAGE LAZY LOADING (enhance native lazy loading)
   ============================================================ */
(function initLazyImages() {
  const images = qsa('img');

  // Add native lazy loading
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
})();

/* ============================================================
   13. PRODUCT CARD — Non-clickable static behavior
   Cards and images are non-clickable with no movement on click.
   ============================================================ */
(function initProductCards() {
  const cards = qsa('.product-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
})();

/* ============================================================
   14. HAMBURGER ICON — Animate to X on nav open
   ============================================================ */
(function initHamburgerAnimation() {
  const navOpen    = qs('#navOpen');
  const navClose   = qs('#navClose');
  const navOverlay = qs('#navOverlay');
  if (!navOpen || !navOverlay) return;

  const spans = navOpen.querySelectorAll('span');

  navOpen.addEventListener('click', () => {
    spans[0].style.transform = 'translateY(3.5px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-3.5px) rotate(-45deg)';
  });

  navClose?.addEventListener('click', resetHamburger);

  // Also reset when nav overlay items are clicked
  qsa('.nav-overlay__item a', navOverlay).forEach(link => {
    link.addEventListener('click', resetHamburger);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') resetHamburger();
  });

  function resetHamburger() {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
})();

/* ============================================================
   15. BEYOND THE SPOTLIGHT — LUXURY VIDEO PLAYER CONTROLLER
   Robust playback, custom scrubber, time tracking, mobile touch,
   mute toggle, fullscreen and idle auto-hide controls.
   ============================================================ */
(function initStoryVideo() {
  const player = qs('#luxuryPlayer');
  const video  = qs('#storyVideo');
  if (!player || !video) return;

  const centerBtn       = qs('#centerPlayBtn', player);
  const ctrlPlayBtn     = qs('#ctrlPlayBtn', player);
  const ctrlMuteBtn     = qs('#ctrlMuteBtn', player);
  const ctrlFsBtn       = qs('#ctrlFullscreenBtn', player);
  const progressWrap    = qs('#progressWrap', player);
  const progressBar     = qs('#progressBar', player);
  const progressBuffered= qs('#progressBuffered', player);
  const timeCurrent     = qs('#timeCurrent', player);
  const timeDuration    = qs('#timeDuration', player);
  const watchCta        = qs('#storyWatchCta');

  let isScrubbing = false;
  let hideControlsTimer = null;

  // Format seconds to mm:ss
  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Set total duration when metadata is ready
  function updateDuration() {
    if (video.duration && !isNaN(video.duration)) {
      if (timeDuration) timeDuration.textContent = formatTime(video.duration);
    }
  }

  video.addEventListener('loadedmetadata', updateDuration);
  video.addEventListener('durationchange', updateDuration);
  if (video.readyState >= 1) updateDuration();

  // Play / Pause Toggle
  function togglePlay() {
    if (video.paused || video.ended) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Playback prevented:', err);
        });
      }
    } else {
      video.pause();
    }
  }

  // Update UI on Play
  video.addEventListener('play', () => {
    player.classList.add('is-playing');
    startHideControlsTimer();
    qsa('video').forEach(v => {
      if (v !== video && !v.paused) v.pause();
    });
  });

  // Update UI on Pause
  video.addEventListener('pause', () => {
    player.classList.remove('is-playing');
    clearTimeout(hideControlsTimer);
    player.classList.remove('controls-hidden');
  });

  // Reset UI on End
  video.addEventListener('ended', () => {
    player.classList.remove('is-playing');
    clearTimeout(hideControlsTimer);
    player.classList.remove('controls-hidden');
    if (progressBar) progressBar.style.width = '0%';
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', '0');
    if (timeCurrent) timeCurrent.textContent = '0:00';
  });

  // Center button & bottom bar button
  centerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
    centerBtn.blur();
  });

  ctrlPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
    ctrlPlayBtn.blur();
  });

  // Smart Mobile Touch & Click on Video
  let touchStartX = 0;
  let touchStartY = 0;
  player.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    showControls();
  }, { passive: true });

  player.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (dx > 12 || dy > 12) return;
    }
    if (e.target.closest('#playerControls') || e.target.closest('#centerPlayBtn')) {
      return;
    }
    if (!video.paused && player.classList.contains('controls-hidden')) {
      showControls();
    } else {
      togglePlay();
    }
  });

  // Clicking on video itself on non-touch desktop toggles play/pause
  video.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  // CTA button "WATCH THE STORY →"
  watchCta?.addEventListener('click', () => {
    const storySection = qs('#story');
    if (storySection) {
      storySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      if (video.paused) {
        video.play().catch(e => console.log('Autoplay blocked:', e));
      }
    }, 400);
  });

  // Time & Progress update
  video.addEventListener('timeupdate', () => {
    if (isScrubbing) return;
    const current = video.currentTime;
    const duration = video.duration || 105.3;
    const pct = (current / duration) * 100;

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', Math.round(pct));
    if (timeCurrent) timeCurrent.textContent = formatTime(current);
  });

  // Buffer progress
  video.addEventListener('progress', () => {
    if (video.buffered.length > 0 && video.duration) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const pct = (bufferedEnd / video.duration) * 100;
      if (progressBuffered) progressBuffered.style.width = `${pct}%`;
    }
  });

  // Scrubber seeking logic
  function seekTo(e) {
    if (!video.duration || !progressWrap) return;
    const rect = progressWrap.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pos = (clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    video.currentTime = pos * video.duration;
    if (progressBar) progressBar.style.width = `${pos * 100}%`;
    if (timeCurrent) timeCurrent.textContent = formatTime(pos * video.duration);
  }

  if (progressWrap) {
    progressWrap.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      progressWrap.classList.add('is-scrubbing');
      seekTo(e);
      const onMouseMove = (ev) => {
        if (!isScrubbing) return;
        seekTo(ev);
      };
      const onMouseUp = () => {
        isScrubbing = false;
        progressWrap.classList.remove('is-scrubbing');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    // Touch events for mobile scrubbing
    progressWrap.addEventListener('touchstart', (e) => {
      isScrubbing = true;
      progressWrap.classList.add('is-scrubbing');
      seekTo(e);
    }, { passive: true });

    progressWrap.addEventListener('touchmove', (e) => {
      if (!isScrubbing) return;
      seekTo(e);
    }, { passive: true });

    progressWrap.addEventListener('touchend', () => {
      isScrubbing = false;
      progressWrap.classList.remove('is-scrubbing');
    });
  }

  // Mute / Unmute
  function toggleMute() {
    video.muted = !video.muted;
    if (video.muted) {
      player.classList.add('is-muted');
    } else {
      player.classList.remove('is-muted');
    }
  }

  ctrlMuteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMute();
  });

  // Fullscreen
  function toggleFullscreen() {
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFs) {
      if (player.requestFullscreen) {
        player.requestFullscreen();
      } else if (player.webkitRequestFullscreen) {
        player.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  ctrlFsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === player) {
      player.classList.add('is-fullscreen');
    } else {
      player.classList.remove('is-fullscreen');
    }
  });

  document.addEventListener('webkitfullscreenchange', () => {
    if (document.webkitFullscreenElement === player) {
      player.classList.add('is-fullscreen');
    } else {
      player.classList.remove('is-fullscreen');
    }
  });

  // Auto-hide controls when playing and idle
  function showControls() {
    player.classList.remove('controls-hidden');
    startHideControlsTimer();
  }

  function startHideControlsTimer() {
    clearTimeout(hideControlsTimer);
    if (!video.paused && !video.ended) {
      hideControlsTimer = setTimeout(() => {
        if (!video.paused && !isScrubbing) {
          player.classList.add('controls-hidden');
        }
      }, 2500);
    }
  }

  player.addEventListener('mousemove', showControls);
  player.addEventListener('mouseleave', () => {
    if (!video.paused) player.classList.add('controls-hidden');
  });

  // Keyboard controls when focused
  player.addEventListener('keydown', (e) => {
    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        e.preventDefault();
        togglePlay();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        video.currentTime = Math.min(video.duration || 105, video.currentTime + 5);
        break;
    }
  });
})();

/* ============================================================
   16. BEYOND THE SPOTLIGHT — PODCAST VIDEO PLAYER CONTROLLER
   Teaser preview player with scrub, auto-hide, full mobile touch.
   ============================================================ */
(function initPodcastVideo() {
  const player = qs('#podcastPlayer');
  const video  = qs('#podcastVideo');
  if (!player || !video) return;

  const centerBtn       = qs('#podcastCenterBtn', player);
  const ctrlPlayBtn     = qs('#podcastCtrlPlayBtn', player);
  const ctrlMuteBtn     = qs('#podcastCtrlMuteBtn', player);
  const ctrlFsBtn       = qs('#podcastCtrlFsBtn', player);
  const progressWrap    = qs('#podcastProgressWrap', player);
  const progressBar     = qs('#podcastProgressBar', player);
  const progressBuffered= qs('#podcastProgressBuffered', player);
  const timeCurrent     = qs('#podcastTimeCurrent', player);
  const timeDuration    = qs('#podcastTimeDuration', player);
  const watchPreviewBtn = qs('#podcastWatchPreviewBtn');

  let isScrubbing = false;
  let hideControlsTimer = null;

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateDuration() {
    if (video.duration && !isNaN(video.duration)) {
      if (timeDuration) timeDuration.textContent = formatTime(video.duration);
    }
  }

  video.addEventListener('loadedmetadata', updateDuration);
  video.addEventListener('durationchange', updateDuration);
  if (video.readyState >= 1) updateDuration();

  function togglePlay() {
    if (video.paused || video.ended) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.warn('Playback prevented:', err));
      }
    } else {
      video.pause();
    }
  }

  video.addEventListener('play', () => {
    player.classList.add('is-playing');
    startHideControlsTimer();
    qsa('video').forEach(v => {
      if (v !== video && !v.paused) v.pause();
    });
  });

  video.addEventListener('pause', () => {
    player.classList.remove('is-playing');
    clearTimeout(hideControlsTimer);
    player.classList.remove('controls-hidden');
  });

  video.addEventListener('ended', () => {
    player.classList.remove('is-playing');
    clearTimeout(hideControlsTimer);
    player.classList.remove('controls-hidden');
    if (progressBar) progressBar.style.width = '0%';
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', '0');
    if (timeCurrent) timeCurrent.textContent = '0:00';
  });

  centerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
    centerBtn.blur();
  });

  ctrlPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
    ctrlPlayBtn.blur();
  });

  // Smart Mobile Touch & Click on Video
  let touchStartX = 0;
  let touchStartY = 0;
  player.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    showControls();
  }, { passive: true });

  player.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (dx > 12 || dy > 12) return;
    }
    if (e.target.closest('#podcastControls') || e.target.closest('#podcastCenterBtn')) {
      return;
    }
    if (!video.paused && player.classList.contains('controls-hidden')) {
      showControls();
    } else {
      togglePlay();
    }
  });

  video.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  watchPreviewBtn?.addEventListener('click', () => {
    const podcastSection = qs('#podcast');
    if (podcastSection) {
      podcastSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      if (video.paused) {
        video.play().catch(e => console.log('Autoplay blocked:', e));
      }
    }, 400);
  });

  video.addEventListener('timeupdate', () => {
    if (isScrubbing) return;
    const current = video.currentTime;
    const duration = video.duration || 10.56;
    const pct = (current / duration) * 100;

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', Math.round(pct));
    if (timeCurrent) timeCurrent.textContent = formatTime(current);
  });

  video.addEventListener('progress', () => {
    if (video.buffered.length > 0 && video.duration) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const pct = (bufferedEnd / video.duration) * 100;
      if (progressBuffered) progressBuffered.style.width = `${pct}%`;
    }
  });

  function seekTo(e) {
    if (!video.duration || !progressWrap) return;
    const rect = progressWrap.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pos = (clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    video.currentTime = pos * video.duration;
    if (progressBar) progressBar.style.width = `${pos * 100}%`;
    if (timeCurrent) timeCurrent.textContent = formatTime(pos * video.duration);
  }

  if (progressWrap) {
    progressWrap.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      progressWrap.classList.add('is-scrubbing');
      seekTo(e);
      const onMouseMove = (ev) => {
        if (!isScrubbing) return;
        seekTo(ev);
      };
      const onMouseUp = () => {
        isScrubbing = false;
        progressWrap.classList.remove('is-scrubbing');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    progressWrap.addEventListener('touchstart', (e) => {
      isScrubbing = true;
      progressWrap.classList.add('is-scrubbing');
      seekTo(e);
    }, { passive: true });

    progressWrap.addEventListener('touchmove', (e) => {
      if (!isScrubbing) return;
      seekTo(e);
    }, { passive: true });

    progressWrap.addEventListener('touchend', () => {
      isScrubbing = false;
      progressWrap.classList.remove('is-scrubbing');
    });
  }

  function toggleMute() {
    video.muted = !video.muted;
    if (video.muted) {
      player.classList.add('is-muted');
    } else {
      player.classList.remove('is-muted');
    }
  }

  ctrlMuteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMute();
  });

  function toggleFullscreen() {
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFs) {
      if (player.requestFullscreen) {
        player.requestFullscreen();
      } else if (player.webkitRequestFullscreen) {
        player.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  ctrlFsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === player) {
      player.classList.add('is-fullscreen');
    } else {
      player.classList.remove('is-fullscreen');
    }
  });

  document.addEventListener('webkitfullscreenchange', () => {
    if (document.webkitFullscreenElement === player) {
      player.classList.add('is-fullscreen');
    } else {
      player.classList.remove('is-fullscreen');
    }
  });

  function showControls() {
    player.classList.remove('controls-hidden');
    startHideControlsTimer();
  }

  function startHideControlsTimer() {
    clearTimeout(hideControlsTimer);
    if (!video.paused && !video.ended) {
      hideControlsTimer = setTimeout(() => {
        if (!video.paused && !isScrubbing) {
          player.classList.add('controls-hidden');
        }
      }, 2500);
    }
  }

  player.addEventListener('mousemove', showControls);
  player.addEventListener('mouseleave', () => {
    if (!video.paused) player.classList.add('controls-hidden');
  });

  player.addEventListener('keydown', (e) => {
    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        e.preventDefault();
        togglePlay();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 2);
        break;
      case 'ArrowRight':
        e.preventDefault();
        video.currentTime = Math.min(video.duration || 10, video.currentTime + 2);
        break;
    }
  });
})();

/* ============================================================
   16. PROPERTY & PERSPECTIVE — REAL ESTATE VIDEO PLAYER CONTROLLER
   Vertical reel player (9:16) with scrub, auto-hide, full mobile touch.
   ============================================================ */
(function initRealEstateVideo() {
  const player = qs('#realestatePlayer');
  const video  = qs('#realestateVideo');
  if (!player || !video) return;

  const centerBtn       = qs('#realestateCenterBtn', player);
  const ctrlPlayBtn     = qs('#realestateCtrlPlayBtn', player);
  const ctrlMuteBtn     = qs('#realestateCtrlMuteBtn', player);
  const ctrlFsBtn       = qs('#realestateCtrlFsBtn', player);
  const progressWrap    = qs('#realestateProgressWrap', player);
  const progressBar     = qs('#realestateProgressBar', player);
  const progressBuffered= qs('#realestateProgressBuffered', player);
  const timeCurrent     = qs('#realestateTimeCurrent', player);
  const timeDuration    = qs('#realestateTimeDuration', player);
  const watchCta        = qs('#realestateWatchCta');

  let isScrubbing = false;
  let hideControlsTimer = null;

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateDuration() {
    if (video.duration && !isNaN(video.duration)) {
      if (timeDuration) timeDuration.textContent = formatTime(video.duration);
    }
  }

  video.addEventListener('loadedmetadata', updateDuration);
  video.addEventListener('durationchange', updateDuration);
  if (video.readyState >= 1) updateDuration();

  function togglePlay() {
    if (video.paused || video.ended) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.warn('Playback prevented:', err));
      }
    } else {
      video.pause();
    }
  }

  video.addEventListener('play', () => {
    player.classList.add('is-playing');
    startHideControlsTimer();
    qsa('video').forEach(v => {
      if (v !== video && !v.paused) v.pause();
    });
  });

  video.addEventListener('pause', () => {
    player.classList.remove('is-playing');
    clearTimeout(hideControlsTimer);
    player.classList.remove('controls-hidden');
  });

  video.addEventListener('ended', () => {
    player.classList.remove('is-playing');
    clearTimeout(hideControlsTimer);
    player.classList.remove('controls-hidden');
    if (progressBar) progressBar.style.width = '0%';
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', '0');
    if (timeCurrent) timeCurrent.textContent = '0:00';
  });

  centerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
    centerBtn.blur();
  });

  ctrlPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
    ctrlPlayBtn.blur();
  });

  // Mobile Touch & Click on Video
  let touchStartX = 0;
  let touchStartY = 0;
  player.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    showControls();
  }, { passive: true });

  player.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (dx > 12 || dy > 12) return;
    }
    if (e.target.closest('#realestateControls') || e.target.closest('#realestateCenterBtn')) {
      return;
    }
    if (!video.paused && player.classList.contains('controls-hidden')) {
      showControls();
    } else {
      togglePlay();
    }
  });

  video.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  watchCta?.addEventListener('click', () => {
    const reSection = qs('#realestate');
    if (reSection) {
      reSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      if (video.paused) {
        video.play().catch(e => console.log('Autoplay blocked:', e));
      }
    }, 400);
  });

  video.addEventListener('timeupdate', () => {
    if (isScrubbing) return;
    const current = video.currentTime;
    const duration = video.duration || 89.2;
    const pct = (current / duration) * 100;

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', Math.round(pct));
    if (timeCurrent) timeCurrent.textContent = formatTime(current);
  });

  video.addEventListener('progress', () => {
    if (video.buffered.length > 0 && video.duration) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const pct = (bufferedEnd / video.duration) * 100;
      if (progressBuffered) progressBuffered.style.width = `${pct}%`;
    }
  });

  function seekTo(e) {
    if (!video.duration || !progressWrap) return;
    const rect = progressWrap.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pos = (clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    video.currentTime = pos * video.duration;
    if (progressBar) progressBar.style.width = `${pos * 100}%`;
    if (timeCurrent) timeCurrent.textContent = formatTime(pos * video.duration);
  }

  if (progressWrap) {
    progressWrap.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      progressWrap.classList.add('is-scrubbing');
      seekTo(e);
      const onMouseMove = (ev) => {
        if (!isScrubbing) return;
        seekTo(ev);
      };
      const onMouseUp = () => {
        isScrubbing = false;
        progressWrap.classList.remove('is-scrubbing');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    progressWrap.addEventListener('touchstart', (e) => {
      isScrubbing = true;
      progressWrap.classList.add('is-scrubbing');
      seekTo(e);
    }, { passive: true });

    progressWrap.addEventListener('touchmove', (e) => {
      if (!isScrubbing) return;
      seekTo(e);
    }, { passive: true });

    progressWrap.addEventListener('touchend', () => {
      isScrubbing = false;
      progressWrap.classList.remove('is-scrubbing');
    });
  }

  function toggleMute() {
    video.muted = !video.muted;
    if (video.muted) {
      player.classList.add('is-muted');
    } else {
      player.classList.remove('is-muted');
    }
  }

  ctrlMuteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMute();
  });

  function toggleFullscreen() {
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFs) {
      if (player.requestFullscreen) {
        player.requestFullscreen();
      } else if (player.webkitRequestFullscreen) {
        player.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  ctrlFsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === player) {
      player.classList.add('is-fullscreen');
    } else {
      player.classList.remove('is-fullscreen');
    }
  });

  document.addEventListener('webkitfullscreenchange', () => {
    if (document.webkitFullscreenElement === player) {
      player.classList.add('is-fullscreen');
    } else {
      player.classList.remove('is-fullscreen');
    }
  });

  function showControls() {
    player.classList.remove('controls-hidden');
    startHideControlsTimer();
  }

  function startHideControlsTimer() {
    clearTimeout(hideControlsTimer);
    if (!video.paused && !video.ended) {
      hideControlsTimer = setTimeout(() => {
        if (!video.paused && !isScrubbing) {
          player.classList.add('controls-hidden');
        }
      }, 2500);
    }
  }

  player.addEventListener('mousemove', showControls);
  player.addEventListener('mouseleave', () => {
    if (!video.paused) player.classList.add('controls-hidden');
  });

  player.addEventListener('keydown', (e) => {
    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        e.preventDefault();
        togglePlay();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        video.currentTime = Math.min(video.duration || 89, video.currentTime + 5);
        break;
    }
  });
})();

/* ============================================================
   17. MOVEMENT & EXPRESSION — DANCE VIDEO PLAYER CONTROLLER
   Vertical reel player (9:16) with scrub, auto-hide, full mobile touch.
   ============================================================ */
(function initDanceVideo() {
  const player = qs('#dancePlayer');
  const video  = qs('#danceVideo');
  if (!player || !video) return;

  const centerBtn       = qs('#danceCenterBtn', player);
  const ctrlPlayBtn     = qs('#danceCtrlPlayBtn', player);
  const ctrlMuteBtn     = qs('#danceCtrlMuteBtn', player);
  const ctrlFsBtn       = qs('#danceCtrlFsBtn', player);
  const progressWrap    = qs('#danceProgressWrap', player);
  const progressBar     = qs('#danceProgressBar', player);
  const progressBuffered= qs('#danceProgressBuffered', player);
  const timeCurrent     = qs('#danceTimeCurrent', player);
  const timeDuration    = qs('#danceTimeDuration', player);
  const watchCta        = qs('#danceWatchCta');

  let isScrubbing = false;
  let hideControlsTimer = null;

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateDuration() {
    if (video.duration && !isNaN(video.duration)) {
      if (timeDuration) timeDuration.textContent = formatTime(video.duration);
    }
  }

  video.addEventListener('loadedmetadata', updateDuration);
  video.addEventListener('durationchange', updateDuration);
  if (video.readyState >= 1) updateDuration();

  function togglePlay() {
    if (video.paused || video.ended) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.warn('Playback prevented:', err));
      }
    } else {
      video.pause();
    }
  }

  video.addEventListener('play', () => {
    player.classList.add('is-playing');
    startHideControlsTimer();
    // Pause any other video
    qsa('video').forEach(v => {
      if (v !== video && !v.paused) v.pause();
    });
  });

  video.addEventListener('pause', () => {
    player.classList.remove('is-playing');
    clearTimeout(hideControlsTimer);
    player.classList.remove('controls-hidden');
  });

  video.addEventListener('ended', () => {
    player.classList.remove('is-playing');
    clearTimeout(hideControlsTimer);
    player.classList.remove('controls-hidden');
    if (progressBar) progressBar.style.width = '0%';
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', '0');
    if (timeCurrent) timeCurrent.textContent = '0:00';
  });

  centerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
    centerBtn.blur();
  });

  ctrlPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
    ctrlPlayBtn.blur();
  });

  // Smart Mobile Touch & Click on Video
  let touchStartX = 0;
  let touchStartY = 0;
  player.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    showControls();
  }, { passive: true });

  player.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (dx > 12 || dy > 12) return;
    }
    if (e.target.closest('#danceControls') || e.target.closest('#danceCenterBtn')) {
      return;
    }
    if (!video.paused && player.classList.contains('controls-hidden')) {
      showControls();
    } else {
      togglePlay();
    }
  });

  video.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  watchCta?.addEventListener('click', () => {
    const danceSection = qs('#dance');
    if (danceSection) {
      danceSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      if (video.paused) {
        video.play().catch(e => console.log('Autoplay blocked:', e));
      }
    }, 400);
  });

  video.addEventListener('timeupdate', () => {
    if (isScrubbing) return;
    const current = video.currentTime;
    const duration = video.duration || 154.7;
    const pct = (current / duration) * 100;

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', Math.round(pct));
    if (timeCurrent) timeCurrent.textContent = formatTime(current);
  });

  video.addEventListener('progress', () => {
    if (video.buffered.length > 0 && video.duration) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const pct = (bufferedEnd / video.duration) * 100;
      if (progressBuffered) progressBuffered.style.width = `${pct}%`;
    }
  });

  function seekTo(e) {
    if (!video.duration || !progressWrap) return;
    const rect = progressWrap.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pos = (clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    video.currentTime = pos * video.duration;
    if (progressBar) progressBar.style.width = `${pos * 100}%`;
    if (timeCurrent) timeCurrent.textContent = formatTime(pos * video.duration);
  }

  if (progressWrap) {
    progressWrap.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      progressWrap.classList.add('is-scrubbing');
      seekTo(e);
      const onMouseMove = (ev) => {
        if (!isScrubbing) return;
        seekTo(ev);
      };
      const onMouseUp = () => {
        isScrubbing = false;
        progressWrap.classList.remove('is-scrubbing');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    progressWrap.addEventListener('touchstart', (e) => {
      isScrubbing = true;
      progressWrap.classList.add('is-scrubbing');
      seekTo(e);
    }, { passive: true });

    progressWrap.addEventListener('touchmove', (e) => {
      if (!isScrubbing) return;
      seekTo(e);
    }, { passive: true });

    progressWrap.addEventListener('touchend', () => {
      isScrubbing = false;
      progressWrap.classList.remove('is-scrubbing');
    });
  }

  function toggleMute() {
    video.muted = !video.muted;
    if (video.muted) {
      player.classList.add('is-muted');
    } else {
      player.classList.remove('is-muted');
    }
  }

  ctrlMuteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMute();
  });

  function toggleFullscreen() {
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFs) {
      if (player.requestFullscreen) {
        player.requestFullscreen();
      } else if (player.webkitRequestFullscreen) {
        player.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  ctrlFsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === player) {
      player.classList.add('is-fullscreen');
    } else {
      player.classList.remove('is-fullscreen');
    }
  });

  document.addEventListener('webkitfullscreenchange', () => {
    if (document.webkitFullscreenElement === player) {
      player.classList.add('is-fullscreen');
    } else {
      player.classList.remove('is-fullscreen');
    }
  });

  function showControls() {
    player.classList.remove('controls-hidden');
    startHideControlsTimer();
  }

  function startHideControlsTimer() {
    clearTimeout(hideControlsTimer);
    if (!video.paused && !video.ended) {
      hideControlsTimer = setTimeout(() => {
        if (!video.paused && !isScrubbing) {
          player.classList.add('controls-hidden');
        }
      }, 2500);
    }
  }

  player.addEventListener('mousemove', showControls);
  player.addEventListener('mouseleave', () => {
    if (!video.paused) player.classList.add('controls-hidden');
  });

  player.addEventListener('keydown', (e) => {
    switch (e.key) {
      case ' ':
      case 'k':
      case 'K':
        e.preventDefault();
        togglePlay();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        video.currentTime = Math.min(video.duration || 154, video.currentTime + 5);
        break;
    }
  });
})();

/* ============================================================
   INIT LOG
   ============================================================ */
console.log('%c TAPSI TANDON — Anchor · Lifestyle Blogger · Entrepreneur', 'color:#c9a96e;font-family:serif;font-size:14px;font-weight:bold;');
console.log('%c Portfolio website. Image slots labeled with data-slot attributes.', 'color:#999;font-size:11px;');

/* ============================================================
   18. DYNAMIC FOOTER YEAR
   Keeps the copyright year current automatically.
   ============================================================ */
(function initFooterYear() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
