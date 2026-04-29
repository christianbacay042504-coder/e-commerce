// =============================================
// script.js — Lumière Website Logic
// =============================================

// 🛒 STATE
let cart = JSON.parse(localStorage.getItem('lumiere_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('lumiere_wishlist') || '[]');
let currentFilter = 'all';
let currentMemberFilter = 'all';
let currentSort = 'default';

// =============================================
// 🚀 INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    renderFeaturedProducts();
    renderPodium();
    renderMembers(MEMBERS);
    renderAwards();
    renderProducts(PRODUCTS);
    updateCartCount();
    updateWishlistCount();
    initScrollAnimations();
    initNavScroll();
    initActiveNavLink();
    initBackToTop();
    injectSortUI();
});

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
}

function injectSortUI() {
    const searchDiv = document.querySelector('.product-search');
    if (!searchDiv) return;
    const sortWrap = document.createElement('div');
    sortWrap.className = 'sort-wrap fade-in';
    sortWrap.innerHTML = `
        <select id="sortSelect" onchange="sortProducts(this.value)">
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A–Z</option>
        </select>`;
    searchDiv.after(sortWrap);
}

function sortProducts(val) {
    currentSort = val;
    applyProductFilters();
}

// =============================================
// 🧭 NAVIGATION
// =============================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function initNavScroll() {
    let lastScroll = 0;
    const topbar = document.getElementById('topbar');
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        const scrollingDown = currentScroll > lastScroll;

        // Hide topbar when scrolling down past 80px
        if (currentScroll > 80) {
            topbar.classList.add('hidden');
            navbar.classList.add('topbar-gone');
        } else {
            topbar.classList.remove('hidden');
            navbar.classList.remove('topbar-gone');
        }

        navbar.classList.toggle('scrolled', currentScroll > 50);
        lastScroll = currentScroll;
    });
}

function initActiveNavLink() {
    const sections = ['home', 'recognition', 'products'];
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el && window.scrollY >= el.offsetTop - 120) current = id;
        });
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });

    // Close mobile menu on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('navLinks').classList.remove('open');
            document.getElementById('hamburger').classList.remove('active');
        });
    });
}

// =============================================
// 🌟 SCROLL ANIMATIONS
// =============================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    // Hero fade-ups
    document.querySelectorAll('.fade-up').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.12}s`;
        observer.observe(el);
    });

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// =============================================
// 🧴 PRODUCTS
// =============================================

/** Render 3 featured products on home */
function renderFeaturedProducts() {
    const featured = PRODUCTS.filter(p => ['Top Rated', 'Bestseller', 'Must-Have'].includes(p.tag)).slice(0, 3);
    const grid = document.getElementById('featuredGrid');
    grid.innerHTML = featured.map(p => productCardHTML(p, true)).join('');
    initScrollAnimations();
}

/** Render all products (with optional filter) */
function renderProducts(list) {
    const grid = document.getElementById('productsGrid');
    const noRes = document.getElementById('noResults');

    if (!list.length) {
        grid.innerHTML = '';
        noRes.style.display = 'block';
        return;
    }

    noRes.style.display = 'none';
    grid.innerHTML = list.map(p => productCardHTML(p)).join('');

    // Stagger animation
    grid.querySelectorAll('.product-card').forEach((card, i) => {
        card.style.animationDelay = `${i * 0.07}s`;
        card.classList.add('card-enter');
    });
}

/** Generate product card HTML */
function productCardHTML(p, featured = false) {
    const stars = renderStars(p.rating || 4.5);
    const inWishlist = wishlist.some(w => w.id === p.id);
    return `
    <div class="product-card ${featured ? 'featured-card' : ''} fade-in" data-id="${p.id}" data-category="${p.category}">
      <div class="pc-visual" style="background:${p.color}">
        <div class="pc-emoji">${p.emoji}</div>
        <div class="pc-tag">${p.tag}</div>
        <button class="pc-wishlist ${inWishlist ? 'active' : ''}" onclick="toggleWishlist(${p.id}, event)" title="${inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
      </div>
      <div class="pc-info">
        <div class="pc-category">${capitalize(p.category)}</div>
        <h3 class="pc-name">${p.name}</h3>
        <div class="pc-stars">${stars} <span class="pc-reviews">(${p.reviews || 0})</span></div>
        <p class="pc-desc">${p.description.substring(0, 80)}...</p>
        <div class="pc-footer">
          <span class="pc-price">₱${p.price.toLocaleString()}</span>
          <div class="pc-actions">
            <button class="btn-view" onclick="openProductModal(${p.id})">View</button>
            <button class="btn-cart" onclick="addToCart(${p.id}, event)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < full) stars += '<span class="star full">★</span>';
        else if (i === full && half) stars += '<span class="star half">★</span>';
        else stars += '<span class="star empty">★</span>';
    }
    return `<span class="stars-wrap">${stars}</span><span class="rating-num">${rating}</span>`;
}

