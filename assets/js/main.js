/* ==========================================================================
   LEVTRON INSTRUMENTS PVT LTD - INTERACTIVE JAVASCRIPT LOGIC
   ========================================================================== */

// 0. Dynamic Header & Footer Component Loader
async function loadHeaderAndFooter() {
  const headerPlaceholder = document.getElementById('header-placeholder') || document.getElementById('site-header');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (headerPlaceholder) {
    try {
      const response = await fetch('header.html');
      if (response.ok) {
        const html = await response.text();
        headerPlaceholder.innerHTML = html;
      }
    } catch (e) {
      console.warn('Could not load header.html via fetch:', e);
    }
  }

  if (footerPlaceholder) {
    try {
      const response = await fetch('footer.html');
      if (response.ok) {
        const html = await response.text();
        footerPlaceholder.innerHTML = html;
      }
    } catch (e) {
      console.warn('Could not load footer.html via fetch:', e);
    }
  }

  initNavEvents();
}

// 1. Navigation & Dropdown Event Handlers
function initNavEvents() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  const productsDropdown = document.getElementById('productsDropdown');
  const productsDropdownToggle = document.getElementById('productsDropdownToggle');


  // Mobile Menu Toggle
  if (mobileToggle && navLinks) {
    mobileToggle.onclick = function (e) {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
      }
    };

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  }

  // Dropdown Toggle (for mobile / touch) - Arrow button opens dropdown
  if (productsDropdownToggle && productsDropdown) {
    productsDropdownToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      productsDropdown.classList.toggle('open');
      productsDropdown.classList.toggle('active');
    });
  }

  // All Submenu Items Toggle (for mobile / touch)
  const hasSubItems = document.querySelectorAll('.nav-menu-item.has-sub');
  hasSubItems.forEach(item => {
    const link = item.querySelector('.nav-menu-link');
    if (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          const isOpen = item.classList.contains('open');
          hasSubItems.forEach(other => {
            other.classList.remove('open', 'active');
          });
          if (!isOpen) {
            item.classList.add('open', 'active');
          }
        }
      });
    }
  });

  // Set Active Nav Link based on Current Page URL & Query Params
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const pageParams = new URLSearchParams(window.location.search);
  const currentCategory = pageParams.get('category');
  const navItems = document.querySelectorAll('.nav-links .nav-item, .nav-links a');

  navItems.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('?')[0];

    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
      if (linkPath === 'products.html' && productsDropdownToggle) {
        productsDropdownToggle.classList.add('active');
      }
    } else {
      link.classList.remove('active');
    }
  });

  // Highlight specific dropdown item if category query param is matched
  if (currentCategory) {
    const dropdownItems = document.querySelectorAll('.nav-dropdown-item');
    dropdownItems.forEach(item => {
      const itemCat = item.getAttribute('data-category');
      if (itemCat === currentCategory) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}

// Initialize navigation on load with singleton guard
let appInitialized = false;
function initApp() {
  if (appInitialized) return;
  appInitialized = true;
  loadHeaderAndFooter();
  initPageScripts();
  initQuoteModal();
  initPdfModal();
  initProductTabsMarquee();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// 2. Main Page Scripts & Interactive Features
function initPageScripts() {
  const urlParams = new URLSearchParams(window.location.search);

  // Tab Switching Logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      this.classList.add('active');
      const contentElem = document.getElementById(targetTab);
      if (contentElem) {
        contentElem.classList.add('active');
      }
    });
  });

  // Products Filtering Search & Category Filter (for products.html)
  const searchInput = document.getElementById('productSearch');
  const categoryFilter = document.getElementById('categorySelect');
  const productCards = document.querySelectorAll('.product-card, .product-card-item');

  function filterProducts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : 'all';

    productCards.forEach(card => {
      const title = card.getAttribute('data-title') ? card.getAttribute('data-title').toLowerCase() : '';
      const category = card.getAttribute('data-category') ? card.getAttribute('data-category').toLowerCase() : '';
      const text = card.textContent.toLowerCase();

      const matchesSearch = searchTerm === '' || title.includes(searchTerm) || text.includes(searchTerm);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory || category.split(/\s+/).includes(selectedCategory);

      if (matchesSearch && matchesCategory) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }

  // Auto-select category from URL parameter on products.html
  const initialCategory = urlParams.get('category');
  if (initialCategory && categoryFilter) {
    categoryFilter.value = initialCategory;
    filterProducts();
    const catalogGrid = document.getElementById('catalogGrid') || document.getElementById('productGrid');
    if (catalogGrid) {
      setTimeout(() => {
        catalogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }

  // Auto-populate inquiry on contact.html
  const initialProduct = urlParams.get('product') || urlParams.get('category');
  const subjectInput = document.getElementById('subject');
  const productSelect = document.getElementById('productInterest');

  if (initialProduct) {
    const cleanName = decodeURIComponent(initialProduct);
    if (subjectInput && !subjectInput.value) {
      subjectInput.value = `Inquiry regarding: ${cleanName}`;
    }
    if (productSelect) {
      for (let opt of productSelect.options) {
        if (opt.value.toLowerCase() === cleanName.toLowerCase() || opt.text.toLowerCase().includes(cleanName.toLowerCase())) {
          productSelect.value = opt.value;
          break;
        }
      }
    }
  }

  // Contact Form Submission Simulation
  const contactForm = document.getElementById('inquiryForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Request...';
      }

      setTimeout(() => {
        alert('Thank you for contacting Levtron Instruments! Our engineering team will reach out to you within 24 hours.');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }, 1000);
    });
  }

  // Hero Section Auto Slider
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const sliderSection = document.querySelector('.hero-slider-section');

  if (heroSlides.length > 0) {
    let currentSlide = 0;
    let slideTimer = null;

    function goToSlide(index) {
      if (index >= heroSlides.length) currentSlide = 0;
      else if (index < 0) currentSlide = heroSlides.length - 1;
      else currentSlide = index;

      heroSlides.forEach((slide, i) => {
        if (i === currentSlide) slide.classList.add('active');
        else slide.classList.remove('active');
      });

      heroDots.forEach((dot, i) => {
        if (i === currentSlide) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }

    function autoNextSlide() {
      goToSlide(currentSlide + 1);
    }

    function startAutoSlide() {
      if (!slideTimer) slideTimer = setInterval(autoNextSlide, 1230);
    }

    function stopAutoSlide() {
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
      }
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoSlide(); goToSlide(currentSlide + 1); startAutoSlide(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoSlide(); goToSlide(currentSlide - 1); startAutoSlide(); });

    heroDots.forEach((dot, index) => {
      dot.addEventListener('click', () => { stopAutoSlide(); goToSlide(index); startAutoSlide(); });
    });

    if (sliderSection) {
      sliderSection.addEventListener('mouseenter', stopAutoSlide);
      sliderSection.addEventListener('mouseleave', startAutoSlide);
    }

    startAutoSlide();
  }

  // Flagship Products Carousel - Seamless Infinite Loop & Auto-scroll
  const track = document.getElementById('productsTrack');
  const carouselWrapper = document.querySelector('.products-carousel-wrapper');
  const pPrevBtn = document.getElementById('productPrev');
  const pNextBtn = document.getElementById('productNext');
  const pDotsContainer = document.getElementById('productDots');

  if (track && !track.dataset.carouselInit) {
    track.dataset.carouselInit = 'true';
    const originalSlides = Array.from(track.children);
    const totalOriginals = originalSlides.length;

    if (totalOriginals > 0) {
      // Create cloned sets before and after for seamless infinite wrapping
      const fragmentBefore = document.createDocumentFragment();
      originalSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone-slide');
        fragmentBefore.appendChild(clone);
      });
      track.insertBefore(fragmentBefore, track.firstChild);

      const fragmentAfter = document.createDocumentFragment();
      originalSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone-slide');
        fragmentAfter.appendChild(clone);
      });
      track.appendChild(fragmentAfter);

      let pCurrentIndex = totalOriginals; // Start at the first original slide
      let isTransitioning = false;
      let transitionSafetyTimer = null;
      let pTimer = null;

      function getCardsPerPage() {
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
      }

      function updateTrackPosition(withAnimation = true) {
        const perPage = getCardsPerPage();
        const cardWidth = 100 / perPage;
        if (withAnimation) {
          track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
          track.style.transition = 'none';
        }
        track.style.transform = `translateX(-${pCurrentIndex * cardWidth}%)`;
        updateProductDots();
      }

      function updateProductDots() {
        if (!pDotsContainer) return;
        const normalizedIndex = ((pCurrentIndex - totalOriginals) % totalOriginals + totalOriginals) % totalOriginals;
        let dotsHtml = '';
        for (let i = 0; i < totalOriginals; i++) {
          dotsHtml += `<span class="dot ${i === normalizedIndex ? 'active' : ''}" data-pindex="${i}"></span>`;
        }
        pDotsContainer.innerHTML = dotsHtml;

        const dots = pDotsContainer.querySelectorAll('.dot');
        dots.forEach(dot => {
          dot.addEventListener('click', function () {
            if (isTransitioning) return;
            const targetIndex = parseInt(this.getAttribute('data-pindex'), 10);
            stopProductAuto();
            isTransitioning = true;
            pCurrentIndex = totalOriginals + targetIndex;
            updateTrackPosition(true);
            setTransitionSafety();
            startProductAuto();
          });
        });
      }

      function setTransitionSafety() {
        clearTimeout(transitionSafetyTimer);
        transitionSafetyTimer = setTimeout(() => {
          isTransitioning = false;
          handleWrap();
        }, 650);
      }

      function handleWrap() {
        if (pCurrentIndex >= totalOriginals * 2) {
          pCurrentIndex = pCurrentIndex - totalOriginals;
          updateTrackPosition(false);
        } else if (pCurrentIndex < totalOriginals) {
          pCurrentIndex = pCurrentIndex + totalOriginals;
          updateTrackPosition(false);
        }
      }

      function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        pCurrentIndex++;
        updateTrackPosition(true);
        setTransitionSafety();
      }

      function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        pCurrentIndex--;
        updateTrackPosition(true);
        setTransitionSafety();
      }

      track.addEventListener('transitionend', () => {
        isTransitioning = false;
        clearTimeout(transitionSafetyTimer);
        handleWrap();
      });

      function startProductAuto() {
        if (!pTimer) {
          pTimer = setInterval(() => {
            nextSlide();
          }, 1700);
        }
      }

      function stopProductAuto() {
        if (pTimer) {
          clearInterval(pTimer);
          pTimer = null;
        }
      }

      if (pNextBtn) {
        pNextBtn.addEventListener('click', () => {
          stopProductAuto();
          nextSlide();
          startProductAuto();
        });
      }

      if (pPrevBtn) {
        pPrevBtn.addEventListener('click', () => {
          stopProductAuto();
          prevSlide();
          startProductAuto();
        });
      }

      // Pause auto-scroll ONLY when mouse hovers over carousel / images
      if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', stopProductAuto);
        carouselWrapper.addEventListener('mouseleave', startProductAuto);
      }

      // Also attach hover pause directly to all card elements and images
      track.addEventListener('mouseenter', stopProductAuto);
      track.addEventListener('mouseleave', startProductAuto);

      // Touch swipe support
      let touchStartX = 0;
      let touchEndX = 0;

      track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopProductAuto();
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 40) {
          nextSlide();
        } else if (touchEndX - touchStartX > 40) {
          prevSlide();
        }
        startProductAuto();
      }, { passive: true });

      // Handle visibility changes (browser tab switch)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopProductAuto();
        } else {
          startProductAuto();
        }
      });

      window.addEventListener('resize', () => {
        updateTrackPosition(false);
      });

      // Initial start
      updateTrackPosition(false);
      startProductAuto();
    }
  }

  // Client Reviews Carousel - Seamless Infinite Loop & Auto-scroll
  const reviewTrack = document.getElementById('reviewsTrack');
  const reviewWrapper = document.querySelector('.reviews-carousel-wrapper');
  const rPrevBtn = document.getElementById('reviewPrev');
  const rNextBtn = document.getElementById('reviewNext');
  const rDotsContainer = document.getElementById('reviewDots');

  if (reviewTrack && !reviewTrack.dataset.carouselInit) {
    reviewTrack.dataset.carouselInit = 'true';
    const originalReviewSlides = Array.from(reviewTrack.children);
    const totalOriginalReviews = originalReviewSlides.length;

    if (totalOriginalReviews > 0) {
      // Create cloned sets before and after for seamless infinite wrapping
      const fragmentBefore = document.createDocumentFragment();
      originalReviewSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone-slide');
        fragmentBefore.appendChild(clone);
      });
      reviewTrack.insertBefore(fragmentBefore, reviewTrack.firstChild);

      const fragmentAfter = document.createDocumentFragment();
      originalReviewSlides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.classList.add('clone-slide');
        fragmentAfter.appendChild(clone);
      });
      reviewTrack.appendChild(fragmentAfter);

      let rCurrentIndex = totalOriginalReviews; // Start at first original slide
      let rIsTransitioning = false;
      let rTransitionSafetyTimer = null;
      let rTimer = null;

      function getReviewsPerPage() {
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
      }

      function updateReviewTrackPosition(withAnimation = true) {
        const perPage = getReviewsPerPage();
        const cardWidth = 100 / perPage;
        if (withAnimation) {
          reviewTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
          reviewTrack.style.transition = 'none';
        }
        reviewTrack.style.transform = `translateX(-${rCurrentIndex * cardWidth}%)`;
        updateReviewDots();
      }

      function updateReviewDots() {
        if (!rDotsContainer) return;
        const normalizedIndex = ((rCurrentIndex - totalOriginalReviews) % totalOriginalReviews + totalOriginalReviews) % totalOriginalReviews;
        let dotsHtml = '';
        for (let i = 0; i < totalOriginalReviews; i++) {
          dotsHtml += `<span class="dot ${i === normalizedIndex ? 'active' : ''}" data-rindex="${i}"></span>`;
        }
        rDotsContainer.innerHTML = dotsHtml;

        const dots = rDotsContainer.querySelectorAll('.dot');
        dots.forEach(dot => {
          dot.addEventListener('click', function () {
            if (rIsTransitioning) return;
            const targetIndex = parseInt(this.getAttribute('data-rindex'), 10);
            stopReviewAuto();
            rIsTransitioning = true;
            rCurrentIndex = totalOriginalReviews + targetIndex;
            updateReviewTrackPosition(true);
            setReviewTransitionSafety();
            startReviewAuto();
          });
        });
      }

      function setReviewTransitionSafety() {
        clearTimeout(rTransitionSafetyTimer);
        rTransitionSafetyTimer = setTimeout(() => {
          rIsTransitioning = false;
          handleReviewWrap();
        }, 650);
      }

      function handleReviewWrap() {
        if (rCurrentIndex >= totalOriginalReviews * 2) {
          rCurrentIndex = rCurrentIndex - totalOriginalReviews;
          updateReviewTrackPosition(false);
        } else if (rCurrentIndex < totalOriginalReviews) {
          rCurrentIndex = rCurrentIndex + totalOriginalReviews;
          updateReviewTrackPosition(false);
        }
      }

      function nextReviewSlide() {
        if (rIsTransitioning) return;
        rIsTransitioning = true;
        rCurrentIndex++;
        updateReviewTrackPosition(true);
        setReviewTransitionSafety();
      }

      function prevReviewSlide() {
        if (rIsTransitioning) return;
        rIsTransitioning = true;
        rCurrentIndex--;
        updateReviewTrackPosition(true);
        setReviewTransitionSafety();
      }

      reviewTrack.addEventListener('transitionend', () => {
        rIsTransitioning = false;
        clearTimeout(rTransitionSafetyTimer);
        handleReviewWrap();
      });

      function startReviewAuto() {
        if (!rTimer) {
          rTimer = setInterval(() => {
            nextReviewSlide();
          }, 2400);
        }
      }

      function stopReviewAuto() {
        if (rTimer) {
          clearInterval(rTimer);
          rTimer = null;
        }
      }

      if (rNextBtn) {
        rNextBtn.addEventListener('click', () => {
          stopReviewAuto();
          nextReviewSlide();
          startReviewAuto();
        });
      }

      if (rPrevBtn) {
        rPrevBtn.addEventListener('click', () => {
          stopReviewAuto();
          prevReviewSlide();
          startReviewAuto();
        });
      }

      // Pause auto-scroll ONLY when mouse hovers over review carousel / cards
      if (reviewWrapper) {
        reviewWrapper.addEventListener('mouseenter', stopReviewAuto);
        reviewWrapper.addEventListener('mouseleave', startReviewAuto);
      }
      reviewTrack.addEventListener('mouseenter', stopReviewAuto);
      reviewTrack.addEventListener('mouseleave', startReviewAuto);

      // Touch swipe support
      let rTouchStartX = 0;
      let rTouchEndX = 0;

      reviewTrack.addEventListener('touchstart', (e) => {
        rTouchStartX = e.changedTouches[0].screenX;
        stopReviewAuto();
      }, { passive: true });

      reviewTrack.addEventListener('touchend', (e) => {
        rTouchEndX = e.changedTouches[0].screenX;
        if (rTouchStartX - rTouchEndX > 40) {
          nextReviewSlide();
        } else if (rTouchEndX - rTouchStartX > 40) {
          prevReviewSlide();
        }
        startReviewAuto();
      }, { passive: true });

      window.addEventListener('resize', () => {
        updateReviewTrackPosition(false);
      });

      // Initial start
      updateReviewTrackPosition(false);
      startReviewAuto();
    }
  }

  // 3. Initialize Scroll Reveal & Count Up Animations
  initScrollAnimations();
  initCountUpStats();
}

