import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wifi, Battery } from 'lucide-react';
import { FullPosPlayground } from '../components/FullPosPlayground';

/**
 * Try POS — static iPad UI.
 *
 * The POS app always renders at a fixed design size (same cards, same layout).
 * We only scale that canvas to fit the glass. If the window is tiny, the stage
 * can scroll — cards never reflow or squash.
 *
 * Entry: /try-pos
 */

/** Fixed POS “screen” — landscape tablet. Layouts assume this size. */
const DESIGN_W = 1100;
const DESIGN_H = 720;

/** Outer iPad shell aspect (slightly wider than content). */
const FRAME_ASPECT = 1.4;
const MAX_FRAME_W = 1280;
const MAX_FRAME_H = Math.round(MAX_FRAME_W / FRAME_ASPECT);

const STATUS_H = 28;
const HOME_PAD = 10;

function fitFrame(availW: number, availH: number) {
  const w = Math.min(availW, availH * FRAME_ASPECT, MAX_FRAME_W);
  const h = Math.min(availH, availW / FRAME_ASPECT, MAX_FRAME_H);
  const finalW = Math.min(w, h * FRAME_ASPECT);
  return { w: finalW, h: finalW / FRAME_ASPECT };
}

function estimateFrameSize() {
  if (typeof window === 'undefined') return { w: 1000, h: 1000 / FRAME_ASPECT };
  const padX = window.innerWidth >= 1024 ? 64 : window.innerWidth >= 640 ? 32 : 16;
  const padY = window.innerWidth >= 1024 ? 40 : window.innerWidth >= 640 ? 24 : 16;
  const header = window.innerWidth >= 640 ? 56 : 48;
  return fitFrame(
    Math.max(280, window.innerWidth - padX),
    Math.max(200, window.innerHeight - header - padY),
  );
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 2 || h < 2) return;
      setSize((prev) =>
        Math.abs(prev.w - w) < 0.5 && Math.abs(prev.h - h) < 0.5 ? prev : { w, h },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

function useFrameSize() {
  const stageRef = useRef<HTMLElement | null>(null);
  const [size, setSize] = useState(estimateFrameSize);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const next = fitFrame(el.clientWidth, el.clientHeight);
      if (next.w < 2 || next.h < 2) return;
      setSize((prev) =>
        Math.abs(prev.w - next.w) < 0.5 && Math.abs(prev.h - next.h) < 0.5 ? prev : next,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('orientationchange', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  return { stageRef, size };
}

/**
 * Renders children at DESIGN_W × DESIGN_H, then scales uniformly to fit.
 * Layout stays static — only the zoom level changes.
 */
function StaticPosCanvas({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const scale =
    size.w > 0 && size.h > 0
      ? Math.min(size.w / DESIGN_W, size.h / DESIGN_H)
      : 1;
  // Never blow up past 100% on huge glass; allow shrink freely
  const s = Math.min(scale, 1);

  return (
    <div
      ref={ref}
      className={`relative h-full w-full overflow-auto overscroll-contain ${className}`}
      style={{
        // Subtle scroll affordance when the scaled canvas is larger than the box
        // (very small phones) — otherwise centered & fully visible.
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        className="relative mx-auto"
        style={{
          width: DESIGN_W * s,
          height: DESIGN_H * s,
          // Center when we have spare room
          marginTop: size.h > DESIGN_H * s ? (size.h - DESIGN_H * s) / 2 : 0,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${s})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function bezelPx(deviceW: number) {
  return Math.round(Math.min(22, Math.max(10, deviceW * 0.018)));
}

function radiusPx(deviceW: number, outer: boolean) {
  const base = deviceW * (outer ? 0.034 : 0.028);
  return Math.round(Math.min(outer ? 42 : 36, Math.max(outer ? 18 : 14, base)));
}

export function PosDemoPage() {
  const { stageRef, size } = useFrameSize();
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsCompact(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const bezel = bezelPx(size.w);
  const outerR = radiusPx(size.w, true);
  const innerR = radiusPx(size.w, false);
  const glassR = Math.max(10, Math.round(innerR * 0.45));

  const pos = (
    <div className="h-full w-full">
      <FullPosPlayground />
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#070A10] font-sans text-white select-none">
      <Helmet>
        <title>Try Mintcom POS · Free interactive demo</title>
        <meta
          name="description"
          content="Try a full Mintcom POS experience free — clock in, sell items, customize add-ons, hold orders, and take payment. No account required."
        />
        <meta property="og:title" content="Try Mintcom POS · Free interactive demo" />
        <meta
          property="og:description"
          content="Run a real sale in the Mintcom sandbox. No login required."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <header className="relative z-20 flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0A0E17]/90 px-3 backdrop-blur-md sm:h-14 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-[0.98] sm:gap-2 sm:px-3 sm:text-xs"
          >
            <ArrowLeft size={13} />
            <span>Website</span>
          </Link>
          <span className="hidden text-xs text-white/15 sm:inline">|</span>
          <span className="hidden truncate text-xs font-medium text-slate-400 sm:inline">
            iPad Simulator
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 sm:text-xs">
            Interactive Demo
          </span>
        </div>
      </header>

      <main
        ref={stageRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 lg:px-8 lg:py-5"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(125,198,162,0.07) 0%, transparent 58%), radial-gradient(ellipse 90% 80% at 50% 100%, rgba(0,0,0,0.55) 0%, transparent 55%), #070A10',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mintcom-green/[0.06] blur-3xl"
          style={{ width: size.w * 0.75, height: size.h * 0.7 }}
        />

        {isCompact ? (
          /* Phone: same static canvas, scroll if needed */
          <div
            className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-cream-50 shadow-2xl dark:bg-mintcom-dark"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          >
            <StaticPosCanvas>{pos}</StaticPosCanvas>
          </div>
        ) : (
          <div
            className="relative transition-[width,height] duration-150 ease-out"
            style={{ width: size.w, height: size.h }}
          >
            <div
              className="absolute inset-0"
              style={{
                borderRadius: outerR,
                padding: 2.5,
                background:
                  'linear-gradient(145deg, #7a7a80 0%, #3a3a3c 18%, #9a9a9f 34%, #1c1c1e 52%, #5c5c60 76%, #2c2c2e 100%)',
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.28),
                  inset 0 -1px 0 rgba(0,0,0,0.45),
                  0 2px 4px rgba(0,0,0,0.25),
                  0 28px 70px -10px rgba(0,0,0,0.75),
                  0 50px 100px -30px rgba(0,0,0,0.55)
                `,
              }}
            >
              <div
                aria-hidden
                className="absolute z-20"
                style={{
                  left: -3.5,
                  top: '17%',
                  width: 3.5,
                  height: '7.5%',
                  borderRadius: '2px 0 0 2px',
                  background: 'linear-gradient(90deg, #5a5a5e, #2a2a2c)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
                }}
              />
              <div
                aria-hidden
                className="absolute z-20"
                style={{
                  left: -3.5,
                  top: '27%',
                  width: 3.5,
                  height: '9.5%',
                  borderRadius: '2px 0 0 2px',
                  background: 'linear-gradient(90deg, #5a5a5e, #2a2a2c)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
                }}
              />
              <div
                aria-hidden
                className="absolute z-20"
                style={{
                  right: '11%',
                  top: -3.5,
                  width: '9%',
                  height: 3.5,
                  borderRadius: '2px 2px 0 0',
                  background: 'linear-gradient(180deg, #5a5a5e, #2a2a2c)',
                  boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.12)',
                }}
              />

              <div
                className="relative flex h-full w-full flex-col"
                style={{
                  borderRadius: innerR,
                  padding: bezel,
                  background:
                    'linear-gradient(180deg, #161618 0%, #08080a 48%, #0c0c0e 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 z-30 flex items-center justify-center"
                  style={{ top: Math.max(5, bezel * 0.32) }}
                >
                  <div
                    className="relative rounded-full"
                    style={{
                      width: Math.max(5, Math.min(8, bezel * 0.35)),
                      height: Math.max(5, Math.min(8, bezel * 0.35)),
                      background:
                        'radial-gradient(circle at 32% 28%, #2a4a6e 0%, #0c1528 42%, #000 78%)',
                      boxShadow:
                        '0 0 0 1px rgba(255,255,255,0.08), inset 0 0 1.5px rgba(0,0,0,0.9)',
                    }}
                  >
                    <div className="absolute left-[15%] top-[15%] h-[30%] w-[30%] rounded-full bg-white/40" />
                  </div>
                </div>

                <div
                  className="relative min-h-0 flex-1 overflow-hidden bg-cream-50 dark:bg-mintcom-dark"
                  style={{
                    borderRadius: glassR,
                    transform: 'translate3d(0, 0, 0)',
                    boxShadow:
                      'inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Status bar (outside scaled app — always crisp) */}
                  <div
                    className="absolute inset-x-0 top-0 z-40 flex items-center justify-between border-b border-slate-100/80 bg-white/95 px-4 text-[10px] font-bold text-slate-800 select-none dark:border-white/5 dark:bg-[#1C1B22]/95 dark:text-white/80"
                    style={{ height: STATUS_H }}
                  >
                    <div className="tabular-nums tracking-tight">9:41 AM</div>
                    <div className="flex items-center gap-1.5">
                      <Wifi size={10} strokeWidth={2.5} />
                      <span className="text-[9px] font-black tracking-wide text-slate-400 dark:text-white/40">
                        iPadOS
                      </span>
                      <Battery size={13} strokeWidth={2} />
                    </div>
                  </div>

                  {/* Static scaled POS under status bar */}
                  <div
                    className="absolute inset-x-0 bottom-0"
                    style={{ top: STATUS_H, paddingBottom: HOME_PAD }}
                  >
                    <StaticPosCanvas>{pos}</StaticPosCanvas>
                  </div>

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-30"
                    style={{
                      background:
                        'linear-gradient(125deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 18%, transparent 38%, transparent 78%, rgba(255,255,255,0.012) 100%)',
                    }}
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-1.5 z-40 flex justify-center"
                  >
                    <div className="h-1 w-28 rounded-full bg-slate-400/45 dark:bg-white/25 sm:w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
