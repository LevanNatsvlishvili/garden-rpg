import { Container, Sprite, Texture } from 'pixi.js';
import { app } from '../pixiApp';
import { config } from '@/config/config';

const { damageFlashDuration, damageFlashAlpha } = config.feedback;
const TEXTURE_SIZE = 256;

// An edges-in vignette rather than a flat wash, so a hit reads clearly without hiding the fight
function createVignetteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;

  const half = TEXTURE_SIZE * 0.5;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(half, half, half * 0.35, half, half, half);
  gradient.addColorStop(0, 'rgba(255, 30, 45, 0)');
  gradient.addColorStop(0.7, 'rgba(255, 30, 45, 0.45)');
  gradient.addColorStop(1, 'rgba(255, 20, 35, 1)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  return Texture.from(canvas);
}

export function buildDamageFlash() {
  const container = new Container();
  // Covers the whole screen, so it must never swallow input meant for the HUD below it
  container.eventMode = 'none';
  container.alpha = 0;

  const vignette = new Sprite(createVignetteTexture());
  container.addChild(vignette);

  let timer = 0;

  function layout() {
    vignette.width = app.screen.width;
    vignette.height = app.screen.height;
  }

  function update(delta) {
    if (timer <= 0) {
      container.alpha = 0;
      return;
    }

    timer = Math.max(0, timer - delta);
    container.alpha = (timer / damageFlashDuration) * damageFlashAlpha;
  }

  window.addEventListener('playerhit', () => {
    timer = damageFlashDuration;
  });

  layout();
  return { container, layout, update };
}
