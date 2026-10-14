import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  RotateCcw,
  ListFilter,
  BarChart2,
} from 'lucide-react';
import { MedicalSubject, SubjectOption } from '../types/medical';
import { MEDICAL_SUBJECTS, ALL_CHAPTERS, TOTAL_CHAPTER_COUNT } from '../data/medicalCurriculum';
import { soundEngine } from '../utils/audio';

interface SubjectsPageProps {
  onSelectSubjectAndStudy: (s: MedicalSubject, chapterTitle?: string) => void;
  activeSubject: MedicalSubject;
  completedChapterIds: string[];
  onToggleChapterDone: (chapterId: string) => void;
  onBatchMarkSubject?: (subjectId: MedicalSubject, markDone: boolean) => void;
  sessions: { subject: MedicalSubject; durationMinutes: number }[];
}

type ChapterFilter = 'all' | 'pending' | 'completed';

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  onSelectSubjectAndStudy,
  activeSubject,
  completedChapterIds,
  onToggleChapterDone,
  onBatchMarkSubject,
  sessions,
}) => {
  const [selectedSubjectTab, setSelectedSubjectTab] = useState<MedicalSubject | 'all'>('all');
  const [filterMode, setFilterMode] = useState<ChapterFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate today's minutes per subject
  const subjectTimeMap = useMemo(() => {
    const map: Record<string, number> = {};
    MEDICAL_SUBJECTS.forEach((s) => {
      map[s.id] = 0;
    });
    sessions.forEach((s) => {
      if (map[s.subject] !== undefined) {
        map[s.subject] += s.durationMinutes;
      }
    });
    return map;
  }, [sessions]);

  // Overall syllabus completion
  const completedCount = completedChapterIds.length;
  const overallPercentage = Math.round((completedCount / TOTAL_CHAPTER_COUNT) * 100);

  // Filtered chapters list
  const filteredSubjects = useMemo(() => {
    return MEDICAL_SUBJECTS.filter((sub) => {
      if (selectedSubjectTab !== 'all' && sub.id !== selectedSubjectTab) return false;
      return true;
    }).map((sub) => {
      const chapters = sub.chapters.filter((ch) => {
        const isDone = completedChapterIds.includes(ch.id);
        if (filterMode === 'pending' && isDone) return false;
        if (filterMode === 'completed' && !isDone) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchEnglish = ch.englishTitle.toLowerCase().includes(q);
          const matchBengali = ch.bengaliTitle.toLowerCase().includes(q);
          const matchSub = sub.label.toLowerCase().includes(q) || sub.bengaliLabel.toLowerCase().includes(q);
          if (!matchEnglish && !matchBengali && !matchSub) return false;
        }

        return true;
      });

      return {
        ...sub,
        filteredChapters: chapters,
      };
    });
  }, [selectedSubjectTab, filterMode, searchQuery, completedChapterIds]);

  return (
    <div className="w-full max-w-4xl chassis-box p-5 sm:p-8 flex flex-col gap-6 font-mono animate-in fade-in duration-150">
      {/* Top Banner: Master Syllabus & Progress Tracker */}
      <div className="bg-[#090b10] border border-white/[0.07] p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 led-active" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Official HSC & Admission Syllabus Ledger
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Complete chapter checklist across all 9 science papers. Mark chapters done to track admission readiness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 bg-[#12151e] border border-emerald-500/30 text-xs flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                Syllabus Mastered
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-emerald-400 font-bold text-base">{completedCount}</span>
                <span className="text-zinc-500 text-xs">/ {TOTAL_CHAPTER_COUNT} Chapters</span>
                <span className="text-emerald-300 font-bold text-xs ml-1">({overallPercentage}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span className="font-semibold text-zinc-300">Total Completion Milestone</span>
            <span className="text-emerald-400 font-bold">{overallPercentage}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-[#12151f] border border-white/10 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300 shadow-[0_0_8px_rgba(5,223,114,0.6)]"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Status Filter Buttons: All / Pending / Completed */}
          <div className="flex items-center bg-[#12151f] border border-white/[0.08] p-1 gap-1">
            <button
              onClick={() => {
                soundEngine.playKeyClick();
                setFilterMode('all');
              }}
              className={`px-3 py-1 text-xs font-bold transition-all btn-tactile ${
                filterMode === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              ALL ({TOTAL_CHAPTER_COUNT})
            </button>
            <button
              onClick={() => {
                soundEngine.playKeyClick();
                setFilterMode('pending');
              }}
              className={`px-3 py-1 text-xs font-bold transition-all btn-tactile ${
                filterMode === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              PENDING ({TOTAL_CHAPTER_COUNT - completedCount})
            </button>
            <button
              onClick={() => {
                soundEngine.playKeyClick();
                setFilterMode('completed');
              }}
              className={`px-3 py-1 text-xs font-bold transition-all btn-tactile ${
                filterMode === 'completed'
                  ? 'bg-emerald-400 text-black font-extrabold border border-emerald-300'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              DONE ({completedCount})
            </button>
          </div>

          {/* Instant Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapter or topic (e.g. Cell, ভেক্টর, জৈব)..."
              className="w-full bg-[#12151f] border border-white/10 hover:border-white/20 focus:border-emerald-500/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 9-Subject Horizontal Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => {
              soundEngine.playKeyClick();
              setSelectedSubjectTab('all');
            }}
            className={`px-2.5 py-1 text-[11px] font-bold whitespace-nowrap border transition-all btn-tactile ${
              selectedSubjectTab === 'all'
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(5,223,114,0.1)]'
                : 'bg-[#12151f] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ALL 9 PAPERS
          </button>

          {MEDICAL_SUBJECTS.map((sub) => {
            const isTabActive = selectedSubjectTab === sub.id;
            const subDoneCount = sub.chapters.filter((c) => completedChapterIds.includes(c.id)).length;
            const isAllDone = subDoneCount === sub.chapters.length;

            return (
              <button
                key={sub.id}
                onClick={() => {
                  soundEngine.playKeyClick();
                  setSelectedSubjectTab(sub.id);
                }}
                className={`px-2.5 py-1 text-[11px] font-bold whitespace-nowrap border flex items-center gap-1.5 transition-all btn-tactile ${
                  isTabActive
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(5,223,114,0.1)]'
                    : isAllDone
                    ? 'bg-[#12151f] border-emerald-500/30 text-emerald-400'
                    : 'bg-[#12151f] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{sub.code}</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  ({subDoneCount}/{sub.chapters.length})
                </span>
                {isAllDone && <span className="text-emerald-400 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Chapter Cards List */}
      <div className="flex flex-col gap-6">
        {filteredSubjects.map((sub) => {
          const isSelected = activeSubject === sub.id;
          const bankedMins = subjectTimeMap[sub.id] || 0;
          const bankedHours = (bankedMins / 60).toFixed(1);
          const subDoneCount = sub.chapters.filter((c) => completedChapterIds.includes(c.id)).length;
          const subTotal = sub.chapters.length;
          const subPercent = Math.round((subDoneCount / subTotal) * 100);

          if (filteredSubjects.length > 1 && sub.filteredChapters.length === 0) {
            return null;
          }

          return (
            <div
              key={sub.id}
              className={`border transition-all flex flex-col gap-4 p-5 ${
                isSelected
                  ? 'bg-[#121620] border-emerald-500/60 shadow-[inset_0_0_12px_rgba(5,223,114,0.06)]'
                  : 'bg-[#090b10] border-white/[0.07]'
              }`}
            >
              {/* Subject Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div className="flex items-start gap-3">
                  <div className="px-2.5 py-1 bg-white/5 border border-white/10 text-emerald-400 font-mono font-bold text-xs mt-0.5">
                    {sub.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base tracking-wide">{sub.label}</h3>
                      <span className="text-xs text-zinc-400 font-sans">({sub.bengaliLabel})</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Completed: <strong className="text-emerald-400">{subDoneCount}</strong> / {subTotal} Chapters ({subPercent}%)
                    </div>
                  </div>
                </div>

                {/* Subject Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Mark All / Reset in subject */}
                  {onBatchMarkSubject && (
                    <button
                      onClick={() => {
                        const markAll = subDoneCount < subTotal;
                        soundEngine.playKeyClick(1.2);
                        onBatchMarkSubject(sub.id, markAll);
                      }}
                      className="px-2.5 py-1 bg-[#12151e] border border-white/10 hover:border-white/20 text-[10px] text-zinc-300 hover:text-white transition-all btn-tactile"
                      title={subDoneCount === subTotal ? 'Reset chapters' : 'Mark all completed'}
                    >
                      {subDoneCount === subTotal ? 'RESET ALL' : 'MARK ALL DONE'}
                    </button>
                  )}

                  {/* Switch to this subject in timer */}
                  <button
                    onClick={() => {
                      soundEngine.playKeyClick(1.2);
                      onSelectSubjectAndStudy(sub.id);
                    }}
                    className={`px-3 py-1 border text-xs font-bold flex items-center gap-1.5 transition-all btn-tactile ${
                      isSelected
                        ? 'bg-emerald-400 text-black border-emerald-300 hover:bg-emerald-300'
                        : 'bg-[#131622] border-white/10 hover:border-emerald-500/50 text-zinc-200 hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? 'ACTIVE IN TIMER' : 'SELECT SUBJECT'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subject Chapter Progress Bar */}
              <div className="w-full h-1.5 bg-[#12151f] border border-white/5 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${subPercent}%` }}
                />
              </div>

              {/* Chapters Checklist */}
              {sub.filteredChapters.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500 italic">
                  No chapters matching the selected filter ({filterMode}).
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sub.filteredChapters.map((ch) => {
                    const isDone = completedChapterIds.includes(ch.id);

                    return (
                      <div
                        key={ch.id}
                        className={`p-3 border transition-all flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100 shadow-[inset_0_0_8px_rgba(5,223,114,0.05)]'
                            : 'bg-[#10131c] border-white/[0.05] hover:border-white/15 text-zinc-300'
                        }`}
                      >
                        {/* Interactive Done Checkbox */}
                        <button
                          onClick={() => {
                            soundEngine.playKeyClick(isDone ? 0.9 : 1.3);
                            onToggleChapterDone(ch.id);
                          }}
                          className={`w-6 h-6 flex-shrink-0 flex items-center justify-center border transition-all btn-tactile ${
                            isDone
                              ? 'bg-emerald-400 border-emerald-300 text-black'
                              : 'bg-[#181c26] border-white/20 hover:border-emerald-400 text-transparent'
                          }`}
                          title={isDone ? 'Mark as incomplete' : 'Mark chapter as completed'}
                        >
                          <Check className={`w-4 h-4 stroke-[3] ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                        </button>

                        {/* Chapter Title & Number */}
                        <div
                          onClick={() => {
                            soundEngine.playKeyClick(isDone ? 0.9 : 1.3);
                            onToggleChapterDone(ch.id);
                          }}
                          className="flex-1 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-mono">
                              CH-{String(ch.chapterNumber).padStart(2, '0')}
                            </span>
                            {isDone && (
                              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                DONE
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs font-semibold mt-0.5 leading-snug ${
                              isDone ? 'text-emerald-200 line-through opacity-80' : 'text-zinc-100'
                            }`}
                          >
                            {ch.englishTitle}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-tight">
                            {ch.bengaliTitle}
                          </div>
                        </div>

                        {/* Study Chapter in Timer Action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playKeyClick(1.2);
                            onSelectSubjectAndStudy(sub.id, `${ch.englishTitle} (${ch.bengaliTitle})`);
                          }}
                          className="px-2 py-1 bg-[#151924] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-all flex-shrink-0 btn-tactile"
                          title="Set this chapter as active target in Timer"
                        >
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span className="hidden sm:inline">STUDY</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Subject Footer Telemetry */}
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500">
                <span>
                  Study Time Today: <strong className="text-zinc-300">{bankedHours}h ({bankedMins}m)</strong>
                </span>
                <span>
                  Status: <strong className={subDoneCount === subTotal ? 'text-emerald-400' : 'text-zinc-400'}>
                    {subDoneCount === subTotal ? 'COMPLETED' : `${subTotal - subDoneCount} PENDING`}
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
