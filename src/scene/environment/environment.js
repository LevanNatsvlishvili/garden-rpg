import * as THREE from 'three';
import { scene } from '@/utils/renderer';
import { config } from '@/config/config';

export function setupEnvironment() {
  const { background, fog } = config.environment;

  if (background !== undefined) {
    scene.background = new THREE.Color(background);
  }

  // Fades the treeline into the sky, which adds depth and hides the edge of the ground plane
  if (fog !== undefined) {
    scene.fog = new THREE.Fog(fog.color, fog.near, fog.far);
  }
}
