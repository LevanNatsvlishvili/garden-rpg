import * as THREE from 'three';
import { scene } from '@/utils/renderer';
import { config } from '@/config/config';
import state from '@/store/state';
import models from '@/store/models';
import { createHealthBar, BAR_Y_OFFSET } from '@/scene/models/other/monster';

const { spawnPoints } = config.monster;
let spawnCount = 1;
let attackDamage = config.monster.attackDamage;
let hp = config.monster.health;

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
    health: hp,
    attackTimer: 0,
    healthBar,
    attackDamage,
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
  for (let i = 0; i < spawnCount; i++) {
    await spawnMonster();
  }
  if (spawnCount === 5) {
    spawnCount = 1;
    attackDamage = config.monster.attackDamage + 1;
    hp = config.monster.health + 2;
  } else {
    spawnCount++;
  }
}
