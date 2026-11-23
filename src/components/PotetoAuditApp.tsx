import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Clock,
  Infinity as InfinityIcon,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CompetitorHud } from './CompetitorHud';
import { OfficialPotatoMascot, PotatoSvg } from './PotatoSvg';
import { Stage1UgcGrid } from './Stage1UgcGrid';
import { Stage2MicroGames } from './Stage2MicroGames';
import { Stage3DrawCanvas } from './Stage3DrawCanvas';
import { CertificateResult } from './CertificateResult';
import {
  getVerdictForPurity,
  OFFICIAL_DECOY_DRAWING,
  SEED_POTATO_DRAWINGS,
  STAGE1_PROMPTS,
  STAGE2_GAMES,
  STAGE3_PROMPTS,
} from '../lib/catalog';
import {
  formatAuditNumber,
  formatCountdown,
  getMsUntilNextUtcMidnight,
} from '../lib/prng';
import {
  getCurrentStreak,
  getLocalYesterdayDrawing,
  getOrCreateClientId,
  getSavedDailyResult,
  saveDailyResult,
} from '../lib/storage';
import type {
  AuditSessionResult,
  DailyAuditPayload,
  PotatoPathData,
  StageResult,
  YesterdayHookPayload,
} from '../lib/types';

interface PotetoAuditAppProps {
  initialDaily: DailyAuditPayload;
  siteUrl: string;
}

type Phase = 'entry' | 'stage1' | 'stage2' | 'stage3' | 'result';

function buildEndlessPayload(seedCounter: number, baseAudit: DailyAuditPayload): DailyAuditPayload {
  const s1 = STAGE1_PROMPTS[Math.floor(Math.random() * STAGE1_PROMPTS.length)];
  const s2 = STAGE2_GAMES[Math.floor(Math.random() * STAGE2_GAMES.length)];
  const s3 = STAGE3_PROMPTS[Math.floor(Math.random() * STAGE3_PROMPTS.length)];
  const shuffled = [...SEED_POTATO_DRAWINGS].sort(() => Math.random() - 0.5);
  const eight = shuffled.slice(0, 8);
  const decoyPos = Math.floor(Math.random() * 9);
  eight.splice(decoyPos, 0, { ...OFFICIAL_DECOY_DRAWING, auditDate: baseAudit.auditDate });

  return {
    ...baseAudit,
    seed: `endless-${seedCounter}-${Date.now()}`,
    stage1Prompt: s1,
    stage2Game: s2,
    stage3Prompt: s3,
    featuredDrawings: eight,
    reserveDrawings: shuffled.slice(8),
  };
}

