// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.mobile-menu-button');
    const navbar = document.querySelector('.navbar');
    const navbarOverlay = document.querySelector('.navbar-overlay');
    const menuIcon = menuButton.querySelector('i');

    if (menuButton && navbar && navbarOverlay) {
        const toggleMenu = () => {
            navbar.classList.toggle('active');
            navbarOverlay.classList.toggle('active');
            const isActive = navbar.classList.contains('active');
            menuButton.setAttribute('aria-expanded', isActive);
            
            if (isActive) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
                menuButton.setAttribute('aria-label', 'Close Menu');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
            } else {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
                menuButton.setAttribute('aria-label', 'Open Menu');
                document.body.style.overflow = ''; // Restore scrolling
            }
        };

        menuButton.addEventListener('click', toggleMenu);
        // keyboard support: toggle on Enter or Space
        menuButton.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                toggleMenu();
            }
        });

        // close menu on Escape
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && navbar.classList.contains('active')) {
                toggleMenu();
                menuButton.focus();
            }
        });
        navbarOverlay.addEventListener('click', toggleMenu); // Close menu when clicking overlay

        // Close mobile menu when a nav link is clicked
        document.querySelectorAll('.navbar .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navbar.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }
});

// GSAP animations (if available)
(function setupGSAP() {
    if (typeof window.gsap === 'undefined') {
        // graceful fallback: leave existing CSS animations
        console.warn('GSAP not loaded — skipping JS animations.');
        return;
    }

    try {
        const gsap = window.gsap;
        // Hero intro timeline
        const tl = gsap.timeline({ defaults: { duration: 0.8, ease: 'power2.out' } });
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroCta = document.querySelector('.hero .btn-primary');
        tl.from(heroTitle, { y: 40, opacity: 0, scale: 0.98 })
          .from(heroSubtitle, { y: 20, opacity: 0 }, '-=0.45')
          .from(heroCta, { y: 12, opacity: 0, scale: 0.98 }, '-=0.4');

        // Nav items stagger
        const navLinks = document.querySelectorAll('.navbar .nav-link');
        if (navLinks && navLinks.length) {
            gsap.from(navLinks, { opacity: 0, y: -8, stagger: 0.08, duration: 0.45, ease: 'power2.out', delay: 0.1 });
        }

        // Product cards entrance on scroll (simple intersection + gsap)
        const productCards = document.querySelectorAll('.product-card');
        if (productCards && productCards.length) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        gsap.to(entry.target, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' });
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12 });

            productCards.forEach((card) => {
                // initial state
                gsap.set(card, { y: 20, opacity: 0, scale: 0.995 });
                io.observe(card);
            });
        }

        // Button micro-interaction
        document.querySelectorAll('.btn-primary').forEach(btn => {
            btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.02, duration: 0.18 }))
            btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.18 }))
        });
    } catch (err) {
        console.error('GSAP init failed:', err);
    }
})();

// Function to handle smooth scrolling to an element
function smoothScrollTo(element) {
    window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        smoothScrollTo(target); // Reuse the smooth scroll function
    });
});

// Back to top functionality
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// set current year in footer
document.addEventListener('DOMContentLoaded', () => {
    const y = new Date().getFullYear();
    const el = document.getElementById('copyright-year');
    if (el) el.textContent = y;
});

// Show/hide back-to-top button based on scroll
const backToTopBtn = document.getElementById('back-to-top');
function updateBackToTop() {
    if (window.scrollY > 300) {
        backToTopBtn.classList.remove('hidden');
        backToTopBtn.setAttribute('aria-hidden', 'false');
    } else {
        backToTopBtn.classList.add('hidden');
        backToTopBtn.setAttribute('aria-hidden', 'true');
    }
}
window.addEventListener('scroll', updateBackToTop);
updateBackToTop();

// Consolidated contact form submission handler (posts JSON to local API with fallback)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const responseEl = document.getElementById('formResponse');
        responseEl.setAttribute('aria-live', 'polite');

        // collect and validate
        const name = (form.querySelector('#name') && form.querySelector('#name').value || '').trim();
        const email = (form.querySelector('#email') && form.querySelector('#email').value || '').trim();
        const message = (form.querySelector('#message') && form.querySelector('#message').value || '').trim();

        if (!name || !email || !message) {
            responseEl.style.color = 'var(--error-color)';
            responseEl.textContent = 'Please complete all fields.';
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            responseEl.style.color = 'var(--error-color)';
            responseEl.textContent = 'Please enter a valid email address.';
            return;
        }

        // disable UI while sending
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-disabled', 'true');
        }
        responseEl.style.color = '';
        responseEl.textContent = 'Sending...';

        const payload = { name, email, message };

        // Try local API first (JSON). If that fails, fall back to external action (FormSubmit)
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                responseEl.style.color = 'var(--success-color)';
                responseEl.textContent = 'Thank you! Your message has been sent.';
                form.reset();
                // re-enable
                if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-disabled'); }
                return;
            }
            // non-OK status — fall through to fallback
            console.warn('Local /api/contact returned', res.status);
        } catch (err) {
            console.warn('Local /api/contact failed, will try fallback:', err.message);
        }

        // Fallback: submit to external action using the original form (multipart FormData)
        try {
            const formData = new FormData(form);
            const fallbackRes = await fetch(form.action, { method: form.method || 'POST', body: formData, headers: { 'Accept': 'application/json' } });
            if (fallbackRes.ok) {
                responseEl.style.color = 'var(--success-color)';
                responseEl.textContent = 'Thank you! Your message has been sent (via external service).';
                form.reset();
            } else {
                responseEl.style.color = 'var(--error-color)';
                responseEl.textContent = 'Unable to send message. Please try again later.';
                console.warn('Fallback submission returned', fallbackRes.status);
            }
        } catch (err) {
            responseEl.style.color = 'var(--error-color)';
            responseEl.textContent = 'Error sending message. Please try again later.';
            console.error('Fallback form submission error:', err);
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-disabled'); }
        }
    });
}

// Theme toggle with persistence
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
} else {
    themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});


// --- Global Socket.IO Connection ---
let socket;

