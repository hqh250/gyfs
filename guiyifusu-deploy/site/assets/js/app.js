/* 路由 / 外壳 / 导航 */
(function () {
  const { esc, avatar, toast } = window.UI;
  const S = window.Store;
  const V = window.Views;

  const els = {};
  let currentPath = "";

  function parseHash() {
    let h = location.hash.replace(/^#/, "");
    if (!h) h = "/";
    const qi = h.indexOf("?");
    let q = null;
    if (qi > -1) {
      q = new URLSearchParams(h.slice(qi + 1));
      h = h.slice(0, qi);
    }
    if (h.length > 1 && h.endsWith("/")) h = h.slice(0, -1);
    return { path: h, q };
  }

  function route(path, q) {
    const seg = path.split("/").filter(Boolean);

    if (seg.length === 0) return { view: V.home(), nav: "/" };
    const [a, b, c] = seg;

    if (a === "world") return { view: V.world(), nav: "/world" };
    if (a === "gameplay") return { view: V.gameplay(), nav: "/gameplay" };
    if (a === "news") return { view: c ? V.newsDetail(b) : V.news(), nav: "/news" };
    if (a === "apply") return { view: V.apply(), nav: "/apply" };
    if (a === "forum") {
      if (b === "new") return { view: V.postNew(), nav: "/forum" };
      if (b === "p") return { view: V.postDetail(c), nav: "/forum" };
      if (b === "c") return { view: V.forum(c, q && q.get("q")), nav: "/forum" };
      return { view: V.forum(null, q && q.get("q")), nav: "/forum" };
    }
    if (a === "guilds") return { view: b === "new" ? V.guildNew() : V.guilds(), nav: "/guilds" };
    if (a === "guild") return { view: V.guildDetail(b), nav: "/guilds" };
    if (a === "u") return { view: V.profile(b, c), nav: "/forum" };
    if (a === "me") return { view: V.me(), nav: "/me" };
    if (a === "login") return { view: V.auth("login", q && q.get("next")), nav: "" };
    if (a === "register") return { view: V.auth("register", q && q.get("next")), nav: "" };
    if (a === "messages") return { view: window.Messages.render(b || "dm", c ? Number(c) : null), nav: "/messages" };
    if (a === "admin") {
      const param = b === "apps" ? (q && q.get("f")) || "pending" : b === "dms" ? (q && q.get("user")) || null : null;
      return { view: window.Admin.render(b || "", param, q && q.get("q")), nav: "/admin" };
    }
    return { view: { html: '<div class="card center" style="padding:70px"><h1>404</h1><p class="muted">这条走廊不存在。</p><a class="btn btn-primary" style="margin-top:18px" href="#/">回到大厅</a></div>' }, nav: "" };
  }

  function update() {
    const { path, q } = parseHash();
    const r = route(path, q);
    const view = r.view || { html: "" };
    els.view.innerHTML = view.html || "";
    els.view.classList.remove("view-anim");
    void els.view.offsetWidth;
    els.view.classList.add("view-anim");
    if (typeof view.mount === "function") {
      try {
        view.mount(els.view);
      } catch (e) {
        console.error(e);
        toast("页面加载出错：" + e.message, "err");
      }
    }
    markNav(r.nav);
    window.scrollTo(0, 0);
    currentPath = path;
  }

  function render() {
    update();
  }

  function markNav(nav) {
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("is-active", nav && (href === "#" + nav || (nav === "/forum" && href === "#/forum")));
    });
    document.querySelectorAll("#mobileMenu [data-nav]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("is-active", nav && href === "#" + nav);
    });
  }

  /* ------------------------------ 导航 ------------------------------ */
  function unreadTotal(me) {
    if (!me) return 0;
    return S.unreadDM(me.id) + S.unreadNotifs(me.id);
  }

  function refreshNav() {
    const me = S.me();
    let html = "";
    if (!me) {
      html =
        '<a class="btn btn-ghost btn-sm desktop-only" href="#/login">登录</a>' +
        '<a class="btn btn-primary btn-sm" href="#/register">注册</a>';
    } else {
      const n = unreadTotal(me);
      html =
        '<a class="icon-btn" href="#/messages/dm" title="消息">' +
        window.Icon("message", "") +
        (n ? '<span class="dot">' + (n > 99 ? "99+" : n) + "</span>" : "") +
        "</a>" +
        '<div class="dropdown" id="userDrop">' +
        '<button class="row" type="button" style="gap:9px;background:none;border:0;padding:4px" aria-label="账号菜单">' +
        avatar(me, "avatar-sm avatar-ring") +
        '<span class="desktop-only" style="font-size:13px">' + esc(me.nickname) + "</span>" +
        "</button>" +
        '<div class="dropdown-menu">' +
        '<a href="#/u/' + me.id + '">' + window.Icon("user") + "个人主页</a>" +
        '<a href="#/me">' + window.Icon("settings") + "个人设置</a>" +
        '<a href="#/messages/dm">' + window.Icon("message") + "消息中心</a>" +
        (S.isAdmin(me) ? '<a href="#/admin">' + window.Icon("shield") + "管理后台</a>" : "") +
        '<div class="sep"></div>' +
        '<button type="button" id="navLogout">' + window.Icon("logout") + "退出登录</button>" +
        "</div></div>";
    }
    els.navRight.innerHTML = html;

    const drop = document.getElementById("userDrop");
    if (drop) {
      drop.querySelector("button").addEventListener("click", (e) => {
        e.stopPropagation();
        drop.classList.toggle("is-open");
      });
      const lo = document.getElementById("navLogout");
      if (lo)
        lo.addEventListener("click", () => {
          S.logout();
          toast("已退出", "ok");
          refreshNav();
          location.hash = "#/";
          render();
        });
    }

    // 移动端菜单
    const me2 = S.me();
    let mm =
      '<a href="#/" data-nav>首页</a><a href="#/world" data-nav>世界观</a><a href="#/gameplay" data-nav>玩法</a>' +
      '<a href="#/news" data-nav>公告</a><a href="#/forum" data-nav>论坛</a><a href="#/guilds" data-nav>公会</a>' +
      '<a href="#/apply" data-nav>体验资格</a><div class="mm-sep"></div>';
    if (me2) {
      mm +=
        '<a href="#/messages/dm">消息中心' + (unreadTotal(me2) ? " · " + unreadTotal(me2) + " 条未读" : "") + "</a>" +
        '<a href="#/u/' + me2.id + '">个人主页</a><a href="#/me">个人设置</a>' +
        (S.isAdmin(me2) ? '<a href="#/admin">管理后台</a>' : "") +
        '<button type="button" id="mmLogout">退出登录</button>';
    } else {
      mm += '<a href="#/login">登录</a><a href="#/register">注册账号</a>';
    }
    els.mobileMenu.innerHTML = mm;
    const mmLo = document.getElementById("mmLogout");
    if (mmLo)
      mmLo.addEventListener("click", () => {
        S.logout();
        toast("已退出", "ok");
        refreshNav();
        location.hash = "#/";
        render();
      });
    markNav(currentPath);
  }

  function navigate(hash) {
    if (location.hash === hash) {
      render();
      return;
    }
    location.hash = hash;
  }

  function bindNav() {
    els.navToggle.addEventListener("click", () => {
      const open = els.mobileMenu.classList.toggle("is-open");
      els.navToggle.classList.toggle("is-open", open);
      els.navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      els.mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    });

    document.addEventListener("click", (e) => {
      const drop = document.getElementById("userDrop");
      if (drop && !drop.contains(e.target)) drop.classList.remove("is-open");
    });

    window.addEventListener("scroll", () => {
      els.nav.classList.toggle("is-scrolled", window.scrollY > 12);
    }, { passive: true });

    window.addEventListener("hashchange", () => {
      els.mobileMenu.classList.remove("is-open");
      els.navToggle.classList.remove("is-open");
      render();
      // 进度条
      els.progress.style.width = "70%";
      setTimeout(() => {
        els.progress.style.width = "100%";
        setTimeout(() => (els.progress.style.width = "0%"), 220);
      }, 120);
    });

    window.addEventListener("storage", (e) => {
      if (e.key && e.key.indexOf("gyfs") === 0) refreshNav();
    });
  }

  function boot() {
    els.view = document.getElementById("view");
    els.nav = document.getElementById("nav");
    els.navRight = document.getElementById("navRight");
    els.navToggle = document.getElementById("navToggle");
    els.mobileMenu = document.getElementById("mobileMenu");
    els.progress = document.getElementById("navProgress");

    S.load();
    bindNav();
    refreshNav();
    render();

    // 先本地渲染，再尝试接入联机服务；成功后用服务端数据刷新
    if (window.Sync) {
      window.Sync.init().then(() => {
        if (!window.Sync.online) return;
        refreshNav();
        render();
      });
    }
  }

  window.App = {
    render,
    navigate,
    refreshNav,
    route,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
