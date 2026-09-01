import * as THREE from 'three';
import { scene } from '@/utils/renderer';
import { config } from '@/config/config';
import state from '@/store/state';
import models from '@/store/models';
import { createHealthBar, BAR_Y_OFFSET } from '@/scene/models/other/monster';

const { spawnPoints, wavePeak, damageStep, healthStep } = config.monster;

function getRandomSpawnPoint() {
  const point = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  return { x: point.x, y: 0.1, z: point.z };
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function spawnMonster() {
  const position = getRandomSpawnPoint();
  const { model, mixer, play, flashMaterials } = await models.monsterModel.default(position);

  const healthBar = createHealthBar();
  healthBar.group.position.set(position.x, position.y + BAR_Y_OFFSET, position.z);

  const entry = {
    model,
    mixer,
    play,
    health: state.monsterHealth,
    maxHealth: state.monsterHealth,
    attackTimer: 0,
    healthBar,
    attackDamage: state.monsterAttackDamage,
    flashMaterials,
    hitTimer: 0,
    knockback: new THREE.Vector3(),
  };
  state.monsters.push(entry);

  await delay(1000);
  scene.add(model);
  scene.add(healthBar.group);
}

export async function spawnMonsters() {
  for (let i = 0; i < state.waveSize; i++) {
    await spawnMonster();
  }

  if (state.waveSize === wavePeak) {
    state.waveSize = 1;
    state.monsterAttackDamage += damageStep;
    state.monsterHealth += healthStep;
  } else {
    state.waveSize++;
  }
}
