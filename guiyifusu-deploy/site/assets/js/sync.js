/* 联机同步：同源 /api 存在时启用，多设备共享同一份数据；否则退回本地模式 */
(function () {
  const S = window.Store;
  const qsApi = new URLSearchParams(location.search).get("api");
  const BASE = (qsApi || window.API_BASE || localStorage.getItem("gyfs_api") || "").replace(/\/$/, "");

  const Sync = {
    online: false,
    rev: 0,
    pushing: false,
    dirty: false,
    timer: 0,
    pollTimer: 0,
    failed: 0,

    api(path) {
      return BASE + path;
    },

    setStatus(text, cls) {
      const el = document.getElementById("netStatus");
      if (el) {
        el.textContent = text;
        el.className = "net-status " + (cls || "");
      }
    },

    async init() {
      if (this.initing) return;
      if (location.protocol === "file:") {
        this.setStatus("本地模式", "local");
        return;
      }
      this.initing = true;
      this.setStatus("连接中…", "warn");
      try {
        const pingOnce = async (ms) => {
          const ctrl = new AbortController();
          const to = setTimeout(() => ctrl.abort(), ms);
          try {
            const r = await fetch(this.api("/api/ping"), { signal: ctrl.signal, cache: "no-store" });
            clearTimeout(to);
            if (!r.ok) throw new Error("no api");
            return await r.json();
          } finally {
            clearTimeout(to);
          }
        };
        let p = null;
        for (const ms of [4000, 9000, 15000]) {
          try {
            p = await pingOnce(ms);
            break;
          } catch (e1) {}
        }
        if (!p) throw new Error("no api");
        this.online = true;
        this.rev = p.rev || 0;

        this.online = true;
        this.rev = p.rev || 0;
        this.setStatus("联机模式", "online");
        this.poll();
        if (window.App) window.App.refreshNav();

        // 数据量较大时隧道可能超时：先进入联机态，再单独拉数据并重试
        this.pullState().catch(() => {
          clearTimeout(this.stateTimer);
          this.stateTimer = setTimeout(() => this.pullState().catch(() => {}), 6000);
        });
      } catch (e) {
        this.online = false;
        this.setStatus("本地模式", "local");
        clearTimeout(this.retryTimer);
        this.retryTimer = setTimeout(() => this.init(), 20000);
      } finally {
        this.initing = false;
      }
    },

    async pullState() {
      const st = await fetch(this.api("/api/state"), { cache: "no-store" }).then((r) => r.json());
      if (st && st.db) {
        S.setDb(st.db, st.rev);
        this.rev = st.rev;
        if (window.App) {
          window.App.refreshNav();
          window.App.render();
        }
      } else if (S.load().users.length) {
        this.dirty = true;
        this.schedule();
      }
    },

    schedule() {
      if (!this.online) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.push(), 420);
    },

    async push() {
      if (!this.online) return;
      if (this.pushing) {
        this.dirty = true;
        return;
      }
      this.pushing = true;
      this.dirty = false;
      try {
        const res = await fetch(this.api("/api/sync"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ rev: this.rev, db: S.load() }),
        });
        if (!res.ok) throw new Error("sync " + res.status);
        const data = await res.json();
        if (data && data.db) {
          S.setDb(data.db, data.rev);
          this.rev = data.rev;
        }
        this.failed = 0;
        this.setStatus("联机模式", "online");
        if (window.App) window.App.refreshNav();
      } catch (e) {
        this.failed += 1;
        this.setStatus("连接中断 · 稍后重试", "warn");
        if (this.failed > 3) this.online = false;
      } finally {
        this.pushing = false;
        if (this.dirty) this.schedule();
      }
    },

    async poll() {
      clearInterval(this.pollTimer);
      this.pollTimer = setInterval(async () => {
        if (!this.online || this.pushing) return;
        try {
          const res = await fetch(this.api("/api/state?since=" + this.rev), { cache: "no-store" });
          if (!res.ok) throw new Error("poll");
          const data = await res.json();
          if (!data || data.unchanged) return;
          if (data.rev > this.rev && data.db) {
            this.rev = data.rev;
            S.setDb(data.db, data.rev);
            if (window.App) {
              window.App.refreshNav();
              this.softRender();
            }
          }
        } catch (e) {
          /* 静默失败，等下一轮 */
        }
      }, 5000);
    },

    softRender() {
      const ae = document.activeElement;
      if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
      if (document.querySelector(".modal-mask")) return;
      const y = window.scrollY;
      window.App.render();
      window.scrollTo(0, y);
    },
  };

  window.Sync = Sync;
})();
