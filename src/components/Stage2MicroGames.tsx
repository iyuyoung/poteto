import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  BatteryLow,
  Check,
  CheckCircle2,
  Eye,
  Gift,
  Hand,
  HeartPulse,
  MousePointerClick,
  RefreshCw,
  ScrollText,
  Sparkles,
  Sprout,
  User,
  XCircle,
} from 'lucide-react';
import { OfficialPotatoMascot } from './PotatoSvg';
import { playFail, playPop, playSuccess, playTick } from '../lib/sfx';
import type { Stage2GameMeta, StageResult } from '../lib/types';

interface Stage2Props {
  game: Stage2GameMeta;
  onScoreReveal?: (result: StageResult) => void;
  onComplete: (result: StageResult) => void;
}

/* 1. Stillness 5s — Escalating fake-alert baits! */
const StillnessGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [armed, setArmed] = useState(false);
  const [left, setLeft] = useState(5.0);
  const [baitStep, setBaitStep] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!armed) return;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      const rem = Math.max(0, 5 - elapsed);
      setLeft(rem);
      if (elapsed > 3.3) setBaitStep(3);
      else if (elapsed > 2.0) setBaitStep(2);
      else if (elapsed > 0.9) setBaitStep(1);
      if (rem <= 0 && !doneRef.current) {
        doneRef.current = true;
        window.clearInterval(timer);
        onDoneRef.current(true, 34, 'Survived 3 shameless clickbait popups! Almost as still as a russet.');
      }
    }, 50);

    const fail = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      window.clearInterval(timer);
      onDoneRef.current(false, 12, 'You flinched! Spud #01 won by literally sitting there.');
    };

    const grace = window.setTimeout(() => {
      window.addEventListener('pointermove', fail, { once: true });
      window.addEventListener('touchstart', fail, { once: true });
    }, 380);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(grace);
      window.removeEventListener('pointermove', fail);
      window.removeEventListener('touchstart', fail);
    };
  }, [armed]);

  return (
    <div className="relative flex min-h-44 flex-col items-center justify-center py-3 text-center">
      {!armed ? (
        <>
          <OfficialPotatoMascot className="mb-3 h-20 w-20" />
          <p className="mb-5 max-w-xs text-xs text-[#52525B]">
            Click Start, immediately take your hands off, and ignore every suspicious popup for 5 seconds.
          </p>
          <button
            type="button"
            onClick={() => {
              playTick();
              setArmed(true);
            }}
            className="btn rounded-xl border-0 bg-[#1A73E8] px-6 text-sm font-semibold text-white hover:bg-[#1557B0]"
          >
            <Hand className="h-4 w-4" strokeWidth={1.75} />
            <span>Start 5s Stillness</span>
          </button>
        </>
      ) : (
        <>
          <div className="font-mono text-5xl font-extrabold tracking-tight text-[#1A73E8] tabular-nums">
            {left.toFixed(1)}s
          </div>
          <p className="mt-2 text-xs font-medium text-[#71717A]">
            Hands off. Do not fall for whatever appears below...
          </p>

          {baitStep === 1 && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2 text-xs font-bold text-[#DC2626] shadow-md"
            >
              <BatteryLow className="h-4 w-4" strokeWidth={2} />
              <span>LOW BATTERY: Your mouse is at 1%. Shake to recharge!</span>
            </motion.div>
          )}
          {baitStep === 2 && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="mt-3 flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-xs font-bold text-white shadow-lg"
            >
              <Gift className="h-4 w-4" strokeWidth={2} />
              <span>CONGRATS! Click here to claim +100 Free Human Aura!</span>
            </motion.div>
          )}
          {baitStep === 3 && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
              className="mt-3 rounded-xl bg-[#18181B] px-4 py-2 text-xs font-bold text-white shadow-lg"
            >
              Be honest... does your nose suddenly itch right now?
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

/* 2. Splitting Potatoes — Mitosis + Undercover Human Spy Twist! */
const SplittingPotatoesGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [potatoes, setPotatoes] = useState(4);
  const [hasSpy, setHasSpy] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => {
      playPop(0);
      setPotatoes(6);
    }, 1300);
    const t2 = window.setTimeout(() => {
      playPop(2);
      setHasSpy(true);
    }, 2500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const options = [4, 6, 7, 8];
  return (
    <div className="flex flex-col items-center py-2">
      <div className="mb-3 flex min-h-32 w-full flex-wrap items-center justify-center gap-2 rounded-xl border border-[#E4E4E7] bg-[#FAFAFB] p-4">
        {Array.from({ length: potatoes }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
          >
            <OfficialPotatoMascot className="h-11 w-11" />
          </motion.div>
        ))}
        {hasSpy && (
          <motion.div
            initial={{ scale: 0.2, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-[#EFF6FF] ring-2 ring-[#1A73E8]"
            title="Definitely not a potato"
          >
            <User className="h-5 w-5 text-[#1A73E8]" strokeWidth={2} />
            <span className="text-[8px] font-bold text-[#1D4ED8]">GUY</span>
          </motion.div>
        )}
      </div>
      <p className="mb-3 text-[11px] font-medium text-[#71717A]">
        {hasSpy
          ? 'Count ONLY the real potatoes—don\'t include that undercover guy in blue!'
          : 'Mitosis in progress—track the real potatoes...'}
      </p>
      <div className="grid w-full grid-cols-4 gap-2">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              const exact = n === potatoes;
              onDone(
                exact,
                exact ? 34 : 18,
                exact
                  ? `Eagle eyes! Ignored the undercover human and nailed ${potatoes} real spuds.`
                  : `You picked ${n}, but there were ${potatoes} real potatoes${hasSpy ? ' (the blue guy was a spy!)' : ''}.`
              );
            }}
            className="btn rounded-xl border border-[#D4D4D8] bg-white font-mono text-sm font-bold text-[#18181B] hover:border-[#1A73E8] hover:bg-[#EFF6FF]"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
};

/* 3. Dodging Button — 3-Beat Escalation (Dodge -> Shadow Clones -> Surrender) */
const DodgingButtonGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [beat, setBeat] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [taunt, setTaunt] = useState('Catch me if you can');

  const flee = () => {
    if (beat >= 2) return;
    playPop(beat);
    const next = beat + 1;
    setBeat(next);
    if (next === 1) {
      setPos({ x: 85, y: -38 });
      setTaunt('Too slow, bestie. Shaky hands?');
    } else if (next === 2) {
      setPos({ x: 0, y: 0 });
      setTaunt('Shadow Clone Jutsu! Only one is real.');
    }
  };

  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#FAFAFB] p-3">
        {beat < 2 && (
          <motion.button
            type="button"
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: 'spring', stiffness: 460, damping: 24 }}
            onMouseEnter={flee}
            onClick={flee}
            className="btn rounded-xl border-0 bg-[#1A73E8] px-5 text-xs font-bold text-white shadow-md"
          >
            <MousePointerClick className="h-4 w-4" strokeWidth={1.75} />
            <span>I&apos;m Human</span>
          </motion.button>
        )}

        {beat === 2 && (
          <div className="grid w-full grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                playFail();
                setTaunt('Nope! Decoy clone. Try again!');
              }}
              className="btn btn-sm h-11 rounded-xl border-0 bg-[#1A73E8] text-xs font-bold text-white"
            >
              I&apos;m real
            </button>
            <button
              type="button"
              onClick={() => {
                playPop(2);
                setBeat(3);
                setTaunt('*wheezing* Okay, okay, I\'m out of stamina...');
              }}
              className="btn btn-sm h-11 rounded-xl border-0 bg-[#1A73E8] text-xs font-bold text-white"
            >
              Not me (sweating)
            </button>
            <button
              type="button"
              onClick={() => {
                playFail();
                setTaunt('Fake! Definitely not that one.');
              }}
              className="btn btn-sm h-11 rounded-xl border-0 bg-[#1A73E8] text-xs font-bold text-white"
            >
              Trust me bro
            </button>
          </div>
        )}

        {beat === 3 && (
          <motion.button
            type="button"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={() => onDone(true, 34, 'Saw through the shadow clones and tired out the button. Peak persistence!')}
            className="btn h-12 rounded-xl border-0 bg-[#16A34A] px-6 text-sm font-bold text-white shadow-md hover:bg-[#15803D]"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            <span>Fine, I give up — Verify</span>
          </motion.button>
        )}
      </div>
      <p className="mt-2.5 text-xs font-semibold text-[#52525B]">{taunt}</p>
    </div>
  );
};

