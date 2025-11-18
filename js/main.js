// ================== КОНСТАНТЫ ДЛЯ КОРЗИНЫ ==================
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

// добавить товар в корзину
function addToCart(product, qty = 1) {
  const cart = loadCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  saveCart(cart);
}

// навесить обработчики на обычные кнопки "Köp" (слайдер, каталог и т.п.)
function setupBuyButtons() {
  // игнорируем hero-кнопки (у них есть data-qty-input)
  const buttons = document.querySelectorAll('[data-product-id]:not([data-qty-input])');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-product-id');
      const name = btn.getAttribute('data-product-name');
      const price = parseInt(btn.getAttribute('data-product-price'), 10) || 0;
      const weight = btn.getAttribute('data-product-weight') || '';

      addToCart({ id, name, price, weight }, 1);

      const orig = btn.textContent;
      const feedback = btn.getAttribute('data-feedback') || 'Tillagd ✓';
      btn.textContent = feedback;
      setTimeout(() => {
        btn.textContent = orig;
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

// ================== JS ПОСЛЕ ЗАГРУЗКИ DOM ==================
document.addEventListener('DOMContentLoaded', () => {
  // ---------- HERO-СЛАЙДЕР С ТОВАРАМИ ----------
  const heroImgEl   = document.getElementById('hero-product-img');
  const heroDescEl  = document.getElementById('hero-desc');
  const heroQtyInput = document.getElementById('hero-qty');
  const heroAddBtn  = document.getElementById('hero-add-btn');
  const heroBuyBtn  = document.getElementById('hero-buy-btn');
  const heroPrev    = document.querySelector('.hero-arrow.prev');
  const heroNext    = document.querySelector('.hero-arrow.next');

  // данные по 7 товарам
  const heroProducts = [
    {
      id: 'flaskjerky',
      name: 'Fläskjerky',
      image: 'img/product1.jpg',
      title: 'Fläskjerky – torrt kött med riktig karaktär',
      text1: 'Tunt skuret svenskt fläskkött som marineras i vår egna blandning av sojasås, kryddor och svartpeppar.',
      text2: 'Resultatet blir krispiga bitar med intensiv, men balanserad smak – perfekt till öl, fredagsmys eller en lång bilresa.',
      weight: '100 g',
      price: 85,
      ingredients: 'Fläskkotlett, sojasås, svartpeppar (malen), vitlök och en hemlig kryddmix.'
    },
    {
      id: 'biffjerky',
      name: 'Biffjerky',
      image: 'img/product2.jpg',
      title: 'Biffjerky – klassisk beefjerky med mycket protein',
      text1: 'Nötkött av hög kvalitet som skärs i tunna skivor, marineras i kryddor och torkas långsamt innan det rökas varsamt.',
      text2: 'Fyllig men lätt rökig smak – perfekt efter träningen, på resan eller när du vill ha något naturligt snacks.',
      weight: '100 g',
      price: 125,
      ingredients: 'Nötkött, svartpeppar, paprika, vitlök, blandning av starka paprikor.'
    },
    {
      id: 'krakowska-korv',
      name: 'Krakowska korv (torkad)',
      image: 'img/product3.jpg',
      title: 'Krakowska korv – klassiker av fläsk och nöt',
      text1: 'Traditionell torkad korv av fläsk- och nötkött, kryddad med vitlök, peppar och aromatiska kryddor.',
      text2: 'Långsam varmrökning ger en fast konsistens och djup, lätt rökig smak.',
      weight: 'ca 100 g',
      price: 77,
      ingredients: 'Fläsk- och nötköttfärs (50/50), salt/nitritsalt, svartpeppar, paprika, chilipeppar, vitlök.'
    },
    {
      id: 'kallrokt-alg',
      name: 'Kallrökt älg',
      image: 'img/product4.jpg',
      title: 'Kallrökt älg – långlagrat älgkött',
      text1: 'Exklusivt älgkött som kallrökts med dubbelrökning och lagrats i 1–1,5 månader.',
      text2: 'Mört, smakrikt kött med tydlig men balanserad rökighet – perfekt till charkbrickan.',
      weight: 'ca 100 g',
      price: 110,
      ingredients: 'Älgkött, salt, kryddor.'
    },
    {
      id: 'kallrokt-kronhjort',
      name: 'Kallrökt kronhjort',
      image: 'img/product5.jpg',
      title: 'Kallrökt kronhjort – elegant viltkött',
      text1: 'Kronhjort som kallrökts varsamt med dubbelrökning och lagrats i 1–1,5 månader.',
      text2: 'Mjuk, elegant smak med mild men tydlig rökighet – självklart val till finare servering.',
      weight: 'ca 100 g',
      price: 125,
      ingredients: 'Kronhjortkött, salt, kryddor.'
    },
    {
      id: 'vildsvin-kallrokt',
      name: 'Vildsvin kallrökt',
      image: 'img/product6.jpg',
      title: 'Vildsvin kallrökt – kraftfull smak',
      text1: 'Kraftfullt viltkött från vildsvin som kallrökts med dubbelrökning och lagrats i cirka en månad.',
      text2: 'Djup, robust och fyllig smak med markerad rökton – för dig som gillar något extra.',
      weight: 'ca 100 g',
      price: 95,
      ingredients: 'Kallrökt kött av vildsvin, salt, svartpeppar, paprika, lök, vitlök, chili, örtkryddblandning.'
    },
    
  ];

  let heroIndex = 0;

  function renderHeroProduct(index) {
    if (!heroImgEl || !heroDescEl) return;

    const product = heroProducts[index];
    if (!product) return;

    // картинка
    heroImgEl.src = product.image;
    heroImgEl.alt = product.name;

    // текст
    heroDescEl.innerHTML = `
      <h2>${product.title}</h2>
      <p>${product.text1}</p>
      <p>${product.text2}</p>
      <p class="hero-meta-line">
        <strong>Vikt:</strong> ${product.weight}
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <strong>Pris:</strong> ${product.price} kr
      </p>
      <p><strong>Innehåll:</strong> ${product.ingredients}</p>
    `;

    // сброс количества
    if (heroQtyInput) {
      heroQtyInput.value = 1;
    }

    // обновляем data-атрибуты на кнопках hero
    if (heroAddBtn && heroBuyBtn) {
      [heroAddBtn, heroBuyBtn].forEach((btn) => {
        btn.dataset.productId = product.id;
        btn.dataset.productName = product.name;
        btn.dataset.productPrice = String(product.price);
        btn.dataset.productWeight = product.weight;
      });
    }
  }

  // обработчики для hero-кнопок (Lägg i varukorg / Köp nu)
  function setupHeroActions() {
    if (!heroAddBtn || !heroBuyBtn) return;

    function handleHeroClick(btn, goCart) {
      const id = btn.dataset.productId;
      if (!id) return;

      const name = btn.dataset.productName || '';
      const price = parseInt(btn.dataset.productPrice, 10) || 0;
      const weight = btn.dataset.productWeight || '';
      let qty = 1;

      const qtySelector = btn.dataset.qtyInput;
      if (qtySelector) {
        const input = document.querySelector(qtySelector);
        if (input) {
          const val = parseInt(input.value, 10);
          if (!isNaN(val) && val > 0) qty = val;
        }
      }

      addToCart({ id, name, price, weight }, qty);

      const orig = btn.textContent;
      const feedback = btn.dataset.feedback || 'Tillagd ✓';
      btn.textContent = feedback;
      setTimeout(() => {
        btn.textContent = orig;
      }, 800);

      if (goCart) {
        window.location.href = 'cart.html';
      }
    }

    heroAddBtn.addEventListener('click', () => handleHeroClick(heroAddBtn, false));
    heroBuyBtn.addEventListener('click', () => handleHeroClick(heroBuyBtn, true));
  }

  if (heroPrev && heroNext) {
    heroPrev.addEventListener('click', () => {
      heroIndex = (heroIndex - 1 + heroProducts.length) % heroProducts.length;
      renderHeroProduct(heroIndex);
    });

    heroNext.addEventListener('click', () => {
      heroIndex = (heroIndex + 1) % heroProducts.length;
      renderHeroProduct(heroIndex);
    });
  }

  // стартовое состояние hero
  renderHeroProduct(heroIndex);
  setupHeroActions();

  

  window.addEventListener('resize', updateSlider);
  updateSlider();

  // ---------- КНОПКИ ПОКУПКИ И КОРЗИНА ----------
  setupBuyButtons();
  renderCartPage();
});
