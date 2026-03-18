"use client";

import { Canvas } from "@react-three/fiber";
import GlassObject from "./GlassObject";
import { Environment } from "@react-three/drei";

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <Environment preset="city" />
      <GlassObject />
    </Canvas>
  );
}
