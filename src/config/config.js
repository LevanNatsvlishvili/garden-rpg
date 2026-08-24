import * as THREE from 'three';

export const config = {
  camera: {
    fov: 26,
    position: { x: 3.1, y: 2.8, z: 3.1 },
    followLerp: 0.1,
  },

  controls: {
    enableDamping: true,
    maxPolarAngle: Math.PI / 2,
    minPolarAngle: 0,
    // maxDistance: 10,
    // minDistance: 5,
  },

  character: {
    speed: 0.5,
    startingPosition: { x: -0, y: 0.1, z: -0 },
    attackRange: 0.15,
    attackDamage: 1,
    attackCooldown: 0.5,
    health: 20,
  },

  monster: {
    speed: 0.75,
    attackRange: 0.15,
    attackDamage: 1,
    attackCooldown: 1.5,
    health: 5,
    startingPosition: { x: 1, y: 0.1, z: 0 },
    spawnPoints: [
      {
        x: 4,
        z: 4,
      },
      {
        x: 4,
        z: 0.30000000000000004,
      },
      {
        x: 4.3,
        z: -4.1000000000000005,
      },
    ],
  },

  items: {
    attackIncrease: {
      price: 2,
      increase: 1,
    },
    healthPottion: {
      price: 4,
      healthRestore: 10,
    },
    maxHealthIncrease: {
      price: 2,
      increase: 1,
    },
  },

  renderer: {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    shadowMap: true,
    shadowType: THREE.PCFSoftShadowMap,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.1,
  },

  lights: {
    ambient: {
      color: '#b9d5ff',
      intensity: 1.2,
      nightIntensity: 0.25,
    },
    directional: {
      color: '#fff4e0',
      intensity: 1.5,
      nightIntensity: 0,
      position: { x: -2, y: 8, z: -7 },
      shadow: {
        mapSize: 1024,
        camera: { top: 8, right: 8, bottom: -8, left: -8, near: 1, far: 25 },
      },
    },
  },

  ground: {
    size: 10,
    color: '#7cab53',
    positionY: -0.5,
  },

  grid: {
    cellSize: 0.1,
    highlightColor: 0xffffff,
    highlightOpacity: 0.3,
    lineColor: 0xffffff,
    lineOpacity: 0.15,
  },

  environment: {
    background: 0x87ceeb,
    fog: { color: 0x87ceeb, near: 6, far: 9.5 },
  },

  fps: {
    limit: 60,
  },
};
