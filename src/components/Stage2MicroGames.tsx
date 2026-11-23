import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Eye,
  Hand,
  HeartPulse,
  MousePointerClick,
  RefreshCw,
  ScrollText,
  Sparkles,
  Sprout,
  User,
} from 'lucide-react';
import { OfficialPotatoMascot } from './PotatoSvg';
import type { Stage2GameMeta, StageResult } from '../lib/types';

interface Stage2Props {
  game: Stage2GameMeta;
  onComplete: (result: StageResult) => void;
}

function finish(
  onComplete: (r: StageResult) => void,
  passed: boolean,
  humanScore: number,
  potatoScore: number,
  summary: string
) {
  onComplete({ stage: 2, passed, humanScore, potatoScore, summary });
}

/* 1. Stillness 5s */
const StillnessGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [armed, setArmed] = useState(false);
  const [left, setLeft] = useState(5.0);
  const [bait, setBait] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    if (!armed) return;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      const rem = Math.max(0, 5 - elapsed);
      setLeft(rem);
      if (elapsed > 1.4 && elapsed < 3.0) setBait('提示：你的鼠标好像歪了一毫米…');
      else if (elapsed >= 3.0) setBait('快忍住！千万别点屏幕！');
      if (rem <= 0 && !doneRef.current) {
        doneRef.current = true;
        window.clearInterval(timer);
        onDone(true, 33, '你成功静止了 5 秒，勉强追平了一颗土豆的日常状态。');
      }
    }, 60);

    const fail = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      window.clearInterval(timer);
      onDone(false, 12, '你动了！Poteto #01 甚至没理解为什么这很难。');
    };

    // Brief grace window (350ms) so clicking "Start" doesn't immediately trigger movement
    const grace = window.setTimeout(() => {
      window.addEventListener('pointermove', fail, { once: true });
      window.addEventListener('touchstart', fail, { once: true });
    }, 350);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(grace);
      window.removeEventListener('pointermove', fail);
      window.removeEventListener('touchstart', fail);
    };
  }, [armed, onDone]);

  return (
    <div className="flex flex-col items-center py-6 text-center">
      {!armed ? (
        <>
          <OfficialPotatoMascot className="mb-4 h-20 w-20" />
          <p className="mb-5 max-w-sm text-sm text-[#57534E]">
            点击开始后立刻松开鼠标/手指，保持绝对静止 5 秒。
          </p>
          <button
            type="button"
            onClick={() => setArmed(true)}
            className="btn rounded-xl border-0 bg-[#1C1917] px-6 text-[#FAF7F0] hover:bg-[#342F2B]"
          >
            <Hand className="h-4 w-4" strokeWidth={2} />
            <span>开始 5 秒静止挑战</span>
          </button>
        </>
      ) : (
        <>
          <div className="font-mono text-5xl font-bold tracking-tight text-[#C86D2D]">
            {left.toFixed(1)}s
          </div>
          <p className="mt-3 text-sm font-medium text-[#57534E]">
            {bait || '双手离开设备，像一颗土豆一样思考人生…'}
          </p>
        </>
      )}
    </div>
  );
};

/* 2. Splitting Potatoes */
const SplittingPotatoesGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = window.setTimeout(() => {
      setCount(7);
      setPhase(1);
    }, 1800);
    const t2 = window.setTimeout(() => {
      setCount(9);
      setPhase(2);
    }, 3400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const options = [5, 7, 9, 11];
  const pick = (n: number) => {
    const exact = n === count;
    onDone(
      exact,
      exact ? 34 : 18,
      exact
        ? `眼疾手快！你在第 ${phase + 1} 次分裂瞬间准确报出 ${count} 颗。`
        : `你选了 ${n} 颗，但按下瞬间它们刚好分裂成了 ${count} 颗！`
    );
  };

  return (
    <div className="flex flex-col items-center py-3">
      <div className="mb-4 flex min-h-36 w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#E7DEC8] bg-[#FAF7F0] p-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            <OfficialPotatoMascot className="h-12 w-12" />
          </motion.div>
        ))}
      </div>
      <div className="grid w-full grid-cols-4 gap-2">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => pick(n)}
            className="btn rounded-xl border border-[#D6CFC2] bg-white font-mono text-base font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#FAF7F0]"
          >
            {n} 颗
          </button>
        ))}
      </div>
    </div>
  );
};

