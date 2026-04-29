// =============================================
// dashboard.js — Lumière Admin Panel
// Full CRUD for products & members, analytics
// =============================================

// ---------- GLOBAL STATE (sync with localStorage) ----------
let adminProducts = [];
let adminMembers = [];
let currentTab = 'overview';
let categoryChart, memberChart, priceChart;

// ---------- LOAD DATA FROM localStorage OR FALLBACK TO products.js DATA ----------
function loadDashboardData() {
    // Try to fetch products from global PRODUCTS (if exists from products.js)
    if (typeof PRODUCTS !== 'undefined') {
        adminProducts = JSON.parse(JSON.stringify(PRODUCTS));
    } else {
        const stored = localStorage.getItem('lumiere_admin_products');
        if (stored) adminProducts = JSON.parse(stored);
        else adminProducts = [];
    }
    
    if (typeof MEMBERS !== 'undefined') {
        adminMembers = JSON.parse(JSON.stringify(MEMBERS));
    } else {
        const storedMem = localStorage.getItem('lumiere_admin_members');
        if (storedMem) adminMembers = JSON.parse(storedMem);
        else adminMembers = [];
    }
    
    // If empty, seed demo fallback data (ensures dashboard looks alive)
    if (adminProducts.length === 0) seedDemoProducts();
    if (adminMembers.length === 0) seedDemoMembers();
    
    saveToLocal();
    renderAll();
}

function seedDemoProducts() {
    adminProducts = [
        { id: 1, name: "Gentle Foam Cleanser", category: "cleanser", price: 598, tag: "Bestseller", emoji: "🧴", description: "pH-balanced foaming cleanser", ingredients: "Aloe, Green Tea", rating: 4.8, reviews: 324 },
        { id: 2, name: "Radiance Vitamin C Serum", category: "serum", price: 1298, tag: "Top Rated", emoji: "✨", description: "Brightening serum", ingredients: "Vitamin C, Ferulic", rating: 4.9, reviews: 512 },
        { id: 3, name: "Hydra-Guard SPF 50+", category: "sunscreen", price: 898, tag: "Must-Have", emoji: "☀️", description: "Lightweight sunscreen", ingredients: "Zinc Oxide", rating: 4.7, reviews: 289 },
        { id: 4, name: "Peptide Renewal Moisturizer", category: "moisturizer", price: 1198, tag: "New", emoji: "💧", description: "Peptide complex", ingredients: "Matrixyl", rating: 4.6, reviews: 178 },
        { id: 5, name: "Rose Glow Essence Toner", category: "serum", price: 748, tag: "Fan Favorite", emoji: "🌹", description: "Hydrating toner", ingredients: "Rose Water, Niacinamide", rating: 4.5, reviews: 203 }
    ];
}

function seedDemoMembers() {
    adminMembers = [
        { id: 1, name: "Sofia Reyes", type: "seller", rank: 1, sales: "₱248,500", avatar: "SR", location: "Manila", badge: "Diamond Lumière", tagline: "Sharing glow one serum at a time", color: "#f9e8e0", accentColor: "#d4a574" },
        { id: 2, name: "Grace Villanueva", type: "recruiter", rank: 2, sales: "₱186,200", avatar: "GV", location: "Cebu", badge: "Platinum Lumière", tagline: "Building community", color: "#fdf3e0", accentColor: "#b5956b" },
        { id: 3, name: "Ana Lim", type: "seller", rank: 3, sales: "₱162,400", avatar: "AL", location: "Davao", badge: "Platinum Lumière", tagline: "Glow lifestyle", color: "#e8f0e8", accentColor: "#7a9b76" },
        { id: 4, name: "Bianca Santos", type: "recruiter", rank: 4, sales: "₱134,800", avatar: "BS", location: "Quezon City", badge: "Gold Lumière", tagline: "Pink skies", color: "#f9e0ec", accentColor: "#c4708a" },
        { id: 5, name: "Jessa Morales", type: "rising", rank: 5, sales: "₱98,600", avatar: "JM", location: "Iloilo", badge: "Silver Lumière", tagline: "Rising star", color: "#e8e8f5", accentColor: "#7a7ab5" }
    ];
}

