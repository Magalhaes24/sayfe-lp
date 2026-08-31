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

const html = fs.readFileSync(indexFile);

for (const route of ROUTES) {
  const dir = path.join(buildDir, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log(`spa-fallback: wrote build/${route}/index.html`);
}
