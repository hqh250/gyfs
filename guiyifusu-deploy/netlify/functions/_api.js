/* Netlify Function 核心逻辑（可单测，不直接依赖 @netlify/blobs） */
const { merge } = require("./_merge");

function json(status, obj, extra) {
  return {
    status,
    json: obj,
    headers: Object.assign(
      {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "GET,POST,OPTIONS",
      },
      extra || {}
    ),
  };
}

function routeOf(event) {
  let raw = event.rawUrl || "http://local" + (event.path || "/");
  let u;
  try {
    u = new URL(raw);
  } catch (e) {
    u = new URL("http://local/");
  }
  let p = u.pathname;
  p = p.replace(/^\/\.netlify\/functions\/api/, "");
  p = p.replace(/^\/api/, "");
  if (!p) p = "/ping";
  return { path: p, query: u.searchParams, method: (event.httpMethod || "GET").toUpperCase() };
}

function parseBody(event) {
  if (!event.body) return null;
  let raw = event.body;
  if (event.isBase64Encoded) raw = Buffer.from(raw, "base64").toString("utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

async function readState(store) {
  const st = await store.get("state", { type: "json" });
  return st && typeof st === "object" ? st : { rev: 0, db: null };
}

async function handle(event, store) {
  const { path, query, method } = routeOf(event);
  if (method === "OPTIONS") return json(200, { ok: true });

  if (path === "/ping") {
    const st = await readState(store);
    return json(200, { ok: true, rev: st.rev || 0, clients: st.db && st.db.users ? st.db.users.length : 0 });
  }

  if (path === "/state") {
    const st = await readState(store);
    const since = Number(query.get("since") || 0);
    if (since && st.rev && st.rev <= since) return json(200, { ok: true, rev: st.rev, unchanged: true });
    return json(200, { ok: true, rev: st.rev || 0, db: st.db || null });
  }

  if (path === "/sync" && method === "POST") {
    const body = parseBody(event);
    if (!body || !body.db) return json(400, { ok: false, msg: "缺少数据" });
    const st = await readState(store);
    let next;
    if (!st.db) {
      next = { rev: 1, db: body.db, updatedAt: Date.now() };
      next.db.rev = 1;
    } else {
      const merged = merge(st.db, body.db);
      next = { rev: merged.rev, db: merged, updatedAt: Date.now() };
    }
    await store.setJSON("state", next);
    return json(200, { ok: true, rev: next.rev, db: next.db });
  }

  return json(404, { ok: false, msg: "not found", path });
}

module.exports = { handle, routeOf, parseBody };