// Resilient addMessage helper: defined early so other code can call it before full DOM initialization.
function addMessage(message, type) {
    try {
        const chatbotMessages = document.getElementById('chatbot-messages');
        if (!chatbotMessages) {
            // If UI not ready, log to console as fallback
            console.log((type || 'info') + ': ' + message);
            return;
        }
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type || 'info'}`;
        messageElement.textContent = message;
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    } catch (err) {
        console.log('addMessage error', err, message);
    }
}

/* Focus trap helpers used by modals/drawers */
function trapFocus(container) {
    if (!container) return;
    const focusable = container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function handleKey(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) { // shift + tab
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else { // tab
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
        if (e.key === 'Escape') {
            // allow callers to close their modal via Escape; we don't auto-close here
            container.dispatchEvent(new CustomEvent('escape')); 
        }
    }
    container.__focusHandler = handleKey;
    document.addEventListener('keydown', handleKey);
}

function releaseFocus(container) {
    if (!container || !container.__focusHandler) return;
    document.removeEventListener('keydown', container.__focusHandler);
    delete container.__focusHandler;
}

/* Toast helper for unobtrusive UI feedback */
function showToast(message, type = 'info', timeout = 4000) {
    try {
        const container = document.getElementById('toast-container');
        if (!container) {
            console.log(type + ': ' + message);
            return;
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'success' ? 'success' : (type === 'error' ? 'error' : '')}`.trim();
        toast.setAttribute('role', 'status');
        toast.innerHTML = `<div class="toast-body">${message}</div><button class="toast-close" aria-label="Dismiss">×</button>`;
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => { container.removeChild(toast); });
        container.appendChild(toast);
        // auto dismiss
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, timeout);
    } catch (err) { console.warn('showToast error', err); }
}

// NOTE: legacy `X-Admin-Password` header fallback removed for security.
// Admin requests should use session-based auth (login endpoint) only.

// Helper that performs admin API requests robustly:
// 1) try same-origin with credentials
// 2) try backend origin (window.__BACKEND_ORIGIN or http://localhost:3000) with credentials
// NOTE: legacy header-based fallback removed. Server must accept session cookies.
async function fetchAdmin(path, options = {}) {
    const opts = Object.assign({}, options);
    // Try same-origin relative path first
    try {
        const r = await fetch(path, Object.assign({ credentials: 'same-origin' }, opts));
        if (r && r.ok) return r;
    } catch (e) {
        // ignore and fallback
    }

    const backend = window.__BACKEND_ORIGIN || window.BACKEND_URL || 'http://localhost:3000';
    const url = path.startsWith('http') ? path : (backend.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path));

    try {
        const r2 = await fetch(url, Object.assign({ credentials: 'include' }, opts));
        if (r2 && r2.ok) return r2;
    } catch (e) {
        // ignore
    }
    // If nothing worked, return a 401-like Response so callers can check .ok
    return new Response(null, { status: 401, statusText: 'Unauthorized' });
}

function initializeSocket() {
    if (typeof io === 'undefined') {
        console.warn('Socket.IO client not loaded. Real-time features will be disabled.');
        return;
    }
    if (socket && socket.connected) {
        return;
    }
    try {
        socket = io();
        socket.on('connect', () => {
            console.log('Successfully connected to real-time server.');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from real-time server.');
        });
        // Centralized error handling
        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });
    } catch (err) {
        console.error('Failed to initialize socket connection:', err);
    }
}

