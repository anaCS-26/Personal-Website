"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function NeuralNetwork() {
  const particlesRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const layerDefs = [
    { x: -5, count: 24, radius: 2.5 },
    { x: -2.5, count: 54, radius: 3.5 },
    { x: 0, count: 64, radius: 4 },
    { x: 2.5, count: 54, radius: 3.5 },
    { x: 5, count: 6, radius: 1.5 },
  ];

  // Generate nodes (neurons)
  const nodes = useMemo(() => {
    const pts: {x: number, y: number, z: number, layer: number}[] = [];
    for (let i = 0; i < layerDefs.length; i++) {
      const def = layerDefs[i];
      for (let j = 0; j < def.count; j++) {
        // Random point within a circle for the layer
        const r = def.radius * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const y = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        
        // Add minimal noise to the x position so lawyers aren't completely flat
        const x = def.x + (Math.random() - 0.5) * 0.8;
        pts.push({ x, y, z, layer: i });
      }
    }
    return pts;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const positions = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      pos[i * 3] = n.x;
      pos[i * 3 + 1] = n.y;
      pos[i * 3 + 2] = n.z;
    });
    return pos;
  }, [nodes]);

  // Generate edges (synapses connecting layers)
  const edges = useMemo(() => {
    const edg: {a: number, b: number}[] = [];
    for (let i = 0; i < layerDefs.length - 1; i++) {
      const layerA = nodes.filter(n => n.layer === i);
      const layerB = nodes.filter(n => n.layer === i + 1);
      
      layerA.forEach((nodeA) => {
        // Connect to a small random subset of the next layer
        const numConnections = Math.min(layerB.length, 6 + Math.floor(Math.random() * 5));
        
        // Shuffle and pick subset
        const targets = [...layerB].sort(() => 0.5 - Math.random()).slice(0, numConnections);
        
        targets.forEach(nodeB => {
            edg.push({
                a: nodes.indexOf(nodeA),
                b: nodes.indexOf(nodeB)
            });
        });
      });
    }
    return edg;
  }, [nodes]); // eslint-disable-line react-hooks/exhaustive-deps

  const linePositions = useMemo(() => {
    const pos = new Float32Array(edges.length * 6);
    edges.forEach((edge, i) => {
      const nodeA = nodes[edge.a];
      const nodeB = nodes[edge.b];
      pos[i * 6] = nodeA.x;
      pos[i * 6 + 1] = nodeA.y;
      pos[i * 6 + 2] = nodeA.z;
      pos[i * 6 + 3] = nodeB.x;
      pos[i * 6 + 4] = nodeB.y;
      pos[i * 6 + 5] = nodeB.z;
    });
    return pos;
  }, [edges, nodes]);

  const lineColors = useMemo(() => {
    const col = new Float32Array(edges.length * 6);
    return col;
  }, [edges]);

  const particlesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const linesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    (geo.attributes.color as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
    return geo;
  }, [linePositions, lineColors]);

  const pulseSpeed = 4.0; 

  useFrame((state) => {
    if (!particlesRef.current || !linesRef.current) return;
    
    // Slow cinematic rotation mimicking floating in a void
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    particlesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    linesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;

    // Interactive mouse parallax
    const targetX = state.mouse.x * 0.5;
    const targetY = state.mouse.y * 0.5;
    particlesRef.current.position.y += (targetY - particlesRef.current.position.y) * 0.05;
    particlesRef.current.position.x += (targetX - particlesRef.current.position.x) * 0.05;
    linesRef.current.position.y += (targetY - linesRef.current.position.y) * 0.05;
    linesRef.current.position.x += (targetX - linesRef.current.position.x) * 0.05;

    // Firing signal pulse traversing the network
    const time = state.clock.elapsedTime * pulseSpeed;
    const pulseX = ((time % 15) - 6); 
    
    const colorAttr = linesRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const posAttr = linesRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < edges.length; i++) {
        const xA = posAttr.getX(i * 2);
        const xB = posAttr.getX(i * 2 + 1);
        const midX = (xA + xB) / 2;
        
        // Intensity peaks when the pulse sweeps across the X axis of the connections
        const dist = Math.abs(midX - pulseX);
        const intensity = Math.max(0, 1.0 - dist * 1.5);

        // Mix between dark muted base (0.05, 0.05, 0.1) and bright cyan/purple when activated
        const r = 0.05 + 0.39 * intensity; // Mix to #7000ff (Purple)
        const g = 0.05 + 0.89 * intensity; // Mix to #00f0ff (Cyan)
        const b = 0.1 + 0.9 * intensity;
        
        colorAttr.setXYZ(i * 2, r, g, b);
        colorAttr.setXYZ(i * 2 + 1, r, g, b);
    }
    
    colorAttr.needsUpdate = true;
  });

  return (
    <group position={[1.5, 0, 0]} scale={0.7}>
      <points ref={particlesRef} geometry={particlesGeometry}>
        <pointsMaterial size={0.15} color="#ffffff" transparent opacity={0.6} />
      </points>
      <lineSegments ref={linesRef} geometry={linesGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
}
