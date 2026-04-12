"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Rain({ count = 800 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const drops = useMemo(() => {
    const arr: { x: number; y: number; z: number; speed: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 30,
        y: Math.random() * 12 + 2,
        z: (Math.random() - 0.5) * 30,
        speed: Math.random() * 0.15 + 0.02,
      });
    }
    return arr;
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y -= d.speed;
      if (d.y < -2) {
        d.y = Math.random() * 12 + 8;
        d.x = (Math.random() - 0.5) * 30;
        d.z = (Math.random() - 0.5) * 30;
      }

      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(0.02, 0.6, 0.02);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }

    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
      <meshStandardMaterial color="#76c7ff" metalness={0.1} roughness={0.5} />
    </instancedMesh>
  );
}