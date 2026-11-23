import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Flame,
  Infinity as InfinityIcon,
  XCircle,
} from 'lucide-react';
import { PotatoSvg } from './PotatoSvg';
import { formatAuditNumber } from '../lib/prng';
import { isReminderEnabled, setReminderEnabled } from '../lib/storage';
import type { AuditSessionResult } from '../lib/types';

interface CertificateResultProps {
  result: AuditSessionResult;
  siteUrl: string;
  onStartEndless: () => void;
  onPlayAnotherEndless?: () => void;
}

export const CertificateResult: React.FC<CertificateResultProps> = ({
  result,
  siteUrl,
  onStartEndless,
  onPlayAnotherEndless,
}) => {
  const [copied, setCopied] = useState(false);
  const [reminderOn, setReminderOn] = useState(() => isReminderEnabled());
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const beatPotato = result.humanTotal >= result.potatoTotal;
  const auditCode = `#${formatAuditNumber(result.auditNumber)}`;

  // Wordle-style minimalist emoji share text (explicitly requested in product spec)
  const stageIcons = result.stages.map((s) => (s.passed ? '✅' : '❌')).join('');
  const streakText =
    result.mode === 'daily'
      ? `连续 ${result.streak} 天${beatPotato ? '险胜土豆' : '被土豆羞辱'}`
      : `无尽年审模式`;

  const shareText = `🥔 Poteto ${auditCode} | 人类纯度 ${result.humanPurity}% | 🥔${stageIcons} | ${streakText}\n${siteUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    }
  };

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Archival parchment background
    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, 960, 600);

    // Outer frame
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 912, 552);
    ctx.strokeStyle = '#D6CFC2';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(34, 34, 892, 532);

    // Header
    ctx.fillStyle = '#78716C';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`BUREAU OF HUMAN VERIFICATION · POTETO AUDIT ${auditCode}`, 60, 82);

    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('人类资格临时鉴定书', 60, 134);

    // ID Photo frame
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(60, 170, 240, 240);
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 170, 240, 240);

    // Draw vector potato inside ID Photo (0..100 -> 78..282)
    const strokes = result.drawing?.strokes || [];
    strokes.forEach((stroke, idx) => {
      if (!stroke.length) return;
      ctx.beginPath();
      const mapX = (x: number) => 78 + (x / 100) * 204;
      const mapY = (y: number) => 178 + (y / 100) * 204;
      ctx.moveTo(mapX(stroke[0][0]), mapY(stroke[0][1]));
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(mapX(stroke[i][0]), mapY(stroke[i][1]));
      }
      if (idx === 0) {
        ctx.fillStyle = '#F2DEC1';
        ctx.fill();
      }
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

    ctx.fillStyle = '#78716C';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('官方采集证件照 (SVG)', 96, 438);

    // Right side stats
    ctx.fillStyle = '#78716C';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('人类纯度判定', 340, 200);

    ctx.fillStyle = beatPotato ? '#15803D' : '#DC2626';
    ctx.font = 'bold 76px monospace';
    ctx.fillText(`${result.humanPurity}%`, 340, 282);

    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(result.verdictTitle, 340, 336);

    ctx.fillStyle = '#57534E';
    ctx.font = '18px sans-serif';
    ctx.fillText(result.verdictSubtitle.slice(0, 32), 340, 376);
    if (result.verdictSubtitle.length > 32) {
      ctx.fillText(result.verdictSubtitle.slice(32), 340, 404);
    }

    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(
      `YOU ${result.humanTotal} PTS   VS   POTETO #01 ${result.potatoTotal} PTS`,
      340,
      462
    );

    // Footer
    ctx.fillStyle = '#78716C';
    ctx.font = '15px monospace';
    ctx.fillText(`DATE: ${result.auditDate} (UTC)   ·   ${siteUrl.replace(/^https?:\/\//, '')}`, 60, 536);

    const link = document.createElement('a');
    link.download = `poteto-audit-${formatAuditNumber(result.auditNumber)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleEnableReminder = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setReminderEnabled(true);
          setReminderOn(true);
          setReminderMsg('已开启浏览器提醒！明日 UTC 00:00 人类资格过期前将提醒你年审。');
          return;
        }
      } catch {
        // Fallback to ICS calendar download
      }
    }

    // Download a lightweight .ics daily reminder fallback for Safari/iOS or denied Notification
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const ymd = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Poteto//Human Audit Reminder//CN',
      'BEGIN:VEVENT',
      `DTSTART:${ymd}T010000Z`,
      `DTEND:${ymd}T010500Z`,
      'SUMMARY:Poteto 每日人类资格年审（防止输给土豆）',
      `DESCRIPTION:你的人类资格即将过期，点击完成 90 秒年审：${siteUrl}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poteto-daily-audit.ics';
    a.click();
    URL.revokeObjectURL(url);

    setReminderEnabled(true);
    setReminderOn(true);
    setReminderMsg('已为你生成明日年审日历提醒（.ics），导入即可准时续费人类资格。');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Official Human Qualification Certificate */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#1C1917] bg-[#FAF7F0] p-5 shadow-[0_16px_44px_rgba(28,25,23,0.1)] sm:p-7">
        {/* Subtle top registration strip */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-[#D6CFC2] pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#C86D2D]" strokeWidth={2} />
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#57534E] uppercase">
              BUREAU OF HUMAN VERIFICATION · {auditCode}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#57534E]">
            {result.mode === 'daily' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-2.5 py-0.5 text-[#C86D2D]">
                <Flame className="h-3.5 w-3.5" strokeWidth={2} />
                连胜 {result.streak} 天
              </span>
            )}
            <span>{result.auditDate}</span>
          </div>
        </div>

        {/* Certificate Main Body */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[176px_1fr]">
          {/* ID Photo (User's Stage 3 Vector Potato) */}
          <div className="flex flex-col items-center">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-[#1C1917] bg-white p-3 shadow-sm">
              <PotatoSvg pathData={result.drawing} className="h-full w-full" />
              <span className="absolute bottom-1.5 right-2 font-mono text-[9px] font-bold text-[#A8A29E]">
                ID PHOTO
              </span>
            </div>
            <span className="mt-2 text-center text-[11px] font-medium text-[#78716C]">
              命题：{result.drawingPrompt}
            </span>
          </div>

          {/* Verdict & Purity */}
          <div className="relative flex flex-col justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-semibold tracking-wide text-[#78716C] uppercase">
                  人类纯度判定
                </span>
                <span className="font-mono text-xs text-[#78716C]">
                  你 {result.humanTotal} 分 vs 土豆 {result.potatoTotal} 分
                </span>
              </div>

              <div className="mt-1 flex items-center gap-3">
                <span
                  className={`font-mono text-5xl font-extrabold tracking-tight ${
                    beatPotato ? 'text-[#15803D]' : 'text-[#DC2626]'
                  }`}
                >
                  {result.humanPurity}%
                </span>

                {/* Animated Bureaucratic Stamp */}
                <motion.div
                  initial={{ scale: 2.1, rotate: -18, opacity: 0 }}
                  animate={{ scale: 1, rotate: -7, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
                  className={`rounded-lg border-2 px-2.5 py-1 font-display text-xs font-extrabold tracking-wider uppercase ${
                    beatPotato
                      ? 'border-[#15803D] bg-[#F0FDF4] text-[#15803D]'
                      : 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                  }`}
                >
                  {beatPotato ? 'QUALIFIED HUMAN' : 'SUSPICIOUS TUBER'}
                </motion.div>
              </div>

              <h2 className="mt-3 font-display text-xl font-bold text-[#1C1917] sm:text-2xl">
                {result.verdictTitle}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[#57534E]">
                {result.verdictSubtitle}
              </p>
            </div>

            {/* 3-Stage Mini Breakdown */}
            <div className="mt-4 space-y-1.5 rounded-2xl border border-[#E2D9C8] bg-white/80 p-3">
              {result.stages.map((st) => (
                <div key={st.stage} className="flex items-start gap-2 text-xs">
                  {st.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#15803D]" strokeWidth={2} />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" strokeWidth={2} />
                  )}
                  <span className="font-mono font-bold text-[#78716C]">0{st.stage}</span>
                  <span className="text-[#44403C]">{st.summary}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shareable Wordle-style Text Box + Actions */}
        <div className="mt-6 rounded-2xl border border-[#E2D9C8] bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716C]">一键复制 Emoji 战绩</span>
            <span className="font-mono text-[11px] text-[#A8A29E]">适合粘贴至群聊 / X</span>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-[#FAF7F0] px-3 py-2.5 font-mono text-xs text-[#1C1917]">
            {shareText}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="btn flex-1 rounded-xl border-0 bg-[#1C1917] text-sm font-semibold text-[#FAF7F0] hover:bg-[#342F2B]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-[#4ADE80]" strokeWidth={2.5} />
                  <span>已复制战绩，快去炫耀</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" strokeWidth={2} />
                  <span>复制战绩文本</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              className="btn rounded-xl border border-[#D6CFC2] bg-white text-sm font-semibold text-[#1C1917] hover:bg-[#FAF7F0]"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              <span>下载鉴定书 PNG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Post-Completion Exits */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={result.mode === 'endless' && onPlayAnotherEndless ? onPlayAnotherEndless : onStartEndless}
          className="flex items-center justify-between rounded-2xl border border-[#E2D9C8] bg-white p-4 text-left shadow-sm transition hover:border-[#C86D2D] hover:bg-[#FFFBF4]"
        >
          <div>
            <div className="flex items-center gap-1.5 font-display text-base font-bold text-[#1C1917]">
              <InfinityIcon className="h-4 w-4 text-[#C86D2D]" strokeWidth={2.2} />
              <span>
                {result.mode === 'endless' ? '再来一局无尽年审' : '进入无尽年审 (Endless Mode)'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#78716C]">
              随机刷遍全部 16 个反直觉微关卡与社区灵魂画作
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleEnableReminder}
          className="flex items-center justify-between rounded-2xl border border-[#E2D9C8] bg-white p-4 text-left shadow-sm transition hover:border-[#15803D] hover:bg-[#F0FDF4]/60"
        >
          <div>
            <div className="flex items-center gap-1.5 font-display text-base font-bold text-[#1C1917]">
              {reminderOn ? (
                <BellRing className="h-4 w-4 text-[#15803D]" strokeWidth={2.2} />
              ) : (
                <Bell className="h-4 w-4 text-[#2563EB]" strokeWidth={2.2} />
              )}
              <span>{reminderOn ? '已开启明日过期提醒' : '开启明日过期提醒'}</span>
            </div>
            <p className="mt-0.5 text-xs text-[#78716C]">
              UTC 00:00 刷新全球同题，防止明日忘记续费连胜
            </p>
          </div>
        </button>
      </div>

      {reminderMsg && (
        <p className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-2.5 text-xs font-medium text-[#166534]">
          {reminderMsg}
        </p>
      )}
    </motion.section>
  );
};
