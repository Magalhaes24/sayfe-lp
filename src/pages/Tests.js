import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF, useProgress, useTexture } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import "../components/Scroll3DHero.css";
import { ScrollStack, ScrollStackItem } from "../components/ScrollStack";
import { useTranslation } from "../contexts/LanguageContext";
import Model from "../components/Model";
import LoadingScreen from "../components/LoadingScreen";
import startImage from "../assets/models/screen/Start.png";
import profileImage from "../assets/models/screen/Perfil Refeito.png";
import scannerImage from "../assets/models/screen/Scanner.png";
import scannerDangerImage from "../assets/models/screen/Scanner Perigoso.png";

/**
 * Tests page animation map
 * ------------------------
 * The animation is driven by a single scroll progress value (0..1).
 * CONFIG holds every tunable number (camera, sizes, positions, rotations).
 * The Scene reads progress and applies the correct segment logic.
 *
 * Segment timeline:
 * A (0 -> 0.30): two phones orbit around the headline.
 * A1 (0.35 -> 0.42): rotate phones 180deg to face the user.
 * B (0.42 -> 0.55): left phone dissolves, right phone becomes main.
 * C (0.55 -> 0.86): food appears at a fixed point, scan line sweeps.
 * D (0.86 -> 0.97): phone scales up for the final hero pose.
 * E (0.97 -> 1.00): everything fades out.
 */

const MODEL_URLS = {
  food: "/models/food_package.glb"
};

const SCREEN_SWITCH = {
  lead: 0.015,
  finalLead: -0.015
};

const CONFIG = {
  // Camera framing for desktop/mobile.
  // Tuning guide:
  // - camera: controls framing for desktop/mobile.
  // - scales: base sizes for phone/food and derived sizes.
  // - start: initial positions/rotations at 0% scroll.
  // - segmentA: orbit/rotation for the spin phase.
  // - segmentA1: flip phones to show the screen.
  // - segmentB: positions/rotations for the merge + dissolve.
  // - segmentC: food fixed point + scan.
  // - segmentD: end pose (phone right, scaled up).
  // - segmentE: fade everything out.
  // - scan: line size/offset/sweep count.
  // - segments: timeline ranges (0..1).
  // camera: Z farther = smaller models, Y higher = higher framing.
  camera: { desktopZ: 4.8, mobileZ: 5.6, y: 0.1 },
  scales: {
    // Phone scale values.
    // phoneBase: size at 0% scroll.
    phoneBase: 0.35,
    // phoneSmall: size during the orbit.
    phoneSmall: 0.35 * 0.85,
    // phoneEnd: size during the final hold.
    phoneEnd: 0.35 * 0.85 * 1.6,
    // Food scale values (big by design).
    // foodBase/foodScan: size of the food package in scan segment.
    foodBase: 0.15 * 15.4,
    foodScan: 0.15 * 16.6,
    // Keep >0 to avoid matrix issues.
    hidden: 0.001
  },
  start: {
    // Two phones, front-facing, with headline between them.
    // leftPos/rightPos: widen X to increase gap from the headline.
    leftPos: [-1.35, 0.12, -0.3],
    rightPos: [1.35, 0.12, -0.3],
    // leftRot/rightRot: adjust Y to show front/back (Math.PI = front).
    leftRot: [0.02, Math.PI, 0],
    rightRot: [0.02, Math.PI, 0],
    // Food stays fixed; set same position as segmentC.
    foodPos: [1.1, -0.05, 0.28],
    foodRot: [0, 0.1, 0]
  },
  segmentA: {
    // Orbit around the headline (spin).
    // leftPos/rightPos: resting position after the orbit ends.
    leftPos: [-1.2, 0.05, 0.8],
    rightPos: [1.2, 0.05, 0.8],
    leftRot: [-0.1, Math.PI + Math.PI * 0.6, 0],
    rightRot: [-0.1, Math.PI - Math.PI * 0.6, 0],
    orbit: {
      // Orbit radii and angles (radians).
      // radiusX/radiusZ: larger values = wider orbit.
      // leftStart/rightStart and leftEnd/rightEnd: arc for each phone.
      radiusX: 3.5,
      radiusZ: 0.75,
      y: 0.12,
      leftStart: Math.PI * 1.1,
      leftEnd: Math.PI * 2.5,
      rightStart: -Math.PI * 0.1,
      rightEnd: -Math.PI * 1.5
    }
  },
  segmentB: {
    // Merge into the right phone and dissolve left.
    // leftPos: target for the dissolving phone.
    leftPos: [1.5, 0.05, 1.0],
    // Targets for the end of segment B (start is orbit end).
    // rightPos/rightRot: scan pose (kept for segment D).
    rightPos: [1.05, 0.05, 0.8],
    rightRot: [0.2, Math.PI - 10.35, 0]
  },
  segmentC: {
    // Food fixed point during scan.
    // foodPos: X pushes right, Z moves toward camera.
    foodPos: [2.5, -0.05, 1.18]
  },
  segmentD: {
    foodPos: [1.2, -0.6, 0.65],
    rightPos: [1.45, -0.1, 0.3],
    rightRot: [0.1, Math.PI - 9.9, 0]
  },
  segmentE: {
    // End pose: phone right, scaled up.
    // rightPos/rightRot: final hero pose.
    rightPos: [1.05, 0.05, 0.8],
    rightRot: [0.2, Math.PI - 10.35, 0]
  },
  scan: {
    // Scan line size/offset and sweep range.
    // size: width/height of the scan line plane.
    // offset: local position inside the food group.
    // sweepTop/sweepBottom: travel distance of the scan line.
    size: [0.6, 0.02],
    offset: [-0.07, 0.2, 0.12],
    sweepTop: 0.25,
    sweepBottom: -0.25,
    sweeps: 3
  },
  floor: {
    // Ground plane position to avoid cutting the phone at the end.
    // Lower endY to reveal more of the big phone.
    startY: -2.2,
    endY: -5
  },
  segments: {
    // Timeline segments expressed as scroll progress (0..1).
    a:     [0,    0.22], // Orbit phones around headline.
    a1:    [0.22, 0.28], // Flip phones to face the user.
    aHold: [0.28, 0.35], // Hold between A1 and B (implicit: B branch runs at t=0).
    b:     [0.35, 0.52], // Merge + dissolve left phone.
    bHold: [0.52, 0.52], // Hold after B (0 = immediate C).
    c:     [0.52, 0.76], // Food appears + scan sweep.
    d:     [0.76, 0.80], // Phone scales up to hero pose.
    dHold: [0.80, 0.97], // Hold hero pose until E.
    e:     [0.97, 1]     // Fade everything out.
  },
  // Relative caption durations (last one longer).
  // captionDurations: relative time for each caption (last is longest).
  captionDurations: [0.9, 1.0, 1.85, 2],
  // Final scale timing (0..1 local progress within last caption).
  // Increase endScaleDuration to make the growth slower.
  endScaleStart: -1.6,
  endScaleDuration: 0.6,
  captions: [
    "Your new allergen companion",
    "helps you identify risks clearly",
    "scan the product for personalized easy to read information",
    "yes it is this simple and stress free"
  ]
};

