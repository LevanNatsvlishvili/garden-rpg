import { Container, Graphics } from 'pixi.js';
import { app, UI_HEIGHT, POPUP_GAP } from '../pixiApp';
import { UIButton, BTN_HEIGHTS } from './button';
import state from '@/store/state';
import { assetConfig } from '@/config/assetConfig';
import { placeWell } from '@/gameplay/spawn/assets/spawnWell';
import { actionTomato } from '@/gameplay/spawn/assets/spawnTomato';
import { actionCucumber } from '@/gameplay/spawn/assets/spawnCucumber';
import { actionVine } from '@/gameplay/spawn/assets/spawnVine';
import { config } from '@/config/config';

const BTN_GAP = 8;
const ROW_GAP = 8;
const paddingX = 12;
const paddingY = 10;

export function buildShop(onClose, conditions, tutorialIndex) {
  const shopGroup = new Container();

  const shopBg = new Graphics();
  shopGroup.addChild(shopBg);

  const allButtons = [];

  const wellBtn = new UIButton({
    label: 'Well',
    price: assetConfig.well.price,
    emoji: '⛲',
    onClick: () => {
      placeWell();
      onClose();
    },
    condition: () => state.money >= assetConfig.well.price && !state.isWellPlaced && state.isDay,
  });
  shopGroup.addChild(wellBtn);
  allButtons.push(wellBtn);

  const plantButtons = [];

  const tomatoBtn = new UIButton({
    label: 'Tomato',
    price: assetConfig.tomato.price,
    subText: assetConfig.tomato.harvestIncome,
    btnSize: 'lg',
    emoji: '🍅',
    onClick: () => {
      actionTomato();
      onClose();
    },
    condition: () => state.money >= assetConfig.tomato.price && state.isWellPlaced && state.isDay,
  });
  shopGroup.addChild(tomatoBtn);
  allButtons.push(tomatoBtn);
  plantButtons.push(tomatoBtn);

  const cucumberBtn = new UIButton({
    label: 'Cucumber',
    price: assetConfig.cucumber.price,
    subText: `income ${assetConfig.cucumber.harvestIncome}`,
    btnSize: 'lg',
    emoji: '🥒',
    onClick: () => {
      actionCucumber();
      onClose();
    },
    condition: () => state.money >= assetConfig.cucumber.price && state.isWellPlaced && state.isDay,
  });
  shopGroup.addChild(cucumberBtn);
  allButtons.push(cucumberBtn);
  plantButtons.push(cucumberBtn);

  const vineBtn = new UIButton({
    label: 'Vine',
    price: assetConfig.vine.price,
    subText: `income ${assetConfig.vine.harvestIncome}`,
    btnSize: 'lg',
    txtSize: 'sm',
    emoji: '🍇',
    onClick: () => {
      actionVine();
      onClose();
    },
    condition: () => state.money >= assetConfig.vine.price && state.isWellPlaced && state.isDay,
  });
  shopGroup.addChild(vineBtn);
  allButtons.push(vineBtn);
  plantButtons.push(vineBtn);

  const potionButtons = [];

  const atkPotionBtn = new UIButton({
    label: '+Atk Point',
    price: config.items.attackIncrease.price,
    subText: `+${config.items.attackIncrease.increase} DMG`,
    emoji: '⚔️',
    btnSize: 'lg',
    onClick: () => {
      state.attackDamage += config.items.attackIncrease.increase;
      state.money -= config.items.attackIncrease.price;
      // tutorialIndex += 1;
      if (!state.isCharacterUpgraded) {
        state.isCharacterUpgraded = true;
      }
    },
    condition: () =>
      state.money >= config.items.attackIncrease.price && state.isDay && state.isFirstHarvestTaken,
  });
  shopGroup.addChild(atkPotionBtn);
  allButtons.push(atkPotionBtn);
  potionButtons.push(atkPotionBtn);

  const hpPotionBtn = new UIButton({
    label: 'Hp Potion',
    subText: `restores ${config.items.healthPottion.healthRestore} hp upon use`,
    price: config.items.healthPottion.price,
    emoji: '❤️',
    btnSize: 'lg',
    onClick: () => {
      state.potions += 1;
      state.money -= config.items.healthPottion.price;
    },
    condition: () =>
      state.money >= config.items.healthPottion.price && state.isDay && state.isFirstHarvestTaken,
  });
  shopGroup.addChild(hpPotionBtn);
  allButtons.push(hpPotionBtn);
  potionButtons.push(hpPotionBtn);

  const maxHpBtn = new UIButton({
    label: '+Max Hp',
    price: config.items.maxHealthIncrease.price,
    subText: `increase ${config.items.maxHealthIncrease.increase} max hp`,
    emoji: '💖',
    btnSize: 'lg',
    onClick: () => {
      state.characterMaxHealth += config.items.maxHealthIncrease.increase;
      state.characterCurrentHealth = state.characterMaxHealth;
      state.money -= config.items.maxHealthIncrease.price;
      if (!state.isCharacterUpgraded) {
        state.isCharacterUpgraded = true;
      }
    },
    condition: () =>
      state.money >= config.items.maxHealthIncrease.price &&
      state.isDay &&
      state.isFirstHarvestTaken,
  });
  shopGroup.addChild(maxHpBtn);
  allButtons.push(maxHpBtn);
  potionButtons.push(maxHpBtn);

  shopGroup.visible = false;

  function layout() {
    const h = app.screen.height;
    const w = app.screen.width;
    const innerW = w - paddingX * 2;
    const showWell = !state.isWellPlaced;
    const plantH = BTN_HEIGHTS.lg;
    const potionH = BTN_HEIGHTS.lg;
    const wellH = BTN_HEIGHTS.md;
    const popupH = paddingY * 2 + plantH + ROW_GAP + potionH + (showWell ? ROW_GAP + wellH : 0);

    shopBg.clear();
    shopBg.roundRect(0, 0, w, popupH, 10);
    shopBg.fill({ color: 0x14213d, alpha: 0.9 });
    shopBg.stroke({ color: 0x8d99ae, width: 1, alpha: 0.25 });

    const potionBtnW = (innerW - BTN_GAP * (potionButtons.length - 1)) / potionButtons.length;
    const potionRowY = paddingY;
    potionButtons.forEach((btn, i) => {
      btn._btnWidth = potionBtnW;
      btn._draw();
      btn.position.set(paddingX + i * (potionBtnW + BTN_GAP), potionRowY);
    });

    const plantBtnW = (innerW - BTN_GAP * (plantButtons.length - 1)) / plantButtons.length;
    const plantRowY = potionRowY + potionH + ROW_GAP;
    plantButtons.forEach((btn, i) => {
      btn._btnWidth = plantBtnW;
      btn._draw();
      btn.position.set(paddingX + i * (plantBtnW + BTN_GAP), plantRowY);
    });

    if (showWell) {
      const wellRowY = plantRowY + plantH + ROW_GAP;
      wellBtn._btnWidth = innerW;
      wellBtn._draw();
      wellBtn.position.set(paddingX, wellRowY);
    }

    shopGroup.y = h - UI_HEIGHT - POPUP_GAP - popupH;
  }

  function update(tutorialIndex) {
    wellBtn.visible = !state.isWellPlaced;
    wellBtn.setGlow(conditions.tutorial.shouldWellTipsStart());
    tomatoBtn.setGlow(conditions.tutorial.shouldTomatoTipsStart());
    allButtons.forEach((btn) => {
      btn.update();
      btn.tickGlow();
    });

    if (tutorialIndex !== null) {
      atkPotionBtn.setGlow(tutorialIndex === 5);
      maxHpBtn.setGlow(tutorialIndex === 5);
    }
  }

  return { container: shopGroup, layout, update };
}
