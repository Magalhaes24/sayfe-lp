import { Suspense, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import "./Tests copy.css";
import Model from "../components/Model";
import startImage from "../assets/models/screen/Start.png";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

const SCENE_CONFIG = {
  camera: { z: 4.8, y: 0.1, fov: 50 },
  scales: {
    base: 0.35,
    small: 0.35 * 0.85,
    end: 0.35 * 0.85 * 1.6,
    hidden: 0.001
  },
  start: {
    rightPos: [0.95, 0.08, -0.2],
    rightRot: [0.02, Math.PI, 0]
  },
  segmentA: {
    rightPos: [0.9, 0.05, 0.7],
    rightRot: [-0.1, Math.PI - Math.PI * 0.6, 0],
    orbit: {
      radiusX: 2.4,
      radiusZ: 0.55,
      y: 0.1,
      rightStart: -Math.PI * 0.1,
      rightEnd: -Math.PI * 1.5
    }
  },
  segmentB: {
    rightPos: [0.85, 0.05, 0.7],
    rightRot: [0.2, Math.PI - 10.35, 0]
  },
  segmentC: {
    rightPos: [0.85, 0.05, 0.7],
    rightRot: [0.2, Math.PI - 10.35, 0]
  },
  segmentD: {
    rightPos: [1.05, -0.06, 0.25],
    rightRot: [0.1, Math.PI - 9.9, 0]
  },
  segmentE: {
    rightPos: [0.9, 0.05, 0.7],
    rightRot: [0.2, Math.PI - 10.35, 0]
  },
  segments: {
    a: [0, 0.22],
    a1: [0.22, 0.28],
    b: [0.35, 0.52],
    c: [0.52, 0.76],
    d: [0.76, 0.97],
    e: [0.97, 1]
  },
  drift: {
    amplitude: 0.02,
    speed: 0.8
  }
};

function useScrollProgress(containerRef) {
  const progressRef = useRef(0);

  useEffect(() => {
    function update() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        progressRef.current = 0;
        return;
      }
      const scrolled = clamp(-rect.top / total, 0, 1);
      progressRef.current = scrolled;
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [containerRef]);

  return progressRef;
}

function Scene({ progressRef }) {
  const modelRef = useRef(null);

  useFrame(({ clock }) => {
    if (!modelRef.current) return;
    const p = progressRef.current;
    const drift =
      Math.sin(clock.getElapsedTime() * SCENE_CONFIG.drift.speed) *
      SCENE_CONFIG.drift.amplitude;

    const { segments, start, segmentA, segmentB, segmentC, segmentD, segmentE, scales } =
      SCENE_CONFIG;

    if (p <= segments.a[1]) {
      const t = clamp((p - segments.a[0]) / (segments.a[1] - segments.a[0]), 0, 1);
      const angle = lerp(segmentA.orbit.rightStart, segmentA.orbit.rightEnd, t);
      const x = Math.cos(angle) * segmentA.orbit.radiusX;
      const z = Math.sin(angle) * segmentA.orbit.radiusZ;
      modelRef.current.position.set(x, segmentA.orbit.y + drift, z);
      modelRef.current.rotation.set(
        lerp(start.rightRot[0], segmentA.rightRot[0], t),
        Math.atan2(x, z) + Math.PI,
        0
      );
      const s = lerp(scales.base, scales.small, t);
      modelRef.current.scale.setScalar(s);
      return;
    }

    if (p <= segments.a1[1]) {
      const t = clamp((p - segments.a1[0]) / (segments.a1[1] - segments.a1[0]), 0, 1);
      modelRef.current.position.set(...segmentA.rightPos);
      modelRef.current.rotation.set(
        segmentA.rightRot[0],
        lerp(segmentA.rightRot[1], segmentA.rightRot[1] + Math.PI, t),
        0
      );
      modelRef.current.scale.setScalar(scales.small);
      return;
    }

    if (p <= segments.b[1]) {
      const t = clamp((p - segments.b[0]) / (segments.b[1] - segments.b[0]), 0, 1);
      modelRef.current.position.set(
        lerp(segmentA.rightPos[0], segmentB.rightPos[0], t),
        lerp(segmentA.rightPos[1], segmentB.rightPos[1], t) + drift,
        lerp(segmentA.rightPos[2], segmentB.rightPos[2], t)
      );
      modelRef.current.rotation.set(
        lerp(segmentA.rightRot[0], segmentB.rightRot[0], t),
        lerp(segmentA.rightRot[1] + Math.PI, segmentB.rightRot[1], t),
        0
      );
      modelRef.current.scale.setScalar(scales.small);
      return;
    }

    if (p <= segments.c[1]) {
      const t = clamp((p - segments.c[0]) / (segments.c[1] - segments.c[0]), 0, 1);
      const wobble = Math.sin(t * Math.PI * 4) * 0.03;
      modelRef.current.position.set(
        segmentC.rightPos[0] + wobble,
        segmentC.rightPos[1] + wobble * 0.4,
        segmentC.rightPos[2]
      );
      modelRef.current.rotation.set(
        segmentC.rightRot[0],
        segmentC.rightRot[1],
        wobble * 0.3
      );
      modelRef.current.scale.setScalar(scales.small);
      return;
    }

    if (p <= segments.d[1]) {
      const t = clamp((p - segments.d[0]) / (segments.d[1] - segments.d[0]), 0, 1);
      modelRef.current.position.set(
        lerp(segmentC.rightPos[0], segmentD.rightPos[0], t),
        lerp(segmentC.rightPos[1], segmentD.rightPos[1], t),
        lerp(segmentC.rightPos[2], segmentD.rightPos[2], t)
      );
      modelRef.current.rotation.set(
        lerp(segmentC.rightRot[0], segmentD.rightRot[0], t),
        lerp(segmentC.rightRot[1], segmentD.rightRot[1], t),
        0
      );
      modelRef.current.scale.setScalar(lerp(scales.small, scales.end, t));
      return;
    }

    const t = clamp((p - segments.e[0]) / (segments.e[1] - segments.e[0]), 0, 1);
    modelRef.current.position.set(...segmentE.rightPos);
    modelRef.current.rotation.set(...segmentE.rightRot);
    modelRef.current.scale.setScalar(lerp(scales.end, scales.hidden, t));
  });

  return (
    <group ref={modelRef}>
      <Model screenImage={startImage} />
    </group>
  );
}

export default function Home() {
  const containerRef = useRef(null);
  const progressRef = useScrollProgress(containerRef);
  const captions = useMemo(
    () => [
      "Scroll to explore the device",
      "A clean screen, clear details",
      "Rotate into the hero angle"
    ],
    []
  );

  return (
    <div className="home" ref={containerRef}>
      <header className="home__header">
        <div>
          <p className="home__kicker">Scroll Showcase</p>
          <h1 className="home__title">Untitled Model</h1>
          <p className="home__subtitle">A scroll-driven 3D scene inspired by fizzi.</p>
        </div>
        <div className="home__links">
          <Link to="/viewer" className="home__link">Viewer</Link>
        </div>
      </header>

      <div className="home__canvas">
        <Canvas
          camera={{ position: [0, SCENE_CONFIG.camera.y, SCENE_CONFIG.camera.z], fov: SCENE_CONFIG.camera.fov }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#e3eee6"]} />
          <ambientLight intensity={0.7} />
          <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#cbd5f5" />
          <directionalLight position={[6, 8, 6]} intensity={0.9} />
          <directionalLight position={[-4, 6, -6]} intensity={0.6} />
          <Suspense fallback={<Html center className="home__loader">Loading model...</Html>}>
            <Scene progressRef={progressRef} />
          </Suspense>
        </Canvas>
      </div>

      {captions.map((copy, index) => (
        <section key={copy} className={`home__section home__section--${index + 1}`}>
          <div className="home__copy">
            <p className="home__step">0{index + 1}</p>
            <h2>{copy}</h2>
          </div>
        </section>
      ))}
    </div>
  );
}