function saveToLocal() {
    localStorage.setItem('lumiere_admin_products', JSON.stringify(adminProducts));
    localStorage.setItem('lumiere_admin_members', JSON.stringify(adminMembers));
    // Also sync to main site's localStorage for consistency (optional)
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lumiere_cart', localStorage.getItem('lumiere_cart') || '[]');
    }
}

// ---------- RENDER FUNCTIONS ----------
function renderAll() {
    updateOverviewStats();
    renderOverviewBestsellers();
    renderOverviewTopMembers();
    renderCategoryBreakdown();
    renderProductsTable();
    renderMembersGrid();
    if (categoryChart) categoryChart.destroy();
    if (memberChart) memberChart.destroy();
    if (priceChart) priceChart.destroy();
    renderCharts();
}

function updateOverviewStats() {
    document.getElementById('totalProductsStat').innerText = adminProducts.length;
    document.getElementById('totalMembersStat').innerText = adminMembers.length;
    const uniqueCats = [...new Set(adminProducts.map(p => p.category))];
    document.getElementById('categoriesCountStat').innerText = uniqueCats.length;
    document.getElementById('awardsCountStat').innerText = "6"; // static from AWARDS array length
}

function renderOverviewBestsellers() {
    const top = [...adminProducts].sort((a,b)=> (b.rating||0)-(a.rating||0)).slice(0,4);
    const container = document.getElementById('overviewBestsellers');
    container.innerHTML = top.map(p => `<div class="list-item"><span>${p.emoji || '✨'} ${p.name}</span><span style="color:var(--rose-dark)">₱${p.price.toLocaleString()}</span></div>`).join('');
}

function renderOverviewTopMembers() {
    const topMems = [...adminMembers].sort((a,b)=> (parseInt(a.rank)||999)-(parseInt(b.rank)||999)).slice(0,3);
    const container = document.getElementById('overviewTopMembers');
    container.innerHTML = topMems.map(m => `<div class="list-item"><span>🏅 ${m.name}</span><span>${m.sales}</span></div>`).join('');
}

function renderCategoryBreakdown() {
    const cats = {};
    adminProducts.forEach(p => { cats[p.category] = (cats[p.category]||0)+1; });
    const container = document.getElementById('categoryBreakdown');
    container.innerHTML = Object.entries(cats).map(([cat, count]) => `<span class="badge-cat">${cat.toUpperCase()} (${count})</span>`).join('');
}

