import React from 'react';
import { strokeToSvgPath } from '../lib/rdp';
import type { PotatoPathData, Stroke } from '../lib/types';

export interface PotatoFeatureMeta {
  dimples?: Array<[number, number]>;
  sprout?: boolean;
  blush?: boolean;
  sweat?: boolean;
  eyebags?: boolean;
  sharpPolygon?: boolean;
}

interface PotatoSvgProps {
  pathData: PotatoPathData;
  className?: string;
  strokeColor?: string;
  fillTint?: string;
  strokeWidth?: number;
  sharpCorners?: boolean;
  features?: PotatoFeatureMeta;
}

function strokeToSharpPath(stroke: Stroke): string {
  if (!stroke || stroke.length === 0) return '';
  if (stroke.length === 1) return `M ${stroke[0][0]} ${stroke[0][1]} L ${stroke[0][0] + 0.1} ${stroke[0][1] + 0.1}`;
  return `M ${stroke[0][0]} ${stroke[0][1]} ` + stroke.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ');
}

/**
 * Infinite-resolution vector renderer for normalized 0..100 potato strokes.
 * Supports sharp geometric polygons (for the Official Decoy Rock) and expressive potato accents.
 */
export const PotatoSvg: React.FC<PotatoSvgProps> = ({
  pathData,
  className = 'w-full h-full',
  strokeColor = '#18181B',
  fillTint = '#F6DFC0',
  strokeWidth = 5.5,
  sharpCorners = false,
  features,
}) => {
  const strokes = pathData?.strokes ?? [];
  const isSharp = sharpCorners || Boolean(features?.sharpPolygon);

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Optional sprout on top of potato */}
      {features?.sprout && (
        <g>
          <path
            d="M50 22 C50 13, 58 8, 65 10 C61 16, 56 19, 50 22 Z"
            fill="#22C55E"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M50 22 C47 14, 40 11, 35 14 C39 18, 44 20, 50 22 Z"
            fill="#4ADE80"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Stroke 0: Silhouette fill + outline */}
      {strokes[0] && (
        <path
          d={isSharp ? strokeToSharpPath(strokes[0]) : strokeToSvgPath(strokes[0])}
          fill={fillTint}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap={isSharp ? 'square' : 'round'}
          strokeLinejoin={isSharp ? 'miter' : 'round'}
        />
      )}

      {/* Subtle organic potato freckles/dimples */}
      {features?.dimples?.map(([cx, cy], idx) => (
        <circle key={idx} cx={cx} cy={cy} r="2.1" fill="#C49A6C" opacity="0.75" />
      ))}

      {/* Optional rosy blush */}
      {features?.blush && (
        <>
          <ellipse cx="32" cy="54" rx="5" ry="2.8" fill="#FB7185" opacity="0.45" />
          <ellipse cx="68" cy="54" rx="5" ry="2.8" fill="#FB7185" opacity="0.45" />
        </>
      )}

      {/* Optional exhausted eye bags */}
      {features?.eyebags && (
        <>
          <path d="M33 52 Q38 56 44 52" stroke="#9CA3AF" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M56 52 Q62 56 67 52" stroke="#9CA3AF" strokeWidth="2.8" strokeLinecap="round" />
        </>
      )}

      {/* Optional panic sweat drop */}
      {features?.sweat && (
        <path
          d="M73 25 C73 25, 79 33, 79 37 A6 6 0 0 1 67 37 C67 33, 73 25, 73 25 Z"
          fill="#60A5FA"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}

      {/* Strokes 1..N: Facial expressions & details */}
      {strokes.slice(1).map((stroke, idx) => {
        const d = isSharp ? strokeToSharpPath(stroke) : strokeToSvgPath(stroke);
        if (!d) return null;
        return (
          <path
            key={idx + 1}
            d={d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth * 0.92}
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
          fill="#22C55E"
          stroke="#18181B"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      )}
      <path
        d="M24 52 C22 30, 38 18, 56 20 C75 22, 84 37, 81 58 C78 76, 61 84, 42 82 C26 80, 25 66, 24 52 Z"
        fill="#E9C89B"
        stroke="#18181B"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="68" r="2.2" fill="#B88B58" />
      <circle cx="68" cy="64" r="2" fill="#B88B58" />
      <circle cx="64" cy="31" r="1.8" fill="#B88B58" />
      {blinking ? (
        <>
          <path d="M38 47 H46" stroke="#18181B" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M56 47 H64" stroke="#18181B" strokeWidth="4.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="42" cy="46" r="3.5" fill="#18181B" />
          <circle cx="60" cy="46" r="3.5" fill="#18181B" />
        </>
      )}
      <path d="M47 56 H55" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
};