// --- Realtime: connect to Socket.IO and fetch products ---
(function setupRealtime() {
    // Attempt to connect if Socket.IO client script is available
    if (typeof io === 'undefined') {
        // Dynamically load socket.io client
        const s = document.createElement('script');
        s.src = '/socket.io/socket.io.js';
        s.onload = () => {
            initializeSocket();
            addSocketListeners();
            fetchInitialData();
        };
        s.onerror = () => {
            console.warn('Socket.IO client failed to load from same-origin, falling back to CDN');
            // Try official CDN as a fallback
            const cdn = document.createElement('script');
            cdn.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
            cdn.onload = () => {
                console.log('Loaded Socket.IO client from CDN');
                initializeSocket();
                addSocketListeners();
                fetchInitialData();
            };
            cdn.onerror = () => console.warn('Socket.IO CDN failed to load');
            document.head.appendChild(cdn);
        };
        document.head.appendChild(s);
    } else {
        initializeSocket();
        addSocketListeners();
        fetchInitialData();
    }

    function addSocketListeners() {
        if (!socket) return;
        socket.on('products:update', renderProducts);
        socket.on('contact:received', (payload) => {
            console.log('Contact received (realtime):', payload);
            // If the admin messages view is open, refresh it
            const messagesContainer = document.getElementById('messages-container');
            if (messagesContainer && messagesContainer.querySelector('.messages-table')) {
                document.getElementById('load-messages-btn').click();
            }
        });
        socket.on('orders:new', (payload) => {
            console.log('New order (realtime):', payload);
            document.dispatchEvent(new CustomEvent('orders:changed', { detail: payload }));
        });
        socket.on('orders:update', (payload) => {
            console.log('Order updated (realtime):', payload);
            document.dispatchEvent(new CustomEvent('orders:changed', { detail: payload }));
        });
        socket.on('news:update', renderNews); // Centralized listener
    }

    function fetchInitialData() {
        // Try to load image manifest (generated by scripts/generate-images.js)
        try {
            // Try same-origin first, then backend origin fallback (useful when page is served statically)
            const tryManifest = async () => {
                try {
                    const r = await fetch('/data/image-manifest.json');
                    if (r && r.ok) return r.json();
                } catch (e) {}
                try {
                    const backend = window.__BACKEND_ORIGIN || window.BACKEND_URL || 'http://localhost:3000';
                    const r2 = await fetch((backend.replace(/\/$/, '') + '/data/image-manifest.json'));
                    if (r2 && r2.ok) return r2.json();
                } catch (e) {}
                return null;
            };
            tryManifest().then(m => { window.__imageManifest = m; });
        } catch (err) {
            window.__imageManifest = null;
        }
        // initial fetch for products (try same-origin then backend fallback)
        (async function loadProducts() {
            try {
                let res = null;
                try { res = await fetch('/api/products'); } catch (e) { res = null; }
                if (!res || !res.ok) {
                    const backend = window.__BACKEND_ORIGIN || window.BACKEND_URL || 'http://localhost:3000';
                    try { res = await fetch(backend.replace(/\/$/, '') + '/api/products'); } catch (e) { res = null; }
                }
                if (!res || !res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                renderProducts(data);
            } catch (err) {
                console.warn('Failed to load products', err);
                const container = document.getElementById('products-grid');
                if (container) {
                    container.innerHTML = '<p class="error-message">Could not load products at this time. Please try refreshing the page or start the backend (npm start).</p>';
                }
            }
        })();
        
        // initial fetch for news
        fetch('/api/news')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load news feed.');
                return response.json();
            })
            .then(renderNews)
            .catch(error => {
                console.error('Error loading news:', error);
                const newsGrid = document.getElementById('news-grid');
                if(newsGrid) {
                    newsGrid.innerHTML = '<p class="error-message">Unable to load latest news. Please check back later.</p>';
                }
            });
    }

    let allProducts = []; // Cache for searching

    function renderProducts(items) {
        if (!items) return;
        allProducts = items; // Cache the full list
        const container = document.getElementById('products-grid');
        if (!container) return;
        
        const searchTerm = document.getElementById('product-search').value.toLowerCase();
        const filteredItems = items.filter(item => 
            item.title.toLowerCase().includes(searchTerm) || 
            item.description.toLowerCase().includes(searchTerm)
        );

        container.innerHTML = '';
        if (filteredItems.length === 0) {
            container.innerHTML = '<p class="info-message">No products match your search.</p>';
            return;
        }

        function buildSrcsetsFor(src) {
            try {
                const m = window.__imageManifest || {};
                const entry = m && m[src];
                if (entry && entry.length) {
                    const jpg = entry.map(e => `${e.jpg} ${e.width}w`).join(', ');
                    const webp = entry.map(e => `${e.webp} ${e.width}w`).join(', ');
                    // fallback src: choose largest available jpg (last in sorted sizes)
                    const fallback = entry[entry.length - 1].jpg;
                    return { jpg, webp, fallback };
                }
            } catch (e) { /* ignore */ }
            return { jpg: `${src} 1x, ${src} 2x`, webp: '', fallback: src };
        }

        filteredItems.forEach(item => {
            const el = document.createElement('div');
            el.className = 'product-card';
            el.dataset.id = item.id;
            // Use srcset placeholders (1x, 2x) until responsive assets are generated
            const imgSrc = item.image || 'logo.png';
            const srcsets = buildSrcsetsFor(imgSrc);
            // Pre-calc numeric price for potential future use (0 if missing)
            const priceValue = parseFloat((item.price || '').replace(/[^0-9.-]+/g, '')) || 0;
            // If product already in cart, show its qty in the input
            const existing = cart.find(c => String(c.id) === String(item.id));
            const initialQty = existing ? (existing.qty || 1) : 1;

            // provide accessible labeling and keyboard focus
            const titleId = `product-title-${item.id}`;
            el.setAttribute('role', 'article');
            el.setAttribute('tabindex', '0');
            el.innerHTML = `
                <div class="product-media">
                    ${srcsets.webp ? `
                        <picture>
                            <source type="image/webp" srcset="${srcsets.webp}" sizes="(max-width:600px) 100vw, 33vw">
                            <source type="image/jpeg" srcset="${srcsets.jpg}" sizes="(max-width:600px) 100vw, 33vw">
                            <img src="${srcsets.fallback}" alt="${item.title}" class="product-img" loading="lazy">
                        </picture>
                    ` : `
                        <img src="${imgSrc}" srcset="${srcsets.jpg}" sizes="(max-width:600px) 100vw, 33vw" alt="${item.title}" class="product-img" loading="lazy">
                    `}
                </div>
                <div class="product-content">
                    <h3 id="${titleId}" class="product-title">${item.title}</h3>
                    <p class="product-description">${item.description}</p>
                    <div class="product-meta">
                        <div class="product-price" aria-hidden="true">${item.price}</div>
                        <div class="product-price-value sr-only">${priceValue}</div>
                    </div>
                    <div class="product-footer">
                        <div class="product-actions" role="group" aria-labelledby="${titleId}">
                            <div class="qty-stepper" role="group" aria-label="Quantity selector for ${item.title}">
                                <button type="button" class="qty-decr" aria-label="Decrease quantity for ${item.title}">−</button>
                                <input type="number" min="1" value="${initialQty}" class="quantity-input" aria-label="Quantity for ${item.title}">
                                <button type="button" class="qty-incr" aria-label="Increase quantity for ${item.title}">+</button>
                            </div>
                            <button type="button" class="btn btn-secondary add-to-cart-btn" aria-label="Add ${item.title} to cart">Add to cart</button>
                            <button type="button" class="btn btn-primary buy-now-btn" aria-label="Buy ${item.title} now">Buy now</button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(el);
        });
    }

    // News rendering function with Show More/Less functionality
    let allNewsData = [];
    let showingAllNews = false;
    const INITIAL_NEWS_COUNT = 6;

    function renderNews(data) {
        const newsGrid = document.getElementById('news-grid');
        const showMoreBtn = document.getElementById('show-more-news');
        const showLessBtn = document.getElementById('show-less-news');
        
        if (!newsGrid) return;
        
        allNewsData = data || [];
        newsGrid.innerHTML = '';
        
        if (allNewsData.length === 0) {
            newsGrid.innerHTML = '<p class="info-message">No news available at the moment.</p>';
            if (showMoreBtn) showMoreBtn.style.display = 'none';
            if (showLessBtn) showLessBtn.style.display = 'none';
            return;
        }
        
        // Determine how many news items to show
        const newsToShow = showingAllNews ? allNewsData : allNewsData.slice(0, INITIAL_NEWS_COUNT);
        
        newsToShow.forEach(newsItem => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            newsCard.innerHTML = `
                <div class="news-content">
                    <h3 class="news-title">${newsItem.title}</h3>
                    <p class="news-excerpt">${newsItem.excerpt}</p>
                    <div class="news-footer">
                        <span class="news-date"><i class="far fa-calendar"></i> ${newsItem.date}</span>
                        <a class="btn btn-text" href="${newsItem.link}" target="_blank" rel="noopener noreferrer">Read more <i class="fas fa-external-link-alt"></i></a>
                    </div>
                </div>
            `;
            newsGrid.appendChild(newsCard);
        });
        
        // Show/hide buttons based on news count
        if (showMoreBtn && showLessBtn) {
            if (allNewsData.length > INITIAL_NEWS_COUNT) {
                if (showingAllNews) {
                    showMoreBtn.style.display = 'none';
                    showLessBtn.style.display = 'inline-flex';
                } else {
                    showMoreBtn.style.display = 'inline-flex';
                    showLessBtn.style.display = 'none';
                }
            } else {
                showMoreBtn.style.display = 'none';
                showLessBtn.style.display = 'none';
            }
        }
    }
    
    // Show More button handler
    const showMoreBtn = document.getElementById('show-more-news');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            showingAllNews = true;
            renderNews(allNewsData);
            // Smooth scroll to show new content
            setTimeout(() => {
                const newsSection = document.getElementById('news');
                if (newsSection) {
                    window.scrollTo({
                        top: newsSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        });
    }
    
    // Show Less button handler
    const showLessBtn = document.getElementById('show-less-news');
    if (showLessBtn) {
        showLessBtn.addEventListener('click', () => {
            showingAllNews = false;
            renderNews(allNewsData);
            // Smooth scroll back to news section top
            setTimeout(() => {
                const newsSection = document.getElementById('news');
                if (newsSection) {
                    window.scrollTo({
                        top: newsSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        });
    }

    // Search functionality
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderProducts(allProducts);
        });
    }
})();

// --- Admin modal (demo) ---
(() => {
    const adminOpenBtn = document.getElementById('admin-open');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLoginCloseBtn = document.getElementById('admin-login-close');
    const adminLoginError = document.getElementById('admin-login-error');
    const adminPasswordInput = document.getElementById('admin-password');

    const adminPanel = document.getElementById('admin-panel');
    const adminClose = document.getElementById('admin-close');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    if (!adminOpenBtn || !adminLoginModal || !adminLoginForm || !adminLoginCloseBtn || !adminPanel || !adminClose || !adminLogoutBtn) return;

    const showLoginModal = () => {
        adminLoginModal.classList.remove('hidden');
        trapFocus(adminLoginModal);
        adminPasswordInput.focus();
    };

    const hideLoginModal = () => {
        adminLoginModal.classList.add('hidden');
        adminLoginError.style.display = 'none';
        adminLoginForm.reset();
        releaseFocus(adminLoginModal);
    };

    const showAdminPanel = () => {
        adminPanel.classList.remove('hidden');
        adminPanel.setAttribute('aria-hidden', 'false');
        trapFocus(adminPanel);
        // focus first actionable nav control for keyboard users
        const firstNav = adminPanel.querySelector('.admin-nav-btn');
        if (firstNav) firstNav.focus();
    };

    const hideAdminPanel = () => {
        adminPanel.classList.add('hidden');
        adminPanel.setAttribute('aria-hidden', 'true');
        releaseFocus(adminPanel);
    };

    // Check login status on page load (include credentials so session cookie is sent)
    async function checkAdminStatus() {
        // try same-origin session check first
        try {
            const r = await fetch('/api/admin/status', { credentials: 'same-origin' });
            if (r.ok) {
                const status = await r.json();
                if (status && status.isAdmin) adminLogoutBtn.classList.remove('hidden'); else adminLogoutBtn.classList.add('hidden');
                return;
            }
        } catch (e) {
            // ignore and try backend origin
        }

        // If frontend is served from a static host, try backend origin (common dev host: http://localhost:3000)
        try {
            const backend = (window.__BACKEND_ORIGIN || 'http://localhost:3000');
            const r2 = await fetch(backend + '/api/admin/status', { credentials: 'include' });
            if (r2.ok) {
                const status2 = await r2.json();
                if (status2 && status2.isAdmin) adminLogoutBtn.classList.remove('hidden'); else adminLogoutBtn.classList.add('hidden');
                return;
            }
        } catch (e) {
            // ignore
        }

        // No legacy header fallback: show logout only when session is active
        adminLogoutBtn.classList.add('hidden');
    }

    checkAdminStatus();

    adminOpenBtn.addEventListener('click', () => {
        // Check if already logged in (send credentials)
        fetch('/api/admin/status', { credentials: 'same-origin' })
            .then(r => {
                if (!r.ok) throw new Error('no-status');
                return r.json();
            })
            .then(status => {
                if (status && status.isAdmin) {
                    showAdminPanel();
                } else {
                    showLoginModal();
                }
            }).catch(() => showLoginModal());
    });

    adminLoginCloseBtn.addEventListener('click', hideLoginModal);
    adminClose.addEventListener('click', hideAdminPanel);

    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = adminPasswordInput.value;
        adminLoginError.style.display = 'none';

        // Helper to mark success in UI
        const onLoginSuccess = () => {
            // Do NOT store admin password in localStorage. Use session cookies only.
            hideLoginModal();
            showAdminPanel();
            adminLogoutBtn.classList.remove('hidden');
        };

        // If frontend and backend share origin, do a normal session login
        const sameOrigin = location.origin === window.location.origin;

        // Preferred: try session login on same origin
        if (sameOrigin) {
            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                if (response.ok) {
                    onLoginSuccess();
                    return;
                }
                adminLoginError.textContent = 'Incorrect password. Please try again.';
                adminLoginError.style.display = 'block';
                return;
            } catch (err) {
                // fallthrough to cross-origin fallback
            }
        }

        // Cross-origin / static-host fallback: try to contact backend directly.
        // We assume local backend at http://localhost:3000 during development.
        const backend = window.BACKEND_URL || 'http://localhost:3000';

        try {
            // Try session-style login (may require CORS with credentials on server)
            const resp = await fetch(`${backend}/api/admin/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            if (resp.ok) {
                onLoginSuccess();
                return;
            }
        } catch (err) {
            // likely CORS or network error — try header fallback next
            console.warn('Session login to backend failed:', err && err.message);
        }

        // No legacy header fallback is allowed. If session login to backend failed, show an error.
        adminLoginError.textContent = 'Incorrect password or backend not reachable. Ensure the server is running (http://localhost:3000) and that CORS allows credentials. Use the admin login form on the server host.';
        adminLoginError.style.display = 'block';
    });

    adminLogoutBtn.addEventListener('click', () => {
        if (!confirm('Logout from admin panel?')) return;
        adminLogoutBtn.classList.add('is-loading');
        adminLogoutBtn.setAttribute('aria-busy', 'true');
        fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
            .then(() => {
                hideAdminPanel();
                adminLogoutBtn.classList.add('hidden');
                showToast('Logged out', 'success');
            })
            .catch((err) => {
                console.error('Logout failed', err);
                showToast('Logout failed. Try again.', 'error');
            })
            .finally(() => {
                adminLogoutBtn.classList.remove('is-loading');
                adminLogoutBtn.removeAttribute('aria-busy');
            });
    });

    // Admin panel navigation
    const navButtons = {
        overview: document.getElementById('admin-overview-btn'),
        products: document.getElementById('admin-products-btn'),
        messages: document.getElementById('admin-messages-btn'),
        orders: document.getElementById('admin-orders-btn'),
    };

    const adminSections = {
        overview: document.getElementById('admin-overview'),
        products: document.getElementById('admin-products'),
        messages: document.getElementById('admin-messages'),
        orders: document.getElementById('admin-orders'),
    };

    const switchTab = (tabName) => {
        Object.values(navButtons).forEach(btn => btn.classList.remove('active'));
        Object.values(adminSections).forEach(sec => sec.classList.add('hidden'));

        if (navButtons[tabName] && adminSections[tabName]) {
            navButtons[tabName].classList.add('active');
            adminSections[tabName].classList.remove('hidden');
        }
    };

    navButtons.overview.addEventListener('click', () => switchTab('overview'));
    navButtons.products.addEventListener('click', () => switchTab('products'));
    navButtons.messages.addEventListener('click', () => switchTab('messages'));
    if (navButtons.orders) navButtons.orders.addEventListener('click', () => switchTab('orders'));

})();