/* 3. Dodging Button */
const DodgingButtonGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const tired = dodges >= 4;

  const flee = () => {
    if (tired) return;
    setDodges((d) => d + 1);
    setPos({
      x: Math.round((Math.random() - 0.5) * 180),
      y: Math.round((Math.random() - 0.5) * 90),
    });
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-[#E7DEC8] bg-[#FAF7F0]">
        <motion.button
          type="button"
          animate={{ x: pos.x, y: pos.y }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onMouseEnter={flee}
          onClick={() => {
            if (!tired) {
              flee();
            } else {
              onDone(true, 33, '你把确认键追到气喘吁吁，展现了顽强的碳基执念。');
            }
          }}
          className="btn rounded-xl border-0 bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-md hover:bg-[#1D4ED8]"
        >
          <MousePointerClick className="h-4 w-4" strokeWidth={2} />
          <span>{tired ? '跑不动了，点我吧' : '点我证明你是人类'}</span>
        </motion.button>
      </div>
      <p className="mt-2.5 font-mono text-xs text-[#78716C]">
        逃逸次数：{dodges} / 4 {tired ? '（按钮体力耗尽）' : '（继续追捕或点击）'}
      </p>
    </div>
  );
};

/* 4. Don't Press Red */
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
            onDone(true, 34, '你克制住了原始冲动，没有按下那颗诱人的红按钮。');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [onDone]);

  const labels = [
    '绝对不要点我',
    '真的别点，点了就输给土豆',
    '按一下会有神秘彩蛋（假的）',
    '再忍 2 秒就赢了，手痒吗？',
    '最后 1 秒…',
  ];

  return (
    <div className="flex flex-col items-center py-5 text-center">
      <div className="mb-4 font-mono text-3xl font-bold text-[#1C1917]">00:0{sec}</div>
      <button
        type="button"
        onClick={() => {
          if (doneRef.current) return;
          doneRef.current = true;
          onDone(false, 10, '你还是忍不住点了红按钮！Poteto #01 靠没有手指完胜。');
        }}
        className="btn h-16 rounded-2xl border-0 bg-[#DC2626] px-8 text-base font-bold text-white shadow-[0_8px_0_#991B1B] active:translate-y-1 active:shadow-[0_4px_0_#991B1B]"
      >
        <AlertTriangle className="h-5 w-5" strokeWidth={2} />
        <span>{labels[5 - sec] || labels[0]}</span>
      </button>
    </div>
  );
};

/* 5. Reverse Slider */
const ReverseSliderGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [raw, setRaw] = useState(15);
  const display = 100 - raw;
  const inZone = display >= 48 && display <= 52;

  return (
    <div className="flex flex-col items-center py-5">
      <div className="mb-2 font-mono text-4xl font-bold text-[#1C1917]">{display}%</div>
      <p className="mb-4 text-xs text-[#78716C]">目标区间：48% ~ 52%（注意：滑动方向是反的）</p>
      <input
        type="range"
        min={0}
        max={100}
        value={raw}
        onChange={(e) => setRaw(Number(e.target.value))}
        className="range range-warning w-full max-w-md"
        aria-label="反直觉纯度滑块"
      />
      <button
        type="button"
        onClick={() =>
          onDone(
            inZone,
            inZone ? 34 : 18,
            inZone
              ? `精准停在 ${display}%！你的小脑成功克服了反向映射。`
              : `你停在了 ${display}%，稍微偏离了 48%~52% 的人类黄金区间。`
          )
        }
        className="btn mt-5 rounded-xl border-0 bg-[#1C1917] px-6 text-[#FAF7F0] hover:bg-[#342F2B]"
      >
        <span>锁定当前读数</span>
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
};

/* 6. Fake Loading */
const FakeLoadingGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [pct, setPct] = useState(20);
  const [rushes, setRushes] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      setPct((p) => {
        if (p >= 100) return 100;
        if (p < 96) return p + 12;
        if (p < 99) return p + 1;
        return 100;
      });
    }, 550);
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
          ? '全程没有点「催一下」，你的耐心已经接近一颗成熟的土豆。'
          : `你忍不住催了 ${rushes} 次，进度条被你吓得反复回滚。`
      );
    }
  }, [pct, rushes, onDone]);

  return (
    <div className="flex flex-col items-center py-5">
      <div className="mb-2 flex w-full max-w-md justify-between font-mono text-xs font-semibold text-[#57534E]">
        <span>正在核验人类灵魂完整性…</span>
        <span>{pct}%</span>
      </div>
      <div className="h-4 w-full max-w-md overflow-hidden rounded-full bg-[#EFE8DA]">
        <div
          className="h-full rounded-full bg-[#C86D2D] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          setRushes((r) => r + 1);
          setPct(12);
        }}
        className="btn btn-outline mt-5 rounded-xl border-[#D6CFC2] text-xs text-[#57534E] hover:border-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
      >
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
        <span>太慢了，催一下 ({rushes})</span>
      </button>
    </div>
  );
};

