/* 极简静态服务器：node serve.js [port] */
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");

const root = process.env.ROOT ? path.resolve(process.env.ROOT) : __dirname;
const port = Number(process.argv[2] || 4321);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (process.env.LOG === "1") {
      console.log(new Date().toISOString(), req.method, urlPath, "AE=" + (req.headers["accept-encoding"] || "-"));
    }
    let filePath = path.join(root, urlPath === "/" ? "index.html" : urlPath);
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.stat(filePath, (err, stat) => {
      if (err || stat.isDirectory()) {
        // 带扩展名的资源缺失时返回 404，避免把 index.html 当成图片
        if (path.extname(urlPath)) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("404 Not Found");
          return;
        }
        filePath = path.join(root, "index.html");
      }
      fs.readFile(filePath, (e, buf) => {
        if (e) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("404 Not Found");
          return;
        }
        const type = types[path.extname(filePath).toLowerCase()] || "application/octet-stream";
        const compressible = /^(text\/|application\/(json|javascript)|image\/svg)/.test(type);
        const accept = String(req.headers["accept-encoding"] || "");
        const isHtml = type.indexOf("text/html") === 0;
        const etag = '"' + crypto.createHash("sha1").update(buf).digest("hex").slice(0, 16) + '"';
        const headers = {
          "Content-Type": type,
          // HTML 不缓存，静态资源缓存 5 分钟，减少隧道下的重复传输
          "Cache-Control": isHtml ? "no-cache" : "public, max-age=300",
          Vary: "Accept-Encoding",
          ETag: etag,
        };

        // 协商缓存：命中则回 304，隧道下可省掉整包传输
        if (req.headers["if-none-match"] === etag) {
          res.writeHead(304, headers);
          res.end();
          return;
        }

        // 文本资源做 gzip，公网隧道下可显著减少传输量
        if (compressible && accept.indexOf("gzip") > -1 && buf.length > 1024) {
          zlib.gzip(buf, (err, gz) => {
            if (err || gz.length >= buf.length) {
              headers["Content-Length"] = buf.length;
              res.writeHead(200, headers);
              res.end(buf);
              return;
            }
            headers["Content-Encoding"] = "gzip";
            headers["Content-Length"] = gz.length;
            res.writeHead(200, headers);
            res.end(gz);
          });
          return;
        }

        headers["Content-Length"] = buf.length;
        res.writeHead(200, headers);
        res.end(buf);
      });
    });
  })
  .listen(port, process.env.HOST || "0.0.0.0", () => {
    const os = require("os");
    const lan = [];
    for (const list of Object.values(os.networkInterfaces())) {
      for (const a of list || []) {
        if (a.family === "IPv4" && !a.internal) lan.push(a.address);
      }
    }
    console.log("诡异复苏 · 官网预览");
    console.log("  本机：  http://127.0.0.1:" + port + "/");
    lan.forEach((ip) => console.log("  局域网：http://" + ip + ":" + port + "/"));
    if (!lan.length) console.log("  （未检测到局域网地址）");
  });
