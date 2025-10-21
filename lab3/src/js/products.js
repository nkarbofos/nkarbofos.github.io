// переменную на наш сервер API
const API_BASE = "https://ceramic-api.onrender.com";

// формирование html для продукта
function productToHTML(p) {
  return `
    <article class="catalog__item">
      <img src="${new URL(p.image, API_BASE)}" alt="${p.title}" loading="lazy">
      <div class="catalog__info">
        <h3>${p.title}</h3>
        <p>${p.price} €</p>
      </div>
    </article>`;
}

// запрос данных с API
async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  return res.json();
}

async function renderProducts(category = "tea") {
  const grid = document.querySelector(".catalog__grid");
  if (!grid) {
    return console.warn("No .catalog__grid found");
  }

  grid.innerHTML = `<div class="loading">Loading…</div>`;

  try {
    const data = await fetchProducts();

    let shown = [];
    if (category === "tea") shown = data.slice(0, 5);
    if (category === "kitchen") shown = data.slice(0, 3);
    if (category === "plants") shown = data.slice(0, 2);

    grid.innerHTML = shown.map(productToHTML).join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="error">Failed to load</div>`;
  }
}

function setupTabs() {
  const buttons = document.querySelectorAll(".catalog__filter");
  if (!buttons.length) return;

  buttons.forEach((btn) =>
    btn.addEventListener("click", async () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.category;
      await renderProducts(category);
    })
  );
}

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  renderProducts("tea");
});
