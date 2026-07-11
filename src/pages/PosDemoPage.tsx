import { Helmet } from 'react-helmet-async';
import { FullPosPlayground } from '../components/FullPosPlayground';

/**
 * Public full-screen POS sandbox — no auth.
 * Entry: /try-pos
 */
export function PosDemoPage() {
  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden">
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
      <FullPosPlayground />
    </div>
  );
}
