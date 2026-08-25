import { app, UI_HEIGHT, resizeCanvas } from './pixiApp';
import { buildBottomBar } from './components/bottomBar';
import { buildShop } from './components/shop';
import { buildTopbar } from './components/topbar';
import { buildTutorialTips } from './components/tutorialTips';
import { buildGameOverScreen } from './components/gameOverScreen';
import { buildDamageFlash } from './components/damageFlash';
import { buildJoystick } from './components/joystick';
import { buildAttackButton } from './components/attackButton';
import { onPlacementChange } from '@/utils/placementTool';
import state from '@/store/state';
import { finishDay } from '@/gameplay/actions/finishDay';
import { moveTutorialIndex } from './utils/tutorialIndex';
import { createConditions } from './utils/conditions';

export function buildGameUI() {
  const topbar = buildTopbar();

  let tutorialIndex = null;
  let shopOpen = false;

  const conditions = createConditions();

  const shop = buildShop(() => closeShop(), conditions);
  const tutorialTips = buildTutorialTips();

  const bottomBar = buildBottomBar({
    conditions,
    onShopToggle: () => toggleShop(),
    onFinishDay: () => {
      closeShop();
      finishDay();
    },
    onHarvest: () => {
      conditions.allPlants().forEach((p) => p.takeHarvest());
      state.isFirstHarvestTaken = true;
      tutorialIndex = 5;
    },
  });

  const damageFlash = buildDamageFlash();
  const gameOverScreen = buildGameOverScreen();

  const joystick = buildJoystick();
  const attackBtn = buildAttackButton();
  app.stage.addChild(joystick);
  app.stage.addChild(attackBtn);
  app.stage.addChild(topbar.container);
  app.stage.addChild(tutorialTips.container);
  app.stage.addChild(shop.container);
  app.stage.addChild(bottomBar.container);
  app.stage.addChild(damageFlash.container);
  app.stage.addChild(gameOverScreen.container);

  window.addEventListener('gameover', () => gameOverScreen.show());

  function layout() {
    const h = app.screen.height;
    const w = app.screen.width;

    joystick.position.set(80, h - UI_HEIGHT - 70);
    attackBtn.position.set(w - 80, h - UI_HEIGHT - 70);

    topbar.layout();
    bottomBar.layout();
    tutorialTips.layout(tutorialIndex);
    damageFlash.layout();

    if (shopOpen) {
      shop.layout();
    }
  }

  function toggleShop() {
    shopOpen ? closeShop() : openShop();
  }

  function openShop() {
    shopOpen = true;
    shop.container.visible = true;
    shop.layout();
  }

  function closeShop() {
    shopOpen = false;
    shop.container.visible = false;
  }

  layout();

  // Disables UI when placing assets and enables it when placing is finished
  // Pixi overrides pointer events on the container, so we need to make it disappear
  const uiContainer = document.getElementById('ui-container');
  onPlacementChange(
    () => {
      bottomBar.container.visible = false;
      joystick.visible = false;
      attackBtn.visible = false;
      shop.container.visible = false;
      uiContainer.style.pointerEvents = 'none';
    },
    () => {
      bottomBar.container.visible = true;
      joystick.visible = true;
      uiContainer.style.pointerEvents = 'auto';
    }
  );

  app.ticker.add(() => {
    topbar.update();
    attackBtn.visible = !conditions.isDay();

    tutorialIndex = moveTutorialIndex(tutorialIndex, conditions);

    bottomBar.update(tutorialIndex);
    shop.update(tutorialIndex);
    tutorialTips.update(tutorialIndex);
    damageFlash.update(app.ticker.deltaMS / 1000);
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
    layout();
  });
}
