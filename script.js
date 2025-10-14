const baseUrl = "https://lookingfor.my.id/wp-json/wp/v2";

async function getCategoryId(slug) {
  const response = await fetch(`${baseUrl}/categories?slug=${slug}`);
  const data = await response.json();
  return data.length > 0 ? data[0].id : null;
}

async function getPostsByCategory(categoryId) {
  const response = await fetch(`${baseUrl}/posts?categories=${categoryId}&per_page=5&_fields=title,link,date`);
  const data = await response.json();
  return data;
}

async function renderPosts() {
  const container = document.getElementById("posts-container");
  container.innerHTML = "<p>Sedang memuat...</p>";

  try {
    const categoryId = await getCategoryId("tutorial");

    if (!categoryId) {
      container.innerHTML = "<p>Kategori 'tutorial' tidak ditemukan.</p>";
      return;
    }

    const posts = await getPostsByCategory(categoryId);

    if (posts.length === 0) {
      container.innerHTML = "<p>Belum ada postingan di kategori ini.</p>";
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="post">
        <h2><a href="${post.link}" target="_blank" rel="noopener">${post.title.rendered}</a></h2>
        <p class="date">${new Date(post.date).toLocaleDateString('id-ID', {
          day: '2-digit', month: 'long', year: 'numeric'
        })}</p>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Gagal memuat postingan. Periksa koneksi atau konfigurasi API.</p>";
  }
}

renderPosts();
