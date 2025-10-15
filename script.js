const workerUrl = "https://wpproxy-cache.bayu-wicaksono777-cloudflare.workers.dev/"; // ubah sesuai Worker kamu

async function loadPosts() {
  const container = document.getElementById("posts-container");
  try {
    const response = await fetch(workerUrl);
    const posts = await response.json();

    if (!posts.length) {
      container.innerHTML = "<p>Tidak ada postingan ditemukan.</p>";
      return;
    }

    container.innerHTML = "";
    posts.forEach(post => {
      const el = document.createElement("div");
      el.className = "post";
      el.innerHTML = `
        <h2><a href="${post.link}" target="_blank" rel="noopener">${post.title.rendered}</a></h2>
        <time>${new Date(post.date).toLocaleDateString("id-ID", {year:"numeric", month:"long", day:"numeric"})}</time>
      `;
      container.appendChild(el);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Gagal memuat postingan.</p>";
  }
}

loadPosts();
