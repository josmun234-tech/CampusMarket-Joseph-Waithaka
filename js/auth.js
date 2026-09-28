/* =========================================================
   CampusMarket — Authentication System
   Session management with localStorage
   ========================================================= */

class AuthManager {
  constructor() {
    this.storageKey = 'campusmarket_users';
    this.sessionKey = 'campusmarket_session';
    this.initUsers();
  }

  initUsers() {
    if (!localStorage.getItem(this.storageKey)) {
      // Sample users for demo
      const defaultUsers = [
        { id: 1, email: 'student@campus.edu', password: 'password123', name: 'John Student', avatar: '👨‍🎓', joinDate: '2026-01-15' },
        { id: 2, email: 'jane@campus.edu', password: 'password123', name: 'Jane Doe', avatar: '👩‍🎓', joinDate: '2026-02-20' }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(defaultUsers));
    }
  }

  register(email, password, name) {
    const users = JSON.parse(localStorage.getItem(this.storageKey));
    
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered' };
    }

    const newUser = {
      id: Date.now(),
      email,
      password,
      name,
      avatar: this.getAvatar(),
      joinDate: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return { success: true, message: 'Registration successful!' };
  }

  login(email, password) {
    const users = JSON.parse(localStorage.getItem(this.storageKey));
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const session = { userId: user.id, email: user.email, name: user.name, avatar: user.avatar };
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      return { success: true, user };
    }

    return { success: false, message: 'Invalid email or password' };
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
  }

  getCurrentUser() {
    const session = localStorage.getItem(this.sessionKey);
    return session ? JSON.parse(session) : null;
  }

  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  getAvatar() {
    const avatars = ['👨‍🎓', '👩‍🎓', '👨‍💼', '👩‍💼', '🧑‍🎓', '👨‍🔬', '👩‍🔬'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  updateProfile(userId, updates) {
    const users = JSON.parse(localStorage.getItem(this.storageKey));
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      
      // Update session
      const session = localStorage.getItem(this.sessionKey);
      if (session) {
        const currentSession = JSON.parse(session);
        if (currentSession.userId === userId) {
          currentSession.name = updates.name || currentSession.name;
          localStorage.setItem(this.sessionKey, JSON.stringify(currentSession));
        }
      }
      return { success: true };
    }
    return { success: false };
  }
}

// Global instance
const auth = new AuthManager();

// Update navigation based on login status
function updateNavigation() {
  const currentUser = auth.getCurrentUser();
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

  const list = document.createElement('ul');
  const browseItem = document.createElement('li');
  browseItem.append(createNavigationLink('Browse', 'catalog.html'));
  list.append(browseItem);

  if (currentUser) {
    const profileItem = document.createElement('li');
    const profileLink = createNavigationLink(`${currentUser.avatar} ${currentUser.name.split(' ')[0]}`, 'profile.html', 'nav-user');
    profileItem.append(profileLink);
    list.append(profileItem);

    const logoutItem = document.createElement('li');
    const logoutLink = createNavigationLink('Log out', '#', 'nav-link-muted');
    logoutLink.id = 'logout-btn';
    logoutLink.addEventListener('click', function(event) {
      event.preventDefault();
      auth.logout();
      window.location.href = 'index.html';
    });
    logoutItem.append(logoutLink);
    list.append(logoutItem);
  } else {
    ['Log in', 'Sign up'].forEach(label => {
      const item = document.createElement('li');
      item.append(createNavigationLink(label, 'login.html', 'nav-link-muted'));
      list.append(item);
    });
  }

  const cartItem = document.createElement('li');
  const cartLink = createNavigationLink('🛒 Cart', currentUser ? '#' : 'login.html', 'cart-link');
  if (currentUser) cartLink.id = 'cart-toggle';
  const cartCountElement = document.createElement('span');
  cartCountElement.className = 'cart-count';
  cartCountElement.id = 'cart-count';
  cartCountElement.textContent = '0';
  cartLink.append(cartCountElement);
  cartItem.append(cartLink);
  list.append(cartItem);
  nav.replaceChildren(list);

  // Update cart count
  const cart = JSON.parse(localStorage.getItem('campusmarket_cart')) || [];
  const totalItems = cart.reduce((sum, item) => {
    const quantity = Number(item.quantity);
    return Number.isInteger(quantity) && quantity > 0 ? sum + quantity : sum;
  }, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

function createNavigationLink(label, href, className = '') {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;
  if (className) link.className = className;
  return link;
}

// Call on page load
document.addEventListener('DOMContentLoaded', updateNavigation);