/** Category filter */
function filterProducts(cat, btn) {
    currentFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyProductFilters();
}

/** Live search */
function searchProducts(query) {
    applyProductFilters(query);
}

/** Apply both category, search, and sort filters */
function applyProductFilters(query = document.getElementById('productSearch').value) {
    let list = [...PRODUCTS];
    if (currentFilter !== 'all') list = list.filter(p => p.category === currentFilter);
    if (query.trim()) {
        const q = query.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    // Sort
    if (currentSort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (currentSort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (currentSort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    renderProducts(list);
    initScrollAnimations();
}

// =============================================
// 🔍 PRODUCT MODAL
// =============================================
function openProductModal(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;

    const content = document.getElementById('modalContent');
    content.innerHTML = `
    <div class="modal-visual" style="background:${p.color}">
      <div class="mv-emoji">${p.emoji}</div>
      <div class="mv-tag">${p.tag}</div>
    </div>
    <div class="modal-info">
      <div class="mi-cat">${capitalize(p.category)}</div>
      <h2 class="mi-name">${p.name}</h2>
      <p class="mi-desc">${p.description}</p>
      <div class="mi-details">
        ${p.details.map(d => `<div class="mi-detail-item">✦ ${d}</div>`).join('')}
      </div>
      <div class="mi-ingredients">
        <strong>Key Ingredients:</strong> ${p.ingredients}
      </div>
      <div class="mi-footer">
        <span class="mi-price">₱${p.price.toLocaleString()}</span>
        <button class="btn-primary" onclick="addToCart(${p.id}); closeProductModal()">Add to Cart</button>
      </div>
    </div>`;

    document.getElementById('productModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(e) {
    if (e.target.id === 'productModal') closeProductModal();
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
}

// =============================================
// 🛒 CART SYSTEM
// =============================================
function addToCart(id, e) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, qty: 1 });
    }

    saveCart();
    updateCartCount();
    showToast(`${product.emoji} ${product.name} added to cart!`);

    // Button pop animation
    if (e) {
        const btn = e.currentTarget;
        btn.classList.add('pop');
        setTimeout(() => btn.classList.remove('pop'), 300);
    }
}

function saveCart() {
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartCount').textContent = total;
    document.getElementById('cartCount').classList.toggle('has-items', total > 0);
}

function openCart() {
    renderCartItems();
    document.getElementById('cartModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart(e) {
    if (e.target.id === 'cartModal') closeCartModal();
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('open');
    document.body.style.overflow = '';
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');

    if (!cart.length) {
        container.innerHTML = `<div class="cart-empty">
      <div class="ce-icon">🌸</div>
      <p>Your cart is empty.<br>Start adding some glow!</p>
    </div>`;
        totalEl.textContent = '₱0.00';
        return;
    }

    container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="ci-emoji">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">₱${item.price.toLocaleString()}</div>
      </div>
      <div class="ci-controls">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <button class="ci-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>`).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    totalEl.textContent = `₱${total.toLocaleString()}.00`;
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function checkout() {
    if (!cart.length) return;
    showToast('🎉 Order placed! Thank you for glowing with Lumière!');
    cart = [];
    saveCart();
    updateCartCount();
    closeCartModal();
}

// =============================================
// 🏆 RECOGNITION
// =============================================

/** Render top 3 podium */
function renderPodium() {
    const top3 = MEMBERS.sort((a, b) => a.rank - b.rank).slice(0, 3);
    const order = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd visual order
    const heights = ['70px', '100px', '50px'];
    const labels = ['2nd', '🏆 1st', '3rd'];
    const classes = ['podium-2nd', 'podium-1st', 'podium-3rd'];

    document.getElementById('podiumEl').innerHTML = order.map((m, i) => `
    <div class="podium-item ${classes[i]}">
      <div class="podium-avatar ${i === 1 ? 'avatar-glow' : ''}" style="background:${m.color}; border-color:${m.accentColor}">
        ${m.avatar}
      </div>
      <div class="podium-name">${m.name}</div>
      <div class="podium-loc">${m.location}</div>
      <div class="podium-sales">${m.sales}</div>
      <div class="podium-block" style="height:${heights[i]}; background:${m.accentColor}">
        <span>${labels[i]}</span>
      </div>
    </div>`).join('');
}

/** Render member cards */
function renderMembers(list) {
    const grid = document.getElementById('membersGrid');
    const rest = list.filter(m => m.rank > 3);

    if (!rest.length) {
        grid.innerHTML = `<p class="no-match">No members found.</p>`;
        return;
    }

    grid.innerHTML = rest.map(m => `
    <div class="member-card fade-in" data-type="${m.type}">
      <div class="mc-avatar" style="background:${m.color}; color:${m.accentColor}">${m.avatar}</div>
      <div class="mc-info">
        <div class="mc-name">${m.name}</div>
        <div class="mc-loc">📍 ${m.location}</div>
        <div class="mc-badge" style="background:${m.color}; color:${m.accentColor}">${m.badge}</div>
        <div class="mc-tagline">${m.tagline}</div>
        <div class="mc-sales">${m.sales} total sales</div>
      </div>
      <div class="mc-rank">#${m.rank}</div>
    </div>`).join('');

    initScrollAnimations();
}

/** Filter members by type */
function filterMembers(type, btn) {
    currentMemberFilter = type;
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filtered = type === 'all' ? MEMBERS : MEMBERS.filter(m => m.type === type);
    renderMembers(filtered);
    document.getElementById('memberSearch').value = '';
}

/** Search members */
function searchMembers(query) {
    const q = query.toLowerCase();
    const base = currentMemberFilter === 'all' ? MEMBERS : MEMBERS.filter(m => m.type === currentMemberFilter);
    const filtered = q ? base.filter(m => m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q)) : base;
    renderMembers(filtered);
}

/** Render awards */
function renderAwards() {
    document.getElementById('awardsGrid').innerHTML = AWARDS.map(a => `
    <div class="award-card fade-in" style="background:${a.color}">
      <div class="aw-icon">${a.icon}</div>
      <div class="aw-name">${a.name}</div>
      <div class="aw-desc">${a.desc}</div>
    </div>`).join('');
}

// =============================================
// ❤️ WISHLIST
// =============================================
function toggleWishlist(id, e) {
    e.stopPropagation();
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    const idx = wishlist.findIndex(w => w.id === id);
    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast(`💔 Removed from wishlist`);
    } else {
        wishlist.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji });
        showToast(`❤️ Added to wishlist!`);
    }
    localStorage.setItem('lumiere_wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    // Re-render to update heart icon
    applyProductFilters();
    renderFeaturedProducts();
}

