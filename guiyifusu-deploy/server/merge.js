/* 数据合并：Node 服务与 Netlify Function 共用 */
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

module.exports = { merge };
