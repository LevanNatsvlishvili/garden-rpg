import textureLoader from '@/utils/loader/textureLoader';
import * as THREE from 'three';
import { assetConfig } from '@/config/assetConfig';
import { config as globalConfig } from '@/config/config';
import { createContactShadow } from '@/scene/environment/contactShadow';
import gui from '@/utils/gui';

const { xBlocks, yBlocks } = assetConfig.house;
const { cellSize } = globalConfig.grid;

const width = xBlocks * cellSize * 2.5;
const height = yBlocks * cellSize * 2.5;

const houseTexture = textureLoader.load('./sprite/house.png');
houseTexture.colorSpace = THREE.SRGBColorSpace;
const houseMat = new THREE.SpriteMaterial({ map: houseTexture, alphaTest: 0.5 });

const house = async (point) => {
  const group = new THREE.Group();
  group.position.set(point.x + 0.075, 0, point.z + 0.15);

  const sprite = new THREE.Sprite(houseMat.clone());
  sprite.scale.set(width, height, 1);
  sprite.position.y = height * 0.25;

  gui
    .add(sprite.position, 'y')
    .min(0)
    .max(height * 0.25)
    .step(0.01)
    .name('House Position Y');

  gui
    .add(sprite.rotation, 'z')
    .min(0)
    .max(Math.PI * 2)
    .step(0.01)
    .name('House Rotation Z');
  gui.add(sprite.scale, 'x').min(0).max(10).step(0.01).name('House Scale X');
  gui.add(sprite.scale, 'y').min(0).max(10).step(0.01).name('House Scale Y');
  gui.add(sprite.scale, 'z').min(0).max(10).step(0.01).name('House Scale Z');

  group.add(sprite);
  group.add(createContactShadow(width * 0.5));
  return group;
};

export default house;
