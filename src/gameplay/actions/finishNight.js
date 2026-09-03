import state from '@/store/state';
import { ambientLight, directionalLight } from '@/scene/lights/lights';
import { config } from '@/config/config';
import { torchLight } from '@/scene/models/other/character';
import { setNightTint } from '@/utils/setNightTint';

const { intensity: defaultAmbient } = config.lights.ambient;
const { intensity: defaultDirectional } = config.lights.directional;

export function finishNight() {
  if (state.monsters.length > 0 || state.isDay || state.isSpawningWave) return;

  // Ripens all plants when night is finished
  const allPlants = () => [...state.tomatoes, ...state.cucumbers, ...state.vines];
  const ripenAll = () => allPlants().forEach((p) => p.ripenHarvest());
  ripenAll();

  ambientLight.intensity = defaultAmbient;
  directionalLight.intensity = defaultDirectional;
  torchLight.intensity = 0;
  setNightTint(false);
  state.isDay = true;
  state.isSecondDay = true;
  state.isFirstDay = false;
  state.characterCurrentHealth = state.characterMaxHealth;
}
