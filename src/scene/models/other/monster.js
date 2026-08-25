import * as THREE from 'three';
import gltfLoader from '@/utils/loader/gltfLoader';
import { camera } from '@/utils/renderer';

const HIT_COLOR = new THREE.Color(0xff5544);

const BAR_WIDTH = 0.25;
const BAR_HEIGHT = 0.04;
export const BAR_Y_OFFSET = 0.3;

export function createHealthBar() {
  const bgMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(BAR_WIDTH, BAR_HEIGHT),
    new THREE.MeshBasicMaterial({ color: 0x333333, depthTest: false })
  );

  const fgMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(BAR_WIDTH, BAR_HEIGHT),
    new THREE.MeshBasicMaterial({ color: 0x00cc44, depthTest: false })
  );
  fgMesh.position.z = 0.001;
  fgMesh.renderOrder = 1;

  const group = new THREE.Group();
  group.add(bgMesh);
  group.add(fgMesh);
  group.renderOrder = 1;

  // Camera orientation is locked, so copying it once keeps the bar facing the viewer
  group.quaternion.copy(camera.quaternion);

  return { group, fgMesh, barWidth: BAR_WIDTH };
}

const monster = async (position = { x: 1, y: 0.1, z: 0 }) => {
  const [walkGltf, slashGltf] = await Promise.all([
    gltfLoader.loadAsync('./models/monster/walking.glb'),
    gltfLoader.loadAsync('./models/monster/slash.glb'),
  ]);

  // Use walking GLB as the base model since it contains the skeleton
  const model = walkGltf.scene;

  model.scale.set(0.05, 0.05, 0.05);
  model.rotation.y = Math.PI * -0.5;
  model.position.set(position.x, position.y - 0.1, position.z);
  // Cloned per monster, otherwise flashing one would flash every monster sharing the material
  const flashMaterials = [];
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.material = child.material.clone();
    if (child.material.emissive) {
      child.material.userData.baseEmissive = child.material.emissive.clone();
      flashMaterials.push(child.material);
    }
  });

  const mixer = new THREE.AnimationMixer(model);
  const actions = {};

  for (const clip of walkGltf.animations) {
    clip.name = 'walk';
    actions['walk'] = mixer.clipAction(clip);
  }
  for (const clip of slashGltf.animations) {
    clip.name = 'attack';
    actions['attack'] = mixer.clipAction(clip);
  }

  let currentAction = null;

  function play(name) {
    const next = actions[name];
    if (!next || next === currentAction) return;
    if (currentAction) currentAction.fadeOut(0.2);
    next.reset().fadeIn(0.2).play();
    currentAction = next;
  }

  play('walk');

  return { model, mixer, play, flashMaterials };
};

// amount: 1 at the moment of impact, easing to 0 as the flash decays
export function setHitFlash(materials, amount) {
  for (const material of materials) {
    material.emissive.copy(material.userData.baseEmissive).lerp(HIT_COLOR, amount);
  }
}
export default monster;
