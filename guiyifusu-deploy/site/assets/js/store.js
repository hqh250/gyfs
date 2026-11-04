/* 本地数据库（localStorage）与业务规则 */
(function () {
  const KEY = "gyfs_site_v5";
  const SESSION = "gyfs_site_session";

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  function seedDb() {
    const S = window.SEED;
    const db = {
      v: 5,
      seq: 1000,
      users: clone(S.users).map((u) => ({ ...u, password: hash("seed:" + u.username) })),
      posts: clone(S.posts),
      replies: clone(S.replies),
      guilds: clone(S.guilds),
      guildMessages: clone(S.guildMessages),
      dms: clone(S.dms),
      notifications: clone(S.notifications),
      applications: clone(S.applications),
      announcements: clone(S.announcements),
      settings: clone(S.settings),
      follows: [
        { from: 2, to: 1, at: Date.now() - 50 * 864e5 },
        { from: 1, to: 2, at: Date.now() - 49 * 864e5 },
        { from: 4, to: 2, at: Date.now() - 26 * 36e5 },
        { from: 3, to: 1, at: Date.now() - 20 * 36e5 },
      ],
    };
    return db;
  }

  const Store = {
    db: null,

    load() {
      if (this.db) return this.db;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.v === 5) {
            this.db = parsed;
            this.db.tombstones = this.db.tombstones || { users: [], guilds: [], announcements: [] };
            this.db.unfollows = this.db.unfollows || [];
            return this.db;
          }
        }
      } catch (e) {}
      this.db = seedDb();
      this.save();
      return this.db;
    },

    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.db));
      } catch (e) {
        console.warn("存储失败", e);
      }
      if (!this._silent && window.Sync && window.Sync.online) window.Sync.schedule();
    },

    setDb(db, rev) {
      this._silent = true;
      this.db = db || this.db;
      if (this.db) {
        this.db.tombstones = this.db.tombstones || { users: [], guilds: [], announcements: [] };
        this.db.unfollows = this.db.unfollows || [];
        try {
          localStorage.setItem(KEY, JSON.stringify(this.db));
        } catch (e) {}
      }
      this._silent = false;
      this.rev = rev || 0;
    },

    reset() {
      localStorage.removeItem(KEY);
      localStorage.removeItem(SESSION);
      this.db = null;
      this.load();
    },

    nextId() {
      this._c = (this._c || 0) + 1;
      const id = Date.now() * 1000 + (this._c % 1000);
      this.db.seq = Math.max(this.db.seq || 0, id);
      return id;
    },

    /* ------------------------------ 账号 ------------------------------ */
    currentId() {
      const v = localStorage.getItem(SESSION);
      return v ? Number(v) : null;
    },

    me() {
      const id = this.currentId();
      return id ? this.user(id) : null;
    },

    user(id) {
      return this.load().users.find((u) => u.id === Number(id)) || null;
    },

    userByName(name) {
      const n = String(name || "").trim().toLowerCase();
      return this.load().users.find((u) => u.username.toLowerCase() === n) || null;
    },

    isAdmin(u) {
      return !!u && (u.role === "admin" || u.role === "super");
    },

    isSuper(u) {
      return !!u && u.role === "super";
    },

    login(username, password) {
      const u = this.userByName(username);
      if (!u) return { ok: false, msg: "账号不存在" };
      if (u.password !== hash("seed:" + u.username) && u.password !== hash(password)) {
        return { ok: false, msg: "密码不正确" };
      }
      if (u.password === hash("seed:" + u.username)) {
        // 种子账号首次登录时，把密码改为输入值
        u.password = hash(password);
      }
      u.lastSeen = Date.now();
      localStorage.setItem(SESSION, String(u.id));
      this.save();
      return { ok: true, user: u };
    },

    register({ username, password, nickname }) {
      username = String(username || "").trim();
      nickname = String(nickname || "").trim() || username;
      if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
        return { ok: false, msg: "账号需为 3–16 位字母、数字或下划线" };
      }
      if (String(password || "").length < 6) return { ok: false, msg: "密码至少 6 位" };
      if (nickname.length < 1 || nickname.length > 16) return { ok: false, msg: "昵称需为 1–16 个字" };
      if (this.userByName(username)) return { ok: false, msg: "该账号已被注册" };

      const db = this.load();
      const real = db.users.filter((u) => !u.seed);
      const role = real.length === 0 ? "super" : "user";
      const perms = window.PERMS ? window.PERMS(nickname) : null;
      const u = {
        id: this.nextId(),
        username,
        password: hash(password),
        nickname,
        avatar: Math.floor(Math.random() * window.SEED.AVATARS.length),
        qq: "",
        bio: "",
        role,
        createdAt: Date.now(),
        lastSeen: Date.now(),
        qualification: false,
        workId: "",
        banned: false,
      };
      db.users.push(u);
      this.save();
      localStorage.setItem(SESSION, String(u.id));
      if (role === "super") {
        this.notify(u.id, "system", "你是本站第一位注册用户，已自动成为超级管理员。", "#/admin");
      } else {
        this.notify(u.id, "system", "欢迎来到诡异复苏。绑定 QQ 后可发帖、加入公会并申请体验资格。", "#/me");
      }
      return { ok: true, user: u };
    },

    logout() {
      localStorage.removeItem(SESSION);
    },

    updateUser(id, patch) {
      const u = this.user(id);
      if (!u) return { ok: false, msg: "用户不存在" };
      if (patch.nickname != null) {
        const n = String(patch.nickname).trim();
        if (n.length < 1 || n.length > 16) return { ok: false, msg: "昵称需为 1–16 个字" };
        patch.nickname = n;
      }
      if (patch.qq != null) {
        const q = String(patch.qq).trim();
        if (q && !/^\d{5,12}$/.test(q)) return { ok: false, msg: "QQ 号需为 5–12 位数字" };
        if (q) {
          const dup = this.load().users.find((x) => x.qq === q && x.id !== Number(id));
          if (dup) return { ok: false, msg: "该 QQ 已绑定其他账号" };
        }
        patch.qq = q;
      }
      if (patch.bio != null) {
        patch.bio = String(patch.bio).slice(0, 80);
      }
      Object.assign(u, patch);
      this.save();
      return { ok: true, user: u };
    },

    setPassword(id, oldPwd, newPwd) {
      const u = this.user(id);
      if (!u) return { ok: false, msg: "用户不存在" };
      if (u.password !== hash(oldPwd)) return { ok: false, msg: "原密码不正确" };
      if (String(newPwd).length < 6) return { ok: false, msg: "新密码至少 6 位" };
      u.password = hash(newPwd);
      this.save();
      return { ok: true };
    },

    setRole(id, role) {
      const me = this.me();
      if (!this.isSuper(me)) return { ok: false, msg: "只有超级管理员可以调整权限" };
      const u = this.user(id);
      if (!u) return { ok: false, msg: "用户不存在" };
      if (u.role === "super" && role !== "super") return { ok: false, msg: "不能移除超级管理员" };
      u.role = role;
      this.save();
      this.notify(u.id, "system", role === "admin" ? "你已被设置为管理员。" : "你的管理员权限已被取消。", "#/admin");
      return { ok: true };
    },

    /* ------------------------------ 社交 ------------------------------ */
    isFollowing(from, to) {
      return this.load().follows.some((f) => f.from === Number(from) && f.to === Number(to));
    },

    isFriend(a, b) {
      return this.isFollowing(a, b) && this.isFollowing(b, a);
    },

    toggleFollow(from, to) {
      if (!from) return { ok: false, msg: "请先登录" };
      if (Number(from) === Number(to)) return { ok: false, msg: "不能关注自己" };
      const db = this.load();
      const i = db.follows.findIndex((f) => f.from === Number(from) && f.to === Number(to));
      if (i > -1) {
        db.follows.splice(i, 1);
        db.unfollows = db.unfollows || [];
        const key = Number(from) + "-" + Number(to);
        if (db.unfollows.indexOf(key) === -1) db.unfollows.push(key);
        this.save();
        return { ok: true, following: false };
      }
      const key = Number(from) + "-" + Number(to);
      db.unfollows = (db.unfollows || []).filter((k) => k !== key);
      db.follows.push({ from: Number(from), to: Number(to), at: Date.now() });
      this.save();
      const a = this.user(from);
      this.notify(to, "follow", (a ? a.nickname : "有人") + " 关注了你", "#/u/" + from);
      return { ok: true, following: true };
    },

    followers(id) {
      return this.load().follows.filter((f) => f.to === Number(id)).map((f) => this.user(f.from)).filter(Boolean);
    },

    following(id) {
      return this.load().follows.filter((f) => f.from === Number(id)).map((f) => this.user(f.to)).filter(Boolean);
    },

    friends(id) {
      return this.following(id).filter((u) => this.isFollowing(u.id, id));
    },

    /* ------------------------------ 违禁词 ------------------------------ */
    filterText(text) {
      const words = this.load().settings.bannedWords || [];
      let hit = [];
      let out = String(text || "");
      words.forEach((w) => {
        if (!w) return;
        const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        if (re.test(out)) {
          hit.push(w);
          out = out.replace(re, "***");
        }
      });
      return { text: out, hit };
    },

    /* ------------------------------ 帖子 ------------------------------ */
    posts({ cat, q, author } = {}) {
      return this.load()
        .posts.filter((p) => {
          if (p.deleted) return false;
          if (cat && p.cat !== cat) return false;
          if (author && p.author !== Number(author)) return false;
          if (q) {
            const s = (p.title + p.body).toLowerCase();
            if (s.indexOf(String(q).toLowerCase()) === -1) return false;
          }
          return true;
        })
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.at - a.at);
    },

    post(id) {
      return this.load().posts.find((p) => p.id === Number(id)) || null;
    },

    createPost({ cat, title, body }) {
      const me = this.me();
      if (!me) return { ok: false, msg: "请先登录" };
      if (!me.qq) return { ok: false, msg: "绑定 QQ 后才能发帖" };
      title = String(title || "").trim();
      body = String(body || "").trim();
      if (title.length < 4) return { ok: false, msg: "标题至少 4 个字" };
      if (body.length < 10) return { ok: false, msg: "正文至少 10 个字" };
      const f = this.filterText(title + "\n" + body);
      const post = {
        id: this.nextId(),
        cat: cat || "general",
        title: this.filterText(title).text,
        body: this.filterText(body).text,
        author: me.id,
        at: Date.now(),
        likes: [],
        views: 0,
        pinned: false,
        locked: false,
        flagged: f.hit.length > 0,
      };
      this.load().posts.push(post);
      this.save();
      return { ok: true, post, flagged: f.hit };
    },

    likePost(id) {
      const me = this.me();
      if (!me) return { ok: false, msg: "请先登录" };
      const p = this.post(id);
      if (!p) return { ok: false, msg: "帖子不存在" };
      const i = p.likes.indexOf(me.id);
      if (i > -1) p.likes.splice(i, 1);
      else p.likes.push(me.id);
      this.save();
      return { ok: true, liked: i === -1, count: p.likes.length };
    },

    viewPost(id) {
      const p = this.post(id);
      if (p) {
        p.views += 1;
        this.save();
      }
    },

    deletePost(id) {
      const me = this.me();
      const p = this.post(id);
      if (!p) return { ok: false, msg: "帖子不存在" };
      if (!this.isAdmin(me) && (!me || p.author !== me.id)) return { ok: false, msg: "没有权限" };
      p.deleted = true;
      this.save();
      return { ok: true };
    },

    setPostFlag(id, key, value) {
      const me = this.me();
      if (!this.isAdmin(me)) return { ok: false, msg: "没有权限" };
      const p = this.post(id);
      if (!p) return { ok: false, msg: "帖子不存在" };
      p[key] = value;
      this.save();
      return { ok: true };
    },

    replies(postId) {
      return this.load()
        .replies.filter((r) => r.post === Number(postId) && !r.deleted)
        .sort((a, b) => a.at - b.at);
    },

    addReply(postId, body, replyTo) {
      const me = this.me();
      if (!me) return { ok: false, msg: "请先登录" };
      if (!me.qq) return { ok: false, msg: "绑定 QQ 后才能回复" };
      body = String(body || "").trim();
      if (body.length < 2) return { ok: false, msg: "回复太短" };
      const p = this.post(postId);
      if (!p) return { ok: false, msg: "帖子不存在" };
      if (p.locked) return { ok: false, msg: "该帖已锁定" };
      const f = this.filterText(body);
      const r = {
        id: this.nextId(),
        post: Number(postId),
        author: me.id,
        body: f.text,
        at: Date.now(),
        replyTo: replyTo ? Number(replyTo) : null,
        flagged: f.hit.length > 0,
      };
      this.load().replies.push(r);
      this.save();
      if (p.author !== me.id) {
        this.notify(p.author, "reply", me.nickname + " 回复了你的帖子《" + p.title + "》", "#/forum/p/" + p.id);
      }
      if (replyTo && Number(replyTo) !== me.id) {
        this.notify(replyTo, "reply", me.nickname + " 回复了你的评论", "#/forum/p/" + p.id);
        if (p.author !== Number(replyTo) && p.author !== me.id) {
          this.notify(p.author, "reply", me.nickname + " 在《" + p.title + "》里回复了别人", "#/forum/p/" + p.id);
        }
      }
      return { ok: true, reply: r, flagged: f.hit };
    },

    deleteReply(id) {
      const me = this.me();
      const r = this.load().replies.find((x) => x.id === Number(id));
      if (!r) return { ok: false, msg: "回复不存在" };
      if (!this.isAdmin(me) && (!me || r.author !== me.id)) return { ok: false, msg: "没有权限" };
      r.deleted = true;
      this.save();
      return { ok: true };
    },

    /* ------------------------------ 公会 ------------------------------ */
    guilds() {
      return this.load().guilds.slice().sort((a, b) => b.members.length - a.members.length);
    },

    guild(id) {
      return this.load().guilds.find((g) => g.id === Number(id)) || null;
    },

    myGuild(userId) {
      return this.load().guilds.find((g) => g.members.map(Number).includes(Number(userId))) || null;
    },

    createGuild({ name, tag, intro }) {
      const me = this.me();
      if (!me) return { ok: false, msg: "请先登录" };
      if (!me.qq) return { ok: false, msg: "绑定 QQ 后才能创建公会" };
      if (this.myGuild(me.id)) return { ok: false, msg: "你已加入公会，每个账号只能加入一个" };
      name = String(name || "").trim();
      tag = String(tag || "").trim().toUpperCase();
      intro = String(intro || "").trim();
      if (name.length < 2 || name.length > 12) return { ok: false, msg: "公会名需为 2–12 个字" };
      if (!/^[A-Z0-9]{2,4}$/.test(tag)) return { ok: false, msg: "缩写需为 2–4 位字母或数字" };
      if (intro.length < 4) return { ok: false, msg: "简介至少 4 个字" };
      if (this.load().guilds.some((g) => g.name === name)) return { ok: false, msg: "公会名已存在" };
      const g = {
        id: this.nextId(),
        name,
        tag,
        intro: this.filterText(intro).text,
        owner: me.id,
        createdAt: Date.now(),
        members: [me.id],
        positions: { [me.id]: "leader" },
        notice: "",
      };
      this.load().guilds.push(g);
      this.save();
      return { ok: true, guild: g };
    },

    joinGuild(id) {
      const me = this.me();
      if (!me) return { ok: false, msg: "请先登录" };
      if (!me.qq) return { ok: false, msg: "绑定 QQ 后才能加入公会" };
      if (this.myGuild(me.id)) return { ok: false, msg: "每个账号只能加入一个公会" };
      const g = this.guild(id);
      if (!g) return { ok: false, msg: "公会不存在" };
      if (g.members.length >= 60) return { ok: false, msg: "公会人数已满" };
      g.members.push(me.id);
      g.positions[me.id] = "member";
      this.save();
      this.notify(g.owner, "guild", me.nickname + " 加入了你的公会「" + g.name + "」", "#/guild/" + g.id);
      return { ok: true };
    },

    leaveGuild(id) {
      const me = this.me();
      if (!me) return { ok: false, msg: "请先登录" };
      const g = this.guild(id);
      if (!g) return { ok: false, msg: "公会不存在" };
      if (g.owner === me.id) return { ok: false, msg: "会长不能直接退出，请先转让会长" };
      const i = g.members.indexOf(me.id);
      if (i === -1) return { ok: false, msg: "你不在该公会" };
      g.members.splice(i, 1);
      delete g.positions[me.id];
      this.save();
      return { ok: true };
    },

    setPosition(guildId, userId, pos) {
      const me = this.me();
      const g = this.guild(guildId);
      if (!g) return { ok: false, msg: "公会不存在" };
      if (!me || g.owner !== me.id) return { ok: false, msg: "只有会长可以调整职位" };
      if (Number(userId) === me.id) return { ok: false, msg: "不能修改自己的职位" };
      if (!g.members.includes(Number(userId))) return { ok: false, msg: "该成员不在公会" };
      g.positions[userId] = pos;
      this.save();
      this.notify(userId, "guild", "你在「" + g.name + "」的职位被调整为" + this.posName(pos), "#/guild/" + g.id);
      return { ok: true };
    },

    transferOwner(guildId, userId) {
      const me = this.me();
      const g = this.guild(guildId);
      if (!g) return { ok: false, msg: "公会不存在" };
      if (!me || g.owner !== me.id) return { ok: false, msg: "只有会长可以转让" };
      if (!g.members.includes(Number(userId)) || Number(userId) === me.id) return { ok: false, msg: "请选择其他成员" };
      g.owner = Number(userId);
      g.positions[userId] = "leader";
      g.positions[me.id] = "vice";
      this.save();
      this.notify(userId, "guild", "你已成为「" + g.name + "」的会长", "#/guild/" + g.id);
      return { ok: true };
    },

    dissolveGuild(guildId) {
      const me = this.me();
      const g = this.guild(guildId);
      if (!g) return { ok: false, msg: "公会不存在" };
      if (!this.isAdmin(me) && (!me || g.owner !== me.id)) return { ok: false, msg: "没有权限" };
      const idx = this.load().guilds.indexOf(g);
      this.load().guilds.splice(idx, 1);
      this.load().tombstones = this.load().tombstones || { users: [], guilds: [], announcements: [] };
      if (this.load().tombstones.guilds.indexOf(g.id) === -1) this.load().tombstones.guilds.push(g.id);
      this.load().guildMessages = this.load().guildMessages.filter((m) => m.guild !== g.id);
      this.save();
      return { ok: true };
    },

    posName(pos) {
      const p = window.SEED.POSITIONS.find((x) => x.id === pos);
      return p ? p.name : "成员";
    },

    guildMessages(id) {
      return this.load()
        .guildMessages.filter((m) => m.guild === Number(id))
        .sort((a, b) => a.at - b.at);
    },

    sendGuildMessage(guildId, body) {
      const me = this.me();
      const g = this.guild(guildId);
      if (!me || !g) return { ok: false, msg: "请先登录" };
      if (!g.members.includes(me.id)) return { ok: false, msg: "加入公会后才能发言" };
      body = String(body || "").trim();
      if (!body) return { ok: false, msg: "说点什么" };
      const f = this.filterText(body);
      const m = { id: this.nextId(), guild: g.id, author: me.id, body: f.text, at: Date.now() };
      this.load().guildMessages.push(m);
      this.save();
      return { ok: true, msg: m, flagged: f.hit };
    },

    /* ------------------------------ 私信 ------------------------------ */
    thread(a, b) {
      return this.load()
        .dms.filter(
          (d) =>
            (d.from === Number(a) && d.to === Number(b)) || (d.from === Number(b) && d.to === Number(a))
        )
        .sort((x, y) => x.at - y.at);
    },

    conversations(userId) {
      const db = this.load();
      const map = new Map();
      db.dms.forEach((d) => {
        if (d.from !== Number(userId) && d.to !== Number(userId)) return;
        const other = d.from === Number(userId) ? d.to : d.from;
        const cur = map.get(other);
        if (!cur || d.at > cur.at) map.set(other, d);
      });
      return Array.from(map.entries())
        .map(([id, last]) => {
          const u = this.user(id);
          const unread = db.dms.filter((d) => d.from === id && d.to === Number(userId) && !d.read).length;
          return { user: u, last, unread };
        })
        .filter((x) => x.user)
        .sort((a, b) => b.last.at - a.last.at);
    },

    unreadDM(userId) {
      return this.load().dms.filter((d) => d.to === Number(userId) && !d.read).length;
    },

    sendDM(to, body) {
      const me = this.me();
      if (!me) return { ok: false, msg: "请先登录" };
      to = Number(to);
      if (to === me.id) return { ok: false, msg: "不能给自己发私信" };
      if (!this.user(to)) return { ok: false, msg: "对方不存在" };
      body = String(body || "").trim();
      if (!body) return { ok: false, msg: "说点什么" };
      if (body.length > 500) return { ok: false, msg: "单条私信最多 500 字" };
      const f = this.filterText(body);
      const d = { id: this.nextId(), from: me.id, to, body: f.text, at: Date.now(), read: false };
      this.load().dms.push(d);
      this.save();
      this.notify(to, "dm", me.nickname + " 给你发来一条私信", "#/messages/dm/" + me.id);
      return { ok: true, msg: d, flagged: f.hit };
    },

    markThreadRead(a, b) {
      const db = this.load();
      db.dms.forEach((d) => {
        if (d.from === Number(b) && d.to === Number(a)) d.read = true;
      });
      this.save();
    },

    adminDMs(userId) {
      const id = Number(userId);
      return this.load()
        .dms.filter((d) => d.from === id || d.to === id)
        .sort((a, b) => b.at - a.at);
    },

    /* ------------------------------ 通知 ------------------------------ */
    notify(to, type, text, link) {
      if (!this.user(to)) return;
      const n = {
        id: this.nextId(),
        to: Number(to),
        type,
        text,
        link: link || "",
        at: Date.now(),
        read: false,
      };
      this.load().notifications.push(n);
      this.save();
    },

    notifications(userId) {
      return this.load()
        .notifications.filter((n) => n.to === Number(userId))
        .sort((a, b) => b.at - a.at);
    },

    unreadNotifs(userId) {
      return this.load().notifications.filter((n) => n.to === Number(userId) && !n.read).length;
    },

    markNotifRead(id) {
      const n = this.load().notifications.find((x) => x.id === Number(id));
      if (n) {
        n.read = true;
        this.save();
      }
    },

    markAllNotifsRead(userId) {
      this.load().notifications.forEach((n) => {
        if (n.to === Number(userId)) n.read = true;
      });
      this.save();
    },

    /* ------------------------------ 体验资格 ------------------------------ */
    applications() {
      return this.load().applications.slice().sort((a, b) => b.at - a.at);
    },

    myApplication(userId) {
      return this.load()
        .applications.filter((a) => a.user === Number(userId))
        .sort((a, b) => b.at - a.at)[0];
    },

    apply({ qq, reason }) {
      const me = this.me();
      if (!me) return { ok: false, msg: "请先登录" };
      if (!this.load().settings.applyOpen) return { ok: false, msg: "体验资格申请通道已关闭" };
      if (!me.qq) return { ok: false, msg: "请先在个人设置里绑定 QQ" };
      if (me.qualification) return { ok: false, msg: "你已获得体验资格" };
      const pending = this.load().applications.find((a) => a.user === me.id && a.status === "pending");
      if (pending) return { ok: false, msg: "你已提交过申请，请等待审批" };
      reason = String(reason || "").trim();
      if (reason.length < 10) return { ok: false, msg: "申请理由至少 10 个字" };
      const a = {
        id: this.nextId(),
        user: me.id,
        qq: String(qq || me.qq),
        reason: this.filterText(reason).text,
        at: Date.now(),
        status: "pending",
      };
      this.load().applications.push(a);
      this.save();
      return { ok: true, app: a };
    },

    reviewApp(id, status, note) {
      const me = this.me();
      if (!this.isAdmin(me)) return { ok: false, msg: "没有权限" };
      const a = this.load().applications.find((x) => x.id === Number(id));
      if (!a) return { ok: false, msg: "申请不存在" };
      a.status = status;
      a.handledBy = me.id;
      a.handledAt = Date.now();
      a.note = String(note || "").slice(0, 120);
      const u = this.user(a.user);
      if (u && status === "approved") {
        u.qualification = true;
        if (!u.workId) u.workId = "W-" + String(1000 + u.id * 7).slice(-4);
      }
      this.save();
      if (u) {
        this.notify(
          u.id,
          "apply",
          status === "approved"
            ? "你的体验资格申请已通过" + (u.workId ? "，工号 " + u.workId : "") + "。"
            : "你的体验资格申请未通过" + (a.note ? "：" + a.note : "。"),
          "#/apply"
        );
      }
      return { ok: true };
    },

    /* ------------------------------ 公告 / 设置 ------------------------------ */
    announcements() {
      return this.load().announcements.slice().sort((a, b) => b.at - a.at);
    },

    announcement(id) {
      return this.load().announcements.find((a) => a.id === Number(id)) || null;
    },

    saveAnnouncement(data) {
      const me = this.me();
      if (!this.isAdmin(me)) return { ok: false, msg: "没有权限" };
      const db = this.load();
      if (data.id) {
        const a = db.announcements.find((x) => x.id === Number(data.id));
        if (!a) return { ok: false, msg: "公告不存在" };
        Object.assign(a, { title: data.title, tag: data.tag, body: data.body, at: a.at, editedAt: Date.now() });
      } else {
        db.announcements.push({
          id: this.nextId(),
          title: data.title,
          tag: data.tag || "公告",
          body: data.body,
          at: Date.now(),
          author: me.id,
        });
      }
      this.save();
      return { ok: true };
    },

    deleteAnnouncement(id) {
      const me = this.me();
      if (!this.isAdmin(me)) return { ok: false, msg: "没有权限" };
      const db = this.load();
      db.announcements = db.announcements.filter((a) => a.id !== Number(id));
      db.tombstones = db.tombstones || { users: [], guilds: [], announcements: [] };
      if (db.tombstones.announcements.indexOf(Number(id)) === -1) db.tombstones.announcements.push(Number(id));
      this.save();
      return { ok: true };
    },

    settings() {
      return this.load().settings;
    },

    setSetting(key, value) {
      const me = this.me();
      if (!this.isAdmin(me)) return { ok: false, msg: "没有权限" };
      const st = this.load().settings;
      st[key] = value;
      st.updatedAt = Date.now();
      this.save();
      return { ok: true };
    },

    addBannedWord(word) {
      const me = this.me();
      if (!this.isAdmin(me)) return { ok: false, msg: "没有权限" };
      const w = String(word || "").trim();
      if (!w) return { ok: false, msg: "请输入违禁词" };
      const list = this.load().settings.bannedWords;
      if (list.includes(w)) return { ok: false, msg: "已存在" };
      list.push(w);
      this.save();
      return { ok: true };
    },

    removeBannedWord(word) {
      const me = this.me();
      if (!this.isAdmin(me)) return { ok: false, msg: "没有权限" };
      const s = this.load().settings;
      s.bannedWords = s.bannedWords.filter((w) => w !== word);
      this.save();
      return { ok: true };
    },

    sendSystem(to, text) {
      const me = this.me();
      if (!this.isAdmin(me)) return { ok: false, msg: "没有权限" };
      if (!this.user(to)) return { ok: false, msg: "用户不存在" };
      this.notify(to, "system", String(text || "").slice(0, 300), "#/messages/sys");
      return { ok: true };
    },

    /* ------------------------------ 注销账号 ------------------------------ */
    deleteAccount(id, opts) {
      opts = opts || {};
      const me = this.me();
      const target = this.user(id);
      if (!target) return { ok: false, msg: "账号不存在" };
      const self = me && me.id === target.id;

      if (self) {
        if (target.password !== hash(String(opts.password || ""))) {
          return { ok: false, msg: "密码不正确" };
        }
      } else {
        if (!this.isAdmin(me)) return { ok: false, msg: "没有权限" };
        if (target.role === "super") return { ok: false, msg: "不能删除超级管理员" };
        if (me.role !== "super" && target.role === "admin") {
          return { ok: false, msg: "只有超级管理员可以删除管理员" };
        }
      }

      const db = this.load();
      const uid = target.id;

      // 公会：转让会长 / 解散空会
      const dissolve = [];
      db.guilds.forEach((g) => {
        const i = g.members.indexOf(uid);
        if (i === -1) return;
        g.members.splice(i, 1);
        delete g.positions[uid];
        if (g.owner === uid) {
          if (g.members.length) {
            const next = g.members.slice().sort((a, b) => {
              const rank = { vice: 0, elite: 1, member: 2 };
              return (rank[g.positions[a]] || 3) - (rank[g.positions[b]] || 3) || a - b;
            })[0];
            g.owner = next;
            g.positions[next] = "leader";
            this.notify(next, "guild", "原会长已注销，你成为「" + g.name + "」的会长", "#/guild/" + g.id);
          } else {
            dissolve.push(g.id);
          }
        }
      });
      db.guilds = db.guilds.filter((g) => dissolve.indexOf(g.id) === -1);

      // 帖子与回复
      const ownPosts = db.posts.filter((p) => p.author === uid).map((p) => p.id);
      db.posts = db.posts.filter((p) => p.author !== uid);
      db.replies = db.replies.filter((r) => r.author !== uid && ownPosts.indexOf(r.post) === -1);

      // 社交关系、私信、通知、申请
      db.follows = db.follows.filter((f) => f.from !== uid && f.to !== uid);
      db.dms = db.dms.filter((d) => d.from !== uid && d.to !== uid);
      db.notifications = db.notifications.filter((n) => n.to !== uid);
      db.applications = db.applications.filter((a) => a.user !== uid);

      // 移除账号
      db.users = db.users.filter((u) => u.id !== uid);
      db.tombstones = db.tombstones || { users: [], guilds: [], announcements: [] };
      if (db.tombstones.users.indexOf(uid) === -1) db.tombstones.users.push(uid);

      // 超管注销后，顺位给最早注册的真实账号
      if (target.role === "super") {
        const next = db.users
          .filter((u) => !u.seed)
          .sort((a, b) => a.createdAt - b.createdAt)[0] || db.users[0];
        if (next) {
          next.role = "super";
          this.notify(next.id, "system", "原超级管理员已注销，你已成为新的超级管理员。", "#/admin");
        }
      }

      if (self) localStorage.removeItem(SESSION);
      this.save();
      return { ok: true, self, dissolved: dissolve.length };
    },

    stats() {
      const db = this.load();
      return {
        users: db.users.length,
        posts: db.posts.filter((p) => !p.deleted).length,
        replies: db.replies.filter((r) => !r.deleted).length,
        guilds: db.guilds.length,
        pending: db.applications.filter((a) => a.status === "pending").length,
        dms: db.dms.length,
        announcements: db.announcements.length,
        friends: db.follows.length,
      };
    },
  };

  window.Store = Store;
})();
