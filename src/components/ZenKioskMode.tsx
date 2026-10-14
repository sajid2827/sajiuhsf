import React from 'react';
import { Play, Pause, RotateCcw, Minimize2, CheckCircle2, BookOpen } from 'lucide-react';
import { MedicalSubject } from '../types/medical';
import { MEDICAL_SUBJECTS } from '../data/medicalCurriculum';

interface ZenKioskModeProps {
  mins: number;
  secs: number;
  isRunning: boolean;
  subject: MedicalSubject;
  activeChapterTitle?: string;
  totalHoursToday: string;
  targetMinutes: number;
  totalMinutesToday: number;
  percentage: number;
  targetCollegeName: string;
  onStartPause: () => void;
  onReset: () => void;
  onCommitEarly: () => void;
  onExit: () => void;
}

export const ZenKioskMode: React.FC<ZenKioskModeProps> = ({
  mins,
  secs,
  isRunning,
  subject,
  activeChapterTitle,
  totalHoursToday,
  totalMinutesToday,
  percentage,
  targetCollegeName,
  onStartPause,
  onReset,
  onCommitEarly,
  onExit,
}) => {
  const currentSub = MEDICAL_SUBJECTS.find((s) => s.id === subject) || MEDICAL_SUBJECTS[0];
  const formatTime = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 bg-[#07080b] flex flex-col justify-between p-6 sm:p-12 select-none font-mono">
      {/* Top Telemetry Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between border-b border-white/[0.08] pb-4 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-400 led-active" />
          <span className="font-bold tracking-widest text-white">MEDICORE // 8.5</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 uppercase tracking-wider font-semibold">
            {currentSub.label} [{currentSub.code}]
          </span>
          <span className="text-zinc-500 hidden sm:inline">· {currentSub.paperLabel}</span>
        </div>

        <button
          onClick={onExit}
          className="px-3 py-1.5 bg-[#12141c] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>EXIT (ESC)</span>
        </button>
      </div>

      {/* Centerpiece Chronometer Display */}
      <div className="text-center my-auto flex flex-col items-center">
        {/* Active Subject & Chapter Badge */}
        <div className="mb-4 flex flex-col items-center gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10131a] border border-white/10 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-none bg-emerald-400" />
            <span className="font-bold text-white">{currentSub.label}</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400 font-sans">{currentSub.bengaliLabel}</span>
          </div>
          {activeChapterTitle && (
            <div className="text-xs text-emerald-300 flex items-center gap-1.5 max-w-md truncate">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">{activeChapterTitle}</span>
            </div>
          )}
        </div>

        {/* Big Digits */}
        <div className="text-8xl sm:text-9xl md:text-[14rem] font-bold tracking-tighter text-white font-mono leading-none flex items-center justify-center">
          <span>{formatTime(mins)}</span>
          <span className={`mx-1 sm:mx-2 ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-zinc-700'}`}>
            :
          </span>
          <span>{formatTime(secs)}</span>
        </div>

        {/* Physical Keys */}
        <div className="flex items-center gap-3 sm:gap-4 mt-8 sm:mt-12">
          <button
            onClick={onStartPause}
            className={`px-8 sm:px-12 py-3.5 sm:py-4 font-bold text-sm tracking-wider uppercase transition-all btn-tactile flex items-center gap-2.5 ${
              isRunning
                ? 'bg-[#eab308] text-black hover:bg-[#facc15]'
                : 'bg-emerald-400 text-black hover:bg-emerald-300'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
            <span>{isRunning ? 'PAUSE CLOCK' : 'START FOCUS'}</span>
          </button>

          <button
            onClick={onReset}
            className="px-5 py-3.5 sm:py-4 bg-[#141620] border border-white/10 hover:border-white/25 text-zinc-300 hover:text-white font-mono text-xs uppercase btn-tactile"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onCommitEarly}
            className="px-5 sm:px-6 py-3.5 sm:py-4 bg-[#141620] border border-emerald-500/40 hover:border-emerald-500/70 text-emerald-400 font-mono text-xs uppercase btn-tactile flex items-center gap-1.5"
            title="Bank elapsed minutes to 8.5h quota"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">BANK TO 8.5H</span>
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="w-full max-w-4xl mx-auto border-t border-white/[0.08] pt-4 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-widest">Target Goal:</span>
          <span className="text-white font-bold">{targetCollegeName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            TODAY: <strong className="text-white">{totalHoursToday}</strong> / 8.5 HRS
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-bold">{percentage}% FULFILLED</span>
        </div>
      </div>
    </div>
  );
};
