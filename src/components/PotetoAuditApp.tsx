import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  Loader2,
  ShieldCheck,
  Volume2,
  VolumeX,
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
  const [savedDaily, setSavedDaily] = useState<AuditSessionResult | null>(null);
  const [finalResult, setFinalResult] = useState<AuditSessionResult | null>(null);
  const [endlessRound, setEndlessRound] = useState(0);

  useEffect(() => {
    const id = getOrCreateClientId();
    setClientId(id);
    setMuted(isSfxMuted());

    const saved = getSavedDailyResult(initialDaily.auditDate);
    if (saved) {
      setSavedDaily(saved);
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
              message: 'Your potato doodle successfully gaslit 41 humans last night.',
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

  const upsertStageScore = (res: StageResult) => {
    setStageResults((prev) => {
      const filtered = prev.filter((r) => r.stage !== res.stage);
      return [...filtered, res].sort((a, b) => a.stage - b.stage);
    });
  };

  const handleCheckboxClick = () => {
    if (checkingBox) return;
    playTick();
    setCheckingBox(true);
    window.setTimeout(() => {
      playPop(1);
      setCheckingBox(false);
      if (savedDaily) {
        startEndlessMode();
        return;
      }
      setMode('daily');
      setActivePayload(initialDaily);
      setStageResults([]);
      setPhase('stage1');
    }, 460);
  };

  const handleStage1Done = (res: StageResult) => {
    upsertStageScore(res);
    setPhase('stage2');
  };

  const handleStage2Done = (res: StageResult) => {
    upsertStageScore(res);
    setPhase('stage3');
  };

  const handleStage3Done = (res: StageResult, drawing: PotatoPathData) => {
    const s1 = stageResults.find((r) => r.stage === 1) ?? stageResults[0];
    const s2 = stageResults.find((r) => r.stage === 2) ?? stageResults[1];
    const all: [StageResult, StageResult, StageResult] = [s1, s2, res];
    const humanTotal = all.reduce((s, r) => s + r.humanScore, 0);
    const potatoTotal = all.reduce((s, r) => s + r.potatoScore, 0);
    const humanPurity = Math.max(12, Math.min(99, Math.round((humanTotal / 102) * 100)));
    const verdict = getVerdictForPurity(humanPurity, humanTotal >= potatoTotal);

    const session: AuditSessionResult = {
      auditDate: activePayload.auditDate,
      auditNumber: activePayload.auditNumber,
      endlessRound: mode === 'endless' ? endlessRound : undefined,
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
      setSavedDaily(session);
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
      ? 'Staring blankly at the 3x3 grid'
      : phase === 'stage2'
        ? activePayload.stage2Game.potatoStatus
        : 'Trying to hold a pen (failing)';

  const containerWidth =
    phase === 'entry'
      ? 'max-w-[460px]'
      : phase === 'result'
        ? 'max-w-[600px]'
        : 'max-w-[500px]';

  return (
    <div className={`mx-auto w-full transition-all duration-200 ${containerWidth}`}>
      {/* Returning-User Hook Toast */}
      {yesterdayHook?.hasYesterday && phase === 'entry' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3"
        >
          {yesterdayHook.drawing && (
            <div className="h-10 w-10 shrink-0 rounded-xl bg-white p-1 ring-1 ring-[#FDBA74]/50">
              <PotatoSvg pathData={yesterdayHook.drawing} className="h-full w-full" />
            </div>
          )}
          <p className="text-xs leading-relaxed text-[#9A3412]">
            <span className="font-bold">Yesterday&apos;s report: </span>
            {yesterdayHook.message}
          </p>
        </motion.div>
      )}

      {/* Clean Uncluttered Status Strip */}
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold tracking-tight text-[#52525B]">
            {mode === 'endless'
              ? `ENDLESS AUDIT #${endlessRound}`
              : `POTETO AUDIT #${formatAuditNumber(activePayload.auditNumber)}`}
          </span>

          {savedDaily && phase === 'result' && (
            <button
              type="button"
              onClick={() => {
                playTick();
                setPhase('entry');
              }}
              className="text-[11px] font-medium text-[#71717A] underline decoration-[#D4D4D8] underline-offset-4 transition hover:text-[#09090B]"
            >
              Home
            </button>
          )}
          {savedDaily && phase === 'entry' && (
            <button
              type="button"
              onClick={() => {
                playTick();
                setMode('daily');
                setFinalResult(savedDaily);
                setPhase('result');
              }}
              className="text-[11px] font-medium text-[#1A73E8] underline decoration-[#BFDBFE] underline-offset-4 transition hover:text-[#1557B0]"
            >
              Today&apos;s ID
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-[#52525B] ring-1 ring-[#E4E4E7] tabular-nums"
            title="Time left until today's human license expires"
          >
            <Clock className="h-3.5 w-3.5 text-[#A1A1AA]" strokeWidth={1.75} />
            {countdown}
          </span>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#71717A] ring-1 ring-[#E4E4E7] transition hover:text-[#09090B]"
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <Volume2 className="h-3.5 w-3.5" strokeWidth={1.75} />
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
          className="flex flex-col items-center py-8 text-center"
        >
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#09090B] sm:text-4xl">
            Prove you&apos;re human
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#71717A]">
            A 90-second daily CAPTCHA audit against a completely unbothered Idaho potato.
          </p>

          {/* Iconic Google reCAPTCHA v2-style Interactive Box with Peeking Potato */}
          <div className="group/box relative mt-12 w-full max-w-[340px]">
            <motion.div
              animate={checkingBox ? { y: -28, rotate: -6 } : { y: -12 }}
              className="pointer-events-none absolute -top-6 right-8 z-0 transition-transform duration-300 group-hover/box:-translate-y-4"
            >
              <OfficialPotatoMascot className="h-14 w-14 drop-shadow-xs" />
            </motion.div>

            <button
              type="button"
              onClick={handleCheckboxClick}
              disabled={checkingBox}
              aria-label="Check I am not a robot to start today's human audit"
              className="group relative z-10 flex w-full items-center justify-between rounded-md border border-[#D3D3D3] bg-[#F9F9F9] px-5 py-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:border-[#B8B8B8] hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-[3px] border-2 transition-colors ${
                    checkingBox
                      ? 'border-transparent bg-transparent'
                      : 'border-[#C1C1C1] bg-white group-hover:border-[#8F8F8F]'
                  }`}
                >
                  {checkingBox && (
                    <Loader2 className="h-6 w-6 animate-spin text-[#1A73E8]" strokeWidth={2.2} />
                  )}
                </span>
                <span className="text-[15px] font-medium text-[#202124]">
                  {checkingBox
                    ? 'Checking starch levels...'
                    : savedDaily
                      ? 'Play Endless Mode'
                      : "I'm not a robot"}
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="h-6 w-6 text-[#1A73E8]" strokeWidth={1.75} />
                <span className="mt-1 text-[9px] font-semibold tracking-tight text-[#555555]">
                  rePOTETO
                </span>
                <span className="text-[7px] text-[#777777]">Privacy - Terms</span>
              </div>
            </button>
          </div>

          <p className="mt-8 font-mono text-xs text-[#A1A1AA]">
            {savedDaily
              ? 'Today\'s audit archived · Check the box for Endless Mode'
              : 'No login · Global daily seed · Resets at UTC 00:00'}
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
          onScoreReveal={upsertStageScore}
          onComplete={handleStage1Done}
        />
      )}

      {/* STAGE 2 */}
      {phase === 'stage2' && (
        <Stage2MicroGames
          key={`s2-${activePayload.seed}-${activePayload.stage2Game.id}`}
          game={activePayload.stage2Game}
          onScoreReveal={upsertStageScore}
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
