/**
 * Payment icons matching mintcom-pos Sales OrderSummaryPanel:
 * Cash → MaterialIcons attach-money
 * Card → CardIcon (stacked cards + chip)
 * Other → ReceiptIcon
 * Split → SplitReceiptIcon
 * Use everywhere in try-POS for identical consistency.
 */

export function PosCashIcon({
  size = 28,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
    </svg>
  );
}

export function PosCardIcon({
  size = 28,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const h = size * 0.7;
  return (
    <svg
      width={size * 1.15}
      height={h * 1.15}
      viewBox="0 0 40 28"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="8"
        y="2"
        width="30"
        height="20"
        rx="3"
        fill="#e9eaea"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line x1="8" y1="8" x2="38" y2="8" stroke="currentColor" strokeWidth="2" />
      <rect
        x="2"
        y="6"
        width="30"
        height="20"
        rx="3"
        fill="#e9eaea"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="6"
        y="12"
        width="8"
        height="6"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="21" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="25" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function PosOtherReceiptIcon({
  size = 30,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 87 91" className={className} aria-hidden>
      <g transform="translate(0, 91) scale(0.1, -0.1)" fill="currentColor">
        <path d="M303 751c-28-9-67-29-86-44-32-24-36-25-40-9-2 10-8 0-16-26-7-24-15-50-18-59-4-10 7-7 35 11 23 14 47 26 54 27 7 0 4 4-6 8-17 7-16 9 12 29 51 37 111 53 185 51 69-2 92 5 67 21-25 16-131 11-187-9z" />
        <path d="M571 686c26-36 35-43 39-30 5 13 12 9 34-20 44-58 69-124 70-190 1-40 6-61 15-64 11-4 13 11 9 74-5 88-34 159-87 211-26 26-27 31-12 41 13 9 10 11-19 12-19 0-45 3-58 7-22 5-22 4 9-41z" />
        <path d="M325 623c-80-42-121-116-113-204 16-165 225-239 344-121 41 42 56 80 56 144 0 116-84 198-201 198-31-1-69-8-86-17zm186-37c39-26 79-96 79-137 0-79-61-158-137-178-105-28-213 57-213 167 0 77 34 130 105 164 51 24 115 17 166-16z" />
        <path d="M400 566c0-8-9-18-20-21-26-8-43-40-35-66 4-12 27-30 53-41 53-24 65-37 50-55-16-20-56-16-70 7-15 23-38 27-38 5 0-17 35-55 50-55 6 0 10-7 10-15 0-8 7-15 15-15 8 0 15 6 15 14 0 8 9 18 20 21 57 18 44 83-22 110-47 18-59 31-51 52 8 22 64 16 70-7 3-11 13-20 23-20 25 0 14 37-16 57-13 8-24 22-24 29 0 8-7 14-15 14-8 0-15-6-15-14z" />
        <path d="M99 544c-7-16-12-63-12-104-1-121 56-223 154-279 39-22 46-30 36-41-10-10-9-12 6-6 10 3 34 6 53 6 19 0 34 3 34 8-1 15-79 61-83 49-6-18-83 37-117 85-53 73-74 184-49 257 16 45-5 68-22 25z" />
        <path d="M671 306c-20-21-28-35-21-38 7-2-10-24-39-50-50-45-121-78-168-78-15 0-23-6-23-16 0-14 7-15 42-10 65 10 123 40 176 90 37 35 51 43 60 34 9-9 12 1 12 45 0 31-1 57-3 57-2 0-18-15-36-34z" />
      </g>
    </svg>
  );
}

export function PosSplitReceiptIcon({
  size = 16,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 84 98" className={className} aria-hidden>
      <g
        transform="translate(0, 98) scale(0.1, -0.1)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="50"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M111 743c-20-25-21-36-19-232 3-238-2-229 102-157 33 23 132 91 219 150l157 107 0 59c0 99-1 100-239 100l-200 0-20-27zm407-25c7-7 12-28 12-47 0-35-4-38-194-168-107-73-197-133-200-133-12 0-6 336 6 348 17 17 359 17 376 0z" />
        <path d="M187 614c-4-4-7-13-7-21 0-10 25-13 111-13 100 0 110 2 107 18-3 15-17 17-104 20-55 1-103 0-107-4z" />
        <path d="M183 504c-7-18 15-36 35-29 8 3 22 5 33 5 12 0 19 7 19 20 0 17-7 20-40 20-28 0-43-5-47-16z" />
        <path d="M404 464c-285-195-264-176-264-233 0-39 5-52 28-74 31-30 59-34 87-13 17 12 22 11 46-7l28-20 27 20 28 21 27-20 27-21 30 22c26 18 31 19 42 6 17-21 53-19 84 6l26 20 0 209c0 115-4 211-9 214-4 3-98-56-207-130zm160-281c-13-10-22-8-44 9l-28 21-28-22c-24-19-29-20-44-6-21 19-49 19-74 0-16-12-22-11-46 7l-28 21-29-22-28-22-18 22c-38 47-25 61 183 203l195 133 3-166c2-144 0-167-14-178z" />
        <path d="M501 460c-17-10-7-40 13-40 7 0 16 6 19 14 8 19-15 37-32 26z" />
        <path d="M374 355c-11-28 10-36 82-33 61 3 69 5 69 23 0 18-8 20-73 23-59 2-73 0-78-13z" />
      </g>
    </svg>
  );
}
