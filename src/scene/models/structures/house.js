import textureLoader from '@/utils/loader/textureLoader';
import * as THREE from 'three';
import { assetConfig } from '@/config/assetConfig';
import { config as globalConfig } from '@/config/config';
import { createContactShadow } from '@/scene/environment/contactShadow';

const { xBlocks, yBlocks } = assetConfig.house;
const { cellSize } = globalConfig.grid;

const width = xBlocks * cellSize * 2;
const height = yBlocks * cellSize * 1.75;

const houseTexture = textureLoader.load('./sprite/house.png');
houseTexture.colorSpace = THREE.SRGBColorSpace;
const HOUSE_TINT = 0.5;

// Measured opaque height of house.png, as a fraction of the canvas
const HOUSE_ARTWORK_HEIGHT = 0.573;

const houseMat = new THREE.SpriteMaterial({
  map: houseTexture,
  color: new THREE.Color(HOUSE_TINT, HOUSE_TINT, HOUSE_TINT),
  alphaTest: 0.5,
});

const house = async (point) => {
  const group = new THREE.Group();
  group.position.set(point.x + 0.075, 0, point.z + 0.15);

  const sprite = new THREE.Sprite(houseMat.clone());
  sprite.scale.set(width, height, 1);
  sprite.position.y = height * 0.25;
  // Without this, setNightTint resets the material tint to full brightness at the first nightfall
  sprite.userData.baseTint = HOUSE_TINT;

  group.add(sprite);
  group.add(createContactShadow(width * 0.5, height * HOUSE_ARTWORK_HEIGHT));
  return group;
};

export default house;
