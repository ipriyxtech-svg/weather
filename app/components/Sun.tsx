"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Sun() {
  const ref = useRef<any>(null);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.003;
  });

  return (
    <group>
      <mesh ref={ref} position={[5, 7, 0]} castShadow>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial color="orange" emissive="yellow" emissiveIntensity={1.5} />
      </mesh>

      <pointLight position={[5, 7, 0]} intensity={1.5} castShadow />
    </group>
  );
}