/* 7. Potato Blinking */
const PotatoBlinkingGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [holding, setHolding] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const blinkedAtRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!holding) return;
    const delay = 1400 + Math.random() * 1800;
    const t = window.setTimeout(() => {
      setBlinking(true);
      blinkedAtRef.current = performance.now();
    }, delay);
    return () => window.clearTimeout(t);
  }, [holding]);

  const release = () => {
    if (!holding || doneRef.current) return;
    doneRef.current = true;
    setHolding(false);
    if (!blinkedAtRef.current) {
      onDone(false, 14, '土豆还没眨眼你就先松手了，心理防线崩塌！');
    } else {
      const rt = Math.round(performance.now() - blinkedAtRef.current);
      const passed = rt < 900;
      onDone(
        passed,
        passed ? 34 : 22,
        passed
          ? `反应时间 ${rt}ms！你在土豆眨眼瞬间成功抽身。`
          : `反应时间 ${rt}ms，稍微慢了半拍。`
      );
    }
  };

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <OfficialPotatoMascot className="mb-4 h-24 w-24" blinking={blinking} />
      <p className="mb-4 text-xs font-medium text-[#57534E]">
        {!holding
          ? '长按下方按钮开始与土豆对视'
          : blinking
            ? '它眨眼了！立刻松手！'
            : '死死盯住它，千万别提前松手…'}
      </p>
      <button
        type="button"
        onPointerDown={() => setHolding(true)}
        onPointerUp={release}
        onPointerCancel={release}
        className={`btn rounded-xl border-0 px-6 text-white ${
          blinking ? 'bg-[#15803D]' : 'bg-[#1C1917]'
        }`}
      >
        <Eye className="h-4 w-4" strokeWidth={2} />
        <span>{holding ? '正在对视中（眨眼即松手）' : '按住开始对视'}</span>
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
        if (prev <= 10) {
          setDir(1);
          return 12;
        }
        return prev + dir * 6;
      });
    }, 90);
    return () => window.clearInterval(t);
  }, [dir]);

  return (
    <div className="py-3">
      <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-[#E7DEC8] bg-[#FAF7F0]">
        <motion.button
          type="button"
          animate={{ left: `${x}%`, y: [0, -28, 0] }}
          transition={{ y: { repeat: Infinity, duration: 0.65, ease: 'easeInOut' } }}
          onClick={() => onDone(true, 34, '精准捕获失控勾选框！手眼协调度击败了块茎。')}
          style={{ position: 'absolute', bottom: '18px' }}
          className="flex -translate-x-1/2 items-center gap-2 rounded-xl border-2 border-[#2563EB] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] shadow-md"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded border border-[#2563EB]" />
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
    { top: '20%', left: '24%' },
    { top: '65%', left: '72%' },
    { top: '38%', left: '52%' },
  ];
  const cur = positions[hits] || positions[2];

  return (
    <div className="py-3">
      <div className="relative h-44 w-full rounded-2xl border border-[#E7DEC8] bg-[#FAF7F0]">
        <button
          type="button"
          style={{ top: cur.top, left: cur.left }}
          onClick={() => {
            if (hits >= 2) {
              onDone(true, 34, '成功掐掉 3 处顽固土豆芽，精准度满分！');
            } else {
              setHits((h) => h + 1);
            }
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#15803D] bg-[#DCFCE7] text-[#15803D] shadow-sm transition hover:scale-110"
          aria-label="点击土豆芽"
        >
          <Sprout className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>
      <p className="mt-2 text-center font-mono text-xs text-[#78716C]">已掐芽：{hits} / 3</p>
    </div>
  );
};

/* 10. Typing Panic */
const TypingPanicGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [val, setVal] = useState('');
  const [sabotaged, setSabotaged] = useState(false);

  const handleChange = (next: string) => {
    if (!sabotaged && next === '我是人') {
      setSabotaged(true);
      setVal('我是土豆');
      return;
    }
    setVal(next);
  };

  const submit = () => {
    const exact = val.trim() === '我是人类';
    onDone(
      exact,
      exact ? 34 : 14,
      exact
        ? '你识破了系统的「土豆化纠错」，坚定写下了「我是人类」。'
        : `你提交了「${val || '空白'}」——系统默认你已接受土豆身份。`
    );
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <input
        type="text"
        value={val}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="请在此输入：我是人类"
        className="input input-bordered w-full max-w-sm rounded-xl border-[#D6CFC2] bg-[#FAF7F0] text-center font-medium text-[#1C1917]"
      />
      {sabotaged && (
        <p className="text-xs font-medium text-[#C86D2D]">
          系统刚刚帮你“贴心纠错”成了土豆，请手动改回来！
        </p>
      )}
      <button
        type="button"
        onClick={submit}
        className="btn rounded-xl border-0 bg-[#1C1917] px-6 text-[#FAF7F0] hover:bg-[#342F2B]"
      >
        <span>提交身份声明</span>
      </button>
    </div>
  );
};

/* 11. Liar Buttons */
const LiarButtonsGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  return (
    <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-2">
      <button
        type="button"
        onClick={() =>
          onDone(false, 18, '过度自信触发了年审局警报！谦虚是人类的重要美德。')
        }
        className="btn h-auto rounded-2xl border border-[#D6CFC2] bg-white py-4 text-sm font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#FAF7F0]"
      >
        我绝对碾压这颗土豆
      </button>
      <button
        type="button"
        onClick={() =>
          onDone(true, 34, '诚实且懂得尊重淀粉生命，年审局破例给予高分！')
        }
        className="btn h-auto rounded-2xl border border-[#C86D2D]/40 bg-[#FFF7ED] py-4 text-sm font-bold text-[#9A3412] hover:bg-[#FFEDD5]"
      >
        某些周一早晨我确实不如它
      </button>
    </div>
  );
};

/* 12. Soundless Rhythm */
const SoundlessRhythmGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [taps, setTaps] = useState<number[]>([]);

  const handleTap = () => {
    const now = performance.now();
    const next = [...taps, now];
    setTaps(next);
    if (next.length >= 3) {
      const d1 = next[1] - next[0];
      const d2 = next[2] - next[1];
      const avg = Math.round((d1 + d2) / 2);
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
    <div className="flex flex-col items-center py-5 text-center">
      <button
        type="button"
        onClick={handleTap}
        className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#C86D2D]/30 bg-[#FFF7ED] text-[#C86D2D] shadow-sm transition active:scale-95"
      >
        <HeartPulse className="h-10 w-10" strokeWidth={2} />
      </button>
      <p className="mt-3 font-mono text-xs font-semibold text-[#57534E]">
        以约 1 秒节奏轻点 3 次（已完成 {taps.length} / 3）
      </p>
    </div>
  );
};

/* 13. Scroll Trap */
const ScrollTrapGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  return (
    <div className="py-3">
      <div className="h-44 overflow-y-auto rounded-2xl border border-[#E7DEC8] bg-[#FAF7F0] p-4 text-left text-xs leading-relaxed text-[#57534E]">
        <p className="mb-2 flex items-center gap-1.5 font-bold text-[#1C1917]">
          <ScrollText className="h-4 w-4" strokeWidth={2} />
          《2026 人类临时续费协议（节选）》
        </p>
        <p className="mb-2">第一条：本人承诺今日已摄入水分，且未试图通过光合作用替代午饭。</p>
        <p className="mb-2">第二条：本人尊重北海道对照组土豆（Poteto #01）的沉默权与发芽权。</p>
        <p className="mb-2">第三条：若本人在周一上午表现得像一块生淀粉，属于正常人类波动范围。</p>
        <div className="my-4 rounded-xl border border-[#15803D]/40 bg-[#F0FDF4] p-3 text-center">
          <p className="mb-2 font-semibold text-[#15803D]">隐藏真条款：你真的在认真读！</p>
          <button
            type="button"
            onClick={() => onDone(true, 34, '你居然真的读了条款并找到了隐藏确认键，人类之光！')}
            className="btn btn-sm rounded-lg border-0 bg-[#15803D] text-white"
          >
            我同意继续做人
          </button>
        </div>
        <p className="mb-2">第四条：以下内容为凑字数条款，专为习惯无脑滑到底部的人类准备。</p>
        <p className="mb-2">第五条：真的不要点最下面那个灰色按钮，那是个土豆陷阱。</p>
        <p className="mb-4">第六条：最后一次提醒，真正的按钮在上面第三条后面。</p>
        <button
          type="button"
          onClick={() => onDone(false, 15, '抓到了！你根本没看条款就直接滑到底部乱点！')}
          className="btn btn-sm w-full rounded-lg border-[#D6CFC2] bg-white text-[#78716C]"
        >
          我没看直接同意（陷阱）
        </button>
      </div>
    </div>
  );
};

