import React from 'react';
import { strokeToSvgPath } from '../lib/rdp';
import type { PotatoPathData } from '../lib/types';

interface PotatoSvgProps {
  pathData: PotatoPathData;
  className?: string;
  strokeColor?: string;
  fillTint?: string;
  strokeWidth?: number;
}

/**
 * Infinite-resolution vector renderer for normalized 0..100 potato strokes.
 * Zero image requests, pure SVG quadratic Bézier smoothing.
 */
export const PotatoSvg: React.FC<PotatoSvgProps> = ({
  pathData,
  className = 'w-full h-full',
  strokeColor = '#1C1917',
  fillTint = '#F2DEC1',
  strokeWidth = 6,
}) => {
  const strokes = pathData?.strokes ?? [];

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {strokes.map((stroke, idx) => {
        const d = strokeToSvgPath(stroke);
        if (!d) return null;
        return (
          <path
            key={idx}
            d={d}
            fill={idx === 0 ? fillTint : 'none'}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
};

/**
 * Official Control-Group Potato (Poteto #01 from Hokkaido)
 */
export const OfficialPotatoMascot: React.FC<{
  className?: string;
  blinking?: boolean;
  sprout?: boolean;
}> = ({ className = 'w-10 h-10', blinking = false, sprout = false }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Poteto #01 对照组土豆"
    >
      {sprout && (
        <path
          d="M52 22 C52 12, 60 8, 66 10 C62 15, 58 18, 52 22 Z"
          fill="#15803D"
          stroke="#1C1917"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      )}
      <path
        d="M24 52 C22 30, 38 18, 56 20 C75 22, 84 37, 81 58 C78 76, 61 84, 42 82 C26 80, 25 66, 24 52 Z"
        fill="#E9C89B"
        stroke="#1C1917"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Subtle potato dimples */}
      <circle cx="34" cy="68" r="2.2" fill="#B88B58" />
      <circle cx="68" cy="64" r="2" fill="#B88B58" />
      <circle cx="64" cy="31" r="1.8" fill="#B88B58" />
      {/* Deadpan eyes */}
      {blinking ? (
        <>
          <path d="M38 47 H46" stroke="#1C1917" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M56 47 H64" stroke="#1C1917" strokeWidth="4.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="42" cy="46" r="3.5" fill="#1C1917" />
          <circle cx="60" cy="46" r="3.5" fill="#1C1917" />
        </>
      )}
      {/* Flat stoic mouth */}
      <path d="M47 56 H55" stroke="#1C1917" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
};
