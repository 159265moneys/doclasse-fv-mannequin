"use client";
import { useEffect, useRef } from "react";
import { mountMannequin } from "./mannequin";
import type { MannequinOptions } from "./mannequin";
import "./hero.css";
export default function HeroMannequin({ assetBase="/mannequin", modelUrl, posterUrl, motion=true, getScroll, getPointer, subscribeReady }: MannequinOptions) {
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!host.current)return;
    return mountMannequin(host.current,{assetBase,modelUrl,posterUrl,motion,getScroll,getPointer,subscribeReady});
  },[assetBase,modelUrl,posterUrl,motion,getScroll,getPointer,subscribeReady]);
  return <div ref={host} className="hero3d" aria-hidden="true" style={{position:"absolute",inset:0}} />;
}
