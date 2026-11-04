/* 背景余烬：低密度漂浮粒子 */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  function start() {
    const canvas = document.getElementById("ambient");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0,
      h = 0,
      raf = 0,
      visible = true;
    const parts = [];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(initial) {
      const z = Math.random();
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        z,
        r: 0.4 + z * 1.6,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(0.05 + z * 0.22),
        phase: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.004,
      };
    }

    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 44; i++) parts.push(spawn(true));

    function frame(t) {
      if (!visible) {
        raf = requestAnimationFrame(frame);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx * (0.4 + p.z);
        p.y += p.vy * (0.4 + p.z);
        p.phase += p.speed * 16;
        if (p.y < -12) Object.assign(p, spawn(false));
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
        const flicker = 0.55 + 0.45 * Math.sin(p.phase);
        const a = (0.05 + p.z * 0.4) * flicker;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255," + Math.floor(90 + p.z * 80) + ",60," + a.toFixed(3) + ")";
        ctx.arc(p.x, p.y, p.r * (0.8 + flicker * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
