import { FeatureScreenshot, isStaticFeatureScreenshot } from './FeatureScreenshots';

type FeatureInteractiveDemoProps = {
  featureId?: string;
  t: (...args: any[]) => any;
  isRtl: boolean;
  tall?: boolean;
  side?: boolean;
  /** Fill a fixed-height parent (Why Mintcom style) instead of self-sizing by scale. */
  fill?: boolean;
};

/**
 * Compatibility wrapper for the feature modal preview.
 *
 * Feature previews now use the static real-product screenshots exclusively.
 * Keeping this small wrapper avoids coupling the modal to screenshot internals.
 */
export function FeatureInteractiveDemo({
  featureId,
  side,
  fill,
}: FeatureInteractiveDemoProps) {
  if (!isStaticFeatureScreenshot(featureId)) return null;

  return <FeatureScreenshot featureId={featureId} side={side} fill={fill} />;
}

/** True when the feature modal has a screenshot preview. */
export const hasInteractiveDemo = (featureId?: string) =>
  isStaticFeatureScreenshot(featureId);
