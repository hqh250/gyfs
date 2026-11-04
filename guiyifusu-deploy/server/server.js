/* 诡异复苏 · 联机服务器（零依赖）
 * 静态站点 + 共享数据（JSON 文件）+ 增量合并
 * 启动：node server/server.js [port]
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..", "site", "public");
const DATA = process.env.DATA_FILE ? path.resolve(process.env.DATA_FILE) : path.join(__dirname, "data.json");
const PORT = Number(process.argv[2] || process.env.PORT || 4400);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

let store = { rev: 0, db: null, updatedAt: 0 };
try {
  if (fs.existsSync(DATA)) store = JSON.parse(fs.readFileSync(DATA, "utf8"));
} catch (e) {
  console.error("读取 data.json 失败，使用空库", e.message);
}

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(DATA, JSON.stringify(store), (err) => {
      if (err) console.error("写入失败", err.message);
    });
  }, 120);
}

function json(res, code, obj, req) {
  const body = Buffer.from(JSON.stringify(obj));
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  };
  if ((req.headers["accept-encoding"] || "").includes("gzip") && body.length > 1024) {
    headers["content-encoding"] = "gzip";
    res.writeHead(code, headers);
    res.end(zlib.gzipSync(body));
  } else {
    res.writeHead(code, headers);
    res.end(body);
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > 8 * 1024 * 1024) return reject(new Error("body too large"));
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {});
      } catch (e) {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });
}

/* ------------------------------ 合并 ------------------------------ */
function merge(server, incoming) {
  const out = JSON.parse(JSON.stringify(server || {}));
  out.tombstones = out.tombstones || { users: [], guilds: [], announcements: [] };
  out.unfollows = out.unfollows || [];

  const inTomb = incoming.tombstones || {};
  ["users", "guilds", "announcements"].forEach((k) => {
    const set = new Set([...(out.tombstones[k] || []), ...(inTomb[k] || [])]);
    out.tombstones[k] = [...set];
  });
  out.unfollows = [...new Set([...out.unfollows, ...(incoming.unfollows || [])])];

  const dead = new Set(out.tombstones.users);

  // 用户：只更新字段，保留服务端密码（客户端可能不带）
  const userMap = new Map((out.users || []).map((u) => [u.id, u]));
  (incoming.users || []).forEach((u) => {
    const cur = userMap.get(u.id);
    if (cur) {
      const pwd = cur.password;
      Object.assign(cur, u);
      if (!u.password) cur.password = pwd;
    } else {
      userMap.set(u.id, u);
    }
  });
  out.users = [...userMap.values()].filter((u) => !dead.has(u.id));

  const mergeById = (key, opts) => {
    opts = opts || {};
    const map = new Map((out[key] || []).map((x) => [x.id, x]));
    (incoming[key] || []).forEach((x) => {
      const cur = map.get(x.id);
      if (!cur) return map.set(x.id, x);
      let next = { ...cur, ...x };
      if (opts.union && Array.isArray(cur[opts.union])) {
        next[opts.union] = [...new Set([...cur[opts.union], ...(x[opts.union] || [])])];
      }
      if (opts.deleted && (cur.deleted || x.deleted)) next.deleted = true;
      if (opts.keepAt && cur.at && next.at !== cur.at) next.at = Math.min(cur.at, next.at);
      map.set(x.id, next);
    });
    out[key] = [...map.values()];
  };

  mergeById("posts", { union: "likes", deleted: true });
  mergeById("replies", { deleted: true });
  mergeById("guilds");
  mergeById("guildMessages");
  mergeById("dms");
  mergeById("notifications");
  mergeById("applications");
  mergeById("announcements");

  out.guilds = (out.guilds || []).filter((g) => !out.tombstones.guilds.includes(g.id));
  out.announcements = (out.announcements || []).filter((a) => !out.tombstones.announcements.includes(a.id));

  // 已注销用户的残留数据
  out.posts = (out.posts || []).filter((p) => !dead.has(p.author));
  out.replies = (out.replies || []).filter((r) => !dead.has(r.author));
  out.dms = (out.dms || []).filter((d) => !dead.has(d.from) && !dead.has(d.to));
  out.notifications = (out.notifications || []).filter((n) => !dead.has(n.to));
  out.guildMessages = (out.guildMessages || []).filter((m) => !dead.has(m.author));

  // 公会：移除已注销成员；会长注销则转让/解散
  out.guilds.forEach((g) => {
    g.members = (g.members || []).filter((id) => !dead.has(id));
    Object.keys(g.positions || {}).forEach((id) => {
      if (dead.has(Number(id))) delete g.positions[id];
    });
    if (dead.has(g.owner)) {
      if (g.members.length) {
        const next = g.members[0];
        g.owner = next;
        g.positions[next] = "leader";
      } else {
        g.dissolve = true;
      }
    }
  });
  out.guilds = out.guilds.filter((g) => !g.dissolve);

  // 关注
  const fkey = (f) => f.from + "-" + f.to;
  const fmap = new Map((out.follows || []).map((f) => [fkey(f), f]));
  (incoming.follows || []).forEach((f) => fmap.set(fkey(f), f));
  const unf = new Set(out.unfollows);
  out.follows = [...fmap.values()].filter(
    (f) => !unf.has(fkey(f)) && !dead.has(f.from) && !dead.has(f.to)
  );

  // 设置：带 updatedAt 的胜出
  const inSet = incoming.settings || {};
  if ((inSet.updatedAt || 0) >= ((out.settings && out.settings.updatedAt) || 0)) {
    out.settings = { ...(out.settings || {}), ...inSet };
  }

  out.seq = Math.max(out.seq || 0, incoming.seq || 0);
  out.rev = (server && server.rev ? server.rev : 0) + 1;
  out.updatedAt = Date.now();
  return out;
}