/* 14. Drag to Peel */
const DragToPeelGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const [peels, setPeels] = useState(0);
  const lastXRef = useRef<number | null>(null);
  const accRef = useRef(0);

  const handleMove = (e: React.PointerEvent) => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    if (lastXRef.current !== null) {
      accRef.current += Math.abs(e.clientX - lastXRef.current);
      if (accRef.current > 95) {
        accRef.current = 0;
        setPeels((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            onDone(true, 34, '成功削完 3 层皮（里面依然是一颗土豆），对生拇指认证通过！');
          }
          return next;
        });
      }
    }
    lastXRef.current = e.clientX;
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div
        onPointerMove={handleMove}
        onPointerUp={() => {
          lastXRef.current = null;
        }}
        className="flex h-36 w-full max-w-xs cursor-grab touch-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C86D2D]/50 bg-[#FAF7F0] select-none active:cursor-grabbing"
      >
        <OfficialPotatoMascot className="h-20 w-20" />
        <span className="mt-1 text-xs font-medium text-[#78716C]">按住左右来回摩擦削皮</span>
      </div>
      <div className="mt-3 flex items-center gap-2 font-mono text-xs font-semibold text-[#57534E]">
        <Sparkles className="h-3.5 w-3.5 text-[#C86D2D]" strokeWidth={2} />
        <span>削皮进度：{Math.min(3, peels)} / 3</span>
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
    <div className="grid grid-cols-3 gap-2.5 py-3">
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
          className="flex flex-col items-center justify-center rounded-2xl border border-[#E7DEC8] bg-[#FAF7F0] p-3 transition hover:border-[#1C1917] hover:bg-white"
        >
          {item.isHuman ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
              <User className="h-6 w-6" strokeWidth={2} />
            </div>
          ) : (
            <OfficialPotatoMascot className="h-12 w-12" />
          )}
          <span className="mt-1.5 text-xs font-medium text-[#57534E]">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

