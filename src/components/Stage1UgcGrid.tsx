import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Flag, X } from 'lucide-react';
import { PotatoSvg } from './PotatoSvg';
import { playFail, playPop, playSuccess, playTick } from '../lib/sfx';
import type { PotatoDrawing, Stage1Prompt, StageResult } from '../lib/types';

interface Stage1UgcGridProps {
  prompt: Stage1Prompt;
  initialDrawings: PotatoDrawing[];
  reserveDrawings: PotatoDrawing[];
  onComplete: (result: StageResult) => void;
}

const DECOY_WHISPERS = [
  '别看我，我真是土豆',
  '绝对不是石头',
  '100% 合法淀粉',
  '请忽略我的六条边',
];

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
  const [twistBanner, setTwistBanner] = useState<string | null>(null);
  const [didTwist, setDidTwist] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [revealedResult, setRevealedResult] = useState<StageResult | null>(null);
  const [decoyWhisperIdx, setDecoyWhisperIdx] = useState(0);

  useEffect(() => {
    if (revealedResult) return;
    const id = window.setInterval(() => {
      setDecoyWhisperIdx((i) => (i + 1) % DECOY_WHISPERS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [revealedResult]);

  const toggleSelect = (id: string) => {
    if (revealedResult || scanning) return;

    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        playTick();
        return prev.filter((item) => item !== id);
      }
      const next = prev.length >= prompt.targetCount ? [...prev.slice(1), id] : [...prev, id];
      playPop(next.length - 1);

      if (next.length === 2 && !didTwist) {
        setDidTwist(true);
        window.setTimeout(() => {
          setGrid((cur) => {
            const unselectedIndices = cur
              .map((d, idx) => ({ id: d.id, idx }))
              .filter((item) => !next.includes(item.id));
            if (unselectedIndices.length < 2) return cur;
            const a = unselectedIndices[0].idx;
            const b = unselectedIndices[unselectedIndices.length - 1].idx;
            const copy = [...cur];
            const tmp = copy[a];
            copy[a] = copy[b];
            copy[b] = tmp;
            return copy;
          });
          playTick();
          setTwistBanner('Poteto #01 急了！它偷偷把两颗土豆换了位置！');
          window.setTimeout(() => setTwistBanner(null), 2600);
        }, 220);
      }

      return next;
    });
  };

  const handleReport = async (e: React.MouseEvent, drawing: PotatoDrawing, idx: number) => {
    e.stopPropagation();
    if (revealedResult || scanning) return;
    playTick();

    setSelectedIds((prev) => prev.filter((id) => id !== drawing.id));
    if (reserves.length > 0) {
      const [replacement, ...rest] = reserves;
      setGrid((prev) => prev.map((item, i) => (i === idx ? replacement : item)));
      setReserves(rest);
      setReportNotice('已收到举报，已从备选池无缝顶替一颗合规土豆。');
    } else {
      setReportNotice('已记录举报，感谢维护社区纯净度。');
    }

    window.setTimeout(() => setReportNotice(null), 2600);

    fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawingId: drawing.id }),
    }).catch(() => {});
  };

  const handleVerify = () => {
    if (selectedIds.length < prompt.targetCount || revealedResult || scanning) return;

    playTick();
    setScanning(true);

    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawingIds: selectedIds }),
    }).catch(() => {});

    window.setTimeout(() => {
      setScanning(false);
      const pickedDecoy = grid.some((d) => d.isOfficialDecoy && selectedIds.includes(d.id));
      if (pickedDecoy) playFail();
      else playSuccess();

      setRevealedResult({
        stage: 1,
        passed: !pickedDecoy,
        humanScore: pickedDecoy ? 18 : 34,
        potatoScore: 26,
        summary: pickedDecoy
          ? '你把混进来的六边形鹅卵石（淀粉含量 0%）当成了土豆。'
          : '精准避开伪装石块，Poteto #01 乱压只蒙对了 1 格。',
      });
    }, 650);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-3xl border border-[#E4E4E7] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
    >
      {/* Clean Blue CAPTCHA Header */}
      <div className="bg-[#1A73E8] px-6 py-5 text-white">
        <div className="flex items-center justify-between text-xs font-medium text-white/80">
          <span>第 1 关 / 共 3 关 · {prompt.tagLabel}</span>
          <span className="font-mono tabular-nums">
            已选 {selectedIds.length} / {prompt.targetCount}
          </span>
        </div>
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">
          {prompt.title}
        </h2>
        <p className="mt-1 text-xs text-white/85">{prompt.subtitle}</p>
      </div>

      {/* Grid Arena */}
      <div className="p-5 sm:p-6">
        {twistBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-[#FFF7ED] px-4 py-2.5 text-center text-xs font-semibold text-[#C2410C] ring-1 ring-[#FED7AA]"
          >
            {twistBanner}
          </motion.div>
        )}

        {reportNotice && (
          <div className="mb-4 rounded-xl bg-[#FFFBEB] px-4 py-2.5 text-xs font-medium text-[#92400E] ring-1 ring-[#FDE68A]">
            {reportNotice}
          </div>
        )}

        <div className="relative grid grid-cols-3 gap-3">
          {scanning && (
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: ['0%', '94%', '0%'] }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-x-0 z-20 h-1 bg-[#1A73E8] shadow-[0_0_16px_4px_rgba(26,115,232,0.6)]"
            />
          )}

          {grid.map((drawing, idx) => {
            const isSelected = selectedIds.includes(drawing.id);
            const isDecoy = Boolean(drawing.isOfficialDecoy);

            // Crystal-clear Pass / Fail visual state after verification
            let tileStyle =
              'border-[#F4F4F5] bg-[#FAFAFB] hover:border-[#D4D4D8] hover:bg-white';
            if (revealedResult) {
              if (isDecoy && isSelected) {
                tileStyle = 'border-[#DC2626] bg-[#FEF2F2]';
              } else if (isDecoy) {
                tileStyle = 'border-dashed border-[#EF4444] bg-[#FEF2F2]/60';
              } else if (isSelected) {
                tileStyle = 'border-[#16A34A] bg-[#F0FDF4]';
              } else {
                tileStyle = 'border-[#F4F4F5] bg-[#FAFAFB] opacity-45';
              }
            } else if (isSelected) {
              tileStyle = 'scale-[0.97] border-[#1A73E8] bg-[#EFF6FF]';
            }

            return (
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                key={drawing.id}
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
                className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-2.5 transition-all select-none ${tileStyle}`}
              >
                {/* Pre-reveal selection check */}
                {!revealedResult && isSelected && (
                  <span className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A73E8] text-white">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                )}

                {/* Post-reveal unmistakable Pass / Fail badges */}
                {revealedResult && isSelected && !isDecoy && (
                  <span className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#16A34A] text-white">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                )}
                {revealedResult && isSelected && isDecoy && (
                  <span className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#DC2626] text-white">
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                )}
                {revealedResult && isDecoy && (
                  <span className="absolute right-2 top-2 z-10 rounded-md bg-[#DC2626] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {isSelected ? '踩雷' : '卧底石块'}
                  </span>
                )}

                {/* Quiet hover-only report flag (zero idle clutter) */}
                {!isDecoy && !revealedResult && (
                  <button
                    type="button"
                    title="举报违规画作（满 3 次自动熔断）"
                    aria-label="举报该画作"
                    onClick={(e) => handleReport(e, drawing, idx)}
                    className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-lg text-[#A1A1AA] opacity-0 transition group-hover:opacity-80 hover:bg-white hover:text-[#DC2626]"
                  >
                    <Flag className="h-3 w-3" strokeWidth={1.75} />
                  </button>
                )}

                <motion.div
                  animate={isDecoy && !revealedResult ? { rotate: [0, -2, 2, 0] } : undefined}
                  transition={
                    isDecoy && !revealedResult
                      ? { repeat: Infinity, repeatDelay: 2.2, duration: 0.35 }
                      : undefined
                  }
                  className="flex h-[72%] w-[72%] items-center justify-center"
                >
                  <PotatoSvg
                    pathData={drawing.pathData}
                    className="h-full w-full transition-transform duration-150 group-hover:scale-105"
                    fillTint={isDecoy ? '#E4E4E7' : '#F6DFC0'}
                    strokeColor="#18181B"
                    strokeWidth={5.2}
                  />
                </motion.div>

                <span className="mt-1 max-w-full truncate px-1 text-[11px] font-medium text-[#71717A]">
                  {revealedResult
                    ? isDecoy
                      ? '淀粉含量 0%'
                      : `${Math.min(92, 28 + ((drawing.fooledCount ?? 30) % 58))}% 人选`
                    : isDecoy
                      ? DECOY_WHISPERS[decoyWhisperIdx]
                      : drawing.caption || `网友画作 #${idx + 1}`}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Action or Clean High-Contrast Verdict */}
        {!revealedResult ? (
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#F4F4F5] pt-4">
            <span className="text-xs text-[#71717A]">
              {scanning ? '正在检测淀粉纯度…' : '小心！有 1 颗假土豆混在里面'}
            </span>
            <button
              type="button"
              disabled={selectedIds.length < prompt.targetCount || scanning}
              onClick={handleVerify}
              className="btn h-10 rounded-xl border-0 bg-[#1A73E8] px-6 text-sm font-semibold text-white hover:bg-[#1557B0] disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA]"
            >
              {scanning ? '扫描中…' : '验证选择'}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-5 flex flex-col justify-between gap-4 rounded-2xl p-4 sm:flex-row sm:items-center ${
              revealedResult.passed
                ? 'bg-[#F0FDF4] ring-1 ring-[#BBF7D0]'
                : 'bg-[#FEF2F2] ring-1 ring-[#FECACA]'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
                  revealedResult.passed ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                }`}
              >
                {revealedResult.passed ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <X className="h-4 w-4" strokeWidth={2.5} />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-display text-sm font-bold ${
                      revealedResult.passed ? 'text-[#166534]' : 'text-[#991B1B]'
                    }`}
                  >
                    {revealedResult.passed ? '避雷成功' : '踩中伪装石块'}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#52525B] tabular-nums">
                    你 +{revealedResult.humanScore} · 土豆 +{revealedResult.potatoScore}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#52525B]">{revealedResult.summary}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTick();
                onComplete(revealedResult);
              }}
              className="btn h-10 shrink-0 rounded-xl border-0 bg-[#18181B] px-5 text-sm font-semibold text-white hover:bg-[#27272A]"
            >
              下一关
            </button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
