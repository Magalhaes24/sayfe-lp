/**
 * GitHub Pages serves static files only: it has no idea that /about and
 * /contact are client-side routes, so it answers 404 and the SPA only recovers
 * through the redirect in public/404.html. The page ends up rendering, but
 * crawlers see the 404 status first.
 *
 * Copying index.html into a folder per route makes the server answer 200 for
 * the real URL, while 404.html stays as the catch-all for anything else.
 */
const fs = require("fs");
const path = require("path");

// Keep in sync with the public routes in src/App.js.
const ROUTES = ["about", "contact"];

const buildDir = path.join(__dirname, "..", "build");
const indexFile = path.join(buildDir, "index.html");

if (!fs.existsSync(indexFile)) {
  console.error("spa-fallback: build/index.html not found, run the build first.");
  process.exit(1);
}

const SITE = "https://landing.besayfe.com/";
const html = fs.readFileSync(indexFile, "utf8");

for (const route of ROUTES) {
  // The template's canonical points at the home page. Left as is, Google reads
  // each route as a duplicate of "/" and leaves it out of the index.
  const pageUrl = `${SITE}${route}/`;
  const routeHtml = html
    .replace(`<link rel="canonical" href="${SITE}"`, `<link rel="canonical" href="${pageUrl}"`)
    .replace(`<meta property="og:url" content="${SITE}"`, `<meta property="og:url" content="${pageUrl}"`)
    .replace(`<meta name="twitter:url" content="${SITE}"`, `<meta name="twitter:url" content="${pageUrl}"`);
  if (!routeHtml.includes(`<link rel="canonical" href="${pageUrl}"`)) {
    console.error(`spa-fallback: canonical tag not found for /${route}/, check public/index.html.`);
    process.exit(1);
  }
  const dir = path.join(buildDir, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), routeHtml);
  console.log(`spa-fallback: wrote build/${route}/index.html`);
}
