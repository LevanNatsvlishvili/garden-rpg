import { scene } from '@/utils/renderer';
import models from '@/store/models';
import { assetConfig } from '@/config/assetConfig';
import { snapToGrid } from '@/utils/placementTool';
import * as THREE from 'three';

const { xBlocks, yBlocks } = assetConfig.house;
export const housePoint = new THREE.Vector3(
  snapToGrid(assetConfig.house.startingPosition.x, xBlocks),
  0,
  snapToGrid(assetConfig.house.startingPosition.z, yBlocks)
);

// Starter Tools
async function spawnHouse() {
  scene.add(models.houseModel);
  return models.houseModel;
}

export default spawnHouse;
