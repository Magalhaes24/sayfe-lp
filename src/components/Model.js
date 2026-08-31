import { useEffect, useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

const EMPTY_TEXTURE_URL = "/textures/empty.png";

export default function Model({
  screenImage,
  screenMaterialName = "16_screen.001",
  screenEmissiveIntensity = 0.45,
  screenUnlit = false,
  screenBackBrightness = 1,
  screenOpacity = 1,
  ...props
}) {
  const { scene } = useGLTF("/models/Untitled.gltf");
  const screenTexture = useTexture(screenImage || EMPTY_TEXTURE_URL);

  const modelScene = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());

    cloned.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const clonedMaterials = materials.map((material) => {
        const next = material.clone();
        const isTransparent = material.transparent || material.opacity < 1;
        next.transparent = isTransparent;
        next.opacity = material.opacity ?? 1;
        next.depthWrite = !isTransparent;
        next.depthTest = true;
        // Keep env map contribution very low — enough to avoid black metallic
        // surfaces without producing visible studio reflections.
        if (next.envMapIntensity !== undefined) {
          next.envMapIntensity = 0.08;
        }
        return next;
      });
      child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];
      child.castShadow = false;
      child.receiveShadow = false;
    });

    cloned.position.sub(center);
    return cloned;
  }, [scene]);

  const prepareTexture = (texture) => {
    if (!texture || texture.userData.screenPrepared) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.needsUpdate = true;
    texture.userData.screenPrepared = true;
  };

  useEffect(() => {
    const applyScreenShader = (material) => {
      if (material.userData.screenShaderApplied) {
        if (material.userData.screenUniforms) {
          material.userData.screenUniforms.uBackBrightness.value = screenBackBrightness;
        }
        return;
      }
      material.userData.screenShaderApplied = true;
      material.userData.screenUniforms = {
        uBackBrightness: { value: screenBackBrightness }
      };
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, material.userData.screenUniforms);
        shader.fragmentShader =
          `
          uniform float uBackBrightness;
          ` + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <color_fragment>",
          [
            "#include <color_fragment>",
            "if (!gl_FrontFacing) {",
            "  diffuseColor.rgb *= uBackBrightness;",
            "}"
          ].join("\n")
        );
      };
      material.customProgramCacheKey = () =>
        `screen-${screenBackBrightness}`;
      material.needsUpdate = true;
    };

    prepareTexture(screenTexture);

    modelScene.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material.name !== screenMaterialName) return;
        material.map = screenImage ? screenTexture : null;
        if (material.emissive !== undefined) {
          material.emissiveMap = screenImage ? screenTexture : null;
          material.emissive = material.emissive || new THREE.Color(0x000000);
          material.emissive.set(0xffffff);
        }
        if (material.color) {
          material.color.set(0xffffff);
        }
        if (screenUnlit) {
          if (material.isMeshBasicMaterial) {
            // Already set up on a prior effect run — sync texture and uniform only.
            // Creating a new material here would stale the collectGroupMaterials cache
            // in Tests.js, causing setGroupOpacity to write to a disposed material.
            material.needsUpdate = true;
            applyScreenShader(material); // no-ops if already applied, just updates uniform
            return;
          }
          const next = new THREE.MeshBasicMaterial({
            map: screenImage ? screenTexture : null,
            color: 0xffffff,
            toneMapped: false,
            side: THREE.DoubleSide
          });
          next.name = material.name;
          next.opacity = screenOpacity;
          next.transparent = screenOpacity < 0.999;
          next.depthWrite = true;
          next.depthTest = true;
          next.polygonOffset = true;
          next.polygonOffsetFactor = -1;
          next.polygonOffsetUnits = -1;
          applyScreenShader(next);
          material.dispose?.();
          if (Array.isArray(child.material)) {
            const idx = child.material.indexOf(material);
            child.material[idx] = next;
          } else {
            child.material = next;
          }
          return;
        }
        if (material.emissiveIntensity !== undefined) {
          material.emissiveIntensity = screenImage ? screenEmissiveIntensity : 0;
        }
        material.side = THREE.DoubleSide;
        material.metalness = 0;
        material.roughness = 0.35;
        material.toneMapped = false;
        material.opacity = screenOpacity;
        material.transparent = material.transparent || screenOpacity < 0.999;
        material.depthWrite = screenOpacity < 0.999 ? false : material.depthWrite;
        material.depthTest = true;
        material.polygonOffset = true;
        material.polygonOffsetFactor = -1;
        material.polygonOffsetUnits = -1;
        applyScreenShader(material);
        material.needsUpdate = true;
      });
    });
  }, [
    modelScene,
    screenBackBrightness,
    screenEmissiveIntensity,
    screenImage,
    screenMaterialName,
    screenTexture,
    screenOpacity,
    screenUnlit
  ]);

  return <primitive object={modelScene} {...props} />;
}

useGLTF.preload("/models/Untitled.gltf");
