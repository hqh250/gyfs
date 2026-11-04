/* 构建公网版：CSS/JS 内联，图片独立 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "site");
const OUT = path.join(ROOT, "public");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

let html = read("index.html");

// 内联 CSS
const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="(assets\/css\/[^"]+)"\s*\/?>/g)].map((m) => m[1]);
for (const f of cssFiles) {
  html = html.replace('<link rel="stylesheet" href="' + f + '" />', () => "<style>\n" + read(f) + "\n</style>");
}

// 内联 JS
const jsFiles = [...html.matchAll(/<script src="(assets\/js\/[^"]+)"><\/script>/g)].map((m) => m[1]);
const bundle = jsFiles.map((f) => "/* ===== " + f + " ===== */\n" + read(f)).join("\n\n");
let first = true;
for (const f of jsFiles) {
  html = html.replace('<script src="' + f + '"></script>', () => {
    if (!first) return "";
    first = false;
    return "<script>\n" + bundle + "\n</script>";
  });
}

html = html.replace("<!DOCTYPE html>", "<!DOCTYPE html>\n<!-- 诡异复苏 · 公网构建：CSS/JS 内联 -->");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "assets", "img"), { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), html, "utf8");

const imgDir = path.join(ROOT, "assets", "img");
for (const f of fs.readdirSync(imgDir)) {
  fs.copyFileSync(path.join(imgDir, f), path.join(OUT, "assets", "img", f));
}

console.log("公网版已生成:", path.join(OUT, "index.html"));
console.log("大小:", (fs.statSync(path.join(OUT, "index.html")).size / 1024).toFixed(0), "KB");
console.log("图片:", fs.readdirSync(imgDir).length);
