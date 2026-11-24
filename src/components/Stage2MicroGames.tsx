import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
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
  onComplete: (result: StageResult) => void;
}

/* 1. Stillness 5s — Escalating fake-alert baits! */
const StillnessGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [armed, setArmed] = useState(false);
  const [left, setLeft] = useState(5.0);
  const [baitStep, setBaitStep] = useState(0);
  const doneRef = useRef(false);

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
        onDone(true, 34, '顶住了 3 波离谱弹窗诱惑！你的定力勉强追平一颗土豆。');
      }
    }, 50);

    const fail = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      window.clearInterval(timer);
      onDone(false, 12, '上当了！你一动，Poteto #01 靠全程装死轻松躺赢。');
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
  }, [armed, onDone]);

  return (
    <div className="relative flex min-h-48 flex-col items-center justify-center py-4 text-center">
      {!armed ? (
        <>
          <OfficialPotatoMascot className="mb-3 h-20 w-20" />
          <p className="mb-5 max-w-xs text-xs text-[#52525B]">
            点击开始后立刻松开鼠标/手指，无视接下来出现的一切离谱弹窗，保持静止 5 秒。
          </p>
          <button
            type="button"
            onClick={() => {
              playTick();
              setArmed(true);
            }}
            className="btn rounded-xl border-0 bg-[#1A73E8] px-6 text-sm font-semibold text-white hover:bg-[#1557B0]"
          >
            <Hand className="h-4 w-4" strokeWidth={2} />
            <span>开始 5 秒静止挑战</span>
          </button>
        </>
      ) : (
        <>
          <div className="font-mono text-5xl font-extrabold tracking-tight text-[#1A73E8]">
            {left.toFixed(1)}s
          </div>
          <p className="mt-2 text-xs font-medium text-[#71717A]">
            双手离开设备，千万别被下面的东西骗了…
          </p>

          {baitStep === 1 && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2 text-xs font-bold text-[#DC2626] shadow-md"
            >
              <BatteryLow className="h-4 w-4" strokeWidth={2.2} />
              <span>系统警告：你的鼠标电量仅剩 1%！快晃一下充电！</span>
            </motion.div>
          )}
          {baitStep === 2 && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="mt-3 flex items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-xs font-bold text-white shadow-lg"
            >
              <Gift className="h-4 w-4" strokeWidth={2.2} />
              <span>恭喜中奖！点这里免费领取 100 人类纯度！</span>
            </motion.div>
          )}
          {baitStep === 3 && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
              className="mt-3 rounded-xl bg-[#18181B] px-4 py-2 text-xs font-bold text-white shadow-lg"
            >
              别忍了！你的鼻尖是不是突然有点痒？
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

/* 2. Splitting Potatoes — Mitosis + Undercover Rock Twist! */
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
      <div className="mb-3 flex min-h-36 w-full flex-wrap items-center justify-center gap-2 rounded-xl border border-[#E4E4E7] bg-[#FAFAFB] p-4">
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
            title="我不是土豆，我是卧底人类"
          >
            <User className="h-5 w-5 text-[#1A73E8]" strokeWidth={2.2} />
            <span className="text-[8px] font-bold text-[#1D4ED8]">卧底</span>
          </motion.div>
        )}
      </div>
      <p className="mb-3 text-[11px] font-medium text-[#71717A]">
        {hasSpy ? '注意！只数真正的土豆，别把混进来的蓝衣卧底算进去！' : '正在分裂中，盯紧真正的土豆数量…'}
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
                  ? `眼神太毒了！精准剔除卧底，报出 ${potatoes} 颗真土豆！`
                  : `你选了 ${n} 颗，实际真土豆是 ${potatoes} 颗${hasSpy ? '（那个蓝色小人是卧底！）' : ''}。`
              );
            }}
            className="btn rounded-xl border border-[#D4D4D8] bg-white font-mono text-sm font-bold text-[#18181B] hover:border-[#1A73E8] hover:bg-[#EFF6FF]"
          >
            {n} 颗
          </button>
        ))}
      </div>
    </div>
  );
};

