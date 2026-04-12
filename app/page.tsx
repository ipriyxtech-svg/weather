"use client";

import { useState, useMemo, useRef, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Sky } from "@react-three/drei";

const Rain = ({ count = 800 }: { count?: number }) => {
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
    drops.forEach((d) => {
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
      ref.current!.setMatrixAt(drops.indexOf(d), dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
      <meshStandardMaterial color="#76c7ff" metalness={0.1} roughness={0.5} />
    </instancedMesh>
  );
};

const Sun = () => {
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
};

const Scene = ({ weather }: { weather: string }) => {
  const w = (weather || "").toLowerCase();
  const isRain = w.includes("rain") || w.includes("drizzle") || w.includes("thunderstorm");
  const isClear = w.includes("clear") || w.includes("sun");
  const isFog = w.includes("mist") || w.includes("fog") || w.includes("haze");

  const fogColor = isRain ? "#0c1021" : isFog ? "#1d2738" : "#0b1220";
  const orbColor = isRain ? "#5db8ff" : isFog ? "#a0b2cf" : isClear ? "#ffce3a" : "#8b5cf6";

  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#b8d3ff", "#0a1626", 0.6]} />
      <directionalLight
        castShadow
        position={[5, 10, 5]}
        intensity={1.3}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Suspense fallback={null}>
        <Environment preset={isClear ? "sunset" : "warehouse"} />
      </Suspense>
      <Sky sunPosition={isRain ? ([5, 8, -5] as [number, number, number]) : ([5, 10, 2] as [number, number, number])} turbidity={isRain ? 15 : 8} rayleigh={1} />
      <OrbitControls enableZoom enablePan maxPolarAngle={Math.PI / 2} />
      {isRain && <Rain />}
      {isFog && <fog attach="fog" args={[fogColor, 5, 35]} />}
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -1.2, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0b1220" metalness={0.2} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color={orbColor}
          emissive={orbColor}
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, 1.5, 0]}>
        <torusGeometry args={[2.4, 0.03, 16, 100]} />
        <meshBasicMaterial color="rgba(255,255,255,0.15)" transparent />
      </mesh>
      <ContactShadows position={[0, -1.2, 0]} opacity={0.55} scale={22} blur={3} />
    </>
  );
};

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [weatherDetails, setWeatherDetails] = useState<{
    name: string;
    temp: number;
    description: string;
    feelsLike: number;
  } | null>(null);

  const handleSearch = async () => {
    setError(null);
    if (!city) return setError('Enter a city');

    console.log('Searching for city:', city)
    setLoading(true)
    try {
      const resp = await fetch(`/api/weather?q=${encodeURIComponent(city)}`)
      const data = await resp.json()
      console.log('Weather API response:', data)

      if (resp.ok && data?.weather?.length > 0) {
        setWeather(data.weather[0].main)
        setWeatherDetails({
          name: data.name || city,
          temp: data.main?.temp ?? NaN,
          feelsLike: data.main?.feels_like ?? NaN,
          description: data.weather[0]?.description || data.weather[0]?.main || '',
        })
      } else {
        setWeather("")
        setWeatherDetails(null)
        setError(data?.message || 'City not found')
      }
    } catch (e) {
      console.error(e)
      setError('Failed to fetch weather')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-start bg-[#030712]">
      <div className="w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-2xl shadow-slate-950/40 backdrop-blur-xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 items-center text-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-4 py-2 text-xs text-cyan-200 font-semibold tracking-[0.25em] uppercase">
                ipriyxtech weather
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                ipriyxtech Weather
              </h1>
              <p className="mt-4 text-slate-300 sm:text-base">
                Weather in one place — fast, simple, and 3D.
              </p>
            </div>
            <div className="w-full rounded-[2rem] border border-white/10 bg-slate-900/95 p-4 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  className="w-full flex-1 rounded-full border border-white/10 bg-white/95 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                />
                <button
                  onClick={handleSearch}
                  className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-500"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-[1.75rem] bg-red-500/10 border border-red-500/20 px-5 py-4 text-red-200">
              {error}
            </div>
          )}

          {weatherDetails && (
            <div className="mt-6 mx-auto w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-900/90 p-4 text-slate-100 shadow-xl shadow-slate-950/40 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-slate-950/90 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">City</p>
                  <p className="mt-2 text-2xl font-semibold">{weatherDetails.name}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-950/90 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Temperature</p>
                  <p className="mt-2 text-2xl font-semibold">{Math.round(weatherDetails.temp)}°C</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-950/90 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Condition</p>
                  <p className="mt-2 text-2xl font-semibold capitalize">{weatherDetails.description}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-950/90 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Feels Like</p>
                  <p className="mt-2 text-2xl font-semibold">{Math.round(weatherDetails.feelsLike)}°C</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl px-4 pb-8 sm:px-6 mx-auto">
        <div className="relative h-[420px] sm:h-[520px] lg:h-[640px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 3.2, 9], fov: 45 }}>
            <Scene weather={weather} />
          </Canvas>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 to-transparent" />
        </div>
      </div>
    </div>
  );
}