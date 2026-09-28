/* =========================================================
   CampusMarket — Enhanced JavaScript
   Full e-commerce functionality with cart, checkout, and orders
   ========================================================= */

const products = window.campusMarketProducts;

// Cart State
let cart = JSON.parse(localStorage.getItem('campusmarket_cart')) || [];

// DOM Elements
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeModal = document.getElementById('close-modal');
const checkoutForm = document.getElementById('checkout-form');
const successModal = document.getElementById('success-modal');
const continueShopping = document.getElementById('continue-shopping');
const categoryLinks = document.querySelectorAll('.category-bar a');
const searchForm = document.querySelector('.search-form');
const productGrid = document.getElementById('product-grid');
const galleryImage = document.getElementById('gallery-image');
let activeCategory = 'all';
let galleryProducts = products;
let galleryIndex = 0;
let checkoutAttempted = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  renderProducts(products);
  updateGallery();
  renderCart();
  setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
  document.querySelector('.main-nav').addEventListener('click', function(e) {
    if (!e.target.closest('#cart-toggle')) return;
    e.preventDefault();
    toggleCart();
  });
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  productGrid.addEventListener('click', function(e) {
    const button = e.target.closest('.add-to-cart-btn');
    if (button) addToCart(Number(button.dataset.productId));
  });

  document.getElementById('gallery-previous').addEventListener('click', function() {
    if (galleryProducts.length) {
      galleryIndex = (galleryIndex - 1 + galleryProducts.length) % galleryProducts.length;
      updateGallery();
    }
  });
  document.getElementById('gallery-next').addEventListener('click', function() {
    if (galleryProducts.length) {
      galleryIndex = (galleryIndex + 1) % galleryProducts.length;
      updateGallery();
    }
  });

  // Category Filtering
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      categoryLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      activeCategory = this.dataset.category;
      updateCatalog();
    });
  });

  // Search
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.getElementById('site-search').value.toLowerCase();
    updateCatalog(query);
  });
  searchForm.querySelector('input').addEventListener('input', function() {
    updateCatalog(this.value.toLowerCase());
  });

  cartItemsContainer.addEventListener('input', function(e) {
    if (!e.target.matches('.cart-quantity')) return;
    const item = cart.find(entry => entry.id === Number(e.target.dataset.productId));
    if (!item) return;
    item.quantity = e.target.value;
    const validation = validateQuantity(item.quantity);
    const message = e.target.closest('.cart-item').querySelector('.quantity-error');
    message.textContent = validation.valid ? '' : validation.message;
    message.classList.toggle('is-visible', !validation.valid);
    e.target.setAttribute('aria-invalid', String(!validation.valid));
    saveCart();
    updateCartCount();
    updateCartTotal();
    checkoutBtn.disabled = cart.length === 0 || cart.some(entry => !validateQuantity(entry.quantity).valid);
  });
  cartItemsContainer.addEventListener('click', function(e) {
    const button = e.target.closest('[data-cart-action]');
    if (!button) return;
    const id = Number(button.dataset.productId);
    if (button.dataset.cartAction === 'remove') removeFromCart(id);
    if (button.dataset.cartAction === 'increment' || button.dataset.cartAction === 'decrement') {
      const item = cart.find(entry => entry.id === id);
      if (item) updateQuantity(id, Number(item.quantity) + (button.dataset.cartAction === 'increment' ? 1 : -1));
    }
  });

  // Checkout
  checkoutBtn.addEventListener('click', openCheckout);
  closeModal.addEventListener('click', closeCheckout);
  checkoutForm.addEventListener('submit', processOrder);
  continueShopping.addEventListener('click', function() {
    successModal.classList.remove('open');
    closeCart();
  });
}

function renderProducts() {
  productGrid.replaceChildren();
  products.forEach(product => {
    const card = document.createElement('li');
    card.className = 'product-card';
    card.dataset.productId = String(product.id);
    card.dataset.category = product.category;

    const link = document.createElement('a');
    link.href = '#';
    link.className = 'product-card-link';
    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.image;
    image.alt = product.name;
    image.loading = 'lazy';
    const category = document.createElement('p');
    category.className = 'product-category';
    category.textContent = product.categoryLabel;
    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.name;
    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = product.price ? `KSh ${product.price.toLocaleString()}` : 'FREE';
    const seller = document.createElement('p');
    seller.className = 'product-seller';
    seller.textContent = `Listed by ${product.seller}`;
    link.append(image, category, title, price, seller);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'add-to-cart-btn';
    button.dataset.productId = String(product.id);
    button.textContent = 'Add to cart';
    card.append(link, button);
    productGrid.append(card);
  });
}

function updateCatalog(query = document.getElementById('site-search').value.toLowerCase()) {
  const matchingProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const searchableText = `${product.name} ${product.categoryLabel}`.toLowerCase();
    return matchesCategory && searchableText.includes(query.trim());
  });

  galleryProducts = matchingProducts;
  galleryIndex = 0;
  productGrid.querySelectorAll('.product-card').forEach(card => {
    card.hidden = !matchingProducts.some(product => product.id === Number(card.dataset.productId));
  });
  updateResultCount(matchingProducts.length);
  updateGallery();
}

