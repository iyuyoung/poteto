import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Pencil, RotateCcw, Timer, Undo2 } from 'lucide-react';
import {
  estimateJsonBytes,
  normalizeStroke,
  strokeToSvgPath,
  validatePotatoDrawing,
} from '../lib/rdp';
import type { PotatoPathData, Stage3Prompt, StageResult, Stroke } from '../lib/types';

interface Stage3DrawCanvasProps {
  prompt: Stage3Prompt;
  clientId: string;
  auditDate: string;
  mode: 'daily' | 'endless';
  onComplete: (result: StageResult, drawing: PotatoPathData) => void;
}

const MAX_STROKES = 3;
const TIME_LIMIT_SEC = 8;

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

  // 8-second countdown starts on first pen-down (Layer 1 anti-TTP constraint)
  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft <= 0) return;

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
      setStrokes((prev) => [...prev.slice(0, MAX_STROKES - 1), simplified]);
    }
    setActiveStroke([]);
    rawPointsRef.current = [];
  };

  const handleUndo = () => {
    if (submitting) return;
    setErrorMsg(null);
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (submitting) return;
    setErrorMsg(null);
    setStrokes([]);
    setActiveStroke([]);
    setTimerStarted(false);
    setTimeLeft(TIME_LIMIT_SEC);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const pathData: PotatoPathData = { strokes };
    const check = validatePotatoDrawing(pathData);
    if (!check.valid) {
      setErrorMsg(check.reason || '请按提示画出一颗闭合的土豆。');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

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

    // Score rewards expressive 2-3 stroke potatoes with crisp closure
    const strokeBonus = strokes.length >= 2 ? 6 : 2;
    const closureBonus = (check.closureDistance ?? 20) < 12 ? 4 : 2;
    const humanScore = Math.min(34, 24 + strokeBonus + closureBonus);
    const potatoScore = 18; // Potatoes cannot hold a pen

    onComplete(
      {
        stage: 3,
        passed: true,
        humanScore,
        potatoScore,
        summary: `你用 ${strokes.length} 笔完成了「${prompt.badgeText}」，将作为明日全球考题候补入库！`,
      },
      pathData
    );
  };

  const currentBytes = strokes.length > 0 ? estimateJsonBytes({ strokes }) : 0;
  const isTimeUp = timerStarted && timeLeft <= 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-[#E2D9C8] bg-white p-5 shadow-[0_12px_36px_rgba(28,25,23,0.06)] sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-[#EFE8DA] pb-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-full bg-[#1C1917] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#FAF7F0]">
              STAGE 03 / 03
            </span>
            <span className="rounded-full border border-[#E7DEC8] bg-[#FAF7F0] px-2.5 py-0.5 text-xs font-medium text-[#78716C]">
              手绘自证 · 证件照采集
            </span>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-[#1C1917] sm:text-2xl">
            {prompt.title}
          </h2>
          <p className="mt-1 text-sm text-[#57534E]">{prompt.hint}</p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold ${
              timeLeft <= 2.5 && timerStarted
                ? 'border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]'
                : 'border-[#E7DEC8] bg-[#FAF7F0] text-[#1C1917]'
            }`}
          >
            <Timer className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{timeLeft.toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-[#E7DEC8] bg-[#FAF7F0] px-3 py-1.5 font-mono text-xs font-bold text-[#1C1917]">
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            <span>
              {strokes.length} / {MAX_STROKES} 笔
            </span>
          </div>
        </div>
      </div>

      {/* Normalized 0..100 Vector Drawing Pad */}
      <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-[#D6CFC2] bg-[#FAF7F0] shadow-inner">
        {/* Subtle registration guide */}
        <div className="pointer-events-none absolute inset-4 rounded-full border border-dashed border-[#D6CFC2]/70" />
        {strokes.length === 0 && activeStroke.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-[#A8A29E]">
            <Pencil className="mb-2 h-7 w-7 opacity-60" strokeWidth={1.8} />
            <span className="text-xs font-medium">落笔即开始 8 秒倒计时</span>
            <span className="mt-0.5 text-[11px]">第 1 笔闭合轮廓 + 2 笔五官</span>
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
              fill={i === 0 ? '#F2DEC1' : 'none'}
              stroke="#1C1917"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {activeStroke.length > 0 && (
            <path
              d={strokeToSvgPath(activeStroke)}
              fill="none"
              stroke="#C86D2D"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {isTimeUp && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-[#1C1917]/90 px-3 py-1.5 text-center text-xs font-medium text-[#FAF7F0]">
            8 秒时间到！可直接提交，或点击「重画」再来一次。
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-medium text-[#B91C1C]">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0 || submitting}
            className="btn btn-sm rounded-xl border-[#D6CFC2] bg-white text-xs text-[#57534E] hover:bg-[#FAF7F0] disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
            <span>撤销</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={(strokes.length === 0 && !timerStarted) || submitting}
            className="btn btn-sm rounded-xl border-[#D6CFC2] bg-white text-xs text-[#57534E] hover:bg-[#FAF7F0] disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            <span>重画</span>
          </button>
          {currentBytes > 0 && (
            <span className="hidden font-mono text-[11px] text-[#A8A29E] sm:inline">
              RDP 矢量体积：{currentBytes} B
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={strokes.length === 0 || submitting}
          className="btn w-full rounded-xl border-0 bg-[#1C1917] px-6 text-sm font-semibold text-[#FAF7F0] hover:bg-[#342F2B] disabled:bg-[#D6CFC2] disabled:text-[#78716C] sm:w-auto"
        >
          <span>封存证件照并出证</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </motion.section>
  );
};
