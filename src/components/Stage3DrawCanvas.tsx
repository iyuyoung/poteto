import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, CheckCircle2, Pencil, RotateCcw, Undo2 } from 'lucide-react';
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!timerStarted || timeLeft <= 0) return;
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
  }, [timerStarted, timeLeft <= 0]);

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
    if (strokes.length >= MAX_STROKES || timeLeft <= 0 || submitting) return;
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
    if (submitting) return;
    playTick();
    setErrorMsg(null);
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (submitting) return;
    playTick();
    setErrorMsg(null);
    setStrokes([]);
    setActiveStroke([]);
    setTimerStarted(false);
    setTimeLeft(TIME_LIMIT_SEC);
  };

  const liveCheck = strokes.length > 0 ? validatePotatoDrawing({ strokes }) : null;

  const handleSubmit = () => {
    if (submitting) return;
    const pathData: PotatoPathData = { strokes };
    const check = validatePotatoDrawing(pathData);
    if (!check.valid) {
      setErrorMsg(check.reason || '请画出一颗闭合的土豆轮廓。');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    playStamp();

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

    const strokeBonus = strokes.length >= 3 ? 6 : strokes.length === 2 ? 4 : 2;
    const closureBonus = (check.closureDistance ?? 20) < 16 ? 4 : 2;
    const humanScore = Math.min(34, 24 + strokeBonus + closureBonus);

    onComplete(
      {
        stage: 3,
        passed: true,
        humanScore,
        potatoScore: 18,
        summary: `你用 ${strokes.length} 笔完成了「${prompt.badgeText}」，已自动印作证件照！`,
      },
      pathData
    );
  };

  const currentBytes = strokes.length > 0 ? estimateJsonBytes({ strokes }) : 0;
  const pctLeft = (timeLeft / TIME_LIMIT_SEC) * 100;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-2xl border border-[#D4D4D8] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.08)]"
    >
      {/* Iconic Blue Verification Header */}
      <div className="bg-[#1A73E8] px-5 py-4 text-white">
        <div className="flex items-center justify-between text-[11px] font-medium text-white/80">
          <span>第 3 关 / 共 3 关 · 手绘证件照</span>
          <span className="font-mono">
            {strokes.length}/{MAX_STROKES} 笔 · {timeLeft.toFixed(1)}s
          </span>
        </div>
        <h2 className="mt-1 font-display text-lg font-bold tracking-tight sm:text-xl">
          {prompt.title}
        </h2>
        <p className="mt-0.5 text-xs text-white/85">{prompt.hint}</p>
      </div>

      {/* Thin Countdown Progress Bar */}
      <div className="h-1 w-full bg-[#E4E4E7]">
        <div
          className={`h-full transition-all duration-100 ${
            timeLeft <= 2.5 && timerStarted ? 'bg-[#DC2626]' : 'bg-[#60A5FA]'
          }`}
          style={{ width: `${pctLeft}%` }}
        />
      </div>

      <div className="p-4 sm:p-5">
        {/* Crisp Vector Drawing Pad */}
        <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-2xl border-2 border-[#E4E4E7] bg-[#FAFAFB] shadow-inner">
          <div className="pointer-events-none absolute inset-6 rounded-full border border-dashed border-[#D4D4D8]" />

          {strokes.length === 0 && activeStroke.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-[#A1A1AA]">
              <Pencil className="mb-2 h-6 w-6 opacity-60" strokeWidth={1.8} />
              <span className="text-xs font-semibold text-[#71717A]">落笔即开始 10 秒倒计时</span>
              <span className="mt-0.5 text-[11px]">第 1 笔闭合轮廓 + 最多 3 笔五官</span>
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

          {/* Subtle status badge inside canvas bottom */}
          {strokes.length > 0 && (
            <div className="pointer-events-none absolute inset-x-3 bottom-2.5 flex items-center justify-between text-[10px]">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                  liveCheck?.valid
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'bg-[#FEF3C7] text-[#B45309]'
                }`}
              >
                {liveCheck?.valid ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" strokeWidth={2.2} />
                    <span>轮廓合格，可随时出证</span>
                  </>
                ) : (
                  <span>轮廓需近似闭合</span>
                )}
              </span>
              <span className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[#71717A] shadow-2xs">
                {currentBytes} B
              </span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C] ring-1 ring-[#FECACA]">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#F4F4F5] pt-3.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0 || submitting}
              className="btn btn-sm rounded-xl border-[#E4E4E7] bg-white text-xs text-[#52525B] hover:bg-[#FAFAFB] disabled:opacity-40"
            >
              <Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
              <span>撤销</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={(strokes.length === 0 && !timerStarted) || submitting}
              className="btn btn-sm rounded-xl border-[#E4E4E7] bg-white text-xs text-[#52525B] hover:bg-[#FAFAFB] disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              <span>重画</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={strokes.length === 0 || submitting}
            className={`btn btn-sm h-10 rounded-xl border-0 px-5 text-xs font-bold text-white shadow-xs disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA] ${
              liveCheck?.valid
                ? 'bg-[#16A34A] hover:bg-[#15803D]'
                : 'bg-[#1A73E8] hover:bg-[#1557B0]'
            }`}
          >
            <span>{timeLeft <= 0 && liveCheck?.valid ? '时间到，立即出证' : '封存并出证'}</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </motion.section>
  );
};
