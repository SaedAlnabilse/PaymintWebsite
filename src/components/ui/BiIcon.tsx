/**
 * Bootstrap Icons for dashboard KPI / stat cards.
 *
 * Only the prominent card icons use this set — navigation, table row actions,
 * filters, and chart controls stay on Lucide. The stylesheet is loaded once in
 * `main.tsx`, so nothing else needs to import it.
 */

interface BiIconProps {
  /** Bootstrap Icons class name, e.g. `bi-wallet2`. */
  icon: string;
  /** Glyph size in pixels. These are font icons, so this sets `font-size`. */
  size?: number;
  className?: string;
}

export function BiIcon({ icon, size = 24, className }: BiIconProps) {
  return (
    <i
      className={className ? `bi ${icon} ${className}` : `bi ${icon}`}
      style={{ fontSize: size, lineHeight: 1 }}
      aria-hidden="true"
    />
  );
}

/**
 * Builds a Lucide-shaped component so a Bootstrap icon can be dropped straight
 * into the existing stat-card arrays, which render `<stat.icon size={n} />`.
 */
export const biIcon = (icon: string) => {
  const Icon = (props: Omit<BiIconProps, 'icon'>) => <BiIcon icon={icon} {...props} />;
  Icon.displayName = `BiIcon(${icon})`;
  return Icon;
};
