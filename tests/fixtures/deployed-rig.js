  function r9({ children: e10 }) {
    let t10 = (0, l.useRef)(null), { viewport: r3, camera: n2, size: o2 } = (0, s.useThree)();
    return (0, i.useFrame)((e11, a2) => {
      let i2 = t10.current;
      if (!i2) return;
      let s2 = o2.width / o2.height > 1.05, l2 = rX.heroState.scroll, c2 = s2 ? Math.min(0.22 * r3.width, 1.25) : 0;
      i2.position.x = u.MathUtils.damp(i2.position.x, c2 - 0.2 * l2, 4, a2), i2.position.y = u.MathUtils.damp(i2.position.y, (s2 ? -0.02 : -1.05) + 0.5 * l2, 4, a2), i2.scale.setScalar(u.MathUtils.damp(i2.scale.x, s2 ? 1 : 0.62, 4, a2)), i2.rotation.y += 0.12 * a2, i2.rotation.x = u.MathUtils.damp(i2.rotation.x, 0.06 * rj.runtime.pointer.ny, 3, a2), i2.rotation.z = u.MathUtils.damp(i2.rotation.z, -(0.04 * rj.runtime.pointer.nx), 3, a2), n2.position.x = u.MathUtils.damp(n2.position.x, 0.25 * rj.runtime.pointer.nx, 2.5, a2), n2.position.y = u.MathUtils.damp(n2.position.y, 0.15 - 0.15 * rj.runtime.pointer.ny, 2.5, a2), n2.position.z = u.MathUtils.damp(n2.position.z, 5.2 - 1.4 * l2, 3, a2), n2.lookAt(0, 0, 0);
    }), (0, a.jsx)("group", { ref: t10, children: e10 });
  }
