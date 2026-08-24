import { camera, renderer, scene } from './utils/renderer';
import { controls } from './utils/controls/controls';
import { updateCameraFollow } from './utils/controls/cameraFollow';
import windowResizer from './utils/windowResizer';
import { setupScene, setupRest } from './scene';
import models from './store/models';
import { updateCharacter } from './gameplay/character/characterMobility';
import { updateCombat } from './gameplay/character/characterCombat';
import { updateAnimations } from './gameplay/character/characterAnimation';
import { updateAllEnemies } from './gameplay/monsterAI/monsterAI';
import { config } from './config/config';
import { initPixiUI } from './ui/pixiApp';
import { buildGameUI } from './ui/gameUI';
import { showLoadingScreen, updateLoadingProgress, hideLoadingScreen } from './ui/loadingScreen';
import { onLoadProgress } from './utils/loader/loadingManager';
import { updatePlacement } from './utils/placementTool';
import './styles/style.css';

async function init() {
  await initPixiUI();
  showLoadingScreen();
  onLoadProgress((loaded, total) => updateLoadingProgress(loaded, total));

  scene.add(camera);
  windowResizer(camera, renderer);

  await setupScene();
  hideLoadingScreen();
  buildGameUI();

  const frameDuration = 1000 / config.fps.limit;
  let lastTime = 0;

  const tick = (now) => {
    window.requestAnimationFrame(tick);

    if (!lastTime) {
      lastTime = now;
    }

    const delta = now - lastTime;

    if (delta < frameDuration) {
      return;
    }

    lastTime = now - (delta % frameDuration);

    const deltaSec = delta / 1000;

    if (models.characterModel) {
      updateCharacter(models.characterModel, deltaSec);
      updateCombat(deltaSec);
      updateAnimations(deltaSec);
      updateCameraFollow(models.characterModel, deltaSec);
    }
    updateAllEnemies(deltaSec);
    updatePlacement();

    controls.update();
    renderer.render(scene, camera);
  };
  window.requestAnimationFrame(tick);

  setupRest();
}
init().catch((err) => {
  console.error(
    'An error occurred during loading, please restart the webpage and start again:',
    err
  );
});
