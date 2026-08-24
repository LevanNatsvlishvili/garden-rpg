import { scene } from '../utils/renderer';
import ground from './environment/ground';
import { ambientLight, directionalLight } from './lights/lights';
import { setupEnvironment } from './environment/environment';
import models from '@/store/models';
import spawnHouse, { housePoint } from '@/gameplay/spawn/assets/spawnHouse';
import { trees } from '@/config/treeConfig';
import { markStarterLayout } from '@/utils/starterLayout';
import character from './models/other/character';
import tree from './models/other/tree';
import house from './models/structures/house';
import { initAnimations } from '@/gameplay/character/characterAnimation';

const loadStarterModels = async () => {
  models.houseModel = await house(housePoint);
  const { model: charModel, mixer, clips } = await character();
  models.characterModel = charModel;
  initAnimations(mixer, clips);

  const treeSprites = await Promise.all(trees.map((pos) => tree(pos)));
  treeSprites.forEach((sprite) => scene.add(sprite));

  scene.add(models.characterModel);
};

export async function setupScene() {
  setupEnvironment();

  await loadStarterModels();
  spawnHouse();
  markStarterLayout();

  scene.add(ground);
  scene.add(ambientLight);
  scene.add(directionalLight);
}

export default setupScene;
