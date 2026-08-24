import textureLoader from '@/utils/loader/textureLoader';
import * as THREE from 'three';
import { assetConfig } from '@/config/assetConfig';
import { config as globalConfig } from '@/config/config';
import { createContactShadow } from '@/scene/environment/contactShadow';

const blockSide = assetConfig.tomato.blockSize * globalConfig.grid.cellSize;
const { placementMinus } = assetConfig.global;

// Measured opaque bounds of the crop sprites, as a fraction of the canvas
const ARTWORK_WIDTH = 0.722;
const ARTWORK_HEIGHT = 0.6;

const ripeTexture = textureLoader.load('./sprite/tomato/ripe.webp');
ripeTexture.colorSpace = THREE.SRGBColorSpace;
const ripeMat = new THREE.SpriteMaterial({ map: ripeTexture, alphaTest: 0.5 });

const growingTexture = textureLoader.load('./sprite/tomato/growing.webp');
growingTexture.colorSpace = THREE.SRGBColorSpace;
const growingMat = new THREE.SpriteMaterial({ map: growingTexture, alphaTest: 0.5 });

const tomato = async (point, status) => {
  const group = new THREE.Group();

  const ripeSprite = new THREE.Sprite(ripeMat.clone());
  ripeSprite.scale.set(blockSide, blockSide, blockSide);
  ripeSprite.position.set(point.x + placementMinus, blockSide * 0.25, point.z + placementMinus);
  ripeSprite.rotation.y = Math.PI * -0.5;
  ripeSprite.visible = true;

  const growingSprite = new THREE.Sprite(growingMat.clone());
  growingSprite.scale.set(blockSide, blockSide, blockSide);
  growingSprite.position.set(point.x + placementMinus, blockSide * 0.25, point.z + placementMinus);
  growingSprite.visible = false;

  if (status === 'ripe') {
    ripeSprite.visible = true;
    growingSprite.visible = false;
  } else {
    ripeSprite.visible = false;
    growingSprite.visible = true;
  }

  group.add(ripeSprite);
  group.add(growingSprite);

  // Keep the shadow last: spawnTomato.js reads children[0] and children[1] by index
  const shadow = createContactShadow(
    blockSide * ARTWORK_WIDTH * 0.75,
    blockSide * ARTWORK_HEIGHT
  );
  shadow.position.x = point.x + placementMinus;
  shadow.position.z = point.z + placementMinus;
  group.add(shadow);

  return group;
};

export default tomato;
