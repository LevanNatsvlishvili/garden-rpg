import * as THREE from 'three';
import { config } from '@/config/config';

const TEXTURE_SIZE = 128;
const NIGHT_OPACITY = 0.35;

// Everything that reads as a shadow keys off this one vector, so the decals below and the real
// shadows the directional light casts always agree on direction and length.
const lightPosition = config.lights.directional.position;
const groundRun = Math.hypot(lightPosition.x, lightPosition.z);

// Ground heading the light throws shadows along, and how many object-heights long they get
const shadowHeading = Math.atan2(-lightPosition.x, -lightPosition.z);
const shadowStretch = groundRun / lightPosition.y;

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

// width: footprint across the light direction. objectHeight: how tall the thing casting it is,
// which is what decides how far the shadow is thrown.
export function createContactShadow(width, objectHeight = width) {
  const holder = new THREE.Group();
  holder.rotation.y = shadowHeading;

  const length = width + objectHeight * shadowStretch;

  const shadow = new THREE.Mesh(geometry, material);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.scale.set(width, length, 1);
  // Thrown along the light rather than centred, so it reaches out from the base of the object
  shadow.position.set(0, 0.004, (length - width) * 0.5);

  holder.add(shadow);
  return holder;
}

// Shared material, so this dims every shadow at once
export function setContactShadowNight(isNight) {
  material.opacity = isNight ? NIGHT_OPACITY : 1;
}