// Mobile-specific tuning so everything fits on smaller screens.
const MOBILE_CONFIG = {
  ...CONFIG,
  camera: { desktopZ: 4.8, mobileZ: 6.4, y: 0.18 },
  scales: {
    phoneBase: 0.1,
    phoneSmall: 0.1 * 0.85,
    phoneEnd: 0.1 * 0.85 * 2,
    foodBase: 0.1 * 10.5,
    foodScan: 0.1 * 11.5,
    hidden: 0.001
  },
  start: {
    ...CONFIG.start,
    leftPos: [-0.85, -0.05, -0.35],
    rightPos: [0.85, -0.05, -0.35],
    foodPos: [0.7, -0.12, 0.2]
  },
  segmentA: {
    ...CONFIG.segmentA,
    leftPos: [-0.9, -0.05, 0.7],
    rightPos: [0.9, -0.05, 0.7],
    orbit: {
      ...CONFIG.segmentA.orbit,
      radiusX: 1.9,
      radiusZ: 0.6,
      y: 0.1,
      leftEnd: Math.PI * 2.15,
      rightEnd: -Math.PI * 1.15
    }
  },
  segmentB: {
    ...CONFIG.segmentB,
    leftPos: [-1.1, -0.08, 0.9],
    rightPos: [0.05, -0.08, 0.5]
  },
  segmentC: {
    ...CONFIG.segmentC,
    foodPos: [0.85, -0.12, 0.9]
  },
  segmentD: {
    ...CONFIG.segmentD,
    foodPos: [0.9, -0.6, 0.6],
    rightPos: [0.6, -0.02, 0.22]
  },
  scan: {
    ...CONFIG.scan,
    size: [0.5, 0.02],
    offset: [-0.05, 0.18, 0.1],
    sweepTop: 0.22,
    sweepBottom: -0.22,
    sweeps: 2.2
  }
  ,
  floor: {
    startY: -1.2,
    endY: -1.5
  }
};

// Preload GLB models so the animation starts without pop-in.
useGLTF.preload(MODEL_URLS.food);
useTexture.preload(startImage);
useTexture.preload(profileImage);
useTexture.preload(scannerImage);
useTexture.preload(scannerDangerImage);

// Helpers for smooth interpolation.
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => t * t * (3 - 2 * t);
const normalizeAngle = (value) => {
  const twoPi = Math.PI * 2;
  return ((value % twoPi) + twoPi) % twoPi;
};
const shortestAngleDelta = (a, b) => {
  const delta = normalizeAngle(b) - normalizeAngle(a);
  return delta > Math.PI ? delta - Math.PI * 2 : delta < -Math.PI ? delta + Math.PI * 2 : delta;
};
const lerpAngle = (a, b, t) => a + shortestAngleDelta(a, b) * t;
// Caption timing within each caption window (0..1 local progress).
// Increasing HOLD_START/HOLD_END widens the full-opacity plateau.
const CAPTION_HOLD_START = 0.18;
const CAPTION_HOLD_END = 0.78;