function updateGallery() {
  const hasProducts = galleryProducts.length > 0;
  document.getElementById('gallery-previous').disabled = !hasProducts;
  document.getElementById('gallery-next').disabled = !hasProducts;
  if (!hasProducts) {
    galleryImage.removeAttribute('src');
    galleryImage.alt = 'No products match this filter';
    document.getElementById('gallery-title').textContent = 'No matching products';
    document.getElementById('gallery-category').textContent = '';
    document.getElementById('gallery-price').textContent = '';
    return;
  }

  const product = galleryProducts[galleryIndex];
  galleryImage.src = product.image;
  galleryImage.alt = product.name;
  document.getElementById('gallery-title').textContent = product.name;
  document.getElementById('gallery-category').textContent = product.categoryLabel;
  document.getElementById('gallery-price').textContent = product.price ? `KSh ${product.price.toLocaleString()}` : 'FREE';
}

// Cart Functions
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
  
  // Visual feedback
  const btn = productGrid.querySelector(`.add-to-cart-btn[data-product-id="${productId}"]`);
  if (!btn) return;
  const originalText = btn.textContent;
  btn.textContent = '✓ Added to cart!';
  btn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 1500);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

function updateQuantity(productId, newQuantity) {
  if (!Number.isInteger(newQuantity) || newQuantity < 1) {
    if (newQuantity < 1) {
      removeFromCart(productId);
    }
    return;
  }

  const item = cart.find(entry => entry.id === productId);
  if (item) {
    item.quantity = newQuantity;
    saveCart();
    renderCart();
  }
}

function saveCart() {
  localStorage.setItem('campusmarket_cart', JSON.stringify(cart));
}

function validateQuantity(value) {
  const text = String(value).trim();
  if (!text) return { valid: false, message: 'Quantity is required.' };
  if (!/^\d+$/.test(text)) return { valid: false, message: 'Quantity must be a whole number.' };
  if (Number(text) < 1) return { valid: false, message: 'Quantity must be greater than zero.' };
  return { valid: true, quantity: Number(text) };
}

function updateCartTotal() {
  const total = cart.reduce((sum, item) => {
    const validation = validateQuantity(item.quantity);
    return validation.valid ? sum + item.price * validation.quantity : sum;
  }, 0);
  totalPriceEl.textContent = `KSh ${total.toLocaleString()}`;
}

function updateCartCount() {
  const itemCount = cart.reduce((sum, item) => {
    const validation = validateQuantity(item.quantity);
    return sum + (validation.valid ? validation.quantity : 0);
  }, 0);
  document.getElementById('cart-count').textContent = String(itemCount);
}

function renderCart() {
  updateCartCount();
  cartItemsContainer.replaceChildren();

  if (cart.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-cart';
    emptyMessage.textContent = 'Your cart is empty';
    cartItemsContainer.append(emptyMessage);
  } else {
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      const info = document.createElement('div');
      info.className = 'cart-item-info';
      const title = document.createElement('p');
      title.className = 'cart-item-title';
      title.textContent = item.name;
      const price = document.createElement('p');
      price.className = 'cart-item-price';
      price.textContent = `KSh ${item.price.toLocaleString()}`;
      const controls = document.createElement('div');
      controls.className = 'cart-item-qty';
      const decrement = createCartButton('−', 'decrement', item.id);
      const increment = createCartButton('+', 'increment', item.id);
      const quantity = document.createElement('input');
      quantity.className = 'cart-quantity';
      quantity.type = 'text';
      quantity.inputMode = 'numeric';
      quantity.setAttribute('aria-label', `Quantity for ${item.name}`);
      quantity.dataset.productId = String(item.id);
      quantity.value = String(item.quantity);
      const validation = validateQuantity(item.quantity);
      quantity.setAttribute('aria-invalid', String(!validation.valid));
      const error = document.createElement('p');
      error.className = 'quantity-error';
      error.setAttribute('aria-live', 'polite');
      error.textContent = validation.valid ? '' : validation.message;
      error.classList.toggle('is-visible', !validation.valid);
      controls.append(decrement, quantity, increment, createCartButton('Remove', 'remove', item.id));
      info.append(title, price, controls, error);
      row.append(info);
      cartItemsContainer.append(row);
    });
  }

  updateCartTotal();
  checkoutBtn.disabled = cart.length === 0 || cart.some(item => !validateQuantity(item.quantity).valid);
}

function createCartButton(label, action, productId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = action === 'remove' ? 'cart-item-remove' : 'qty-btn';
  button.dataset.cartAction = action;
  button.dataset.productId = String(productId);
  button.textContent = label;
  return button;
}

function toggleCart() {
  cartSidebar.classList.toggle('open');
  cartOverlay.classList.toggle('open');
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
}

function updateResultCount(count) {
  const resultCount = document.getElementById('result-count');
  if (resultCount) resultCount.textContent = String(count);
}

