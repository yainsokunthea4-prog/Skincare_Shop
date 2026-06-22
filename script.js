const learnMoreBtn = document.getElementById('learnMoreBtn');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const productGrid = document.getElementById('productGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const searchBtnProduct = document.getElementById('searchBtnProduct');
const cartToggle = document.getElementById('cartToggle');
const cartItemsContainer = document.getElementById('cartItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const paymentForm = document.getElementById('paymentForm');
const paymentTotal = document.getElementById('paymentTotal');
const paymentStatus = document.getElementById('paymentStatus');
const cardName = document.getElementById('cardName');
const cardNumber = document.getElementById('cardNumber');
const cardExp = document.getElementById('cardExp');
const cardCvc = document.getElementById('cardCvc');

let currentCategory = 'all';
const cart = [];

learnMoreBtn.addEventListener('click', () => {
  document.querySelector('#benefits').scrollIntoView({ behavior: 'smooth' });
});

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!email || !message) {
    formMessage.textContent = 'Please provide both an email and a message.';
    return;
  }

  formMessage.textContent = 'Thanks for reaching out! We will reply shortly.';
  contactForm.reset();
});

function parsePrice(productCard) {
  const priceText = productCard.querySelector('.price').textContent.replace(/[^0-9.]/g, '');
  return Number(priceText) || 0;
}

function updateCartSummary() {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 10 : 0;
  const discount = subtotal >= 100 ? 10 : 0;
  const total = subtotal + delivery - discount;

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('deliveryFee').textContent = `$${delivery.toFixed(2)}`;
  document.getElementById('discountAmount').textContent = `-$${discount.toFixed(2)}`;
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
  paymentTotal.textContent = `$${total.toFixed(2)}`;
  cartCount.textContent = cart.reduce((count, item) => count + item.quantity, 0);
}