// Scroll-Triggered Reveal Animations Engine
function initScrollAnimations() {
  const targets = document.querySelectorAll(`
    .section-title,
    .about-image-wrapper,
    .about-grid-responsive > div,
    .stat-card,
    .product-card-slide,
    .review-card-slide,
    .glass-card,
    .feature-item,
    .gallery-item
  `);

  targets.forEach((el) => {
    if (!el.classList.contains('reveal-fade-up') &&
        !el.classList.contains('reveal-fade-left') &&
        !el.classList.contains('reveal-fade-right') &&
        !el.classList.contains('reveal-zoom-in')) {
      el.classList.add('reveal-fade-up');
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    targets.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver not supported
    targets.forEach(el => el.classList.add('revealed'));
  }
}

// Executive Stat Numbers Dynamic Count-Up Animation
function initCountUpStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          const hasPlus = text.includes('+');
          const numVal = parseInt(text.replace(/[^0-9]/g, ''), 10);

          if (!isNaN(numVal) && !el.dataset.animated) {
            el.dataset.animated = 'true';
            const duration = 1800;
            const startTime = performance.now();

            function updateCount(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic function
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const currentNum = Math.floor(easeProgress * numVal);
              el.textContent = currentNum.toLocaleString() + (hasPlus ? '+' : '');

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                el.textContent = text;
              }
            }

            requestAnimationFrame(updateCount);
          }
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    statNumbers.forEach(num => observer.observe(num));
  }
}

