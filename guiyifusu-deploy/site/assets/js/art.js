/* 首页鬼眼（SVG，带虹膜纤维与竖瞳） */
(function () {
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function eye() {
    const r = rng(20261104);
    const fibers = [];
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2;
      const r1 = 18 + r() * 26;
      const r2 = 70 + r() * 24;
      fibers.push(
        '<line x1="' + (200 + Math.cos(a) * r1).toFixed(1) + '" y1="' + (130 + Math.sin(a) * r1).toFixed(1) +
          '" x2="' + (200 + Math.cos(a) * r2).toFixed(1) + '" y2="' + (130 + Math.sin(a) * r2).toFixed(1) +
          '" opacity="' + (0.06 + r() * 0.26).toFixed(2) + '"/>'
      );
    }
    const lashes = [];
    for (let i = 0; i < 18; i++) {
      const t = (i + 0.5) / 18;
      const x = 22 + 356 * t;
      const y = 130 - 108 * Math.sin(Math.PI * t);
      const len = 8 + 14 * Math.sin(Math.PI * t);
      lashes.push('<path d="M' + x.toFixed(1) + "," + y.toFixed(1) + " q2," + (-len * 0.6).toFixed(1) + " 4," + (-len).toFixed(1) + '"/>');
    }
    return (
      '<svg class="hero-eye-svg" viewBox="0 0 400 260" aria-hidden="true">' +
      "<defs>" +
      '<radialGradient id="heSclera" cx="50%" cy="46%" r="62%">' +
      '<stop offset="0%" stop-color="#8f0b12"/><stop offset="42%" stop-color="#520609"/>' +
      '<stop offset="78%" stop-color="#210204"/><stop offset="100%" stop-color="#090102"/>' +
      "</radialGradient>" +
      '<radialGradient id="heIris" cx="50%" cy="46%" r="55%">' +
      '<stop offset="0%" stop-color="#ff9a6e"/><stop offset="22%" stop-color="#e01a22"/>' +
      '<stop offset="58%" stop-color="#8a090e"/><stop offset="86%" stop-color="#3a0305"/>' +
      '<stop offset="100%" stop-color="#160102"/>' +
      "</radialGradient>" +
      '<radialGradient id="heGlow" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#ff5a3c" stop-opacity=".4"/>' +
      '<stop offset="55%" stop-color="#c31f2a" stop-opacity=".12"/>' +
      '<stop offset="100%" stop-color="#c31f2a" stop-opacity="0"/>' +
      "</radialGradient>" +
      '<linearGradient id="heLid" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#050204" stop-opacity=".92"/>' +
      '<stop offset="70%" stop-color="#050204" stop-opacity=".2"/>' +
      '<stop offset="100%" stop-color="#050204" stop-opacity="0"/>' +
      "</linearGradient>" +
      '<clipPath id="heClip"><path d="M14,130 Q200,18 386,130 Q200,242 14,130 Z"/></clipPath>' +
      '<filter id="heBlur"><feGaussianBlur stdDeviation="6"/></filter>' +
      "</defs>" +
      '<ellipse cx="200" cy="130" rx="196" ry="108" fill="url(#heGlow)"/>' +
      '<g clip-path="url(#heClip)">' +
      '<rect width="400" height="260" fill="url(#heSclera)"/>' +
      '<g stroke="#c01820" fill="none" opacity=".4" filter="url(#heBlur)">' +
      '<path d="M18,126 C70,96 110,90 150,98" stroke-width="1.4"/>' +
      '<path d="M22,140 C76,166 122,172 160,164" stroke-width="1.2"/>' +
      '<path d="M382,126 C330,96 290,90 250,98" stroke-width="1.4"/>' +
      '<path d="M378,140 C324,166 278,172 240,164" stroke-width="1.2"/>' +
      "</g>" +
      '<circle cx="200" cy="130" r="78" fill="url(#heIris)"/>' +
      '<g stroke="#ffb9a4" stroke-width=".7">' + fibers.join("") + "</g>" +
      '<circle cx="200" cy="130" r="78" fill="none" stroke="#1b0102" stroke-width="9" opacity=".35"/>' +
      '<circle cx="200" cy="130" r="72" fill="none" stroke="#ff9b84" stroke-width="1" opacity=".14"/>' +
      '<ellipse cx="200" cy="130" rx="12" ry="52" fill="#0a0102"/>' +
      '<ellipse cx="190" cy="106" rx="9" ry="15" fill="#fff" opacity=".12" filter="url(#heBlur)"/>' +
      '<ellipse cx="186" cy="100" rx="3.4" ry="6" fill="#fff" opacity=".26"/>' +
      '<rect y="0" width="400" height="60" fill="url(#heLid)"/>' +
      '<rect y="204" width="400" height="56" fill="url(#heLid)" transform="rotate(180 200 232)"/>' +
      "</g>" +
      '<path d="M14,130 Q200,18 386,130" fill="none" stroke="#8c0d12" stroke-width="1.4" opacity=".55"/>' +
      '<path d="M14,130 Q200,242 386,130" fill="none" stroke="#5a0508" stroke-width="1.2" opacity=".45"/>' +
      '<g stroke="#100002" stroke-width="1.8" stroke-linecap="round" opacity=".8">' + lashes.join("") + "</g>" +
      "</svg>"
    );
  }

  window.Art = { eye };
})();
