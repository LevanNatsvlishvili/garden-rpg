import textureLoader from '@/utils/loader/textureLoader';
import * as THREE from 'three';
import { assetConfig } from '@/config/assetConfig';
import { config as globalConfig } from '@/config/config';
import { createContactShadow } from '@/scene/environment/contactShadow';

const blockSide = assetConfig.tree.blockSize * globalConfig.grid.cellSize;

// Measured opaque bounds of tree.webp: the artwork covers barely half the canvas, so a shadow
// sized from the sprite scale is far wider than the tree. Trimmed again for the canopy overhang.
const ARTWORK_WIDTH = 0.516;
const ARTWORK_HEIGHT = 0.833;

const treeTexture = textureLoader.load('./sprite/tree.webp');
treeTexture.colorSpace = THREE.SRGBColorSpace;
// alphaTest keeps the sprite opaque, so the depth buffer sorts overlaps instead of render order
const treeMat = new THREE.SpriteMaterial({ map: treeTexture, alphaTest: 0.5 });

// Deterministic per-tree variation keyed off position, so the treeline stops reading as one
// repeated stamp but stays identical across reloads
function jitter(point, seed) {
  const n = Math.sin(point.x * 127.1 + point.z * 311.7 + seed) * 43758.5453;
  return n - Math.floor(n);
}

const tree = async (point) => {
  const { placementMinus } = assetConfig.global;
  const group = new THREE.Group();
  group.position.set(point.x - placementMinus, 0, point.z - placementMinus);

  const scale = blockSide * 1.25 * (0.8 + jitter(point, 0) * 0.4);
  const tint = 0.88 + jitter(point, 1) * 0.12;

  const sprite = new THREE.Sprite(treeMat.clone());
  sprite.scale.set(scale, scale, scale);
  sprite.position.y = scale * 0.4;
  sprite.userData.baseTint = tint;
  sprite.material.color.setScalar(tint);

  group.add(sprite);
  group.add(createContactShadow(scale * ARTWORK_WIDTH * 0.65, scale * ARTWORK_HEIGHT));
  return group;
};

export default tree;