export const PotetoAuditApp: React.FC<PotetoAuditAppProps> = ({ initialDaily, siteUrl }) => {
  const [clientId, setClientId] = useState<string>('');
  const [mode, setMode] = useState<'daily' | 'endless'>('daily');
  const [activePayload, setActivePayload] = useState<DailyAuditPayload>(initialDaily);
  const [phase, setPhase] = useState<Phase>('entry');
  const [checkingBox, setCheckingBox] = useState(false);

  const [countdown, setCountdown] = useState<string>('--:--:--');
  const [yesterdayHook, setYesterdayHook] = useState<YesterdayHookPayload | null>(null);

  const [stageResults, setStageResults] = useState<StageResult[]>([]);
  const [finalResult, setFinalResult] = useState<AuditSessionResult | null>(null);
  const [endlessRound, setEndlessRound] = useState(0);

  // Initialize anonymous client_id, daily lock check, and yesterday returning-user hook
  useEffect(() => {
    const id = getOrCreateClientId();
    setClientId(id);

    const saved = getSavedDailyResult(initialDaily.auditDate);
    if (saved) {
      setFinalResult(saved);
      setPhase('result');
    }

    // Fetch returning-user hook from server, with local fallback if user drew yesterday locally
    fetch(`/api/yesterday?clientId=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: YesterdayHookPayload | null) => {
        if (data?.hasYesterday) {
          setYesterdayHook(data);
        } else {
          const localY = getLocalYesterdayDrawing();
          if (localY) {
            setYesterdayHook({
              hasYesterday: true,
              fooledCount: 41,
              drawing: localY.drawing,
              message: '你昨天画的土豆，昨晚成功骗过了 41 个人类。',
            });
          }
        }
      })
      .catch(() => {});
  }, [initialDaily.auditDate]);

  // Live countdown to next UTC midnight (runs client-only to guarantee zero SSR hydration mismatch)
  useEffect(() => {
    setCountdown(formatCountdown(getMsUntilNextUtcMidnight()));
    const timer = window.setInterval(() => {
      setCountdown(formatCountdown(getMsUntilNextUtcMidnight()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { humanScore, potatoScore } = useMemo(() => {
    return stageResults.reduce(
      (acc, cur) => ({
        humanScore: acc.humanScore + cur.humanScore,
        potatoScore: acc.potatoScore + cur.potatoScore,
      }),
      { humanScore: 0, potatoScore: 0 }
    );
  }, [stageResults]);

  const handleCheckboxClick = () => {
    if (checkingBox) return;
    setCheckingBox(true);
    window.setTimeout(() => {
      setCheckingBox(false);
      setStageResults([]);
      setPhase('stage1');
    }, 520);
  };

  const handleStage1Done = (res: StageResult) => {
    setStageResults([res]);
    setPhase('stage2');
  };

  const handleStage2Done = (res: StageResult) => {
    setStageResults((prev) => [...prev.slice(0, 1), res]);
    setPhase('stage3');
  };

  const handleStage3Done = (res: StageResult, drawing: PotatoPathData) => {
    const all: [StageResult, StageResult, StageResult] = [
      stageResults[0],
      stageResults[1],
      res,
    ];
    const humanTotal = all.reduce((s, r) => s + r.humanScore, 0);
    const potatoTotal = all.reduce((s, r) => s + r.potatoScore, 0);
    const humanPurity = Math.max(12, Math.min(99, Math.round((humanTotal / 102) * 100)));
    const verdict = getVerdictForPurity(humanPurity, humanTotal >= potatoTotal);

    const session: AuditSessionResult = {
      auditDate: activePayload.auditDate,
      auditNumber: activePayload.auditNumber,
      mode,
      stages: all,
      humanPurity,
      humanTotal,
      potatoTotal,
      verdictTitle: verdict.title,
      verdictSubtitle: verdict.subtitle,
      drawing,
      drawingPrompt: activePayload.stage3Prompt.title,
      streak: getCurrentStreak(),
      completedAt: new Date().toISOString(),
    };

    if (mode === 'daily') {
      const nextStreak = saveDailyResult(session);
      session.streak = nextStreak;
    }

    setFinalResult(session);
    setPhase('result');
  };

  const startEndlessMode = () => {
    const nextRound = endlessRound + 1;
    setEndlessRound(nextRound);
    setMode('endless');
    setActivePayload(buildEndlessPayload(nextRound, initialDaily));
    setStageResults([]);
    setFinalResult(null);
    setPhase('stage1');
  };

  const currentStageNum: 1 | 2 | 3 =
    phase === 'stage1' ? 1 : phase === 'stage2' ? 2 : 3;

  const potatoStatus =
    phase === 'stage1'
      ? '正用淀粉直觉凝视九宫格'
      : phase === 'stage2'
        ? activePayload.stage2Game.potatoStatus
        : '试图用根须握笔（失败中）';

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Returning-User Hook Banner */}
      {yesterdayHook?.hasYesterday && phase === 'entry' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 rounded-2xl border border-[#F5CBA7] bg-[#FFF8F0] px-4 py-3 shadow-sm"
        >
          {yesterdayHook.drawing ? (
            <div className="h-11 w-11 shrink-0 rounded-xl border border-[#E7DEC8] bg-white p-1">
              <PotatoSvg pathData={yesterdayHook.drawing} className="h-full w-full" />
            </div>
          ) : (
            <Sparkles className="h-5 w-5 shrink-0 text-[#C86D2D]" strokeWidth={2} />
          )}
          <div className="text-xs leading-relaxed text-[#7C2D12] sm:text-sm">
            <span className="font-bold">昨日回访战报：</span>
            {yesterdayHook.message}
          </div>
        </motion.div>
      )}

      {/* Top Audit Serial & Countdown Strip */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D6CFC2] bg-white px-3 py-1 font-mono text-xs font-bold text-[#1C1917] shadow-xs">
            {mode === 'endless' ? (
              <>
                <InfinityIcon className="h-3.5 w-3.5 text-[#C86D2D]" strokeWidth={2.2} />
                <span>Endless Audit #{endlessRound}</span>
              </>
            ) : (
              <span>Poteto Audit #{formatAuditNumber(activePayload.auditNumber)}</span>
            )}
          </span>
          <span className="hidden text-xs text-[#78716C] sm:inline">每日全球同题 · 90 秒年审</span>
        </div>

        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#57534E]">
          <Clock className="h-3.5 w-3.5 text-[#C86D2D]" strokeWidth={2} />
          <span>距离今日资格过期还剩</span>
          <span className="rounded-md bg-[#1C1917] px-2 py-0.5 font-bold text-[#FAF7F0]">
            {countdown}
          </span>
        </div>
      </div>

      {/* Persistent Control Potato HUD during Stages 1-3 */}
      {(phase === 'stage1' || phase === 'stage2' || phase === 'stage3') && (
        <div className="mb-4">
          <CompetitorHud
            humanScore={humanScore}
            potatoScore={potatoScore}
            potatoStatus={potatoStatus}
            currentStage={currentStageNum}
          />
        </div>
      )}

      {/* ENTRY: Zero-friction iconic "I am not a robot" CAPTCHA box */}
      {phase === 'entry' && (
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-[#E2D9C8] bg-white p-6 text-center shadow-[0_18px_50px_rgba(28,25,23,0.08)] sm:p-10"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E7DEC8] bg-[#FAF7F0]">
            <OfficialPotatoMascot className="h-12 w-12" />
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#1C1917] sm:text-4xl">
            年度人类资格审验
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-[#57534E] sm:text-base">
            免注册、零门槛。完成 3 关荒诞测试，在 90 秒内证明你比一颗产自北海道的对照组土豆（Poteto #01）更像人类。
          </p>

          {/* Classic Reimagined CAPTCHA Widget */}
          <div className="mx-auto mt-7 max-w-sm">
            <button
              type="button"
              onClick={handleCheckboxClick}
              disabled={checkingBox}
              className="group flex w-full items-center justify-between rounded-2xl border-2 border-[#D6CFC2] bg-[#FAF7F0] px-5 py-4 text-left shadow-[0_4px_0_#E2D9C8] transition-all hover:border-[#2563EB] hover:bg-white active:translate-y-0.5 active:shadow-[0_2px_0_#E2D9C8]"
              aria-label="勾选我不是机器人，开始今日人类资格年审"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md border-2 transition-colors ${
                    checkingBox
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#9CA3AF] bg-white group-hover:border-[#2563EB]'
                  }`}
                >
                  {checkingBox ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" strokeWidth={2.5} />
                  ) : (
                    <Check
                      className="h-5 w-5 text-transparent transition-colors group-hover:text-[#2563EB]/30"
                      strokeWidth={3}
                    />
                  )}
                </span>
                <div>
                  <span className="block font-display text-lg font-bold text-[#1C1917]">
                    我不是机器人
                  </span>
                  <span className="block text-[11px] text-[#78716C]">
                    点击即开启 3 关今日同题年审
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end text-right">
                <ShieldCheck className="h-6 w-6 text-[#2563EB]" strokeWidth={1.8} />
                <span className="mt-0.5 font-mono text-[9px] font-bold tracking-wider text-[#78716C]">
                  rePOTETO
                </span>
              </div>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#78716C]">
            <span>01 辨认昨日网友画作</span>
            <span>02 反直觉搞心态交互</span>
            <span>03 8 秒 3 笔手绘自证</span>
          </div>
        </motion.section>
      )}

      {/* STAGE 1 */}
      {phase === 'stage1' && (
        <Stage1UgcGrid
          key={`s1-${activePayload.seed}`}
          prompt={activePayload.stage1Prompt}
          initialDrawings={activePayload.featuredDrawings}
          reserveDrawings={activePayload.reserveDrawings}
          onComplete={handleStage1Done}
        />
      )}

      {/* STAGE 2 */}
      {phase === 'stage2' && (
        <Stage2MicroGames
          key={`s2-${activePayload.seed}-${activePayload.stage2Game.id}`}
          game={activePayload.stage2Game}
          onComplete={handleStage2Done}
        />
      )}

      {/* STAGE 3 */}
      {phase === 'stage3' && (
        <Stage3DrawCanvas
          key={`s3-${activePayload.seed}`}
          prompt={activePayload.stage3Prompt}
          clientId={clientId || 'anon'}
          auditDate={activePayload.auditDate}
          mode={mode}
          onComplete={handleStage3Done}
        />
      )}

      {/* RESULT CERTIFICATE */}
      {phase === 'result' && finalResult && (
        <CertificateResult
          result={finalResult}
          siteUrl={siteUrl}
          onStartEndless={startEndlessMode}
          onPlayAnotherEndless={startEndlessMode}
        />
      )}
    </div>
  );
};
