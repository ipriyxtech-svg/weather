"use client";

import { Suspense } from "react";
import { OrbitControls, Environment, ContactShadows, Sky } from "@react-three/drei";
import Sun from "./Sun";
import Rain from "./Rain";

export default function Scene({ weather }: { weather: string }) {
  const w = (weather || '').toLowerCase();

  const isRain = w.includes('rain') || w.includes('drizzle') || w.includes('thunderstorm');
  const isClear = w.includes('clear') || w.includes('haze') || w.includes('sun');
  const isSnow = w.includes('snow');
  const isFog = w.includes('mist') || w.includes('fog') || w.includes('haze');

  return (
    <>
      <ambientLight intensity={0.4} />

      <directionalLight
        castShadow
        position={[5, 10, 5]}
        intensity={1}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      <Suspense fallback={null}>
        <Environment preset={isClear ? 'sunset' : 'city'} />
      </Suspense>

      <Sky sunPosition={[5, 10, 2]} />

      <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2} />

      {isClear && <Sun />}
      {isRain && <Rain />}

      {isFog && <fog attach="fog" args={["#0b1220", 5, 40]} />}

      <mesh
        receiveShadow
        rotation-x={-Math.PI / 2}
        position={[0, -1, 0]}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>

      <ContactShadows position={[0, -1, 0]} opacity={0.6} scale={20} blur={2} />
    </>
  );
}