// ================== СЛАЙДЕР ==================
const track = document.querySelector('.slider-track');
const slides = document.querySelectorAll('.product-slide');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');

let currentIndex = 0;

function updateSlider() {
  if (!track || !slides.length) return;

  const slideWidth = slides[0].offsetWidth;
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

  if (prevBtn) {
    prevBtn.style.display = currentIndex === 0 ? "none" : "flex";
  }
  if (nextBtn) {
    nextBtn.style.display = currentIndex === slides.length - 1 ? "none" : "flex";
  }
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      updateSlider();
    }
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });
}

window.addEventListener('resize', updateSlider);
updateSlider();

// ================== КОРЗИНА ==================
const CART_KEY = 'jr_cart';

// загрузка корзины из localStorage
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading cart', e);
    return [];
  }
}

// сохранение корзины
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// добавить товар
function addToCart(product) {
  const cart = loadCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
}

// навесить обработчики на кнопки "Köp"
function setupBuyButtons() {
  const buttons = document.querySelectorAll('[data-product-id]');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-product-id');
      const name = btn.getAttribute('data-product-name');
      const price = parseInt(btn.getAttribute('data-product-price'), 10) || 0;
      const weight = btn.getAttribute('data-product-weight') || '';

      addToCart({ id, name, price, weight });

      // маленький фидбек
      btn.textContent = 'Tillagd ✓';
      setTimeout(() => {
        btn.textContent = 'Köp';
      }, 800);
    });
  });
}

// отрисовка корзины на cart.html
function renderCartPage() {
  const tbody = document.querySelector('#cart-items');
  const totalSpan = document.querySelector('#cart-total');
  const container = document.querySelector('#cart-container');
  const emptyBlock = document.querySelector('.cart-empty');
  const clearBtn = document.querySelector('#cart-clear');

  if (!tbody || !totalSpan || !container || !emptyBlock) return;

  let cart = loadCart();

  if (!cart.length) {
    container.style.display = 'none';
    emptyBlock.style.display = 'block';
    return;
  } else {
    container.style.display = 'block';
    emptyBlock.style.display = 'none';
  }

  tbody.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const rowTotal = item.price * item.qty;
    total += rowTotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.weight || ''}</td>
      <td>
        <input 
          type="number" 
          min="1" 
          value="${item.qty}" 
          class="cart-qty" 
          data-index="${index}"
        >
      </td>
      <td>${item.price} kr</td>
      <td>${rowTotal} kr</td>
      <td>
        <button class="cart-remove" data-index="${index}">Ta bort</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  totalSpan.textContent = `${total} kr`;

  // смена количества
  tbody.addEventListener('change', (e) => {
    if (e.target.classList.contains('cart-qty')) {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      cart = loadCart();
      if (cart[idx]) {
        cart[idx].qty = val;
        saveCart(cart);
        renderCartPage();
      }
    }
  }, { once: true });

  // удаление одного товара
  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-remove')) {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      cart = loadCart();
      cart.splice(idx, 1);
      saveCart(cart);
      renderCartPage();
    }
  }, { once: true });

  // очистить корзину
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      saveCart([]);
      renderCartPage();
    }, { once: true });
  }
}

// запуск логики корзины
document.addEventListener('DOMContentLoaded', () => {
  setupBuyButtons();
  renderCartPage();
});
