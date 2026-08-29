// ============================================
// kochBRATAN — Street Store  |  app.js
// ============================================

(function () {
  \"use strict\";

  // ---------- Базовые товары (если localStorage пустой) ----------
  const defaultProducts = [
    { id: 1, name: \"RAW HOODIE\",      cat: \"hoodie\",    tag: \"Бестселлер\",  mono: \"H\", price: 2400, img: null },
    { id: 2, name: \"CONCRETE TEE\",    cat: \"tee\",       tag: \"Новинка\",     mono: \"T\", price: 1100, img: null },
    { id: 3, name: \"STEEL CARGO\",     cat: \"pants\",     tag: \"Дроп 04\",     mono: \"C\", price: 2900, img: null },
    { id: 4, name: \"BLACKOUT PARKA\",  cat: \"outerwear\", tag: \"Ограниченно\", mono: \"P\", price: 5200, img: null },
    { id: 5, name: \"ASH BEANIE\",      cat: \"acc\",       tag: null,          mono: \"B\", price: 650,  img: null },
    { id: 6, name: \"VOID TEE\",        cat: \"tee\",       tag: \"Новинка\",     mono: \"T\", price: 1150, img: null },
    { id: 7, name: \"FRAME JACKET\",    cat: \"outerwear\", tag: null,          mono: \"J\", price: 4600, img: null },
    { id: 8, name: \"MONO HOODIE\",     cat: \"hoodie\",    tag: null,          mono: \"H\", price: 2500, img: null },
    { id: 9, name: \"GRID CAP\",        cat: \"acc\",       tag: \"Новинка\",     mono: \"G\", price: 850,  img: null },

    { id: 10, name: \"SUPREME CHERRY JACKET\", cat: \"outerwear\", tag: \"Лимит\",  mono: \"S\", price: 6800, img: \"products/supreme-jacket.jpg\" },
    { id: 11, name: \"TNF FLEECE JACKET\",     cat: \"outerwear\", tag: \"Новинка\", mono: \"N\", price: 4200, img: \"products/tnf-fleece.jpg\" },
    { id: 12, name: \"PALACE CREWNECK\",       cat: \"hoodie\",    tag: \"Коллаб\",  mono: \"P\", price: 3900, img: \"products/palace-crew.jpg\" },
    { id: 13, name: \"NIKE TN PLUS\",          cat: \"acc\",       tag: \"Релиз\",   mono: \"T\", price: 4500, img: \"products/nike-tn.jpg\" },
    { id: 14, name: \"SIXPM ZIP HOODIE\",      cat: \"hoodie\",    tag: \"Коллаб\",  mono: \"6\", price: 5100, img: \"products/sixpm-hoodie.jpg\" },
  ];

  // ---------- Загрузка / сохранение ----------
  function loadProducts() {
    try {
      const saved = localStorage.getItem(\"koch_products\");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [...defaultProducts];
  }

  function saveProducts() {
    localStorage.setItem(\"koch_products\", JSON.stringify(products));
  }

  let products = loadProducts();
  let nextId = products.reduce((max, p) => Math.max(max, p.id), 0) + 1;

  // ---------- Состояние ----------
  let activeCat = \"all\";
  let cart = [];
  let adminOpen = false;

  // ---------- DOM ----------
  const grid        = document.getElementById(\"grid\");
  const filters     = document.getElementById(\"filters\");
  const cartCount   = document.getElementById(\"cartCount\");
  const drawerItems = document.getElementById(\"drawerItems\");
  const drawerTotal = document.getElementById(\"drawerTotal\");
  const overlay     = document.getElementById(\"overlay\");
  const drawer      = document.getElementById(\"drawer\");
  const toastEl     = document.getElementById(\"toast\");

  // ---------- Утилиты ----------
  function catLabel(cat) {
    const map = {
      hoodie:    \"Худи\",
      tee:       \"Футболка\",
      pants:     \"Брюки\",
      outerwear: \"Верхняя одежда\",
      acc:       \"Аксессуар\"
    };
    return map[cat] || cat;
  }

  function formatPrice(num) {
    return Number(num).toLocaleString(\"uk-UA\") + \" ₴\";
  }

  // ---------- Рендер каталога ----------
  function renderGrid() {
    const list = activeCat === \"all\"
      ? products
      : products.filter(p => p.cat === activeCat);

    if (list.length === 0) {
      grid.innerHTML = \"<div style=\\\"grid-column:1/-1;padding:60px;text-align:center;color:var(--g3)\\\">Нет товаров в этой категории</div>\";
      return;
    }

    grid.innerHTML = list.map(p => {
      const visualContent = p.img
        ? `<img src=\"${p.img}\" alt=\"${p.name}\" class=\"card__img\" loading=\"lazy\">`
        : `<span class=\"card__mono\">${p.mono || \"?\"}</span>`;

      return `
        <article class=\"card\">
          ${p.tag ? `<span class=\"card__tag\">${p.tag}</span>` : \"\"}
          <div class=\"card__visual\">
            <div class=\"stripes\"></div>
            ${visualContent}
          </div>
          <div class=\"card__body\">
            <div class=\"card__name\">${p.name}</div>
            <div class=\"card__meta\">${catLabel(p.cat)} · 100% хлопок</div>
            <div class=\"card__foot\">
              <span class=\"card__price\">${formatPrice(p.price)}</span>
              <button class=\"add-btn\" data-id=\"${p.id}\">В корзину</button>
            </div>
          </div>
        </article>
      `;
    }).join(\"\");
  }

  // ---------- Корзина ----------
  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
    showToast(`${product.name} — добавлено`);
  }

  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  }

  function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = count;

    if (cart.length === 0) {
      drawerItems.innerHTML = `
        <div class=\"drawer__empty\">
          Корзина пуста.<br>Выбери что-нибудь из каталога.
        </div>`;
    } else {
      drawerItems.innerHTML = cart.map(item => {
        const thumb = item.img
          ? `<img src=\"${item.img}\" alt=\"${item.name}\" class=\"drawer__img\">`
          : (item.mono || \"?\");

        return `
          <div class=\"drawer__item\">
            <div class=\"drawer__thumb\">${thumb}</div>
            <div class=\"drawer__info\">
              <div class=\"name\">${item.name}</div>
              <div class=\"price\">${item.qty} × ${formatPrice(item.price)}</div>
            </div>
            <button class=\"drawer__remove\" data-id=\"${item.id}\">Убрать</button>
          </div>
        `;
      }).join(\"\");
    }

    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    drawerTotal.textContent = formatPrice(total);
  }

  // ---------- Drawer ----------
  function openDrawer() {
    overlay.classList.add(\"open\");
    drawer.classList.add(\"open\");
  }

  function closeDrawer() {
    overlay.classList.remove(\"open\");
    drawer.classList.remove(\"open\");
  }

  // ---------- Toast ----------
  let toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add(\"show\");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove(\"show\");
    }, 2200);
  }

  // ========== АДМИНКА ==========
  function createAdminPanel() {
    const panel = document.createElement(\"div\");
    panel.id = \"adminPanel\";
    panel.innerHTML = `
      <div class=\"admin-overlay\" id=\"adminOverlay\"></div>
      <div class=\"admin-drawer\" id=\"adminDrawer\">
        <div class=\"admin-head\">
          <span>Админ · Товары</span>
          <button id=\"adminClose\">×</button>
        </div>

        <div class=\"admin-body\">
          <form id=\"addProductForm\" class=\"admin-form\">
            <h3>Добавить товар</h3>

            <label>Название</label>
            <input type=\"text\" id=\"pName\" placeholder=\"RAW HOODIE\" required>

            <label>Категория</label>
            <select id=\"pCat\" required>
              <option value=\"hoodie\">Худи</option>
              <option value=\"tee\">Футболка</option>
              <option value=\"pants\">Брюки</option>
              <option value=\"outerwear\">Верхняя одежда</option>
              <option value=\"acc\">Аксессуар</option>
            </select>

            <label>Цена (₴)</label>
            <input type=\"number\" id=\"pPrice\" placeholder=\"2400\" min=\"1\" required>

            <label>Тег (необязательно)</label>
            <input type=\"text\" id=\"pTag\" placeholder=\"Новинка / Лимит / Коллаб\">

            <label>Буква (если нет фото)</label>
            <input type=\"text\" id=\"pMono\" placeholder=\"H\" maxlength=\"2\">

            <label>Ссылка на фото (необязательно)</label>
            <input type=\"text\" id=\"pImg\" placeholder=\"products/файл.jpg или https://...\">

            <button type=\"submit\" class=\"admin-btn\">+ Добавить товар</button>
          </form>

          <div class=\"admin-list-wrap\">
            <h3>Все товары <span id=\"productCount\"></span></h3>
            <div id=\"adminList\" class=\"admin-list\"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    document.getElementById(\"adminClose\").addEventListener(\"click\", closeAdmin);
    document.getElementById(\"adminOverlay\").addEventListener(\"click\", closeAdmin);

    document.getElementById(\"addProductForm\").addEventListener(\"submit\", (e) => {
      e.preventDefault();
      addProductFromForm();
    });

    renderAdminList();
  }

  function openAdmin() {
    adminOpen = true;
    document.getElementById(\"adminPanel\").classList.add(\"open\");
    renderAdminList();
  }

  function closeAdmin() {
    adminOpen = false;
    document.getElementById(\"adminPanel\").classList.remove(\"open\");
  }

  function addProductFromForm() {
    const name  = document.getElementById(\"pName\").value.trim();
    const cat   = document.getElementById(\"pCat\").value;
    const price = Number(document.getElementById(\"pPrice\").value);
    const tag   = document.getElementById(\"pTag\").value.trim() || null;
    const mono  = document.getElementById(\"pMono\").value.trim() || (name ? name[0].toUpperCase() : \"?\");
    const img   = document.getElementById(\"pImg\").value.trim() || null;

    if (!name || !price) {
      showToast(\"Заполни название и цену\");
      return;
    }

    const newProduct = {
      id: nextId++,
      name,
      cat,
      tag,
      mono,
      price,
      img
    };

    products.push(newProduct);
    saveProducts();
    renderGrid();
    renderAdminList();
    document.getElementById(\"addProductForm\").reset();
    showToast(`${name} — добавлен`);
  }

  function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    cart = cart.filter(item => item.id !== id);
    saveProducts();
    renderGrid();
    renderAdminList();
    updateCartUI();
    showToast(\"Товар удалён\");
  }

  function renderAdminList() {
    const listEl = document.getElementById(\"adminList\");
    const countEl = document.getElementById(\"productCount\");
    if (!listEl) return;

    countEl.textContent = `(${products.length})`;

    if (products.length === 0) {
      listEl.innerHTML = \"<p class=\\\"admin-empty\\\">Товаров пока нет</p>\";
      return;
    }

    listEl.innerHTML = products.map(p => `
      <div class=\"admin-item\">
        <div class=\"admin-item__info\">
          <strong>${p.name}</strong>
          <span>${catLabel(p.cat)} · ${formatPrice(p.price)}</span>
        </div>
        <button class=\"admin-delete\" data-id=\"${p.id}\" title=\"Удалить\">×</button>
      </div>
    `).join(\"\");
  }

  document.addEventListener(\"click\", (e) => {
    const btn = e.target.closest(\".admin-delete\");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (confirm(\"Удалить этот товар?\")) {
      deleteProduct(id);
    }
  });

  // ---------- События магазина ----------
  filters.addEventListener(\"click\", (e) => {
    const btn = e.target.closest(\".filter-btn\");
    if (!btn) return;

    filters.querySelectorAll(\".filter-btn\").forEach(b => b.classList.remove(\"active\"));
    btn.classList.add(\"active\");
    activeCat = btn.dataset.cat;
    renderGrid();
  });

  grid.addEventListener(\"click\", (e) => {
    const btn = e.target.closest(\".add-btn\");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const product = products.find(p => p.id === id);
    if (product) addToCart(product);
  });

  drawerItems.addEventListener(\"click\", (e) => {
    const btn = e.target.closest(\".drawer__remove\");
    if (!btn) return;
    removeFromCart(Number(btn.dataset.id));
  });

  document.getElementById(\"cartOpenBtn\").addEventListener(\"click\", openDrawer);
  document.getElementById(\"drawerClose\").addEventListener(\"click\", closeDrawer);
  overlay.addEventListener(\"click\", closeDrawer);

  document.addEventListener(\"keydown\", (e) => {
    if (e.key === \"Escape\") {
      closeDrawer();
      closeAdmin();
    }
  });

  document.getElementById(\"checkoutBtn\").addEventListener(\"click\", () => {
    if (cart.length === 0) {
      showToast(\"Корзина пуста\");
      return;
    }
    showToast(\"Заказ оформлен. Мы на связи.\");
    cart = [];
    updateCartUI();
    setTimeout(closeDrawer, 900);
  });

  document.getElementById(\"newsForm\").addEventListener(\"submit\", (e) => {
    e.preventDefault();
    showToast(\"Готово — ты в списке\");
    e.target.reset();
  });

  // Кнопка открытия админки
  function addAdminButton() {
    const btn = document.createElement(\"button\");
    btn.id = \"adminOpenBtn\";
    btn.className = \"admin-open-btn\";
    btn.textContent = \"⚙ Админ\";
    btn.title = \"Открыть панель управления товарами\";
    document.body.appendChild(btn);
    btn.addEventListener(\"click\", openAdmin);
  }

  // ---------- Инициализация ----------
  createAdminPanel();
  addAdminButton();
  renderGrid();
  updateCartUI();
})();