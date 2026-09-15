"use client";

import { useEffect, useRef } from "react";
import { mountMannequin } from "./mannequin";
import "./hero.css";

/** Replace only the old Hero3D component inside the existing FV. */
export default function HeroMannequin({ assetBase = "/mannequin" }: { assetBase?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    return mountMannequin(host.current, { assetBase });
  }, [assetBase]);

  return <div ref={host} className="hero3d" aria-hidden="true" style={{ position: "absolute", inset: 0 }} />;
}