function renderCartItems() {
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">No items in cart yet. Add a product to begin.</p>';
    return;
  }

  cart.forEach((item) => {
    const productCard = Array.from(productGrid.querySelectorAll('.product-card')).find((cardEl) => cardEl.querySelector('h3').textContent.trim() === item.name);
    const imageUrl = productCard ? productCard.querySelector('img').src : '';

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-media">
        <img src="${imageUrl}" alt="${item.name}" />
      </div>
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <p>${item.quantity} × $${item.price.toFixed(2)}</p>
        <div class="quantity-control">
          <button type="button" data-action="decrease" data-product="${item.name}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-product="${item.name}">+</button>
        </div>
      </div>
      <div class="cart-item-actions">
        <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
        <button type="button" data-action="remove" data-product="${item.name}">Remove</button>
      </div>
    `;

    const removeButton = cartItem.querySelector('button[data-action="remove"]');
    removeButton.addEventListener('click', () => {
      removeFromCart(item.name);
    });

    cartItem.querySelectorAll('button[data-action]:not([data-action="remove"])').forEach((button) => {
      button.addEventListener('click', () => {
        changeQuantity(item.name, button.getAttribute('data-action'));
      });
    });

    cartItemsContainer.appendChild(cartItem);
  });
}

function changeQuantity(name, action) {
  const item = cart.find((entry) => entry.name === name);
  if (!item) return;

  if (action === 'increase') {
    item.quantity += 1;
  } else if (action === 'decrease') {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      removeFromCart(name);
      return;
    }
  }

  renderCartItems();
  updateCartSummary();
}

function addToCart(productCard) {
  const name = productCard.querySelector('h3').textContent.trim();
  const price = parsePrice(productCard);
  const existing = cart.find((item) => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  productCard.classList.add('selected');
  renderCartItems();
  updateCartSummary();
}

function removeFromCart(name) {
  const index = cart.findIndex((item) => item.name === name);
  if (index !== -1) {
    cart.splice(index, 1);
    const card = Array.from(productGrid.querySelectorAll('.product-card')).find((cardEl) => cardEl.querySelector('h3').textContent.trim() === name);
    if (card) card.classList.remove('selected');
    renderCartItems();
    updateCartSummary();
  }
}

function setupAddButtons() {
  productGrid.querySelectorAll('.product-card').forEach((card) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button-secondary add-cart-btn';
    button.textContent = 'Add to Cart';

    button.addEventListener('click', () => {
      addToCart(card);
    });

    card.querySelector('.product-details').appendChild(button);
  });
}

function openCart() {
  const cartSection = document.getElementById('cartSection');
  cartSection.classList.add('active-cart-section');
  cartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => cartSection.classList.remove('active-cart-section'), 2200);
}

cartToggle.addEventListener('click', openCart);

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    paymentStatus.textContent = 'Add items to cart before checkout.';
    return;
  }
  paymentForm.classList.toggle('hidden');
  paymentStatus.textContent = '';
});

const clearCartBtn = document.getElementById('clearCartBtn');
clearCartBtn.addEventListener('click', () => {
  cart.length = 0;
  renderCartItems();
  updateCartSummary();
  paymentForm.classList.add('hidden');
});

// Payment method handling
const paymentMethods = document.getElementsByName('paymentMethod');
const cardFields = document.querySelector('.card-fields');
const qrFields = document.querySelector('.qr-fields');
function updatePaymentFields() {
  const method = Array.from(paymentMethods).find(m => m.checked)?.value;
  if (method === 'card') {
    cardFields.classList.remove('hidden');
    qrFields.classList.add('hidden');
  } else if (method === 'qr') {
    cardFields.classList.add('hidden');
    qrFields.classList.remove('hidden');
  } else {
    // cash / delivery
    cardFields.classList.add('hidden');
    qrFields.classList.add('hidden');
  }
}

Array.from(paymentMethods).forEach((m) => m.addEventListener('change', updatePaymentFields));
updatePaymentFields();

paymentForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const method = Array.from(paymentMethods).find(m => m.checked)?.value;
  paymentStatus.textContent = '';

  if (method === 'card') {
    paymentStatus.textContent = 'Processing card payment...';
    setTimeout(() => {
      paymentStatus.textContent = '';
      redirectToThankYou();
    }, 900);
  } else if (method === 'qr') {
    paymentStatus.textContent = 'Waiting for QR payment...';
    setTimeout(() => {
      paymentStatus.textContent = '';
      redirectToThankYou();
    }, 1200);
  } else {
    // cash on delivery / delivery option
    redirectToThankYou();
  }
});

function redirectToThankYou() {
  cart.length = 0;
  renderCartItems();
  updateCartSummary();
  paymentForm.reset();
  paymentForm.classList.add('hidden');
  window.location.href = 'thank-you.html';
}


// Product filtering by category
filterBtns.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    currentCategory = btn.getAttribute('data-category');

    // Update active button
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    // When selecting a category, clear the search text so group filters show fully
    searchInput.value = '';
    performSearch();
  });
});

function performSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const products = productGrid.querySelectorAll('.product-card');

  products.forEach((product) => {
    const productName = product.querySelector('h3').textContent.toLowerCase();
    const productType = product.querySelector('.product-type').textContent.toLowerCase();
    const productDesc = product.querySelector('p').textContent.toLowerCase();
    const productCategory = product.getAttribute('data-category') || '';

    const matchesSearch = searchTerm === '' ||
                          productName.includes(searchTerm) ||
                          productType.includes(searchTerm) ||
                          productDesc.includes(searchTerm) ||
                          productCategory.includes(searchTerm);

    const matchesCategory = searchTerm !== '' ? true :
                           currentCategory === 'all' ||
                           productCategory === currentCategory;

    if (matchesSearch && matchesCategory) {
      product.classList.remove('hidden');
    } else {
      product.classList.add('hidden');
    }
  });

  // Show or hide categories based on visible products
  document.querySelectorAll('.product-category').forEach((category) => {
    const visibleProducts = category.querySelectorAll('.product-card:not(.hidden)');
    category.style.display = visibleProducts.length > 0 ? 'block' : 'none';
  });
}

searchBtnProduct.addEventListener('click', performSearch);

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

searchInput.addEventListener('input', performSearch);

setupAddButtons();