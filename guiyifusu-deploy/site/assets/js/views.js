/* 页面视图 */
(function () {
  const { esc, avatar, timeAgo, fmtDate, md, toast, modal, empty, requireLogin, requireQQ } = window.UI;
  const S = window.Store;
  const G = window.SEED.game;
  const CATS = window.SEED.CATEGORIES;

  function catName(id) {
    const c = CATS.find((x) => x.id === id);
    return c ? c.name : "综合讨论";
  }

  function authorOf(p) {
    return S.user(p.author);
  }

  function postRow(p) {
    const u = authorOf(p);
    const count = S.replies(p.id).length;
    return (
      '<a class="post-row" href="#/forum/p/' +
      p.id +
      '">' +
      avatar(u, "avatar-sm") +
      '<div class="post-main">' +
      '<div class="post-title">' +
      (p.pinned ? '<span class="badge badge-red">置顶</span>' : "") +
      (p.locked ? '<span class="badge badge-dim">已锁定</span>' : "") +
      esc(p.title) +
      "</div>" +
      '<div class="post-meta">' +
      "<span>" +
      esc(u ? u.nickname : "未知") +
      "</span>" +
      "<span>" +
      catName(p.cat) +
      "</span>" +
      "<span>" +
      timeAgo(p.at) +
      "</span>" +
      "</div>" +
      (p.body ? '<div class="post-excerpt">' + esc(p.body.replace(/\n/g, " ")) + "</div>" : "") +
      "</div>" +
      '<div class="post-stats"><span><b>' +
      p.views +
      "</b> 浏览</span><span><b>" +
      count +
      "</b> 回复</span></div>" +
      "</a>"
    );
  }

  /* ------------------------------ 首页 ------------------------------ */
  function home() {
    const st = S.stats();
    const anns = S.announcements().slice(0, 4);
    const posts = S.posts().slice(0, 4);
    const html =
      '<section class="hero">' +
      '<div class="hero-copy">' +
      '<div class="hero-tag"><span class="dot"></span>《神秘复苏》同人企划 · 体验招募中</div>' +
      '<h1>诡异<span class="stroke">复苏</span></h1>' +
      '<p class="lead">灵异事件并非凭空而来。<br>每一只厉鬼，都有它的规矩。<br>规矩写在纸上，也刻在命里。</p>' +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary" href="#/apply">申请体验资格</a>' +
      '<a class="btn btn-ghost" href="#/forum">进入灵异论坛</a>' +
      "</div>" +
      '<div class="hero-stats">' +
      '<div><b class="mono">' + st.users + "</b><span>已注册驭鬼者</span></div>" +
      '<div><b class="mono">' + st.posts + "</b><span>论坛档案</span></div>" +
      '<div><b class="mono">' + st.guilds + "</b><span>在册公会</span></div>" +
      "</div>" +
      "</div>" +
      '<div class="hero-visual">' +
      '<div class="hero-eye">' + (window.Art ? window.Art.eye() : "") + '</div>' +
      '<div class="hero-float f1"><b>编号 001</b>不要应，不要问，不要开</div>' +
      '<div class="hero-float f2"><b>鬼眼</b>血红看鬼 · 金色鬼看你</div>' +
      '<div class="hero-float f3"><b>人皮纸</b>问一次，取一点</div>' +
      "</div>" +
      "</section>" +
      '<div class="marquee"><div class="marquee-track">' +
      Array.from({ length: 2 })
        .map(
          () =>
            "<span>体验资格通道开放中</span><span>红月事件 10.31 20:00</span><span>公会「守夜人」招募新人</span>" +
            "<span>论坛新档案：人皮纸的代价</span><span>首个注册账号自动成为超级管理员</span>"
        )
        .join("") +
      "</div></div>" +

      '<section class="section">' +
      '<div class="section-head"><div><div class="eyebrow">Core</div><h2>这不是一个人能活下来的世界</h2></div>' +
      '<a class="btn btn-ghost btn-sm" href="#/gameplay">查看玩法</a></div>' +
      '<div class="grid-3">' +
      G.features
        .slice(0, 6)
        .map(
          (f) =>
            '<div class="card card-hover feature-card"><div class="feature-icon">' +
            window.Icon(f.icon) +
            "</div><h3>" +
            esc(f.title) +
            "</h3><p>" +
            esc(f.desc) +
            "</p></div>"
        )
        .join("") +
      "</div></section>" +

      '<section class="section">' +
      '<div class="section-head"><div><div class="eyebrow">Archive</div><h2>最近公告</h2></div>' +
      '<a class="btn btn-ghost btn-sm" href="#/news">全部公告</a></div>' +
      '<div class="notice-list">' +
      (anns.length
        ? anns
            .map(
              (a) =>
                '<a class="notice-row" href="#/news/' +
                a.id +
                '"><span class="notice-date">' +
                fmtDate(a.at) +
                '</span><span class="notice-title">' +
                esc(a.title) +
                '</span><span class="notice-tag">' +
                esc(a.tag) +
                "</span></a>"
            )
            .join("")
        : empty("暂无公告")) +
      "</div></section>" +

      '<section class="section">' +
      '<div class="section-head"><div><div class="eyebrow">Screens</div><h2>基地内部</h2></div>' +
      '<a class="btn btn-ghost btn-sm" href="#/gameplay">更多</a></div>' +
      '<div class="shots">' +
      '<figure class="shot" data-shot="0"><img src="' + G.shots[0].src + '" alt="' + esc(G.shots[0].title) + '"><figcaption>' + esc(G.shots[0].title) + " · " + esc(G.shots[0].note) + "</figcaption></figure>" +
      '<div class="col">' +
      '<figure class="shot" data-shot="1"><img src="' + G.shots[1].src + '" alt="' + esc(G.shots[1].title) + '"><figcaption>' + esc(G.shots[1].title) + "</figcaption></figure>" +
      '<figure class="shot" data-shot="2"><img src="' + G.shots[2].src + '" alt="' + esc(G.shots[2].title) + '"><figcaption>' + esc(G.shots[2].title) + "</figcaption></figure>" +
      "</div></div></section>" +

      '<section class="section">' +
      '<div class="quote">“ 鬼不杀人，<em>规矩</em>杀人。<br>找到规矩，就找到活路。 ”</div>' +
      '<div class="grid-2">' +
      '<div class="card"><h3>灵异档案</h3><p class="muted" style="margin:8px 0 16px">基地封存的四份记录，读完再决定要不要申请。</p>' +
      G.lore
        .map(
          (l) =>
            '<div class="row" style="align-items:flex-start;padding:9px 0;border-top:1px solid var(--line)"><span class="badge badge-dim mono">' +
            l.no +
            '</span><div><b style="font-size:13.5px">' +
            esc(l.title) +
            '</b><div class="small muted">' +
            esc(l.text) +
            "</div></div></div>"
        )
        .join("") +
      "</div>" +
      '<div class="card"><h3>论坛正在讨论</h3><div class="post-list" style="margin-top:10px">' +
      posts.map(postRow).join("") +
      '</div><a class="btn btn-ghost btn-sm" href="#/forum" style="margin-top:14px">进入论坛</a></div>' +
      "</div></section>" +

      '<section class="section center" style="padding:20px 0 0">' +
      '<div class="eyebrow" style="justify-content:center">Recruit</div>' +
      '<h2 style="font-size:clamp(28px,3.4vw,44px)">灵异复苏的时代，活着就是胜利</h2>' +
      '<p class="muted" style="max-width:560px;margin:12px auto 24px">绑定 QQ，写一份申请理由。管理员会亲自看。</p>' +
      '<a class="btn btn-primary" href="#/apply">申请体验资格</a>' +
      "</section>";

    return {
      html,
      mount(root) {
        root.querySelectorAll("[data-shot]").forEach((el) => {
          el.addEventListener("click", () => {
            const s = G.shots[Number(el.dataset.shot)];
            if (!s) return;
            modal({
              title: s.title,
              wide: true,
              body: '<img src="' + s.src + '" alt="" style="width:100%;border-radius:10px"><p class="small muted" style="margin-top:10px">' + esc(s.note) + "</p>",
            });
          });
        });
      },
    };
  }

  /* ------------------------------ 世界观 ------------------------------ */
  function world() {
    const html =
      '<div class="page-head"><div class="eyebrow">World</div><h1>灵异复苏</h1>' +
      '<p>二十年前，第一起编号事件被记录。此后，厉鬼不再是传说，而是一种需要被归档、被研究、被收容的自然现象。</p></div>' +
      '<div class="grid-2" style="align-items:start">' +
      '<div class="card" style="padding:28px">' +
      '<h2 style="font-size:24px">基地的由来</h2>' +
      '<p class="dim" style="margin:12px 0;line-height:2">编号 001「敲门」之后，幸存者建立了第一座观察站。他们发现：<b>鬼杀人是讲条件的。</b></p>' +
      '<p class="dim" style="margin:12px 0;line-height:2">条件就是规矩。看懂规矩的人，能活；改掉规矩的人，能反过来杀鬼。这些人被称为<b class="blood">驭鬼者</b>。</p>' +
      '<p class="dim" style="margin:12px 0;line-height:2">如今，全球驭鬼者基地已经建立。亚洲区分部下设档案处、任务处、收容区与实验区。</p>' +
      '<div class="quote" style="margin:24px 0 0;font-size:19px">“ 不要回头，<em>不要应声</em>，不要相信第二个月亮。 ”</div>' +
      "</div>" +
      '<div class="card" style="padding:28px"><h3 style="margin-bottom:18px">大事记</h3>' +
      G.timeline
        .map(
          (t, i) =>
            '<div class="row" style="align-items:flex-start;padding:14px 0;border-top:1px solid var(--line)">' +
            '<div style="width:54px;flex:none"><span class="badge badge-dim">' +
            esc(t.t) +
            "</span></div><div><b>" +
            esc(t.title) +
            '</b><div class="small muted">' +
            esc(t.text) +
            "</div></div></div>"
        )
        .join("") +
      "</div></div>" +

      '<div class="divider"></div>' +
      '<div class="section-head"><div><div class="eyebrow">Files</div><h2>已解禁档案</h2></div></div>' +
      '<div class="grid-2">' +
      G.lore
        .map(
          (l) =>
            '<div class="card card-hover" style="padding:24px"><div class="row-between"><span class="badge badge-red mono">' +
            l.no +
            '</span><span class="small muted">已解禁</span></div><h3 style="margin-top:14px">' +
            esc(l.title) +
            '</h3><p class="muted" style="margin:8px 0 0;font-family:var(--font-hand);font-size:16px;line-height:2">' +
            esc(l.text) +
            "</p></div>"
        )
        .join("") +
      "</div>" +
      '<div class="section center" style="margin-top:50px"><a class="btn btn-primary" href="#/apply">加入基地</a></div>';
    return { html };
  }

  /* ------------------------------ 玩法 ------------------------------ */
  function gameplay() {
    const html =
      '<div class="page-head"><div class="eyebrow">Gameplay</div><h1>核心玩法</h1>' +
      '<p>调查、看懂、布局、封印。每一次任务，都是一次和规矩的谈判。</p></div>' +
      '<div class="grid-3">' +
      G.features
        .map(
          (f) =>
            '<div class="card card-hover feature-card"><div class="feature-icon">' +
            window.Icon(f.icon) +
            "</div><h3>" +
            esc(f.title) +
            "</h3><p>" +
            esc(f.desc) +
            "</p></div>"
        )
        .join("") +
      "</div>" +
      '<div class="divider"></div>' +
      '<div class="grid-2" style="align-items:start">' +
      '<div class="card"><h3>一次任务的流程</h3>' +
      ["接取档案 · 确认等级与规矩", "现场调查 · 记录杀人条件", "布局 · 改写规矩或设下封印", "收容 · 带走鬼，或者带走同伴", "归档 · 上报，等待下一次"]
        .map(
          (t, i) =>
            '<div class="row" style="padding:13px 0;border-top:1px solid var(--line)"><span class="badge badge-dim mono">0' +
            (i + 1) +
            "</span><span>" +
            esc(t) +
            "</span></div>"
        )
        .join("") +
      "</div>" +
      '<div class="card"><h3>等级与权限</h3>' +
      [
        ["D", "一层大厅、任务发布区"],
        ["C", "二层档案室、装备库"],
        ["B", "三层情报室、灵异收容区"],
        ["A", "地下实验区"],
        ["S", "全部区域"],
      ]
        .map(
          (r) =>
            '<div class="row-between" style="padding:11px 0;border-top:1px solid var(--line)"><span class="badge badge-red mono">' +
            r[0] +
            '</span><span class="small muted">' +
            esc(r[1]) +
            "</span></div>"
        )
        .join("") +
      "</div></div>" +
      '<div class="divider"></div>' +
      '<div class="section-head"><div><div class="eyebrow">FAQ</div><h2>常问</h2></div></div>' +
      G.faq
        .map(
          (f) =>
            '<div class="card" style="margin-bottom:12px;padding:18px 22px"><b>' +
            esc(f.q) +
            '</b><p class="muted" style="margin:6px 0 0">' +
            esc(f.a) +
            "</p></div>"
        )
        .join("") +
      '<div class="section center" style="margin-top:35px"><a class="btn btn-primary" href="#/apply">申请体验资格</a></div>';
    return { html };
  }

  /* ------------------------------ 公告 ------------------------------ */
  function news() {
    const list = S.announcements();
    return {
      html:
        '<div class="page-head"><div class="eyebrow">News</div><h1>更新公告</h1><p>版本、活动与基地通知。</p></div>' +
        '<div class="stack">' +
        (list.length
          ? list
              .map(
                (a) =>
                  '<a class="card card-hover" style="display:block;padding:22px" href="#/news/' +
                  a.id +
                  '"><div class="row-between"><span class="badge badge-red">' +
                  esc(a.tag) +
                  '</span><span class="small muted">' +
                  fmtDate(a.at) +
                  "</span></div><h3 style=\"margin-top:12px\">" +
                  esc(a.title) +
                  '</h3><p class="muted" style="margin:6px 0 0">' +
                  esc(a.body.replace(/\n/g, " ").slice(0, 90)) +
                  "…</p></a>"
              )
              .join("")
          : empty("暂无公告")) +
        "</div>",
    };
  }

  function newsDetail(id) {
    const a = S.announcement(id);
    if (!a) return { html: empty("公告不存在") };
    return {
      html:
        '<a class="small muted" href="#/news">← 返回公告</a>' +
        '<article class="card" style="margin-top:16px;padding:34px">' +
        '<div class="row-between"><span class="badge badge-red">' +
        esc(a.tag) +
        '</span><span class="small muted">' +
        fmtDate(a.at, true) +
        "</span></div>" +
        '<h1 style="font-size:32px;margin:14px 0 18px">' +
        esc(a.title) +
        "</h1>" +
        '<div class="post-body">' +
        md(a.body) +
        "</div>" +
        '<div class="divider" style="margin:26px 0"></div>' +
        '<div class="small muted">发布者：' +
        esc((S.user(a.author) || {}).nickname || "基地管理处") +
        "</div></article>",
    };
  }

  /* ------------------------------ 论坛 ------------------------------ */
  function forum(catId, q) {
    const me = S.me();
    const posts = S.posts({ cat: catId, q });
    const counts = {};
    CATS.forEach((c) => (counts[c.id] = S.posts({ cat: c.id }).length));
    const cats =
      '<div class="cat-list">' +
      '<a class="cat-item ' +
      (!catId ? "is-on" : "") +
      '" href="#/forum">全部帖子<span class="count">' +
      S.posts().length +
      "</span></a>" +
      CATS.map(
        (c) =>
          '<a class="cat-item ' +
          (catId === c.id ? "is-on" : "") +
          '" href="#/forum/c/' +
          c.id +
          '">' +
          c.name +
          '<span class="count">' +
          counts[c.id] +
          "</span></a>"
      ).join("") +
      "</div>";

    return {
      html:
        '<div class="page-head row-between" style="align-items:flex-end;flex-wrap:wrap">' +
        "<div><div class=\"eyebrow\">Forum</div><h1>灵异论坛</h1><p>档案、怪谈、攻略，以及还活着的人。</p></div>" +
        (me && me.qq
          ? '<a class="btn btn-primary" href="#/forum/new">发帖</a>'
          : '<a class="btn btn-ghost" href="#/forum/new">发帖（需绑定 QQ）</a>') +
        "</div>" +
        '<div class="forum-layout">' +
        '<aside class="card side-card" style="padding:14px">' +
        cats +
        '<div class="divider" style="margin:14px 0"></div><div class="small muted" style="padding:0 8px;line-height:1.9">' +
        "绑定 QQ 后才可以发帖与回复。<br>点进作者主页可以关注。" +
        "</div></aside>" +
        '<div><div class="forum-toolbar">' +
        '<input class="input" id="forumSearch" placeholder="搜索标题或内容…" value="' +
        UI.escAttr(q || "") +
        '">' +
        '<a class="btn btn-ghost btn-sm" href="#/forum">重置</a>' +
        "</div>" +
        '<div class="card" style="padding:6px 14px">' +
        (posts.length ? posts.map(postRow).join("") : empty("这个分类还没有帖子")) +
        "</div></div></div>",
      mount(root) {
        const input = root.querySelector("#forumSearch");
        if (input) {
          input.addEventListener(
            "keydown",
            UI.debounce(function (e) {
              if (e.key === "Enter") {
                const base = catId ? "#/forum/c/" + catId : "#/forum";
                location.hash = base + (input.value.trim() ? "?q=" + encodeURIComponent(input.value.trim()) : "");
              }
            }, 300)
          );
        }
      },
    };
  }

  function postNew() {
    const me = S.me();
    if (!me) {
      return {
        html:
          '<div class="card center" style="padding:60px 20px"><h2>发帖需要登录</h2><p class="muted" style="margin:10px 0 20px">注册并绑定 QQ 后即可发帖。</p><a class="btn btn-primary" href="#/login?next=' +
          encodeURIComponent("#/forum/new") +
          '">登录 / 注册</a></div>',
      };
    }
    if (!me.qq) {
      return {
        html:
          '<div class="card center" style="padding:60px 20px"><h2>还差一步：绑定 QQ</h2><p class="muted" style="margin:10px 0 20px">为防止批量注册与广告，发帖前需要绑定 QQ。</p><a class="btn btn-primary" href="#/me">去绑定</a></div>',
      };
    }
    const catOpts = CATS.map((c) => '<option value="' + c.id + '">' + esc(c.name) + "</option>").join("");
    return {
      html:
        '<a class="small muted" href="#/forum">← 返回论坛</a>' +
        '<div class="card composer" style="margin-top:16px;padding:26px">' +
        '<h2 style="font-size:24px;margin-bottom:16px">发布新帖</h2>' +
        '<div class="grid-2" style="gap:14px"><div class="field"><label>分类</label><select class="select" id="pCat">' +
        catOpts +
        "</select></div>" +
        '<div class="field"><label>标题</label><input class="input" id="pTitle" maxlength="60" placeholder="一句话说清楚"></div></div>' +
        '<div class="field"><label>正文</label><textarea class="textarea" id="pBody" maxlength="3000" placeholder="写清楚你遇到的规矩、问题或招募条件。"></textarea></div>' +
        '<div class="row-between"><span class="hint">支持换行；违禁词会被自动替换。</span>' +
        '<button class="btn btn-primary" id="pSubmit" type="button">发布</button></div>' +
        "</div>",
      mount(root) {
        root.querySelector("#pSubmit").addEventListener("click", () => {
          const r = S.createPost({
            cat: root.querySelector("#pCat").value,
            title: root.querySelector("#pTitle").value,
            body: root.querySelector("#pBody").value,
          });
          if (!r.ok) return toast(r.msg, "err");
          if (r.flagged && r.flagged.length) toast("已发布，部分违禁词被替换", "ok");
          else toast("已发布", "ok");
          location.hash = "#/forum/p/" + r.post.id;
        });
      },
    };
  }

  function postDetail(id) {
    const p = S.post(id);
    if (!p || p.deleted) return { html: empty("帖子不存在或已删除") };
    S.viewPost(id);
    const me = S.me();
    const author = authorOf(p);
    const rs = S.replies(id);
    const liked = me && p.likes.includes(me.id);
    const canDel = me && (S.isAdmin(me) || p.author === me.id);

    const repliesHtml = rs.length
      ? rs
          .map((r, i) => {
            const u = S.user(r.author);
            const to = r.replyTo ? S.user(r.replyTo) : null;
            return (
              '<div class="reply">' +
              '<a href="#/u/' +
              r.author +
              '">' +
              avatar(u) +
              "</a>" +
              "<div><div class=\"reply-head\"><a href=\"#/u/" +
              r.author +
              '"><b>' +
              esc(u ? u.nickname : "未知") +
              "</b></a>" +
              (to ? '<span>回复 ' + esc(to.nickname) + "</span>" : "") +
              "<span>" +
              timeAgo(r.at) +
              '</span><span class="floor">#' +
              (i + 1) +
              "</span>" +
              (r.flagged ? '<span class="badge badge-dim">已过滤</span>' : "") +
              "</div>" +
              '<div class="reply-body">' +
              md(r.body) +
              "</div>" +
              '<div class="reply-actions"><button data-reply="' +
              r.author +
              '" data-name="' +
              UI.escAttr(u ? u.nickname : "") +
              '">回复</button>' +
              (me && (S.isAdmin(me) || r.author === me.id)
                ? '<button data-delreply="' + r.id + '">删除</button>'
                : "") +
              "</div></div></div>"
            );
          })
          .join("")
      : empty("还没有回复，来说第一句");

    return {
      html:
        '<a class="small muted" href="#/forum' +
        (p.cat ? "/c/" + p.cat : "") +
        '">← 返回 ' +
        catName(p.cat) +
        "</a>" +
        '<article class="card" style="margin-top:16px;padding:30px">' +
        '<div class="row-between"><div class="row">' +
        '<a href="#/u/' +
        p.author +
        '">' +
        avatar(author, "avatar-ring") +
        '</a><div><div class="row" style="gap:8px"><a href="#/u/' +
        p.author +
        '"><b>' +
        esc(author ? author.nickname : "未知") +
        "</b></a>" +
        (author && author.role !== "user" ? '<span class="badge badge-gold">管理员</span>' : "") +
        (author && author.qualification ? '<span class="badge">已获资格</span>' : "") +
        '</div><div class="small muted">' +
        timeAgo(p.at) +
        " · " +
        catName(p.cat) +
        " · " +
        p.views +
        " 浏览</div></div></div>" +
        '<div class="row">' +
        (canDel ? '<button class="btn btn-ghost btn-sm" id="delPost">删除</button>' : "") +
        (S.isAdmin(me)
          ? '<button class="btn btn-ghost btn-sm" id="pinPost">' +
            (p.pinned ? "取消置顶" : "置顶") +
            '</button><button class="btn btn-ghost btn-sm" id="lockPost">' +
            (p.locked ? "解锁" : "锁定") +
            "</button>"
          : "") +
        "</div></div>" +
        '<div class="row" style="gap:8px;margin:16px 0 6px">' +
        (p.pinned ? '<span class="badge badge-red">置顶</span>' : "") +
        (p.locked ? '<span class="badge badge-dim">已锁定</span>' : "") +
        "</div>" +
        '<h1 style="font-size:30px;line-height:1.4">' +
        esc(p.title) +
        "</h1>" +
        '<div class="post-body" style="margin-top:16px">' +
        md(p.body) +
        "</div>" +
        '<div class="row" style="margin-top:22px;gap:10px">' +
        '<button class="btn ' +
        (liked ? "btn-primary" : "btn-ghost") +
        ' btn-sm" id="likeBtn">' +
        window.Icon("heart") +
        " <span>" +
        p.likes.length +
        "</span></button>" +
        '<span class="small muted">' +
        rs.length +
        " 条回复</span>" +
        "</div></article>" +

        '<section class="card" style="margin-top:18px;padding:26px"><h3 style="margin-bottom:6px">回复 (' +
        rs.length +
        ")</h3>" +
        '<div id="replyList">' +
        repliesHtml +
        "</div>" +
        (p.locked
          ? '<div class="hint" style="margin-top:14px">该帖已锁定，暂时不能回复。</div>'
          : me
          ? me.qq
            ? '<div style="margin-top:18px" id="replyBox"><div id="replyHint" class="hint"></div><textarea class="textarea" id="replyBody" style="min-height:100px" placeholder="说点什么…"></textarea>' +
              '<div class="row-between" style="margin-top:10px"><span class="hint">绑定 QQ 后发言会显示昵称。</span><button class="btn btn-primary btn-sm" id="replySubmit">回复</button></div></div>'
            : '<div class="hint" style="margin-top:16px">绑定 QQ 后才能回复。<a class="link" href="#/me">去绑定</a></div>'
          : '<div class="hint" style="margin-top:16px"><a class="link" href="#/login?next=' +
            encodeURIComponent("#/forum/p/" + id) +
            '">登录</a> 后参与讨论。</div>') +
        "</section>",

      mount(root) {
        const like = root.querySelector("#likeBtn");
        if (like)
          like.addEventListener("click", () => {
            const r = S.likePost(id);
            if (!r.ok) return toast(r.msg, "err");
            like.classList.toggle("btn-primary", r.liked);
            like.classList.toggle("btn-ghost", !r.liked);
            like.querySelector("span").textContent = r.count;
          });

        const del = root.querySelector("#delPost");
        if (del)
          del.addEventListener("click", () =>
            UI.confirm("删除这篇帖子？", () => {
              S.deletePost(id);
              toast("已删除", "ok");
              location.hash = "#/forum";
            })
          );

        root.querySelector("#pinPost")?.addEventListener("click", () => {
          S.setPostFlag(id, "pinned", !p.pinned);
          window.App.render();
        });
        root.querySelector("#lockPost")?.addEventListener("click", () => {
          S.setPostFlag(id, "locked", !p.locked);
          window.App.render();
        });

        root.querySelectorAll("[data-reply]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const box = root.querySelector("#replyBody");
            if (!box) return;
            box.focus();
            box.value = "@" + btn.dataset.name + " ";
            root.querySelector("#replyHint").textContent = "正在回复 " + btn.dataset.name;
            root.querySelector("#replyBox").dataset.to = btn.dataset.reply;
          });
        });

        root.querySelectorAll("[data-delreply]").forEach((btn) => {
          btn.addEventListener("click", () =>
            UI.confirm("删除这条回复？", () => {
              S.deleteReply(btn.dataset.delreply);
              window.App.render();
            })
          );
        });

        const submit = root.querySelector("#replySubmit");
        if (submit)
          submit.addEventListener("click", () => {
            const box = root.querySelector("#replyBody");
            const to = root.querySelector("#replyBox").dataset.to;
            const r = S.addReply(id, box.value, to);
            if (!r.ok) return toast(r.msg, "err");
            toast("已回复", "ok");
            window.App.render();
          });
      },
    };
  }

  /* ------------------------------ 公会 ------------------------------ */
  function guilds() {
    const me = S.me();
    const mine = me ? S.myGuild(me.id) : null;
    const list = S.guilds();
    return {
      html:
        '<div class="page-head row-between" style="align-items:flex-end;flex-wrap:wrap"><div><div class="eyebrow">Guilds</div><h1>公会大厅</h1><p>每个账号只能加入一个公会。会长可以任命职位。</p></div>' +
        (mine
          ? '<a class="btn btn-primary" href="#/guild/' + mine.id + '">我的公会</a>'
          : me && me.qq
          ? '<a class="btn btn-primary" href="#/guilds/new">创建公会</a>'
          : '<a class="btn btn-ghost" href="#/guilds/new">创建公会（需绑定 QQ）</a>') +
        "</div>" +
        (mine
          ? '<div class="card" style="margin-bottom:18px;padding:16px 20px;border-color:rgba(220,90,90,.35)"><div class="row-between"><div class="row">' +
            '<span class="guild-emblem" style="width:40px;height:40px;font-size:16px">' +
            esc(mine.tag) +
            '</span><div><b>' +
            esc(mine.name) +
            '</b><div class="small muted">我的公会 · ' +
            mine.members.length +
            " 人</div></div></div>" +
            '<a class="btn btn-ghost btn-sm" href="#/guild/' +
            mine.id +
            '">进入</a></div></div>'
          : "") +
        '<div class="grid-2">' +
        list
          .map((g) => {
            const owner = S.user(g.owner);
            return (
              '<a class="card card-hover guild-card" href="#/guild/' +
              g.id +
              '"><span class="guild-emblem">' +
              esc(g.tag) +
              '</span><div class="guild-body"><div class="guild-title"><h3>' +
              esc(g.name) +
              '</h3><span class="guild-tag">' +
              esc(g.tag) +
              "</span></div><p class=\"guild-desc\">" +
              esc(g.intro) +
              '</p><div class="guild-meta"><span>会长 ' +
              esc(owner ? owner.nickname : "未知") +
              "</span><span>" +
              g.members.length +
              " / 60 人</span><span>" +
              timeAgo(g.createdAt) +
              "建立</span></div></div></a>"
            );
          })
          .join("") +
        (list.length ? "" : empty("还没有公会，成为第一个")) +
        "</div>",
    };
  }

  function guildNew() {
    const me = S.me();
    if (!me)
      return {
        html:
          '<div class="card center" style="padding:60px"><h2>创建公会需要登录</h2><a class="btn btn-primary" style="margin-top:18px" href="#/login?next=' +
          encodeURIComponent("#/guilds/new") +
          '">登录 / 注册</a></div>',
      };
    if (!me.qq)
      return {
        html:
          '<div class="card center" style="padding:60px"><h2>绑定 QQ 后才能创建公会</h2><p class="muted" style="margin:10px 0 18px">这是为了防止批量建会与广告。</p><a class="btn btn-primary" href="#/me">去绑定</a></div>',
      };
    if (S.myGuild(me.id))
      return {
        html:
          '<div class="card center" style="padding:60px"><h2>你已经在公会里了</h2><p class="muted" style="margin:10px 0 18px">每个账号只能加入一个公会，先退出当前公会。</p><a class="btn btn-primary" href="#/guilds">返回公会大厅</a></div>',
      };
    return {
      html:
        '<a class="small muted" href="#/guilds">← 返回公会大厅</a>' +
        '<div class="card" style="margin-top:16px;padding:28px;max-width:640px">' +
        '<h2 style="font-size:24px;margin-bottom:16px">创建公会</h2>' +
        '<div class="field"><label>公会名（2–12 字）</label><input class="input" id="gName" maxlength="12" placeholder="例如：守夜人"></div>' +
        '<div class="field"><label>缩写（2–4 位字母或数字）</label><input class="input" id="gTag" maxlength="4" placeholder="SN"></div>' +
        '<div class="field"><label>简介</label><textarea class="textarea" id="gIntro" maxlength="120" placeholder="你们守什么，收什么人。"></textarea></div>' +
        '<button class="btn btn-primary" id="gCreate" type="button">创建</button></div>',
      mount(root) {
        root.querySelector("#gCreate").addEventListener("click", () => {
          const r = S.createGuild({
            name: root.querySelector("#gName").value,
            tag: root.querySelector("#gTag").value,
            intro: root.querySelector("#gIntro").value,
          });
          if (!r.ok) return toast(r.msg, "err");
          toast("公会已创建", "ok");
          location.hash = "#/guild/" + r.guild.id;
        });
      },
    };
  }

  function guildDetail(id) {
    const g = S.guild(id);
    if (!g) return { html: empty("公会不存在") };
    const me = S.me();
    const mine = me ? S.myGuild(me.id) : null;
    const isMember = !!mine && mine.id === g.id;
    const isOwner = !!me && g.owner === me.id;
    const owner = S.user(g.owner);
    const msgs = S.guildMessages(id);
    const members = g.members
      .map((uid) => ({ u: S.user(uid), pos: g.positions[uid] || "member" }))
      .filter((x) => x.u)
      .sort((a, b) => {
        const rank = { leader: 0, vice: 1, elite: 2, member: 3 };
        return rank[a.pos] - rank[b.pos] || a.u.id - b.u.id;
      });

    return {
      html:
        '<a class="small muted" href="#/guilds">← 公会大厅</a>' +
        '<div class="guild-banner" style="margin-top:16px"><div class="row" style="gap:16px;flex-wrap:wrap">' +
        '<span class="guild-emblem" style="width:68px;height:68px;font-size:26px">' +
        esc(g.tag) +
        "</span><div style=\"flex:1;min-width:200px\"><div class=\"guild-title\"><h1 style=\"font-size:30px\">" +
        esc(g.name) +
        '</h1><span class="guild-tag">' +
        esc(g.tag) +
        '</span></div><p class="muted" style="margin:6px 0 0">' +
        esc(g.intro) +
        '</p><div class="guild-meta"><span>会长 ' +
        esc(owner ? owner.nickname : "未知") +
        "</span><span>" +
        g.members.length +
        " / 60 人</span><span>创建于 " +
        fmtDate(g.createdAt) +
        "</span></div></div>" +
        '<div class="row" style="gap:8px">' +
        (isMember
          ? '<a class="btn btn-primary btn-sm" href="#/messages/guild">公会消息</a>' +
            (isOwner
              ? ""
              : '<button class="btn btn-ghost btn-sm" id="leaveGuild">退出公会</button>')
          : me && me.qq
          ? '<button class="btn btn-primary btn-sm" id="joinGuild">加入公会</button>'
          : '<a class="btn btn-ghost btn-sm" href="#/me">绑定 QQ 后加入</a>') +
        (isOwner ? '<button class="btn btn-ghost btn-sm" id="editNotice">编辑公告</button>' : "") +
        "</div></div></div>" +

        '<div class="grid-2" style="align-items:start;grid-template-columns:1.1fr .9fr">' +
        '<div class="card" style="padding:22px"><h3 style="margin-bottom:12px">公会公告</h3>' +
        '<p class="dim" style="margin:0;white-space:pre-wrap">' +
        esc(g.notice || "暂无公告。") +
        "</p>" +
        '<div class="divider" style="margin:18px 0"></div>' +
        '<h3 style="margin-bottom:10px">成员 · ' +
        members.length +
        "</h3>" +
        '<div id="memberList">' +
        members
          .map(
            (m) =>
              '<div class="member-row">' +
              '<a href="#/u/' +
              m.u.id +
              '">' +
              avatar(m.u, "avatar-sm") +
              "</a>" +
              '<div><a href="#/u/' +
              m.u.id +
              '"><b style="font-size:13.5px">' +
              esc(m.u.nickname) +
              "</b></a>" +
              '<div class="small muted">' +
              (m.u.qualification ? "已获资格" : "待审核") +
              " · " +
              timeAgo(m.u.lastSeen) +
              "活跃</div></div>" +
              (isOwner && m.u.id !== me.id
                ? '<select class="select" data-pos="' +
                  m.u.id +
                  '" style="width:104px;padding:5px 8px;font-size:12px">' +
                  window.SEED.POSITIONS.filter((p) => p.id !== "leader")
                    .map((p) => '<option value="' + p.id + '"' + (m.pos === p.id ? " selected" : "") + ">" + p.name + "</option>")
                    .join("") +
                  "</select>"
                : '<span class="pos-badge pos-' + m.pos + '">' + S.posName(m.pos) + "</span><span></span>") +
              "</div>"
          )
          .join("") +
        "</div></div>" +

        '<div class="card" style="padding:0;overflow:hidden">' +
        '<div class="chat"><div class="chat-head"><span>公会频道</span><span class="small muted">' +
        (isMember ? "仅成员可见" : "加入后可发言") +
        "</span></div>" +
        '<div class="chat-body" id="guildChat">' +
        (msgs.length
          ? msgs
              .map((m) => {
                const u = S.user(m.author);
                return (
                  '<div class="msg"><a href="#/u/' +
                  m.author +
                  '">' +
                  avatar(u, "avatar-sm") +
                  '</a><div><div class="msg-name">' +
                  esc(u ? u.nickname : "已注销") +
                  '</div><div class="msg-bubble">' +
                  md(m.body) +
                  '</div></div><span class="msg-time">' +
                  timeAgo(m.at) +
                  "</span></div>"
                );
              })
              .join("")
          : empty("频道还很安静")) +
        "</div>" +
        (isMember
          ? '<div class="chat-foot"><input class="input" id="guildMsg" maxlength="300" placeholder="对公会成员说点什么…"><button class="btn btn-primary btn-sm" id="guildSend">发送</button></div>'
          : '<div class="chat-foot"><span class="small muted">加入公会后才能发言。</span></div>') +
        "</div></div></div>",

      mount(root) {
        const join = root.querySelector("#joinGuild");
        if (join)
          join.addEventListener("click", () => {
            const r = S.joinGuild(id);
            if (!r.ok) return toast(r.msg, "err");
            toast("已加入公会", "ok");
            window.App.render();
          });

        const leave = root.querySelector("#leaveGuild");
        if (leave)
          leave.addEventListener("click", () =>
            UI.confirm("退出该公会？每个账号只能加入一个公会。", () => {
              const r = S.leaveGuild(id);
              if (!r.ok) return toast(r.msg, "err");
              toast("已退出", "ok");
              window.App.render();
            })
          );

        root.querySelectorAll("[data-pos]").forEach((sel) => {
          sel.addEventListener("change", () => {
            const r = S.setPosition(id, Number(sel.dataset.pos), sel.value);
            if (!r.ok) return toast(r.msg, "err");
            toast("职位已调整", "ok");
          });
        });

        const edit = root.querySelector("#editNotice");
        if (edit)
          edit.addEventListener("click", () => {
            modal({
              title: "公会公告",
              body: '<textarea class="textarea" id="noticeText" maxlength="120">' + esc(g.notice || "") + "</textarea>",
              foot: '<button class="btn btn-ghost btn-sm" data-cancel>取消</button><button class="btn btn-primary btn-sm" data-save>保存</button>',
              onMount(mask, close) {
                mask.querySelector("[data-cancel]").addEventListener("click", close);
                mask.querySelector("[data-save]").addEventListener("click", () => {
                  g.notice = mask.querySelector("#noticeText").value.trim();
                  S.save();
                  close();
                  window.App.render();
                });
              },
            });
          });

        const send = root.querySelector("#guildSend");
        if (send) {
          const input = root.querySelector("#guildMsg");
          const doSend = () => {
            const r = S.sendGuildMessage(id, input.value);
            if (!r.ok) return toast(r.msg, "err");
            input.value = "";
            window.App.render();
            setTimeout(() => {
              const box = document.getElementById("guildChat");
              if (box) box.scrollTop = box.scrollHeight;
            }, 60);
          };
          send.addEventListener("click", doSend);
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") doSend();
          });
        }
      },
    };
  }

  /* ------------------------------ 体验资格 ------------------------------ */
  function apply() {
    const me = S.me();
    if (!me) {
      return {
        html:
          '<div class="card center" style="padding:70px 24px;max-width:640px;margin:0 auto"><div class="eyebrow" style="justify-content:center">Access</div>' +
          '<h1 style="font-size:36px">体验资格</h1><p class="muted" style="margin:12px 0 22px">登录并绑定 QQ 后提交申请，管理员会在 3 个工作日内审批。</p>' +
          '<a class="btn btn-primary" href="#/login?next=' +
          encodeURIComponent("#/apply") +
          '">登录 / 注册</a></div>',
      };
    }
    if (!me.qq) {
      return {
        html:
          '<div class="card center" style="padding:70px 24px;max-width:640px;margin:0 auto"><h1 style="font-size:34px">还差一步</h1>' +
          '<p class="muted" style="margin:12px 0 22px">申请体验资格需要先绑定 QQ，用于发放测试资格。</p>' +
          '<a class="btn btn-primary" href="#/me">去绑定 QQ</a></div>',
      };
    }
    const app = S.myApplication(me.id);
    if (me.qualification) {
      return {
        html:
          '<div class="card center" style="padding:70px 24px;max-width:680px;margin:0 auto"><div class="badge badge-gold" style="margin-bottom:14px">已通过</div>' +
          "<h1 style=\"font-size:34px\">资格已发放</h1>" +
          '<p class="muted" style="margin:12px 0 8px">工号</p><div class="mono" style="font-size:40px;color:#ffd9a0;letter-spacing:.14em">' +
          esc(me.workId || "W-XXXX") +
          "</div><p class=\"small muted\" style=\"margin-top:16px\">启动器下载与测试安排将通过系统消息通知。</p>" +
          '<div class="row" style="justify-content:center;margin-top:20px"><a class="btn btn-ghost" href="#/messages/sys">查看系统消息</a><a class="btn btn-primary" href="#/forum">去论坛</a></div></div>',
      };
    }
    if (app && app.status === "pending") {
      return {
        html:
          '<div class="card center" style="padding:70px 24px;max-width:680px;margin:0 auto"><div class="badge" style="margin-bottom:14px">审核中</div>' +
          "<h1 style=\"font-size:34px\">申请已提交</h1>" +
          '<p class="muted" style="margin:12px 0">' +
          fmtDate(app.at, true) +
          " 提交 · 管理员将在 3 个工作日内处理</p>" +
          '<div class="card" style="text-align:left;margin-top:18px;background:rgba(20,6,9,.5)"><div class="small muted">申请理由</div><p style="margin:6px 0 0">' +
          md(app.reason) +
          "</p></div>" +
          '<div class="row" style="justify-content:center;margin-top:20px"><a class="btn btn-ghost" href="#/messages/sys">查看系统消息</a></div></div>',
      };
    }
    if (!S.settings().applyOpen) {
      return {
        html:
          '<div class="card center" style="padding:70px 24px;max-width:640px;margin:0 auto"><div class="badge badge-dim" style="margin-bottom:14px">已关闭</div>' +
          "<h1 style=\"font-size:34px\">通道暂未开放</h1><p class=\"muted\" style=\"margin:12px 0 0\">关注公告，下一批名额开放时会第一时间通知。</p></div>",
      };
    }
    return {
      html:
        '<div class="page-head"><div class="eyebrow">Access</div><h1>申请体验资格</h1><p>填写理由，管理员会亲自看。通过后系统消息会发送工号。</p></div>' +
        '<div class="grid-2" style="align-items:start;max-width:980px">' +
        '<div class="card" style="padding:26px"><div class="field"><label>QQ（已绑定：' +
        esc(me.qq) +
        '）</label><input class="input" id="apQQ" value="' +
        UI.escAttr(me.qq) +
        '" readonly></div>' +
        '<div class="field"><label>申请理由（至少 10 字）</label><textarea class="textarea" id="apReason" maxlength="500" placeholder="你想测试什么？能提供哪些反馈？"></textarea></div>' +
        '<button class="btn btn-primary" id="apSubmit" type="button">提交申请</button>' +
        '<p class="hint" style="margin-top:12px">提交后不可修改；未通过可以重新申请。</p></div>' +
        '<div class="card" style="padding:26px"><h3>审批说明</h3>' +
        '<div class="small muted" style="line-height:2;margin-top:10px">· 优先通过能提供完整任务日志的申请；<br>· 同一账号同时只能有一份待审申请；<br>· 结果通过系统消息通知，请注意查收；<br>· 违规账号会被取消资格。</div>' +
        '<div class="divider"></div><div class="row"><span class="badge badge-gold">首批 500 名额</span><span class="badge">已开放</span></div></div></div>',
      mount(root) {
        root.querySelector("#apSubmit").addEventListener("click", () => {
          const r = S.apply({ qq: me.qq, reason: root.querySelector("#apReason").value });
          if (!r.ok) return toast(r.msg, "err");
          toast("申请已提交", "ok");
          window.App.render();
        });
      },
    };
  }

  /* ------------------------------ 登录 / 注册 ------------------------------ */
  function auth(mode, next) {
    const isReg = mode === "register";
    return {
      html:
        '<div class="auth-wrap"><div class="auth-side">' +
        '<div class="eyebrow">Account</div><h1>进入基地</h1>' +
        '<p>注册后即可关注他人、加入公会、申请体验资格。<br>第一位注册的账号将自动成为超级管理员。</p>' +
        '<div class="quote" style="font-size:19px;margin-top:30px">“ 活着回来，<em>就是玩法</em>。 ”</div></div>' +
        '<div class="card auth-card">' +
        "<h2>" +
        (isReg ? "注册账号" : "登录") +
        "</h2><p class=\"small muted\">" +
        (isReg ? "取一个代号，别用真名。" : "欢迎回来，驭鬼者。") +
        "</p>" +
        '<div class="auth-tabs"><a class="auth-tab ' +
        (!isReg ? "is-on" : "") +
        '" href="#/login' +
        (next ? "?next=" + encodeURIComponent(next) : "") +
        '">登录</a><a class="auth-tab ' +
        (isReg ? "is-on" : "") +
        '" href="#/register' +
        (next ? "?next=" + encodeURIComponent(next) : "") +
        '">注册</a></div>' +
        (isReg
          ? '<div class="field"><label>账号（3–16 位字母/数字/下划线）</label><input class="input" id="rUser" autocomplete="username" placeholder="例如：shenye"></div>' +
            '<div class="field"><label>昵称（1–16 字）</label><input class="input" id="rNick" maxlength="16" placeholder="论坛里显示的名字"></div>' +
            '<div class="field"><label>密码（至少 6 位）</label><input class="input" id="rPwd" type="password" autocomplete="new-password"></div>' +
            '<div class="field"><label>确认密码</label><input class="input" id="rPwd2" type="password" autocomplete="new-password"></div>'
          : '<div class="field"><label>账号</label><input class="input" id="lUser" autocomplete="username" placeholder="账号"></div>' +
            '<div class="field"><label>密码</label><input class="input" id="lPwd" type="password" autocomplete="current-password" placeholder="密码"></div>') +
        '<div class="error-text" id="authErr"></div>' +
        '<button class="btn btn-primary btn-block" id="authSubmit" type="button">' +
        (isReg ? "注册并进入" : "登录") +
        "</button>" +
        '<p class="hint" style="margin-top:14px;text-align:center">' +
        (isReg
          ? '已有账号？<a class="link" href="#/login">直接登录</a>'
          : '还没有账号？<a class="link" href="#/register">注册</a>') +
        "</p></div></div>",
      mount(root) {
        const err = root.querySelector("#authErr");
        const go = () => {
          const target = next || "#/";
          location.hash = target;
        };
        const submit = () => {
          err.textContent = "";
          if (isReg) {
            const pwd = root.querySelector("#rPwd").value;
            if (pwd !== root.querySelector("#rPwd2").value) return (err.textContent = "两次密码不一致");
            const r = S.register({
              username: root.querySelector("#rUser").value,
              nickname: root.querySelector("#rNick").value,
              password: pwd,
            });
            if (!r.ok) return (err.textContent = r.msg);
            toast("注册成功", "ok");
            window.App.refreshNav();
            go();
          } else {
            const r = S.login(root.querySelector("#lUser").value, root.querySelector("#lPwd").value);
            if (!r.ok) return (err.textContent = r.msg);
            toast("欢迎回来，" + r.user.nickname, "ok");
            window.App.refreshNav();
            go();
          }
        };
        root.querySelector("#authSubmit").addEventListener("click", submit);
        root.querySelectorAll("input").forEach((i) =>
          i.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submit();
          })
        );
      },
    };
  }

  /* ------------------------------ 个人设置 ------------------------------ */
  function me() {
    const u = S.me();
    if (!u) {
      location.hash = "#/login?next=" + encodeURIComponent("#/me");
      return { html: "" };
    }
    const guild = S.myGuild(u.id);
    const app = S.myApplication(u.id);
    return {
      html:
        '<div class="page-head"><div class="eyebrow">Account</div><h1>个人设置</h1><p>头像、昵称与 QQ 绑定。</p></div>' +
        '<div class="grid-2" style="align-items:start;grid-template-columns:.9fr 1.1fr">' +
        '<div class="card" style="padding:26px"><div class="row" style="gap:16px">' +
        avatar(u, "avatar-xl avatar-ring") +
        '<div><h3 style="font-size:21px">' +
        esc(u.nickname) +
        '</h3><div class="small muted">@' +
        esc(u.username) +
        " · " +
        (u.role === "super" ? "超级管理员" : u.role === "admin" ? "管理员" : "驭鬼者") +
        "</div><div class=\"row\" style=\"margin-top:8px;gap:6px\">" +
        (u.qq ? '<span class="badge">QQ 已绑定</span>' : '<span class="badge badge-dim">未绑定 QQ</span>') +
        (u.qualification ? '<span class="badge badge-gold">已获资格</span>' : "") +
        "</div></div></div>" +
        '<div class="divider"></div>' +
        '<div class="field"><label>头像</label><div class="row wrap" id="avatarPick" style="gap:8px">' +
        window.SEED.AVATARS.map(
          (a, i) =>
            '<button type="button" class="avatar" data-av="' +
            i +
            '" style="background:linear-gradient(140deg,' +
            a[0] +
            "," +
            a[1] +
            ");" +
            (i === u.avatar ? "box-shadow:0 0 0 2px #c31f2a" : "") +
            '">' +
            esc(Array.from(u.nickname)[0] || "?") +
            "</button>"
        ).join("") +
        '</div></div><div class="field"><label>昵称</label><input class="input" id="meNick" maxlength="16" value="' + UI.escAttr(u.nickname) + '"></div>' +
        '<div class="field"><label>QQ（绑定后才能发帖、加入公会、申请资格）</label><input class="input" id="meQQ" value="' + UI.escAttr(u.qq || "") + '" placeholder="5–12 位数字"></div>' +
        '<div class="field"><label>签名</label><input class="input" id="meBio" maxlength="80" value="' + UI.escAttr(u.bio || "") + '" placeholder="一句话"></div>' +
        '<button class="btn btn-primary" id="meSave" type="button">保存资料</button></div>' +

        '<div class="stack">' +
        '<div class="card" style="padding:22px"><div class="row-between"><h3>账号状态</h3><a class="small muted" href="#/u/' + u.id + '">查看主页 →</a></div>' +
        '<div class="row" style="gap:26px;margin-top:14px;flex-wrap:wrap">' +
        '<div><span class="small muted">公会</span><div>' + (guild ? '<a class="link" href="#/guild/' + guild.id + '">' + esc(guild.name) + "</a>" : "未加入") + "</div></div>" +
        '<div><span class="small muted">体验资格</span><div>' + (u.qualification ? "已通过" : app ? (app.status === "pending" ? "审核中" : app.status === "rejected" ? "未通过" : "已通过") : "未申请") + "</div></div>" +
        '<div><span class="small muted">关注 / 粉丝</span><div>' + S.following(u.id).length + " / " + S.followers(u.id).length + "</div></div></div>" +
        '<div class="divider"></div><div class="row wrap"><a class="btn btn-ghost btn-sm" href="#/messages/dm">消息中心</a><a class="btn btn-ghost btn-sm" href="#/apply">体验资格</a>' +
        (S.isAdmin(u) ? '<a class="btn btn-gold btn-sm" href="#/admin">管理后台</a>' : "") +
        '<button class="btn btn-ghost btn-sm" id="logoutBtn">退出登录</button></div></div>' +
        '<div class="card" style="padding:22px"><h3>修改密码</h3><div class="field" style="margin-top:12px"><label>原密码</label><input class="input" id="pOld" type="password"></div>' +
        '<div class="field"><label>新密码</label><input class="input" id="pNew" type="password"></div>' +
        '<button class="btn btn-ghost btn-sm" id="pSave" type="button">更新密码</button></div>' +
        '<div class="card" style="padding:22px;border-color:rgba(255,80,80,.25)"><h3>删除账号</h3>' +
        '<p class="small muted" style="margin:6px 0 12px">注销后，你的帖子、回复、私信、关注与公会成员身份将被一并删除，且无法恢复。会长注销时会自动转让会长。</p>' +
        '<button class="btn btn-ghost btn-sm" id="delAccount" type="button" style="border-color:rgba(255,80,80,.35);color:#ff9a94">删除账号</button></div>' +
        "</div></div>",
      mount(root) {
        root.querySelectorAll("[data-av]").forEach((b) => {
          b.addEventListener("click", () => {
            S.updateUser(u.id, { avatar: Number(b.dataset.av) });
            window.App.render();
          });
        });
        root.querySelector("#meSave").addEventListener("click", () => {
          const r = S.updateUser(u.id, {
            nickname: root.querySelector("#meNick").value,
            qq: root.querySelector("#meQQ").value,
            bio: root.querySelector("#meBio").value,
          });
          if (!r.ok) return toast(r.msg, "err");
          toast("已保存", "ok");
          window.App.refreshNav();
          window.App.render();
        });
        root.querySelector("#logoutBtn").addEventListener("click", () => {
          S.logout();
          toast("已退出", "ok");
          window.App.refreshNav();
          location.hash = "#/";
        });
        root.querySelector("#pSave").addEventListener("click", () => {
          const r = S.setPassword(u.id, root.querySelector("#pOld").value, root.querySelector("#pNew").value);
          if (!r.ok) return toast(r.msg, "err");
          toast("密码已更新", "ok");
          root.querySelector("#pOld").value = "";
          root.querySelector("#pNew").value = "";
        });
        root.querySelector("#delAccount").addEventListener("click", () => {
          modal({
            title: "删除账号",
            body:
              '<p style="margin:0 0 14px;color:#ffb3ad">此操作不可撤销。账号下的帖子、回复、私信、关注和公会身份都会被删除。</p>' +
              '<div class="field"><label>输入密码确认</label><input class="input" id="delPwd" type="password" autocomplete="current-password"></div>' +
              '<div class="field"><label>输入「删除」确认</label><input class="input" id="delWord" placeholder="删除"></div>' +
              '<div class="error-text" id="delErr"></div>',
            foot:
              '<button class="btn btn-ghost btn-sm" data-cancel>取消</button>' +
              '<button class="btn btn-primary btn-sm" data-del style="background:linear-gradient(135deg,#d0242f,#7c0f18)">确认删除</button>',
            onMount(mask, close) {
              mask.querySelector("[data-cancel]").addEventListener("click", close);
              mask.querySelector("[data-del]").addEventListener("click", () => {
                const err = mask.querySelector("#delErr");
                if (mask.querySelector("#delWord").value.trim() !== "删除") {
                  err.textContent = "请输入「删除」两个字";
                  return;
                }
                const r = S.deleteAccount(u.id, { password: mask.querySelector("#delPwd").value });
                if (!r.ok) {
                  err.textContent = r.msg;
                  return;
                }
                close();
                S.logout();
                toast("账号已注销", "ok");
                window.App.refreshNav();
                location.hash = "#/";
                setTimeout(() => window.App.render(), 30);
              });
            },
          });
        });
      },
    };
  }

  /* ------------------------------ 他人主页 ------------------------------ */
  function profile(id, tab) {
    const u = S.user(id);
    if (!u) return { html: empty("用户不存在") };
    const me = S.me();
    const isMe = me && me.id === u.id;
    const following = me ? S.isFollowing(me.id, u.id) : false;
    const friend = me ? S.isFriend(me.id, u.id) : false;
    const guild = S.myGuild(u.id);
    const posts = S.posts({ author: u.id });
    const followers = S.followers(u.id);
    const followingList = S.following(u.id);
    const friends = S.friends(u.id);
    tab = tab || "posts";

    const tabs = [
      ["posts", "帖子", posts.length],
      ["guild", "公会", guild ? 1 : 0],
      ["friends", "好友", friends.length],
      ["followers", "粉丝", followers.length],
      ["following", "关注", followingList.length],
    ];

    const body =
      tab === "posts"
        ? '<div class="card" style="padding:6px 14px">' + (posts.length ? posts.map(postRow).join("") : empty("还没有发帖")) + "</div>"
        : tab === "guild"
        ? guild
          ? '<a class="card card-hover guild-card" href="#/guild/' + guild.id + '"><span class="guild-emblem">' + esc(guild.tag) + "</span><div class=\"guild-body\"><h3>" + esc(guild.name) + '</h3><p class="guild-desc">' + esc(guild.intro) + "</p></div></a>"
          : empty("未加入任何公会")
        : tab === "friends"
        ? userGrid(friends, "还没有好友。互相关注后自动成为好友。")
        : tab === "followers"
        ? userGrid(followers, "还没有粉丝")
        : userGrid(followingList, "还没有关注任何人");

    return {
      html:
        '<div class="profile-head"><div class="profile-main">' +
        avatar(u, "avatar-xl avatar-ring") +
        '<div class="profile-info"><div class="profile-name"><h1>' +
        esc(u.nickname) +
        "</h1>" +
        (u.role === "super" ? '<span class="badge badge-gold">超级管理员</span>' : u.role === "admin" ? '<span class="badge badge-gold">管理员</span>' : "") +
        (u.qualification ? '<span class="badge">已获资格</span>' : "") +
        (friend ? '<span class="badge badge-red">好友</span>' : "") +
        '</div><div class="small muted">@' +
        esc(u.username) +
        " · 加入于 " +
        fmtDate(u.createdAt) +
        "</div>" +
        '<p class="profile-bio">' +
        esc(u.bio || "这个人很安静，什么都没留下。") +
        "</p>" +
        '<div class="profile-stats"><div><b>' +
        posts.length +
        "</b><span>帖子</span></div><div><b>" +
        followers.length +
        "</b><span>粉丝</span></div><div><b>" +
        followingList.length +
        "</b><span>关注</span></div><div><b>" +
        friends.length +
        "</b><span>好友</span></div></div></div>" +
        '<div class="profile-actions">' +
        (isMe
          ? '<a class="btn btn-ghost" href="#/me">编辑资料</a>'
          : me
          ? '<button class="btn ' +
            (following ? "btn-ghost" : "btn-primary") +
            '" id="followBtn">' +
            (following ? (friend ? "已是好友" : "已关注") : "+ 关注") +
            "</button>" +
            '<a class="btn btn-ghost" href="#/messages/dm/' +
            u.id +
            '">私信</a>'
          : '<a class="btn btn-primary" href="#/login?next=' +
            encodeURIComponent("#/u/" + u.id) +
            '">登录后关注</a>') +
        (me && S.isAdmin(me) && !isMe ? '<button class="btn btn-ghost" id="sysMsg">发系统消息</button>' : "") +
        "</div></div></div>" +
        '<div class="tabs">' +
        tabs
          .map(
            (t) =>
              '<a class="tab ' +
              (tab === t[0] ? "is-on" : "") +
              '" href="#/u/' +
              u.id +
              (t[0] === "posts" ? "" : "/" + t[0]) +
              '">' +
              t[1] +
              ' <span class="n">' +
              t[2] +
              "</span></a>"
          )
          .join("") +
        "</div>" +
        body,
      mount(root) {
        const f = root.querySelector("#followBtn");
        if (f)
          f.addEventListener("click", () => {
            const r = S.toggleFollow(me.id, u.id);
            if (!r.ok) return toast(r.msg, "err");
            toast(r.following ? (S.isFriend(me.id, u.id) ? "你们成为好友" : "已关注") : "已取消关注", "ok");
            window.App.render();
          });
        const sys = root.querySelector("#sysMsg");
        if (sys)
          sys.addEventListener("click", () => {
            modal({
              title: "给 " + u.nickname + " 发系统消息",
              body: '<textarea class="textarea" id="sysText" maxlength="300" placeholder="这条消息会出现在对方的系统消息里。"></textarea>',
              foot: '<button class="btn btn-ghost btn-sm" data-cancel>取消</button><button class="btn btn-primary btn-sm" data-send>发送</button>',
              onMount(mask, close) {
                mask.querySelector("[data-cancel]").addEventListener("click", close);
                mask.querySelector("[data-send]").addEventListener("click", () => {
                  const r = S.sendSystem(u.id, mask.querySelector("#sysText").value);
                  if (!r.ok) return toast(r.msg, "err");
                  close();
                  toast("已发送", "ok");
                });
              },
            });
          });
      },
    };
  }

  function userGrid(list, emptyText) {
    if (!list.length) return '<div class="card">' + empty(emptyText) + "</div>";
    return (
      '<div class="grid-3">' +
      list
        .map(
          (u) =>
            '<a class="card card-hover" style="padding:18px;display:flex;gap:12px;align-items:center" href="#/u/' +
            u.id +
            '">' +
            avatar(u, "avatar-ring") +
            "<div><b>" +
            esc(u.nickname) +
            '</b><div class="small muted">' +
            (S.isFriend(Store.me() ? Store.me().id : 0, u.id) ? "好友" : "") +
            " " +
            S.followers(u.id).length +
            " 粉丝</div></div></a>"
        )
        .join("") +
      "</div>"
    );
  }

  window.Views = {
    home,
    world,
    gameplay,
    news,
    newsDetail,
    forum,
    postNew,
    postDetail,
    guilds,
    guildNew,
    guildDetail,
    apply,
    auth,
    me,
    profile,
  };
})();
