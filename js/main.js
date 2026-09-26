(function () {
  const page = document.body.dataset.page || "";
  const products = window.ATELIER.products;

  const header = `
    <header class="site-header" id="site-header">
      <div class="header-inner">
        <a class="logo" href="index.html">ATELIER NOIR</a>
        <nav class="nav-center">
          <a href="shop.html" data-nav="shop">SHOP</a>
          <a href="collection.html" data-nav="collection">COLLECTION</a>
          <a href="lookbook.html" data-nav="lookbook">LOOKBOOK</a>
          <a href="about.html" data-nav="about">ABOUT</a>
        </nav>
        <button class="mobile-toggle" type="button" data-open="menu">MENU</button>
        <div class="nav-right">
          <button class="nav-search" type="button" data-open="search">SEARCH</button>
          <button class="nav-account" type="button" data-open="account">ACCOUNT</button>
          <button type="button" data-open="bag">BAG <span class="bag-count" data-bag-count></span></button>
        </div>
      </div>
    </header>
    <div class="mobile-menu" id="mobile-menu">
      <button class="close-x" type="button" data-close="menu">×</button>
      <a href="shop.html">Shop</a>
      <a href="collection.html">Collection</a>
      <a href="lookbook.html">Lookbook</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
      <a href="shop.html">Search</a>
    </div>
  `;

  const footer = `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <a class="logo" href="index.html">ATELIER NOIR</a>
          <p class="footer-tag">QUIETLY DISTINCT.</p>
        </div>
        <div>
          <h4>EXPLORE</h4>
          <a href="shop.html">Shop</a>
          <a href="collection.html">Collection</a>
          <a href="lookbook.html">Lookbook</a>
        </div>
        <div>
          <h4>HOUSE</h4>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </div>
        <div>
          <h4>STUDIO</h4>
          <p>12 Rue des Archives</p>
          <p>75004 Paris</p>
          <p>studio@ateliernoir.com</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 ATELIER NOIR</span>
        <span>SPRING / SUMMER 2026</span>
      </div>
    </footer>
  `;

  const overlays = `
    <div class="overlay-panel" id="search-panel">
      <div class="scrim" data-close="search"></div>
      <div class="panel">
        <button class="close-x" type="button" data-close="search">×</button>
        <h2>Search</h2>
        <input class="search-input" id="search-input" type="search" placeholder="Search the collection" />
        <div id="search-results" class="product-grid" style="margin-top:28px;grid-template-columns:1fr 1fr;"></div>
      </div>
    </div>
    <div class="overlay-panel" id="account-panel">
      <div class="scrim" data-close="account"></div>
      <div class="panel">
        <button class="close-x" type="button" data-close="account">×</button>
        <h2>Account</h2>
        <form class="contact-form" id="account-form">
          <label>EMAIL</label>
          <input type="email" required placeholder="you@atelier.com" />
          <label>PASSWORD</label>
          <input type="password" required />
          <button class="btn btn-dark" type="submit">SIGN IN</button>
        </form>
      </div>
    </div>
    <div class="drawer" id="bag-drawer">
      <div class="scrim" data-close="bag"></div>
      <aside class="drawer-panel">
        <button class="close-x" type="button" data-close="bag">×</button>
        <h2>Bag</h2>
        <div class="bag-items" id="bag-items"></div>
        <div class="bag-total"><span>TOTAL</span><span id="bag-total">$0</span></div>
        <button class="btn btn-dark" type="button" style="width:100%;margin-top:0;" data-checkout>CHECKOUT</button>
      </aside>
    </div>
    <div class="toast" id="toast"></div>
  `;

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer + overlays);

  document.querySelectorAll("[data-nav]").forEach((el) => {
    if (el.dataset.nav === page) el.classList.add("is-active");
  });

  const headerEl = document.getElementById("site-header");
  window.addEventListener("scroll", () => {
    headerEl.classList.toggle("scrolled", window.scrollY > 8);
  });

  function bag() {
    try {
      return JSON.parse(localStorage.getItem("atelier-bag") || "[]");
    } catch {
      return [];
    }
  }

  function saveBag(items) {
    localStorage.setItem("atelier-bag", JSON.stringify(items));
    renderBag();
  }

  function money(n) {
    return "$" + n;
  }

  function renderBag() {
    const items = bag();
    const count = items.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll("[data-bag-count]").forEach((el) => {
      el.textContent = count ? `(${count})` : "";
    });
    const wrap = document.getElementById("bag-items");
    if (!items.length) {
      wrap.innerHTML = `<p class="bag-empty">Your bag is empty.</p>`;
    } else {
      wrap.innerHTML = items
        .map((i) => {
          const p = products.find((x) => x.id === i.id);
          if (!p) return "";
          return `<div class="bag-item">
            <img src="${p.images[0]}" alt="${p.name}" />
            <div>
              <div>${p.name}</div>
              <div class="muted">${i.size} · ${money(p.price)}</div>
            </div>
            <button type="button" data-remove="${p.id}">×</button>
          </div>`;
        })
        .join("");
    }
    const total = items.reduce((s, i) => {
      const p = products.find((x) => x.id === i.id);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
    document.getElementById("bag-total").textContent = money(total);
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1800);
  }

  window.atelierAddToBag = function (id, size) {
    const items = bag();
    const found = items.find((i) => i.id === id && i.size === size);
    if (found) found.qty += 1;
    else items.push({ id, size, qty: 1 });
    saveBag(items);
    toast("ADDED TO BAG");
  };

  function openPanel(name) {
    const map = {
      search: "search-panel",
      account: "account-panel",
      bag: "bag-drawer",
      menu: "mobile-menu"
    };
    document.getElementById(map[name])?.classList.add("open");
  }

  function closeAll() {
    document.querySelectorAll(".overlay-panel, .drawer, .mobile-menu").forEach((el) => {
      el.classList.remove("open");
    });
  }

  document.body.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) openPanel(open.dataset.open);
    if (e.target.closest("[data-close]")) closeAll();
    const remove = e.target.closest("[data-remove]");
    if (remove) saveBag(bag().filter((i) => i.id !== remove.dataset.remove));
    if (e.target.closest("[data-checkout]")) {
      toast("CHECKOUT COMING SOON");
    }
  });

  document.getElementById("account-form").addEventListener("submit", (e) => {
    e.preventDefault();
    closeAll();
    toast("WELCOME BACK");
  });

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    const list = q
      ? products.filter((p) => (p.name + p.sku + p.category).toLowerCase().includes(q))
      : [];
    document.getElementById("search-results").innerHTML = list.slice(0, 4).map(productCard).join("");
  });

  function productCard(p) {
    return `<a class="product-card" href="product.html?id=${p.id}">
      <div class="img-wrap">
        <img class="primary" src="${p.images[0]}" alt="${p.name}" />
        <img class="alt" src="${p.images[1]}" alt="" />
      </div>
      <div class="product-meta">
        <h3>${p.sku} — ${p.name}</h3>
        <div class="cat">${p.category}</div>
        <div class="price">${money(p.price)}</div>
      </div>
    </a>`;
  }

  window.atelierProductCard = productCard;
  window.atelierProducts = products;
  window.atelierMoney = money;

  const arrivals = document.getElementById("arrivals-grid");
  if (arrivals) {
    arrivals.innerHTML = products.filter((p) => p.arrival).slice(0, 4).map(productCard).join("");
  }

  const related = document.getElementById("related-grid");
  if (related) {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || "shirt";
    related.innerHTML = products
      .filter((p) => p.id !== id)
      .slice(0, 4)
      .map(productCard)
      .join("");
  }

  const shopGrid = document.getElementById("shop-grid");
  if (shopGrid) initShop(shopGrid);

  const pdp = document.getElementById("pdp");
  if (pdp) initPdp(pdp);

  renderBag();

  function initShop(grid) {
    let filter = "ALL";
    let sort = "featured";
    const buttons = document.querySelectorAll("[data-filter]");
    const sortEl = document.getElementById("sort");

    function match(p) {
      if (filter === "ALL") return true;
      if (filter === "NEW ARRIVALS") return p.arrival;
      if (filter === "WOMEN" || filter === "MEN") return p.gender === filter;
      return p.category === filter || p.gender === filter;
    }

    function render() {
      let list = products.filter(match);
      if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
      if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
      if (sort === "newest") list = [...list].filter((p) => p.arrival).concat(list.filter((p) => !p.arrival));
      grid.innerHTML = list.map(productCard).join("");
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filter = btn.dataset.filter;
        buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
        render();
      });
    });
    sortEl.addEventListener("change", () => {
      sort = sortEl.value;
      render();
    });
    render();
  }

  function initPdp(root) {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || "shirt";
    const p = products.find((x) => x.id === id) || products[1];
    let size = "M";
    root.querySelector("[data-sku]").textContent = p.sku;
    root.querySelector("[data-name]").textContent = p.name;
    root.querySelector("[data-price]").textContent = money(p.price);
    root.querySelector("[data-lead]").textContent = p.description;
    root.querySelector("[data-color]").textContent = p.color;
    const gallery = root.querySelector("[data-gallery]");
    gallery.innerHTML = p.images
      .concat(p.images)
      .slice(0, 3)
      .map((src, i) => `<img src="${src}" alt="${p.name} view ${i + 1}" />`)
      .join("");
    root.querySelectorAll("[data-size]").forEach((btn) => {
      btn.addEventListener("click", () => {
        size = btn.dataset.size;
        root.querySelectorAll("[data-size]").forEach((b) => b.classList.toggle("is-active", b === btn));
      });
    });
    root.querySelector("[data-add]").addEventListener("click", () => {
      window.atelierAddToBag(p.id, size);
      openPanel("bag");
    });
  }
})();
