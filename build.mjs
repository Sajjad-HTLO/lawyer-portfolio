// Production build — zero dependencies.
// Copies the site into dist/ with light, safe minification (comment stripping).
import { readFile, writeFile, mkdir, copyFile, readdir, stat } from "node:fs/promises";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, ".");
const out = join(root, "dist");
const SKIP_DIRS = new Set(["dist", "node_modules", ".git", ".github"]);
const SKIP_FILES = new Set(["build.mjs", "serve.mjs", "package.json", "package-lock.json", "README.md", "requirements.txt", "hero.png", "footer-mockup.jpg"]);

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function minifyHTML(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) files.push(...await walk(join(dir, e.name)));
    } else if (e.isFile() && !SKIP_FILES.has(e.name)) {
      files.push(join(dir, e.name));
    }
  }
  return files;
}

async function build() {
  const files = await walk(src);
  let count = 0;
  for (const file of files) {
    const rel = relative(src, file).split(sep).join("/");
    const dest = join(out, rel);
    await mkdir(dirname(dest), { recursive: true });

    if (rel === "index.html") {
      writeFile(dest, minifyHTML(await readFile(file, "utf8")));
    } else if (rel.endsWith(".css")) {
      writeFile(dest, minifyCSS(await readFile(file, "utf8")));
    } else if (rel.endsWith(".js")) {
      writeFile(dest, minifyJS(await readFile(file, "utf8")));
    } else {
      await copyFile(file, dest);
    }
    count++;
  }
  console.log("Build complete: " + count + " files written to dist/");
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
