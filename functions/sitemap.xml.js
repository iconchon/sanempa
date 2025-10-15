// functions/sitemap.xml.js
export async function onRequest(context) {
  // 1️⃣ Daftar halaman statis utama yang kamu ingin tampil di sitemap
  const urls = [
    "https://sanempa.lookingfor.my.id/",
    "https://sanempa.lookingfor.my.id/about",
    "https://sanempa.lookingfor.my.id/contact"
  ];

  // 2️⃣ Buat string XML sesuai standar sitemap.org
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(url => `
      <url>
        <loc>${url}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>`).join('')}
  </urlset>`;

  // 3️⃣ Return Response dengan tipe XML
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
