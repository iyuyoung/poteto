import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Pencil, RotateCcw, Undo2 } from 'lucide-react';
import {
  estimateJsonBytes,
  normalizeStroke,
  strokeToSvgPath,
  validatePotatoDrawing,
} from '../lib/rdp';
import { playPop, playStamp, playTick } from '../lib/sfx';
import type { PotatoPathData, Stage3Prompt, StageResult, Stroke } from '../lib/types';

interface Stage3DrawCanvasProps {
  prompt: Stage3Prompt;
  clientId: string;
  auditDate: string;
  mode: 'daily' | 'endless';
  onComplete: (result: StageResult, drawing: PotatoPathData) => void;
}

const MAX_STROKES = 4;
const TIME_LIMIT_SEC = 10;

const SCAN_LINES = [
  'Scanning starch density...',
  'Cross-checking Idaho Potato Commission...',
  'Calculating your tuber DNA overlap...',
];

function getLiveRoast(strokes: Stroke[], aspectRatio?: number, valid?: boolean): string {
  if (strokes.length === 0) return '10s timer starts on first stroke. Spud #01 is judging silently.';
  if (!valid) return 'Close the loop on Stroke 1 or your starch is gonna leak out!';
  if (strokes.length === 1) {
    if (aspectRatio && aspectRatio > 1.35) return 'Built like a pancake. Slap some eyes on it!';
    if (aspectRatio && aspectRatio < 0.78) return 'Long boi energy. Give it a face!';
    return 'Suspiciously round, like a bowling ball. Add eyes!';
  }
  if (strokes.length === 2) return 'One eye? Bold choice going full cyclops pirate spud.';
  if (strokes.length === 3) return 'That expression is already judging me back. 1 stroke left!';
  return '4 strokes of pure Louvre-worthy chaos.';
}

