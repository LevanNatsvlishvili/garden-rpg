import { trees } from '@/config/treeConfig';
import { assetConfig } from '@/config/assetConfig';
import { markOccupied } from '@/utils/placementTool';
import { housePoint } from '@/gameplay/spawn/assets/spawnHouse';

const { xBlocks, yBlocks } = assetConfig.house;
const treeSide = Math.sqrt(assetConfig.tree.blockSize);

// The starter house and treeline occupy grid cells that clearOccupied() wipes, so both the
// initial setup and a game reset claim them through here rather than duplicating the logic.
export function markStarterLayout() {
  markOccupied(housePoint.x, housePoint.z, xBlocks, yBlocks);
  for (const point of trees) {
    markOccupied(point.x, point.z, treeSide);
  }
}
