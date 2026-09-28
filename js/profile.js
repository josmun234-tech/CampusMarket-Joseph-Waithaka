const profileCurrentUser = auth.getCurrentUser();

function profileStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function showProfileSection(sectionName, selectedLink) {
  const section = document.getElementById(`section-${sectionName}`);
  if (!section) return;

  document.querySelectorAll('.content-section').forEach(item => item.classList.remove('active'));
  section.classList.add('active');
  document.querySelectorAll('.profile-menu-item').forEach(item => {
    item.classList.remove('active');
    item.removeAttribute('aria-current');
  });
  const menuLink = [...document.querySelectorAll('.profile-menu-item')]
    .find(item => item.dataset.profileSection === sectionName);
  if (menuLink) {
    menuLink.classList.add('active');
    menuLink.setAttribute('aria-current', 'page');
  }
}

function renderOrders(orders) {
  const container = document.getElementById('orders-container');
  container.replaceChildren();
  if (orders.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const icon = document.createElement('div');
    icon.className = 'empty-state-icon';
    icon.textContent = '📦';
    const message = document.createElement('p');
    message.append('No orders yet. ');
    const link = document.createElement('a');
    link.href = 'catalog.html';
    link.textContent = 'Start shopping';
    message.append(link);
    empty.append(icon, message);
    container.append(empty);
    return;
  }

  orders.forEach(order => {
    const item = document.createElement('article');
    item.className = 'order-item';
    const header = document.createElement('div');
    header.className = 'order-header';
    const id = document.createElement('span');
    id.className = 'order-id';
    id.textContent = order.orderId;
    const status = document.createElement('span');
    status.className = 'order-status';
    status.textContent = order.status;
    header.append(id, status);

    const details = document.createElement('div');
    details.className = 'order-details';
    const dateAndCount = document.createElement('p');
    dateAndCount.textContent = `Date: ${order.date} | Items: ${order.items.length}`;
    const total = document.createElement('p');
    total.textContent = `Total: KSh ${Number(order.total).toLocaleString()}`;
    details.append(dateAndCount, total);
    item.append(header, details);
    container.append(item);
  });
}

function loadProfile() {
  if (!profileCurrentUser) {
    window.location.assign('login.html');
    return;
  }

  const users = profileStorage('campusmarket_users', []);
  const user = users.find(entry => entry.id === profileCurrentUser.userId);
  if (!user) {
    auth.logout();
    window.location.assign('login.html');
    return;
  }

  document.getElementById('user-avatar').textContent = user.avatar;
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('join-date').textContent = new Date(user.joinDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById('edit-name').value = user.name;
  document.getElementById('edit-email').value = user.email;

  const orders = profileStorage('campusmarket_orders', []).filter(order => order.email === user.email);
  document.getElementById('total-orders').textContent = String(orders.length);
  document.getElementById('orders-count').textContent = String(orders.length);
  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  document.getElementById('total-spent').textContent = `KSh ${totalSpent.toLocaleString()}`;
  renderOrders(orders);

  const cart = profileStorage('campusmarket_cart', []);
  const itemCount = cart.reduce((sum, item) => {
    const quantity = Number(item.quantity);
    return Number.isInteger(quantity) && quantity > 0 ? sum + quantity : sum;
  }, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = String(itemCount);
}

document.addEventListener('click', function(event) {
  const sectionLink = event.target.closest('[data-profile-section]');
  if (!sectionLink) return;
  event.preventDefault();
  showProfileSection(sectionLink.dataset.profileSection, sectionLink);
});

document.getElementById('edit-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const nameInput = document.getElementById('edit-name');
  const name = nameInput.value.trim();
  const message = document.getElementById('profile-message');
  if (name.length < 2) {
    message.textContent = 'Enter a full name with at least two characters.';
    message.classList.add('is-visible');
    return;
  }

  auth.updateProfile(profileCurrentUser.userId, { name });
  document.getElementById('user-name').textContent = name;
  updateNavigation();
  message.textContent = 'Profile updated successfully.';
  message.classList.add('is-visible');
});

document.getElementById('logout-btn-2').addEventListener('click', function() {
  auth.logout();
  window.location.assign('index.html');
});

document.addEventListener('DOMContentLoaded', loadProfile);