// Quick View Modal helpers
window.openProductModal = function (title, description, specs) {
  const modalBackdrop = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  if (modalBackdrop && modalTitle && modalBody) {
    modalTitle.textContent = title;
    modalBody.innerHTML = `
      <p style="color: var(--text-light); margin-bottom: 1.5rem; font-size: 1.05rem;">${description}</p>
      <div style="background: rgba(7,12,26,0.6); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-glass);">
        <h4 style="color: var(--primary-cyan); margin-bottom: 0.75rem; font-size: 1.1rem;">Technical Specifications:</h4>
        <ul style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.8;">
          ${specs ? specs.split('|').map(s => `<li>• ${s.trim()}</li>`).join('') : '<li>• High precision microprocessor-based logic</li><li>• Heavy-duty SS316 sensing elements</li><li>• IP66 Enclosures</li>'}
        </ul>
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <a href="contact.html?product=${encodeURIComponent(title)}" class="btn btn-primary btn-sm">Request Instant Quote</a>
        <button class="btn btn-secondary btn-sm" onclick="closeModal()">Close</button>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }
};

window.closeModal = function () {
  const modalBackdrop = document.getElementById('productModal');
  if (modalBackdrop) modalBackdrop.classList.remove('active');
};

// Mission & Vision Card Scroll Animation (Left-to-Right & Right-to-Left)
function initMissionVisionAnimation() {
  const missionCard = document.querySelector('.mission-poly-card');
  const visionCard = document.querySelector('.vision-poly-card');
  const container = document.querySelector('.mv-polygon-cards-grid');

  if (!container || !missionCard || !visionCard) return;

  if ('IntersectionObserver' in window) {
    // Reset and trigger when scrolled into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          missionCard.style.animation = 'none';
          visionCard.style.animation = 'none';
          // Trigger reflow
          void missionCard.offsetWidth;
          void visionCard.offsetWidth;
          missionCard.style.animation = 'slideInFromLeft 1s cubic-bezier(0.16, 1, 0.3, 1) both';
          visionCard.style.animation = 'slideInFromRight 1s cubic-bezier(0.16, 1, 0.3, 1) both';
        }
      });
    }, { threshold: 0.15 });

    observer.observe(container);
  }
}

// Call on startup
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initMissionVisionAnimation();
    initQuoteModal();
  });
} else {
  initMissionVisionAnimation();
  initQuoteModal();
}

// ==========================================================================
// ==========================================================================
// UNIVERSAL COMPACT REQUEST A QUOTE MODAL FORM SYSTEM
// ==========================================================================
function initQuoteModal() {
  if (!document.getElementById('quoteModal')) {
    const modalHTML = `
      <div class="modal-backdrop" id="quoteModal">
        <div class="modal-box quote-modal-box">
          <div class="quote-modal-header-bar">
            <h3><span class="header-calc-icon" style="font-size: 1.25rem;">🎛️</span> Request Industrial Quote</h3>
            <button class="quote-modal-close-btn" id="quoteModalClose" onclick="closeQuoteModal()" aria-label="Close Modal"><i class="fas fa-times"></i></button>
          </div>
          
          <div class="quote-modal-body">
            <form id="quoteModalForm" onsubmit="handleQuoteModalSubmit(event)">
              
              <!-- Field 1: Product / Service Required -->
              <div class="quote-field-group">
                <label for="quoteProduct">Product / Service Required <span class="req-star">*</span></label>
                <select id="quoteProduct" required>
                  <option value="">Select Required Service</option>
                  <optgroup label="Level Switches (Point Level)">
                    <option value="RFLS-100S Compact RF Admittance Switch (Solids)">RFLS-100S Compact RF Admittance Switch (Solids)</option>
                    <option value="RFLS-100L Compact RF Admittance Switch (Liquids)">RFLS-100L Compact RF Admittance Switch (Liquids)</option>
                    <option value="VFLS-200S Vibrating Fork Level Switch">VFLS-200S Vibrating Fork Level Switch (Solids)</option>
                    <option value="RFLS-300S Standard RF Admittance Level Switch">RFLS-300S Standard RF Admittance (Rod Type)</option>
                    <option value="RFLS-300L Full PTFE RF Admittance (Liquids)">RFLS-300L Standard RF Admittance (Full PTFE)</option>
                    <option value="RFLS-300SR Rope Type RF Admittance (Deep Silo)">RFLS-300SR Rope Type RF Admittance (Deep Silos)</option>
                    <option value="RFLS-300SD Disc Probe RF Admittance (Chute)">RFLS-300SD Disc Probe RF Admittance (Chutes)</option>
                    <option value="RFLS-300HD Heavy Duty RF Admittance Level Switch">RFLS-300HD Heavy Duty RF Admittance (High Impact)</option>
                    <option value="VFLS-400S Compact Vibrating Fork Level Switch">VFLS-400S Compact Vibrating Fork (Grains/Powders)</option>
                    <option value="VRLS-500S Vibrating Rod Level Switch">VRLS-500S Vibrating Rod Level Switch</option>
                    <option value="RPLS-600S Rotating Paddle Level Switch">RPLS-600S Rotating Paddle Level Switch</option>
                    <option value="VFLS-700L Flameproof Liquid Fork Level Switch">VFLS-700L Flameproof Liquid Vibrating Fork</option>
                    <option value="MVFLS-800L Miniature Vibrating Fork Level Switch">MVFLS-800L Miniature Vibrating Fork (40mm)</option>
                    <option value="CPLS-900S Capacitance Level Switch">CPLS-900S Capacitance Level Switch (Solids)</option>
                    <option value="MCLS-900L Minicap Capacitive Level Sensor">MCLS-900L Miniature Capacitive Switch (Liquids)</option>
                    <option value="IPLS-1000L Infra Point Level Switch">IPLS-1000L Infra Point Level Switch</option>
                    <option value="MFLS-1300L Multi-Point Float Level Switch">MFLS-1300L Top Mounted Float Level Switch</option>
                    <option value="RDLS-1400S Diaphragm Level Switch">RDLS-1400S Rubber Diaphragm Level Switch</option>
                    <option value="SDLS-1500S Stainless Steel Diaphragm Switch">SDLS-1500S Stainless Steel Diaphragm Switch</option>
                    <option value="HFLS-1600L Side Mounted Magnetic Float Switch">HFLS-1600L Horizontal Float Switch (Side Mount)</option>
                    <option value="CTLS-1700L Conductivity Level Switch">CTLS-1700L Conductivity Level Controller</option>
                  </optgroup>
                  <optgroup label="Level Transmitters (Continuous Level)">
                    <option value="FMLT-1800LS 80GHz FMCW Radar Level Transmitter">FMLT-1800LS 80GHz Radar Level Transmitter</option>
                    <option value="CPLT-1200L Continuous Capacitance Level Transmitter">CPLT-1200L Capacitance Level Transmitter</option>
                    <option value="CPLT-1200F Fuel Level Transmitter">CPLT-1200F Fuel Level Transmitter</option>
                    <option value="HSLT-2000L Hydrostatic Submersible Transmitter">HSLT-2000L Submersible Level Transmitter</option>
                    <option value="LULT-2300L Ultrasonic Level Transmitter">LULT-2300L Ultrasonic Level Transmitter</option>
                    <option value="MFLT-1100L Float Level Transmitter">MFLT-1100L Magnetic Float Level Transmitter</option>
                  </optgroup>
                  <optgroup label="Level Indicators & Gauges">
                    <option value="LMLT-2100LT Magnetic Level Gauge & Indicator">LMLT-2100LT Magnetic Level Gauge & Indicator</option>
                    <option value="LTLI-2200L Tubular Level Indicator">LTLI-2200L Tubular Level Indicator</option>
                    <option value="FBLI-2400L Float and Board Level Indicator">FBLI-2400L Float & Board Level Indicator</option>
                  </optgroup>
                  <optgroup label="Pressure & Other Instruments">
                    <option value="QYB100 Piezoresistive Pressure Transmitter">QYB100 Piezoresistive Pressure Transmitter</option>
                    <option value="Custom Engineered Level Solution">Other / Custom Engineered Solution</option>
                  </optgroup>
                </select>
              </div>

              <!-- Row 2: Full Name & Company Name -->
              <div class="quote-form-row-2">
                <div class="quote-field-group">
                  <label for="quoteName">Full Name <span class="req-star">*</span></label>
                  <input type="text" id="quoteName" placeholder="John Doe" required>
                </div>
                <div class="quote-field-group">
                  <label for="quoteCompany">Company Name</label>
                  <input type="text" id="quoteCompany" placeholder="Your Industrial Firm">
                </div>
              </div>

              <!-- Row 3: Phone Number & Email Address -->
              <div class="quote-form-row-2">
                <div class="quote-field-group">
                  <label for="quotePhone">Phone Number <span class="req-star">*</span></label>
                  <input type="tel" id="quotePhone" placeholder="+91 9876543210" required>
                </div>
                <div class="quote-field-group">
                  <label for="quoteEmail">Email Address <span class="req-star">*</span></label>
                  <input type="email" id="quoteEmail" placeholder="name@company.com" required>
                </div>
              </div>

              <!-- Row 4: Project Specifications / Requirements -->
              <div class="quote-field-group">
                <label for="quoteMessage">Project Specifications / Requirements</label>
                <textarea id="quoteMessage" rows="3" placeholder="Mention material thickness, dimensions, quantity, or specific drawing details..."></textarea>
              </div>

              <div id="quoteSuccessMsg" style="display: none; padding: 0.65rem 0.85rem; background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; color: #065f46; font-size: 0.86rem; font-weight: 600; margin-bottom: 0.85rem; text-align: center;">
                <i class="fas fa-check-circle" style="color: #10b981; margin-right: 5px;"></i>
                Quotation request submitted! Our engineering team will contact you shortly.
              </div>

              <!-- Centered Submit Button -->
              <div class="quote-submit-center-wrap">
                <button type="submit" class="quote-btn-submit-blue" id="quoteSubmitBtn">
                  <i class="fas fa-paper-plane"></i> Submit Quote Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('quoteModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeQuoteModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeQuoteModal();
    });
  }

  // Intercept all "Get Quote" triggers
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (!target) return;

    // Do not intercept if click is inside the quote modal
    if (target.closest('#quoteModal') || target.closest('.quote-modal-box')) return;

    const text = (target.textContent || '').trim().toLowerCase();
    const href = target.getAttribute('href') || '';
    const isExplicitQuote = target.classList.contains('nav-quote-btn') || 
                            target.classList.contains('btn-quote-trigger') ||
                            target.id === 'quoteModalTrigger';

    // Don't intercept regular "Contact Us" navigation link
    if (text === 'contact us' || text === 'contact' || target.getAttribute('id') === 'contactNavLink') {
      return;
    }

    // Intercept if button has "quote" text or quote trigger class or product query
    if (isExplicitQuote || text.includes('quote') || href.includes('contact.html?product=')) {
      e.preventDefault();
      
      let productName = '';
      if (href.includes('product=')) {
        try {
          const urlParams = new URLSearchParams(href.split('?')[1]);
          productName = decodeURIComponent(urlParams.get('product') || '');
        } catch (err) {}
      }
      
      if (!productName) {
        const card = target.closest('.product-card, .product-card-slide, .product-card-item');
        if (card) {
          const titleEl = card.querySelector('h3, h2, [data-title]');
          if (titleEl) productName = titleEl.textContent.trim();
        }
      }

      // Check single product page details
      if (!productName) {
        const pageH2 = document.querySelector('.shop-details-section h2');
        const pageH1 = document.querySelector('.breadcrumbs-content h1');
        const pagePath = window.location.pathname.split('/').pop() || '';
        
        if (pageH2) {
          productName = pageH2.textContent.trim();
        } else if (pageH1) {
          productName = pageH1.textContent.trim();
        } else if (pagePath.startsWith('product-')) {
          productName = pagePath.replace('product-', '').replace('.html', '').toUpperCase();
        }
      }

      openQuoteModal(productName);
    }
  });
}

