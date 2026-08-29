(function(){
  const products = [
    { id:1, name:'RAW HOODIE', cat:'hoodie', tag:'Бестселлер', mono:'H', price:2400 },
    { id:2, name:'CONCRETE TEE', cat:'tee', tag:'Новинка', mono:'T', price:1100 },
    { id:3, name:'STEEL CARGO', cat:'pants', tag:'Дроп 04', mono:'C', price:2900 },
    { id:4, name:'BLACKOUT PARKA', cat:'outerwear', tag:'Ограниченно', mono:'P', price:5200 },
    { id:5, name:'ASH BEANIE', cat:'acc', tag:null, mono:'B', price:650 },
    { id:6, name:'VOID TEE', cat:'tee', tag:'Новинка', mono:'T', price:1150 },
    { id:7, name:'FRAME JACKET', cat:'outerwear', tag:null, mono:'J', price:4600 },
    { id:8, name:'MONO HOODIE', cat:'hoodie', tag:null, mono:'H', price:2500 },
    { id:9, name:'GRID CAP', cat:'acc', tag:'Новинка', mono:'G', price:850 },
  ];

  const grid = document.getElementById('grid');
  const filters = document.getElementById('filters');
  let activeCat = 'all';
  let cart = []; // in-memory only

  function renderGrid(){
    const list = activeCat === 'all' ? products : products.filter(p => p.cat === activeCat);
    grid.innerHTML = list.map(p => `
      <article class="card">
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ''}
        <div class="card__visual">
          <div class="stripes"></div>
          <span class="card__mono">${p.mono}</span>
        </div>
        <div class="card__body">
          <div class="card__name">${p.name}</div>
          <div class="card__meta">${catLabel(p.cat)} · 100% хлопок</div>
          <div class="card__foot">
            <span class="card__price">${p.price} ₴</span>
            <button class="add-btn" data-id="${p.id}">В корзину</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  function catLabel(cat){
    return { hoodie:'Худи', tee:'Футболка', pants:'Брюки', outerwear:'Верхняя одежда', acc:'Аксессуар' }[cat] || cat;
  }

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if(!btn) return;
    filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    renderGrid();
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-btn');
    if(!btn) return;
    const id = Number(btn.dataset.id);
    const product = products.find(p => p.id === id);
    addToCart(product);
  });

  function addToCart(product){
    const existing = cart.find(i => i.id === product.id);
    if(existing){ existing.qty += 1; }
    else{ cart.push({ ...product, qty:1 }); }
    updateCartUI();
    showToast(`${product.name} — добавлено`);
  }

  function removeFromCart(id){
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
  }

  function updateCartUI(){
    const count = cart.reduce((s,i) => s + i.qty, 0);
    document.getElementById('cartCount').textContent = count;

    const itemsEl = document.getElementById('drawerItems');
    if(cart.length === 0){
      itemsEl.innerHTML = `<div class="drawer__empty">Корзина пуста.<br>Выбери что-нибудь из каталога.</div>`;
    } else {
      itemsEl.innerHTML = cart.map(i => `
        <div class="drawer__item">
          <div class="drawer__thumb">${i.mono}</div>
          <div class="drawer__info">
            <div class="name">${i.name}</div>
            <div class="price">${i.qty} × ${i.price} ₴</div>
          </div>
          <button class="drawer__remove" data-id="${i.id}">Убрать</button>
        </div>
      `).join('');
    }

    const total = cart.reduce((s,i) => s + i.qty * i.price, 0);
    document.getElementById('drawerTotal').textContent = total + ' ₴';
  }

  document.getElementById('drawerItems').addEventListener('click', (e) => {
    const btn = e.target.closest('.drawer__remove');
    if(!btn) return;
    removeFromCart(Number(btn.dataset.id));
  });

  const overlay = document.getElementById('overlay');
  const drawer = document.getElementById('drawer');
  function openDrawer(){ overlay.classList.add('open'); drawer.classList.add('open'); }
  function closeDrawer(){ overlay.classList.remove('open'); drawer.classList.remove('open'); }
  document.getElementById('cartOpenBtn').addEventListener('click', openDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeDrawer(); });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if(cart.length === 0){ showToast('Корзина пуста'); return; }
    showToast('Заказ оформлен. Мы на связи.');
    cart = [];
    updateCartUI();
    setTimeout(closeDrawer, 900);
  });

  document.getElementById('newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Готово — ты в списке');
    e.target.reset();
  });

  let toastTimer;
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  renderGrid();
  updateCartUI();
})();