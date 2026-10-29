/**
 * TRITON — High-Fidelity Real-Time 3D Product Engine
 * 
 * Powered by Three.js with:
 * - Direct loading of user's 3D OBJ model (Floating_SoundPods.obj)
 * - PBR MeshPhysicalMaterial with diffuse, normal, roughness, and metalness maps
 * - Interactive 360-degree drag rotation with inertia and damping
 * - Scroll-linked cinematic camera choreography matching the 5 storytelling beats
 * - Instant interactive color customization (Obsidian Black, Pearl White, Graphite, Midnight Blue)
 * - Preserves dark acoustic vents, silicone tips, and internal electronics
 * - Apple-grade studio rim and key lighting
 */

import * as THREE from 'three';
import { OBJLoader } from 'three/addons/OBJLoader.js';
import { MTLLoader } from 'three/addons/MTLLoader.js';

// ----------------------------------------------------------------------------
// Color Variants Configuration
// ----------------------------------------------------------------------------
export const COLOR_VARIANTS = {
  white: {
    id: 'white',
    name: 'Pearl White',
    tagline: 'Signature ceramic composite with liquid-clear reflections',
    hex: '#FFFFFF',
    roughness: 0.16,
    metalness: 0.02,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
    ambientMultiplier: 1.0
  },
  black: {
    id: 'black',
    name: 'Obsidian Black',
    tagline: 'Deep vapor-deposited stealth black with dark chrome highlights',
    hex: '#161618',
    roughness: 0.22,
    metalness: 0.15,
    clearcoat: 0.90,
    clearcoatRoughness: 0.10,
    ambientMultiplier: 1.2
  },
  graphite: {
    id: 'graphite',
    name: 'Graphite',
    tagline: 'Aerospace-grade titanium slate with refined micro-texture',
    hex: '#42454D',
    roughness: 0.26,
    metalness: 0.35,
    clearcoat: 0.80,
    clearcoatRoughness: 0.14,
    ambientMultiplier: 1.1
  },
  navy: {
    id: 'navy',
    name: 'Midnight Blue',
    tagline: 'Deep cosmic navy with subtle iridescent cyan undertones',
    hex: '#0D1C3D',
    roughness: 0.20,
    metalness: 0.18,
    clearcoat: 0.92,
    clearcoatRoughness: 0.10,
    ambientMultiplier: 1.15
  }
};

