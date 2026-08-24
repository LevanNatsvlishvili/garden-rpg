import * as THREE from 'three';
import { camera } from '../renderer';
import { controls } from './controls';
import { config } from '@/config/config';

const { position, followLerp } = config.camera;

// The camera holds a fixed offset from the character, so the world scrolls instead of orbiting.
// Keeping the angle constant is what lets the billboard sprites read as placed geometry.
const offset = new THREE.Vector3(position.x, position.y, position.z);

export function updateCameraFollow(target, delta) {
  // Frame-rate independent damping, so the follow feels the same at any fps
  const t = 1 - Math.pow(1 - followLerp, delta * 60);

  controls.target.lerp(target.position, t);
  camera.position.copy(controls.target).add(offset);
}
