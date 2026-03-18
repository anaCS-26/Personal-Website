"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import GlassObject from "./GlassObject";
import { Environment } from "@react-three/drei";

export default function Scene() {
  return (
    <Canvas 
      camera={{ position: [0, 0, 8], fov: 45 }} 
      dpr={[1, 1.5]}
      aria-hidden="true"
      tabIndex={-1}
      style={{ pointerEvents: 'none' }} /* Prevent mobile scroll blocking if not needed */
    >
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <Environment preset="city" />
      <Suspense fallback={null}>
        <GlassObject />
      </Suspense>
    </Canvas>
  );
}
