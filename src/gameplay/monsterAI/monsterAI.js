import * as THREE from 'three';
import { config } from '@/config/config';
import { isCellOccupied } from '@/utils/placementTool';
import models from '@/store/models';
import state from '@/store/state';
import gameover from '../gameover';
import playerHit from '../playerHit';
import { BAR_Y_OFFSET, setHitFlash } from '@/scene/models/other/monster';

const { speed, attackRange, attackDamage, attackCooldown } = config.monster;
const { hitFlashDuration, knockbackDamping } = config.feedback;
const RADIUS = config.grid.cellSize;

const direction = new THREE.Vector3();

function isBlocked(x, z) {
  return (
    isCellOccupied(x - RADIUS, z - RADIUS) ||
    isCellOccupied(x + RADIUS, z - RADIUS) ||
    isCellOccupied(x - RADIUS, z + RADIUS) ||
    isCellOccupied(x + RADIUS, z + RADIUS)
  );
}

// Updates all alive monsters each frame
export function updateAllEnemies(delta) {
  const player = models.characterModel;
  if (!player) return;

  for (const entry of state.monsters) {
    entry.mixer?.update(delta);
    if (entry.health <= 0) continue;
    updateSingleEnemy(entry, player, delta);
  }
}

function updateHealthBar(entry) {
  const { model } = entry;
  const { group, fgMesh, barWidth } = entry.healthBar;
  group.position.x = model.position.x;
  group.position.y = model.position.y + BAR_Y_OFFSET;
  group.position.z = model.position.z;

  const ratio = Math.max(0, entry.health / entry.maxHealth);
  fgMesh.scale.x = ratio;
  fgMesh.position.x = -(barWidth / 2) * (1 - ratio);
}

// Eases the impact tint back to the material's normal emissive
function updateHitFlash(entry, delta) {
  if (entry.hitTimer <= 0) return;

  entry.hitTimer = Math.max(0, entry.hitTimer - delta);
  setHitFlash(entry.flashMaterials, entry.hitTimer / hitFlashDuration);
}

// Runs alongside the chase rather than replacing it, so a knocked-back monster still turns to
// follow the player as it slides
function updateKnockback(entry, delta) {
  const { knockback, model } = entry;
  if (knockback.lengthSq() < 0.0001) return;

  const nextX = model.position.x + knockback.x * delta;
  const nextZ = model.position.z + knockback.z * delta;
  if (!isBlocked(nextX, nextZ)) {
    model.position.x = nextX;
    model.position.z = nextZ;
  }

  knockback.multiplyScalar(Math.max(0, 1 - knockbackDamping * delta));
  if (knockback.lengthSq() < 0.0001) knockback.set(0, 0, 0);
}

function updateSingleEnemy(entry, player, delta) {
  const { model } = entry;

  updateHitFlash(entry, delta);
  updateKnockback(entry, delta);

  direction.subVectors(player.position, model.position);
  direction.y = 0;
  const distance = direction.length();

  updateHealthBar(entry);

  // Attack when in range
  if (distance <= attackRange) {
    entry.play?.('attack');
    entry.attackTimer -= delta;
    if (entry.attackTimer <= 0) {
      entry.attackTimer = attackCooldown;
      if (state.characterCurrentHealth > 0) {
        state.characterCurrentHealth -= entry.attackDamage;
        playerHit();

        if (state.characterCurrentHealth <= 0) {
          gameover();
          return;
        }
      }
    }
    return;
  }

  // Chase the player
  entry.play?.('walk');
  direction.normalize();
  const step = speed * delta;

  const nextX = model.position.x + direction.x * step;
  const nextZ = model.position.z + direction.z * step;

  if (!isBlocked(nextX, nextZ)) {
    model.position.x = nextX;
    model.position.z = nextZ;
  } else {
    if (!isBlocked(nextX, model.position.z)) {
      model.position.x = nextX;
    }
    if (!isBlocked(model.position.x, nextZ)) {
      model.position.z = nextZ;
    }
  }

  model.rotation.y = Math.atan2(direction.x, direction.z);
}
