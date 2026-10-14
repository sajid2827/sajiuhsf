import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, Check, ArrowRight } from 'lucide-react';
import { MedicalSubject } from '../types/medical';
import { MEDICAL_SUBJECTS, ALL_CHAPTERS } from '../data/medicalCurriculum';

interface ChapterPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject: MedicalSubject;
  currentChapterTitle?: string;
  completedChapterIds?: string[];
  onSelectChapter: (subjectId: MedicalSubject, chapterTitle: string) => void;
}

export const ChapterPickerModal: React.FC<ChapterPickerModalProps> = ({
  isOpen,
  onClose,
  currentSubject,
  currentChapterTitle,
  completedChapterIds = [],
  onSelectChapter,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPaperTab, setSelectedPaperTab] = useState<MedicalSubject | 'all'>('all');

  const filteredChapters = useMemo(() => {
    return ALL_CHAPTERS.filter((ch) => {
      if (selectedPaperTab !== 'all' && ch.subjectId !== selectedPaperTab) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchEng = ch.englishTitle.toLowerCase().includes(q);
        const matchBeng = ch.bengaliTitle.toLowerCase().includes(q);
        const matchSub = ch.subjectLabel.toLowerCase().includes(q) || ch.subjectCode.toLowerCase().includes(q);
        if (!matchEng && !matchBeng && !matchSub) return false;
      }
      return true;
    });
  }, [search, selectedPaperTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0b0d14] border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0e111a]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase">
                Select Study Chapter (All 9 Papers)
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans">
                Choose any chapter from all subjects to set as your active timer target.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 bg-[#12151f]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-white/[0.06] bg-[#090b10] flex flex-col gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chapter or topic (e.g. Cell, ভেক্টর, Organic, Matrix)..."
              autoFocus
              className="w-full bg-[#12151f] border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Paper Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
            <button
              onClick={() => setSelectedPaperTab('all')}
              className={`px-2 py-0.5 border whitespace-nowrap font-bold transition-all ${
                selectedPaperTab === 'all'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#12151f] border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              ALL (79)
            </button>
            {MEDICAL_SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedPaperTab(s.id)}
                className={`px-2 py-0.5 border whitespace-nowrap font-bold transition-all ${
                  selectedPaperTab === s.id
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-[#12151f] border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {s.code}
              </button>
            ))}
          </div>
        </div>

        {/* Chapters List */}
        <div className="p-3 overflow-y-auto flex flex-col gap-1.5 flex-1 max-h-[55vh]">
          {filteredChapters.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
              No chapters match your search query.
            </div>
          ) : (
            filteredChapters.map((ch) => {
              const fullTitle = `${ch.englishTitle} (${ch.bengaliTitle})`;
              const isCurrent = currentChapterTitle === fullTitle;
              const isCompleted = completedChapterIds.includes(ch.id);

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelectChapter(ch.subjectId, fullTitle);
                    onClose();
                  }}
                  className={`p-2.5 border text-left flex items-center justify-between gap-3 transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                      : 'bg-[#10131c] border-white/[0.05] hover:border-emerald-500/40 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-1.5 py-0.5 bg-[#161a26] border border-white/10 text-[9px] text-emerald-400 font-bold flex-shrink-0">
                      {ch.subjectCode}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          CH {String(ch.chapterNumber).padStart(2, '0')}
                        </span>
                        <span className="text-xs font-semibold truncate text-zinc-100">
                          {ch.englishTitle}
                        </span>
                        {isCompleted && (
                          <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold">
                            DONE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-sans truncate">
                        {ch.bengaliTitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isCurrent ? (
                      <span className="px-2 py-0.5 bg-emerald-400 text-black text-[10px] font-bold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        SELECT <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0e111a] flex items-center justify-between text-[11px] text-zinc-500">
          <span>
            Showing <strong className="text-zinc-300">{filteredChapters.length}</strong> of 79 chapters
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#151824] border border-white/10 text-zinc-300 hover:text-white text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