export const Stage3DrawCanvas: React.FC<Stage3DrawCanvasProps> = ({
  prompt,
  clientId,
  auditDate,
  mode,
  onComplete,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rawPointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke>([]);
  const [drawingNow, setDrawingNow] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT_SEC);
  const [timerStarted, setTimerStarted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (!timerStarted || timeLeft <= 0 || scanning) return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          window.clearInterval(id);
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [timerStarted, timeLeft <= 0, scanning]);

  const getLocalCoords = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0, w: 100, h: 100 };
    return {
      x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, e.clientY - rect.top)),
      w: rect.width,
      h: rect.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (strokes.length >= MAX_STROKES || timeLeft <= 0 || scanning) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setErrorMsg(null);
    if (!timerStarted) setTimerStarted(true);
    playTick();

    const { x, y, w, h } = getLocalCoords(e);
    rawPointsRef.current = [{ x, y }];
    setDrawingNow(true);
    setActiveStroke([[Math.round((x / w) * 100), Math.round((y / h) * 100)]]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawingNow) return;
    const { x, y, w, h } = getLocalCoords(e);
    rawPointsRef.current.push({ x, y });
    const nx = Math.round((x / w) * 100);
    const ny = Math.round((y / h) * 100);
    setActiveStroke((prev) => {
      const last = prev[prev.length - 1];
      if (last && last[0] === nx && last[1] === ny) return prev;
      return [...prev, [nx, ny]];
    });
  };

  const finishStroke = () => {
    if (!drawingNow) return;
    setDrawingNow(false);
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const simplified = normalizeStroke(rawPointsRef.current, rect.width, rect.height);
    if (simplified.length > 0) {
      playPop(strokes.length);
      setStrokes((prev) => [...prev.slice(0, MAX_STROKES - 1), simplified]);
    }
    setActiveStroke([]);
    rawPointsRef.current = [];
  };

  const handleUndo = () => {
    if (scanning) return;
    playTick();
    setErrorMsg(null);
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (scanning) return;
    playTick();
    setErrorMsg(null);
    setStrokes([]);
    setActiveStroke([]);
    setTimerStarted(false);
    setTimeLeft(TIME_LIMIT_SEC);
  };

  const liveCheck = strokes.length > 0 ? validatePotatoDrawing({ strokes }) : null;

  const handleSubmit = () => {
    if (scanning) return;
    const pathData: PotatoPathData = { strokes };
    const check = validatePotatoDrawing(pathData);
    if (!check.valid) {
      setErrorMsg(check.reason || 'Draw a closed potato outline first.');
      return;
    }

    setScanning(true);
    setScanStep(0);
    setErrorMsg(null);
    playTick();

    if (mode === 'daily') {
      fetch('/api/drawings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          auditDate,
          promptId: prompt.id,
          pathData,
        }),
      }).catch(() => {});
    }

    const t1 = window.setTimeout(() => setScanStep(1), 420);
    const t2 = window.setTimeout(() => setScanStep(2), 840);
    const t3 = window.setTimeout(() => {
      playStamp();
      const strokeBonus = strokes.length >= 3 ? 6 : strokes.length === 2 ? 4 : 2;
      const closureBonus = (check.closureDistance ?? 20) < 16 ? 4 : 2;
      const humanScore = Math.min(34, 24 + strokeBonus + closureBonus);

      const geometryRoast =
        check.aspectRatio && check.aspectRatio > 1.35
          ? 'wide pancake silhouette'
          : check.aspectRatio && check.aspectRatio < 0.78
            ? 'tall avant-garde silhouette'
            : 'textbook tuber curvature';

      onComplete(
        {
          stage: 3,
          passed: true,
          humanScore,
          potatoScore: 18,
          summary: `Sketched "${prompt.badgeText}" in ${strokes.length} strokes (${geometryRoast}).`,
        },
        pathData
      );
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    }, 1250);
  };

  const currentBytes = strokes.length > 0 ? estimateJsonBytes({ strokes }) : 0;
  const pctLeft = (timeLeft / TIME_LIMIT_SEC) * 100;
  const liveRoast = getLiveRoast(strokes, liveCheck?.aspectRatio, liveCheck?.valid);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-3xl border border-[#E4E4E7] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
    >
      {/* Clean Blue Verification Header */}
      <div className="bg-[#1A73E8] px-6 py-4 text-white">
        <div className="flex items-center justify-between text-xs font-medium text-white/80">
          <span>STAGE 3 OF 3 · ID PHOTO SKETCH</span>
          <span className="font-mono tabular-nums">
            {strokes.length} / {MAX_STROKES} strokes · {timeLeft.toFixed(1)}s
          </span>
        </div>
        <h2 className="mt-1 font-display text-lg font-bold leading-snug tracking-tight sm:text-xl">
          {prompt.title}
        </h2>
        <p className="mt-0.5 text-xs text-white/85">{prompt.hint}</p>
      </div>

      {/* Countdown Progress Line */}
      <div className="h-1 w-full bg-[#F4F4F5]">
        <div
          className={`h-full transition-all duration-100 ${
            timeLeft <= 2.5 && timerStarted ? 'bg-[#DC2626]' : 'bg-[#60A5FA]'
          }`}
          style={{ width: `${pctLeft}%` }}
        />
      </div>

      <div className="p-5 sm:p-6">
        <p className="mb-4 text-center text-xs font-medium text-[#52525B]">
          {scanning ? SCAN_LINES[scanStep] : liveRoast}
        </p>

        {/* Spacious Vector Drawing Pad */}
        <div className="relative mx-auto aspect-square w-full max-w-[310px] overflow-hidden rounded-2xl border-2 border-[#E4E4E7] bg-[#FAFAFB]">
          <div className="pointer-events-none absolute inset-7 rounded-full border border-dashed border-[#D4D4D8]" />

          {scanning && (
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: ['0%', '94%', '0%'] }}
              transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-x-0 z-20 h-1 bg-[#16A34A] shadow-[0_0_16px_4px_rgba(22,163,74,0.6)]"
            />
          )}

          {strokes.length === 0 && activeStroke.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-[#A1A1AA]">
              <Pencil className="mb-2.5 h-6 w-6 opacity-55" strokeWidth={1.75} />
              <span className="text-xs font-semibold text-[#71717A]">Draw your potato outline here</span>
              <span className="mt-1 text-[11px]">Max 4 strokes · Auto-compressed SVG</span>
            </div>
          )}

          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishStroke}
            onPointerCancel={finishStroke}
            className="h-full w-full touch-none select-none cursor-crosshair"
          >
            {strokes.map((s, i) => (
              <path
                key={i}
                d={strokeToSvgPath(s)}
                fill={i === 0 ? '#F6DFC0' : 'none'}
                stroke="#18181B"
                strokeWidth={5.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {activeStroke.length > 0 && (
              <path
                d={strokeToSvgPath(activeStroke)}
                fill="none"
                stroke="#1A73E8"
                strokeWidth={5.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {strokes.length > 0 && !scanning && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between text-[11px]">
              <span
                className={`rounded-full px-2.5 py-0.5 font-medium ${
                  liveCheck?.valid
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'bg-[#FEF3C7] text-[#B45309]'
                }`}
              >
                {liveCheck?.valid ? 'Looks legit' : 'Close the loop'}
              </span>
              <span className="rounded-full bg-white/90 px-2.5 py-0.5 font-mono text-[#71717A] ring-1 ring-[#E4E4E7]">
                {currentBytes} B
              </span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-[#FEF2F2] px-4 py-2.5 text-center text-xs font-medium text-[#B91C1C] ring-1 ring-[#FECACA]">
            {errorMsg}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F4F4F5] pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0 || scanning}
              aria-label="Undo last stroke"
              className="btn btn-sm h-10 rounded-xl border-[#E4E4E7] bg-white px-3 text-xs text-[#52525B] hover:bg-[#FAFAFB] disabled:opacity-40"
            >
              <Undo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={(strokes.length === 0 && !timerStarted) || scanning}
              aria-label="Clear canvas"
              className="btn btn-sm h-10 rounded-xl border-[#E4E4E7] bg-white px-3 text-xs text-[#52525B] hover:bg-[#FAFAFB] disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Clear</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={strokes.length === 0 || scanning}
            className={`btn h-10 rounded-xl border-0 px-6 text-sm font-semibold text-white ${
              scanning
                ? 'bg-[#16A34A] text-white disabled:bg-[#16A34A] disabled:text-white'
                : liveCheck?.valid
                  ? 'bg-[#16A34A] hover:bg-[#15803D] disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA]'
                  : 'bg-[#1A73E8] hover:bg-[#1557B0] disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA]'
            }`}
          >
            {scanning
              ? 'Scanning...'
              : timeLeft <= 0 && liveCheck?.valid
                ? 'Time Up — Stamp It!'
                : 'Submit & Get ID'}
          </button>
        </div>
      </div>
    </motion.section>
  );
};