/* 4. Don't Press Red — Turns GREEN at 2s and LIES to you! */
const DontPressRedGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [sec, setSec] = useState(5);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = window.setInterval(() => {
      setSec((prev) => {
        if (prev <= 1) {
          window.clearInterval(t);
          if (!doneRef.current) {
            doneRef.current = true;
            window.setTimeout(
              () => onDoneRef.current(true, 34, 'Didn\'t even fall for the fake green switch! Unscammable human.'),
              0
            );
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  const fakeGreen = sec <= 2;
  const labels: Record<number, string> = {
    5: 'DO NOT PRESS THIS',
    4: 'Seriously, do not click it',
    3: 'Wait... what if it gives bonus points?',
    2: 'RULE CHANGED! IT\'S GREEN, CLICK NOW!',
    1: 'LAST SECOND! PRESS THE GREEN BUTTON!!',
  };

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-4 font-mono text-3xl font-extrabold text-[#18181B] tabular-nums">00:0{sec}</div>
      <motion.button
        type="button"
        animate={{ scale: fakeGreen ? 1.06 : 1 }}
        onClick={() => {
          if (doneRef.current) return;
          doneRef.current = true;
          onDone(
            false,
            10,
            fakeGreen
              ? 'LMAO it lied! The rule never changed. Spud #01 is crying laughing.'
              : 'You let the intrusive thoughts win! Spud #01 won by having no fingers.'
          );
        }}
        className={`btn h-14 rounded-2xl border-0 px-6 text-xs font-bold text-white transition-colors sm:text-sm ${
          fakeGreen
            ? 'bg-[#16A34A] shadow-[0_6px_0_#166534]'
            : 'bg-[#DC2626] shadow-[0_6px_0_#991B1B]'
        }`}
      >
        <AlertTriangle className="h-4 w-4" strokeWidth={2} />
        <span>{labels[sec] || labels[5]}</span>
      </motion.button>
    </div>
  );
};

/* 5. Reverse Slider — Spud #01 nudges your slider once when you get close! */
const ReverseSliderGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [raw, setRaw] = useState(15);
  const [nudged, setNudged] = useState(false);
  const display = 100 - raw;
  const inZone = display >= 48 && display <= 52;

  const handleSlide = (val: number) => {
    const nextDisplay = 100 - val;
    if (!nudged && nextDisplay >= 48 && nextDisplay <= 52) {
      setNudged(true);
      playFail();
      setRaw(val > 50 ? val - 14 : val + 14);
      return;
    }
    setRaw(val);
  };

  return (
    <div className="flex flex-col items-center py-3">
      <div className={`mb-1 font-mono text-4xl font-extrabold tabular-nums ${inZone ? 'text-[#16A34A]' : 'text-[#18181B]'}`}>
        {display}%
      </div>
      <p className="mb-4 text-xs text-[#71717A]">
        {nudged
          ? 'Spud #01 nudged your slider! Drag it back into 48%–52%!'
          : 'Target zone: 48% – 52% (track is wired backwards)'}
      </p>
      <input
        type="range"
        min={0}
        max={100}
        value={raw}
        onChange={(e) => handleSlide(Number(e.target.value))}
        className="range range-info w-full max-w-sm"
        aria-label="Inverted calibration slider"
      />
      <button
        type="button"
        onClick={() =>
          onDone(
            inZone,
            inZone ? 34 : 18,
            inZone
              ? `Locked at ${display}% despite potato sabotage! Elite motor control.`
              : `Stopped at ${display}%—just outside the 48%–52% human sweet spot.`
          )
        }
        className="btn mt-5 h-10 rounded-xl border-0 bg-[#1A73E8] px-6 text-xs font-bold text-white hover:bg-[#1557B0]"
      >
        Lock In Reading
      </button>
    </div>
  );
};

/* 6. Fake Loading */
const FakeLoadingGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [pct, setPct] = useState(24);
  const [rushes, setRushes] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = window.setInterval(() => {
      setPct((p) => {
        if (p >= 100) return 100;
        if (p < 96) return p + 15;
        if (p < 99) return p + 1;
        return 100;
      });
    }, 480);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (pct >= 100 && !doneRef.current) {
      doneRef.current = true;
      const passed = rushes === 0;
      onDoneRef.current(
        passed,
        passed ? 34 : 21,
        passed
          ? 'Stared down 99% without poking it once. Almost as patient as a tuber.'
          : `You poked it ${rushes} time${rushes > 1 ? 's' : ''} and spooked the progress bar.`
      );
    }
  }, [pct, rushes]);

  return (
    <div className="flex flex-col items-center py-4">
      <div className="mb-2 flex w-full max-w-sm justify-between font-mono text-xs font-semibold text-[#52525B]">
        <span>{pct >= 96 ? 'Stuck at 99%... wanna poke it?' : 'Verifying human soul integrity...'}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 w-full max-w-sm overflow-hidden rounded-full bg-[#F4F4F5]">
        <div
          className="h-full rounded-full bg-[#1A73E8] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          playFail();
          setRushes((r) => r + 1);
          setPct(8);
        }}
        className="btn btn-sm mt-5 rounded-xl border border-[#D4D4D8] bg-white text-xs text-[#52525B] hover:border-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
      >
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span>Too slow — poke it ({rushes})</span>
      </button>
    </div>
  );
};