window.openQuoteModal = function (productName) {
  let modal = document.getElementById('quoteModal');
  if (!modal) {
    initQuoteModal();
    modal = document.getElementById('quoteModal');
  }

  const prodSelect = document.getElementById('quoteProduct');
  const successMsg = document.getElementById('quoteSuccessMsg');
  const form = document.getElementById('quoteModalForm');

  if (successMsg) successMsg.style.display = 'none';
  if (form) form.reset();

  // If not passed, check page content
  if (!productName) {
    const pageH2 = document.querySelector('.shop-details-section h2');
    const pageH1 = document.querySelector('.breadcrumbs-content h1');
    const pagePath = window.location.pathname.split('/').pop() || '';
    if (pageH2) productName = pageH2.textContent.trim();
    else if (pageH1) productName = pageH1.textContent.trim();
    else if (pagePath.startsWith('product-')) {
      productName = pagePath.replace('product-', '').replace('.html', '').toUpperCase();
    }
  }

  if (productName && prodSelect) {
    let matchedIndex = -1;
    const cleanSearch = productName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Try exact or substring alphanumeric match
    for (let i = 0; i < prodSelect.options.length; i++) {
      const opt = prodSelect.options[i];
      if (!opt.value) continue;
      const optClean = (opt.value + ' ' + opt.text).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (optClean.includes(cleanSearch) || cleanSearch.includes(optClean.slice(0, 12))) {
        matchedIndex = i;
        break;
      }
    }

    // 2. Try matching model codes (e.g. RFLS-100L, 100L, VFLS-200S, etc.)
    if (matchedIndex === -1) {
      const modelMatch = productName.match(/[A-Za-z]{2,5}-?[0-9]{3,4}[A-Za-z]{0,3}/i) || 
                         window.location.pathname.match(/product-([a-z0-9-]+)\.html/i);
      if (modelMatch) {
        const code = (modelMatch[1] || modelMatch[0]).replace(/[^a-z0-9]/gi, '').toLowerCase();
        for (let i = 0; i < prodSelect.options.length; i++) {
          const opt = prodSelect.options[i];
          if (!opt.value) continue;
          const optClean = opt.value.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (optClean.includes(code)) {
            matchedIndex = i;
            break;
          }
        }
      }
    }

    if (matchedIndex > 0) {
      prodSelect.selectedIndex = matchedIndex;
    } else {
      prodSelect.selectedIndex = 0;
    }
  } else {
    if (prodSelect) prodSelect.selectedIndex = 0;
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeQuoteModal = function () {
  const modal = document.getElementById('quoteModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.handleQuoteModalSubmit = function (e) {
  e.preventDefault();
  const product = document.getElementById('quoteProduct').value;
  const name = document.getElementById('quoteName').value;
  const company = document.getElementById('quoteCompany') ? document.getElementById('quoteCompany').value : '';
  const phone = document.getElementById('quotePhone').value;
  const email = document.getElementById('quoteEmail').value;
  const message = document.getElementById('quoteMessage') ? document.getElementById('quoteMessage').value : '';

  const btn = document.getElementById('quoteSubmitBtn');
  const successMsg = document.getElementById('quoteSuccessMsg');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
  }

  // Save customer contact info for convenience
  try {
    localStorage.removeItem('levtron_customer_unlocked');
    localStorage.setItem('levtron_customer_info', JSON.stringify({ name, email, phone, company }));
  } catch (err) {}

  // Send Lead Email to admin: bhagyashripatare07@gmail.com
  try {
    fetch('https://formsubmit.co/ajax/88cf2c5d72c37b46a01c8c24f6a4e5f5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `New Industrial Quote Request: ${product}`,
        _template: 'table',
        _captcha: 'false',
        'Customer Name': name,
        'Phone Number': phone,
        'Email Address': email,
        'Company Name': company || 'N/A',
        'Product Required': product,
        'Project Specifications': message || 'N/A',
        'Source Page': window.location.href,
        'Date & Time': new Date().toLocaleString()
      })
    }).catch(err => console.log('Quote notification status:', err));
  } catch (err) {}

  setTimeout(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check"></i> Quote Submitted!';
    }
    if (successMsg) {
      successMsg.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981; margin-right: 5px;"></i> Thank you <strong>${name}</strong>! Your quote request for <strong>${product}</strong> has been received. Our sales team will contact you shortly at ${phone} / ${email}.`;
      successMsg.style.display = 'block';
    }

    setTimeout(() => {
      closeQuoteModal();
      if (btn) btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Quote Request';
    }, 3200);
  }, 700);
};

