import { scene } from '@/utils/renderer';
import { setContactShadowNight } from '@/scene/environment/contactShadow';

export function setNightTint(isNight) {
  const tint = isNight ? 0.1 : 1;
  scene.traverse((child) => {
    if (child.isSprite) {
      // Preserve any per-instance tint applied at creation (e.g. tree variance)
      const baseTint = child.userData.baseTint ?? 1;
      child.material.color.setScalar(baseTint * tint);
    }
  });
  setContactShadowNight(isNight);
}
