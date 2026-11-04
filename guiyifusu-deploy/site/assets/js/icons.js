/* 图标：内联 SVG */
(function () {
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 17.5h16"/>',
    sword: '<path d="m14 4 6 6-9 9-4 1 1-4z"/><path d="m3 21 4-4"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h11l-1.5 4L16 12H5"/>',
    message: '<path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/><path d="M8 11h8M8 15h5"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M16.5 5.2a3.5 3.5 0 0 1 0 6.6"/><path d="M18 14.8c2.4.6 4 2.3 4 5.2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.6.7 1 1.35 1H21a2 2 0 1 1 0 4h-.09c-.65 0-1.2.4-1.35 1z"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/><path d="M10 11v6M14 11v6"/>',
    pin: '<path d="m9 3 6 6-4 4 3 6-1 1-4-5-4 4-1-1 5-5z"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M3 3l18 18"/><path d="M10.5 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.6"/><path d="M6.6 6.6C3.6 8.5 2 12 2 12s3.5 6 10 6a10.6 10.6 0 0 0 4.3-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    crown: '<path d="M3 8l4 3 5-6 5 6 4-3-2 11H5z"/><path d="M5 19h14"/>',
    logout: '<path d="M9 21H4V3h5"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    save: '<path d="M4 4h12l4 4v12H4z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
    alert: '<path d="M12 3 2 21h20z"/><path d="M12 9v6M12 18h.01"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m11 12 9-9M17 3l4 4M14 6l3 3"/>',
    scroll: '<path d="M5 3h12a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2H7a2 2 0 0 1-2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18"/><path d="M12 8c-2 0-4-1-4-3a2 2 0 0 1 4 0c0 2 4 3 4 3s4-1 4-3a2 2 0 0 0-4 0c0 2-4 3-4 3z"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>',
    qq: '<path d="M12 3c-3.3 0-5 2.4-5 5.5 0 1.3.2 2.2-.4 3.3-.7 1.2-2 2.6-2 4.2 0 .9.6 1.5 1.4 1.2.7 1 1.6 1.8 2.6 2.2-.3.4-.5.9-.5 1.3 0 .8.7 1.3 2.2 1.3h3.4c1.5 0 2.2-.5 2.2-1.3 0-.4-.2-.9-.5-1.3 1-.4 1.9-1.2 2.6-2.2.8.3 1.4-.3 1.4-1.2 0-1.6-1.3-3-2-4.2-.6-1.1-.4-2-.4-3.3C17 5.4 15.3 3 12 3z"/><path d="M9.5 9h.01M14.5 9h.01"/>',
    gamepad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v4M5 12h4M16 11h.01M18.5 13h.01"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 16-5-5-9 9"/>',
  };
  window.Icon = function (name, cls) {
    const d = P[name] || P.close;
    return (
      '<svg class="' +
      (cls || "") +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      d +
      "</svg>"
    );
  };
})();
