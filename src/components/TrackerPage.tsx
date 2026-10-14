import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Clock,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { MedicalSubject } from '../types/medical';
import { MEDICAL_SUBJECTS } from '../data/medicalCurriculum';
import { GovtMedicalCollege, HSCBatch } from '../data/medicalColleges';
import { soundEngine } from '../utils/audio';

export interface StudySession {
  id: string;
  subject: MedicalSubject;
  chapter?: string;
  durationMinutes: number;
  time: string;
  dateKey: string;
}

interface TrackerPageProps {
  sessions: StudySession[];
  totalHoursToday: string;
  totalMinutesToday: number;
  targetMinutes: number;
  remainingHours: string;
  percentage: number;
  completedBlocks: number;
  isTimerRunning: boolean;
  selectedCollege: GovtMedicalCollege;
  hscBatch: HSCBatch;
  onQuickAdd: (mins: number, subject?: MedicalSubject, chapter?: string) => void;
  onDeleteSession: (id: string) => void;
  onClearSessions: () => void;
}

export const TrackerPage: React.FC<TrackerPageProps> = ({
  sessions,
  totalHoursToday,
  totalMinutesToday,
  targetMinutes,
  remainingHours,
  percentage,
  completedBlocks,
  isTimerRunning,
  selectedCollege,
  hscBatch,
  onQuickAdd,
  onDeleteSession,
  onClearSessions,
}) => {
  const TOTAL_BLOCKS = 17; // 17 blocks * 30 min = 510 min = 8.5 hours
  const [offlineSubject, setOfflineSubject] = useState<MedicalSubject>('botany_1');
  const [offlineChapter, setOfflineChapter] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Dynamic Subject Time Map
  const subjectTimeMap: Record<string, number> = {};
  MEDICAL_SUBJECTS.forEach((s) => {
    subjectTimeMap[s.id] = 0;
  });

  sessions.forEach((s) => {
    if (subjectTimeMap[s.subject] !== undefined) {
      subjectTimeMap[s.subject] += s.durationMinutes;
    }
  });

  const currentOfflineSub = MEDICAL_SUBJECTS.find((s) => s.id === offlineSubject) || MEDICAL_SUBJECTS[0];

  return (
    <div className="w-full max-w-4xl chassis-box p-5 sm:p-8 flex flex-col gap-6 font-mono animate-in fade-in duration-150">
      {/* Top Banner: Admission Telemetry Overview */}
      <div className="bg-[#090b10] border border-white/[0.07] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                Daily Medical Quota Telemetry
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                8.5 HOURS / DAY BENCHMARK
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {totalHoursToday}
              </span>
              <span className="text-sm text-zinc-500 uppercase font-semibold">
                / 8.5 Hours Banked Today
              </span>
              <span className="text-sm text-emerald-400 font-bold ml-1">
                ({percentage}%)
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
              Target Candidate Profile
            </span>
            <div className="text-sm text-white font-bold flex items-center gap-1.5 sm:justify-end">
              <span>HSC Batch '{hscBatch}</span>
              <span className="text-zinc-600">→</span>
              <span className="text-emerald-400">{selectedCollege.shortName}</span>
            </div>
            <div className="text-xs text-zinc-400">
              {totalMinutesToday >= targetMinutes ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1 sm:justify-end">
                  <Sparkles className="w-3.5 h-3.5" /> 8.5H Goal Accomplished!
                </span>
              ) : (
                <span>Deficit: <strong className="text-white">{remainingHours} hrs</strong> to reach quota</span>
              )}
            </div>
          </div>
        </div>

        {/* 17 PHYSICAL SEGMENTED LED BARS (Each 30m = 8.5h total) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-300">
              17-Stage Quota Matrix (30 Mins Each)
            </span>
            <span className="text-zinc-500 text-[10px]">
              {completedBlocks} of 17 Segments Completed
            </span>
          </div>

          <div className="grid grid-cols-17 gap-1 w-full">
            {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => {
              const isCompleted = i < completedBlocks;
              const isCurrentlyPulsing = isTimerRunning && i === completedBlocks;
              return (
                <div
                  key={i}
                  className={`h-9 border flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                    isCompleted
                      ? 'border-emerald-400/80 led-active text-black'
                      : isCurrentlyPulsing
                      ? 'border-emerald-400 led-pulsing text-white'
                      : 'bg-[#11141c] border-white/[0.04] text-zinc-600'
                  }`}
                  title={`Segment ${i + 1} (${((i + 1) * 0.5).toFixed(1)}h mark)`}
                >
                  <span>{isCompleted ? '✓' : i + 1}</span>
                  <span className="text-[7px] opacity-75 hidden sm:inline">
                    {((i + 1) * 0.5).toFixed(1)}h
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 px-0.5 pt-1">
            <span>0.0h Start</span>
            <span>4.5h Halfway</span>
            <span className="text-emerald-400 font-bold">8.5h Daily Admission Quota</span>
          </div>
        </div>
      </div>

      {/* Offline Textbook Quick-Study Bank Module */}
      <div className="bg-[#090b10] border border-white/[0.07] p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-white">
              Bank Offline Textbook Reading / Practice
            </span>
          </div>
          <span className="text-[10px] text-zinc-500">
            For textbook & question bank sessions
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Subject Picker for Offline Bank */}
          <select
            value={offlineSubject}
            onChange={(e) => {
              setOfflineSubject(e.target.value as MedicalSubject);
              setOfflineChapter('');
            }}
            className="bg-[#12151e] border border-white/10 px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none cursor-pointer"
          >
            {MEDICAL_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#111319] text-white">
                {s.code}: {s.label}
              </option>
            ))}
          </select>

          {/* Chapter Picker (Optional) */}
          <select
            value={offlineChapter}
            onChange={(e) => setOfflineChapter(e.target.value)}
            className="bg-[#12151e] border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none max-w-xs"
          >
            <option value="">General Subject Practice</option>
            {currentOfflineSub.chapters.map((ch) => (
              <option key={ch.id} value={`${ch.englishTitle} (${ch.bengaliTitle})`}>
                Ch {ch.chapterNumber}: {ch.englishTitle}
              </option>
            ))}
          </select>

          {/* Quick Bank Increment Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  soundEngine.playKeyClick(1.2);
                  onQuickAdd(mins, offlineSubject, offlineChapter || undefined);
                }}
                className="px-3 py-1.5 border border-white/10 hover:border-emerald-500/50 bg-[#12151e] hover:bg-[#161a26] text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1 btn-tactile"
              >
                <Plus className="w-3 h-3 text-emerald-400" /> +{mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 9-Paper Distribution Breakdown */}
      <div className="bg-[#090b10] border border-white/[0.07] p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-300">
            Today's Syllabus Balance (9 Papers)
          </span>
          <span className="text-zinc-500 text-[10px]">Active Study Distribution</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9 gap-2">
          {MEDICAL_SUBJECTS.map((s) => {
            const mins = subjectTimeMap[s.id] || 0;
            const hours = (mins / 60).toFixed(1);
            return (
              <div
                key={s.id}
                className="bg-[#12151e] border border-white/[0.05] p-2 flex flex-col justify-between"
              >
                <div className="text-[10px] text-zinc-400 font-mono font-bold">
                  {s.code}
                </div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">{s.paperLabel}</div>
                <div className="mt-2 pt-1 border-t border-white/[0.05] flex items-baseline justify-between">
                  <span className="text-xs text-emerald-400 font-bold">{hours}h</span>
                  <span className="text-[9px] text-zinc-500 font-mono">{mins}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological Session Audit Trail */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-500 uppercase font-bold tracking-wider">
          <span>Today's Banked Sessions ({sessions.length})</span>
          {sessions.length > 0 && (
            <div>
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-[10px]">Clear all today?</span>
                  <button
                    onClick={() => {
                      onClearSessions();
                      setConfirmClear(false);
                      soundEngine.playKeyClick(0.8);
                    }}
                    className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-bold"
                  >
                    CONFIRM
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[9px]"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-zinc-500 hover:text-red-400 flex items-center gap-1 text-[10px] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> CLEAR TODAY'S LEDGER
                </button>
              )}
            </div>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/[0.07] bg-[#090b10] text-xs text-zinc-500 font-mono">
            No study sessions banked today. Use the Chronometer or offline Quick-Bank to start your 8.5H quota.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
            {sessions.slice().reverse().map((s) => {
              const sub = MEDICAL_SUBJECTS.find((sub) => sub.id === s.subject) || MEDICAL_SUBJECTS[0];
              return (
                <div
                  key={s.id}
                  className="bg-[#090b10] border border-white/[0.05] hover:border-white/10 p-3 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 bg-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white tracking-wide">{sub.label}</span>
                        <span className="text-[10px] text-zinc-500">[{sub.code}]</span>
                      </div>
                      {s.chapter && (
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                          ↳ {s.chapter}
                        </div>
                      )}
                    </div>
                    <span className="text-zinc-600">·</span>
                    <span className="text-emerald-400 font-bold font-mono whitespace-nowrap">
                      {s.durationMinutes}m
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 flex-shrink-0">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-zinc-600" /> {s.time}
                    </span>
                    <button
                      onClick={() => onDeleteSession(s.id)}
                      className="hover:text-red-400 text-zinc-600 hover:bg-zinc-800 p-1 text-xs transition-colors"
                      title="Delete entry"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
