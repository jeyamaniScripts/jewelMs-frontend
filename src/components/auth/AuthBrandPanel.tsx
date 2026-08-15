const FEATURES = [
  "Real-time inventory tracking",
  "Customer & order management",
  "Role-based staff access",
  "Daily sales reports",
];

/**
 * Right-hand brand panel shown on lg+ screens. Always renders on the
 * dark brand background regardless of the site-wide light/dark theme —
 * it's a fixed brand surface, not a themed content area.
 */
export default function AuthBrandPanel() {
  return (
    <aside
      className="relative hidden min-h-screen w-1/2 flex-col items-center justify-center
        overflow-hidden lg:flex"
      style={{ background: "var(--color-primary-dark)" }}
    >
      {/* Decorative blurred circles — abstract brand element */}
      <div
        className="absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-10 blur-sm"
        style={{ background: "var(--color-primary)" }}
      />
      <div
        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-10 blur-sm"
        style={{ background: "var(--color-primary)" }}
      />
      <div
        className="absolute top-1/4 right-8 h-32 w-32 rounded-full opacity-5"
        style={{ background: "var(--color-primary)" }}
      />

      {/* Illustration — single-line kite/gem outline, matching the reference */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-10 text-center">
        <svg
          viewBox="0 0 220 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-48 w-48 xl:h-56 xl:w-56"
          aria-hidden="true"
        >
          {/* Outer kite/gem outline */}
          <polygon
            points="110,18 172,92 110,202 48,92"
            stroke="#088395"
            strokeWidth="2.5"
            strokeLinejoin="round"
            opacity="0.95"
          />
          {/* Facet lines */}
          <line x1="110" y1="18" x2="110" y2="202" stroke="#088395" strokeWidth="1" opacity="0.45" />
          <line x1="48" y1="92" x2="172" y2="92" stroke="#088395" strokeWidth="1" opacity="0.45" />
          {/* Subtle top facet fill for depth */}
          <polygon points="110,18 172,92 110,92" fill="#088395" opacity="0.12" />
          <polygon points="110,18 48,92 110,92" fill="#088395" opacity="0.06" />

          {/* Sparkle dots */}
          <circle cx="34" cy="52" r="3" fill="#088395" opacity="0.8" />
          <circle cx="188" cy="64" r="2" fill="#088395" opacity="0.5" />
          <circle cx="178" cy="168" r="3" fill="#088395" opacity="0.65" />
          <circle cx="30" cy="158" r="2" fill="#088395" opacity="0.4" />
          <circle cx="110" cy="6" r="3.5" fill="#088395" opacity="0.85" />

          {/* Faint orbit rings */}
          <circle cx="110" cy="110" r="96" stroke="#09637E" strokeWidth="0.5" opacity="0.18" />
          <circle cx="110" cy="110" r="74" stroke="#09637E" strokeWidth="0.5" opacity="0.12" />
        </svg>

        {/* Tagline */}
        <div>
          <h2 className="mb-3 text-2xl font-semibold leading-snug text-white">
            Manage Your Jewelry Business
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#7AB2B2" }}>
            Inventory, sales, customers — everything in one elegant platform.
          </p>
        </div>

        {/* Feature bullets */}
        <ul className="flex w-full flex-col gap-3 text-left">
          {FEATURES.map((featureText) => (
            <li
              key={featureText}
              className="flex items-center gap-3 text-sm"
              style={{ color: "#7AB2B2" }}
            >
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full
                  text-xs font-bold text-white"
                style={{ background: "var(--color-primary)" }}
              >
                ✓
              </span>
              {featureText}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
