/* 消息中心：私信 / 公会 / 系统 */
(function () {
  const { esc, avatar, timeAgo, fmtDate, md, modal, toast, empty, requireLogin } = window.UI;
  const S = window.Store;

  const TABS = [
    { id: "dm", name: "私信" },
    { id: "guild", name: "公会" },
    { id: "sys", name: "系统" },
  ];

  function tabCount(tab, me) {
    if (tab === "dm") return S.unreadDM(me.id);
    if (tab === "sys") return S.unreadNotifs(me.id);
    return 0;
  }

  function layout(me, active, sideHtml, mainHtml) {
    return (
      '<div class="page-head"><div class="eyebrow">Messages</div><h1>消息中心</h1><p>私信、公会频道与系统通知。</p></div>' +
      '<div class="msg-layout">' +
      '<aside class="card msg-side"><div class="msg-tabs">' +
      TABS.map((t) => {
        const n = tabCount(t.id, me);
        return (
          '<button data-tab="' +
          t.id +
          '" class="' +
          (active === t.id ? "is-on" : "") +
          '">' +
          t.name +
          (n ? '<span class="n">' + n + "</span>" : "") +
          "</button>"
        );
      }).join("") +
      "</div>" +
      sideHtml +
      "</aside>" +
      '<section class="card msg-main">' +
      mainHtml +
      "</section></div>"
    );
  }

  /* ------------------------------ 私信 ------------------------------ */
  function dm(me, targetId) {
    const convs = S.conversations(me.id);
    const friends = S.friends(me.id);
    const target = targetId ? S.user(targetId) : null;
    const list = convs.slice();
    if (target && !list.some((c) => c.user.id === target.id)) {
      list.unshift({ user: target, last: null, unread: 0 });
    }
    const activeId = target ? target.id : convs[0] ? convs[0].user.id : null;
    const activeUser = activeId ? S.user(activeId) : null;

    const side =
      '<div class="conv-list">' +
      (list.length
        ? list
            .map((c) => {
              const u = c.user;
              return (
                '<div class="conv ' +
                (activeId === u.id ? "is-on" : "") +
                '" data-conv="' +
                u.id +
                '">' +
                avatar(u, "avatar-sm") +
                '<div class="conv-main"><div class="conv-name">' +
                esc(u.nickname) +
                (S.isFriend(me.id, u.id) ? ' <span class="badge badge-red" style="font-size:9px;padding:0 5px">好友</span>' : "") +
                '</div><div class="conv-preview">' +
                esc(c.last ? (c.last.from === me.id ? "我：" : "") + c.last.body.replace(/\n/g, " ") : "开始聊天") +
                '</div></div><div style="text-align:right"><div class="conv-time">' +
                (c.last ? timeAgo(c.last.at) : "") +
                "</div>" +
                (c.unread ? '<span class="unread-dot">' + c.unread + "</span>" : "") +
                "</div></div>"
              );
            })
            .join("")
        : empty("还没有私信。去好友或作者主页点「私信」。")
      ) +
      "</div>" +
      (friends.length
        ? '<div style="padding:10px 12px;border-top:1px solid var(--line)"><div class="small muted" style="margin-bottom:6px">好友</div><div class="row wrap">' +
          friends
            .slice(0, 8)
            .map(
              (u) =>
                '<a class="chip" href="#/messages/dm/' + u.id + '">' + esc(u.nickname) + "</a>"
            )
            .join("") +
          "</div></div>"
        : "");

    let main;
    if (!activeUser) {
      main = empty("选择一个联系人开始私信", window.Icon("chat"));
    } else {
      const thread = S.thread(me.id, activeUser.id);
      S.markThreadRead(me.id, activeUser.id);
      main =
        '<div class="chat"><div class="chat-head"><div class="row"><a href="#/u/' +
        activeUser.id +
        '">' +
        avatar(activeUser, "avatar-sm") +
        "</a><div><a href=\"#/u/" +
        activeUser.id +
        '"><b>' +
        esc(activeUser.nickname) +
        "</b></a>" +
        (S.isFriend(me.id, activeUser.id) ? ' <span class="badge badge-red">好友</span>' : "") +
        '</div></div><a class="small muted" href="#/u/' +
        activeUser.id +
        '">查看主页</a></div>' +
        '<div class="chat-body" id="dmBody">' +
        (thread.length
          ? thread
              .map(
                (d) =>
                  '<div class="msg ' +
                  (d.from === me.id ? "out" : "") +
                  '"><div><div class="msg-bubble">' +
                  md(d.body) +
                  '</div></div><span class="msg-time">' +
                  timeAgo(d.at) +
                  "</span></div>"
              )
              .join("")
          : empty("还没有消息，打个招呼吧", window.Icon("send"))) +
        "</div>" +
        '<div class="chat-foot"><input class="input" id="dmInput" maxlength="500" placeholder="发一条私信…"><button class="btn btn-primary btn-sm" id="dmSend">发送</button></div></div>';

      setTimeout(() => {
        const b = document.getElementById("dmBody");
        if (b) b.scrollTop = b.scrollHeight;
      }, 60);
    }

    const html = layout(me, "dm", side, main);
    return {
      html,
      mount(root) {
        root.querySelectorAll("[data-conv]").forEach((el) => {
          el.addEventListener("click", () => {
            location.hash = "#/messages/dm/" + el.dataset.conv;
          });
        });

        const send = root.querySelector("#dmSend");
        if (send) {
          const input = root.querySelector("#dmInput");
          const doSend = () => {
            const r = S.sendDM(activeUser.id, input.value);
            if (!r.ok) return toast(r.msg, "err");
            window.App.render();
          };
          send.addEventListener("click", doSend);
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") doSend();
          });
          input.focus();
        }
      },
    };
  }

  /* ------------------------------ 公会消息 ------------------------------ */
  function guild(me) {
    const g = S.myGuild(me.id);
    const side =
      '<div class="conv-list">' +
      (g
        ? '<div class="conv is-on" data-conv="guild"><span class="guild-emblem" style="width:34px;height:34px;font-size:14px">' +
          esc(g.tag) +
          '</span><div class="conv-main"><div class="conv-name">' +
          esc(g.name) +
          '</div><div class="conv-preview">' +
          g.members.length +
          " 名成员</div></div></div>"
        : empty("加入公会后才有公会频道")) +
      "</div>";

    let main;
    if (!g) {
      main = empty("你还没有加入公会", window.Icon("users"));
      main +=
        '<div class="center" style="padding-bottom:30px"><a class="btn btn-primary" href="#/guilds">去公会大厅</a></div>';
    } else if (!g.members.includes(me.id)) {
      main = empty("加入公会后才能查看频道");
    } else {
      const msgs = S.guildMessages(g.id);
      main =
        '<div class="chat"><div class="chat-head"><div class="row"><span class="guild-emblem" style="width:30px;height:30px;font-size:12px">' +
        esc(g.tag) +
        '</span><div><b>' +
        esc(g.name) +
        '</b><div class="small muted">' +
        g.members.length +
        " 名成员 · 公会频道</div></div></div><a class=\"small muted\" href=\"#/guild/" +
        g.id +
        '">公会主页</a></div>' +
        '<div class="chat-body" id="guildBody">' +
        (msgs.length
          ? msgs
              .map((m) => {
                const u = S.user(m.author);
                const out = m.author === me.id;
                return (
                  '<div class="msg ' +
                  (out ? "out" : "") +
                  '"><a href="#/u/' +
                  m.author +
                  '">' +
                  avatar(u, "avatar-sm") +
                  '</a><div><div class="msg-name">' +
                  esc(u ? u.nickname : "") +
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
        '<div class="chat-foot"><input class="input" id="guildInput" maxlength="300" placeholder="对公会成员说点什么…"><button class="btn btn-primary btn-sm" id="guildSend">发送</button></div></div>';

      setTimeout(() => {
        const b = document.getElementById("guildBody");
        if (b) b.scrollTop = b.scrollHeight;
      }, 60);
    }

    return {
      html: layout(me, "guild", side, main),
      mount(root) {
        const send = root.querySelector("#guildSend");
        if (send) {
          const input = root.querySelector("#guildInput");
          const doSend = () => {
            const r = S.sendGuildMessage(g.id, input.value);
            if (!r.ok) return toast(r.msg, "err");
            window.App.render();
          };
          send.addEventListener("click", doSend);
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") doSend();
          });
        }
      },
    };
  }

  /* ------------------------------ 系统 ------------------------------ */
  function sys(me) {
    const list = S.notifications(me.id);
    const unread = S.unreadNotifs(me.id);
    const side =
      '<div class="conv-list"><div class="conv is-on"><span class="sys-icon">' +
      window.Icon("bell") +
      '</span><div class="conv-main"><div class="conv-name">系统通知</div><div class="conv-preview">' +
      list.length +
      " 条 · " +
      unread +
      " 条未读</div></div></div></div>" +
      (unread
        ? '<div style="padding:12px"><button class="btn btn-ghost btn-sm btn-block" id="readAll">全部标为已读</button></div>'
        : "");

    const icons = { follow: "users", reply: "message", apply: "key", system: "shield", guild: "crown", dm: "mail" };
    const main = list.length
      ? '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--line)"><b>系统消息</b><span class="small muted">' +
        unread +
        " 条未读</span></div>" +
        '<div id="sysList">' +
        list
          .map(
            (n) =>
              '<div class="sys-item ' +
              (n.read ? "" : "is-unread") +
              '" data-notif="' +
              n.id +
              '" data-link="' +
              UI.escAttr(n.link || "") +
              '"><span class="sys-icon">' +
              window.Icon(icons[n.type] || "bell") +
              '</span><div class="sys-body"><div class="sys-text">' +
              esc(n.text) +
              '</div><div class="sys-time">' +
              timeAgo(n.at) +
              "</div></div>" +
              (n.read ? "" : '<span class="sys-unread"></span>') +
              "</div>"
          )
          .join("") +
        "</div>"
      : empty("还没有系统消息", window.Icon("bell"));

    return {
      html: layout(me, "sys", side, main),
      mount(root) {
        const byId = {};
        list.forEach((n) => (byId[n.id] = n));
        const typeName = { follow: "关注", reply: "回复", apply: "体验资格", guild: "公会", dm: "私信", system: "系统" };

        function refreshCounts() {
          const left = S.unreadNotifs(me.id);
          window.App.refreshNav();
          const prev = root.querySelector(".msg-side .conv-preview");
          if (prev) prev.textContent = list.length + " 条 · " + left + " 条未读";
          const head = root.querySelector("#sysList") ? root.querySelector("#sysList").previousElementSibling : null;
          if (head) {
            const span = head.querySelector("span");
            if (span) span.textContent = left + " 条未读";
          }
          const tab = root.querySelector('.msg-tabs button[data-tab="sys"]');
          if (tab) {
            let badge = tab.querySelector(".n");
            if (left) {
              if (!badge) {
                badge = document.createElement("span");
                badge.className = "n";
                tab.appendChild(badge);
              }
              badge.textContent = left;
            } else if (badge) badge.remove();
          }
        }

        root.querySelectorAll("[data-notif]").forEach((el) => {
          el.addEventListener("click", () => {
            const n = byId[el.dataset.notif];
            if (!n) return;
            S.markNotifRead(n.id);
            n.read = true;
            el.classList.remove("is-unread");
            const dot = el.querySelector(".sys-unread");
            if (dot) dot.remove();
            refreshCounts();

            const link = n.link || "";
            const same = link && link === location.hash;
            modal({
              title: "系统消息 · " + (typeName[n.type] || "通知"),
              body:
                '<div class="small muted">' + fmtDate(n.at, true) + "</div>" +
                '<p style="margin:14px 0 0;font-size:15.5px;line-height:1.95;color:#f0e2da">' +
                esc(n.text) +
                "</p>",
              foot:
                '<button class="btn btn-ghost btn-sm" data-close>知道了</button>' +
                (link && !same
                  ? '<a class="btn btn-primary btn-sm" href="' + UI.escAttr(link) + '" data-go>前往查看</a>'
                  : ""),
              onMount(mask, close) {
                mask.querySelector("[data-close]").addEventListener("click", () => {
                  close();
                  window.App.render();
                });
                const go = mask.querySelector("[data-go]");
                if (go)
                  go.addEventListener("click", () => {
                    close();
                  });
              },
            });
          });
        });
        const all = root.querySelector("#readAll");
        if (all)
          all.addEventListener("click", () => {
            S.markAllNotifsRead(me.id);
            toast("已全部标为已读", "ok");
            window.App.render();
          });
      },
    };
  }

  window.Messages = {
    render(tab, param) {
      const me = S.me();
      if (!me) {
        location.hash = "#/login?next=" + encodeURIComponent("#/messages/" + (tab || "dm"));
        return { html: "" };
      }
      if (tab === "guild") return guild(me);
      if (tab === "sys") return sys(me);
      return dm(me, param);
    },
  };
})();
