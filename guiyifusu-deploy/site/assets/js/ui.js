/* UI 工具 */
(function () {
  const AV = window.SEED.AVATARS;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escAttr(s) {
    return esc(s).replace(/`/g, "&#96;");
  }

  function avatar(user, cls) {
    if (!user) return '<span class="avatar ' + (cls || "") + '">?</span>';
    const a = AV[Number(user.avatar) % AV.length] || AV[0];
    const ch = Array.from(user.nickname || user.username || "?")[0] || "?";
    return (
      '<span class="avatar ' +
      (cls || "") +
      '" style="background:linear-gradient(140deg,' +
      a[0] +
      "," +
      a[1] +
      ')" title="' +
      escAttr(user.nickname) +
      '">' +
      esc(ch) +
      "</span>"
    );
  }

  function timeAgo(ts) {
    const d = Date.now() - Number(ts);
    if (d < 60e3) return "刚刚";
    if (d < 3600e3) return Math.floor(d / 60e3) + " 分钟前";
    if (d < 86400e3) return Math.floor(d / 3600e3) + " 小时前";
    if (d < 30 * 86400e3) return Math.floor(d / 86400e3) + " 天前";
    return fmtDate(ts);
  }

  function fmtDate(ts, withTime) {
    const d = new Date(Number(ts));
    const p = (n) => String(n).padStart(2, "0");
    const s = d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
    return withTime ? s + " " + p(d.getHours()) + ":" + p(d.getMinutes()) : s;
  }

  function md(text) {
    let s = esc(text || "");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  function toast(msg, type) {
    const root = document.getElementById("toastRoot");
    if (!root) return;
    const t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.textContent = msg;
    root.appendChild(t);
    setTimeout(() => {
      t.classList.add("out");
      setTimeout(() => t.remove(), 320);
    }, 2600);
  }

  function modal({ title, body, foot, wide, onMount }) {
    const root = document.getElementById("modalRoot");
    const mask = document.createElement("div");
    mask.className = "modal-mask";
    mask.innerHTML =
      '<div class="modal ' +
      (wide ? "wide" : "") +
      '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h3>' +
      esc(title || "") +
      '</h3><button class="modal-close" type="button" aria-label="关闭">×</button></div>' +
      '<div class="modal-body">' +
      (body || "") +
      "</div>" +
      (foot ? '<div class="modal-foot">' + foot + "</div>" : "") +
      "</div>";
    root.appendChild(mask);
    const close = () => {
      mask.remove();
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    mask.addEventListener("click", (e) => {
      if (e.target === mask) close();
    });
    mask.querySelector(".modal-close").addEventListener("click", close);
    if (onMount) onMount(mask, close);
    return { mask, close };
  }

  function confirmDialog(text, onOk, okText) {
    const m = modal({
      title: "确认",
      body: '<p style="margin:0 0 6px;color:var(--text-2)">' + esc(text) + "</p>",
      foot:
        '<button class="btn btn-ghost btn-sm" data-cancel>取消</button>' +
        '<button class="btn btn-primary btn-sm" data-ok>' +
        esc(okText || "确认") +
        "</button>",
      onMount(mask, close) {
        mask.querySelector("[data-cancel]").addEventListener("click", close);
        mask.querySelector("[data-ok]").addEventListener("click", () => {
          close();
          onOk();
        });
      },
    });
    return m;
  }

  function empty(text, icon) {
    return '<div class="empty">' + (icon || window.Icon("scroll")) + "<div>" + esc(text) + "</div></div>";
  }

  function query(name) {
    const h = location.hash;
    const qi = h.indexOf("?");
    if (qi === -1) return null;
    return new URLSearchParams(h.slice(qi + 1)).get(name);
  }

  function setQuery(obj) {
    const h = location.hash.split("?")[0] || "#/";
    const p = new URLSearchParams(obj);
    const s = p.toString();
    return h + (s ? "?" + s : "");
  }

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      const args = arguments;
      const self = this;
      t = setTimeout(() => fn.apply(self, args), ms || 260);
    };
  }

  function requireLogin(msg) {
    if (Store.me()) return true;
    toast(msg || "请先登录", "err");
    window.App.navigate("#/login");
    return false;
  }

  function requireQQ(action) {
    const me = Store.me();
    if (!me) {
      toast("请先登录", "err");
      window.App.navigate("#/login");
      return false;
    }
    if (!me.qq) {
      toast("绑定 QQ 后才能" + (action || "进行此操作"), "err");
      window.App.navigate("#/me");
      return false;
    }
    return true;
  }

  window.UI = {
    esc,
    escAttr,
    avatar,
    timeAgo,
    fmtDate,
    md,
    toast,
    modal,
    confirm: confirmDialog,
    empty,
    query,
    setQuery,
    debounce,
    requireLogin,
    requireQQ,
  };
})();
