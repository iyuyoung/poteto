import React from 'react';
import { motion } from 'motion/react';
import { Activity, User } from 'lucide-react';
import { OfficialPotatoMascot } from './PotatoSvg';

interface CompetitorHudProps {
  humanScore: number;
  potatoScore: number;
  potatoStatus: string;
  currentStage: 1 | 2 | 3;
}

export const CompetitorHud: React.FC<CompetitorHudProps> = ({
  humanScore,
  potatoScore,
  potatoStatus,
  currentStage,
}) => {
  const potatoLeading = potatoScore > humanScore;

  return (
    <motion.aside
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="w-full rounded-2xl border border-[#E2D9C8] bg-white/95 px-4 py-3 shadow-[0_6px_24px_rgba(28,25,23,0.06)] backdrop-blur-sm"
      aria-label="对照组土豆实时战况"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E7DEC8] bg-[#FAF5EA]">
            <OfficialPotatoMascot className="h-9 w-9" sprout={currentStage === 3} />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#15803D] opacity-50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#15803D]" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold tracking-tight text-[#1C1917]">
                对照组：Poteto #01
              </span>
              <span className="rounded-md bg-[#F4EFE4] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#78716C]">
                北海道产
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[#57534E]">
              <Activity className="h-3.5 w-3.5 text-[#C86D2D]" strokeWidth={2} />
              <span>{potatoStatus}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-xl border border-[#E7DEC8] bg-[#FAF7F0] px-3 py-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-[#78716C]">
              <User className="h-3 w-3" strokeWidth={2} />
              <span>你</span>
            </div>
            <motion.div
              key={humanScore}
              initial={{ scale: 1.18 }}
              animate={{ scale: 1 }}
              className="font-mono text-base font-bold text-[#1C1917]"
            >
              {humanScore}
            </motion.div>
          </div>

          <span className="font-mono text-xs font-bold text-[#A8A29E]">VS</span>

          <div
            className={`rounded-xl border px-3 py-1.5 text-center transition-colors ${
              potatoLeading
                ? 'border-[#C86D2D]/40 bg-[#FFF7ED]'
                : 'border-[#E7DEC8] bg-[#FAF7F0]'
            }`}
          >
            <div className="text-[10px] font-medium text-[#78716C]">土豆</div>
            <motion.div
              key={potatoScore}
              initial={{ scale: 1.18 }}
              animate={{ scale: 1 }}
              className={`font-mono text-base font-bold ${
                potatoLeading ? 'text-[#C86D2D]' : 'text-[#1C1917]'
              }`}
            >
              {potatoScore}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
