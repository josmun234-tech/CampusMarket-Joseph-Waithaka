const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const messageElement = document.getElementById('auth-message');
const loginContainer = document.getElementById('login-form-container');
const registerContainer = document.getElementById('register-form-container');

function showAuthMessage(message, type) {
  messageElement.textContent = message;
  messageElement.className = `auth-message ${type} is-visible`;
}

function clearAuthMessage() {
  messageElement.textContent = '';
  messageElement.className = 'auth-message';
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

document.querySelectorAll('[data-form-toggle]').forEach(button => {
  button.addEventListener('click', function() {
    loginContainer.hidden = !loginContainer.hidden;
    registerContainer.hidden = !registerContainer.hidden;
    clearAuthMessage();
  });
});

loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email) {
    showAuthMessage('Email is required.', 'error');
    return;
  }
  if (!email.includes('@')) {
    showAuthMessage('Email must contain an @ symbol.', 'error');
    return;
  }
  if (!validEmail(email)) {
    showAuthMessage('Enter an email address with a valid domain.', 'error');
    return;
  }
  if (!password) {
    showAuthMessage('Password is required.', 'error');
    return;
  }

  const result = auth.login(email, password);
  if (!result.success) {
    showAuthMessage('Email or password is incorrect.', 'error');
    return;
  }
  showAuthMessage('Login successful. Redirecting to the catalog...', 'success');
  window.setTimeout(() => window.location.assign('catalog.html'), 1000);
});

registerForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmation = document.getElementById('register-confirm').value;

  if (!name) {
    showAuthMessage('Full name is required.', 'error');
    return;
  }
  if (!email) {
    showAuthMessage('Email is required.', 'error');
    return;
  }
  if (!email.includes('@')) {
    showAuthMessage('Email must contain an @ symbol.', 'error');
    return;
  }
  if (!validEmail(email)) {
    showAuthMessage('Enter an email address with a valid domain.', 'error');
    return;
  }
  if (password.length < 6) {
    showAuthMessage('Password must be at least 6 characters.', 'error');
    return;
  }
  if (password !== confirmation) {
    showAuthMessage('Passwords do not match.', 'error');
    return;
  }

  const result = auth.register(email, password, name);
  if (!result.success) {
    showAuthMessage(result.message, 'error');
    return;
  }
  auth.login(email, password);
  showAuthMessage('Account created. Redirecting to the catalog...', 'success');
  window.setTimeout(() => window.location.assign('catalog.html'), 1000);
});

if (auth.isLoggedIn()) window.location.assign('catalog.html');