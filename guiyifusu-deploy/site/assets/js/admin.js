/* 管理后台 */
(function () {
  const { esc, escAttr, avatar, timeAgo, fmtDate, toast, modal, confirm, empty } = window.UI;
  const S = window.Store;
  const { CATEGORIES, POSITIONS } = window.SEED;

  const MODULES = [
    { id: "", name: "数据概览", icon: "shield" },
    { id: "users", name: "用户管理", icon: "users" },
    { id: "apps", name: "体验资格", icon: "key" },
    { id: "announcements", name: "公告管理", icon: "scroll" },
    { id: "posts", name: "帖子管理", icon: "message" },
    { id: "words", name: "违禁词", icon: "alert" },
    { id: "dms", name: "私信审查", icon: "eye" },
    { id: "settings", name: "站点设置", icon: "settings" },
  ];

  function guard() {
    const me = S.me();
    if (!me) {
      location.hash = "#/login?next=" + encodeURIComponent("#/admin");
      return null;
    }
    if (!S.isAdmin(me)) {
      return {
        html:
          '<div class="card center" style="padding:70px 24px"><div class="badge badge-red" style="margin-bottom:12px">403</div><h1 style="font-size:32px">无权进入</h1><p class="muted" style="margin:12px 0 20px">只有管理员可以访问后台。第一位注册的账号自动成为超级管理员。</p><a class="btn btn-primary" href="#/">返回首页</a></div>',
      };
    }
    return null;
  }

  function shell(me, active, body, mount) {
    const pending = S.stats().pending;
    const html =
      '<div class="page-head"><div class="eyebrow">Admin</div><h1>管理后台</h1><p>' +
      (me.role === "super" ? "超级管理员" : "管理员") +
      " · " +
      esc(me.nickname) +
      "</p></div>" +
      '<div class="admin-layout"><aside class="card admin-side">' +
      MODULES.map(
        (m) =>
          '<a class="' +
          (active === m.id ? "is-on" : "") +
          '" href="#/admin' +
          (m.id ? "/" + m.id : "") +
          '">' +
          window.Icon(m.icon) +
          "<span>" +
          m.name +
          "</span>" +
          (m.id === "apps" && pending ? '<span class="badge badge-red" style="margin-left:auto">' + pending + "</span>" : "") +
          "</a>"
      ).join("") +
      '<div class="sep"></div><a href="#/">← 返回站点</a></aside><div>' +
      body +
      "</div></div>";
    return { html, mount: mount || null };
  }

  /* ------------------------------ 概览 ------------------------------ */
  function dashboard(me) {
    const st = S.stats();
    const apps = S.applications().filter((a) => a.status === "pending");
    const posts = S.posts().slice(0, 6);
    const cards = [
      ["注册用户", st.users, "users"],
      ["帖子", st.posts, "message"],
      ["回复", st.replies, "chat"],
      ["公会", st.guilds, "crown"],
      ["待审资格", st.pending, "key"],
      ["公告", st.announcements, "scroll"],
    ];
    return shell(
      me,
      "",
      '<div class="grid-3" style="margin-bottom:22px">' +
        cards
          .map(
            (c) =>
              '<div class="card stat-card"><div class="row-between"><b class="mono">' +
              c[1] +
              "</b><span style=\"color:rgba(220,120,120,.5)\">" +
              window.Icon(c[2]) +
              '</span></div><span>' +
              c[0] +
              "</span></div>"
          )
          .join("") +
        "</div>" +
        '<div class="grid-2" style="align-items:start">' +
        '<div class="card admin-card"><div class="row-between"><h3>待审批资格</h3><a class="small muted" href="#/admin/apps">全部 →</a></div>' +
        (apps.length
          ? apps
              .slice(0, 4)
              .map((a) => {
                const u = S.user(a.user);
                return (
                  '<div class="row-between" style="padding:12px 0;border-top:1px solid var(--line)"><div class="row">' +
                  avatar(u, "avatar-sm") +
                  '<div><b style="font-size:13px">' +
                  esc(u ? u.nickname : "?") +
                  '</b><div class="small muted">' +
                  timeAgo(a.at) +
                  "</div></div></div>" +
                  '<button class="btn btn-primary btn-sm" data-approve="' +
                  a.id +
                  '">审批</button></div>'
                );
              })
              .join("")
          : empty("没有待审批的申请")) +
        "</div>" +
        '<div class="card admin-card"><div class="row-between"><h3>最近帖子</h3><a class="small muted" href="#/admin/posts">全部 →</a></div>' +
        posts
          .map(
            (p) =>
              '<div class="row-between" style="padding:10px 0;border-top:1px solid var(--line)"><a class="small" href="#/forum/p/' +
              p.id +
              '" style="max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e7d6ce">' +
              esc(p.title) +
              '</a><span class="small muted">' +
              timeAgo(p.at) +
              "</span></div>"
          )
          .join("") +
        "</div>" +
        "</div>" +
        '<div class="card admin-card" style="margin-top:18px"><h3>快捷操作</h3><div class="row wrap" style="margin-top:12px">' +
        '<a class="btn btn-ghost btn-sm" href="#/admin/apps">审批资格</a>' +
        '<a class="btn btn-ghost btn-sm" href="#/admin/announcements">发布公告</a>' +
        '<a class="btn btn-ghost btn-sm" href="#/admin/words">违禁词</a>' +
        '<a class="btn btn-ghost btn-sm" href="#/admin/dms">私信审查</a>' +
        "</div></div>",
      dashboardMount
    );
  }

  function dashboardMount(root) {
    root.querySelectorAll("[data-approve]").forEach((b) =>
      b.addEventListener("click", () => {
        location.hash = "#/admin/apps";
      })
    );
  }

  /* ------------------------------ 用户 ------------------------------ */
  function users(me, q) {
    const list = S.load()
      .users.slice()
      .filter((u) => !q || (u.nickname + u.username + (u.qq || "")).toLowerCase().indexOf(String(q).toLowerCase()) > -1)
      .sort((a, b) => b.createdAt - a.createdAt);
    return shell(
      me,
      "users",
      '<div class="card admin-card"><div class="admin-toolbar"><input class="input" id="userSearch" placeholder="搜索昵称 / 账号 / QQ" value="' +
        escAttr(q || "") +
        '"><button class="btn btn-ghost btn-sm" id="userSearchBtn">搜索</button><span class="small muted">共 ' +
        list.length +
        " 人</span></div>" +
        '<div class="table-wrap"><table class="table"><thead><tr><th>用户</th><th>QQ</th><th>权限</th><th>公会</th><th>资格</th><th>加入</th><th>操作</th></tr></thead><tbody>' +
        list
          .map((u) => {
            const g = S.myGuild(u.id);
            return (
              "<tr><td><div class=\"user-cell\">" +
              avatar(u, "avatar-sm") +
              '<div><a href="#/u/' +
              u.id +
              '"><b style="font-size:13px">' +
              esc(u.nickname) +
              '</b></a><div class="small muted">@' +
              esc(u.username) +
              "</div></div></div></td>" +
              "<td>" +
              (u.qq ? esc(u.qq) : '<span class="muted">未绑定</span>') +
              "</td>" +
              '<td><span class="badge ' +
              (u.role === "super" ? "badge-gold" : u.role === "admin" ? "badge-red" : "badge-dim") +
              '">' +
              (u.role === "super" ? "超管" : u.role === "admin" ? "管理员" : "用户") +
              "</span></td>" +
              "<td>" +
              (g ? esc(g.name) : '<span class="muted">—</span>') +
              "</td>" +
              "<td>" +
              (u.qualification ? '<span class="badge badge-gold">已通过</span>' : '<span class="muted">—</span>') +
              "</td>" +
              '<td class="small muted">' +
              fmtDate(u.createdAt) +
              "</td>" +
              '<td><div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-view="' +
              u.id +
              '">查看</button>' +
              (S.isSuper(me) && u.role !== "super"
                ? '<button class="btn btn-ghost btn-sm" data-role="' +
                  u.id +
                  '">' +
                  (u.role === "admin" ? "取消管理" : "设为管理") +
                  "</button>"
                : "") +
              (u.role !== "super" && u.id !== me.id && (S.isSuper(me) || u.role !== "admin")
                ? '<button class="btn btn-ghost btn-sm" data-deluser="' + u.id + '" style="color:#ff8a84">删除</button>'
                : "") +
              "</div></td></tr>"
            );
          })
          .join("") +
        "</tbody></table></div></div>",
      (root) => {
        root.querySelector("#userSearchBtn").addEventListener("click", () => {
          location.hash = "#/admin/users?q=" + encodeURIComponent(root.querySelector("#userSearch").value.trim());
        });
        root.querySelector("#userSearch").addEventListener("keydown", (e) => {
          if (e.key === "Enter") root.querySelector("#userSearchBtn").click();
        });
        root.querySelectorAll("[data-view]").forEach((b) =>
          b.addEventListener("click", () => userModal(Number(b.dataset.view)))
        );
        root.querySelectorAll("[data-role]").forEach((b) =>
          b.addEventListener("click", () => {
            const u = S.user(Number(b.dataset.role));
            confirm((u.role === "admin" ? "取消 " : "设置 ") + u.nickname + (u.role === "admin" ? " 的管理员权限？" : " 为管理员？"), () => {
              const r = S.setRole(u.id, u.role === "admin" ? "user" : "admin");
              if (!r.ok) return toast(r.msg, "err");
              toast("已更新权限", "ok");
              window.App.render();
            });
          })
        );
        root.querySelectorAll("[data-deluser]").forEach((b) =>
          b.addEventListener("click", () => {
            const u = S.user(Number(b.dataset.deluser));
            if (!u) return;
            modal({
              title: "删除账号 · " + u.nickname,
              body:
                '<p style="color:#ffb3ad;margin:0 0 10px">此操作不可撤销。该账号的帖子、回复、私信、关注与公会身份都会被删除。</p>' +
                '<p class="small muted">账号：@' + esc(u.username) + " · QQ " + esc(u.qq || "未绑定") + "</p>",
              foot:
                '<button class="btn btn-ghost btn-sm" data-cancel>取消</button>' +
                '<button class="btn btn-primary btn-sm" data-del style="background:linear-gradient(135deg,#d0242f,#7c0f18)">确认删除</button>',
              onMount(mask, close) {
                mask.querySelector("[data-cancel]").addEventListener("click", close);
                mask.querySelector("[data-del]").addEventListener("click", () => {
                  const r = S.deleteAccount(u.id);
                  if (!r.ok) return toast(r.msg, "err");
                  close();
                  toast("账号已删除", "ok");
                  window.App.render();
                });
              },
            });
          })
        );
      }
    );
  }

  function userModal(id) {
    const u = S.user(id);
    if (!u) return;
    const g = S.myGuild(id);
    const dms = S.adminDMs(id).slice(0, 12);
    const posts = S.posts({ author: id });
    modal({
      title: "账号信息 · " + u.nickname,
      wide: true,
      body:
        '<div class="row" style="gap:14px;margin-bottom:16px">' +
        avatar(u, "avatar-lg avatar-ring") +
        '<div><div class="row"><b style="font-size:18px">' +
        esc(u.nickname) +
        "</b>" +
        (u.role !== "user" ? '<span class="badge badge-gold">' + (u.role === "super" ? "超管" : "管理员") + "</span>" : "") +
        (u.qualification ? '<span class="badge">已获资格</span>' : "") +
        '</div><div class="small muted">@' +
        esc(u.username) +
        " · 注册于 " +
        fmtDate(u.createdAt, true) +
        "</div></div></div>" +
        '<div class="grid-3" style="gap:10px">' +
        [
          ["QQ", u.qq || "未绑定"],
          ["工号", u.workId || "—"],
          ["公会", g ? g.name : "—"],
          ["帖子", posts.length],
          ["关注", S.following(id).length],
          ["粉丝", S.followers(id).length],
        ]
          .map(
            (x) =>
              '<div class="card" style="padding:12px;box-shadow:none"><div class="small muted">' +
              x[0] +
              '</div><b style="font-size:15px">' +
              esc(String(x[1])) +
              "</b></div>"
          )
          .join("") +
        "</div>" +
        '<div class="divider" style="margin:18px 0"></div>' +
        '<div class="row-between"><h4 style="font-family:var(--font-ui);font-size:13px;letter-spacing:.1em;color:var(--muted)">最近私信</h4><a class="small muted" href="#/admin/dms?user=' +
        id +
        '">全部 →</a></div>' +
        '<div class="dm-peek" style="margin-top:10px">' +
        (dms.length
          ? dms
              .map((d) => {
                const other = S.user(d.from === id ? d.to : d.from);
                return (
                  '<div class="small" style="padding:8px 10px;border:1px solid var(--line);border-radius:8px"><span class="muted">' +
                  esc((S.user(d.from) || {}).nickname || "?") +
                  " → " +
                  esc(other ? other.nickname : "?") +
                  " · " +
                  fmtDate(d.at, true) +
                  "</span><div>" +
                  esc(d.body) +
                  "</div></div>"
                );
              })
              .join("")
          : '<div class="small muted">暂无私信</div>') +
        "</div>" +
        '<div class="field" style="margin-top:16px"><label>发送系统消息</label><textarea class="textarea" id="sysToUser" style="min-height:80px" placeholder="会出现在对方的系统消息中"></textarea></div>',
      foot:
        '<button class="btn btn-ghost btn-sm" data-close>关闭</button><button class="btn btn-primary btn-sm" data-send>发送系统消息</button>',
      onMount(mask, close) {
        mask.querySelector("[data-close]").addEventListener("click", close);
        mask.querySelector("[data-send]").addEventListener("click", () => {
          const r = S.sendSystem(id, mask.querySelector("#sysToUser").value);
          if (!r.ok) return toast(r.msg, "err");
          toast("已发送", "ok");
          mask.querySelector("#sysToUser").value = "";
        });
      },
    });
  }

  /* ------------------------------ 体验资格 ------------------------------ */
  function apps(me, filter) {
    const open = S.settings().applyOpen;
    const all = S.applications();
    filter = filter || "pending";
    const list = filter === "all" ? all : all.filter((a) => a.status === filter);
    const counts = {
      pending: all.filter((a) => a.status === "pending").length,
      approved: all.filter((a) => a.status === "approved").length,
      rejected: all.filter((a) => a.status === "rejected").length,
    };
    return shell(
      me,
      "apps",
      '<div class="card admin-card" style="margin-bottom:16px"><div class="row-between"><div><h3>申请通道</h3><div class="small muted">关闭后，用户将无法提交新的体验资格申请。</div></div>' +
        '<div class="row"><span class="small ' +
        (open ? "blood" : "muted") +
        '">' +
        (open ? "开放中" : "已关闭") +
        '</span><span class="switch ' +
        (open ? "is-on" : "") +
        '" id="applySwitch"></span></div></div></div>' +
        '<div class="card admin-card"><div class="forum-toolbar">' +
        '<a class="chip ' +
        (filter === "pending" ? "is-on" : "") +
        '" href="#/admin/apps">待审批 ' +
        counts.pending +
        "</a>" +
        '<a class="chip ' +
        (filter === "approved" ? "is-on" : "") +
        '" href="#/admin/apps?f=approved">已通过 ' +
        counts.approved +
        "</a>" +
        '<a class="chip ' +
        (filter === "rejected" ? "is-on" : "") +
        '" href="#/admin/apps?f=rejected">未通过 ' +
        counts.rejected +
        "</a>" +
        '<a class="chip ' +
        (filter === "all" ? "is-on" : "") +
        '" href="#/admin/apps?f=all">全部</a></div>' +
        (list.length
          ? list
              .map((a) => {
                const u = S.user(a.user);
                return (
                  '<div class="case-card"><div class="row-between"><div class="row">' +
                  avatar(u, "avatar-sm") +
                  '<div><b>' +
                  esc(u ? u.nickname : "?") +
                  '</b><div class="small muted">QQ ' +
                  esc(a.qq) +
                  " · " +
                  timeAgo(a.at) +
                  "</div></div></div>" +
                  '<span class="badge ' +
                  (a.status === "pending" ? "badge-red" : a.status === "approved" ? "badge-gold" : "badge-dim") +
                  '">' +
                  (a.status === "pending" ? "待审批" : a.status === "approved" ? "已通过" : "未通过") +
                  "</span></div>" +
                  '<p class="dim" style="margin:12px 0 0;font-size:13.5px;line-height:1.9">' +
                  esc(a.reason) +
                  "</p>" +
                  (a.note ? '<p class="small muted" style="margin:8px 0 0">备注：' + esc(a.note) + "</p>" : "") +
                  (a.status === "pending"
                    ? '<div class="row" style="margin-top:14px"><button class="btn btn-primary btn-sm" data-pass="' +
                      a.id +
                      '">通过</button><button class="btn btn-ghost btn-sm" data-reject="' +
                      a.id +
                      '">拒绝</button></div>'
                    : "") +
                  "</div>"
                );
              })
              .join("")
          : empty("没有符合条件的申请")) +
        "</div>",
      (root) => {
        const sw = root.querySelector("#applySwitch");
        if (sw)
          sw.addEventListener("click", () => {
            const v = !S.settings().applyOpen;
            S.setSetting("applyOpen", v);
            toast(v ? "申请通道已开放" : "申请通道已关闭", "ok");
            window.App.render();
          });

        const review = (id, status) => {
          modal({
            title: status === "approved" ? "通过申请" : "拒绝申请",
            body:
              '<div class="field"><label>备注（会发送给申请人）</label><textarea class="textarea" id="reviewNote" placeholder="' +
              (status === "approved" ? "例如：工号 W-0031，请查收系统消息。" : "例如：本批名额已满，下批优先。") +
              '"></textarea></div>',
            foot:
              '<button class="btn btn-ghost btn-sm" data-cancel>取消</button><button class="btn ' +
              (status === "approved" ? "btn-primary" : "btn-ghost") +
              ' btn-sm" data-ok>确认</button>',
            onMount(mask, close) {
              mask.querySelector("[data-cancel]").addEventListener("click", close);
              mask.querySelector("[data-ok]").addEventListener("click", () => {
                const r = S.reviewApp(id, status, mask.querySelector("#reviewNote").value);
                if (!r.ok) return toast(r.msg, "err");
                close();
                toast(status === "approved" ? "已通过" : "已拒绝", "ok");
                window.App.render();
              });
            },
          });
        };
        root.querySelectorAll("[data-pass]").forEach((b) => b.addEventListener("click", () => review(b.dataset.pass, "approved")));
        root.querySelectorAll("[data-reject]").forEach((b) => b.addEventListener("click", () => review(b.dataset.reject, "rejected")));
      }
    );
  }

  /* ------------------------------ 公告 ------------------------------ */
  function announcements(me) {
    const list = S.announcements();
    return shell(
      me,
      "announcements",
      '<div class="card admin-card"><div class="admin-toolbar"><button class="btn btn-primary btn-sm" id="newAnn">发布公告</button><span class="small muted">' +
        list.length +
        " 条</span></div>" +
        (list.length
          ? '<div class="table-wrap"><table class="table"><thead><tr><th>标题</th><th>标签</th><th>时间</th><th>操作</th></tr></thead><tbody>' +
            list
              .map(
                (a) =>
                  '<tr><td><a href="#/news/' +
                  a.id +
                  '"><b style="font-size:13px">' +
                  esc(a.title) +
                  "</b></a></td><td><span class=\"badge badge-dim\">" +
                  esc(a.tag) +
                  '</span></td><td class="small muted">' +
                  fmtDate(a.at, true) +
                  '</td><td><div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-edit="' +
                  a.id +
                  '">编辑</button><button class="btn btn-ghost btn-sm" data-del="' +
                  a.id +
                  '">删除</button></div></td></tr>'
              )
              .join("") +
            "</tbody></table></div>"
          : empty("还没有公告")) +
        "</div>",
      (root) => {
        const edit = (a) => {
          modal({
            title: a ? "编辑公告" : "发布公告",
            body:
              '<div class="field"><label>标题</label><input class="input" id="anTitle" maxlength="60" value="' +
              escAttr(a ? a.title : "") +
              '"></div><div class="field"><label>标签</label><input class="input" id="anTag" maxlength="6" value="' +
              escAttr(a ? a.tag : "公告") +
              '"></div><div class="field"><label>正文</label><textarea class="textarea" id="anBody" style="min-height:200px">' +
              esc(a ? a.body : "") +
              "</textarea></div>",
            wide: true,
            foot:
              '<button class="btn btn-ghost btn-sm" data-cancel>取消</button><button class="btn btn-primary btn-sm" data-save>保存</button>',
            onMount(mask, close) {
              mask.querySelector("[data-cancel]").addEventListener("click", close);
              mask.querySelector("[data-save]").addEventListener("click", () => {
                const title = mask.querySelector("#anTitle").value.trim();
                const body = mask.querySelector("#anBody").value.trim();
                if (title.length < 3) return toast("标题太短", "err");
                if (body.length < 10) return toast("正文太短", "err");
                S.saveAnnouncement({
                  id: a ? a.id : null,
                  title,
                  tag: mask.querySelector("#anTag").value.trim() || "公告",
                  body,
                });
                close();
                toast("已保存", "ok");
                window.App.render();
              });
            },
          });
        };
        root.querySelector("#newAnn").addEventListener("click", () => edit(null));
        root.querySelectorAll("[data-edit]").forEach((b) =>
          b.addEventListener("click", () => edit(S.announcement(b.dataset.edit)))
        );
        root.querySelectorAll("[data-del]").forEach((b) =>
          b.addEventListener("click", () =>
            confirm("删除这条公告？", () => {
              S.deleteAnnouncement(b.dataset.del);
              toast("已删除", "ok");
              window.App.render();
            })
          )
        );
      }
    );
  }

  /* ------------------------------ 帖子 ------------------------------ */
  function posts(me, q) {
    const list = S.load()
      .posts.filter((p) => !p.deleted)
      .filter((p) => !q || (p.title + p.body).toLowerCase().indexOf(String(q).toLowerCase()) > -1)
      .sort((a, b) => b.at - a.at);
    return shell(
      me,
      "posts",
      '<div class="card admin-card"><div class="admin-toolbar"><input class="input" id="postSearch" placeholder="搜索帖子" value="' +
        escAttr(q || "") +
        '"><button class="btn btn-ghost btn-sm" id="postSearchBtn">搜索</button><span class="small muted">' +
        list.length +
        " 篇</span></div>" +
        '<div class="table-wrap"><table class="table"><thead><tr><th>标题</th><th>作者</th><th>分类</th><th>回复</th><th>浏览</th><th>状态</th><th>操作</th></tr></thead><tbody>' +
        list
          .map((p) => {
            const u = S.user(p.author);
            return (
              '<tr><td><a href="#/forum/p/' +
              p.id +
              '" style="font-size:13px"><b>' +
              esc(p.title) +
              "</b></a></td><td>" +
              esc(u ? u.nickname : "?") +
              "</td><td>" +
              esc((CATEGORIES.find((c) => c.id === p.cat) || {}).name || "") +
              "</td><td>" +
              S.replies(p.id).length +
              "</td><td>" +
              p.views +
              "</td><td>" +
              (p.pinned ? '<span class="badge badge-red">置顶</span> ' : "") +
              (p.locked ? '<span class="badge badge-dim">锁定</span>' : "") +
              (p.flagged ? '<span class="badge badge-dim">含违禁词</span>' : "") +
              '</td><td><div class="row" style="gap:5px"><button class="btn btn-ghost btn-sm" data-pin="' +
              p.id +
              '">' +
              (p.pinned ? "取消置顶" : "置顶") +
              '</button><button class="btn btn-ghost btn-sm" data-lock="' +
              p.id +
              '">' +
              (p.locked ? "解锁" : "锁定") +
              '</button><button class="btn btn-ghost btn-sm" data-delp="' +
              p.id +
              '">删除</button></div></td></tr>'
            );
          })
          .join("") +
        "</tbody></table></div></div>",
      (root) => {
        root.querySelector("#postSearchBtn").addEventListener("click", () => {
          location.hash = "#/admin/posts?q=" + encodeURIComponent(root.querySelector("#postSearch").value.trim());
        });
        root.querySelector("#postSearch").addEventListener("keydown", (e) => {
          if (e.key === "Enter") root.querySelector("#postSearchBtn").click();
        });
        root.querySelectorAll("[data-pin]").forEach((b) =>
          b.addEventListener("click", () => {
            const p = S.post(b.dataset.pin);
            S.setPostFlag(p.id, "pinned", !p.pinned);
            window.App.render();
          })
        );
        root.querySelectorAll("[data-lock]").forEach((b) =>
          b.addEventListener("click", () => {
            const p = S.post(b.dataset.lock);
            S.setPostFlag(p.id, "locked", !p.locked);
            window.App.render();
          })
        );
        root.querySelectorAll("[data-delp]").forEach((b) =>
          b.addEventListener("click", () =>
            confirm("删除这篇帖子？", () => {
              S.deletePost(b.dataset.delp);
              toast("已删除", "ok");
              window.App.render();
            })
          )
        );
      }
    );
  }

  /* ------------------------------ 违禁词 ------------------------------ */
  function words(me) {
    const list = S.settings().bannedWords;
    return shell(
      me,
      "words",
      '<div class="card admin-card"><h3>违禁词</h3><p class="small muted" style="margin:6px 0 16px">发帖、回复、公会与私信中出现这些词会被替换为 ***。</p>' +
        '<div class="row" style="gap:8px;max-width:520px"><input class="input" id="wordInput" maxlength="12" placeholder="输入违禁词"><button class="btn btn-primary btn-sm" id="wordAdd">添加</button></div>' +
        '<div class="row wrap" style="margin-top:18px;gap:8px" id="wordList">' +
        list
          .map(
            (w) =>
              '<span class="chip">' +
              esc(w) +
              '<button class="x" data-word="' +
              escAttr(w) +
              '" aria-label="删除">×</button></span>'
          )
          .join("") +
        "</div>" +
        (list.length ? "" : empty("还没有设置违禁词")) +
        "</div>",
      (root) => {
        root.querySelector("#wordAdd").addEventListener("click", () => {
          const r = S.addBannedWord(root.querySelector("#wordInput").value);
          if (!r.ok) return toast(r.msg, "err");
          toast("已添加", "ok");
          window.App.render();
        });
        root.querySelectorAll("[data-word]").forEach((b) =>
          b.addEventListener("click", () => {
            S.removeBannedWord(b.dataset.word);
            window.App.render();
          })
        );
      }
    );
  }

  /* ------------------------------ 私信审查 ------------------------------ */
  function dms(me, userId) {
    const users = S.load().users.filter((u) => u.role !== "system");
    const target = userId ? S.user(userId) : null;
    const list = target ? S.adminDMs(target.id) : [];
    return shell(
      me,
      "dms",
      '<div class="card admin-card"><h3>私信审查</h3><p class="small muted" style="margin:6px 0 14px">选择一个账号，查看其全部私信记录（只读）。</p>' +
        '<div class="row" style="gap:8px;max-width:520px"><select class="select" id="dmUser"><option value="">选择账号…</option>' +
        users
          .sort((a, b) => a.nickname.localeCompare(b.nickname, "zh"))
          .map(
            (u) =>
              '<option value="' +
              u.id +
              '"' +
              (target && target.id === u.id ? " selected" : "") +
              ">" +
              esc(u.nickname + " (@" + u.username + ")") +
              "</option>"
          )
          .join("") +
        "</select></div>" +
        (target
          ? '<div class="divider"></div><div class="row-between"><h4 style="font-size:14px">' +
            esc(target.nickname) +
            " 的私信 · " +
            list.length +
            " 条</h4><a class=\"small muted\" href=\"#/admin/users\">用户列表</a></div>" +
            '<div class="dm-peek" style="margin-top:12px">' +
            (list.length
              ? list
                  .map((d) => {
                    const from = S.user(d.from);
                    const to = S.user(d.to);
                    return (
                      '<div style="padding:10px 12px;border:1px solid var(--line);border-radius:9px"><div class="small muted" style="margin-bottom:3px">' +
                      esc(from ? from.nickname : "?") +
                      " → " +
                      esc(to ? to.nickname : "?") +
                      " · " +
                      fmtDate(d.at, true) +
                      (d.read ? "" : ' · <span class="blood">未读</span>') +
                      "</div><div style=\"font-size:13.5px\">" +
                      esc(d.body) +
                      "</div></div>"
                    );
                  })
                  .join("")
              : empty("该账号没有私信")) +
            "</div>"
          : empty("请选择要审查的账号")) +
        "</div>",
      (root) => {
        root.querySelector("#dmUser").addEventListener("change", (e) => {
          if (e.target.value) location.hash = "#/admin/dms?user=" + e.target.value;
        });
      }
    );
  }

  /* ------------------------------ 设置 ------------------------------ */
  function settings(me) {
    const st = S.settings();
    return shell(
      me,
      "settings",
      '<div class="card admin-card"><h3>站点设置</h3>' +
        '<div class="row-between" style="padding:16px 0;border-bottom:1px solid var(--line)"><div><b>体验资格申请通道</b><div class="small muted">关闭后用户无法提交新申请</div></div><span class="switch ' +
        (st.applyOpen ? "is-on" : "") +
        '" id="setApply"></span></div>' +
        '<div class="field" style="margin-top:18px"><label>站点横幅文案</label><input class="input" id="setNotice" value="' +
        escAttr(st.siteNotice || "") +
        '"></div><button class="btn btn-primary btn-sm" id="saveSettings">保存设置</button>' +
        "</div>" +
        '<div class="card admin-card" style="margin-top:16px"><h3>违禁词</h3><p class="small muted">当前 ' +
        st.bannedWords.length +
        ' 个。<a class="link" href="#/admin/words">去管理</a></p></div>' +
        '<div class="card admin-card" style="margin-top:16px;border-color:rgba(255,80,80,.25)"><h3>危险操作</h3><p class="small muted" style="margin:6px 0 14px">清空本地演示数据，恢复初始种子内容。所有注册账号与帖子都会丢失。</p>' +
        '<button class="btn btn-ghost btn-sm" id="resetData">重置演示数据</button></div>',
      (root) => {
        root.querySelector("#setApply").addEventListener("click", () => {
          S.setSetting("applyOpen", !S.settings().applyOpen);
          window.App.render();
        });
        root.querySelector("#saveSettings").addEventListener("click", () => {
          S.setSetting("siteNotice", root.querySelector("#setNotice").value.trim());
          toast("已保存", "ok");
        });
        root.querySelector("#resetData").addEventListener("click", () =>
          confirm("确定重置所有数据？此操作不可撤销。", () => {
            S.reset();
            S.logout();
            toast("已重置", "ok");
            location.hash = "#/";
            setTimeout(() => location.reload(), 300);
          })
        );
      }
    );
  }

  window.Admin = {
    render(module, param, q) {
      const block = guard();
      if (block) return block;
      const me = S.me();
      switch (module) {
        case "users":
          return users(me, q);
        case "apps":
          return apps(me, param || "pending");
        case "announcements":
          return announcements(me);
        case "posts":
          return posts(me, q);
        case "words":
          return words(me);
        case "dms":
          return dms(me, param);
        case "settings":
          return settings(me);
        default:
          return dashboard(me);
      }
    },
  };
})();