/* 7. Potato Blinking — Psychological Fake-outs! */
const PotatoBlinkingGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [holding, setHolding] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [quip, setQuip] = useState('Hold the button to stare. Release the instant it blinks.');
  const blinkedAtRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!holding) return;
    const t1 = window.setTimeout(() => setQuip('Did it twitch? DON\'T LET GO YET!'), 850);
    const delay = 1800 + Math.random() * 1400;
    const t2 = window.setTimeout(() => {
      playPop(2);
      setBlinking(true);
      setQuip('IT BLINKED!! LET GO NOW!!');
      blinkedAtRef.current = performance.now();
    }, delay);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [holding]);

  const release = () => {
    if (!holding || doneRef.current) return;
    doneRef.current = true;
    setHolding(false);
    if (!blinkedAtRef.current) {
      onDone(false, 14, 'Fell for the fake-out! Spud #01 hadn\'t even blinked yet.');
    } else {
      const rt = Math.round(performance.now() - blinkedAtRef.current);
      const passed = rt < 950;
      onDone(
        passed,
        passed ? 34 : 22,
        passed
          ? `${rt}ms reaction time! Survived the mind games and caught the blink.`
          : `${rt}ms reaction time—zoned out for a beat there.`
      );
    }
  };

  return (
    <div className="flex flex-col items-center py-2 text-center">
      <motion.div animate={holding && !blinking ? { rotate: [0, -3, 3, 0] } : undefined} transition={{ repeat: Infinity, duration: 1.6 }}>
        <OfficialPotatoMascot className="mb-3 h-24 w-24" blinking={blinking} />
      </motion.div>
      <p className="mb-4 text-xs font-semibold text-[#52525B]">{quip}</p>
      <button
        type="button"
        onPointerDown={() => {
          playTick();
          setHolding(true);
          setQuip('Lock eyes... don\'t flinch...');
        }}
        onPointerUp={release}
        onPointerCancel={release}
        className={`btn rounded-xl border-0 px-6 text-xs font-bold text-white select-none ${
          blinking ? 'bg-[#16A34A]' : 'bg-[#1A73E8]'
        }`}
      >
        <Eye className="h-4 w-4" strokeWidth={1.75} />
        <span>{holding ? 'Staring... (Release on Blink)' : 'Hold to Stare'}</span>
      </button>
    </div>
  );
};