// Linear interpolation for vector3 arrays.
function lerpVec3(target, a, b, t) {
  target.set(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

// Orbit helper for segment A (phones circle the headline).
function orbitPosition(orbit, angle) {
  return {
    x: Math.cos(angle) * orbit.radiusX,
    y: orbit.y,
    z: Math.sin(angle) * orbit.radiusZ
  };
}

// Caption helpers to map progress to weighted caption windows.
function getCaptionWindow(progress, durations) {
  const total = durations.reduce((sum, value) => sum + value, 0);
  const clamped = clamp(progress, 0, 1);
  let cursor = 0;
  let index = durations.length - 1;
  for (let i = 0; i < durations.length; i += 1) {
    const next = cursor + durations[i];
    if (clamped * total <= next) {
      index = i;
      break;
    }
    cursor = next;
  }
  const duration = durations[index] ?? 1;
  const start = cursor / total;
  const end = (cursor + duration) / total;
  // local: 0..1 progress inside the current caption window.
  const local = duration === 0 ? 1 : (clamped - start) / (end - start);
  return { index, local, start, end };
}

function getCaptionBounds(index, durations) {
  const total = durations.reduce((sum, value) => sum + value, 0);
  const startValue = durations.slice(0, index).reduce((sum, value) => sum + value, 0);
  const duration = durations[index] ?? 1;
  return {
    start: startValue / total,
    end: (startValue + duration) / total
  };
}

function getCaptionOpacity(local) {
  if (local >= CAPTION_HOLD_START && local <= CAPTION_HOLD_END) {
    return 1;
  }
  if (local < CAPTION_HOLD_START) {
    return clamp(local / CAPTION_HOLD_START, 0, 1);
  }
  return clamp((1 - local) / (1 - CAPTION_HOLD_END), 0, 1);
}

// Orientation offset to ensure phones show their front.
const FRONT_Y = Math.PI;

// Clone and center a GLB scene so group transforms stay consistent.
function cloneCentered(scene) {
  const clone = scene.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const center = box.getCenter(new THREE.Vector3());
  clone.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry = child.geometry.clone();
    if (child.material) {
      child.material = child.material.clone();
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => {
        if (material.map && material.map.colorSpace !== undefined) {
          material.map.colorSpace = THREE.SRGBColorSpace;
        }
        if (material.emissiveMap && material.emissiveMap.colorSpace !== undefined) {
          material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
        }
        const hasAlpha =
          material.transparent ||
          material.opacity < 1 ||
          material.alphaTest > 0 ||
          material.alphaMap;
        material.transparent = hasAlpha;
        material.depthWrite = !hasAlpha;
        material.needsUpdate = true;
      });
    }
    child.castShadow = false;
    child.receiveShadow = false;
  });
  clone.position.sub(center);
  return clone;
}

function collectGroupMaterials(group) {
  if (!group) return [];
  // Do not cache: Model.js may replace the screen MeshBasicMaterial on mount,
  // and a stale cache would cause setGroupOpacity to write to a disposed material.
  const materials = [];
  group.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const list = Array.isArray(child.material) ? child.material : [child.material];
    list.forEach((material) => materials.push(material));
  });
  return materials;
}

function setGroupReflectionsMuted(group) {
  if (!group) return;
  const materials = collectGroupMaterials(group);
  if (!materials.length) return;
  materials.forEach((material) => {
    if (material.userData.baseEnvMapIntensity === undefined) {
      material.userData.baseEnvMapIntensity = material.envMapIntensity;
    }
    // envMapIntensity is a uniform — no needsUpdate required.
    if (material.envMapIntensity !== undefined && material.envMapIntensity !== 0) {
      material.envMapIntensity = 0;
    }
  });
}

function restoreGroupReflections(group) {
  if (!group) return;
  const materials = collectGroupMaterials(group);
  if (!materials.length) return;
  materials.forEach((material) => {
    const base = material.userData.baseEnvMapIntensity;
    if (base !== undefined && material.envMapIntensity !== undefined && material.envMapIntensity !== base) {
      material.envMapIntensity = base;
    }
  });
}

function collectEmissiveMaterials(group) {
  if (!group) return [];
  if (group.userData.emissiveMaterials && group.userData.emissiveMaterials.length) {
    return group.userData.emissiveMaterials;
  }
  const materials = [];
  group.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const list = Array.isArray(child.material) ? child.material : [child.material];
    list.forEach((material) => {
      if (material.emissive !== undefined) {
        materials.push(material);
      }
    });
  });
  if (materials.length) {
    group.userData.emissiveMaterials = materials;
  }
  return materials;
}

// Opacity helper for fades (also disables depth write for transparency).
function setGroupOpacity(group, value) {
  if (!group) return;
  const materials = collectGroupMaterials(group);
  if (!materials.length) return;
  materials.forEach((material) => {
    if (material.userData.baseOpacity === undefined) {
      material.userData.baseOpacity = material.opacity ?? 1;
      material.userData.baseTransparent = !!material.transparent;
      material.userData.baseDepthWrite =
        material.depthWrite !== undefined ? material.depthWrite : true;
    }
    const needsFade = value < 0.999;
    if (needsFade) {
      material.transparent = true;
      material.opacity = material.userData.baseOpacity * value;
      material.depthWrite = false;
    } else {
      material.transparent = material.userData.baseTransparent;
      material.opacity = material.userData.baseOpacity;
      material.depthWrite = material.userData.baseDepthWrite;
    }
  });
}