// --- Admin Panel: Products ---
document.addEventListener('DOMContentLoaded', () => {
    const loadProductsBtn = document.getElementById('load-products-btn');
    const productsContainer = document.getElementById('products-admin-container');
    const editFormContainer = document.getElementById('product-edit-form-container');
    const addProductBtn = document.getElementById('add-product-btn');

    if (!loadProductsBtn || !productsContainer || !editFormContainer || !addProductBtn) return;

    // Admin actions use session-based authentication via `fetchAdmin` which attempts session requests.

    const renderAddForm = () => {
        editFormContainer.innerHTML = `
            <h4>Add New Product</h4>
            <form id="product-add-form">
                <div class="form-group">
                    <label for="add-title">Product Name</label>
                    <input type="text" id="add-title" required>
                </div>
                <div class="form-group">
                    <label for="add-price">Price (e.g., ₹2500)</label>
                    <input type="text" id="add-price" required>
                </div>
                <div class="form-group">
                    <label for="add-image">Image URL</label>
                    <input type="text" id="add-image" required>
                </div>
                <div class="form-group">
                    <label for="add-description">Description</label>
                    <textarea id="add-description" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Save Product</button>
                <button type="button" id="cancel-add" class="btn btn-secondary">Cancel</button>
            </form>
        `;

        document.getElementById('cancel-add').addEventListener('click', () => {
            editFormContainer.innerHTML = '';
        });

        document.getElementById('product-add-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newProduct = {
                title: document.getElementById('add-title').value,
                price: document.getElementById('add-price').value,
                image: document.getElementById('add-image').value,
                description: document.getElementById('add-description').value,
            };

            try {
                const response = await fetchAdmin(`/api/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProduct)
                });

                if (response.ok) {
                    editFormContainer.innerHTML = '';
                    loadProductsForAdmin(); // Refresh the list
                } else {
                    alert('Failed to add product. Make sure you are logged in.');
                }
            } catch (error) {
                console.error('Error adding product:', error);
                alert('An error occurred while adding the product.');
            }
        });
    };

    addProductBtn.addEventListener('click', renderAddForm);

    const renderEditForm = (product) => {
        editFormContainer.innerHTML = `
            <h4>Edit Product (ID: ${product.id})</h4>
            <form id="product-edit-form" data-id="${product.id}">
                <div class="inputBox">
                    <input type="text" id="edit-title" value="${escapeHtml(product.title)}" required>
                    <span>Product Name</span>
                </div>
                <div class="inputBox">
                    <input type="text" id="edit-price" value="${escapeHtml(product.price)}" required>
                    <span>Price</span>
                </div>
                <div class="inputBox">
                    <input type="text" id="edit-image" value="${escapeHtml(product.image)}" required>
                    <span>Image URL</span>
                </div>
                <div class="inputBox">
                    <textarea id="edit-description" required>${escapeHtml(product.description)}</textarea>
                    <span>Description</span>
                </div>
                <button type="submit">Save Changes</button>
                <button type="button" id="cancel-edit">Cancel</button>
            </form>
        `;

        document.getElementById('cancel-edit').addEventListener('click', () => {
            editFormContainer.innerHTML = '';
        });

        document.getElementById('product-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = e.target.dataset.id;
            const updatedProduct = {
                title: document.getElementById('edit-title').value,
                price: document.getElementById('edit-price').value,
                image: document.getElementById('edit-image').value,
                description: document.getElementById('edit-description').value,
            };

            try {
                const response = await fetchAdmin(`/api/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProduct)
                });

                if (response.ok) {
                    editFormContainer.innerHTML = '';
                    loadProductsForAdmin(); // Refresh the list
                } else {
                    alert('Failed to save changes. Make sure you are logged in.');
                }
            } catch (error) {
                console.error('Error saving product:', error);
                alert('An error occurred while saving the product.');
            }
        });
    };

    const loadProductsForAdmin = async () => {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                productsContainer.innerHTML = '<p class="error-message">Could not load products.</p>';
                return;
            }
            const products = await response.json();
            productsContainer.innerHTML = '';
            products.forEach(product => {
                const productEl = document.createElement('div');
                productEl.className = 'admin-product-card';
                productEl.innerHTML = `
                    <img src="${product.image}" alt="${product.title}">
                    <div class="admin-product-details">
                        <strong>${product.title}</strong>
                        <span>${product.price}</span>
                    </div>
                    <div class="admin-product-actions">
                        <button class="btn-edit" data-id="${product.id}">Edit</button>
                        <button class="btn-delete" data-id="${product.id}">Delete</button>
                    </div>
                `;
                productsContainer.appendChild(productEl);
            });
        } catch (error) {
            console.error('Failed to load products for admin:', error);
            productsContainer.innerHTML = '<p class="error-message">An error occurred while loading products.</p>';
        }
    };

    productsContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('btn-edit')) {
                try {
                    const response = await fetchAdmin(`/api/products/${id}`);
                    if (!response.ok) throw new Error('Failed to fetch product');
                    const product = await response.json();
                    renderEditForm(product);
                } catch (error) {
                    console.error('Failed to fetch product for editing:', error);
                    alert('Unable to load product for editing. Are you logged in?');
                }
        }

        if (target.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    const response = await fetchAdmin(`/api/products/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        loadProductsForAdmin(); // Refresh list
                    } else {
                        alert('Failed to delete product. Make sure you are logged in.');
                    }
                } catch (error) {
                    console.error('Error deleting product:', error);
                    alert('An error occurred while deleting the product.');
                }
            }
        }
    });

    loadProductsBtn.addEventListener('click', loadProductsForAdmin);

    // Import products from products.json (admin-only)
    const importBtn = document.getElementById('import-products-btn');
    if (importBtn) {
        importBtn.addEventListener('click', async () => {
            if (!confirm('Import products from products.json into the database? This will only add missing products.')) return;
            importBtn.classList.add('is-loading');
            importBtn.setAttribute('aria-busy', 'true');
            try {
                const resp = await fetchAdmin('/api/admin/import-products', { method: 'POST' });
                if (!resp) throw new Error('No response');
                const json = await resp.json();
                if (resp.ok) {
                    showToast(`Import complete. Added ${json.added || 0} products.`, 'success');
                    loadProductsForAdmin();
                } else {
                    showToast('Import failed: ' + (json && json.message ? json.message : resp.statusText), 'error');
                }
            } catch (err) {
                console.error('Import products failed', err);
                showToast('Import failed. Are you logged in as admin and is the backend reachable?', 'error');
            } finally {
                importBtn.classList.remove('is-loading');
                importBtn.removeAttribute('aria-busy');
            }
        });
    }
});

// --- Admin Panel: Messages ---
document.addEventListener('DOMContentLoaded', () => {
    const loadMessagesBtn = document.getElementById('load-messages-btn');
    const messagesContainer = document.getElementById('messages-container');

    if (!loadMessagesBtn || !messagesContainer) return;

    const fetchAndDisplayMessages = async () => {
            try {
            const response = await fetchAdmin('/api/contacts');
            if (!response.ok) {
                throw new Error('Failed to fetch messages. Are you logged in?');
            }

            const messages = await response.json();
            messagesContainer.innerHTML = ''; // Clear previous messages

            if (messages.length === 0) {
                messagesContainer.innerHTML = '<p>No messages found.</p>';
                return;
            }

            const table = document.createElement('table');
            table.className = 'messages-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Received</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    ${messages.map(msg => `
                        <tr>
                            <td>${new Date(msg.received_at).toLocaleString()}</td>
                            <td>${escapeHtml(msg.name)}</td>
                            <td>${escapeHtml(msg.email)}</td>
                            <td>${escapeHtml(msg.message)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            messagesContainer.appendChild(table);

        } catch (error) {
            messagesContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    };

    loadMessagesBtn.addEventListener('click', fetchAndDisplayMessages);

    // Also listen for real-time messages if an admin is logged in
    // The listener is now set up globally, so this specific block is no longer needed.
    // We just need to ensure the UI refresh logic is handled in the global listener.
});

