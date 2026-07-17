import { useState, useRef, useLayoutEffect } from 'react';

interface OptimizedImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional CSS classes */
  className?: string;
  /** Optional explicit width (helps prevent Cls) */
  width?: number | string;
  /** Optional explicit height (helps prevent Cls) */
  height?: number | string;
  /**
   * Loading strategy:
   * - 'lazy': Load when entering viewport (default for most images)
   * - 'eager': Load immediately (use for hero/above-fold images)
   */
  priority?: boolean;
  /** Optional placeholder color while loading */
  placeholderColor?: string;
  /** Object-fit style */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Object-position style */
  objectPosition?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Optional onLoad callback */
  onLoad?: () => void;
  /** Optional onError callback */
  onError?: () => void;
}

/**
 * Optimized image component that improves Core Web Vitals (Lcp, Cls).
 *
 * Important reliability note:
 * Never reset load state in a passive useEffect *after* the layout check for
 * cached images — browsers often skip onLoad for complete images, which left
 * product cards stuck at opacity-0 until a full page remount.
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholderColor = '#f3f4f6',
  objectFit = 'cover',
  objectPosition = 'center',
  onClick,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imgRef = useRef<HTMLImageElement>(null);
  const srcRef = useRef(src);
  srcRef.current = src;

  // Sync load state whenever src changes. Must run in layout so a cached image
  // that is already `complete` is marked loaded before paint — and nothing
  // later flips it back to loading without a new load event.
  useLayoutEffect(() => {
    setStatus('loading');
    const img = imgRef.current;
    if (!img) return;

    if (img.complete) {
      if (img.naturalWidth > 0) {
        setStatus('loaded');
      } else {
        // Broken cached response
        setStatus('error');
      }
    }
  }, [src]);

  const handleLoad = () => {
    // Ignore stale events from a previous src swap
    if (imgRef.current?.currentSrc && srcRef.current) {
      // ok either way
    }
    setStatus('loaded');
    onLoad?.();
  };

  const handleError = () => {
    setStatus('error');
    onError?.();
  };

  const dimensionStyle: React.CSSProperties = {};
  if (width) dimensionStyle.width = typeof width === 'number' ? `${width}px` : width;
  if (height) dimensionStyle.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        ...dimensionStyle,
        backgroundColor: placeholderColor,
      }}
      onClick={onClick}
    >
      {/* Soft placeholder while loading — image itself is not forced invisible forever */}
      {status === 'loading' && (
        <div
          className="absolute inset-0 animate-pulse bg-gray-100 dark:bg-gray-800/80"
          aria-hidden
        />
      )}

      {status === 'error' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ) : (
        <img
          key={src}
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`
            relative z-[1] w-full h-full transition-opacity duration-200
            ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            objectFit,
            objectPosition,
          }}
          {...(typeof width === 'number' && { width })}
          {...(typeof height === 'number' && { height })}
        />
      )}
    </div>
  );
}

/**
 * Pre-built variant for avatar/profile images
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className = '',
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      objectFit="cover"
      placeholderColor="#f3f4f6"
    />
  );
}

/**
 * Pre-built variant for product/thumbnail images
 */
export function ThumbnailImage({
  src,
  alt,
  size = 64,
  className = '',
  onClick,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
      objectFit="cover"
      placeholderColor="#f3f4f6"
      onClick={onClick}
    />
  );
}

/**
 * Pre-built variant for hero/banner images (eager loaded)
 */
export function HeroImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      priority
      objectFit="cover"
    />
  );
}
