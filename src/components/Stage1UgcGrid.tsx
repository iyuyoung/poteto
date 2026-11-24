import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, CheckCircle2, Flag, ShieldAlert, XCircle } from 'lucide-react';
import { PotatoSvg } from './PotatoSvg';
import { playFail, playPop, playSuccess, playTick } from '../lib/sfx';
import type { PotatoDrawing, Stage1Prompt, StageResult } from '../lib/types';

interface Stage1UgcGridProps {
  prompt: Stage1Prompt;
  initialDrawings: PotatoDrawing[];
  reserveDrawings: PotatoDrawing[];
  onComplete: (result: StageResult) => void;
}

export const Stage1UgcGrid: React.FC<Stage1UgcGridProps> = ({
  prompt,
  initialDrawings,
  reserveDrawings,
  onComplete,
}) => {
  const [grid, setGrid] = useState<PotatoDrawing[]>(initialDrawings.slice(0, 9));
  const [reserves, setReserves] = useState<PotatoDrawing[]>(reserveDrawings);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reportNotice, setReportNotice] = useState<string | null>(null);
  const [revealedResult, setRevealedResult] = useState<StageResult | null>(null);

  const toggleSelect = (id: string) => {
    if (revealedResult) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        playTick();
        return prev.filter((item) => item !== id);
      }
      const next = prev.length >= prompt.targetCount ? [...prev.slice(1), id] : [...prev, id];
      playPop(next.length - 1);
      return next;
    });
  };

  const handleReport = async (e: React.MouseEvent, drawing: PotatoDrawing, idx: number) => {
    e.stopPropagation();
    if (revealedResult) return;
    playTick();

    setSelectedIds((prev) => prev.filter((id) => id !== drawing.id));
    if (reserves.length > 0) {
      const [replacement, ...rest] = reserves;
      setGrid((prev) => prev.map((item, i) => (i === idx ? replacement : item)));
      setReserves(rest);
      setReportNotice('已收到举报，已从备选池无缝顶替一颗合规土豆。');
    } else {
      setReportNotice('已记录举报，感谢维护土豆社区纯净度。');
    }

    window.setTimeout(() => setReportNotice(null), 2800);

    fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawingId: drawing.id }),
    }).catch(() => {});
  };

  const handleVerify = () => {
    if (selectedIds.length < prompt.targetCount || revealedResult) return;

    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawingIds: selectedIds }),
    }).catch(() => {});

    const pickedDecoy = grid.some((d) => d.isOfficialDecoy && selectedIds.includes(d.id));
    if (pickedDecoy) {
      playFail();
    } else {
      playSuccess();
    }

    const result: StageResult = {
      stage: 1,
      passed: !pickedDecoy,
      humanScore: pickedDecoy ? 20 : 34,
      potatoScore: 26,
      summary: pickedDecoy
        ? '破防了！你把官方混入的「六边形伪装石块」当成了土豆。'
        : '火眼金睛！精准避开官方伪装石块，认出了网友的灵魂画作。',
    };

    setRevealedResult(result);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-2xl border border-[#D4D4D8] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.08)]"
    >
      {/* Iconic Google reCAPTCHA-style Blue Header */}
      <div className="bg-[#1A73E8] px-5 py-4 text-white">
        <div className="flex items-center justify-between text-[11px] font-medium text-white/80">
          <span>第 1 关 / 共 3 关 · {prompt.tagLabel}</span>
          <span className="font-mono">
            已选 {selectedIds.length}/{prompt.targetCount}
          </span>
        </div>
        <h2 className="mt-1 font-display text-lg font-bold tracking-tight sm:text-xl">
          {prompt.title}
        </h2>
        <p className="mt-0.5 text-xs text-white/85">{prompt.subtitle}</p>
      </div>

      {/* Grid Body */}
      <div className="p-3 sm:p-4">
        {reportNotice && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#FFFBEB] px-3 py-2 text-xs font-medium text-[#92400E] ring-1 ring-[#FDE68A]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{reportNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {grid.map((drawing, idx) => {
            const isSelected = selectedIds.includes(drawing.id);
            const isDecoy = Boolean(drawing.isOfficialDecoy);
            const showDecoyAlert = Boolean(revealedResult && isDecoy);

            return (
              <div
                key={`${drawing.id}-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => toggleSelect(drawing.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSelect(drawing.id);
                  }
                }}
                aria-pressed={isSelected}
                className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-1.5 transition-all select-none ${
                  showDecoyAlert
                    ? 'border-[#DC2626] bg-[#FEF2F2]'
                    : isSelected
                      ? 'scale-[0.96] border-[#1A73E8] bg-[#EFF6FF]'
                      : 'border-[#F4F4F5] bg-[#FAFAFB] hover:border-[#D4D4D8] hover:bg-white'
                }`}
              >
                {/* Selection checkmark */}
                {isSelected && !showDecoyAlert && (
                  <span className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A73E8] text-white shadow-xs">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}

                {/* Decoy reveal badge */}
                {showDecoyAlert && (
                  <span className="absolute inset-x-1 top-1 z-10 rounded-md bg-[#DC2626] px-1 py-0.5 text-center text-[10px] font-bold text-white shadow-xs">
                    官方伪装项
                  </span>
                )}

                {/* Report flag icon */}
                {!isDecoy && !revealedResult && (
                  <button
                    type="button"
                    title="举报违规画作（满 3 次自动熔断）"
                    aria-label="举报该画作"
                    onClick={(e) => handleReport(e, drawing, idx)}
                    className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-md text-[#A1A1AA] opacity-0 transition group-hover:opacity-100 hover:bg-white hover:text-[#DC2626] sm:opacity-40"
                  >
                    <Flag className="h-3 w-3" strokeWidth={2} />
                  </button>
                )}

                <PotatoSvg
                  pathData={drawing.pathData}
                  className="h-[74%] w-[74%] transition-transform duration-150 group-hover:scale-105"
                  fillTint={isDecoy ? '#E4E4E7' : '#F6DFC0'}
                  strokeColor="#18181B"
                  strokeWidth={5.2}
                />

                <span className="max-w-full truncate px-1 text-[10px] font-medium text-[#71717A]">
                  {revealedResult && !isDecoy
                    ? `${Math.min(92, 28 + ((drawing.fooledCount ?? 30) % 58))}% 人选`
                    : drawing.caption || `网友画作 #${idx + 1}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer Action or Instant Reveal Punchline */}
        {!revealedResult ? (
          <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-[#F4F4F5] pt-3">
            <span className="text-[11px] text-[#71717A]">
              8 张昨日网友画作 + 1 张官方伪装项
            </span>
            <button
              type="button"
              disabled={selectedIds.length < prompt.targetCount}
              onClick={handleVerify}
              className="btn btn-sm h-10 rounded-xl border-0 bg-[#1A73E8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#1557B0] disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA]"
            >
              <span>验证选择</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3.5 rounded-xl p-3.5 ${
              revealedResult.passed
                ? 'bg-[#F0FDF4] ring-1 ring-[#BBF7D0]'
                : 'bg-[#FEF2F2] ring-1 ring-[#FECACA]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                {revealedResult.passed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={2.2} />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" strokeWidth={2.2} />
                )}
                <div>
                  <p
                    className={`text-xs font-bold ${
                      revealedResult.passed ? 'text-[#166534]' : 'text-[#991B1B]'
                    }`}
                  >
                    {revealedResult.summary}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-[#52525B]">
                    本关得分：你 +{revealedResult.humanScore} · 土豆 +{revealedResult.potatoScore}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playTick();
                  onComplete(revealedResult);
                }}
                className="btn btn-sm h-9 shrink-0 rounded-xl border-0 bg-[#18181B] px-4 text-xs font-semibold text-white hover:bg-[#27272A]"
              >
                <span>下一关</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