/* 8. Gravity Checkbox */
const GravityCheckboxGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [x, setX] = useState(20);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const t = window.setInterval(() => {
      setX((prev) => {
        if (prev >= 78) {
          setDir(-1);
          return 76;
        }
        if (prev <= 14) {
          setDir(1);
          return 16;
        }
        return prev + dir * 5.5;
      });
    }, 90);
    return () => window.clearInterval(t);
  }, [dir]);

  return (
    <div className="py-2">
      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#FAFAFB]">
        <motion.button
          type="button"
          animate={{ left: `${x}%`, y: [0, -26, 0] }}
          transition={{ y: { repeat: Infinity, duration: 0.65, ease: 'easeInOut' } }}
          onClick={() => onDone(true, 34, 'Caught the runaway checkbox mid-air! Superior primate reflexes.')}
          style={{ position: 'absolute', bottom: '18px' }}
          className="flex -translate-x-1/2 items-center gap-2 rounded-xl border-2 border-[#1A73E8] bg-white px-3.5 py-2 text-xs font-bold text-[#18181B] shadow-md"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded border border-[#1A73E8]" />
          <span>Check me</span>
        </motion.button>
      </div>
    </div>
  );
};

/* 9. Tiny Target (Sprout) */
const TinyTargetGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [hits, setHits] = useState(0);
  const positions = [
    { top: '24%', left: '26%' },
    { top: '66%', left: '72%' },
    { top: '42%', left: '50%' },
  ];
  const cur = positions[hits] || positions[2];

  return (
    <div className="py-2">
      <div className="relative h-40 w-full rounded-xl border border-[#E4E4E7] bg-[#FAFAFB]">
        <button
          type="button"
          style={{ top: cur.top, left: cur.left }}
          onClick={() => {
            playPop(hits);
            if (hits >= 2) {
              onDone(true, 34, 'De-sprouted 3/3 before it gained consciousness. Crisis averted!');
            } else {
              setHits((h) => h + 1);
            }
          }}
          className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#16A34A] bg-[#DCFCE7] text-[#15803D] shadow-sm transition hover:scale-110"
          aria-label="Click potato sprout"
        >
          <Sprout className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
      <p className="mt-2 text-center font-mono text-[11px] text-[#71717A]">Sprouts zapped: {hits} / 3</p>
    </div>
  );
};

