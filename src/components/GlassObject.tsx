"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

export default function GlassObject() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Very slow, premium rotation
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
      
      // Gentle cursor parallax
      const targetX = (state.mouse.x * 0.3) - meshRef.current.position.x;
      const targetY = (state.mouse.y * 0.3) - meshRef.current.position.y;
      meshRef.current.position.x += targetX * 0.05;
      meshRef.current.position.y += targetY * 0.05;
    }
  });

  return (
    <Float 
        speed={1.5} 
        rotationIntensity={0.5} 
        floatIntensity={0.5} 
        floatingRange={[-0.1, 0.1]}
    >
      <mesh ref={meshRef} position={[2, 0, 0]} scale={1.8}>
        {/* A complex, elegant geometric shape */}
        <torusKnotGeometry args={[1, 0.3, 256, 64]} />
        
        {/* Real-time physical glass material doing raycasting/refraction */}
        <MeshTransmissionMaterial 
          backside 
          backsideThickness={1.5} 
          thickness={1.5} 
          resolution={256} // Capped resolution to drastically improve fps
          samples={4} // Reduced sampling from default to prevent stuttering
          anisotropicBlur={0.1}
          chromaticAberration={0.05}
          distortion={0.3}
          distortionScale={0.5}
          temporalDistortion={0.0} // Disabled temporal distortion (time-based noise recalculation)
          clearcoat={0.5}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          color="#ffffff"
        />
      </mesh>
    </Float>
  );
}
