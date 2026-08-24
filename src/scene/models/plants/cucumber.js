import textureLoader from '@/utils/loader/textureLoader';
import * as THREE from 'three';
import { assetConfig } from '@/config/assetConfig';
import { config as globalConfig } from '@/config/config';
import { createContactShadow } from '@/scene/environment/contactShadow';

const blockSide = assetConfig.cucumber.blockSize * globalConfig.grid.cellSize;
const { placementMinus } = assetConfig.global;

const ripeTexture = textureLoader.load('./sprite/cucumber/ripe.webp');
ripeTexture.colorSpace = THREE.SRGBColorSpace;
const ripeMat = new THREE.SpriteMaterial({ map: ripeTexture, alphaTest: 0.5 });

const growingTexture = textureLoader.load('./sprite/cucumber/growing.webp');
growingTexture.colorSpace = THREE.SRGBColorSpace;
const growingMat = new THREE.SpriteMaterial({ map: growingTexture, alphaTest: 0.5 });

const cucumber = async (point) => {
  const group = new THREE.Group();

  const ripeSprite = new THREE.Sprite(ripeMat.clone());
  ripeSprite.scale.set(blockSide, blockSide, blockSide);
  ripeSprite.position.set(point.x + placementMinus, blockSide * 0.25, point.z + placementMinus);
  ripeSprite.rotation.y = Math.PI * -0.5;
  ripeSprite.visible = false;

  const growingSprite = new THREE.Sprite(growingMat.clone());
  growingSprite.scale.set(blockSide, blockSide, blockSide);
  growingSprite.position.set(point.x + placementMinus, blockSide * 0.25, point.z + placementMinus);

  group.add(ripeSprite);
  group.add(growingSprite);

  // Keep the shadow last: spawnCucumber.js reads children[0] and children[1] by index
  const shadow = createContactShadow(blockSide * 0.45);
  shadow.position.x = point.x + placementMinus;
  shadow.position.z = point.z + placementMinus;
  group.add(shadow);

  return group;
};

export default cucumber;
