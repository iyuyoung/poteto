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
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between gap-4 rounded-2xl border border-[#E4E4E7] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
      aria-label="Control Potato Live Scoreboard"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAFAFB] ring-1 ring-[#E4E4E7]">
          <OfficialPotatoMascot className="h-8 w-8" sprout={currentStage === 3} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold text-[#09090B]">
              Spud #01
            </span>
            <span className="text-[11px] font-medium text-[#A1A1AA]">
              Idaho Control
            </span>
          </div>
          <p className="truncate text-xs text-[#71717A]">{potatoStatus}</p>
        </div>
      </div>

      {/* Clean Tabular Scoreboard */}
      <div className="flex shrink-0 items-center gap-3 rounded-xl bg-[#FAFAFB] px-3.5 py-2 ring-1 ring-[#F4F4F5]">
        <div className="text-right">
          <span className="block text-[10px] font-medium text-[#71717A]">YOU</span>
          <motion.span
            key={`h-${humanScore}`}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="block font-mono text-base font-bold leading-none text-[#1A73E8] tabular-nums"
          >
            {humanScore}
          </motion.span>
        </div>

        <div className="h-6 w-px bg-[#E4E4E7]" />

        <div className="text-left">
          <span className="block text-[10px] font-medium text-[#71717A]">SPUD</span>
          <motion.span
            key={`p-${potatoScore}`}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`block font-mono text-base font-bold leading-none tabular-nums ${
              potatoLeading ? 'text-[#DC2626]' : 'text-[#18181B]'
            }`}
          >
            {potatoScore}
          </motion.span>
        </div>
      </div>
    </motion.aside>
  );
};
