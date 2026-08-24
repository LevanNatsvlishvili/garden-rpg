import { assetConfig } from '@/config/assetConfig';
import ground from '@/scene/environment/ground';
import state from '@/store/state';
import { scene } from '@/utils/renderer';
import { spawnActivator } from '../spawnTool';
import { deactivate } from '@/utils/placementTool';
import models from '@/store/models';

async function spawnTree(point) {
  if (state.money < assetConfig.tree.price) return;
  const model = await models.treeModel.default(point);
  scene.add(model);
  state.money -= assetConfig.tree.price;
  state.trees.push({ x: point.x, z: point.z, ref: model });
  if (state.money < assetConfig.tree.price) {
    deactivate();
  }
}

export const placeTree = () => {
  if (state.money >= assetConfig.tree.price) {
    spawnActivator(ground, spawnTree, assetConfig.tree.blockSize);
  } else {
    deactivate();
  }
};