/* ------------------------------ 静态文件 ------------------------------ */
function serveStatic(req, res, urlPath) {
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.stat(file, (err, st) => {
    let target = file;
    if (err || st.isDirectory()) {
      if (path.extname(urlPath)) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        return res.end("Not found");
      }
      target = path.join(ROOT, "index.html");
    }
    fs.readFile(target, (e2, buf) => {
      if (e2) {
        res.writeHead(404);
        return res.end("Not found");
      }
      const ext = path.extname(target).toLowerCase();
      const headers = {
        "content-type": MIME[ext] || "application/octet-stream",
        "cache-control": ext === ".html" ? "no-cache" : "public, max-age=300",
      };
      if ((req.headers["accept-encoding"] || "").includes("gzip") && buf.length > 2048 && /text|json|javascript|svg/.test(headers["content-type"])) {
        headers["content-encoding"] = "gzip";
        res.writeHead(200, headers);
        return res.end(zlib.gzipSync(buf));
      }
      res.writeHead(200, headers);
      res.end(buf);
    });
  });
}

/* ------------------------------ 服务 ------------------------------ */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "OPTIONS") return json(res, 200, { ok: true }, req);

  if (url.pathname === "/api/ping") {
    return json(res, 200, { ok: true, rev: store.rev, clients: store.db ? store.db.users.length : 0 }, req);
  }

  if (url.pathname === "/api/state") {
    const since = Number(url.searchParams.get("since") || 0);
    if (since && store.db && store.rev <= since) {
      return json(res, 200, { ok: true, rev: store.rev, unchanged: true }, req);
    }
    return json(res, 200, { ok: true, rev: store.rev, db: store.db }, req);
  }

  if (url.pathname === "/api/sync" && req.method === "POST") {
    try {
      const body = await readBody(req);
      if (!body || !body.db) return json(res, 400, { ok: false, msg: "缺少数据" }, req);
      if (!store.db) {
        store.db = body.db;
        store.db.rev = 1;
        store.rev = 1;
        store.updatedAt = Date.now();
        persist();
        return json(res, 200, { ok: true, rev: store.rev, db: store.db }, req);
      }
      const merged = merge(store.db, body.db);
      store.db = merged;
      store.rev = merged.rev;
      store.updatedAt = Date.now();
      persist();
      return json(res, 200, { ok: true, rev: store.rev, db: store.db }, req);
    } catch (e) {
      return json(res, 400, { ok: false, msg: e.message }, req);
    }
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("诡异复苏 · 联机服务已启动");
  console.log("  本机： http://127.0.0.1:" + PORT + "/");
  const nets = require("os").networkInterfaces();
  Object.values(nets).forEach((list) =>
    (list || []).forEach((n) => {
      if (n.family === "IPv4" && !n.internal) console.log("  局域网：http://" + n.address + ":" + PORT + "/");
    })
  );
  console.log("  数据： " + DATA);
});
