import * as THREE from 'three';

const TEXTURE_SIZE = 128;
const NIGHT_OPACITY = 0.35;

// Sprites cannot receive real shadows, so every world object gets a soft decal on the ground
// instead. The gradient is drawn at runtime rather than shipped as a file, to keep the
// download budget flat.
function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;

  const half = TEXTURE_SIZE * 0.5;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.22)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  return new THREE.CanvasTexture(canvas);
}

// Geometry and material are shared across every shadow in the scene
const geometry = new THREE.PlaneGeometry(1, 1);
const material = new THREE.MeshBasicMaterial({
  map: createShadowTexture(),
  transparent: true,
  depthWrite: false,
});

export function createContactShadow(size) {
  const shadow = new THREE.Mesh(geometry, material);
  shadow.scale.set(size, size, 1);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.position.y = 0.002;
  return shadow;
}

// Shared material, so this dims every shadow at once
export function setContactShadowNight(isNight) {
  material.opacity = isNight ? NIGHT_OPACITY : 1;
}
