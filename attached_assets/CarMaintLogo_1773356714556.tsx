/**
 * CarMaintLogo — مكوّن اللوجو الجاهز للدمج
 *
 * الاستخدام / Usage:
 *   <CarMaintLogo />                            // افتراضي — متوسط، متحرك، داكن
 *   <CarMaintLogo theme="light" />              // ألوان فاتحة
 *   <CarMaintLogo size="sm" animated={false} /> // صغير بدون أنيميشن
 *   <CarMaintLogo size="lg" animated />         // كبير مع أنيميشن — مناسب للفوتر
 *
 * متطلبات / Requirements:
 *   - Tailwind CSS (اختياري — الألوان والأنيميشن مدمجة في style tag)
 *   - Google Fonts: Cairo + Montserrat (أضفها في <head> أو globals.css)
 *     @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&family=Montserrat:wght@600;700&display=swap');
 */

import React from "react";

/* ─── Types ─── */
type LogoTheme = "light" | "dark";
type LogoSize  = "sm" | "md" | "lg";

interface CarMaintLogoProps {
  /** ثيم اللوجو: light = ألوان فاتحة، dark = ألوان داكنة */
  theme?:    LogoTheme;
  /** حجم اللوجو: sm صغير، md متوسط (افتراضي)، lg كبير */
  size?:     LogoSize;
  /** تفعيل الأنيميشن (دوران الترساس + تأرجح المفتاح) */
  animated?: boolean;
  /** className إضافي */
  className?: string;
  /** style إضافي */
  style?: React.CSSProperties;
}

/* ─── Token maps ─── */
const ICON_SIZES:   Record<LogoSize, number> = { sm: 32, md: 40, lg: 52 };
const ARABIC_SIZES: Record<LogoSize, string> = { sm: "15px", md: "19px", lg: "24px" };
const ENG_SIZES:    Record<LogoSize, string> = { sm: "11px", md: "13px", lg: "15px" };

/* ─── Keyframes injected once ─── */
const STYLE_ID = "carmaint-logo-styles";

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes cml-wrench {
      0%,100% { transform: rotate(0deg);   }
      15%      { transform: rotate(-14deg); }
      30%      { transform: rotate(0deg);   }
    }
    @keyframes cml-gear {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }
    .cml-animated-wrench {
      animation: cml-wrench 4s ease-in-out infinite;
      transform-origin: center;
    }
    .cml-animated-gear {
      animation: cml-gear 3s linear infinite;
    }
    .cml-logo-root {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      cursor: pointer;
      direction: rtl;
    }
    .cml-logo-root:hover svg {
      filter: drop-shadow(0 0 8px rgba(56,189,248,0.45));
      transition: filter 0.3s ease;
    }
    .cml-text-arabic {
      font-family: 'Cairo', sans-serif;
      font-weight: 900;
      line-height: 1.15;
    }
    .cml-text-eng {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      letter-spacing: 0.07em;
      color: #f97316;
    }
  `;
  document.head.appendChild(el);
}

/* ─── Component ─── */
export function CarMaintLogo({
  theme    = "dark",
  size     = "md",
  animated = true,
  className = "",
  style,
}: CarMaintLogoProps) {
  React.useEffect(() => { injectStyles(); }, []);

  const iconSize    = ICON_SIZES[size];
  const arabicSize  = ARABIC_SIZES[size];
  const engSize     = ENG_SIZES[size];

  /* colour tokens */
  const circleFill   = theme === "dark" ? "#0f172a" : "#f0f9ff";
  const circleStroke = theme === "dark" ? "#38bdf8" : "#0ea5e9";
  const wrenchFill   = theme === "dark" ? "#38bdf8" : "#0284c7";
  const wrenchStroke = theme === "dark" ? "#7dd3fc" : "#0369a1";
  const arabicColor  = theme === "dark" ? "#f1f5f9" : "#0f172a";

  return (
    <div className={`cml-logo-root ${className}`} style={style}>
      {/* ── Icon ── */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? "cml-animated-wrench" : ""}
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="36" cy="36" r="34" fill={circleFill} stroke={circleStroke} strokeWidth="2.5" />

        {/* Wrench */}
        <path
          d="M47.5 19.5C44.2 16.2 39.5 15 35.2 16.5L40.5 21.8L38 27.5L32.3 30L27 24.7
             C25.5 29 26.7 33.7 30 37C33.3 40.3 37.9 41.5 42.2 40.2L52.8 50.8
             C54.1 52.1 56.2 52.1 57.5 50.8C58.8 49.5 58.8 47.4 57.5 46.1L46.9 35.5
             C48.2 31.2 47 26.6 43.7 23.3L47.5 19.5Z"
          fill={wrenchFill}
          stroke={wrenchStroke}
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Spinning gear */}
        <g
          className={animated ? "cml-animated-gear" : ""}
          style={{ transformOrigin: "22px 50px" }}
        >
          <circle cx="22" cy="50" r="5" fill="none" stroke="#f97316" strokeWidth="2" />
          <circle cx="22" cy="50" r="2"  fill="#f97316" />
          {/* Gear teeth */}
          <rect x="21" y="43.5" width="2" height="3" rx="1" fill="#f97316" />
          <rect x="21" y="53.5" width="2" height="3" rx="1" fill="#f97316" />
          <rect x="15"  y="49"  width="3" height="2" rx="1" fill="#f97316" />
          <rect x="26"  y="49"  width="3" height="2" rx="1" fill="#f97316" />
        </g>
      </svg>

      {/* ── Text ── */}
      <div>
        <div
          className="cml-text-arabic"
          style={{ fontSize: arabicSize, color: arabicColor }}
        >
          صيانة سيارتي
        </div>
        <div
          className="cml-text-eng"
          style={{ fontSize: engSize }}
        >
          CarMaint Pro
        </div>
      </div>
    </div>
  );
}

export default CarMaintLogo;
