import { scene } from '@/utils/renderer';
import { clearOccupied, deactivate } from '@/utils/placementTool';
import { markStarterLayout } from '@/utils/starterLayout';
import { cancelSpawning } from '@/gameplay/monsterAI/spawnMonster';
import { ambientLight, directionalLight } from '@/scene/lights/lights';
import { torchLight } from '@/scene/models/other/character';
import { setNightTint } from '@/utils/setNightTint';
import { config } from '@/config/config';
import { assetConfig } from '@/config/assetConfig';
import state from '@/store/state';
import models from '@/store/models';

export function resetGame() {
  // Drop any wave still arriving before clearing, so it cannot land in the new game
  cancelSpawning();

  // Remove monsters from scene
  for (const entry of state.monsters) {
    scene.remove(entry.model);
    scene.remove(entry.healthBar.group);
  }

  // Remove plants from scene
  for (const entry of [...state.tomatoes, ...state.cucumbers, ...state.vines]) {
    scene.remove(entry.ref);
  }

  // Remove well from scene
  if (state.wellModel) {
    scene.remove(state.wellModel);
  }

  // Remove player-planted trees from scene
  for (const entry of state.trees) {
    if (entry.ref) scene.remove(entry.ref);
  }

  // Reset character position
  if (models.characterModel) {
    const { x, y, z } = config.character.startingPosition;
    models.characterModel.position.set(x, y, z);
  }

  // Reset lights to day
  ambientLight.intensity = config.lights.ambient.intensity;
  directionalLight.intensity = config.lights.directional.intensity;
  torchLight.intensity = 0;
  setNightTint(false);

  // Clear placement grid, then reclaim the cells the starter layout still occupies
  clearOccupied();
  markStarterLayout();
  deactivate();

  // Reset state
  state.tomatoes = [];
  state.cucumbers = [];
  state.vines = [];
  state.trees = [];
  state.monsters = [];
  state.wellModel = null;
  state.money = assetConfig.global.startingMoney;
  state.characterCurrentHealth = config.character.health;
  state.characterMaxHealth = config.character.health;
  state.attackDamage = config.character.attackDamage;
  state.potions = 0;
  state.waveSize = 1;
  state.monsterHealth = config.monster.health;
  state.monsterAttackDamage = config.monster.attackDamage;
  state.isWellPlaced = false;
  state.isPlantPlaced = false;
  state.isFirstHarvestTaken = false;
  state.isFirstDay = true;
  state.isSecondDay = false;
  state.isTutorialFinished = false;
  state.isCharacterUpgraded = false;
  state.isDay = true;
}
