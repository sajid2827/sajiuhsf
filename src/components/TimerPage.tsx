import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Search,
  X,
  ListFilter,
} from 'lucide-react';
import { MedicalSubject } from '../types/medical';
import { MEDICAL_SUBJECTS, ALL_CHAPTERS } from '../data/medicalCurriculum';
import { ChapterPickerModal } from './ChapterPickerModal';

interface TimerPageProps {
  mins: number;
  secs: number;
  isRunning: boolean;
  subject: MedicalSubject;
  onSubjectChange: (s: MedicalSubject) => void;
  activeChapterTitle?: string;
  onClearActiveChapter?: () => void;
  onSelectChapter?: (chapterTitle: string) => void;
  onSelectSubjectAndChapter?: (subjectId: MedicalSubject, chapterTitle: string) => void;
  completedChapterIds?: string[];
  durationSec: number;
  isBreak: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onCommitEarly: () => void;
  onSetPreset: (mins: number, breakMode?: boolean) => void;
  onAdjustMinutes: (delta: number) => void;
  totalHoursToday: string;
  percentage: number;
  onGoToTracker: () => void;
  onGoToSyllabus: () => void;
  targetCollegeShortName: string;
}

export const TimerPage: React.FC<TimerPageProps> = ({
  mins,
  secs,
  isRunning,
  subject,
  onSubjectChange,
  activeChapterTitle,
  onClearActiveChapter,
  onSelectChapter,
  onSelectSubjectAndChapter,
  completedChapterIds = [],
  durationSec,
  isBreak,
  onStartPause,
  onReset,
  onCommitEarly,
  onSetPreset,
  onAdjustMinutes,
  totalHoursToday,
  percentage,
  onGoToTracker,
  onGoToSyllabus,
  targetCollegeShortName,
}) => {
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const currentSub = MEDICAL_SUBJECTS.find((s) => s.id === subject) || MEDICAL_SUBJECTS[0];
  const formatTime = (n: number) => String(n).padStart(2, '0');

  // Find currently active chapter item if any
  const currentActiveChapterItem = ALL_CHAPTERS.find(
    (ch) => `${ch.englishTitle} (${ch.bengaliTitle})` === activeChapterTitle
  );

  return (
    <div className="w-full max-w-4xl chassis-box p-5 sm:p-8 flex flex-col gap-6 font-mono animate-in fade-in duration-150">
      {/* Chapter Picker Modal */}
      <ChapterPickerModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        currentSubject={subject}
        currentChapterTitle={activeChapterTitle}
        completedChapterIds={completedChapterIds}
        onSelectChapter={(subId, title) => {
          if (onSelectSubjectAndChapter) {
            onSelectSubjectAndChapter(subId, title);
          } else {
            onSubjectChange(subId);
            onSelectChapter?.(title);
          }
        }}
      />

      {/* SECTION: ACTIVE STUDY PAPER & CHAPTER SELECTION */}
      <div className="flex flex-col gap-3.5 bg-[#090b10] border border-white/[0.07] p-4 sm:p-5">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-400 led-active" />
            <span className="text-xs uppercase font-bold tracking-wider text-white">
              Active Study Paper & Target Chapter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 uppercase">Selected:</span>
            <span className="text-emerald-400 font-bold text-xs">
              {currentSub.code} · {currentSub.paperLabel}
            </span>
          </div>
        </div>

        {/* 9-Subject Matrix Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
          {MEDICAL_SUBJECTS.map((s) => {
            const isActive = subject === s.id && !isBreak;
            return (
              <button
                key={s.id}
                onClick={() => {
                  onSubjectChange(s.id);
                }}
                className={`p-2 border text-center transition-all flex flex-col justify-between btn-tactile ${
                  isActive
                    ? 'bg-[#151922] border-emerald-400 text-white font-bold shadow-[inset_0_0_8px_rgba(5,223,114,0.12)]'
                    : 'bg-[#0b0e15] border-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-white'
                }`}
                title={`${s.label} (${s.bengaliLabel})`}
              >
                <div className="text-[10px] sm:text-[11px] truncate tracking-tight font-semibold">
                  {s.code}
                </div>
                <div className="text-[8px] sm:text-[9px] text-zinc-500 truncate mt-0.5 font-sans">
                  {s.paperLabel}
                </div>
              </button>
            );
          })}
        </div>

        {/* CHAPTER SELECTOR CONTROLS: Dropdown across ALL subjects + Browse Modal Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          {/* Global Chapter Dropdown across ALL 9 subjects */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <select
              value={activeChapterTitle || ''}
              onChange={(e) => {
                const selectedTitle = e.target.value;
                if (!selectedTitle) {
                  onClearActiveChapter?.();
                  return;
                }
                const found = ALL_CHAPTERS.find(
                  (ch) => `${ch.englishTitle} (${ch.bengaliTitle})` === selectedTitle
                );
                if (found) {
                  if (onSelectSubjectAndChapter) {
                    onSelectSubjectAndChapter(found.subjectId, selectedTitle);
                  } else {
                    onSubjectChange(found.subjectId);
                    onSelectChapter?.(selectedTitle);
                  }
                }
              }}
              className="w-full bg-[#12151f] border border-white/10 hover:border-white/20 focus:border-emerald-500/60 px-2.5 py-1.5 text-xs text-zinc-200 outline-none truncate font-sans cursor-pointer"
            >
              <option value="">-- Choose Chapter from Any Subject (79 Total) --</option>
              {MEDICAL_SUBJECTS.map((sub) => (
                <optgroup key={sub.id} label={`${sub.code}: ${sub.label}`} className="bg-[#12151f] text-emerald-400 font-bold">
                  {sub.chapters.map((ch) => {
                    const full = `${ch.englishTitle} (${ch.bengaliTitle})`;
                    const isDone = completedChapterIds.includes(ch.id);
                    return (
                      <option key={ch.id} value={full} className="bg-[#0b0e15] text-zinc-200 font-normal">
                        {isDone ? '✓ ' : ''}Ch {ch.chapterNumber}: {ch.englishTitle} — {ch.bengaliTitle}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Browse All Chapters Modal Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsChapterModalOpen(true)}
              className="px-3 py-1.5 bg-[#121622] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all btn-tactile"
              title="Open full searchable list of all 79 chapters"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Browse 79 Chapters</span>
            </button>

            {activeChapterTitle && onClearActiveChapter && (
              <button
                onClick={onClearActiveChapter}
                className="px-2 py-1.5 bg-[#121622] border border-white/10 hover:border-red-500/50 text-zinc-400 hover:text-red-400 text-xs transition-all"
                title="Clear current chapter target"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Chapter Selector Chips for the Current Active Subject */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase">
            <span>Quick-Pick from {currentSub.code} ({currentSub.chapters.length} Chapters):</span>
            <button
              onClick={onGoToSyllabus}
              className="text-emerald-400 hover:underline font-bold text-[10px]"
            >
              View Full Syllabus Checklist →
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {currentSub.chapters.map((ch) => {
              const fullTitle = `${ch.englishTitle} (${ch.bengaliTitle})`;
              const isSelectedChapter = activeChapterTitle === fullTitle;
              const isDone = completedChapterIds.includes(ch.id);

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    if (onSelectSubjectAndChapter) {
                      onSelectSubjectAndChapter(currentSub.id, fullTitle);
                    } else {
                      onSelectChapter?.(fullTitle);
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] whitespace-nowrap border flex items-center gap-1.5 transition-all btn-tactile ${
                    isSelectedChapter
                      ? 'bg-emerald-400 text-black font-extrabold border-emerald-300 shadow-[0_0_8px_rgba(5,223,114,0.3)]'
                      : isDone
                      ? 'bg-[#12151f] border-emerald-500/30 text-emerald-400 hover:border-emerald-500'
                      : 'bg-[#10131c] border-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={`${ch.englishTitle} / ${ch.bengaliTitle}`}
                >
                  <span className="font-mono text-[10px] opacity-75">
                    {isDone ? '✓' : `CH ${ch.chapterNumber}`}
                  </span>
                  <span className="font-medium truncate max-w-[140px]">{ch.englishTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Target Chapter Focus Card */}
        {activeChapterTitle ? (
          <div className="p-3 bg-[#121722] border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 bg-emerald-400 led-active flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold block">
                  Active Study Chapter:
                </span>
                <span className="text-emerald-300 font-bold text-xs sm:text-sm truncate block mt-0.5">
                  {activeChapterTitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsChapterModalOpen(true)}
                className="px-2 py-1 bg-[#1a202e] border border-white/10 hover:border-emerald-500/50 text-[10px] text-zinc-300 hover:text-white"
              >
                Change
              </button>
              {onClearActiveChapter && (
                <button
                  onClick={onClearActiveChapter}
                  className="p-1 hover:text-red-400 text-zinc-400"
                  title="Remove active chapter focus"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 bg-[#0d1017] border border-white/[0.04] text-[11px] text-zinc-400 flex items-center justify-between">
            <span>
              No chapter selected (studying general <strong className="text-zinc-200">{currentSub.label}</strong>).
            </span>
            <button
              onClick={() => setIsChapterModalOpen(true)}
              className="text-emerald-400 hover:underline text-[10px] font-bold"
            >
              + Select Chapter
            </button>
          </div>
        )}
      </div>

      {/* Centerpiece Chronometer Dial */}
      <div className="bg-[#090b10] border border-white/[0.07] p-8 sm:p-12 flex flex-col items-center justify-center relative">
        {/* Preset Selector Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {[25, 50, 90, 120].map((minsPreset) => (
            <button
              key={minsPreset}
              onClick={() => onSetPreset(minsPreset)}
              className={`px-3.5 py-1.5 border text-xs font-bold transition-all btn-tactile ${
                !isBreak && durationSec === minsPreset * 60
                  ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/[0.06] bg-[#12151e] text-zinc-400 hover:text-white'
              }`}
            >
              {minsPreset}M
            </button>
          ))}

          <button
            onClick={() => onSetPreset(10, true)}
            className={`px-3.5 py-1.5 border text-xs font-bold transition-all btn-tactile ${
              isBreak
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                : 'border-white/[0.06] bg-[#12151e] text-zinc-400 hover:text-white'
            }`}
          >
            REST 10M
          </button>

          <div className="flex items-center ml-2 border-l border-white/10 pl-2 gap-1.5">
            <button
              onClick={() => onAdjustMinutes(-5)}
              className="p-1.5 bg-[#12151e] border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white text-xs btn-tactile"
              title="Subtract 5 Minutes"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAdjustMinutes(5)}
              className="p-1.5 bg-[#12151e] border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white text-xs btn-tactile"
              title="Add 5 Minutes"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Digital Clock Numerals */}
        <div className="text-8xl sm:text-9xl md:text-[10rem] font-bold tracking-tighter text-white font-mono my-4 flex items-center justify-center select-none leading-none">
          <span>{formatTime(mins)}</span>
          <span className={`mx-1 ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-zinc-700'}`}>
            :
          </span>
          <span>{formatTime(secs)}</span>
        </div>

        {/* Primary Tactile Push Keys */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 w-full max-w-lg">
          <button
            onClick={onStartPause}
            className={`flex-1 py-4 px-8 border font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all btn-tactile ${
              isRunning
                ? 'bg-[#eab308] text-black border-yellow-400 hover:bg-[#facc15]'
                : 'bg-emerald-400 text-black border-emerald-300 hover:bg-emerald-300'
            }`}
          >
            {isRunning ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black" />
            )}
            <span>{isRunning ? 'PAUSE CLOCK' : 'START STUDY'}</span>
          </button>

          <button
            onClick={onReset}
            className="py-4 px-5 bg-[#12151e] border border-white/10 hover:border-white/25 text-zinc-300 hover:text-white font-bold text-xs uppercase btn-tactile"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onCommitEarly}
            className="py-4 px-6 bg-[#12151e] border border-emerald-500/40 hover:border-emerald-500/70 text-emerald-400 font-bold text-xs uppercase flex items-center gap-2 btn-tactile"
            title="Bank elapsed focus minutes directly to today's 8.5h quota"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>BANK TO 8.5H</span>
          </button>
        </div>
      </div>

      {/* Bottom Mini Telemetry Bar with quick jump to Tracker Page */}
      <div className="p-4 bg-[#090b10] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-zinc-500 uppercase tracking-widest text-[10px] block">
              Today's 8.5H Admission Standard
            </span>
            <span className="text-white font-bold text-sm">
              {totalHoursToday} / 8.5 Hours Banked{' '}
              <span className="text-emerald-400 text-xs">({percentage}%)</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGoToSyllabus}
            className="px-3 py-1.5 bg-[#141822] border border-white/10 hover:border-emerald-500/50 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-colors btn-tactile"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Syllabus Checklist</span>
          </button>

          <button
            onClick={onGoToTracker}
            className="px-3 py-1.5 bg-[#141822] border border-white/10 hover:border-emerald-500/50 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-colors btn-tactile"
          >
            <span>17-Block Telemetry</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
