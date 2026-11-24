import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  Infinity as InfinityIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CompetitorHud } from './CompetitorHud';
import { PotatoSvg } from './PotatoSvg';
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
import { isSfxMuted, playPop, playTick, setSfxMuted } from '../lib/sfx';
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
  const [muted, setMuted] = useState(false);

  const [countdown, setCountdown] = useState<string>('--:--:--');
  const [yesterdayHook, setYesterdayHook] = useState<YesterdayHookPayload | null>(null);

  const [stageResults, setStageResults] = useState<StageResult[]>([]);
  const [finalResult, setFinalResult] = useState<AuditSessionResult | null>(null);
  const [endlessRound, setEndlessRound] = useState(0);

  useEffect(() => {
    const id = getOrCreateClientId();
    setClientId(id);
    setMuted(isSfxMuted());

    const saved = getSavedDailyResult(initialDaily.auditDate);
    if (saved) {
      setFinalResult(saved);
      setPhase('result');
    }

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

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSfxMuted(next);
    if (!next) playTick();
  };

  const handleCheckboxClick = () => {
    if (checkingBox) return;
    playTick();
    setCheckingBox(true);
    window.setTimeout(() => {
      playPop(1);
      setCheckingBox(false);
      setStageResults([]);
      setPhase('stage1');
    }, 460);
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
    <div className={`mx-auto w-full transition-all ${phase === 'result' ? 'max-w-[520px]' : 'max-w-[440px]'}`}>
      {/* Returning-User Hook Toast */}
      {yesterdayHook?.hasYesterday && phase === 'entry' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-3.5 py-2.5 shadow-2xs"
        >
          {yesterdayHook.drawing ? (
            <div className="h-10 w-10 shrink-0 rounded-xl bg-white p-1 ring-1 ring-[#FDBA74]/50">
              <PotatoSvg pathData={yesterdayHook.drawing} className="h-full w-full" />
            </div>
          ) : (
            <Sparkles className="h-4 w-4 shrink-0 text-[#EA580C]" strokeWidth={2} />
          )}
          <p className="text-xs leading-snug text-[#9A3412]">
            <span className="font-bold">昨日战报：</span>
            {yesterdayHook.message}
          </p>
        </motion.div>
      )}

      {/* Compact Top Meta Strip */}
      <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-mono text-[11px] font-bold text-[#18181B] shadow-2xs ring-1 ring-[#E4E4E7]">
          {mode === 'endless' ? (
            <>
              <InfinityIcon className="h-3.5 w-3.5 text-[#1A73E8]" strokeWidth={2.2} />
              <span>Endless #{endlessRound}</span>
            </>
          ) : (
            <span>Poteto Audit #{formatAuditNumber(activePayload.auditNumber)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <div
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-[#52525B] shadow-2xs ring-1 ring-[#E4E4E7]"
            title="距离今日人类资格过期剩余时间"
          >
            <Clock className="h-3 w-3 text-[#71717A]" strokeWidth={2} />
            <span>{countdown}</span>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? '开启音效' : '静音'}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#71717A] shadow-2xs ring-1 ring-[#E4E4E7] transition hover:text-[#09090B]"
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <Volume2 className="h-3.5 w-3.5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Persistent Control Potato HUD during Stages 1-3 */}
      {(phase === 'stage1' || phase === 'stage2' || phase === 'stage3') && (
        <div className="mb-3">
          <CompetitorHud
            humanScore={humanScore}
            potatoScore={potatoScore}
            potatoStatus={potatoStatus}
            currentStage={currentStageNum}
          />
        </div>
      )}

      {/* ENTRY: Iconic Hyper-Clean reCAPTCHA Centerpiece */}
      {phase === 'entry' && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center py-6 text-center"
        >
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#09090B] sm:text-4xl">
            证明你是人类
          </h1>
          <p className="mt-2 max-w-xs text-sm text-[#71717A]">
            90 秒三关全球同题年审，别输给北海道对照组土豆。
          </p>

          {/* Iconic Google reCAPTCHA v2-style Interactive Box */}
          <div className="mt-8 w-full max-w-[330px]">
            <button
              type="button"
              onClick={handleCheckboxClick}
              disabled={checkingBox}
              aria-label="勾选我不是机器人，开始今日人类资格年审"
              className="group flex w-full items-center justify-between rounded-[4px] border border-[#D3D3D3] bg-[#F9F9F9] px-4 py-3.5 text-left shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all hover:border-[#B8B8B8] hover:bg-white hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-[2px] border-2 transition-colors ${
                    checkingBox
                      ? 'border-transparent bg-transparent'
                      : 'border-[#C1C1C1] bg-white group-hover:border-[#9E9E9E]'
                  }`}
                >
                  {checkingBox && (
                    <Loader2 className="h-6 w-6 animate-spin text-[#1A73E8]" strokeWidth={2.5} />
                  )}
                </span>
                <span className="text-[15px] font-medium text-[#202124]">
                  我不是机器人
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <RefreshCw
                  className={`h-6 w-6 text-[#1A73E8] transition-transform duration-500 ${
                    checkingBox ? 'rotate-180' : 'group-hover:rotate-45'
                  }`}
                  strokeWidth={2}
                />
                <span className="mt-1 text-[9px] font-semibold tracking-tight text-[#555555]">
                  rePOTETO
                </span>
                <span className="text-[7px] text-[#777777]">隐私 - 条款</span>
              </div>
            </button>
          </div>

          <p className="mt-6 font-mono text-[11px] text-[#A1A1AA]">
            免注册 · 全球每日同题 · 距离今日资格过期 {countdown}
          </p>
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
