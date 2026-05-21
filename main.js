import { createIcons, icons } from 'lucide';

// --- State Management ---
const AppState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  cart: JSON.parse(localStorage.getItem('cart')) || [],
  orders: JSON.parse(localStorage.getItem('orders')) || [],
  products: [
    { id: 1, name: 'Thermal Paper Roll 78mm x 78mm', price: 150, size: '78x78', stock: 500, image: '/thermal_roll.png' },
    { id: 2, name: 'Thermal Paper Roll 57mm x 46mm', price: 80, size: '57x46', stock: 800, image: '/thermal_roll.png' },
    { id: 3, name: 'Thermal Paper Roll 57mm x 35mm', price: 65, size: '57x35', stock: 1200, image: '/thermal_roll.png' },
    { id: 4, name: 'Thermal Paper Roll 76mm x 46mm', price: 110, size: '76x46', stock: 300, image: '/thermal_roll.png' },
  ],
  save() {
    localStorage.setItem('user', JSON.stringify(this.user));
    localStorage.setItem('cart', JSON.stringify(this.cart));
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }
};

// --- Notification System ---
window.notify = (message, type = 'info') => {
  const container = document.getElementById('notification-container');
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;

  let icon = '<i data-lucide="info"></i>';
  if (type === 'success') icon = '<i data-lucide="check-circle"></i>';
  if (type === 'error') icon = '<i data-lucide="alert-circle"></i>';

  notif.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(notif);
  createIcons({ icons });

  setTimeout(() => {
    notif.style.animation = 'slide-up 0.3s ease forwards';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
};

// --- Router ---
const routes = {
  '/': () => AppState.user ? navigateTo('/home') : renderLanding(),
  '/home': () => AppState.user ? renderHome() : navigateTo('/login'),
  '/login': () => renderLogin(),
  '/register': () => renderRegister(),
  '/cart': () => AppState.user ? renderCart() : navigateTo('/login'),
  '/orders': () => AppState.user ? renderOrders() : navigateTo('/login'),
  '/profile': () => AppState.user ? renderProfile() : navigateTo('/login'),
  '/admin': () => AppState.user?.role === 'admin' ? renderAdmin() : navigateTo('/')
};

window.navigateTo = (path) => {
  window.location.hash = path;
};

const router = () => {
  const path = window.location.hash.slice(1) || '/';
  const renderFunc = routes[path] || routes['/'];
  renderFunc();
  createIcons({ icons });
};

window.addEventListener('hashchange', router);

// --- Core UI Components ---
const Layout = (content, activeTab = 'home') => {
  const app = document.getElementById('app');
  const isAdmin = AppState.user?.role === 'admin';

  app.innerHTML = `
    <header class="app-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="/logo.png" alt="Logo" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover; background: #fcf3d9;" />
        <h1 class="app-header-title">The Paper Lab</h1>
      </div>
      ${AppState.user ? `<button class="btn btn-secondary" onclick="logout()" style="padding: 0.5rem; border-radius: 50%;"><i data-lucide="log-out"></i></button>` : ''}
    </header>
    <div class="page-container">
      ${content}
      ${activeTab !== 'home' && activeTab !== 'admin' && activeTab !== 'orders' && activeTab !== 'profile' && activeTab !== 'cart' ? '' : `
        <footer class="app-footer">
          <img src="/logo.png" alt="Logo" style="width: 50px; border-radius: 50%; padding: 4px; background: #fcf3d9; margin-bottom: 1rem;"/>
          <h3>The Paper Lab</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Contact: 078 767 8391</p>
          <p style="font-size: 0.85rem; color: var(--text-muted);">WhatsApp: 078 258 3127</p>
          <div class="social-links">
            <a href="#" class="social-icon"><i data-lucide="facebook"></i></a>
            <a href="#" class="social-icon"><i data-lucide="instagram"></i></a>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem;">© 2024 The Paper Lab. All rights reserved.</p>
        </footer>
      `}
    </div>
    
    <!-- Chat Widget -->
    <div class="chatbot-toggle" onclick="toggleChat()">
      <i data-lucide="message-circle"></i>
    </div>
    <div class="chat-window" id="chatWindow">
      <div class="chat-header">
        <strong>Paper Bot</strong>
        <button class="btn btn-secondary" style="padding: 2px 6px;" onclick="toggleChat()"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
      </div>
      <div class="chat-messages" id="chatMessages">
        <div class="chat-msg bot">Hello! I'm your AI assistant. How can I help you with our thermal paper rolls today?</div>
      </div>
      <form class="chat-input" onsubmit="sendMessage(event)">
        <input type="text" id="chatInput" placeholder="Ask about bill rolls..." autocomplete="off" required />
        <button type="submit"><i data-lucide="send"></i></button>
      </form>
    </div>

    ${AppState.user ? `
    <nav class="bottom-nav">
      <button class="nav-item ${activeTab === 'home' ? 'active' : ''}" onclick="navigateTo('/home')">
        <i data-lucide="home"></i><span>Home</span>
      </button>
      ${isAdmin ? `
        <button class="nav-item ${activeTab === 'admin' ? 'active' : ''}" onclick="navigateTo('/admin')">
          <i data-lucide="layout-dashboard"></i><span>Dashboard</span>
        </button>
      ` : ''}
      <button class="nav-item ${activeTab === 'cart' ? 'active' : ''}" onclick="navigateTo('/cart')" style="position:relative">
        <i data-lucide="shopping-cart"></i><span>Cart</span>
        ${AppState.cart.length ? `<span style="position:absolute; top:-5px; right:15px; background:var(--danger); color:white; border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center;">${AppState.cart.length}</span>` : ''}
      </button>
      <button class="nav-item ${activeTab === 'orders' ? 'active' : ''}" onclick="navigateTo('/orders')">
        <i data-lucide="package"></i><span>Orders</span>
      </button>
      <button class="nav-item ${activeTab === 'profile' ? 'active' : ''}" onclick="navigateTo('/profile')">
        <i data-lucide="user"></i><span>Profile</span>
      </button>
    </nav>
    ` : ''}
  `;
};

// --- Views ---

const renderLanding = () => {
  document.getElementById('app').innerHTML = `
    <div class="page-container" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height: 100vh; background: var(--bg-primary); overflow: hidden; position: relative;">
      
      <!-- Ambient light effect -->
      <div style="position: absolute; top: -20%; left: -20%; width: 60%; height: 60%; background: var(--accent-primary); filter: blur(120px); opacity: 0.15; border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -20%; right: -20%; width: 60%; height: 60%; background: var(--accent-secondary); filter: blur(120px); opacity: 0.1; border-radius: 50%;"></div>

      <div class="landing-logo-container">
        <div class="pulse-ring"></div>
        <img src="/logo.png" alt="The Paper Lab Logo" style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; background: #fcf3d9; padding: 15px; border: 3px solid var(--accent-primary); box-shadow: var(--shadow-glow); position: relative; z-index: 2;" />
      </div>
      
      <div style="text-align:center; z-index: 10;">
        <h1 class="landing-title">The Paper Lab</h1>
        <p class="landing-subtitle">Paper With Purpose</p>
        <div style="margin-top: 1rem; margin-bottom: 2rem; display: inline-block; padding: 6px 20px; background: rgba(212, 163, 115, 0.15); border: 1px solid rgba(212, 163, 115, 0.5); border-radius: 20px; font-size: 0.85rem; color: var(--accent-primary); font-weight: 700; letter-spacing: 2px;" class="landing-subtitle">
          EST. 2024
        </div>
      </div>
      
      <div class="landing-cta" style="width: 100%; max-width: 300px; z-index: 10;">
        <button class="btn btn-primary btn-block mb-2" onclick="navigateTo('/login')" style="padding: 1rem; font-size: 1.1rem; box-shadow: 0 10px 20px -5px rgba(212, 163, 115, 0.4);">
          Sign In
        </button>
        <button class="btn btn-secondary btn-block" onclick="navigateTo('/register')" style="padding: 1rem; font-size: 1.1rem;">
          Create Account
        </button>
      </div>
    </div>
  `;
};

const renderLogin = () => {
  document.getElementById('app').innerHTML = `
    <div class="page-container" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height: 100vh;">
      <div style="text-align:center; margin-bottom: 2rem;">
        <img src="/logo.png" alt="The Paper Lab Logo" style="width: 120px; height: 120px; margin-bottom: 1rem; border-radius: 12px; object-fit: cover; background: #fcf3d9; padding: 10px;" />
        <h1 class="app-header-title" style="font-size: 2.5rem; margin-bottom: 0.5rem;">The Paper Lab</h1>
        <p>Paper With Purpose</p>
      </div>
      <div class="card" style="width: 100%;">
        <h2>Login</h2>
        <form id="loginForm" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="loginEmail" class="form-control" required placeholder="admin@paperlab.com or user@..." />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="loginPassword" class="form-control" required placeholder="••••••••" />
          </div>
          <button type="submit" class="btn btn-primary btn-block">Sign In</button>
        </form>
        <p class="text-center mt-3">
          Don't have an account? <a href="#/register" style="color: var(--accent-primary)">Register</a>
        </p>
      </div>
    </div>
  `;
};

const renderRegister = () => {
  document.getElementById('app').innerHTML = `
    <div class="page-container" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height: 100vh;">
      <div class="card" style="width: 100%;">
        <h2>Create Account</h2>
        <form id="registerForm" onsubmit="handleRegister(event)">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="regName" class="form-control" required placeholder="Hirusha Nimnada" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="regEmail" class="form-control" required placeholder="name@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone (WhatsApp)</label>
            <input type="tel" id="regPhone" class="form-control" required placeholder="078 767 8391" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="regPassword" class="form-control" required placeholder="••••••••" />
          </div>
          <button type="submit" class="btn btn-primary btn-block">Register</button>
        </form>
        <p class="text-center mt-3">
          Already have an account? <a href="#/login" style="color: var(--accent-primary)">Login</a>
        </p>
      </div>
    </div>
  `;
};

const renderHome = () => {
  const productHtml = AppState.products.map(p => `
    <div class="product-card">
      <img src="${p.image}" class="product-image" alt="${p.name}" />
      <div class="product-details">
        <h3 class="product-title">${p.name}</h3>
        <p style="margin:0; font-size:0.875rem;">Size: ${p.size}</p>
        <div class="flex justify-between items-center mt-1">
          <span class="product-price">Rs. ${p.price}</span>
          <button class="btn btn-primary" style="padding: 0.5rem 1rem;" onclick="addToCart(${p.id})">
            <i data-lucide="plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  `).join('');

  Layout(`
    <div style="text-align: center; padding: 2.5rem 1rem; background: linear-gradient(145deg, var(--bg-tertiary), var(--bg-primary)); border-radius: var(--border-radius-lg); margin-bottom: 2rem; position: relative; overflow: hidden; border: 1px solid rgba(212, 163, 115, 0.2); box-shadow: var(--shadow-md);">
      <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: var(--accent-primary); filter: blur(80px); opacity: 0.2; border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -50px; left: -50px; width: 150px; height: 150px; background: var(--accent-secondary); filter: blur(80px); opacity: 0.1; border-radius: 50%;"></div>
      
      <div style="position: relative; z-index: 10;">
        <img src="/logo.png" alt="The Paper Lab Logo" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; background: #fcf3d9; padding: 8px; box-shadow: var(--shadow-glow); margin-bottom: 1rem; border: 2px solid var(--accent-primary);" />
        <h2 style="font-size: 2.2rem; margin-bottom: 0.25rem; background: linear-gradient(135deg, #fff, #ccc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">The Paper Lab</h2>
        <p style="color: var(--accent-primary); font-weight: 600; letter-spacing: 3px; text-transform: uppercase; font-size: 0.8rem; margin-bottom: 1.5rem;">Paper With Purpose</p>
        <div style="display: inline-block; padding: 5px 16px; background: rgba(212, 163, 115, 0.15); border: 1px solid rgba(212, 163, 115, 0.5); border-radius: 20px; font-size: 0.75rem; color: var(--accent-primary); font-weight: 700; letter-spacing: 1px;">
          EST. 2024
        </div>
      </div>
    </div>
    
    <div class="flex justify-between items-center mb-3">
      <h2 style="margin: 0; font-size: 1.5rem;">Our Products</h2>
      <span style="font-size: 0.85rem; color: var(--text-muted); background: var(--bg-tertiary); padding: 4px 10px; border-radius: 12px;">Premium Rolls</span>
    </div>
    <div class="products-grid">
      ${productHtml}
    </div>
  `, 'home');
};

const renderCart = () => {
  if (AppState.cart.length === 0) {
    return Layout(`
      <h2>Shopping Cart</h2>
      <div class="text-center mt-4">
        <i data-lucide="shopping-cart" style="width: 64px; height: 64px; color: var(--text-muted); margin-bottom: 1rem;"></i>
        <p>Your cart is empty.</p>
        <button class="btn btn-primary mt-2" onclick="navigateTo('/home')">Browse Products</button>
      </div>
    `, 'cart');
  }

  let total = 0;
  const cartItemsHtml = AppState.cart.map((item, index) => {
    total += item.price * item.quantity;
    return `
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding: 1rem;">
        <div>
          <h4 style="margin:0">${item.name}</h4>
          <p style="margin:0; font-size:0.875rem;">Rs. ${item.price} x ${item.quantity}</p>
        </div>
        <button class="btn btn-secondary" style="padding: 0.5rem; border-radius: 50%; color: var(--danger)" onclick="removeFromCart(${index})">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
  }).join('');

  Layout(`
    <h2>Shopping Cart</h2>
    <div class="mt-3">
      ${cartItemsHtml}
    </div>
    <div class="card mt-3">
      <div class="flex justify-between items-center mb-2">
        <span style="font-size:1.2rem; font-weight:600;">Total</span>
        <span style="font-size:1.5rem; font-weight:700; color:var(--accent-primary)">Rs. ${total}</span>
      </div>
      <button class="btn btn-primary btn-block" onclick="checkout()">Checkout & Place Order</button>
    </div>
  `, 'cart');
};

const renderOrders = () => {
  const userOrders = AppState.user.role === 'admin'
    ? AppState.orders
    : AppState.orders.filter(o => o.userId === AppState.user.email);

  if (userOrders.length === 0) {
    return Layout(`
      <h2>${AppState.user.role === 'admin' ? 'All Orders' : 'My Orders'}</h2>
      <p class="text-center mt-4 text-muted">No orders found.</p>
    `, 'orders');
  }

  const ordersHtml = userOrders.sort((a, b) => b.date - a.date).map(o => `
    <div class="card">
      <div class="flex justify-between items-center mb-2">
        <strong>Order #${o.id}</strong>
        <span style="background: ${o.status === 'Pending' ? 'var(--accent-primary)' : 'var(--success)'}; color: ${o.status === 'Pending' ? '#000' : '#fff'}; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">
          ${o.status}
        </span>
      </div>
      <p style="font-size:0.875rem; margin-bottom:0.5rem;">Date: ${new Date(o.date).toLocaleDateString()}</p>
      ${AppState.user.role === 'admin' ? `<p style="font-size:0.875rem; margin-bottom:0.5rem;">Customer: ${o.userId}</p>` : ''}
      <p style="font-size:0.875rem; margin-bottom:1rem;">Total: <strong>Rs. ${o.total}</strong></p>
      
      ${AppState.user.role === 'admin' && o.status === 'Pending' ? `
        <button class="btn btn-primary btn-block" onclick="markOrderCompleted('${o.id}')">Mark as Completed</button>
      ` : ''}
    </div>
  `).join('');

  Layout(`
    <h2>${AppState.user.role === 'admin' ? 'Order Management' : 'My Orders'}</h2>
    <div class="mt-3">
      ${ordersHtml}
    </div>
  `, 'orders');
};

const renderProfile = () => {
  Layout(`
    <h2>Profile Management</h2>
    <div class="card mt-3 text-center">
      <div style="width: 80px; height: 80px; background: var(--bg-tertiary); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
        <i data-lucide="user" style="width: 40px; height: 40px; color: var(--accent-primary);"></i>
      </div>
      <h3>${AppState.user.name}</h3>
      <p>${AppState.user.email}</p>
      <p>${AppState.user.phone}</p>
      <span style="background: var(--bg-tertiary); padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
        Role: ${AppState.user.role}
      </span>
    </div>
    
    <div class="card mt-3">
      <h3>Settings</h3>
      <button class="btn btn-secondary btn-block mt-2 text-left" style="justify-content: flex-start;"><i data-lucide="bell"></i> Notification Preferences</button>
      <button class="btn btn-secondary btn-block mt-2 text-left" style="justify-content: flex-start;"><i data-lucide="shield"></i> Security Settings</button>
      <button class="btn btn-secondary btn-block mt-2 text-left" style="justify-content: flex-start;" onclick="logout()"><i data-lucide="log-out"></i> Sign Out</button>
    </div>
  `, 'profile');
};

const renderAdmin = () => {
  // Calculate Reports
  const totalSales = AppState.orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = AppState.orders.length;
  const pendingOrders = AppState.orders.filter(o => o.status === 'Pending').length;
  const totalStock = AppState.products.reduce((sum, p) => sum + p.stock, 0);

  Layout(`
    <h2>Admin Dashboard</h2>
    <p>Comprehensive Reporting System</p>
    
    <h3 class="mt-4 mb-2">1. Monthly Statistical Report</h3>
    <div class="grid-2">
      <div class="stat-card">
        <h4>Total Orders</h4>
        <div class="value">${totalOrders}</div>
      </div>
      <div class="stat-card">
        <h4>Pending Orders</h4>
        <div class="value" style="color: var(--danger)">${pendingOrders}</div>
      </div>
    </div>
    
    <h3 class="mt-4 mb-2">2. Sales Summary Report</h3>
    <div class="card text-center" style="border: 1px solid var(--accent-primary);">
      <h4 style="color: var(--text-muted); font-size: 0.9rem;">Total Revenue</h4>
      <div class="value" style="color: var(--accent-primary); font-size: 2.5rem; font-weight: 800;">Rs. ${totalSales}</div>
    </div>
    
    <h3 class="mt-4 mb-2">3. Inventory and Stock Report</h3>
    <div class="card">
      <div class="mb-3">
        <span style="font-size: 0.85rem; color: var(--text-muted);">Total Units Across All Sizes:</span>
        <strong style="color: var(--success); font-size: 1.1rem; margin-left: 10px;">${totalStock} Units</strong>
      </div>
      ${AppState.products.map(p => `
        <div class="flex justify-between items-center mb-2 pb-2" style="border-bottom: 1px solid var(--bg-tertiary)">
          <div>
            <div style="font-weight: 600;">${p.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted)">Size: ${p.size}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; ${p.stock < 500 ? 'color: var(--danger)' : ''}">${p.stock} units</div>
            ${p.stock < 500 ? '<span style="font-size:0.7rem; color:var(--danger)">Low Stock!</span>' : ''}
          </div>
        </div>
      `).join('')}
    </div>
    
  `, 'admin');
};

// --- Actions ---

window.handleLogin = (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pwd = document.getElementById('loginPassword').value;

  // Mock Auth
  if (email === 'admin@paperlab.com') {
    AppState.user = { name: 'Hirusha Nimnada', email, phone: '078 767 8391', role: 'admin' };
  } else {
    AppState.user = { name: 'Customer', email, phone: '000 000 0000', role: 'user' };
  }

  AppState.save();
  notify('Login successful!', 'success');
  navigateTo('/home');
};

window.handleRegister = (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const phone = document.getElementById('regPhone').value;

  AppState.user = { name, email, phone, role: 'user' };
  AppState.save();
  notify('Registration successful!', 'success');
  navigateTo('/home');
};

window.logout = () => {
  AppState.user = null;
  AppState.cart = [];
  AppState.save();
  notify('Logged out', 'info');
  navigateTo('/login');
};

window.addToCart = (productId) => {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  const existing = AppState.cart.find(i => i.id === productId);
  if (existing) existing.quantity++;
  else AppState.cart.push({ ...product, quantity: 1 });

  AppState.save();
  notify(`${product.name} added to cart`, 'success');
  router(); // re-render to update cart icon
};

window.removeFromCart = (index) => {
  AppState.cart.splice(index, 1);
  AppState.save();
  notify('Item removed from cart', 'info');
  renderCart();
};

window.checkout = () => {
  if (AppState.cart.length === 0) return;

  const total = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update inventory
  AppState.cart.forEach(cartItem => {
    const p = AppState.products.find(p => p.id === cartItem.id);
    if (p) p.stock -= cartItem.quantity;
  });

  const order = {
    id: Math.random().toString(36).substr(2, 6).toUpperCase(),
    userId: AppState.user.email,
    items: [...AppState.cart],
    total,
    date: Date.now(),
    status: 'Pending'
  };

  AppState.orders.push(order);
  AppState.cart = [];
  AppState.save();

  notify('Order placed successfully!', 'success');
  navigateTo('/orders');
};

window.markOrderCompleted = (orderId) => {
  const order = AppState.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'Completed';
    AppState.save();
    notify(`Order #${orderId} marked as completed`, 'success');
    renderOrders();
  }
};

// --- Chat Actions ---
window.toggleChat = () => {
  const w = document.getElementById('chatWindow');
  w.style.display = w.style.display === 'flex' ? 'none' : 'flex';
};

window.sendMessage = (e) => {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  const messages = document.getElementById('chatMessages');
  messages.innerHTML += `<div class="chat-msg user">${msg}</div>`;
  input.value = '';

  messages.scrollTop = messages.scrollHeight;

  setTimeout(() => {
    let reply = "I can help you with thermal paper rolls! We have sizes like 78x78, 57x46, and more. Use the products page to order.";
    if (msg.toLowerCase().includes('size')) {
      reply = "We offer 78mm x 78mm, 57mm x 46mm, 57mm x 35mm, and 76mm x 46mm. They are high quality thermal paper.";
    } else if (msg.toLowerCase().includes('contact')) {
      reply = "You can call us at 078 767 8391 or WhatsApp at 078 258 3127.";
    } else if (msg.toLowerCase().includes('price')) {
      reply = "Prices start from Rs. 65 to Rs. 150 depending on the size of the bill roll.";
    }

    messages.innerHTML += `<div class="chat-msg bot">${reply}</div>`;
    messages.scrollTop = messages.scrollHeight;
  }, 1000);
};

// --- Initialization ---
router();
