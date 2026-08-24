import * as THREE from 'three';
import { camera, renderer, scene } from './renderer';
import { config } from '../config/config';
import models from '../store/models';

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const { cellSize, highlightColor, highlightOpacity, lineColor, lineOpacity } = config.grid;
const BLOCKED_COLOR = 0xff4444;
const groundSize = config.ground.size;
const halfGround = groundSize / 2;
const cellCount = Math.floor(groundSize / cellSize);

const occupiedCells = new Set();
const OCCUPIED_COLOR = 0xff8844;
const OCCUPIED_OPACITY = 0.25;

const occupiedGroup = new THREE.Group();
occupiedGroup.visible = false;
scene.add(occupiedGroup);

const occupiedMat = new THREE.MeshBasicMaterial({
  color: OCCUPIED_COLOR,
  transparent: true,
  opacity: OCCUPIED_OPACITY,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const occupiedCellGeo = new THREE.PlaneGeometry(cellSize, cellSize);

const gridHelper = new THREE.GridHelper(groundSize, cellCount, lineColor, lineColor);
gridHelper.material.transparent = true;
gridHelper.material.opacity = lineOpacity;
gridHelper.position.y = 0.01;
gridHelper.visible = false;
scene.add(gridHelper);

const highlightGeo = new THREE.PlaneGeometry(1, 1);
const highlightMat = new THREE.MeshBasicMaterial({
  color: highlightColor,
  transparent: true,
  opacity: highlightOpacity,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
highlightMesh.rotation.x = -Math.PI * 0.5;
highlightMesh.position.y = 0.02;
highlightMesh.visible = false;
scene.add(highlightMesh);

let active = false;
let groundMesh = null;
let spawnCallback = null;
let currentXSide = 1;
let currentZSide = 1;
let canPlace = true;
let lastPoint = null;

function cellKey(x, z) {
  return `${x.toFixed(4)},${z.toFixed(4)}`;
}

function parseBlockSize(blockSize) {
  if (typeof blockSize === 'object' && blockSize.x !== undefined) {
    return { xSide: blockSize.x, zSide: blockSize.z };
  }
  const side = Math.sqrt(blockSize);
  return { xSide: side, zSide: side };
}

function getCellsForBlock(cx, cz, xSide, zSide) {
  const cells = [];
  const halfX = (xSide - 1) * cellSize * 0.5;
  const halfZ = (zSide - 1) * cellSize * 0.5;
  for (let ix = 0; ix < xSide; ix++) {
    for (let iz = 0; iz < zSide; iz++) {
      const x = cx - halfX + ix * cellSize;
      const z = cz - halfZ + iz * cellSize;
      cells.push(cellKey(x, z));
    }
  }
  return cells;
}

// The character moves, so it is never written into the occupancy grid. Its footprint is tested
// directly instead, matching the half-extent characterMobility collides with.
function overlapsCharacter(cx, cz, xSide, zSide) {
  const character = models.characterModel;
  if (!character) return false;

  const halfX = xSide * cellSize * 0.5 + cellSize;
  const halfZ = zSide * cellSize * 0.5 + cellSize;

  return (
    Math.abs(character.position.x - cx) < halfX && Math.abs(character.position.z - cz) < halfZ
  );
}

function isBlocked(cx, cz, xSide, zSide) {
  if (overlapsCharacter(cx, cz, xSide, zSide)) return true;
  const cells = getCellsForBlock(cx, cz, xSide, zSide);
  return cells.some((key) => occupiedCells.has(key));
}

export function markOccupied(cx, cz, xSide, zSide = xSide) {
  const halfX = (xSide - 1) * cellSize * 0.5;
  const halfZ = (zSide - 1) * cellSize * 0.5;
  for (let ix = 0; ix < xSide; ix++) {
    for (let iz = 0; iz < zSide; iz++) {
      const x = cx - halfX + ix * cellSize;
      const z = cz - halfZ + iz * cellSize;
      const key = cellKey(x, z);
      if (!occupiedCells.has(key)) {
        occupiedCells.add(key);
        const mesh = new THREE.Mesh(occupiedCellGeo, occupiedMat);
        mesh.rotation.x = -Math.PI * 0.5;
        mesh.position.set(x, 0.015, z);
        occupiedGroup.add(mesh);
      }
    }
  }
}

function setHighlightSize(blockSize) {
  const { xSide, zSide } = parseBlockSize(blockSize);
  currentXSide = xSide;
  currentZSide = zSide;
  highlightMesh.scale.set(xSide * cellSize, zSide * cellSize, 1);
}

export function snapToGrid(value, side) {
  if (side % 2 === 0) {
    return Math.round(value / cellSize) * cellSize;
  }
  return Math.floor(value / cellSize) * cellSize + cellSize * 0.5;
}

function clampToGround(val, side) {
  const halfSpan = side * cellSize * 0.5;
  return Math.max(-halfGround + halfSpan, Math.min(halfGround - halfSpan, val));
}

function getGridPoint(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(groundMesh);
  if (hits.length === 0) return null;

  const p = hits[0].point;
  return {
    x: clampToGround(snapToGrid(p.x, currentXSide), currentXSide),
    y: 0,
    z: clampToGround(snapToGrid(p.z, currentZSide), currentZSide),
  };
}

function refreshHighlight() {
  if (!lastPoint) return;

  canPlace = !isBlocked(lastPoint.x, lastPoint.z, currentXSide, currentZSide);
  highlightMat.color.setHex(canPlace ? highlightColor : BLOCKED_COLOR);
  highlightMat.opacity = canPlace ? highlightOpacity : 0.45;
}

// Driven from the render loop: the character can walk under a cursor that has not moved since,
// so the highlight would otherwise keep reading as placeable
export function updatePlacement() {
  if (active) refreshHighlight();
}

function onPointerMove(event) {
  if (!active || !groundMesh) return;

  const snapped = getGridPoint(event);
  if (snapped) {
    highlightMesh.position.x = snapped.x;
    highlightMesh.position.z = snapped.z;
    highlightMesh.visible = true;

    lastPoint = snapped;
    refreshHighlight();
  } else {
    lastPoint = null;
    highlightMesh.visible = false;
  }
}

function onPointerDown(event) {
  if (!active || !groundMesh) return;

  const snapped = getGridPoint(event);
  if (!snapped || !spawnCallback) return;

  // Re-tested here rather than trusting canPlace, which is only as fresh as the last pointermove
  if (isBlocked(snapped.x, snapped.z, currentXSide, currentZSide)) return;

  markOccupied(snapped.x, snapped.z, currentXSide, currentZSide);
  spawnCallback(new THREE.Vector3(snapped.x, snapped.y, snapped.z));
}

function showGrid(visible) {
  gridHelper.visible = visible;
  occupiedGroup.visible = visible;
  highlightMesh.visible = false;
  renderer.domElement.style.cursor = visible ? 'crosshair' : '';
}

let _onActivate = null;
let _onDeactivate = null;

export function onPlacementChange(onActivate, onDeactivate) {
  _onActivate = onActivate;
  _onDeactivate = onDeactivate;
}

export function activate(ground, callback, blockSize = 1) {
  active = true;
  groundMesh = ground;
  spawnCallback = callback;
  setHighlightSize(blockSize);
  showGrid(true);
  _onActivate?.();
}

export function deactivate() {
  active = false;
  groundMesh = null;
  spawnCallback = null;
  lastPoint = null;
  showGrid(false);
  _onDeactivate?.();
}

export function isActive() {
  return active;
}

export function getActiveCallback() {
  return spawnCallback;
}

export function clearOccupied() {
  occupiedCells.clear();
  occupiedGroup.clear();
}

export function isCellOccupied(x, z) {
  const cx = Math.floor(x / cellSize) * cellSize + cellSize * 0.5;
  const cz = Math.floor(z / cellSize) * cellSize + cellSize * 0.5;
  return occupiedCells.has(cellKey(cx, cz));
}

renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerdown', onPointerDown);
