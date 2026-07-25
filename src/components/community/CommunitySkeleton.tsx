/**
 * Soft loading skeleton — cream-friendly, not gray bricks.
 */
export function CommunitySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-16 rounded-xl bg-black/[0.05]" />
        <div className="h-8 w-48 rounded-xl bg-black/[0.06]" />
        <div className="h-4 w-72 max-w-full rounded-xl bg-black/[0.04]" />
        <div className="h-11 w-full max-w-lg rounded-xl bg-black/[0.04]" />
      </div>
      <div className="flex gap-2 mb-8 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 w-36 shrink-0 rounded-xl bg-black/[0.04]" />
        ))}
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[76px] rounded-xl bg-white border border-black/[0.04]" />
        ))}
      </div>
    </div>
  );
}
