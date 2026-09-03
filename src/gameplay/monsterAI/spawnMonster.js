import * as THREE from 'three';
import { scene } from '@/utils/renderer';
import { config } from '@/config/config';
import state from '@/store/state';
import models from '@/store/models';
import { createHealthBar, BAR_Y_OFFSET } from '@/scene/models/other/monster';
import { finishNight } from '@/gameplay/actions/finishNight';

const { spawnPoints, wavePeak, damageStep, healthStep, spawnInterval } = config.monster;

// Bumped whenever a wave is cancelled or superseded. Work still in flight from an older run
// compares against this to tell it is stale, so a reset is never followed by monsters from the
// game before it.
let spawnGeneration = 0;

function getRandomSpawnPoint() {
  const point = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  return { x: point.x, y: 0.1, z: point.z };
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function spawnMonster(generation) {
  const position = getRandomSpawnPoint();
  const { model, mixer, play, flashMaterials } = await models.monsterModel.default(position);

  // The wave may have been abandoned while the model was still loading
  if (generation !== spawnGeneration) return;

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

  // Joined to the scene and the update list in the same tick. Splitting the two let a monster
  // chase and attack while still invisible, and let a kill race an add that had not happened yet.
  scene.add(model);
  scene.add(healthBar.group);
  state.monsters.push(entry);
}

function advanceWave() {
  if (state.waveSize === wavePeak) {
    state.waveSize = 1;
    state.monsterAttackDamage += damageStep;
    state.monsterHealth += healthStep;
  } else {
    state.waveSize++;
  }
}

// Abandons a wave that is still arriving
export function cancelSpawning() {
  spawnGeneration++;
  state.isSpawningWave = false;
}

export async function spawnMonsters() {
  const generation = ++spawnGeneration;
  state.isSpawningWave = true;

  for (let i = 0; i < state.waveSize; i++) {
    await delay(spawnInterval);
    if (generation !== spawnGeneration) return;

    await spawnMonster(generation);
    if (generation !== spawnGeneration) return;
  }

  advanceWave();
  state.isSpawningWave = false;

  // The player can clear everything that has arrived while the rest is still on its way, which
  // leaves no kill to end the night once the wave finally finishes
  if (state.monsters.length === 0) finishNight();
}