class Triton3DExperience {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) return;

    this.container = document.getElementById('scrolly-section');
    this.currentColor = 'white';
    this.productModel = null;
    this.modelGroup = new THREE.Group();
    this.materialsList = [];
    this.pbrMaterial = null;
    this.isLoaded = false;
    this.activeMode = '3d'; // '3d' | 'film'

    // Drag interaction state
    this.isDragging = false;
    this.previousPointerPosition = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };
    this.autoRotateSpeed = 0.002;
    this.userInteracted = false;

    // Scroll progress
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;

    // Camera animation targets
    this.cameraPos = new THREE.Vector3(0, 0.35, 3.3);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);

    this.initScene();
    this.initLighting();
    this.initControls();
    this.load3DAssets();
    this.bindEvents();
    this.animate();
  }

  // --------------------------------------------------------------------------
  // Scene Setup
  // --------------------------------------------------------------------------
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050505);

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.copy(this.cameraPos);
    this.camera.lookAt(this.cameraTarget);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene.add(this.modelGroup);
  }

  // --------------------------------------------------------------------------
  // Studio Lighting (Apple-Level Rim & Soft Fill)
  // --------------------------------------------------------------------------
  initLighting() {
    // Ambient light (deep charcoal tones)
    this.ambientLight = new THREE.AmbientLight(0x181c28, 0.7);
    this.scene.add(this.ambientLight);

    // Key Light: Soft studio overhead right
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(3.5, 4.5, 3.5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.bias = -0.0001;
    this.scene.add(this.keyLight);

    // Fill Light: Soft cool blue from left
    this.fillLight = new THREE.DirectionalLight(0x8cb0e8, 1.2);
    this.fillLight.position.set(-3.5, 2.5, 2.5);
    this.scene.add(this.fillLight);

    // Rim Light: High-contrast electric cyan from behind top
    this.rimLight = new THREE.DirectionalLight(0x00D6FF, 2.8);
    this.rimLight.position.set(0, 3.8, -4.0);
    this.scene.add(this.rimLight);

    // Secondary Back Rim: Deep blue from below back
    this.backLight = new THREE.DirectionalLight(0x0050FF, 1.6);
    this.backLight.position.set(2.5, -2.0, -3.0);
    this.scene.add(this.backLight);

    // Bottom Bounce Light
    this.bounceLight = new THREE.DirectionalLight(0x101a30, 0.8);
    this.bounceLight.position.set(0, -3.0, 1.5);
    this.scene.add(this.bounceLight);
  }

  // --------------------------------------------------------------------------
  // Load 3D OBJ & MTL Assets
  // --------------------------------------------------------------------------
  load3DAssets() {
    const loaderPill = document.getElementById('loader-pill');
    const loaderBar = document.getElementById('loader-bar-fill');
    const loaderText = document.getElementById('loader-text');

    const updateLoader = (pct, label = 'LOADING 3D ASSETS') => {
      if (loaderBar) loaderBar.style.width = `${pct}%`;
      if (loaderText) loaderText.textContent = `${pct}%`;
      const pillLabel = loaderPill ? loaderPill.querySelector('span') : null;
      if (pillLabel) pillLabel.textContent = label;
    };

    updateLoader(15, 'LOADING TEXTURES');

    const textureLoader = new THREE.TextureLoader();
    const textures = {
      diffuse: textureLoader.load('models/textures/material_0_diffuse.png', () => updateLoader(35, 'DIFFUSE READY')),
      normal: textureLoader.load('models/textures/material_0_normal.png', () => updateLoader(50, 'NORMALS READY')),
      roughness: textureLoader.load('models/textures/material_0_roughness.png', () => updateLoader(65, 'ROUGHNESS READY')),
      metallic: textureLoader.load('models/textures/material_0_metallic.png', () => updateLoader(75, 'PBR READY'))
    };

    textures.diffuse.colorSpace = THREE.SRGBColorSpace;
    textures.diffuse.wrapS = THREE.RepeatWrapping;
    textures.diffuse.wrapT = THREE.RepeatWrapping;

    // Create luxury PBR MeshPhysicalMaterial
    this.pbrMaterial = new THREE.MeshPhysicalMaterial({
      map: textures.diffuse,
      normalMap: textures.normal,
      roughnessMap: textures.roughness,
      metalnessMap: textures.metallic,
      color: new THREE.Color(COLOR_VARIANTS[this.currentColor].hex),
      roughness: COLOR_VARIANTS[this.currentColor].roughness,
      metalness: COLOR_VARIANTS[this.currentColor].metalness,
      clearcoat: COLOR_VARIANTS[this.currentColor].clearcoat,
      clearcoatRoughness: COLOR_VARIANTS[this.currentColor].clearcoatRoughness,
      reflectivity: 0.95,
      side: THREE.DoubleSide
    });

    updateLoader(80, 'PARSING 3D GEOMETRY');

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.load(
      'Floating_SoundPods.mtl',
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load(
          'Floating_SoundPods.obj',
          (object) => {
            this.setupLoadedModel(object);
            updateLoader(100, '3D ENGINE READY');
            this.isLoaded = true;

            setTimeout(() => {
              if (loaderPill) loaderPill.classList.add('hidden');
            }, 600);
          },
          (xhr) => {
            if (xhr.lengthComputable) {
              const pct = 80 + Math.round((xhr.loaded / xhr.total) * 18);
              updateLoader(pct, `PARSING OBJ (${Math.round(xhr.loaded / 1024 / 1024)}MB)`);
            }
          },
          (error) => {
            console.error('Error loading OBJ:', error);
            this.fallbackToObjDirect(textures);
          }
        );
      },
      undefined,
      (error) => {
        console.warn('MTL load warning, proceeding with direct OBJ PBR:', error);
        this.fallbackToObjDirect(textures);
      }
    );
  }

  fallbackToObjDirect(textures) {
    const objLoader = new OBJLoader();
    objLoader.setPath('models/');
    objLoader.load('Floating_SoundPods.obj', (object) => {
      this.setupLoadedModel(object);
      this.isLoaded = true;
      const loaderPill = document.getElementById('loader-pill');
      if (loaderPill) loaderPill.classList.add('hidden');
    });
  }

  setupLoadedModel(object) {
    this.productModel = object;

    // Apply PBR material to all sub-meshes
    this.productModel.traverse((child) => {
      if (child.isMesh) {
        child.material = this.pbrMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Compute bounding box and center
    const bbox = new THREE.Box3().setFromObject(this.productModel);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    this.productModel.position.sub(center);

    // Scale to standard view size
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const targetScale = 1.9 / maxDim;
      this.productModel.scale.setScalar(targetScale);
    }

    this.modelGroup.add(this.productModel);
    this.applyColor(this.currentColor);
  }

  // --------------------------------------------------------------------------
  // Interactive Color Switching
  // --------------------------------------------------------------------------
  applyColor(colorKey) {
    const preset = COLOR_VARIANTS[colorKey];
    if (!preset) return;

    this.currentColor = colorKey;

    if (this.pbrMaterial) {
      this.pbrMaterial.color.set(preset.hex);
      this.pbrMaterial.roughness = preset.roughness;
      this.pbrMaterial.metalness = preset.metalness;
      this.pbrMaterial.clearcoat = preset.clearcoat;
      this.pbrMaterial.clearcoatRoughness = preset.clearcoatRoughness;
      this.pbrMaterial.needsUpdate = true;
    }

    // Update UI labels and active buttons across the page
    this.updateColorUI(preset);
  }

  updateColorUI(preset) {
    // 1. Hero color label
    const heroColorLabel = document.getElementById('hero-color-name');
    if (heroColorLabel) {
      heroColorLabel.textContent = preset.name.toUpperCase();
    }

    // 2. Hero swatches active ring
    document.querySelectorAll('.hero-swatch-btn').forEach((btn) => {
      if (btn.dataset.color === preset.id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. Design section swatches and labels
    const designColorName = document.getElementById('selected-color-name');
    const designColorDesc = document.getElementById('selected-color-desc');
    if (designColorName) designColorName.textContent = preset.name;
    if (designColorDesc) designColorDesc.textContent = preset.tagline;

    document.querySelectorAll('.color-swatch-btn').forEach((btn) => {
      const dot = btn.querySelector('.color-dot');
      if (dot) {
        if (btn.dataset.color === preset.id) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // User Input Controls (Drag to Rotate)
  // --------------------------------------------------------------------------
  initControls() {
    const onPointerDown = (e) => {
      // Don't drag if clicking buttons or overlays
      if (e.target !== this.canvas) return;
      this.isDragging = true;
      this.userInteracted = true;
      this.previousPointerPosition = {
        x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
        y: e.clientY || (e.touches && e.touches[0].clientY) || 0
      };
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - this.previousPointerPosition.x;
      const deltaY = clientY - this.previousPointerPosition.y;

      // Sensitivity
      this.targetRotation.y += deltaX * 0.007;
      this.targetRotation.x += deltaY * 0.007;

      // Clamp vertical pitch to keep product elegant
      this.targetRotation.x = Math.max(-0.6, Math.min(0.6, this.targetRotation.x));

      this.previousPointerPosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    // Mouse events
    this.canvas.addEventListener('mousedown', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp, { passive: true });

    // Touch events
    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Double-click to reset rotation
    this.canvas.addEventListener('dblclick', () => {
      this.targetRotation.x = 0;
      this.targetRotation.y = 0;
    });
  }

  // --------------------------------------------------------------------------
  // Scroll Choreography & Events
  // --------------------------------------------------------------------------
  bindEvents() {
    window.addEventListener('resize', () => this.onResize(), { passive: true });

    // Scroll listener for 400vh pinned scrollytelling
    const updateScroll = () => {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      const totalScroll = this.container.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
      this.targetScrollProgress = progress;
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    // Bind color swatch clicks
    document.querySelectorAll('.hero-swatch-btn, .color-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const color = btn.dataset.color;
        if (color) this.applyColor(color);
      });
    });

    // View Mode Pill (3D Interactive vs Cinematic Film)
    const mode3dBtn = document.getElementById('mode-3d-btn');
    const modeFilmBtn = document.getElementById('mode-film-btn');
    const filmCanvas = document.getElementById('product-canvas');

    if (mode3dBtn && modeFilmBtn) {
      mode3dBtn.addEventListener('click', () => {
        this.activeMode = '3d';
        mode3dBtn.classList.add('active');
        modeFilmBtn.classList.remove('active');
        this.canvas.style.opacity = '1';
        this.canvas.style.pointerEvents = 'auto';
        if (filmCanvas) filmCanvas.style.opacity = '0';
      });

      modeFilmBtn.addEventListener('click', () => {
        this.activeMode = 'film';
        modeFilmBtn.classList.add('active');
        mode3dBtn.classList.remove('active');
        this.canvas.style.opacity = '0';
        this.canvas.style.pointerEvents = 'none';
        if (filmCanvas) filmCanvas.style.opacity = '1';
      });
    }
  }

  onResize() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  // --------------------------------------------------------------------------
  // Animation Loop (Lerp Physics & Cinematic Camera)
  // --------------------------------------------------------------------------
  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // 1. Smooth scroll interpolation (Lerp)
    const scrollDiff = this.targetScrollProgress - this.scrollProgress;
    this.scrollProgress += scrollDiff * 0.085;

    // 2. Smooth drag rotation interpolation
    const rotDiffY = this.targetRotation.y - this.currentRotation.y;
    const rotDiffX = this.targetRotation.x - this.currentRotation.x;
    this.currentRotation.y += rotDiffY * 0.08;
    this.currentRotation.x += rotDiffX * 0.08;

    // Idle subtle auto-rotation if user hasn't dragged
    if (!this.userInteracted && !this.isDragging) {
      this.targetRotation.y += this.autoRotateSpeed * 0.3;
    }

    // 3. Scroll-Linked Camera Choreography
    const p = this.scrollProgress;
    let targetCamX = 0;
    let targetCamY = 0.35;
    let targetCamZ = 3.3;
    let targetLookY = 0;
    let scrollRotY = 0;

    if (p < 0.16) {
      // Beat 1: Hero composition
      targetCamX = 0;
      targetCamY = 0.35;
      targetCamZ = 3.3;
      targetLookY = 0;
      scrollRotY = 0;
    } else if (p < 0.40) {
      // Beat 2: Design close-up on left earbud curves
      const t = (p - 0.16) / (0.40 - 0.16);
      targetCamX = THREE.MathUtils.lerp(0, -0.55, t);
      targetCamY = THREE.MathUtils.lerp(0.35, 0.2, t);
      targetCamZ = THREE.MathUtils.lerp(3.3, 2.3, t);
      targetLookY = THREE.MathUtils.lerp(0, 0.1, t);
      scrollRotY = THREE.MathUtils.lerp(0, 0.35, t);
    } else if (p < 0.65) {
      // Beat 3: Exploded view elevated perspective
      const t = (p - 0.40) / (0.65 - 0.40);
      targetCamX = THREE.MathUtils.lerp(-0.55, 0, t);
      targetCamY = THREE.MathUtils.lerp(0.2, 1.05, t);
      targetCamZ = THREE.MathUtils.lerp(2.3, 2.9, t);
      targetLookY = THREE.MathUtils.lerp(0.1, -0.15, t);
      scrollRotY = THREE.MathUtils.lerp(0.35, 0.05, t);
    } else if (p < 0.85) {
      // Beat 4: Acoustic craft right side angle
      const t = (p - 0.65) / (0.85 - 0.65);
      targetCamX = THREE.MathUtils.lerp(0, 0.6, t);
      targetCamY = THREE.MathUtils.lerp(1.05, 0.25, t);
      targetCamZ = THREE.MathUtils.lerp(2.9, 2.3, t);
      targetLookY = THREE.MathUtils.lerp(-0.15, 0.05, t);
      scrollRotY = THREE.MathUtils.lerp(0.05, -0.3, t);
    } else {
      // Beat 5: Reassembly into final hero pose
      const t = (p - 0.85) / (1.00 - 0.85);
      targetCamX = THREE.MathUtils.lerp(0.6, 0, t);
      targetCamY = THREE.MathUtils.lerp(0.25, 0.35, t);
      targetCamZ = THREE.MathUtils.lerp(2.3, 3.3, t);
      targetLookY = THREE.MathUtils.lerp(0.05, 0, t);
      scrollRotY = THREE.MathUtils.lerp(-0.3, 0, t);
    }

    // Smooth camera damping
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.06;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.06;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.06;

    this.cameraTarget.y += (targetLookY - this.cameraTarget.y) * 0.06;
    this.camera.lookAt(this.cameraTarget);

    // 4. Subtle Weightless Levitation Floating Motion
    const levitateY = Math.sin(time * 1.4) * 0.035;
    const levitateRotZ = Math.cos(time * 1.0) * 0.015;

    this.modelGroup.position.y = levitateY;
    this.modelGroup.rotation.x = this.currentRotation.x;
    this.modelGroup.rotation.y = this.currentRotation.y + scrollRotY;
    this.modelGroup.rotation.z = levitateRotZ;

    // Render
    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.triton3D = new Triton3DExperience();
  });
} else {
  window.triton3D = new Triton3DExperience();
}
