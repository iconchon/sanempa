// script.js — improved, more robust method
const WP_BASE = "https://lookingfor.my.id/wp-json/wp/v2";
const TARGET_SLUG = "tutorial";
const MAX_POSTS = 5;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${res.statusText} ${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

// 1) Try getting category id by slug
async function getCategoryIdBySlug(slug) {
  try {
    const cats = await fetchJson(`${WP_BASE}/categories?slug=${encodeURIComponent(slug)}`);
    if (Array.isArray(cats) && cats.length > 0) return cats[0].id;
    return null;
  } catch (e) {
    // if API or CORS blocks this endpoint, return null and fallback later
    console.warn("getCategoryIdBySlug failed:", e.message);
    return null;
  }
}

// 2) If we have category id, fetch posts by category id
async function getPostsByCategoryId(catId) {
  const url = `${WP_BASE}/posts?categories=${catId}&per_page=${MAX_POSTS}&_fields=title,link,date`;
  return fetchJson(url);
}

// 3) Fallback: fetch recent posts with embedded terms and filter client-side by term slug
async function getPostsByFilteringSlug(slug) {
  // fetch more posts to increase chance of finding posts in the category
  const url = `${WP_BASE}/posts?per_page=20&_embed`;
  const posts = await fetchJson(url);
  // posts with _embedded['wp:term'] — each post may have array of taxonomy arrays
  const filtered = posts.filter(post => {
    const terms = post._embedded && post._embedded['wp:term'];
    if (!terms) return false;
    // wp:term is an array of arrays (taxonomies), flatten them
    return terms.flat().some(term => term && term.slug === slug && term.taxonomy === 'category');
  });
  // map to expected shape (title, link, date)
  return filtered.slice(0, MAX_POSTS).map(p => ({
    title: p.title,
    link: p.link,
    date: p.date
  }));
}

function renderLoading(container, text = "Sedang memuat...") {
  container.innerHTML = `<p>${text}</p>`;
}

function renderError(container, text) {
  container.innerHTML = `<p style="color: #c00">${text}</p>`;
}

function renderPosts(container, posts) {
  container.innerHTML = posts.map(post => `
    <div class="post">
      <h2><a href="${post.link}" target="_blank" rel="noopener noreferrer">${post.title && post.title.rendered ? post.title.rendered : (post.title || "No title")}</a></h2>
      <p class="date">${new Date(post.date).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
      })}</p>
    </div>
  `).join("");
}

async function renderLatestPosts() {
  const container = document.getElementById("posts-container");
  renderLoading(container);

  try {
    // Try method A: get category id by slug, then fetch posts by id
    const catId = await getCategoryIdBySlug(TARGET_SLUG);

    if (catId) {
      try {
        const posts = await getPostsByCategoryId(catId);
        if (Array.isArray(posts) && posts.length > 0) {
          renderPosts(container, posts);
          return;
        }
        // if category exists but no posts, show message
        renderError(container, `Kategori '${TARGET_SLUG}' ditemukan tetapi belum ada postingan.`);
        return;
      } catch (e) {
        console.warn("Fetching posts by categoryId failed:", e.message);
        // fall through to fallback
      }
    }

    // Fallback method B: fetch recent posts with _embed and filter client-side by slug
    const fallbackPosts = await getPostsByFilteringSlug(TARGET_SLUG);
    if (fallbackPosts.length > 0) {
      renderPosts(container, fallbackPosts);
      return;
    }

    // No posts found with either method
    renderError(container, `Tidak ditemukan postingan untuk kategori '${TARGET_SLUG}'.`);
  } catch (err) {
    console.error(err);
    renderError(container, "Gagal memuat postingan. Periksa koneksi, CORS, atau konfigurasi WordPress.");
  }
}

// Start
renderLatestPosts();
