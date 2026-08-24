import textureLoader from '@/utils/loader/textureLoader';
import * as THREE from 'three';
import { assetConfig } from '@/config/assetConfig';
import { config as globalConfig } from '@/config/config';
import { createContactShadow } from '@/scene/environment/contactShadow';

const blockSide = Math.sqrt(assetConfig.well.blockSize) * globalConfig.grid.cellSize;

// Measured opaque bounds of well.webp, as a fraction of the canvas
const ARTWORK_WIDTH = 0.587;

const wellTexture = textureLoader.load('./sprite/well.webp');
wellTexture.colorSpace = THREE.SRGBColorSpace;
const wellMat = new THREE.SpriteMaterial({ map: wellTexture, alphaTest: 0.5 });

const well = async (point) => {
  const group = new THREE.Group();
  group.position.set(point.x + 0.05, 0, point.z + 0.05);

  const scale = blockSide * 1.25;
  const sprite = new THREE.Sprite(wellMat.clone());
  sprite.scale.set(scale, scale, scale);
  sprite.position.y = blockSide * 0.5;

  group.add(sprite);
  group.add(createContactShadow(scale * ARTWORK_WIDTH * 0.85));
  return group;
};

export default well;