/* 16. Absurd Traffic Light */
const TrafficLightAbsurdGame: React.FC<{ onDone: (p: boolean, h: number, s: string) => void }> = ({ onDone }) => {
  const tiles = [
    '空咖啡杯',
    '未读红点 99+',
    '08:59 闹钟',
    '北海道土豆',
    '空白 PPT',
    '冷掉的外卖',
  ];
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (t: string) =>
    setPicked((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div className="py-3">
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
                  ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                  : 'border-[#E7DEC8] bg-[#FAF7F0] text-[#57534E] hover:bg-white'
              }`}
            >
              {active && <Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5" strokeWidth={2.5} />}
              {t}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
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
          className="btn rounded-xl border-0 bg-[#1C1917] px-5 text-sm text-[#FAF7F0]"
        >
          <span>提交哲学判断</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export const Stage2MicroGames: React.FC<Stage2Props> = ({ game, onComplete }) => {
  const handleDone = (passed: boolean, humanScore: number, summary: string) => {
    const potatoScore = passed ? 28 : 34;
    finish(onComplete, passed, humanScore, potatoScore, summary);
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-[#E2D9C8] bg-white p-5 shadow-[0_12px_36px_rgba(28,25,23,0.06)] sm:p-6"
    >
      <div className="mb-4 border-b border-[#EFE8DA] pb-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="rounded-full bg-[#1C1917] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#FAF7F0]">
            STAGE 02 / 03
          </span>
          <span className="rounded-full border border-[#E7DEC8] bg-[#FAF7F0] px-2.5 py-0.5 text-xs font-medium text-[#78716C]">
            反直觉交互审验
          </span>
        </div>
        <h2 className="font-display text-xl font-bold tracking-tight text-[#1C1917] sm:text-2xl">
          {game.title}
        </h2>
        <p className="mt-1 text-sm text-[#57534E]">{game.instruction}</p>
      </div>

      {renderGame()}

      <p className="mt-4 rounded-xl bg-[#FAF7F0] px-3.5 py-2 text-xs text-[#78716C]">
        对照组备注：{game.potatoQuip}
      </p>
    </motion.section>
  );
};
