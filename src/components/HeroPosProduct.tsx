/**
 * Hero product visual: mintcom-pos-hero hardware photo with the try-pos
 * sales screen fitted into the tablet glass (static picture-in-glass).
 */
import { useTranslation } from 'react-i18next';
import { FeaturePosScreenshot } from './FeaturePosScreenshot';

/**
 * Screen glass bounds as % of mintcom-pos-hero.png (2048×2048).
 * Tuned to the physical display opening (inside the black bezel).
 */
const GLASS = {
  left: '19.6%',
  top: '12.2%',
  width: '66.4%',
  height: '39.0%',
  radius: '1.15% / 1.9%',
} as const;

export function HeroPosProduct() {
  const { t } = useTranslation();

  return (
    <div
      className="relative mx-auto w-full select-none"
      role="img"
      aria-label={t('landing.hero.alt', 'Mintcom All-in-One POS System')}
    >
      {/* Hardware photo */}
      <img
        src="/mintcom-pos-hero.png"
        alt=""
        className="pointer-events-none relative z-0 h-auto w-full drop-shadow-2xl"
        width={2048}
        height={2048}
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />

      {/* Try-pos sales screen — flat fit inside the tablet glass only */}
      <div
        className="pointer-events-none absolute z-10 overflow-hidden"
        style={{
          left: GLASS.left,
          top: GLASS.top,
          width: GLASS.width,
          height: GLASS.height,
          borderRadius: GLASS.radius,
          // Match the slight tablet angle in the photo (very subtle)
          transform: 'perspective(2200px) rotateX(1.2deg) rotateY(-1.8deg)',
          transformOrigin: '50% 50%',
        }}
      >
        <div className="h-full w-full bg-[#f6f3ec]">
          <FeaturePosScreenshot fill forceLight />
        </div>
        {/* Soft glass sheen only — no labels / no hover */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(125deg, rgba(255,255,255,0.14) 0%, transparent 28%, transparent 72%, rgba(0,0,0,0.04) 100%)',
          }}
        />
      </div>
    </div>
  );
}

export default HeroPosProduct;