/* 10. Typing Panic — Mischievous Word Theft Twist ("I AM NOT A SPUD" -> "DEFINITELY")! */
const TypingPanicGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const target = ['I', 'AM', 'NOT', 'A', 'SPUD'];
  const [tiles, setTiles] = useState(['NOT', 'SPUD', 'I', 'A', 'AM']);
  const [picked, setPicked] = useState<string[]>([]);
  const [thiefActive, setThiefActive] = useState(false);

  const tapTile = (word: string) => {
    const nextIdx = picked.length;
    if (word === target[nextIdx]) {
      playPop(nextIdx);
      const nextPicked = [...picked, word];
      setPicked(nextPicked);
      if (nextPicked.length === target.length) {
        onDone(true, 34, 'Slapped the thief and declared "I AM NOT A SPUD" under pressure!');
        return;
      }
      // After tapping "AM", Spud #01 steals "NOT" and swaps in "DEFINITELY"!
      if (nextPicked.length === 2 && !thiefActive) {
        setThiefActive(true);
        playFail();
        setTiles((prev) => prev.map((w) => (w === 'NOT' ? 'DEFINITELY' : w)));
      }
    } else {
      playFail();
      onDone(
        false,
        15,
        word === 'DEFINITELY'
          ? 'LMAO gotcha! You literally just confessed "I AM DEFINITELY A SPUD"!'
          : `Tapped "${word}" out of order—grammar module failed!`
      );
    }
  };

  const slapThief = () => {
    playPop(2);
    setThiefActive(false);
    setTiles((prev) => prev.map((w) => (w === 'DEFINITELY' ? 'NOT' : w)).reverse());
  };

  return (
    <div className="flex flex-col items-center py-2">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5">
        {target.map((w, idx) => {
          const filled = idx < picked.length;
          return (
            <div
              key={idx}
              className={`flex h-10 min-w-[44px] items-center justify-center rounded-xl border-2 px-2.5 font-mono text-xs font-bold transition ${
                filled
                  ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                  : 'border-dashed border-[#D4D4D8] bg-[#FAFAFB] text-[#A1A1AA]'
              }`}
            >
              {filled ? w : '___'}
            </div>
          );
        })}
      </div>

      {thiefActive && (
        <motion.button
          type="button"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={slapThief}
          className="mb-3 flex items-center gap-2 rounded-xl border border-[#FDBA74] bg-[#FFF7ED] px-3 py-1.5 text-xs font-bold text-[#C2410C] shadow-xs hover:bg-[#FFEDD5]"
        >
          <OfficialPotatoMascot className="h-6 w-6" />
          <span>Spud #01 swapped &quot;NOT&quot; for &quot;DEFINITELY&quot;! Click to bonk it!</span>
        </motion.button>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {tiles.map((w, idx) => {
          const used = picked.includes(w);
          return (
            <button
              key={`${w}-${idx}`}
              type="button"
              disabled={used}
              onClick={() => tapTile(w)}
              className={`btn h-10 rounded-xl border bg-white px-3.5 font-mono text-xs font-bold shadow-xs disabled:opacity-30 ${
                w === 'DEFINITELY'
                  ? 'border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2]'
                  : 'border-[#D4D4D8] text-[#18181B] hover:border-[#1A73E8] hover:bg-[#EFF6FF]'
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* 11. Liar Buttons */
const LiarButtonsGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => (
  <div className="grid grid-cols-1 gap-2.5 py-3 sm:grid-cols-2">
    <button
      type="button"
      onClick={() => onDone(false, 18, 'Hubris detected! Audit penalty for main-character syndrome.')}
      className="btn h-auto rounded-xl border border-[#D4D4D8] bg-white py-4 text-xs font-bold text-[#18181B] hover:border-[#18181B] hover:bg-[#FAFAFB]"
    >
      Obviously, I&apos;m built different
    </button>
    <button
      type="button"
      onClick={() => onDone(true, 34, 'Humble legend. Self-awareness is peak humanity.')}
      className="btn h-auto rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] py-4 text-xs font-bold text-[#1D4ED8] hover:bg-[#DBEAFE]"
    >
      On Monday mornings, debatable
    </button>
  </div>
);

/* 12. Soundless Rhythm */
const SoundlessRhythmGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [taps, setTaps] = useState<number[]>([]);

  const handleTap = () => {
    playPop(taps.length);
    const now = performance.now();
    const next = [...taps, now];
    setTaps(next);
    if (next.length >= 3) {
      const avg = Math.round(((next[1] - next[0]) + (next[2] - next[1])) / 2);
      const passed = avg >= 550 && avg <= 1650;
      onDone(
        passed,
        passed ? 33 : 19,
        passed
          ? `Avg ${avg}ms interval—detected an authentic, slightly imperfect human pulse.`
          : `Avg ${avg}ms interval—either a metronome bot or 4 espressos deep.`
      );
    }
  };

  return (
    <div className="flex flex-col items-center py-3 text-center">
      <button
        type="button"
        onClick={handleTap}
        className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#BFDBFE] bg-[#EFF6FF] text-[#1A73E8] shadow-sm transition active:scale-95"
      >
        <HeartPulse className="h-10 w-10" strokeWidth={1.75} />
      </button>
      <p className="mt-3 font-mono text-xs font-semibold text-[#52525B]">
        Tap 3 times ~1s apart ({taps.length} / 3)
      </p>
    </div>
  );
};

/* 13. Scroll Trap */
const ScrollTrapGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => (
  <div className="py-1">
    <div className="h-44 overflow-y-auto rounded-xl border border-[#E4E4E7] bg-[#FAFAFB] p-4 text-left text-xs leading-relaxed text-[#52525B]">
      <p className="mb-2 flex items-center gap-1.5 font-bold text-[#18181B]">
        <ScrollText className="h-4 w-4" strokeWidth={1.75} />
        2026 Human License Renewal EULA
      </p>
      <p className="mb-2">Section 1: I confirm I drank water today and did not attempt photosynthesis for lunch.</p>
      <p className="mb-2">Section 2: I respect Control Potato (Spud #01)&apos;s right to remain silently unbothered.</p>
      <div className="my-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-center">
        <p className="mb-2 font-semibold text-[#15803D]">Hidden Real Clause: You actually read it!</p>
        <button
          type="button"
          onClick={() => onDone(true, 34, 'Wait, you actually read the EULA and found the real button?! Rare human.')}
          className="btn btn-sm rounded-lg border-0 bg-[#16A34A] text-white"
        >
          I Agree to Stay Human
        </button>
      </div>
      <p className="mb-2">Section 3: The following filler text exists solely to catch people who blindly scroll down.</p>
      <p className="mb-4">Section 4: Seriously, do NOT click the button at the bottom. It is a trap.</p>
      <button
        type="button"
        onClick={() => onDone(false, 15, 'Busted! You scrolled straight to the bottom without reading a single word.')}
        className="btn btn-sm w-full rounded-lg border-[#D4D4D8] bg-white text-[#71717A]"
      >
        Accept Blindly (Trap)
      </button>
    </div>
  </div>
);

/* 14. Drag to Peel — Russian Nesting Doll Potato! */
const DragToPeelGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [peels, setPeels] = useState(0);
  const lastXRef = useRef<number | null>(null);
  const accRef = useRef(0);
  const doneRef = useRef(false);

  const layerLabels = [
    'Layer 1: Standard Idaho Russet (rub left-right to peel)',
    'Layer 2: Wait... another potato underneath? Keep peeling!',
    'Layer 3: Bro it\'s literally potatoes all the way down...',
    'Tiny note inside: "Stop peeling me, I am infinite."',
  ];

  const handleMove = (e: React.PointerEvent) => {
    if (doneRef.current) return;
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    if (lastXRef.current !== null) {
      accRef.current += Math.abs(e.clientX - lastXRef.current);
      if (accRef.current > 90) {
        accRef.current = 0;
        const next = peels + 1;
        playPop(next - 1);
        setPeels(next);
        if (next >= 3 && !doneRef.current) {
          doneRef.current = true;
          onDone(true, 34, 'Peeled 3 nesting-doll layers and confirmed opposable thumbs!');
        }
      }
    }
    lastXRef.current = e.clientX;
  };

  return (
    <div className="flex flex-col items-center py-2">
      <div
        onPointerMove={handleMove}
        onPointerUp={() => {
          lastXRef.current = null;
        }}
        className="flex h-36 w-full max-w-xs cursor-grab touch-none flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D4D4D8] bg-[#FAFAFB] select-none active:cursor-grabbing"
      >
        <motion.div key={peels} initial={{ scale: 0.75, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}>
          <OfficialPotatoMascot className="h-20 w-20" sprout={peels >= 2} />
        </motion.div>
        <span className="mt-1 px-2 text-center text-[11px] font-medium text-[#52525B]">
          {layerLabels[Math.min(3, peels)]}
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 font-mono text-xs font-semibold text-[#52525B]">
        <Sparkles className="h-3.5 w-3.5 text-[#1A73E8]" strokeWidth={1.75} />
        <span>Layers peeled: {Math.min(3, peels)} / 3</span>
      </div>
    </div>
  );
};

/* 15. Spot the Human */
const SpotTheHumanGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const items = [
    { id: 'p1', label: 'Spud A', isHuman: false },
    { id: 'p2', label: 'Spud B', isHuman: false },
    { id: 'p3', label: 'Spud C', isHuman: false },
    { id: 'me', label: 'You (allegedly)', isHuman: true },
    { id: 'p4', label: 'Spud D', isHuman: false },
    { id: 'p5', label: 'Spud E', isHuman: false },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() =>
            onDone(
              item.isHuman,
              item.isHuman ? 34 : 16,
              item.isHuman
                ? 'Congrats, you recognized yourself in the mirror! Self-awareness intact.'
                : `You mistook "${item.label}" for a human. Concerning.`
            )
          }
          className="flex flex-col items-center justify-center rounded-xl border border-[#E4E4E7] bg-[#FAFAFB] p-3 transition hover:border-[#1A73E8] hover:bg-white"
        >
          {item.isHuman ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1A73E8]">
              <User className="h-5 w-5" strokeWidth={1.75} />
            </div>
          ) : (
            <OfficialPotatoMascot className="h-11 w-11" />
          )}
          <span className="mt-1.5 text-[11px] font-medium text-[#52525B]">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

/* 16. Absurd Traffic Light */
const TrafficLightAbsurdGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const tiles = [
    'Empty coffee mug',
    '99+ Slack pings',
    '7:00 AM alarm',
    'Unbothered Potato',
    'Blank slide deck',
    'Reply-all email',
  ];
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (t: string) => {
    playPop(picked.length);
    setPicked((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div className="py-2">
      <div className="grid grid-cols-3 gap-2">
        {tiles.map((t) => {
          const active = picked.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className={`relative rounded-xl border-2 px-2 py-4 text-xs font-semibold transition ${
                active
                  ? 'border-[#1A73E8] bg-[#EFF6FF] text-[#1D4ED8]'
                  : 'border-[#F4F4F5] bg-[#FAFAFB] text-[#52525B] hover:border-[#D4D4D8] hover:bg-white'
              }`}
            >
              {active && <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5" strokeWidth={2.5} />}
              {t}
            </button>
          );
        })}
      </div>
      <div className="mt-3.5 flex justify-end">
        <button
          type="button"
          onClick={() => {
            const pickedPotato = picked.includes('Unbothered Potato');
            const passed = picked.length > 0 && !pickedPotato;
            onDone(
              passed,
              passed ? 34 : 20,
              passed
                ? 'Valid existential dread detected. Meanwhile, Spud #01 feels nothing.'
                : 'Potatoes don\'t get Sunday Scaries—stop projecting on root vegetables.'
            );
          }}
          className="btn btn-sm h-9 rounded-xl border-0 bg-[#1A73E8] px-5 text-xs font-bold text-white"
        >
          Submit Vibes
        </button>
      </div>
    </div>
  );
};

export const Stage2MicroGames: React.FC<Stage2Props> = ({
  game,
  onScoreReveal,
  onComplete,
}) => {
  const [revealedResult, setRevealedResult] = useState<StageResult | null>(null);

  const handleDone = (passed: boolean, humanScore: number, summary: string) => {
    if (revealedResult) return;
    if (passed) playSuccess();
    else playFail();
    const res: StageResult = {
      stage: 2,
      passed,
      humanScore,
      potatoScore: passed ? 28 : 34,
      summary,
    };
    setRevealedResult(res);
    onScoreReveal?.(res);
  };

  const renderGame = () => {
    switch (game.id) {
      case 'stillness-5s':
        return <StillnessGame onDone={handleDone} />;
      case 'splitting-potatoes':
        return <SplittingPotatoesGame onDone={handleDone} />;
      case 'dodging-button':
        return <DodgingButtonGame onDone={handleDone} />;
      case 'dont-press-red':
        return <DontPressRedGame onDone={handleDone} />;
      case 'reverse-slider':
        return <ReverseSliderGame onDone={handleDone} />;
      case 'fake-loading':
        return <FakeLoadingGame onDone={handleDone} />;
      case 'potato-blinking':
        return <PotatoBlinkingGame onDone={handleDone} />;
      case 'gravity-checkbox':
        return <GravityCheckboxGame onDone={handleDone} />;
      case 'tiny-target':
        return <TinyTargetGame onDone={handleDone} />;
      case 'typing-panic':
        return <TypingPanicGame onDone={handleDone} />;
      case 'liar-buttons':
        return <LiarButtonsGame onDone={handleDone} />;
      case 'soundless-rhythm':
        return <SoundlessRhythmGame onDone={handleDone} />;
      case 'scroll-trap':
        return <ScrollTrapGame onDone={handleDone} />;
      case 'drag-to-peel':
        return <DragToPeelGame onDone={handleDone} />;
      case 'spot-the-human':
        return <SpotTheHumanGame onDone={handleDone} />;
      case 'traffic-light-absurd':
      default:
        return <TrafficLightAbsurdGame onDone={handleDone} />;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-3xl border border-[#E4E4E7] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
    >
      {/* Clean Blue Verification Header */}
      <div className="bg-[#1A73E8] px-6 py-4 text-white">
        <div className="text-xs font-medium text-white/80">
          STAGE 2 OF 3 · ANTI-INTUITION AUDIT
        </div>
        <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
          {game.title}
        </h2>
        <p className="mt-0.5 text-xs text-white/85">{game.instruction}</p>
      </div>

      <div className="p-5 sm:p-6">
        {!revealedResult ? (
          <>
            <div className="flex min-h-[164px] flex-col justify-center">{renderGame()}</div>
            <p className="mt-4 rounded-xl bg-[#FAFAFB] px-4 py-2.5 text-xs text-[#71717A]">
              Control Note: {game.potatoQuip}
            </p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-7 text-center"
          >
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-sm ${
                revealedResult.passed ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              }`}
            >
              {revealedResult.passed ? (
                <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
              ) : (
                <XCircle className="h-7 w-7" strokeWidth={2} />
              )}
            </div>

            <span
              className={`rounded-full px-3 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase ${
                revealedResult.passed
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : 'bg-[#FEE2E2] text-[#DC2626]'
              }`}
            >
              {revealedResult.passed ? 'PASSED' : 'OUTPLAYED BY A SPUD'}
            </span>

            <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-[#18181B]">
              {revealedResult.summary}
            </p>

            {/* Clean Side-by-Side Score Delta */}
            <div className="mt-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#EFF6FF] px-4 py-2 text-center">
                <span className="block text-[10px] font-medium text-[#3B82F6]">YOU</span>
                <span className="font-mono text-lg font-bold text-[#1D4ED8] tabular-nums">
                  +{revealedResult.humanScore}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#D4D4D8]">VS</span>
              <div className="rounded-xl bg-[#FAFAFB] px-4 py-2 text-center ring-1 ring-[#E4E4E7]">
                <span className="block text-[10px] font-medium text-[#71717A]">SPUD #01</span>
                <span className="font-mono text-lg font-bold text-[#18181B] tabular-nums">
                  +{revealedResult.potatoScore}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTick();
                onComplete(revealedResult);
              }}
              className="btn mt-6 h-10 rounded-xl border-0 bg-[#18181B] px-7 text-sm font-semibold text-white hover:bg-[#27272A]"
            >
              Stage 3: Sketch Your ID
            </button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
