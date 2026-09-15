function D(y, b = {}) {
  if (!y) throw new Error("A mannequin container is required.");
  const A = (b.assetBase ?? "/mannequin").replace(/\/$/, ""), o = document.createElement("div");
  o.className = "mannequin-stage", o.setAttribute("aria-hidden", "true");
  const i = new Image();
  i.className = "mannequin-cycles", i.alt = "", i.width = 1400, i.height = 2e3, i.decoding = "async", i.fetchPriority = "high", i.src = b.posterUrl ?? `${A}/cycles-mannequin.webp`, o.append(i), y.append(o);
  const u = y.closest(".hero") ?? y, E = matchMedia("(prefers-reduced-motion: reduce)"), L = matchMedia("(pointer: fine)"), m = [], n = [];
  let s = !1, S = !1, M = !1, x = !1, f = !0, c = 0, d = 4, l = 4, h = 0;
  const v = () => b.motion !== !1 && !navigator.connection?.saveData && L.matches && !E.matches;
  function I() {
    cancelAnimationFrame(c), c = 0, h = 0;
  }
  function g() {
    I(), d = l = 4, i.style.opacity = "1";
    for (const t of n) t.style.opacity = "0";
  }
  function P(t) {
    if (c = 0, s || !f || document.hidden || !M || !v()) return;
    const r = h ? Math.min((t - h) / 1e3, 0.07) : 0.016;
    h = t, d += (l - d) * (1 - Math.exp(-r * 4));
    const e = Math.floor(d), p = Math.min(8, e + 1);
    n[0].dataset.index !== String(e) && (n[0].src = m[e].src, n[0].dataset.index = String(e)), n[1].dataset.index !== String(p) && (n[1].src = m[p].src, n[1].dataset.index = String(p)), i.style.opacity = "0", n[0].style.opacity = "1", n[1].style.opacity = String(d - e), Math.abs(l - d) > 3e-3 ? c = requestAnimationFrame(P) : (h = 0, l === 4 && g());
  }
  function q() {
    c || !M || s || !f || document.hidden || !v() || (c = requestAnimationFrame(P));
  }
  function C() {
    if (S || x || s || !v()) return;
    S = !0;
    const t = Array.from({ length: 9 }, (r, e) => new Promise((p, V) => {
      const a = new Image();
      a.decoding = "async", a.alt = "", a.fetchPriority = "low", a.onload = () => a.decode().then(p, V), a.onerror = V, a.src = `${A}/views/view-${String(e).padStart(2, "0")}.webp`, m[e] = a;
    }));
    Promise.all(t).then(() => {
      if (!s) {
        for (let r = 0; r < 2; r++) {
          const e = new Image();
          e.className = "mannequin-view", e.alt = "", e.width = 1050, e.height = 1500, e.decoding = "async", e.style.opacity = "0", o.append(e), n.push(e);
        }
        M = !0, q();
      }
    }).catch(() => {
      x = !0, g();
    });
  }
  function $(t) {
    if (!v() || !f || s) return;
    const r = u.getBoundingClientRect();
    r.width && (l = Math.max(0, Math.min(8, (t.clientX - r.left) / r.width * 8)), C(), q());
  }
  function B() {
    l = 4, q();
  }
  function w() {
    v() || g();
  }
  function F() {
    document.hidden && g();
  }
  const N = new IntersectionObserver(([t]) => {
    f = t.isIntersecting, f || g();
  });
  return N.observe(o), u.addEventListener("pointermove", $, { passive: !0 }), u.addEventListener("pointerleave", B), E.addEventListener("change", w), L.addEventListener("change", w), document.addEventListener("visibilitychange", F), () => {
    s = !0, I(), N.disconnect(), u.removeEventListener("pointermove", $), u.removeEventListener("pointerleave", B), E.removeEventListener("change", w), L.removeEventListener("change", w), document.removeEventListener("visibilitychange", F);
    for (const t of m)
      t.onload = null, t.onerror = null, t.removeAttribute("src");
    o.remove(), m.length = 0, n.length = 0;
  };
}
export {
  D as mountMannequin
};
