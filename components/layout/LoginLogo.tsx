export default function LoginLogo({
  width = 180,
  height = 180,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="primaryGradient" x1="40" y1="30" x2="200" y2="210">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="glassGradient" x1="60" y1="60" x2="180" y2="180">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.9" />
        </linearGradient>

        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="18"
            floodColor="#0F172A"
            floodOpacity="0.28"
          />
        </filter>
      </defs>

      <rect
        x="30"
        y="30"
        width="180"
        height="180"
        rx="48"
        fill="url(#primaryGradient)"
        filter="url(#softShadow)"
      />

      <rect
        x="38"
        y="38"
        width="164"
        height="164"
        rx="40"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2"
      />

      <path
        d="M52 108H92"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <path
        d="M44 128H82"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <g transform="translate(62 78)">
        <rect
          x="0"
          y="24"
          width="84"
          height="48"
          rx="14"
          fill="url(#glassGradient)"
        />

        <rect
          x="16"
          y="36"
          width="42"
          height="24"
          rx="6"
          fill="#2563EB"
        />

        <path
          d="M84 38H104L118 54V72H84V38Z"
          fill="url(#glassGradient)"
        />

        <path
          d="M92 46H102L110 56H92V46Z"
          fill="#93C5FD"
        />

        <circle cx="28" cy="82" r="12" fill="#020617" />
        <circle cx="28" cy="82" r="5" fill="#CBD5E1" />

        <circle cx="90" cy="82" r="12" fill="#020617" />
        <circle cx="90" cy="82" r="5" fill="#CBD5E1" />

        <path
          d="M38 12L58 12L58 4L76 18L58 32V24H38V12Z"
          fill="#38BDF8"
        />
      </g>

      <ellipse
        cx="88"
        cy="72"
        rx="42"
        ry="20"
        fill="rgba(255,255,255,0.10)"
      />
    </svg>
  );
}