function updateWishlistCount() {
    const el = document.getElementById('wishlistCount');
    if (!el) return;
    el.textContent = wishlist.length;
    el.style.display = wishlist.length > 0 ? 'flex' : 'none';
}

function openWishlist() {
    const container = document.getElementById('wishlistItems');
    if (!wishlist.length) {
        container.innerHTML = `<div class="cart-empty"><div class="ce-icon">🤍</div><p>Your wishlist is empty.<br>Heart a product to save it!</p></div>`;
    } else {
        container.innerHTML = wishlist.map(item => `
        <div class="cart-item">
          <div class="ci-emoji">${item.emoji}</div>
          <div class="ci-info">
            <div class="ci-name">${item.name}</div>
            <div class="ci-price">₱${item.price.toLocaleString()}</div>
          </div>
          <button class="btn-view" style="font-size:11px;padding:6px 14px" onclick="addToCart(${item.id}); showToast('Added to cart!')">Add to Cart</button>
          <button class="ci-remove" onclick="removeFromWishlist(${item.id})">✕</button>
        </div>`).join('');
    }
    document.getElementById('wishlistModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function removeFromWishlist(id) {
    wishlist = wishlist.filter(w => w.id !== id);
    localStorage.setItem('lumiere_wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    openWishlist();
    applyProductFilters();
}

function closeWishlistModal(e) {
    if (e.target.id === 'wishlistModal') {
        document.getElementById('wishlistModal').classList.remove('open');
        document.body.style.overflow = '';
    }
}

// =============================================
// 🔐 AUTH MODALS
// =============================================
function openLoginModal(e) {
    if (e) e.preventDefault();
    document.getElementById('loginModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function openRegisterModal(e) {
    if (e) e.preventDefault();
    document.getElementById('registerModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal(id, e) {
    if (e.target.id === id) {
        document.getElementById(id).classList.remove('open');
        document.body.style.overflow = '';
    }
}

function switchToRegister(e) {
    e.preventDefault();
    document.getElementById('loginModal').classList.remove('open');
    setTimeout(() => openRegisterModal(), 200);
}

function switchToLogin(e) {
    e.preventDefault();
    document.getElementById('registerModal').classList.remove('open');
    setTimeout(() => openLoginModal(), 200);
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    if (!email) { showToast('⚠️ Please enter your email'); return; }
    showToast('✨ Welcome back! Logging you in...');
    setTimeout(() => {
        document.getElementById('loginModal').classList.remove('open');
        document.body.style.overflow = '';
    }, 1200);
}

function handleRegister() {
    showToast('🌸 Account created! Welcome to Lumière!');
    setTimeout(() => {
        document.getElementById('registerModal').classList.remove('open');
        document.body.style.overflow = '';
    }, 1200);
}

function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

// =============================================
// 🔔 TOAST NOTIFICATIONS
// =============================================
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// =============================================
// 🛠️ UTILITIES
// =============================================
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}