// Emissive helper for scan glow.
function setEmissive(group, value) {
  if (!group) return;
  const materials = collectEmissiveMaterials(group);
  if (!materials.length) return;
  materials.forEach((material) => {
    material.emissive = material.emissive || new THREE.Color(0x66ffcc);
    material.emissiveIntensity = value;
  });
}

// Scene renders the models and applies transforms based on scroll progress.
function Scene({ progressRef, captions, onSceneReady }) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const foodRef = useRef(null);
  const scanRef = useRef(null);
  const floorRef = useRef(null);
  const { camera, size } = useThree();
  const isMobileRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const smoothedPointerRef = useRef({ x: 0, y: 0 });
  const [screenImage, setScreenImage] = useState(startImage);
  const screenImageRef = useRef(startImage);
  const smoothedProgressRef = useRef(0);
  const frontLockRef = useRef(false);

  const food = useGLTF(MODEL_URLS.food);

  const foodModel = useMemo(() => {
    const model = cloneCentered(food.scene);
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = false;
      child.receiveShadow = false;
    });
    return model;
  }, [food.scene]);

  useEffect(() => {
    const isMobile = size.width < 768;
    isMobileRef.current = isMobile;
    setIsMobile(isMobile);
    const cam = isMobile ? MOBILE_CONFIG.camera : CONFIG.camera;
    camera.position.set(0, cam.y, isMobile ? cam.mobileZ : cam.desktopZ);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width]);

  useEffect(() => {
    if (isMobileRef.current) {
      pointerRef.current = { x: 0, y: 0 };
      return undefined;
    }

    const handleMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      pointerRef.current = { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady();
    }
  }, [onSceneReady]);

  useFrame((state, delta) => {
    const cfg = isMobileRef.current ? MOBILE_CONFIG : CONFIG;
    const rawP = progressRef.current;
    const p = THREE.MathUtils.damp(smoothedProgressRef.current, rawP, 9, delta);
    smoothedProgressRef.current = p;
    smoothedPointerRef.current.x = THREE.MathUtils.damp(smoothedPointerRef.current.x, pointerRef.current.x, 5, delta);
    smoothedPointerRef.current.y = THREE.MathUtils.damp(smoothedPointerRef.current.y, pointerRef.current.y, 5, delta);
    const left = leftRef.current;
    const right = rightRef.current;
    const foodGroup = foodRef.current;
    const scan = scanRef.current;
    const floor = floorRef.current;

    if (!left || !right || !foodGroup || !scan || !floor) return;

    const captionSet =
      Array.isArray(captions) && captions.length ? captions : cfg.captions;
    const captionCount = captionSet.length;
    const captionDurations = cfg.captionDurations || new Array(captionCount).fill(1);
    const captionInfo = getCaptionWindow(p, captionDurations);
    const captionOpacity = getCaptionOpacity(captionInfo.local);
    const cap2Opacity = captionInfo.index === 2 ? captionOpacity : 0;
    const cap2Bounds = getCaptionBounds(2, captionDurations);
    const frontCaptionActive = captionInfo.index === 1 && captionOpacity > 0.6;
    if (frontCaptionActive) {
      setGroupReflectionsMuted(left);
      setGroupReflectionsMuted(right);
    } else {
      restoreGroupReflections(left);
      restoreGroupReflections(right);
    }
    if (captionInfo.index !== 1) {
      frontLockRef.current = false;
    }
    const applyFrontFacing = () => {
      if (!frontCaptionActive) return;
      const targetY = FRONT_Y + Math.PI;
      if (captionOpacity >= 1) {
        frontLockRef.current = true;
      }
      if (frontLockRef.current) {
        if (left) {
          left.rotation.x = 0;
          left.rotation.y = targetY;
          left.rotation.z = 0;
        }
        if (right) {
          right.rotation.x = 0;
          right.rotation.y = targetY;
          right.rotation.z = 0;
        }
        return;
      }
      const speed = 5;
      const t = 1 - Math.exp(-speed * delta);
      if (left) {
        left.rotation.x = lerp(left.rotation.x, 0, t);
        left.rotation.y = lerpAngle(left.rotation.y, targetY, t);
        left.rotation.z = lerp(left.rotation.z, 0, t);
      }
      if (right) {
        right.rotation.x = lerp(right.rotation.x, 0, t);
        right.rotation.y = lerpAngle(right.rotation.y, targetY, t);
        right.rotation.z = lerp(right.rotation.z, 0, t);
      }
    };
    const { segments } = cfg;
    const profileAt = Math.max(0, segments.a1[0] - SCREEN_SWITCH.lead);
    const scannerAt = Math.max(0, segments.b[0] - SCREEN_SWITCH.lead);
    const dangerAt = Math.max(0, segments.c[0] - SCREEN_SWITCH.finalLead);
    let desiredImage = startImage;
    if (p >= dangerAt) {
      desiredImage = scannerDangerImage;
    } else if (p >= scannerAt) {
      desiredImage = scannerImage;
    } else if (p >= profileAt) {
      desiredImage = profileImage;
    }
    if (screenImageRef.current !== desiredImage) {
      screenImageRef.current = desiredImage;
      setScreenImage(desiredImage);
    }

    // Defaults at start (0%).
    lerpVec3(left.position, cfg.start.leftPos, cfg.segmentA.leftPos, 0);
    lerpVec3(right.position, cfg.start.rightPos, cfg.segmentA.rightPos, 0);
    left.rotation.set(...cfg.start.leftRot);
    right.rotation.set(...cfg.start.rightRot);
    left.scale.setScalar(cfg.scales.phoneBase);
    right.scale.setScalar(cfg.scales.phoneBase);
    left.visible = true;
    right.visible = true;

    lerpVec3(foodGroup.position, cfg.start.foodPos, cfg.segmentC.foodPos, 0);
    foodGroup.rotation.set(...cfg.start.foodRot);
    foodGroup.scale.setScalar(cfg.scales.foodScan);
    setGroupOpacity(foodGroup, 0);
    foodGroup.visible = false;
    scan.material.opacity = 0;
    floor.position.y = cfg.floor.startY;

    // Segment A: orbit around the headline.
    if (p <= segments.a[1]) {
      const t = clamp((p - segments.a[0]) / (segments.a[1] - segments.a[0]), 0, 1);
      const tSmooth = smoothstep(t);
      const orbit = cfg.segmentA.orbit;
      const leftAngle = lerp(orbit.leftStart, orbit.leftEnd, tSmooth);
      const rightAngle = lerp(orbit.rightStart, orbit.rightEnd, tSmooth);
      const leftPos = orbitPosition(orbit, leftAngle);
      const rightPos = orbitPosition(orbit, rightAngle);

      left.position.set(leftPos.x, leftPos.y, leftPos.z);
      right.position.set(rightPos.x, rightPos.y, rightPos.z);
      left.rotation.set(
        lerp(cfg.start.leftRot[0], cfg.segmentA.leftRot[0], tSmooth),
        Math.atan2(leftPos.x, leftPos.z) + FRONT_Y,
        0
      );
      right.rotation.set(
        lerp(cfg.start.rightRot[0], cfg.segmentA.rightRot[0], tSmooth),
        Math.atan2(rightPos.x, rightPos.z) + FRONT_Y,
        0
      );

      const s = lerp(cfg.scales.phoneBase, cfg.scales.phoneSmall, tSmooth);
      left.scale.setScalar(s);
      right.scale.setScalar(s);
      setGroupOpacity(left, 1);
      setGroupOpacity(right, 1);
      applyFrontFacing();
      return;
    }

    // Segment B: merge + dissolve left phone.
    // Segment A1: rotate phones 180deg so the screens face the user.
    if (p <= segments.a1[1]) {
      const t = clamp((p - segments.a1[0]) / (segments.a1[1] - segments.a1[0]), 0, 1);
      const tSmooth = smoothstep(t);
      const orbit = cfg.segmentA.orbit;
      const leftA = orbitPosition(orbit, orbit.leftEnd);
      const rightA = orbitPosition(orbit, orbit.rightEnd);
      const leftAngleEnd = Math.atan2(leftA.x, leftA.z) + FRONT_Y;
      const rightAngleEnd = Math.atan2(rightA.x, rightA.z) + FRONT_Y;
      const rightFlipEnd = rightAngleEnd + Math.PI;

      left.position.set(leftA.x, leftA.y, leftA.z);
      right.position.set(rightA.x, rightA.y, rightA.z);
      left.rotation.set(cfg.segmentA.leftRot[0], lerp(leftAngleEnd, leftAngleEnd + Math.PI, tSmooth), 0);
      right.rotation.set(cfg.segmentA.rightRot[0], lerp(rightAngleEnd, rightFlipEnd, tSmooth), 0);
      left.scale.setScalar(cfg.scales.phoneSmall);
      right.scale.setScalar(cfg.scales.phoneSmall);
      setGroupOpacity(left, 1);
      setGroupOpacity(right, 1);
      applyFrontFacing();
      return;
    }

    if (p <= segments.b[1]) {
      const t = clamp((p - segments.b[0]) / (segments.b[1] - segments.b[0]), 0, 1);
      const tSmooth = smoothstep(t);
      const orbit = cfg.segmentA.orbit;
      const leftA = orbitPosition(orbit, orbit.leftEnd);
      const rightA = orbitPosition(orbit, orbit.rightEnd);
      const rightAngleEnd = Math.atan2(rightA.x, rightA.z) + FRONT_Y + Math.PI;
      // Hold left phone at the A1 end rotation so it doesn't snap when entering B.
      const leftAngleEnd = Math.atan2(leftA.x, leftA.z) + FRONT_Y + Math.PI;
      lerpVec3(
        left.position,
        [leftA.x, leftA.y, leftA.z],
        cfg.segmentB.leftPos,
        tSmooth
      );
      left.rotation.set(cfg.segmentA.leftRot[0], leftAngleEnd, 0);
      lerpVec3(
        right.position,
        [rightA.x, rightA.y, rightA.z],
        cfg.segmentB.rightPos,
        tSmooth
      );
      right.rotation.set(
        lerp(cfg.segmentA.rightRot[0], cfg.segmentB.rightRot[0], tSmooth),
        lerp(rightAngleEnd, cfg.segmentB.rightRot[1], tSmooth),
        lerp(0, cfg.segmentB.rightRot[2], tSmooth)
      );
      // Dissolve completes at tSmooth = 0.55, well before the segment B snap point (~0.877).
      const dissolveT = clamp(tSmooth / 0.55, 0, 1);
      const stretchY = lerp(cfg.scales.phoneSmall, cfg.scales.phoneSmall * 1.6, dissolveT);
      const squashXZ = lerp(cfg.scales.phoneSmall, cfg.scales.hidden, dissolveT);

      left.scale.set(squashXZ, stretchY, squashXZ);
      left.position.y -= 0.06 * dissolveT;
      left.position.lerp(right.position, dissolveT * 0.6);
      // Caption 2+ starts before the dissolve completes. Fade left phone
      // in sync with caption 1's exit so it's gone before caption 2 appears.
      const leftAlpha =
        captionInfo.index >= 2 ? 0
        : captionInfo.index === 1 ? lerp(1, 0, dissolveT) * captionOpacity
        : lerp(1, 0, dissolveT);
      left.visible = leftAlpha > 0.01;
      right.scale.setScalar(cfg.scales.phoneSmall);
      setGroupOpacity(left, leftAlpha);
      setGroupOpacity(right, 1);
      applyFrontFacing();
      return;
    }

    // Segment C: food appears + scan sweep.
    if (p <= segments.c[1]) {
      const t = clamp((p - segments.c[0]) / (segments.c[1] - segments.c[0]), 0, 1);
      const tSmooth = smoothstep(t);
      right.position.set(...cfg.segmentB.rightPos);
      right.rotation.set(...cfg.segmentB.rightRot);
      right.scale.setScalar(cfg.scales.phoneSmall);
      left.visible = false;
      left.scale.setScalar(cfg.scales.hidden);
      setGroupOpacity(left, 0);
      foodGroup.position.set(...cfg.segmentC.foodPos);
      foodGroup.rotation.y = cfg.start.foodRot[1] + state.clock.elapsedTime * 0.35;
      foodGroup.scale.setScalar(cfg.scales.foodScan);
      const foodAlpha = cap2Opacity;
      setGroupOpacity(foodGroup, foodAlpha);
      foodGroup.visible = foodAlpha > 0.01;

      const scanProgress = clamp(
        (p - cap2Bounds.start) / (cap2Bounds.end - cap2Bounds.start),
        0,
        1
      );
      const phase = scanProgress * cfg.scan.sweeps;
      const local = phase % 1;
      const eased = 0.5 - Math.cos(local * Math.PI) * 0.5;
      const y = lerp(cfg.scan.sweepTop, cfg.scan.sweepBottom, eased);
      scan.position.set(cfg.scan.offset[0], y, cfg.scan.offset[2]);
      scan.material.opacity = cap2Opacity * 0.8;
      setEmissive(foodGroup, cap2Opacity > 0 ? 0.7 : 0);

      const wobble = Math.sin(scanProgress * Math.PI * 2) * 0.03;
      right.position.x =
        lerp(cfg.segmentB.rightPos[0], cfg.segmentB.rightPos[0] - 0.08, tSmooth) +
        wobble;
      right.position.y = cfg.segmentB.rightPos[1] + wobble * 0.3;
      right.rotation.z = cfg.segmentB.rightRot[2] - wobble * 0.3;
      return;
    }

    // Segment D: phone moves right and scales up.
    const t = clamp((p - segments.d[0]) / (segments.d[1] - segments.d[0]), 0, 1);
    const tSmooth = smoothstep(t);
    foodGroup.position.set(...cfg.segmentC.foodPos);
    foodGroup.scale.setScalar(cfg.scales.foodScan);
    setGroupOpacity(foodGroup, 0);
    foodGroup.visible = false;
    scan.material.opacity = 0;
    setGroupOpacity(left, 0);
    left.visible = false;
    left.scale.setScalar(cfg.scales.hidden);

    // Start from the actual end-of-C position (includes the -0.08 x drift applied by tSmooth=1 in C).
    const dStartPos = [cfg.segmentB.rightPos[0] - 0.08, cfg.segmentB.rightPos[1], cfg.segmentB.rightPos[2]];
    lerpVec3(right.position, dStartPos, cfg.segmentD.rightPos, tSmooth);
    right.rotation.set(
      lerp(cfg.segmentB.rightRot[0], cfg.segmentD.rightRot[0], tSmooth),
      lerp(cfg.segmentB.rightRot[1], cfg.segmentD.rightRot[1], tSmooth),
      lerp(cfg.segmentB.rightRot[2], cfg.segmentD.rightRot[2], tSmooth)
    );
    if (p >= segments.d[0]) {
      const tilt = 0.12;
      const elapsed = state.clock.elapsedTime;
      right.rotation.x += smoothedPointerRef.current.y * tilt;
      right.rotation.z += smoothedPointerRef.current.x * tilt;
      // Idle float during dHold.
      if (p >= segments.dHold[0] && p < segments.e[0]) {
        right.position.y += Math.sin(elapsed * 1.4) * 0.018;
        right.rotation.z += Math.sin(elapsed * 0.9) * 0.008;
      }
    }
    // Scale up gradually across segment D.
    right.scale.setScalar(lerp(cfg.scales.phoneSmall, cfg.scales.phoneEnd, tSmooth));
    floor.position.y = lerp(cfg.floor.startY, cfg.floor.endY, tSmooth);

    // Segment E: fade everything out.
    if (p >= segments.e[0]) {
      const eT = clamp((p - segments.e[0]) / (segments.e[1] - segments.e[0]), 0, 1);
      const fadeT = smoothstep(eT);
      setGroupOpacity(right, lerp(1, 0, fadeT));
      right.scale.setScalar(lerp(cfg.scales.phoneEnd, cfg.scales.hidden, fadeT));
    } else {
      // Keep phone fully visible during segment D and dHold.
      setGroupOpacity(right, 1);
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#e6e6e6" />
      <directionalLight position={[3, 4, 5]} intensity={0.6} />
      <directionalLight position={[-3, 2, -4]} intensity={0.28} color="#a8d4b4" />
      <Environment preset="studio" />

      <group ref={leftRef}>
        <Model
          screenImage={screenImage}
          screenUnlit
          screenBackBrightness={0.65}
        />
      </group>
      <group ref={rightRef}>
        <Model
          screenImage={screenImage}
          screenUnlit
          screenBackBrightness={0.65}
        />
      </group>

      <group ref={foodRef}>
        <primitive object={foodModel} />
        <mesh
          ref={scanRef}
          rotation={[0, 0, 0]}
          position={(isMobile ? MOBILE_CONFIG : CONFIG).scan.offset}
        >
          <planeGeometry args={(isMobile ? MOBILE_CONFIG : CONFIG).scan.size} />
          <meshStandardMaterial
            color="#73ac84"
            emissive="#73ac84"
            emissiveIntensity={1}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>

      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

// ScrollHero wires ScrollTrigger to a shared progress ref for the Scene.
function ScrollHero({ captions }) {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const progressRef = useRef(0);
  const { active, progress } = useProgress();
  const [sceneReady, setSceneReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const resolvedCaptions = useMemo(
    () => (Array.isArray(captions) && captions.length ? captions : CONFIG.captions),
    [captions]
  );
  const [caption, setCaption] = useState(resolvedCaptions[0]);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [captionOpacity, setCaptionOpacity] = useState(1);
  const [showArrow, setShowArrow] = useState(true);
  const [showEndArrow, setShowEndArrow] = useState(false);
  const [validationVisible, setValidationVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastCaptionRef = useRef(0);
  const showArrowRef = useRef(true);
  const showEndArrowRef = useRef(false);
  const validationVisibleRef = useRef(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    if (!showLoader) return;
    if (!active && progress >= 100 && sceneReady) {
      setShowLoader(false);
    }
  }, [active, progress, sceneReady, showLoader]);

  useEffect(() => {
    const section = document.querySelector(".validation-section");
    if (!section || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        validationVisibleRef.current = entry.isIntersecting;
        setValidationVisible(entry.isIntersecting);
      },
      { threshold: 0.4 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const className = "snap-cards";
    if (validationVisible) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => document.body.classList.remove(className);
  }, [validationVisible]);

  useEffect(() => {
    showArrowRef.current = showArrow;
  }, [showArrow]);

  useEffect(() => {
    showEndArrowRef.current = showEndArrow;
  }, [showEndArrow]);

  useEffect(() => {
    validationVisibleRef.current = validationVisible;
  }, [validationVisible]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!sectionRef.current || !pinRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=800%",
      scrub: 0.7,
      pin: pinRef.current,
      anticipatePin: 1,
      fastScrollEnd: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        if (self.progress < 0.01) {
          lastCaptionRef.current = 0;
          setCaption(resolvedCaptions[0]);
          setCaptionIndex(0);
          setCaptionOpacity(1);
          if (!showArrowRef.current) {
            setShowArrow(true);
            showArrowRef.current = true;
          }
          if (showEndArrowRef.current) {
            setShowEndArrow(false);
            showEndArrowRef.current = false;
          }
          return;
        }
        if (showArrowRef.current) {
          setShowArrow(false);
          showArrowRef.current = false;
        }
        if (!validationVisibleRef.current && self.progress >= CONFIG.segments.d[0]) {
          if (!showEndArrowRef.current) {
            setShowEndArrow(true);
            showEndArrowRef.current = true;
          }
        } else if (showEndArrowRef.current) {
          setShowEndArrow(false);
          showEndArrowRef.current = false;
        }
        const durations =
          CONFIG.captionDurations || new Array(resolvedCaptions.length).fill(1);
        const captionInfo = getCaptionWindow(self.progress, durations);
        const idx = captionInfo.index;
        if (lastCaptionRef.current !== idx) {
          lastCaptionRef.current = idx;
          setCaption(resolvedCaptions[idx]);
          setCaptionIndex(idx);
        }
        setCaptionOpacity(getCaptionOpacity(captionInfo.local));
      }
    });

    return () => trigger.kill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const durations =
      CONFIG.captionDurations || new Array(resolvedCaptions.length).fill(1);
    const progress = progressRef.current;
    const captionInfo = getCaptionWindow(progress, durations);
    const idx = captionInfo.index;
    lastCaptionRef.current = idx;
    setCaption(resolvedCaptions[idx] || resolvedCaptions[0] || "");
    setCaptionIndex(idx);
    if (progress < 0.01) {
      setCaptionOpacity(1);
    } else {
      setCaptionOpacity(getCaptionOpacity(captionInfo.local));
    }
  }, [resolvedCaptions]);

  return (
    <>
      {showLoader ? <LoadingScreen /> : null}
      <section ref={sectionRef} className="scroll-hero">
      <div ref={pinRef} className="scroll-hero__pin">
        <div
          className={`scroll-hero__copy${
            captionIndex === 0 ? "" : " scroll-hero__copy--left"
          }`}
          style={{
            opacity: captionOpacity,
            top: isMobile && captionIndex !== 0 ? "18vh" : undefined,
            transform: `translate(${
              captionIndex === 0 || isMobile ? "-50%" : "0"
            }, -50%) translateY(${(1 - captionOpacity) * 12}px)`
          }}
        >
          {captionIndex === 0 ? (
            <div className="scroll-hero__brand">besayfe</div>
          ) : null}
          {caption}
        </div> 
        <div
          className={`scroll-hero__arrow${showArrow ? "" : " scroll-hero__arrow--hidden"}`}
          aria-hidden={!showArrow}
        >
          <span className="scroll-hero__arrow-icon" />
        </div>
        <div
          className={`scroll-hero__arrow scroll-hero__arrow--end${
            showEndArrow ? "" : " scroll-hero__arrow--hidden"
          }`}
          aria-hidden={!showEndArrow}
        >
          <span className="scroll-hero__arrow-icon" />
        </div>
        <Canvas gl={{ antialias: true, alpha: true, powerPreference: "default" }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Scene
              progressRef={progressRef}
              captions={resolvedCaptions}
              onSceneReady={() => setSceneReady(true)}
            />
          </Suspense>
        </Canvas>
      </div>
    </section>
    </>
  );
}

function Tests() {
  const { t } = useTranslation();
  const validationRef = useRef(null);
  const firstCardRef = useRef(null);
  const validationHeaderRef = useRef(null);
  const [hideValidationHeader, setHideValidationHeader] = useState(false);
  const heroCaptions = useMemo(() => {
    const translated = t("tests.hero.captions");
    return Array.isArray(translated) && translated.length
      ? translated
      : CONFIG.captions;
  }, [t]);

  useEffect(() => {
    const section = validationRef.current;
    const firstCard = firstCardRef.current;
    const header = validationHeaderRef.current;
    if (!section || !firstCard || !header) {
      return undefined;
    }

    let frame = null;
    const updateHeaderState = () => {
      frame = null;
      const sectionRect = section.getBoundingClientRect();
      const inView =
        sectionRect.top < window.innerHeight && sectionRect.bottom > 0;
      if (!inView) {
        setHideValidationHeader(false);
        return;
      }
      const headerRect = header.getBoundingClientRect();
      const cardRect = firstCard.getBoundingClientRect();
      setHideValidationHeader(cardRect.top <= headerRect.bottom);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateHeaderState);
    };

    updateHeaderState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <ScrollHero captions={heroCaptions} />
      <div className="scroll-hero__tail" />
      <section
        ref={validationRef}
        className={`validation-section${
          hideValidationHeader ? " validation-section--header-hidden" : ""
        }`}
      >
        <div
          ref={validationHeaderRef}
          className="validation-header validation-header--sticky"
        >
          <span
            className="validation-kicker"
            dangerouslySetInnerHTML={{ __html: t("tests.validation.kicker") }}
          />
          <h2
            dangerouslySetInnerHTML={{ __html: t("tests.validation.title") }}
          />
          <p
            dangerouslySetInnerHTML={{ __html: t("tests.validation.body") }}
          />
        </div>
        <ScrollStack itemDistance={620} itemStackDistance={0} baseScale={1}>
          <ScrollStackItem ref={firstCardRef}>
            <div className="validation-step">
              {t("tests.validation.items.0.step")}
            </div>
            <h3
              className="validation-title"
              dangerouslySetInnerHTML={{ __html: t("tests.validation.items.0.title") }}
            />
            <p
              className="validation-body"
              dangerouslySetInnerHTML={{ __html: t("tests.validation.items.0.body") }}
            />
            <p
              className="validation-meta"
              dangerouslySetInnerHTML={{ __html: t("tests.validation.items.0.meta") }}
            />
          </ScrollStackItem>
          <ScrollStackItem>
            <div className="validation-step">
              {t("tests.validation.items.1.step")}
            </div>
            <h3
              className="validation-title"
              dangerouslySetInnerHTML={{ __html: t("tests.validation.items.1.title") }}
            />
            <p
              className="validation-body"
              dangerouslySetInnerHTML={{ __html: t("tests.validation.items.1.body") }}
            />
            <p
              className="validation-meta"
              dangerouslySetInnerHTML={{ __html: t("tests.validation.items.1.meta") }}
            />
          </ScrollStackItem>
          <ScrollStackItem>
            <div className="validation-step">
              {t("tests.validation.items.2.step")}
            </div>
            <h3
              className="validation-title"
              dangerouslySetInnerHTML={{ __html: t("tests.validation.items.2.title") }}
            />
            <p
              className="validation-body"
              dangerouslySetInnerHTML={{ __html: t("tests.validation.items.2.body") }}
            />
            <p
              className="validation-meta"
              dangerouslySetInnerHTML={{ __html: t("tests.validation.items.2.meta") }}
            />
          </ScrollStackItem>
        </ScrollStack>
      </section>
    </>
  );
}

export default Tests;