// ==========================================================================
// UNIVERSAL ON-SCREEN PDF VIEWER & CUSTOMER LEAD FORM GATE SYSTEM
// ==========================================================================
window._targetPdfUrl = '';
window._targetPdfTitle = '';

function initPdfModal() {
  // 1. PDF Gate Form Modal (Customer Form before viewing PDF)
  if (!document.getElementById('pdfGateModal')) {
    const gateModalHTML = `
      <div class="modal-backdrop" id="pdfGateModal" style="z-index: 2050;">
        <div class="modal-box quote-modal-box">
          <div class="quote-modal-header-bar">
            <h3 style="display: flex; align-items: center; gap: 0.55rem; color: #ffffff; margin: 0; font-size: 1.15rem; font-weight: 700;">
              <i class="fas fa-file-pdf" style="color: #60a5fa;"></i>
              <span>Download & View Document</span>
            </h3>
            <button class="quote-modal-close-btn" onclick="closePdfGateModal()" aria-label="Close Modal"><i class="fas fa-times"></i></button>
          </div>
          
          <div class="quote-modal-body">
            <form id="pdfGateForm" onsubmit="handlePdfGateSubmit(event)">
              <!-- Requested Document Badge -->
              <div class="quote-field-group">
                <label style="color: #475569; font-size: 0.84rem; margin-bottom: 0.35rem;">Requested Document</label>
                <div style="padding: 0.6rem 0.85rem; background: #f1f5f9; border: 1.5px solid #cbd5e1; border-radius: 10px; font-weight: 700; color: #0f172a; font-size: 0.92rem; display: flex; align-items: center; gap: 0.5rem;">
                  <i class="fas fa-file-alt" style="color: var(--color-blue, #2563eb);"></i>
                  <span id="pdfGateDocName">Product Document</span>
                </div>
              </div>

              <!-- Row 1: Full Name & Company Name -->
              <div class="quote-form-row-2">
                <div class="quote-field-group">
                  <label for="pdfGateName">Full Name <span class="req-star">*</span></label>
                  <input type="text" id="pdfGateName" placeholder="John Doe" required>
                </div>
                <div class="quote-field-group">
                  <label for="pdfGateCompany">Company Name</label>
                  <input type="text" id="pdfGateCompany" placeholder="Your Industrial Firm">
                </div>
              </div>

              <!-- Row 2: Phone Number & Email Address -->
              <div class="quote-form-row-2">
                <div class="quote-field-group">
                  <label for="pdfGatePhone">Phone Number <span class="req-star">*</span></label>
                  <input type="tel" id="pdfGatePhone" placeholder="+91 9876543210" required>
                </div>
                <div class="quote-field-group">
                  <label for="pdfGateEmail">Email Address <span class="req-star">*</span></label>
                  <input type="email" id="pdfGateEmail" placeholder="name@company.com" required>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="quote-submit-center-wrap">
                <button type="submit" class="quote-btn-submit-blue" id="pdfGateSubmitBtn">
                  <i class="fas fa-file-pdf"></i> Access & View PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', gateModalHTML);

    const gateModal = document.getElementById('pdfGateModal');
    if (gateModal) {
      gateModal.addEventListener('click', (e) => {
        if (e.target === gateModal) closePdfGateModal();
      });
    }
  }

  // 2. On-Screen PDF Viewer Modal
  if (!document.getElementById('pdfModal')) {
    const modalHTML = `
      <div class="modal-backdrop" id="pdfModal" style="z-index: 2100;">
        <div class="modal-box pdf-modal-box" style="width: 92%; max-width: 960px; height: 86vh; max-height: 850px; padding: 0 !important; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 60px rgba(0,0,0,0.5);">
          <div class="quote-modal-header-bar" style="flex-shrink: 0; background: #1e293b; padding: 0.9rem 1.4rem; display: flex; align-items: center; justify-content: space-between;">
            <h3 style="display: flex; align-items: center; gap: 0.6rem; font-size: 1.05rem; color: #ffffff; margin: 0; font-weight: 700;">
              <i class="fas fa-file-pdf" style="color: #60a5fa;"></i>
              <span id="pdfModalTitle">Document Viewer</span>
            </h3>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <a href="#" id="pdfModalOpenTab" target="_blank" class="quote-modal-close-btn" style="text-decoration: none; font-size: 0.85rem;" title="Open in New Tab"><i class="fas fa-external-link-alt"></i></a>
              <a href="#" id="pdfModalDownload" download class="quote-modal-close-btn" style="text-decoration: none; font-size: 0.85rem;" title="Download PDF"><i class="fas fa-download"></i></a>
              <button class="quote-modal-close-btn" onclick="closePdfModal()" aria-label="Close Viewer"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <div id="pdfModalContainer" style="flex-grow: 1; width: 100%; height: calc(100% - 55px); background: #f8fafc; position: relative;">
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('pdfModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closePdfModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePdfGateModal();
        closePdfModal();
      }
    });
  }

  // Intercept all Catalog, Manual & PDF link clicks
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (!target) return;

    // Do not intercept the modal's own download button or close buttons or items inside modals
    if (target.id === 'pdfModalDownload' || target.id === 'pdfModalOpenTab' || target.closest('#pdfModal') || target.closest('#pdfGateModal') || target.closest('#quoteModal') || target.closest('#blogModal')) return;

    const href = target.getAttribute('href') || '';
    const title = target.getAttribute('title') || '';
    const text = (target.textContent || '').trim();

    // Avoid navigation header links to products page
    if (href === 'products.html' || href.startsWith('products.html?') || target.id === 'productsDropdownToggle' || target.classList.contains('nav-menu-link') || target.classList.contains('nav-link')) return;

    const isPdfHref = href.toLowerCase().includes('.pdf');
    const isDocClass = target.classList.contains('btn-pdf-viewer');
    const isDocText = /\b(catalog|manual|user manual|datasheet|brochure|catlog)\b/i.test(text) || 
                      /\b(catalog|manual|user manual|datasheet|brochure|catlog)\b/i.test(title);

    // If it's a PDF link or a button specifically for Catalog / Manual
    if (isPdfHref || isDocClass || (isDocText && !href.includes('contact.html') && !href.includes('about.html') && !href.includes('blog.html'))) {
      e.preventDefault();
      
      let docTitle = title || text || 'Product Document';
      // If docTitle is generic like "Catalog" or "Manual", attach the product name
      if (/^(catalog|manual|catlog|download catalog|user manual|view document)$/i.test(docTitle.trim())) {
        const pageH2 = document.querySelector('.shop-details-section h2');
        const pageH1 = document.querySelector('.breadcrumbs-content h1');
        const card = target.closest('.product-card, .product-card-slide, .product-card-item');
        const cardTitle = card ? card.querySelector('h3, h2, [data-title]') : null;
        
        let pName = '';
        if (cardTitle) pName = cardTitle.textContent.trim();
        else if (pageH2) pName = pageH2.textContent.trim();
        else if (pageH1) pName = pageH1.textContent.trim();

        if (pName) {
          docTitle = `${pName} - ${docTitle.trim()}`;
        }
      }
      
      // Check if one common access status has already been granted in localStorage
      let hasAccess = false;
      try {
        hasAccess = localStorage.getItem('pdfAccessGranted') === 'true';
      } catch (err) {}

      if (hasAccess) {
        // Both Catalog and Manual PDFs of all products open directly without showing the form again
        openPdfModal(href, docTitle);
      } else {
        // First click (Catalog or Manual) -> show the common customer form
        openPdfGateModal(href, docTitle);
      }
    }
  });
}

