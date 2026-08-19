import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outputPublicDir = path.join(projectRoot, ".output", "public");
const distDir = path.join(projectRoot, "dist");

if (!fs.existsSync(outputPublicDir)) {
  console.error("Error: .output/public directory does not exist after build.");
  process.exit(1);
}

// 1. Ensure dist directory exists
fs.mkdirSync(distDir, { recursive: true });

// 2. Copy all files from .output/public to dist
fs.cpSync(outputPublicDir, distDir, { recursive: true });
console.log("Successfully copied .output/public to dist/");

// 3. Find CSS and JS bundle files in dist/assets
const assetsDir = path.join(distDir, "assets");
let cssFile = "";
let jsFile = "";

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css")) || "";
  jsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js")) || "";
}

console.log(`Found CSS: ${cssFile}, JS: ${jsFile}`);

// 4. Generate dist/index.html
const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fartboy Raid 2.0</title>
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}">` : ""}
  </head>
  <body class="bg-[#07090e] text-slate-100 dark">
    <div id="root"></div>
    ${jsFile ? `<script type="module" src="/assets/${jsFile}"></script>` : ""}
  </body>
</html>
`;

fs.writeFileSync(path.join(distDir, "index.html"), indexHtmlContent, "utf-8");
fs.writeFileSync(path.join(distDir, "404.html"), indexHtmlContent, "utf-8");

console.log("Generated dist/index.html and dist/404.html successfully.");
