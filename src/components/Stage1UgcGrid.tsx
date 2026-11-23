import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Flag, ShieldAlert, ArrowRight } from 'lucide-react';
import { PotatoSvg } from './PotatoSvg';
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
  const [submitting, setSubmitting] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= prompt.targetCount) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleReport = async (e: React.MouseEvent, drawing: PotatoDrawing, idx: number) => {
    e.stopPropagation();

    // Seamlessly swap out reported drawing from reserve pool on the client immediately
    setSelectedIds((prev) => prev.filter((id) => id !== drawing.id));
    if (reserves.length > 0) {
      const [replacement, ...rest] = reserves;
      setGrid((prev) => prev.map((item, i) => (i === idx ? replacement : item)));
      setReserves(rest);
      setReportNotice('已收到举报，已从备选池无缝顶替一颗合规土豆。');
    } else {
      setReportNotice('已收到举报并记录，感谢维护土豆纯净度。');
    }

    setTimeout(() => setReportNotice(null), 3200);

    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawingId: drawing.id }),
      });
    } catch {
      // Non-blocking
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length < prompt.targetCount || submitting) return;
    setSubmitting(true);

    // Fire-and-forget vote increment so yesterday's creators get fooled_count stats
    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawingIds: selectedIds }),
    }).catch(() => {});

    const pickedDecoy = grid.some((d) => d.isOfficialDecoy && selectedIds.includes(d.id));
    const humanScore = pickedDecoy ? 22 : 34;
    const potatoScore = 26; // Control potato randomly stares at 3 cells

    const result: StageResult = {
      stage: 1,
      passed: !pickedDecoy,
      humanScore,
      potatoScore,
      summary: pickedDecoy
        ? '你不小心选中了年审局混入的「官方伪装石块」，人类辨识度扣分。'
        : '精准避开官方伪装项，成功识别出网友的灵魂土豆。',
    };

    onComplete(result);
  };

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
              STAGE 01 / 03
            </span>
            <span className="rounded-full border border-[#E7DEC8] bg-[#FAF7F0] px-2.5 py-0.5 text-xs font-medium text-[#78716C]">
              {prompt.tagLabel}
            </span>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-[#1C1917] sm:text-2xl">
            {prompt.title}
          </h2>
          <p className="mt-1 text-sm text-[#57534E]">{prompt.subtitle}</p>
        </div>
        <div className="rounded-xl bg-[#FAF7F0] px-3 py-1.5 font-mono text-xs font-semibold text-[#57534E]">
          已选 {selectedIds.length} / {prompt.targetCount}
        </div>
      </div>

      {reportNotice && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#FCD34D] bg-[#FFFBEB] px-3 py-2 text-xs font-medium text-[#92400E]">
          <ShieldAlert className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{reportNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {grid.map((drawing, idx) => {
          const isSelected = selectedIds.includes(drawing.id);
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
              className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-2 transition-all select-none ${
                isSelected
                  ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_3px_rgba(37,99,235,0.14)]'
                  : 'border-[#E7DEC8] bg-[#FAF7F0] hover:border-[#C86D2D]/60 hover:bg-[#FFFBF4]'
              }`}
            >
              {/* Selection check badge */}
              {isSelected && (
                <span className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-sm">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              )}

              {/* Crowdsourced circuit-breaker report button (Layer 3) */}
              {!drawing.isOfficialDecoy && (
                <button
                  type="button"
                  title="举报不雅/违规画作（满 3 次自动熔断替换）"
                  aria-label="举报该画作"
                  onClick={(e) => handleReport(e, drawing, idx)}
                  className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-lg text-[#A8A29E] opacity-60 transition hover:bg-white hover:text-[#DC2626] hover:opacity-100"
                >
                  <Flag className="h-3 w-3" strokeWidth={2} />
                </button>
              )}

              <PotatoSvg
                pathData={drawing.pathData}
                className="h-[78%] w-[78%] transition-transform duration-200 group-hover:scale-105"
                fillTint={drawing.isOfficialDecoy ? '#E5E7EB' : '#F2DEC1'}
              />

              <span className="mt-0.5 max-w-full truncate px-1 text-[10px] font-medium text-[#78716C]">
                {drawing.caption || `昨日画作 #${idx + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-[#78716C]">
          九宫格包含 8 张网友手绘矢量土豆 + 1 张官方干扰项。右上角小旗可一键举报。
        </p>
        <button
          type="button"
          disabled={selectedIds.length < prompt.targetCount || submitting}
          onClick={handleSubmit}
          className="btn w-full rounded-xl border-0 bg-[#1C1917] px-6 text-sm font-semibold text-[#FAF7F0] hover:bg-[#342F2B] disabled:bg-[#D6CFC2] disabled:text-[#78716C] sm:w-auto"
        >
          <span>提交辨别结果</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </motion.section>
  );
};
