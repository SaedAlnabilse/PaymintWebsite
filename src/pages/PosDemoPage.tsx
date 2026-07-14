import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wifi, Battery } from 'lucide-react';
import { FullPosPlayground } from '../components/FullPosPlayground';

/**
 * Public full-screen POS sandbox — styled inside a gorgeous iPad simulator.
 * Entry: /try-pos
 */
export function PosDemoPage() {
  return (
    <div className="flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#0A0E17] font-sans text-white select-none">
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

      {/* Web Header (Outside iPad simulator) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-slate-950/40 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft size={13} />
            <span>Website</span>
          </Link>
          <span className="hidden text-xs text-white/15 sm:inline">|</span>
          <span className="hidden text-xs font-medium text-slate-400 sm:inline">
            iPad Simulator
          </span>
        </div>
        
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mintcom-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mintcom-green" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-250">
            Interactive Demo
          </span>
        </div>
      </header>

      {/* Simulator workspace desk area */}
      <main className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6 md:p-8 overflow-hidden bg-radial-gradient">
        {/* Soft atmospheric ambient glow behind the iPad */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mintcom-green/5 opacity-40 blur-3xl pointer-events-none" />

        {/* Outer Frame Wrapper */}
        <div className="relative flex h-full w-full items-center justify-center max-w-[1140px] max-h-[800px]">
          
          {/* ── Desktop iPad Frame (md+ screen sizes) ── */}
          <div
            className="hidden md:block relative w-full h-full rounded-[38px] p-[2.5px] shadow-[0_28px_75px_-12px_rgba(0,0,0,0.85)]"
            style={{
              background:
                'linear-gradient(145deg, #6e6e73 0%, #3a3a3c 18%, #8e8e93 36%, #1c1c1e 55%, #5c5c60 78%, #2c2c2e 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 28px 75px -12px rgba(0,0,0,0.85)',
            }}
          >
            {/* Volume buttons (top left, landscape) */}
            <div
              className="absolute -left-[3.5px] top-[18%] z-45 h-[8%] w-[3.5px] rounded-l-[2px]"
              style={{
                background: 'linear-gradient(90deg, #5a5a5e, #2a2a2c)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            />
            <div
              className="absolute -left-[3.5px] top-[28%] z-45 h-[10%] w-[3.5px] rounded-l-[2px]"
              style={{
                background: 'linear-gradient(90deg, #5a5a5e, #2a2a2c)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            />
            {/* Power button (top right, landscape) */}
            <div
              className="absolute right-[12%] -top-[3.5px] z-45 w-[10%] h-[3.5px] rounded-t-[2px]"
              style={{
                background: 'linear-gradient(180deg, #5a5a5e, #2a2a2c)',
                boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.12)',
              }}
            />

            {/* Dark front glass bezel */}
            <div
              className="relative w-full h-full rounded-[35px] p-[20px] flex flex-col"
              style={{
                background:
                  'linear-gradient(180deg, #131315 0%, #08080a 50%, #0d0d0f 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              {/* Front Camera dot centered in the top bezel */}
              <div className="absolute inset-x-0 top-[7px] z-30 flex items-center justify-center pointer-events-none">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 32% 28%, #2a4a6e 0%, #0c1528 42%, #000 78%)',
                    boxShadow:
                      '0 0 0 1px rgba(255,255,255,0.08), inset 0 0 1.5px rgba(0,0,0,0.9)',
                  }}
                >
                  <div className="absolute left-[0.5px] top-[0.5px] h-[0.5px] w-[0.5px] rounded-full bg-white/40 animate-pulse" />
                </div>
              </div>

              {/* Display Glass viewport */}
              <div
                className="relative flex-1 overflow-hidden rounded-[15px] bg-[#0E131F]"
                style={{
                  transform: 'translate3d(0, 0, 0)', // CSS containment context for absolute/fixed layers
                  boxShadow:
                    'inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.35)',
                }}
              >
                {/* Simulated iPadOS Status Bar */}
                <div className="absolute inset-x-0 top-0 z-45 flex h-7 items-center justify-between bg-white/95 px-5 text-[10px] font-bold text-slate-800 dark:bg-[#1C1B22]/95 dark:text-white/80 select-none border-b border-slate-100 dark:border-white/5">
                  <div className="tabular-nums">9:41 AM</div>
                  <div className="flex items-center gap-1.5">
                    <Wifi size={10} strokeWidth={2.5} />
                    <span className="text-[9px] font-black tracking-wide text-slate-400 dark:text-white/40">iPadOS</span>
                    <Battery size={13} strokeWidth={2} />
                  </div>
                </div>

                {/* POS sandbox content area */}
                <div className="w-full h-full pt-7 pb-2.5">
                  <FullPosPlayground />
                </div>

                {/* iPad screen reflections layer */}
                <div
                  className="pointer-events-none absolute inset-0 z-40"
                  style={{
                    background:
                      'linear-gradient(125deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 20%, transparent 40%, transparent 80%, rgba(255,255,255,0.01) 100%)',
                  }}
                />

                {/* iPad Home Indicator Line at the bottom center */}
                <div className="absolute inset-x-0 bottom-1.5 z-45 flex justify-center pointer-events-none">
                  <div className="h-1 w-32 rounded-full bg-slate-400/40 dark:bg-white/20" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile/Small Screens View (No frame bezel to maximize tap targets) ── */}
          <div
            className="block md:hidden w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#0E131F]"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          >
            <FullPosPlayground />
          </div>
        </div>
      </main>
    </div>
  );
}
