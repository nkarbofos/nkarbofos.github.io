const API_BASE = "https://ceramic-api.onrender.com";

function postToHTML(post) {
  return `
    <article class="posts__item">
      <div class="post__image-container">
        <img src="${new URL(post.image, API_BASE)}" alt="${post.title}" class="post__image" loading="lazy">
        <div class="post__header">
          <h3>${post.title}</h3>
          <button class="post__btn">READ</button>
        </div>
      </div>
      <div class="post__content">
        <p>${post.excerpt}</p>
      </div>
    </article>`;
}

async function fetchPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  return res.json();
}

async function renderPosts() {
  const grid = document.querySelector(".posts__grid");
  if (!grid) {
    return console.warn("No .posts__grid found");
  }

  grid.innerHTML = `<div class="loading">Loading…</div>`;

  try {
    const data = await fetchPosts();

    grid.innerHTML = data.map(postToHTML).join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="error">Failed to load</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderPosts();
});