// Products table with filter & search
function renderProductsTable() {
    const search = document.getElementById('adminProductSearch')?.value.toLowerCase() || '';
    const filterCat = document.getElementById('adminCategoryFilter')?.value || 'all';
    let filtered = adminProducts.filter(p => p.name.toLowerCase().includes(search) || (p.description||'').toLowerCase().includes(search));
    if (filterCat !== 'all') filtered = filtered.filter(p => p.category === filterCat);
    
    const container = document.getElementById('productsTableContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="product-row header-row">
            <span>🖼️</span><span>Name</span><span>Category</span><span>Price</span><span>Tag</span><span>Actions</span>
        </div>
        ${filtered.map(p => `
            <div class="product-row">
                <span>${p.emoji || '🧴'}</span>
                <span><strong>${p.name}</strong></span>
                <span>${p.category}</span>
                <span>₱${p.price.toLocaleString()}</span>
                <span>${p.tag || '—'}</span>
                <div class="action-btns">
                    <button class="edit-btn" onclick="openEditProduct(${p.id})">✏️</button>
                    <button class="delete-btn" onclick="deleteProduct(${p.id})">🗑️</button>
                </div>
            </div>
        `).join('')}
        ${filtered.length === 0 ? '<div style="padding:40px;text-align:center">No products found</div>' : ''}
    `;
}

// Members grid
function renderMembersGrid() {
    const search = document.getElementById('adminMemberSearch')?.value.toLowerCase() || '';
    let filtered = adminMembers.filter(m => m.name.toLowerCase().includes(search) || m.location.toLowerCase().includes(search));
    const container = document.getElementById('membersAdminGrid');
    container.innerHTML = filtered.map(m => `
        <div class="member-card-admin">
            <div style="display:flex; gap:12px; align-items:center"><div style="width:44px;height:44px;background:${m.color || '#f0e0d0'}; border-radius:50%; display:flex;align-items:center;justify-content:center;font-weight:bold">${m.avatar}</div>
            <div><strong>${m.name}</strong><br><span style="font-size:12px;color:var(--text-mid)">${m.location} · ${m.type}</span></div></div>
            <div><span style="background:#f5e6de; padding:4px 12px; border-radius:50px;font-size:12px">${m.sales}</span></div>
            <div class="action-btns"><button class="edit-btn" onclick="openEditMember(${m.id})">✏️</button><button class="delete-btn" onclick="deleteMember(${m.id})">🗑️</button></div>
        </div>
    `).join('');
}

// CRUD Products
let currentEditId = null;
function openAddProduct() { currentEditId = null; document.getElementById('productFormTitle').innerText = 'Add Product'; clearProductForm(); document.getElementById('productModalForm').classList.add('open'); }
function openEditProduct(id) { const p = adminProducts.find(x=>x.id===id); if(p){ currentEditId=id; document.getElementById('productFormTitle').innerText='Edit Product'; document.getElementById('editProductId').value=id; document.getElementById('prodName').value=p.name; document.getElementById('prodCategory').value=p.category; document.getElementById('prodPrice').value=p.price; document.getElementById('prodTag').value=p.tag||''; document.getElementById('prodEmoji').value=p.emoji||''; document.getElementById('prodDesc').value=p.description||''; document.getElementById('prodIngredients').value=p.ingredients||''; document.getElementById('productModalForm').classList.add('open'); } }
function clearProductForm(){ document.getElementById('prodName').value=''; document.getElementById('prodCategory').value='serum'; document.getElementById('prodPrice').value=''; document.getElementById('prodTag').value=''; document.getElementById('prodEmoji').value=''; document.getElementById('prodDesc').value=''; document.getElementById('prodIngredients').value=''; document.getElementById('editProductId').value=''; }
function saveProduct() { const id = document.getElementById('editProductId').value; const name = document.getElementById('prodName').value; if(!name) return alert('Product name required'); const newProd = { id: id ? parseInt(id) : Date.now(), name, category: document.getElementById('prodCategory').value, price: parseInt(document.getElementById('prodPrice').value)||0, tag: document.getElementById('prodTag').value, emoji: document.getElementById('prodEmoji').value, description: document.getElementById('prodDesc').value, ingredients: document.getElementById('prodIngredients').value, rating: 4.5, reviews: 0 }; if(id){ const idx = adminProducts.findIndex(p=>p.id==id); if(idx!==-1) adminProducts[idx]=newProd; } else { adminProducts.push(newProd); } saveToLocal(); renderAll(); closeProductForm(); }
function deleteProduct(id){ if(confirm('Delete product permanently?')){ adminProducts = adminProducts.filter(p=>p.id!==id); saveToLocal(); renderAll(); } }
function closeProductForm(){ document.getElementById('productModalForm').classList.remove('open'); }

// CRUD Members
let currentMemberId = null;
function openAddMember(){ currentMemberId = null; clearMemberForm(); document.getElementById('memberFormTitle').innerText='Add Member'; document.getElementById('memberModalForm').classList.add('open'); }
function openEditMember(id){ const m = adminMembers.find(x=>x.id===id); if(m){ currentMemberId=id; document.getElementById('editMemberId').value=id; document.getElementById('memberName').value=m.name; document.getElementById('memberType').value=m.type; document.getElementById('memberLocation').value=m.location; document.getElementById('memberSales').value=m.sales; document.getElementById('memberBadge').value=m.badge; document.getElementById('memberTagline').value=m.tagline; document.getElementById('memberAvatar').value=m.avatar; document.getElementById('memberRank').value=m.rank; document.getElementById('memberModalForm').classList.add('open'); } }
function clearMemberForm(){ document.getElementById('memberName').value=''; document.getElementById('memberType').value='seller'; document.getElementById('memberLocation').value=''; document.getElementById('memberSales').value=''; document.getElementById('memberBadge').value=''; document.getElementById('memberTagline').value=''; document.getElementById('memberAvatar').value=''; document.getElementById('memberRank').value=''; }
function saveMember(){ const id = document.getElementById('editMemberId').value; const name = document.getElementById('memberName').value; if(!name) return; const newMember = { id: id ? parseInt(id) : Date.now(), name, type: document.getElementById('memberType').value, rank: parseInt(document.getElementById('memberRank').value)||99, sales: document.getElementById('memberSales').value, avatar: document.getElementById('memberAvatar').value.toUpperCase(), location: document.getElementById('memberLocation').value, badge: document.getElementById('memberBadge').value, tagline: document.getElementById('memberTagline').value, color: '#f9e8e0', accentColor: '#c9a96e' }; if(id){ const idx = adminMembers.findIndex(m=>m.id==id); if(idx!==-1) adminMembers[idx]=newMember; } else { adminMembers.push(newMember); } saveToLocal(); renderAll(); closeMemberForm(); }
function deleteMember(id){ if(confirm('Remove member?')){ adminMembers = adminMembers.filter(m=>m.id!==id); saveToLocal(); renderAll(); } }
function closeMemberForm(){ document.getElementById('memberModalForm').classList.remove('open'); }

// CHARTS
function renderCharts() {
    const catCounts = {};
    adminProducts.forEach(p => { catCounts[p.category] = (catCounts[p.category]||0)+1; });
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctxCat, { type: 'doughnut', data: { labels: Object.keys(catCounts), datasets: [{ data: Object.values(catCounts), backgroundColor: ['#c9a96e','#c49080','#a8b89c','#e0c8bc','#d4b4a4'], borderWidth: 0 }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } } });
    
    const typeCount = { seller: 0, recruiter: 0, rising: 0 };
    adminMembers.forEach(m => { typeCount[m.type] = (typeCount[m.type]||0)+1; });
    const ctxMem = document.getElementById('memberTypeChart').getContext('2d');
    memberChart = new Chart(ctxMem, { type: 'bar', data: { labels: ['Top Sellers', 'Advocates', 'Rising Stars'], datasets: [{ label: 'Members', data: [typeCount.seller, typeCount.recruiter, typeCount.rising], backgroundColor: '#c9a96e', borderRadius: 12 }] }, options: { responsive: true } });
    
    const prices = adminProducts.map(p=>p.price);
    const ctxPrice = document.getElementById('priceHistogram').getContext('2d');
    priceChart = new Chart(ctxPrice, { type: 'line', data: { labels: prices.map((_,i)=>`#${i+1}`), datasets: [{ label: 'Product Price (₱)', data: prices, borderColor: '#c49080', tension: 0.2, fill: false }] }, options: { responsive: true, plugins: { legend: { display: false } } } });
}

// TAB SWITCHING
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId+'Tab').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${tabId}"]`).classList.add('active');
    if(tabId === 'products') renderProductsTable();
    if(tabId === 'members') renderMembersGrid();
    if(tabId === 'analytics') renderCharts();
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    document.getElementById('liveDate').innerText = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });
    document.getElementById('addProductBtn')?.addEventListener('click', openAddProduct);
    document.getElementById('addMemberBtn')?.addEventListener('click', openAddMember);
    document.getElementById('saveProductBtn')?.addEventListener('click', saveProduct);
    document.getElementById('saveMemberBtn')?.addEventListener('click', saveMember);
    document.getElementById('adminProductSearch')?.addEventListener('input', () => renderProductsTable());
    document.getElementById('adminCategoryFilter')?.addEventListener('change', () => renderProductsTable());
    document.getElementById('adminMemberSearch')?.addEventListener('input', () => renderMembersGrid());
    document.getElementById('logoutAdminBtn')?.addEventListener('click', () => { window.location.href = '../index.html'; });
});