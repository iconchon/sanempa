# sanempa
Site Rumah Sanempa

# Simple Static Page with WordPress Integration

Static site hosted on **Cloudflare Pages** to show latest 5 posts from the **"tutorial"** category of WordPress blog.

### 🌐 Source
- WordPress site: [https://lookingfor.my.id](https://lookingfor.my.id)
- Category: `tutorial`

### ⚙️ How it works
- Uses the WordPress REST API endpoint:
https://lookingfor.my.id/wp-json/wp/v2/posts?categories=
- Dynamically fetched via JavaScript (no server-side processing)
- Built and deployed automatically via Cloudflare Pages

### 🚀 Deployment
1. Push this folder to a GitHub repo  
2. Connect repo to Cloudflare Pages  
3. Set build output directory to `.`  
4. Done — automatic fetch on load