// --- Admin Panel: Orders ---
document.addEventListener('DOMContentLoaded', () => {
    const loadOrdersBtn = document.getElementById('load-orders-btn');
    const ordersContainer = document.getElementById('orders-container');
    if (!loadOrdersBtn || !ordersContainer) return;

    const fetchAndDisplayOrders = async () => {
            try {
            const response = await fetchAdmin('/api/orders');
            if (!response.ok) {
                ordersContainer.innerHTML = '<p class="error-message">Could not load orders. Are you logged in as admin?</p>';
                return;
            }
            const orders = await response.json();
            ordersContainer.innerHTML = '';
            if (orders.length === 0) {
                ordersContainer.innerHTML = '<p>No orders found.</p>';
                return;
            }
            orders.forEach(o => {
                const div = document.createElement('div');
                div.className = 'admin-order-card';
                let items;
                try { items = JSON.parse(o.items); } catch(e) { items = []; }
                const status = o.status || 'pending';
                div.innerHTML = `
                    <strong>Order #${o.id}</strong>
                    <div>${o.customer_name} — ${o.customer_phone}</div>
                    <div>${o.customer_address}</div>
                    <div>Total: ${o.total_price}</div>
                    <div>Items: ${items.map(it => escapeHtml(it.title)).join(', ')}</div>
                    <div>Placed: ${new Date(o.order_date).toLocaleString()}</div>
                    <div class="order-status-row">
                        <label for="order-status-${o.id}">Status:</label>
                        <select id="order-status-${o.id}" data-order-id="${o.id}" class="order-status-select">
                            <option value="pending" ${status==='pending'?'selected':''}>Pending</option>
                            <option value="processing" ${status==='processing'?'selected':''}>Processing</option>
                            <option value="packed" ${status==='packed'?'selected':''}>Packed</option>
                            <option value="shipped" ${status==='shipped'?'selected':''}>Shipped</option>
                            <option value="delivered" ${status==='delivered'?'selected':''}>Delivered</option>
                            <option value="cancelled" ${status==='cancelled'?'selected':''}>Cancelled</option>
                        </select>
                        <button class="btn btn-secondary update-order-status-btn" data-order-id="${o.id}">Update</button>
                    </div>
                `;
                ordersContainer.appendChild(div);
            });
            // wire up update buttons
            ordersContainer.querySelectorAll('.update-order-status-btn').forEach(btn => {
                btn.addEventListener('click', async (ev) => {
                    const id = btn.getAttribute('data-order-id');
                    const sel = document.getElementById(`order-status-${id}`);
                    if (!sel) return;
                    const newStatus = sel.value;
                    try {
                        const res = await fetchAdmin(`/api/orders/${id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus })
                        });
                        if (!res.ok) {
                            const txt = await res.text();
                            alert('Failed to update order status: ' + res.status + ' ' + txt);
                            return;
                        }
                        const json = await res.json();
                        alert('Order status updated.');
                        // refresh orders list
                        fetchAndDisplayOrders();
                    } catch (err) {
                        alert('Error updating status: ' + err.message);
                    }
                });
            });
        } catch (err) {
            ordersContainer.innerHTML = `<p class="error-message">${err.message}</p>`;
        }
    };

    loadOrdersBtn.addEventListener('click', fetchAndDisplayOrders);
    // Refresh when realtime order events occur
    document.addEventListener('orders:changed', () => {
        // if orders view currently active, refresh
        const adminOrdersSection = document.getElementById('admin-orders');
        if (adminOrdersSection && !adminOrdersSection.classList.contains('hidden')) {
            fetchAndDisplayOrders();
        }
    });
});

// --- Chatbot ---
document.addEventListener('DOMContentLoaded', () => {
    const chatbotFab = document.getElementById('chatbot-fab');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');

    if (!chatbotFab || !chatbotWindow || !chatbotClose || !chatbotMessages || !chatbotInput || !chatbotSend) {
        return;
    }

    // Use the global addMessage helper defined earlier

    if (!socket) {
        initializeSocket();
    }

    if (socket && socket.connected) {
        socket.on('chat message', (msg) => {
            addMessage(msg, 'bot');
        });
    } else {
        // If socket not yet ready, show a polite offline message
        addMessage("The chat service is currently unavailable.", 'bot');
    }

    const toggleChatbot = () => {
        const isHidden = chatbotWindow.classList.contains('hidden');
        chatbotWindow.classList.toggle('hidden');
        chatbotFab.classList.toggle('hidden');
        if (isHidden) {
            chatbotInput.focus();
        }
    };

    const sendMessage = () => {
        const message = chatbotInput.value.trim();
        if (message && socket && socket.connected) {
            addMessage(message, 'user');
            socket.emit('chat message', message);
            chatbotInput.value = '';
        } else if (!socket || !socket.connected) {
            addMessage("Cannot send message. Not connected to the server.", 'bot');
        }
    };

    // (addMessage is declared above)

    // Quick question buttons functionality
    quickQuestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            if (question) {
                chatbotInput.value = question;
                sendMessage();
            }
        });
    });

    chatbotFab.addEventListener('click', toggleChatbot);
    chatbotClose.addEventListener('click', toggleChatbot);
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// --- Shopping Cart ---
document.addEventListener('DOMContentLoaded', () => {
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const cartClose = document.getElementById('cart-close');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const productsGrid = document.getElementById('products-grid');
    const checkoutButton = document.getElementById('checkout-button');

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutClose = document.getElementById('checkout-close');
    const checkoutForm = document.getElementById('checkout-form');
    const confirmOrderButton = document.getElementById('confirm-order-button');


    // Persist cart in localStorage so it survives reloads
    let cart = JSON.parse(localStorage.getItem('ft_cart') || '[]');

    function saveCart() {
        localStorage.setItem('ft_cart', JSON.stringify(cart));
    }

    const toggleCartModal = () => {
        const isHidden = cartModal.classList.contains('hidden');
        if (isHidden) {
            cartModal.classList.remove('hidden');
            trapFocus(cartModal);
        } else {
            cartModal.classList.add('hidden');
            releaseFocus(cartModal);
        }
    };

    cartButton.addEventListener('click', toggleCartModal);
    cartClose.addEventListener('click', toggleCartModal);

    const toggleCheckoutModal = () => {
        const isHidden = checkoutModal.classList.contains('hidden');
        if (isHidden) {
            checkoutModal.classList.remove('hidden');
            trapFocus(checkoutModal);
        } else {
            checkoutModal.classList.add('hidden');
            releaseFocus(checkoutModal);
        }
    };

    checkoutButton.addEventListener('click', () => {
        if (cart.length > 0) {
            toggleCartModal(); // Close cart
            toggleCheckoutModal(); // Open checkout
        } else {
            alert('Your cart is empty.');
        }
    });
    checkoutClose.addEventListener('click', toggleCheckoutModal);


    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${(item.unit_price != null) ? `₹${Number(item.unit_price).toFixed(2)}` : item.price}</div>
                        <div class="cart-item-qty-wrap">
                            Qty: <input type="number" min="1" value="${item.qty || 1}" class="cart-item-qty" data-id="${item.id}">
                        </div>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}"><i class="fas fa-times"></i></button>
                `;
                cartItemsContainer.appendChild(cartItem);
                const priceValue = (item.unit_price != null) ? Number(item.unit_price) : parseFloat(String(item.price).replace(/[^0-9.-]+/g, "")) || 0;
                const qty = item.qty || 1;
                total += (priceValue * qty);
                totalItems += qty;
            });
        }
        cartCount.textContent = totalItems;
        cartTotalPrice.textContent = `₹${total.toFixed(2)}`;

        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                cart = cart.filter(item => item.id != id);
                saveCart();
                renderCart();
            });
        });

        // quantity change listeners
        document.querySelectorAll('.cart-item-qty').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const v = Math.max(1, parseInt(e.target.value || '1', 10));
                const it = cart.find(c => c.id == id);
                if (it) {
                    it.qty = v;
                    saveCart();
                    renderCart();
                }
            });
        });
    };

    productsGrid.addEventListener('click', (e) => {
        // Handle quantity stepper buttons
        if (e.target.classList.contains('qty-incr') || e.target.classList.contains('qty-decr')) {
            const stepper = e.target.closest('.qty-stepper');
            if (!stepper) return;
            const input = stepper.querySelector('.quantity-input');
            let v = Math.max(1, parseInt(input.value || '1', 10));
            if (e.target.classList.contains('qty-incr')) v = v + 1;
            if (e.target.classList.contains('qty-decr')) v = Math.max(1, v - 1);
            input.value = v;
            return;
        }

        
        // Add to cart (reads quantity)
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productCard = e.target.closest('.product-card');
            const id = String(productCard.dataset.id);
            const title = productCard.querySelector('.product-title').textContent;
            const price = productCard.querySelector('.product-price').textContent;
            const priceValEl = productCard.querySelector('.product-price-value');
            const unitPrice = priceValEl ? parseFloat(priceValEl.textContent || '0') : (parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0);
            const image = productCard.querySelector('.product-img').src;
            const qtyInput = productCard.querySelector('.quantity-input');
            let qty = 1;
            if (qtyInput) qty = Math.max(1, parseInt(qtyInput.value || '1', 10));

            const existingItem = cart.find(item => item.id === id);
            if (!existingItem) {
                cart.push({ id, title, price, image, qty, unit_price: unitPrice });
            } else {
                existingItem.qty = (existingItem.qty || 1) + qty;
            }
            saveCart();
            renderCart();
        }

        // Buy Now (add with qty and open checkout)
        if (e.target.classList.contains('buy-now-btn')) {
            const productCard = e.target.closest('.product-card');
            const id = String(productCard.dataset.id);
            const title = productCard.querySelector('.product-title').textContent;
            const price = productCard.querySelector('.product-price').textContent;
            const priceValEl = productCard.querySelector('.product-price-value');
            const unitPrice = priceValEl ? parseFloat(priceValEl.textContent || '0') : (parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0);
            const image = productCard.querySelector('.product-img').src;
            const qtyInput = productCard.querySelector('.quantity-input');
            let qty = 1;
            if (qtyInput) qty = Math.max(1, parseInt(qtyInput.value || '1', 10));

            const existingItem = cart.find(item => item.id === id);
            if (!existingItem) {
                cart.push({ id, title, price, image, qty, unit_price: unitPrice });
            } else {
                existingItem.qty = (existingItem.qty || 1) + qty;
            }
            saveCart(); renderCart();
            // Open checkout modal
            if (cart.length > 0) {
                toggleCartModal();
                // after closing cart, open checkout
                setTimeout(() => {
                    toggleCheckoutModal();
                }, 200);
            }
        }

        // Click product image or title to open detail
        if (e.target.classList.contains('product-img') || e.target.classList.contains('product-title')) {
            const productCard = e.target.closest('.product-card');
            const id = productCard.dataset.id;
            openProductDetail(id);
        }
    });

    // Keyboard interactions on product grid (Enter/Space to open details, Arrow keys for qty)
    productsGrid.addEventListener('keydown', (e) => {
        const targetCard = (e.target && e.target.closest) ? e.target.closest('.product-card') : null;
        if (!targetCard) return;
        // Open product detail on Enter or Space when focused on card
        if ((e.key === 'Enter' || e.key === ' ') && e.target === targetCard) {
            e.preventDefault();
            openProductDetail(targetCard.dataset.id);
            return;
        }
        // If focus is within a qty input, allow ArrowUp/ArrowDown to change value
        const qtyInput = (e.target && e.target.closest) ? e.target.closest('.quantity-input') : null;
        if (qtyInput) {
            if (e.key === 'ArrowUp') {
                e.preventDefault(); qtyInput.stepUp(); qtyInput.dispatchEvent(new Event('change'));
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault(); qtyInput.stepDown(); qtyInput.dispatchEvent(new Event('change'));
            }
        }
    });

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customerName = document.getElementById('customer-name').value;
        const customerAddress = document.getElementById('customer-address').value;
        const customerPhone = document.getElementById('customer-phone').value;

        if (!customerName || !customerAddress || !customerPhone) {
            alert('Please fill out all checkout fields.');
            return;
        }

        const orderData = {
            customerName,
            customerAddress,
            customerPhone,
            items: cart,
            total: cartTotalPrice.textContent
        };

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                const json = await response.json();
                const orderId = json.orderId || 'N/A';
                // Show confirmation modal with order id
                const ocModal = document.getElementById('order-confirmation-modal');
                const ocMsg = document.getElementById('order-confirmation-message');
                if (ocMsg) ocMsg.textContent = `Thank you, ${customerName}! Your order has been placed. Order ID: ${orderId}`;
                if (ocModal) {
                    ocModal.classList.remove('hidden');
                }
                // Clear cart and close modals
                cart = [];
                saveCart();
                renderCart();
                toggleCheckoutModal();
                checkoutForm.reset();
            } else {
                const errorData = await response.json();
                alert(`There was an error placing your order: ${errorData.error || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('An unexpected error occurred. Please check your connection and try again.');
        }
    });

    renderCart();
});

// --- Product Detail & Buy Now handlers ---
function openProductDetail(id) {
    fetch(`/api/products/${id}`).then(r => r.json()).then(product => {
        const modal = document.getElementById('product-detail-modal');
        if (!modal) return;
        document.getElementById('product-detail-img').src = product.image;
        document.getElementById('product-detail-img').alt = product.title;
        document.getElementById('product-detail-title').textContent = product.title;
        document.getElementById('product-detail-price').textContent = product.price;
        document.getElementById('product-detail-desc').textContent = product.description;
        modal.dataset.productId = product.id;
        modal.classList.remove('hidden');
        trapFocus(modal);
        // Wire actions (use onclick to avoid duplicate listeners)
        document.getElementById('product-detail-close').onclick = () => { modal.classList.add('hidden'); releaseFocus(modal); };
        document.getElementById('product-add-to-cart').onclick = () => {
            const existing = cart.find(it => it.id == product.id);
            if (!existing) {
                cart.push({ id: String(product.id), title: product.title, price: product.price, image: product.image });
                saveCart(); renderCart();
            }
            modal.classList.add('hidden');
            releaseFocus(modal);
        };
        document.getElementById('product-buy-now').onclick = () => {
            // pre-fill checkout and open modal
            document.getElementById('customer-name').focus();
            modal.classList.add('hidden');
            releaseFocus(modal);
            // ensure product is in cart so checkout processes it
            const existing = cart.find(it => it.id == product.id);
            if (!existing) { cart.push({ id: String(product.id), title: product.title, price: product.price, image: product.image }); saveCart(); renderCart(); }
            // open checkout
            document.getElementById('checkout-button').click();
        };
    }).catch(err => console.error('Failed to load product details', err));
}

// Order confirmation close
document.addEventListener('DOMContentLoaded', () => {
    const ocClose = document.getElementById('order-confirmation-close');
    const ocModal = document.getElementById('order-confirmation-modal');
    if (ocClose && ocModal) ocClose.addEventListener('click', () => ocModal.classList.add('hidden'));
    if (ocClose && ocModal) ocClose.addEventListener('click', () => { ocModal.classList.add('hidden'); releaseFocus(ocModal); });
});

// --- Load News ---
// This is now handled by the centralized `setupRealtime` function
// which fetches initial data and listens for socket events.
document.addEventListener('DOMContentLoaded', () => {
    // The initial fetch and socket listener are already set up.
    // This block can be removed or left empty.
});


// Re-populate mobile navbar with links
const desktopNav = document.querySelector('.navbar');
const mobileNav = document.querySelector('.navbar'); // In your current HTML, they are the same element that gets toggled.

if (desktopNav && mobileNav) {
    // No cloning needed if it's the same element.
    // The logic for mobile is handled by CSS media queries.
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Focus trap helpers for accessibility: trap focus inside modal when open
function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
}

function trapFocus(modal) {
    if (!modal) return;
    const focusable = getFocusableElements(modal);
    const previous = document.activeElement;
    modal._previousActive = previous;
    if (focusable.length) focusable[0].focus();

    modal._keydownHandler = function(e) {
        if (e.key === 'Escape') {
            // close modal when Escape pressed
            modal.classList.add('hidden');
            releaseFocus(modal);
            return;
        }
        if (e.key !== 'Tab') return;
        const focusableNow = getFocusableElements(modal);
        if (focusableNow.length === 0) {
            e.preventDefault();
            return;
        }
        const first = focusableNow[0];
        const last = focusableNow[focusableNow.length -1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    document.addEventListener('keydown', modal._keydownHandler);
    // mark inert for background (aria-hidden) to assist screen readers
    document.querySelectorAll('main > *:not([id="' + modal.id + '"])').forEach(el => {
        if (!el.hasAttribute('data-prev-aria-hidden')) {
            el.setAttribute('data-prev-aria-hidden', el.getAttribute('aria-hidden') || 'false');
            el.setAttribute('aria-hidden', 'true');
        }
    });
}

function releaseFocus(modal) {
    if (!modal) return;
    if (modal._keydownHandler) {
        document.removeEventListener('keydown', modal._keydownHandler);
        delete modal._keydownHandler;
    }
    // restore aria-hidden
    document.querySelectorAll('[data-prev-aria-hidden]').forEach(el => {
        const prev = el.getAttribute('data-prev-aria-hidden');
        if (prev === 'false') el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', prev);
        el.removeAttribute('data-prev-aria-hidden');
    });
    try { if (modal._previousActive) modal._previousActive.focus(); } catch (e) {}
}

// --- Progressive enhancement: lazy-load Three.js scene when hero is visible ---
// Register service worker (kept after removing Three.js integration)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('ServiceWorker registration successful with scope: ', reg.scope);
        }).catch(err => {
            console.warn('ServiceWorker registration failed:', err);
        });
    });
}