window.openPdfGateModal = function (url, title) {
  window._targetPdfUrl = url;
  window._targetPdfTitle = title || 'Document';

  let gateModal = document.getElementById('pdfGateModal');
  if (!gateModal) {
    initPdfModal();
    gateModal = document.getElementById('pdfGateModal');
  }

  const docNameEl = document.getElementById('pdfGateDocName');
  if (docNameEl) docNameEl.textContent = window._targetPdfTitle;

  const form = document.getElementById('pdfGateForm');
  if (form) {
    form.reset();
    try {
      const savedInfo = JSON.parse(localStorage.getItem('levtron_customer_info') || '{}');
      if (savedInfo.name && document.getElementById('pdfGateName')) document.getElementById('pdfGateName').value = savedInfo.name;
      if (savedInfo.company && document.getElementById('pdfGateCompany')) document.getElementById('pdfGateCompany').value = savedInfo.company;
      if (savedInfo.phone && document.getElementById('pdfGatePhone')) document.getElementById('pdfGatePhone').value = savedInfo.phone;
      if (savedInfo.email && document.getElementById('pdfGateEmail')) document.getElementById('pdfGateEmail').value = savedInfo.email;
    } catch (e) {}
  }

  if (gateModal) {
    gateModal.classList.add('active');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
};

window.closePdfGateModal = function () {
  const gateModal = document.getElementById('pdfGateModal');
  if (gateModal) {
    gateModal.classList.remove('active');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
};

window.handlePdfGateSubmit = function (e) {
  e.preventDefault();
  if (window._isSubmittingPdfGate) return; // Prevent duplicate form submissions

  const name = document.getElementById('pdfGateName') ? document.getElementById('pdfGateName').value.trim() : '';
  const company = document.getElementById('pdfGateCompany') ? document.getElementById('pdfGateCompany').value.trim() : '';
  const phone = document.getElementById('pdfGatePhone') ? document.getElementById('pdfGatePhone').value.trim() : '';
  const email = document.getElementById('pdfGateEmail') ? document.getElementById('pdfGateEmail').value.trim() : '';
  const docTitle = window._targetPdfTitle || 'Product Document';
  const pdfUrl = window._targetPdfUrl;

  const btn = document.getElementById('pdfGateSubmitBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying & Loading...';
  }
  window._isSubmittingPdfGate = true;

  // Send Lead Email to admin: bhagyashripatare07@gmail.com
  fetch('https://formsubmit.co/ajax/88cf2c5d72c37b46a01c8c24f6a4e5f5', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _subject: `New Document Access Lead: ${docTitle}`,
      _template: 'table',
      _captcha: 'false',
      'Customer Name': name,
      'Phone Number': phone,
      'Email Address': email,
      'Company Name': company || 'N/A',
      'Document Requested': docTitle,
      'Document URL': pdfUrl,
      'Source Page': window.location.href,
      'Date & Time': new Date().toLocaleString()
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Form submission failed');
    }
    return response.json();
  })
  .then(() => {
    // Save one common access status in localStorage
    try {
      localStorage.setItem('pdfAccessGranted', 'true');
      localStorage.setItem('levtron_customer_info', JSON.stringify({ name, email, phone, company }));
    } catch (err) {}

    closePdfGateModal();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-file-pdf"></i> Access & View PDF';
    }
    window._isSubmittingPdfGate = false;
    // Open the exact PDF the customer clicked first
    openPdfModal(pdfUrl, docTitle);
  })
  .catch(err => {
    console.error('Lead notification error:', err);
    // If form/email submission fails, do not grant access
    window._isSubmittingPdfGate = false;
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-file-pdf"></i> Access & View PDF';
    }
    alert('Submission could not be completed. Please check your internet connection and try again.');
  });
};

