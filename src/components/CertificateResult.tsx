import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Flame,
  Infinity as InfinityIcon,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { PotatoSvg } from './PotatoSvg';
import { formatAuditNumber } from '../lib/prng';
import { playPop, playTick } from '../lib/sfx';
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

  // Wordle-style minimalist emoji share text
  const stageIcons = result.stages.map((s) => (s.passed ? '✅' : '❌')).join('');
  const streakText =
    result.mode === 'daily'
      ? `连续 ${result.streak} 天${beatPotato ? '险胜土豆' : '被土豆羞辱'}`
      : `无尽年审模式`;

  const shareText = `🥔 Poteto ${auditCode} | 人类纯度 ${result.humanPurity}% | 🥔${stageIcons} | ${streakText}\n${siteUrl}`;

  const handleCopy = async () => {
    playPop(1);
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
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
    playTick();
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Modern crisp white laminated card
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 960, 600);

    // Top accent bar
    const grad = ctx.createLinearGradient(0, 0, 960, 0);
    if (beatPotato) {
      grad.addColorStop(0, '#1A73E8');
      grad.addColorStop(1, '#16A34A');
    } else {
      grad.addColorStop(0, '#F59E0B');
      grad.addColorStop(1, '#DC2626');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 14);

    // Subtle border
    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 30, 920, 550);

    // Header
    ctx.fillStyle = '#71717A';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`POTETO HUMAN QUALIFICATION CERTIFICATE · ${auditCode}`, 56, 78);

    ctx.fillStyle = '#09090B';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('人类资格鉴定书', 56, 128);

    // ID Photo frame
    ctx.fillStyle = '#FAFAFB';
    ctx.fillRect(56, 164, 240, 240);
    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = 3;
    ctx.strokeRect(56, 164, 240, 240);

    const strokes = result.drawing?.strokes || [];
    strokes.forEach((stroke, idx) => {
      if (!stroke.length) return;
      ctx.beginPath();
      const mapX = (x: number) => 74 + (x / 100) * 204;
      const mapY = (y: number) => 176 + (y / 100) * 204;
      ctx.moveTo(mapX(stroke[0][0]), mapY(stroke[0][1]));
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(mapX(stroke[i][0]), mapY(stroke[i][1]));
      }
      if (idx === 0) {
        ctx.fillStyle = '#F6DFC0';
        ctx.fill();
      }
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });

    ctx.fillStyle = '#71717A';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('VERIFIED ID PHOTO (SVG)', 86, 434);

    // Right side stats
    ctx.fillStyle = '#71717A';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('人类纯度判定', 336, 196);

    ctx.fillStyle = beatPotato ? '#16A34A' : '#DC2626';
    ctx.font = 'bold 80px monospace';
    ctx.fillText(`${result.humanPurity}%`, 336, 282);

    ctx.fillStyle = '#09090B';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(result.verdictTitle, 336, 336);

    ctx.fillStyle = '#52525B';
    ctx.font = '18px sans-serif';
    ctx.fillText(result.verdictSubtitle.slice(0, 32), 336, 376);
    if (result.verdictSubtitle.length > 32) {
      ctx.fillText(result.verdictSubtitle.slice(32), 336, 404);
    }

    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(
      `YOU ${result.humanTotal} PTS   VS   POTETO #01 ${result.potatoTotal} PTS`,
      336,
      462
    );

    // Footer
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '14px monospace';
    ctx.fillText(`DATE: ${result.auditDate} (UTC)  ·  ${siteUrl.replace(/^https?:\/\//, '')}`, 56, 540);

    const link = document.createElement('a');
    link.download = `poteto-audit-${formatAuditNumber(result.auditNumber)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleEnableReminder = async () => {
    playTick();
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
    setReminderMsg('已生成明日年审日历提醒（.ics），导入即可准时续费连胜。');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28 }}
      className="space-y-3.5"
    >
      {/* Modern Laminated ID Certificate Card */}
      <div className="overflow-hidden rounded-3xl border border-[#E4E4E7] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
        {/* Sleek Top Security Ribbon */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${
            beatPotato
              ? 'from-[#1A73E8] via-[#38BDF8] to-[#16A34A]'
              : 'from-[#F59E0B] via-[#FB7185] to-[#DC2626]'
          }`}
        />

        <div className="p-5 sm:p-7">
          {/* Card Top Bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-[#F4F4F5] pb-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`h-4 w-4 ${beatPotato ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}
                strokeWidth={2.2}
              />
              <span className="font-mono text-[11px] font-bold tracking-wider text-[#71717A] uppercase">
                HUMAN QUALIFICATION · {auditCode}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#71717A]">
              {result.mode === 'daily' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-2.5 py-0.5 font-semibold text-[#EA580C]">
                  <Flame className="h-3.5 w-3.5" strokeWidth={2.2} />
                  {result.streak} 天连胜
                </span>
              )}
              <span>{result.auditDate}</span>
            </div>
          </div>

          {/* Photo + Verdict */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[160px_1fr]">
            <div className="flex flex-col items-center">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-2xl border border-[#E4E4E7] bg-[#FAFAFB] p-3 shadow-inner">
                <PotatoSvg
                  pathData={result.drawing}
                  className="h-full w-full"
                  fillTint="#F6DFC0"
                  strokeColor="#18181B"
                  strokeWidth={5.2}
                />
                <span className="absolute bottom-1.5 right-2 font-mono text-[9px] font-bold text-[#A1A1AA]">
                  ID PHOTO
                </span>
              </div>
              <span className="mt-2 max-w-[168px] truncate text-center text-[11px] text-[#71717A]">
                {result.drawingPrompt}
              </span>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-xs text-[#71717A]">
                  <span className="font-semibold">人类纯度判定</span>
                  <span className="font-mono text-[11px]">
                    你 {result.humanTotal} vs 土豆 {result.potatoTotal}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3">
                  <span
                    className={`font-mono text-5xl font-extrabold tracking-tight ${
                      beatPotato ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}
                  >
                    {result.humanPurity}%
                  </span>

                  <motion.div
                    initial={{ scale: 2, rotate: -16, opacity: 0 }}
                    animate={{ scale: 1, rotate: -6, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className={`rounded-lg border-2 px-2.5 py-0.5 font-display text-[11px] font-extrabold tracking-wider uppercase ${
                      beatPotato
                        ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]'
                        : 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                    }`}
                  >
                    {beatPotato ? 'QUALIFIED HUMAN' : 'SUSPICIOUS TUBER'}
                  </motion.div>
                </div>

                <h2 className="mt-2.5 font-display text-lg font-bold text-[#09090B] sm:text-xl">
                  {result.verdictTitle}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#52525B] sm:text-sm">
                  {result.verdictSubtitle}
                </p>
              </div>

              {/* 3-Stage Breakdown */}
              <div className="mt-4 space-y-1.5 rounded-2xl bg-[#FAFAFB] p-3 ring-1 ring-[#F4F4F5]">
                {result.stages.map((st) => (
                  <div key={st.stage} className="flex items-start gap-2 text-xs">
                    {st.passed ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" strokeWidth={2.2} />
                    ) : (
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#DC2626]" strokeWidth={2.2} />
                    )}
                    <span className="font-mono font-bold text-[#A1A1AA]">0{st.stage}</span>
                    <span className="text-[#3F3F46]">{st.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share Box */}
          <div className="mt-5 rounded-2xl bg-[#FAFAFB] p-3.5 ring-1 ring-[#E4E4E7]">
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#18181B]">
              {shareText}
            </pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-sm h-10 flex-1 rounded-xl border-0 bg-[#18181B] text-xs font-bold text-white hover:bg-[#27272A]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-[#4ADE80]" strokeWidth={2.5} />
                    <span>已复制战绩</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>复制 Emoji 战绩</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadPng}
                className="btn btn-sm h-10 rounded-xl border border-[#D4D4D8] bg-white px-4 text-xs font-bold text-[#18181B] hover:bg-[#F4F4F5]"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                <span>保存鉴定书</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Completion Exits */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            playTick();
            if (result.mode === 'endless' && onPlayAnotherEndless) onPlayAnotherEndless();
            else onStartEndless();
          }}
          className="flex items-center justify-between rounded-2xl border border-[#E4E4E7] bg-white p-4 text-left shadow-2xs transition hover:border-[#1A73E8] hover:bg-[#EFF6FF]/40"
        >
          <div>
            <div className="flex items-center gap-1.5 font-display text-sm font-bold text-[#09090B]">
              <InfinityIcon className="h-4 w-4 text-[#1A73E8]" strokeWidth={2.2} />
              <span>{result.mode === 'endless' ? '再来一局无尽年审' : '进入无尽年审'}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#71717A]">
              随机刷遍全部 16 个反直觉微关卡
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleEnableReminder}
          className="flex items-center justify-between rounded-2xl border border-[#E4E4E7] bg-white p-4 text-left shadow-2xs transition hover:border-[#16A34A] hover:bg-[#F0FDF4]/50"
        >
          <div>
            <div className="flex items-center gap-1.5 font-display text-sm font-bold text-[#09090B]">
              {reminderOn ? (
                <BellRing className="h-4 w-4 text-[#16A34A]" strokeWidth={2.2} />
              ) : (
                <Bell className="h-4 w-4 text-[#71717A]" strokeWidth={2.2} />
              )}
              <span>{reminderOn ? '已开启明日提醒' : '开启明日过期提醒'}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#71717A]">
              UTC 00:00 刷新，防止连胜中断
            </p>
          </div>
        </button>
      </div>

      {reminderMsg && (
        <p className="rounded-xl bg-[#F0FDF4] px-3.5 py-2 text-xs font-medium text-[#166534] ring-1 ring-[#BBF7D0]">
          {reminderMsg}
        </p>
      )}
    </motion.section>
  );
};
