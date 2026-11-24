import React from 'react';
import { motion } from 'motion/react';
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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between gap-3 rounded-2xl border border-[#E4E4E7] bg-white px-3.5 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
      aria-label="对照组土豆实时战况"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF7ED] ring-1 ring-[#FED7AA]">
          <OfficialPotatoMascot className="h-7 w-7" sprout={currentStage === 3} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-display text-xs font-bold text-[#18181B]">
              Poteto #01
            </span>
            <span className="rounded bg-[#F4F4F5] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#71717A]">
              对照组
            </span>
          </div>
          <p className="truncate text-[11px] text-[#71717A]">{potatoStatus}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-baseline gap-1 rounded-xl bg-[#EFF6FF] px-2.5 py-1">
          <span className="text-[10px] font-medium text-[#3B82F6]">你</span>
          <motion.span
            key={`h-${humanScore}`}
            initial={{ scale: 1.25 }}
            animate={{ scale: 1 }}
            className="font-mono text-sm font-bold text-[#1D4ED8]"
          >
            {humanScore}
          </motion.span>
        </div>

        <span className="font-mono text-[10px] font-bold text-[#A1A1AA]">VS</span>

        <div
          className={`flex items-baseline gap-1 rounded-xl px-2.5 py-1 transition-colors ${
            potatoLeading ? 'bg-[#FEF2F2]' : 'bg-[#FFF7ED]'
          }`}
        >
          <span className="text-[10px] font-medium text-[#D97706]">土豆</span>
          <motion.span
            key={`p-${potatoScore}`}
            initial={{ scale: 1.25 }}
            animate={{ scale: 1 }}
            className={`font-mono text-sm font-bold ${
              potatoLeading ? 'text-[#DC2626]' : 'text-[#B45309]'
            }`}
          >
            {potatoScore}
          </motion.span>
        </div>
      </div>
    </motion.aside>
  );
};
