const WP_BASE = "https://lookingfor.my.id/wp-json/wp/v2";
const PROXY = "https://wp-proxy.bayu-wicaksono777-cloudflare.workers.dev/";
const CATEGORY_SLUG = "tutorial";
const LIMIT = 5;

async function fetchViaProxy(endpoint) {
  const targetUrl = `${WP_BASE}${endpoint}`;
  const url = `${PROXY}?url=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getCategoryId(slug) {
  const data = await fetchViaProxy(`/categories?slug=${slug}`);
  return data.length ? data[0].id : null;
}

async function getPosts(categoryId) {
  return fetchViaProxy(`/posts?categories=${categoryId}&per_page=${LIMIT}&_fields=title,link,date`);
}

function renderPosts(posts) {
  const container = document.getElementById("posts-container");
  container.innerHTML = posts.map(post => `
    <div class="post">
      <h2><a href="${post.link}" target="_blank" rel="noopener">${post.title.rendered}</a></h2>
      <p class="date">${new Date(post.date).toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric"
      })}</p>
    </div>
  `).join("");
}

async function loadPosts() {
  const container = document.getElementById("posts-container");
  container.innerHTML = "<p>Sedang memuat...</p>";

  try {
    const catId = await getCategoryId(CATEGORY_SLUG);
    if (!catId) {
      container.innerHTML = `<p>Kategori '${CATEGORY_SLUG}' tidak ditemukan.</p>`;
      return;
    }

    const posts = await getPosts(catId);
    if (posts.length === 0) {
      container.innerHTML = "<p>Belum ada postingan.</p>";
      return;
    }

    renderPosts(posts);
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Gagal memuat postingan. Periksa koneksi atau Worker URL.</p>";
  }
}

loadPosts();
