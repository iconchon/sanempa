export async function onRequest(context) {
  try {
    // 🔗 1️⃣ Ambil daftar posting terbaru dari kategori "tutorial"
    // Ganti `categories=6` dengan ID kategori sebenarnya dari WordPress kamu
    const wpApiUrl = "https://lookingfor.my.id/wp-json/wp/v2/posts?categories=7&per_page=5&_fields=link,modified";

    const wpResponse = await fetch(wpApiUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!wpResponse.ok) {
      throw new Error(`Gagal ambil data dari WordPress (${wpResponse.status})`);
    }

    const posts = await wpResponse.json();

    // 🧭 2️⃣ URL dasar situs static kamu
    const staticBase = "https://sanempa.lookingfor.my.id";

    // 3️⃣ Daftar halaman utama static (bisa kamu tambah manual)
    const staticPages = [
      `${staticBase}/`,
      `${staticBase}/about`,
      `${staticBase}/contact`
    ];

    // 🗂️ 4️⃣ Gabungkan semua URL (static + posting)
    const urls = [
      ...staticPages.map(url => ({
        loc: url,
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
        priority: "0.8"
      })),
      ...posts.map(post => ({
        loc: post.link,
        lastmod: post.modified || new Date().toISOString(),
        changefreq: "daily",
        priority: "0.9"
      }))
    ];

    // 🧩 5️⃣ Bangun isi XML sesuai standar sitemap.org
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('')}
</urlset>`;

    // ✅ 6️⃣ Return sebagai XML response
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=600" // cache 10 menit
      },
    });

  } catch (err) {
    return new Response(`<!-- Error: ${err.message} -->`, {
      headers: { "Content-Type": "text/plain" },
      status: 500
    });
  }
}