function setFieldError(input, message) {
  let error = checkoutForm.querySelector(`#${input.id}-error`);
  if (!error) {
    error = document.createElement('p');
    error.id = `${input.id}-error`;
    error.className = 'field-error';
    error.setAttribute('aria-live', 'polite');
    input.insertAdjacentElement('afterend', error);
  }
  error.textContent = message;
  error.classList.toggle('is-visible', Boolean(message));
  input.setAttribute('aria-invalid', String(Boolean(message)));
  if (message) input.setAttribute('aria-describedby', error.id);
  else input.removeAttribute('aria-describedby');
}

function validateCheckout() {
  const fields = [
    {
      input: checkoutForm.elements.fullName,
      message: value => value.trim() ? 'Enter your full name.' : 'Full name is required.',
      valid: value => value.trim().length > 1
    },
    {
      input: checkoutForm.elements.email,
      message: value => !value.trim() ? 'Email is required.' : !value.includes('@') ? 'Email must contain an @ symbol.' : 'Enter an email address with a valid domain.',
      valid: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    },
    {
      input: checkoutForm.elements.phone,
      message: value => value.trim() ? 'Phone number must contain at least 9 digits.' : 'Phone number is required.',
      valid: value => value.replace(/\D/g, '').length >= 9
    },
    {
      input: checkoutForm.elements.address,
      message: value => value.trim() ? 'Delivery address must be at least 5 characters.' : 'Delivery address is required.',
      valid: value => value.trim().length >= 5
    },
    { input: checkoutForm.elements.delivery, message: () => 'Select a delivery option.', valid: value => Boolean(value) },
    { input: checkoutForm.elements.payment, message: () => 'Select a payment method.', valid: value => Boolean(value) }
  ];
  let isValid = true;
  fields.forEach(({ input, message, valid }) => {
    const fieldIsValid = valid(input.value);
    setFieldError(input, fieldIsValid ? '' : message(input.value));
    if (!fieldIsValid) isValid = false;
  });
  return isValid;
}

function openCheckout(e) {
  e.preventDefault();

  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  if (cart.length === 0 || cart.some(item => !validateQuantity(item.quantity).valid)) return;

  closeCart();
  checkoutAttempted = false;
  checkoutForm.querySelectorAll('.field-error').forEach(error => error.classList.remove('is-visible'));
  const orderItemsDiv = document.getElementById('order-items');
  orderItemsDiv.replaceChildren();
  cart.forEach(item => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    const description = document.createElement('span');
    description.textContent = `${item.name} x${item.quantity}`;
    const amount = document.createElement('span');
    amount.textContent = `KSh ${(item.price * item.quantity).toLocaleString()}`;
    orderItem.append(description, amount);
    orderItemsDiv.append(orderItem);
  });
  document.getElementById('checkout-total').textContent = totalPriceEl.textContent;
  checkoutModal.classList.add('open');
}

function closeCheckout() {
  checkoutModal.classList.remove('open');
}

function processOrder(e) {
  e.preventDefault();
  checkoutAttempted = true;
  if (!validateCheckout()) return;

  const fullName = checkoutForm.elements.fullName.value.trim();
  const email = checkoutForm.elements.email.value.trim();
  const phone = checkoutForm.elements.phone.value.trim();
  const address = checkoutForm.elements.address.value.trim();
  const order = {
    orderId: `ORD-${Date.now()}`,
    customer: fullName,
    email,
    phone,
    address,
    items: cart.map(item => ({ ...item, quantity: validateQuantity(item.quantity).quantity })),
    total: cart.reduce((sum, item) => sum + item.price * validateQuantity(item.quantity).quantity, 0),
    date: new Date().toLocaleDateString(),
    status: 'Confirmed'
  };

  const orders = JSON.parse(localStorage.getItem('campusmarket_orders')) || [];
  orders.push(order);
  localStorage.setItem('campusmarket_orders', JSON.stringify(orders));
  cart = [];
  saveCart();
  checkoutForm.reset();
  checkoutAttempted = false;
  checkoutForm.querySelectorAll('.field-error').forEach(error => error.classList.remove('is-visible'));
  checkoutForm.querySelectorAll('[aria-invalid="true"]').forEach(input => input.setAttribute('aria-invalid', 'false'));
  closeCheckout();
  showSuccessMessage(order);
}

checkoutForm.addEventListener('input', function() {
  if (checkoutAttempted) validateCheckout();
});
checkoutForm.addEventListener('change', function() {
  if (checkoutAttempted) validateCheckout();
});

function showSuccessMessage(order) {
  const successMessage = document.getElementById('success-message');
  successMessage.replaceChildren();
  const confirmation = document.createElement('strong');
  confirmation.textContent = `Order ID: ${order.orderId}`;
  const thanks = document.createElement('p');
  thanks.textContent = `Thank you, ${order.customer}! Your order is confirmed for delivery to ${order.address}.`;
  successMessage.append(confirmation, thanks);
  const successContent = successModal.querySelector('.success-content');
  successContent.classList.remove('order-confirmed');
  void successContent.offsetWidth;
  successContent.classList.add('order-confirmed');
  successModal.classList.add('open');
  renderCart();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCart();
    closeCheckout();
  }
});