// Dynamic PDF.js Loader for 100% Flawless Mobile Touch Scrolling
function loadPdfJsLib() {
  return new Promise((resolve) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      resolve(window.pdfjsLib);
    };
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

async function renderPdfContent(url, container) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 250px; color: #2563eb; font-family: system-ui, sans-serif;">
      <i class="fas fa-spinner fa-spin" style="font-size: 2.2rem; margin-bottom: 0.75rem;"></i>
      <span style="font-size: 0.95rem; font-weight: 600; color: #475569;">Loading Document...</span>
    </div>
  `;

  const pdfjs = await loadPdfJsLib();
  if (!pdfjs) {
    container.innerHTML = `<iframe id="pdfModalIframe" src="${url}#toolbar=1&navpanes=0&view=FitH" style="width: 100%; height: 100%; border: none; display: block; background: #ffffff;" allow="fullscreen"></iframe>`;
    return;
  }

  try {
    const loadingTask = pdfjs.getDocument(url);
    const pdf = await loadingTask.promise;

    container.innerHTML = '';
    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = 'pdf-canvas-scroll-wrapper';
    scrollWrapper.style.cssText = 'width: 100%; height: 100%; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 12px 6px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 14px; background: #334155; touch-action: pan-y; overscroll-behavior: contain;';

    const containerWidth = container.clientWidth || (window.innerWidth * 0.92);

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const targetWidth = Math.min(containerWidth - 16, 850);
      const scale = targetWidth / unscaledViewport.width;
      const viewport = page.getViewport({ scale: scale * (window.devicePixelRatio > 1 ? 1.5 : 1.2) });

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-rendered-page';
      canvas.style.cssText = `width: 100%; max-width: ${targetWidth}px; height: auto; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.35); background: #ffffff; display: block; margin: 0 auto;`;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };

      await page.render(renderContext).promise;
      scrollWrapper.appendChild(canvas);
    }

    container.appendChild(scrollWrapper);
  } catch (err) {
    console.warn('PDF.js rendering fallback:', err);
    container.innerHTML = `<iframe id="pdfModalIframe" src="${url}#toolbar=1&navpanes=0&view=FitH" style="width: 100%; height: 100%; border: none; display: block; background: #ffffff;" allow="fullscreen"></iframe>`;
  }
}