/* 3. Dodging Button — 3-Beat Escalation (Dodge -> Shadow Clones -> Surrender) */
const DodgingButtonGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [beat, setBeat] = useState(0); // 0,1 = dodging; 2 = 3 clones!; 3 = tired real button
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [taunt, setTaunt] = useState('抓得到我算你赢');

  const flee = () => {
    if (beat >= 2) return;
    playPop(beat);
    const next = beat + 1;
    setBeat(next);
    if (next === 1) {
      setPos({ x: 85, y: -38 });
      setTaunt('太慢了！手抖了吗？');
    } else if (next === 2) {
      setPos({ x: 0, y: 0 });
      setTaunt('影分身之术！只有一个是真的！');
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
            <MousePointerClick className="h-4 w-4" strokeWidth={2} />
            <span>点我证明你是人类</span>
          </motion.button>
        )}

        {beat === 2 && (
          <div className="grid w-full grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                playFail();
                setTaunt('哈哈！这是假分身！再猜！');
              }}
              className="btn btn-sm h-11 rounded-xl border-0 bg-[#1A73E8] text-xs font-bold text-white"
            >
              我是真的
            </button>
            <button
              type="button"
              onClick={() => {
                playPop(2);
                setBeat(3);
                setTaunt('呼…呼…被你识破了，我跑不动了');
              }}
              className="btn btn-sm h-11 rounded-xl border-0 bg-[#1A73E8] text-xs font-bold text-white"
            >
              别点我(汗)
            </button>
            <button
              type="button"
              onClick={() => {
                playFail();
                setTaunt('笨！左边那个才像假的，不对…');
              }}
              className="btn btn-sm h-11 rounded-xl border-0 bg-[#1A73E8] text-xs font-bold text-white"
            >
              点我才对
            </button>
          </div>
        )}

        {beat === 3 && (
          <motion.button
            type="button"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={() => onDone(true, 34, '识破了影分身还把按钮追到投降，碳基执念拉满！')}
            className="btn h-12 rounded-xl border-0 bg-[#16A34A] px-6 text-sm font-bold text-white shadow-md hover:bg-[#15803D]"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            <span>行吧我投降，点我过关</span>
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

  useEffect(() => {
    const t = window.setInterval(() => {
      setSec((prev) => {
        if (prev <= 1) {
          window.clearInterval(t);
          if (!doneRef.current) {
            doneRef.current = true;
            onDone(true, 34, '连它变成绿色撒谎都没骗到你！人类防诈骗模范！');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [onDone]);

  const fakeGreen = sec <= 2;
  const labels: Record<number, string> = {
    5: '绝对不要点我',
    4: '真的别点，点了直接判负',
    3: '好吧，其实按一下有隐藏加分？',
    2: '规则改了！已变绿，现在快点我！',
    1: '最后 1 秒！快点绿按钮！！',
  };

  return (
    <div className="flex flex-col items-center py-5 text-center">
      <div className="mb-4 font-mono text-3xl font-extrabold text-[#18181B]">00:0{sec}</div>
      <motion.button
        type="button"
        animate={{ scale: fakeGreen ? 1.08 : 1 }}
        onClick={() => {
          if (doneRef.current) return;
          doneRef.current = true;
          onDone(
            false,
            10,
            fakeGreen
              ? '哈哈哈哈它变绿是骗你的！规则根本没改！Poteto #01 笑到发芽！'
              : '你还是忍不住手贱点了红按钮！Poteto #01 靠没有手指完胜。'
          );
        }}
        className={`btn h-14 rounded-2xl border-0 px-7 text-sm font-bold text-white transition-colors ${
          fakeGreen
            ? 'bg-[#16A34A] shadow-[0_6px_0_#166534]'
            : 'bg-[#DC2626] shadow-[0_6px_0_#991B1B]'
        }`}
      >
        <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
        <span>{labels[sec] || labels[5]}</span>
      </motion.button>
    </div>
  );
};

/* 5. Reverse Slider — Poteto #01 nudges your slider once when you get close! */
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
    <div className="flex flex-col items-center py-4">
      <div className={`mb-1 font-mono text-4xl font-extrabold ${inZone ? 'text-[#16A34A]' : 'text-[#18181B]'}`}>
        {display}%
      </div>
      <p className="mb-4 text-xs text-[#71717A]">
        {nudged
          ? 'Poteto #01 刚刚偷推了你的滑块！再调回 48%~52%！'
          : '目标区间：48% ~ 52%（注意：方向是反的）'}
      </p>
      <input
        type="range"
        min={0}
        max={100}
        value={raw}
        onChange={(e) => handleSlide(Number(e.target.value))}
        className="range range-info w-full max-w-sm"
        aria-label="反直觉纯度滑块"
      />
      <button
        type="button"
        onClick={() =>
          onDone(
            inZone,
            inZone ? 34 : 18,
            inZone
              ? `顶住土豆捣乱精准停在 ${display}%！小脑控制力满分。`
              : `你停在了 ${display}%，差一点点就能卡进 48%~52%。`
          )
        }
        className="btn mt-5 rounded-xl border-0 bg-[#1A73E8] px-6 text-xs font-bold text-white hover:bg-[#1557B0]"
      >
        <span>锁定当前读数</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
      </button>
    </div>
  );
};

/* 6. Fake Loading */
const FakeLoadingGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [pct, setPct] = useState(24);
  const [rushes, setRushes] = useState(0);
  const doneRef = useRef(false);

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
      onDone(
        passed,
        passed ? 34 : 21,
        passed
          ? '卡在 99% 都没点「催一下」，你的耐心已经接近一颗成熟的土豆。'
          : `你忍不住催了 ${rushes} 次，进度条被你吓得反复回滚。`
      );
    }
  }, [pct, rushes, onDone]);

  return (
    <div className="flex flex-col items-center py-5">
      <div className="mb-2 flex w-full max-w-sm justify-between font-mono text-xs font-semibold text-[#52525B]">
        <span>{pct >= 96 ? '卡在 99% 了…要不催一下？' : '正在核验人类灵魂完整性…'}</span>
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
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
        <span>太慢了，催一下 ({rushes})</span>
      </button>
    </div>
  );
};

/* 7. Potato Blinking — Psychological Fake-outs! */
const PotatoBlinkingGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [holding, setHolding] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [quip, setQuip] = useState('长按按钮与土豆对视，它眨眼瞬间立刻松手');
  const blinkedAtRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!holding) return;
    const t1 = window.setTimeout(() => setQuip('它嘴角抽了一下…别松手！还没眨！'), 850);
    const delay = 1800 + Math.random() * 1400;
    const t2 = window.setTimeout(() => {
      playPop(2);
      setBlinking(true);
      setQuip('眨眼了！！快松手！！');
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
      onDone(false, 14, '假动作骗到你了！土豆根本还没眨眼！');
    } else {
      const rt = Math.round(performance.now() - blinkedAtRef.current);
      const passed = rt < 950;
      onDone(
        passed,
        passed ? 34 : 22,
        passed
          ? `反应时间 ${rt}ms！识破假动作并在土豆眨眼瞬间成功抽身！`
          : `反应时间 ${rt}ms，你发呆了半拍。`
      );
    }
  };

  return (
    <div className="flex flex-col items-center py-3 text-center">
      <motion.div animate={holding && !blinking ? { rotate: [0, -3, 3, 0] } : undefined} transition={{ repeat: Infinity, duration: 1.6 }}>
        <OfficialPotatoMascot className="mb-3 h-24 w-24" blinking={blinking} />
      </motion.div>
      <p className="mb-4 text-xs font-semibold text-[#52525B]">{quip}</p>
      <button
        type="button"
        onPointerDown={() => {
          playTick();
          setHolding(true);
          setQuip('死死盯住它，别被假动作骗了…');
        }}
        onPointerUp={release}
        onPointerCancel={release}
        className={`btn rounded-xl border-0 px-6 text-xs font-bold text-white select-none ${
          blinking ? 'bg-[#16A34A]' : 'bg-[#1A73E8]'
        }`}
      >
        <Eye className="h-4 w-4" strokeWidth={2} />
        <span>{holding ? '对视中（眨眼即松手）' : '按住开始对视'}</span>
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
          onClick={() => onDone(true, 34, '精准捕获失控勾选框！手眼协调度击败了块茎。')}
          style={{ position: 'absolute', bottom: '18px' }}
          className="flex -translate-x-1/2 items-center gap-2 rounded-xl border-2 border-[#1A73E8] bg-white px-3.5 py-2 text-xs font-bold text-[#18181B] shadow-md"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded border border-[#1A73E8]" />
          <span>点我勾选</span>
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
      <div className="relative h-44 w-full rounded-xl border border-[#E4E4E7] bg-[#FAFAFB]">
        <button
          type="button"
          style={{ top: cur.top, left: cur.left }}
          onClick={() => {
            playPop(hits);
            if (hits >= 2) {
              onDone(true, 34, '成功掐掉 3 处顽固土豆芽，精准度满分！');
            } else {
              setHits((h) => h + 1);
            }
          }}
          className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#16A34A] bg-[#DCFCE7] text-[#15803D] shadow-sm transition hover:scale-110"
          aria-label="点击土豆芽"
        >
          <Sprout className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>
      <p className="mt-2 text-center font-mono text-[11px] text-[#71717A]">已掐芽：{hits} / 3</p>
    </div>
  );
};

/* 10. Typing Panic — Mischievous Tile Theft Twist! */
const TypingPanicGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const target = ['我', '不', '是', '土', '豆'];
  const [tiles, setTiles] = useState(['不', '土', '我', '豆', '是']);
  const [picked, setPicked] = useState<string[]>([]);
  const [thiefActive, setThiefActive] = useState(false);

  const tapTile = (char: string) => {
    const nextIdx = picked.length;
    if (char === target[nextIdx]) {
      playPop(nextIdx);
      const nextPicked = [...picked, char];
      setPicked(nextPicked);
      if (nextPicked.length === target.length) {
        onDone(true, 34, '拍飞了偷字土豆，坚定拼出了「我不是土豆」！');
        return;
      }
      // After tapping "我", Poteto #01 steals "不" and leaves "真" instead!
      if (nextPicked.length === 1 && !thiefActive) {
        setThiefActive(true);
        playFail();
        setTiles((prev) => prev.map((c) => (c === '不' ? '真' : c)));
      }
    } else {
      playFail();
      onDone(
        false,
        15,
        char === '真'
          ? '哈哈哈你中计了！居然自己点出了「我真是土豆」！'
          : `手滑点到了「${char}」，拼写彻底崩溃！`
      );
    }
  };

  const slapThief = () => {
    playPop(2);
    setThiefActive(false);
    setTiles((prev) => prev.map((c) => (c === '真' ? '不' : c)).reverse());
  };

  return (
    <div className="flex flex-col items-center py-3">
      <div className="mb-3 flex items-center gap-2">
        {target.map((ch, idx) => {
          const filled = idx < picked.length;
          return (
            <div
              key={idx}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 font-display text-base font-bold transition ${
                filled
                  ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                  : 'border-dashed border-[#D4D4D8] bg-[#FAFAFB] text-[#D4D4D8]'
              }`}
            >
              {filled ? ch : '?'}
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
          <span>Poteto #01 把「不」偷换成了「真」！点它抢回来！</span>
        </motion.button>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {tiles.map((ch, idx) => {
          const used = picked.includes(ch);
          return (
            <button
              key={`${ch}-${idx}`}
              type="button"
              disabled={used}
              onClick={() => tapTile(ch)}
              className="btn h-11 w-11 rounded-xl border border-[#D4D4D8] bg-white font-display text-base font-bold text-[#18181B] shadow-xs hover:border-[#1A73E8] hover:bg-[#EFF6FF] disabled:opacity-30"
            >
              {ch}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* 11. Liar Buttons */
const LiarButtonsGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => (
  <div className="grid grid-cols-1 gap-2.5 py-4 sm:grid-cols-2">
    <button
      type="button"
      onClick={() => onDone(false, 18, '过度自信触发了年审警报！谦虚是人类的重要美德。')}
      className="btn h-auto rounded-xl border border-[#D4D4D8] bg-white py-4 text-xs font-bold text-[#18181B] hover:border-[#18181B] hover:bg-[#FAFAFB]"
    >
      我绝对碾压这颗土豆
    </button>
    <button
      type="button"
      onClick={() => onDone(true, 34, '诚实且懂得尊重淀粉生命，年审局破例给予高分！')}
      className="btn h-auto rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] py-4 text-xs font-bold text-[#1D4ED8] hover:bg-[#DBEAFE]"
    >
      某些周一早晨我确实不如它
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
          ? `平均间隔 ${avg}ms，检测到真实而略带瑕疵的碳基心跳！`
          : `平均间隔 ${avg}ms，节奏过于离谱，疑似发条青蛙。`
      );
    }
  };

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <button
        type="button"
        onClick={handleTap}
        className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#BFDBFE] bg-[#EFF6FF] text-[#1A73E8] shadow-sm transition active:scale-95"
      >
        <HeartPulse className="h-10 w-10" strokeWidth={2} />
      </button>
      <p className="mt-3 font-mono text-xs font-semibold text-[#52525B]">
        以约 1 秒节奏轻点 3 次（{taps.length} / 3）
      </p>
    </div>
  );
};

/* 13. Scroll Trap */
const ScrollTrapGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => (
  <div className="py-2">
    <div className="h-44 overflow-y-auto rounded-xl border border-[#E4E4E7] bg-[#FAFAFB] p-4 text-left text-xs leading-relaxed text-[#52525B]">
      <p className="mb-2 flex items-center gap-1.5 font-bold text-[#18181B]">
        <ScrollText className="h-4 w-4" strokeWidth={2} />
        《2026 人类临时续费协议》
      </p>
      <p className="mb-2">第一条：本人承诺今日已摄入水分，且未试图通过光合作用替代午饭。</p>
      <p className="mb-2">第二条：本人尊重北海道对照组土豆（Poteto #01）的沉默权与发芽权。</p>
      <div className="my-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-center">
        <p className="mb-2 font-semibold text-[#15803D]">隐藏真条款：你真的在认真读！</p>
        <button
          type="button"
          onClick={() => onDone(true, 34, '你居然真的读了条款并找到了隐藏确认键，人类之光！')}
          className="btn btn-sm rounded-lg border-0 bg-[#16A34A] text-white"
        >
          我同意继续做人
        </button>
      </div>
      <p className="mb-2">第三条：以下内容专为习惯无脑滑到底部的人类准备。</p>
      <p className="mb-4">第四条：真的不要点最下面那个按钮，那是陷阱。</p>
      <button
        type="button"
        onClick={() => onDone(false, 15, '抓到了！你根本没看条款就直接滑到底部乱点！')}
        className="btn btn-sm w-full rounded-lg border-[#D4D4D8] bg-white text-[#71717A]"
      >
        我没看直接同意（陷阱）
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
    '第 1 层：普通北海道带泥土豆（左右猛擦削皮）',
    '第 2 层：咦？削完里面居然还是土豆！继续削！',
    '第 3 层：怎么还有一层？！再削最后一次！',
    '里面居然藏着一张纸条：别削了，我就是套娃土豆',
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
          onDone(true, 34, '削完 3 层皮里面居然还是套娃土豆！但你的对生拇指通过了认证！');
        }
      }
    }
    lastXRef.current = e.clientX;
  };

  return (
    <div className="flex flex-col items-center py-3">
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
        <Sparkles className="h-3.5 w-3.5 text-[#1A73E8]" strokeWidth={2} />
        <span>已削层数：{Math.min(3, peels)} / 3</span>
      </div>
    </div>
  );
};

/* 15. Spot the Human */
const SpotTheHumanGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const items = [
    { id: 'p1', label: '土豆 A', isHuman: false },
    { id: 'p2', label: '土豆 B', isHuman: false },
    { id: 'p3', label: '土豆 C', isHuman: false },
    { id: 'me', label: '镜子里的你', isHuman: true },
    { id: 'p4', label: '土豆 D', isHuman: false },
    { id: 'p5', label: '土豆 E', isHuman: false },
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
                ? '恭喜你成功在镜子里认出了自己，自我意识尚存！'
                : `你把「${item.label}」认成了人类，自我认知令人担忧。`
            )
          }
          className="flex flex-col items-center justify-center rounded-xl border border-[#E4E4E7] bg-[#FAFAFB] p-3 transition hover:border-[#1A73E8] hover:bg-white"
        >
          {item.isHuman ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1A73E8]">
              <User className="h-5 w-5" strokeWidth={2} />
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
  const tiles = ['空咖啡杯', '未读红点 99+', '08:59 闹钟', '北海道土豆', '空白 PPT', '冷掉的外卖'];
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
            const pickedPotato = picked.includes('北海道土豆');
            const passed = picked.length > 0 && !pickedPotato;
            onDone(
              passed,
              passed ? 34 : 20,
              passed
                ? '你精准共情了人类周一的痛苦，而土豆毫无波澜。'
                : '土豆从来没有周一综合征，别把你的疲惫甩锅给块茎。'
            );
          }}
          className="btn btn-sm h-10 rounded-xl border-0 bg-[#1A73E8] px-5 text-xs font-bold text-white"
        >
          <span>提交判断</span>
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};

export const Stage2MicroGames: React.FC<Stage2Props> = ({ game, onComplete }) => {
  const [revealedResult, setRevealedResult] = useState<StageResult | null>(null);

  const handleDone = (passed: boolean, humanScore: number, summary: string) => {
    if (revealedResult) return;
    if (passed) playSuccess();
    else playFail();
    setRevealedResult({
      stage: 2,
      passed,
      humanScore,
      potatoScore: passed ? 28 : 34,
      summary,
    });
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
      <div className="bg-[#1A73E8] px-6 py-5 text-white">
        <div className="text-xs font-medium text-white/80">
          第 2 关 / 共 3 关 · 反直觉交互审验
        </div>
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">
          {game.title}
        </h2>
        <p className="mt-1 text-xs text-white/85">{game.instruction}</p>
      </div>

      <div className="p-5 sm:p-6">
        {!revealedResult ? (
          <>
            <div className="min-h-[210px]">{renderGame()}</div>
            <p className="mt-4 rounded-xl bg-[#FAFAFB] px-4 py-2.5 text-xs text-[#71717A]">
              对照组备注：{game.potatoQuip}
            </p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center"
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
              {revealedResult.passed ? 'PASS · 过关' : 'FAIL · 被土豆反杀'}
            </span>

            <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-[#18181B]">
              {revealedResult.summary}
            </p>

            {/* Clean Side-by-Side Score Delta */}
            <div className="mt-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#EFF6FF] px-4 py-2 text-center">
                <span className="block text-[10px] font-medium text-[#3B82F6]">你本关得分</span>
                <span className="font-mono text-lg font-bold text-[#1D4ED8] tabular-nums">
                  +{revealedResult.humanScore}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#D4D4D8]">VS</span>
              <div className="rounded-xl bg-[#FAFAFB] px-4 py-2 text-center ring-1 ring-[#E4E4E7]">
                <span className="block text-[10px] font-medium text-[#71717A]">Poteto #01</span>
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
              className="btn mt-6 h-11 rounded-xl border-0 bg-[#18181B] px-7 text-sm font-semibold text-white hover:bg-[#27272A]"
            >
              进入第 3 关：手绘自证
            </button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