window.openPdfModal = function (url, title) {
  let modal = document.getElementById('pdfModal');
  if (!modal) {
    initPdfModal();
    modal = document.getElementById('pdfModal');
  }

  const container = document.getElementById('pdfModalContainer');
  const titleEl = document.getElementById('pdfModalTitle');
  const downloadBtn = document.getElementById('pdfModalDownload');
  const openTabBtn = document.getElementById('pdfModalOpenTab');

  if (titleEl && title) titleEl.textContent = title;

  if (url && url !== '#' && url.trim() !== '') {
    if (downloadBtn) {
      downloadBtn.href = url;
      downloadBtn.style.display = 'inline-flex';
    }
    if (openTabBtn) {
      openTabBtn.href = url;
      openTabBtn.style.display = 'inline-flex';
    }
    if (container) {
      renderPdfContent(url, container);
    }
  } else {
    if (downloadBtn) downloadBtn.style.display = 'none';
    if (openTabBtn) openTabBtn.style.display = 'none';
    if (container) {
      container.innerHTML = `
        <div style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; text-align: center; color: #1e293b; padding: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; color: #2563eb;">📄</div>
          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 700;">Document Request Registered</h2>
          <p style="color: #64748b; max-width: 500px; line-height: 1.6; margin-bottom: 1.5rem;">
            Thank you! Your requested document for <strong>${title}</strong> has been noted.
          </p>
        </div>
      `;
    }
  }

  if (modal) {
    modal.classList.add('active');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
};

window.closePdfModal = function () {
  const modal = document.getElementById('pdfModal');
  const container = document.getElementById('pdfModalContainer');
  if (modal) {
    modal.classList.remove('active');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
  if (container) {
    container.innerHTML = '';
  }
};

// Global Scroll Entrance Animator for Animated Sections (e.g. .anim-section-bento)
document.addEventListener('DOMContentLoaded', function () {
  if ('IntersectionObserver' in window) {
    const globalSectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    const animSections = document.querySelectorAll(
      '.anim-section-bento, .anim-section-services, .anim-section-mission, .anim-section-industries, .anim-section-overview, .anim-section-stats'
    );
    animSections.forEach(sec => globalSectionObserver.observe(sec));

    // Viewport fallback
    setTimeout(() => {
      animSections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
          sec.classList.add('in-view');
        }
      });
    }, 100);
  } else {
    document.querySelectorAll('.anim-section-bento').forEach(el => el.classList.add('in-view'));
  }
});

// Product Detail Tabs Continuous Infinite Loop Marquee on Mobile
function initProductTabsMarquee() {
  const tabsHeaders = document.querySelectorAll('.product-tabs-header');
  tabsHeaders.forEach(header => {
    if (header.classList.contains('marquee-initialized')) return;

    const originalButtons = Array.from(header.children).filter(el => el.classList.contains('product-tab-btn'));
    if (originalButtons.length === 0) return;

    header.classList.add('marquee-initialized');

    const marqueeContainer = document.createElement('div');
    marqueeContainer.className = 'product-tabs-marquee-container';

    // Track 1 (Original buttons)
    const track1 = document.createElement('div');
    track1.className = 'product-tabs-marquee-track';
    originalButtons.forEach(btn => track1.appendChild(btn));

    // Track 2 (Clone for seamless continuous loop on mobile)
    const track2 = document.createElement('div');
    track2.className = 'product-tabs-marquee-track tabs-clone';
    track2.setAttribute('aria-hidden', 'true');
    originalButtons.forEach(btn => {
      const clone = btn.cloneNode(true);
      const clickAttr = btn.getAttribute('onclick');
      if (clickAttr) {
        clone.setAttribute('onclick', clickAttr);
      }
      track2.appendChild(clone);
    });

    marqueeContainer.appendChild(track1);
    marqueeContainer.appendChild(track2);
    header.appendChild(marqueeContainer);
  });
}

// Global Product Detail Tabs Switcher with Synchronized Active State Across Loops
window.switchProductTab = function (evt, tabId) {
  if (evt && evt.preventDefault) {
    evt.preventDefault();
  }

  const tabPanes = document.getElementsByClassName("product-tab-pane");
  for (let i = 0; i < tabPanes.length; i++) {
    tabPanes[i].style.display = "none";
    tabPanes[i].classList.remove("active");
  }

  const activePane = document.getElementById(tabId);
  if (activePane) {
    activePane.style.display = "block";
    activePane.classList.add("active");
  }

  // Synchronize active class on all buttons matching tabId (both main track & clone track)
  const allTabBtns = document.querySelectorAll(".product-tab-btn");
  allTabBtns.forEach(btn => {
    const clickAttr = btn.getAttribute("onclick") || "";
    const btnText = btn.textContent.toLowerCase();
    if (clickAttr.includes(tabId) ||
        (tabId === 'tabApplications' && btnText.includes('application')) ||
        (tabId === 'tabFeatures' && btnText.includes('feature')) ||
        (tabId === 'tabPrinciple' && btnText.includes('principle')) ||
        (tabId === 'tabSpecs' && (btnText.includes('spec') || btnText.includes('technical')))) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
};

// Global Delegated Click Handler for Product Tabs (Works on both Original & Cloned Looping Tabs)
document.addEventListener('click', function (e) {
  const tabBtn = e.target.closest('.product-tab-btn');
  if (!tabBtn) return;

  const clickAttr = tabBtn.getAttribute('onclick') || '';
  const match = clickAttr.match(/switchProductTab\s*\(\s*event\s*,\s*['"]([^'"]+)['"]\s*\)/i);
  let tabId = match ? match[1] : '';

  if (!tabId) {
    const text = tabBtn.textContent.toLowerCase();
    if (text.includes('application')) tabId = 'tabApplications';
    else if (text.includes('feature')) tabId = 'tabFeatures';
    else if (text.includes('principle')) tabId = 'tabPrinciple';
    else if (text.includes('spec') || text.includes('technical')) tabId = 'tabSpecs';
  }

  if (tabId) {
    window.switchProductTab(e, tabId);
  }
}, true);

// Also trigger tab marquee init on DOMContentLoaded or immediate execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductTabsMarquee);
} else {
  initProductTabsMarquee();
}

