import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

import { BD_GOVT_MEDICAL_COLLEGES, HSC_BATCHES, HSCBatch, GovtMedicalCollege } from './data/medicalColleges';
import { MEDICAL_SUBJECTS, ALL_CHAPTERS, TOTAL_CHAPTER_COUNT } from './data/medicalCurriculum';
import { soundEngine, AmbientSoundType } from './utils/audio';
import { NavigationHeader, ActivePage } from './components/NavigationHeader';
import { TimerPage } from './components/TimerPage';
import { TrackerPage, StudySession } from './components/TrackerPage';
import { SubjectsPage } from './components/SubjectsPage';
import { CollegeSelectorModal } from './components/CollegeSelectorModal';
import { ZenKioskMode } from './components/ZenKioskMode';
import { MedicalSubject } from './types/medical';

const STORAGE_KEY = 'medicore_master_v7';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const VALID_SUBJECT_IDS = new Set<string>(MEDICAL_SUBJECTS.map((s) => s.id));

export default function App() {
  // Navigation State: 'timer' | 'tracker' | 'subjects'
  const [activePage, setActivePage] = useState<ActivePage>('timer');

  // Candidate Profile State
  const [hscBatch, setHscBatch] = useState<HSCBatch>(() => {
    return (localStorage.getItem(STORAGE_KEY + '_batch') as HSCBatch) || '27';
  });
  const [collegeId, setCollegeId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY + '_college') || 'dmc';
  });
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);

  // Completed Chapters State (Persistent Checklist)
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_completed_chapters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Today's Study Sessions
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const todayKey = getTodayKey();
      const saved = localStorage.getItem(STORAGE_KEY + '_sessions');
      if (saved) {
        const parsed: StudySession[] = JSON.parse(saved);
        return parsed.filter((s) => s.dateKey === todayKey);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Timer Core Engine (Drift-Proof Timestamp System)
  const [subject, setSubject] = useState<MedicalSubject>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_subject');
    if (saved && VALID_SUBJECT_IDS.has(saved)) {
      return saved as MedicalSubject;
    }
    return 'botany_1';
  });
  const [activeChapterTitle, setActiveChapterTitle] = useState<string | undefined>(undefined);
  const [durationSec, setDurationSec] = useState(50 * 60);
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(null);
  const [isBreak, setIsBreak] = useState(false);

  // Audio & Kiosk
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [isZenMode, setIsZenMode] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_batch', hscBatch);
  }, [hscBatch]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_college', collegeId);
  }, [collegeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_subject', subject);
  }, [subject]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_completed_chapters', JSON.stringify(completedChapterIds));
  }, [completedChapterIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Telemetry Calculations for 8.5 Hours Quota
  const totalMinutesToday = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const targetMinutes = 8.5 * 60; // 510 minutes
  const totalHoursToday = (totalMinutesToday / 60).toFixed(1);
  const remainingMinutes = Math.max(0, targetMinutes - totalMinutesToday);
  const remainingHours = (remainingMinutes / 60).toFixed(1);
  const percentage = Math.min(100, Math.round((totalMinutesToday / targetMinutes) * 100));

  // 17 Blocks (30 minutes each = 510m = 8.5 hours)
  const TOTAL_BLOCKS = 17;
  const completedBlocks = Math.min(TOTAL_BLOCKS, Math.floor(totalMinutesToday / 30));

  // 8.5H Goal Accomplished Trigger
  useEffect(() => {
    if (totalMinutesToday >= targetMinutes && !celebrated && totalMinutesToday > 0) {
      setCelebrated(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#05df72', '#ffffff', '#22d3ee', '#fbbf24'],
      });
      soundEngine.playCompletionChime();
    }
  }, [totalMinutesToday, targetMinutes, celebrated]);

  // Session commit handler
  const commitMinutes = useCallback(
    (mins: number, targetSubject?: MedicalSubject, targetChapter?: string) => {
      if (mins <= 0) return;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newSession: StudySession = {
        id: Date.now().toString(),
        subject: targetSubject || subject,
        chapter: targetChapter || activeChapterTitle,
        durationMinutes: mins,
        time: timeStr,
        dateKey: getTodayKey(),
      };
      setSessions((prev) => [...prev, newSession]);
      soundEngine.playCompletionChime();
    },
    [subject, activeChapterTitle]
  );

  // Drift-Proof Timer Tick
  useEffect(() => {
    if (!isRunning || !targetEndTime) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setIsRunning(false);
        setTargetEndTime(null);
        if (!isBreak) {
          commitMinutes(Math.round(durationSec / 60));
        } else {
          soundEngine.playCompletionChime();
        }
      }
    };

    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [isRunning, targetEndTime, durationSec, isBreak, commitMinutes]);

  // Timer Actions
  const handleStartPause = () => {
    soundEngine.playKeyClick();
    if (isRunning) {
      if (targetEndTime) {
        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
      }
      setIsRunning(false);
      setTargetEndTime(null);
    } else {
      const time = timeLeft > 0 ? timeLeft : durationSec;
      setTargetEndTime(Date.now() + time * 1000);
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    soundEngine.playKeyClick(0.9);
    setIsRunning(false);
    setTargetEndTime(null);
    setTimeLeft(durationSec);
  };

  const handleCommitEarly = () => {
    soundEngine.playKeyClick(1.2);
    const elapsed = durationSec - timeLeft;
    const elapsedMins = Math.floor(elapsed / 60);
    if (elapsedMins >= 1 && !isBreak) {
      commitMinutes(elapsedMins);
    }
    setIsRunning(false);
    setTargetEndTime(null);
    setTimeLeft(durationSec);
  };

  const handleSetPreset = (mins: number, breakMode = false) => {
    soundEngine.playKeyClick();
    setIsRunning(false);
    setTargetEndTime(null);
    setIsBreak(breakMode);
    const sec = mins * 60;
    setDurationSec(sec);
    setTimeLeft(sec);
  };

  const handleAdjustMinutes = (delta: number) => {
    soundEngine.playKeyClick(1.1);
    const currentMins = Math.floor(timeLeft / 60);
    const nextMins = Math.max(5, currentMins + delta);
    const newSec = nextMins * 60;
    setDurationSec(newSec);
    setTimeLeft(newSec);
    if (isRunning) {
      setTargetEndTime(Date.now() + newSec * 1000);
    }
  };

  const handleQuickAdd = (mins: number, targetSubject?: MedicalSubject, targetChapter?: string) => {
    soundEngine.playKeyClick(1.1);
    commitMinutes(mins, targetSubject, targetChapter);
  };

  const handleDeleteSession = (id: string) => {
    soundEngine.playKeyClick(0.8);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearSessions = () => {
    setSessions([]);
    setCelebrated(false);
  };

  const handleCycleSound = () => {
    const SOUND_LIST: AmbientSoundType[] = ['none', 'gamma40', 'pink', 'white', 'rain'];
    const next = SOUND_LIST[(SOUND_LIST.indexOf(ambientSound) + 1) % SOUND_LIST.length];
    setAmbientSound(next);
    soundEngine.startAmbient(next);
  };

  // Syllabus & Chapter Done Toggle
  const handleToggleChapterDone = (chapterId: string) => {
    setCompletedChapterIds((prev) => {
      const isAlreadyDone = prev.includes(chapterId);
      if (isAlreadyDone) {
        return prev.filter((id) => id !== chapterId);
      } else {
        const next = [...prev, chapterId];
        // Celebrate full completion
        if (next.length === TOTAL_CHAPTER_COUNT) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
          });
        }
        return next;
      }
    });
  };

  // Batch Mark all chapters in a subject done / undone
  const handleBatchMarkSubject = (subjectId: MedicalSubject, markDone: boolean) => {
    const sub = MEDICAL_SUBJECTS.find((s) => s.id === subjectId);
    if (!sub) return;
    const subChapterIds = sub.chapters.map((c) => c.id);

    setCompletedChapterIds((prev) => {
      if (markDone) {
        const set = new Set([...prev, ...subChapterIds]);
        return Array.from(set);
      } else {
        return prev.filter((id) => !subChapterIds.includes(id));
      }
    });
  };

  // Launch Study from Chapter or Subject
  const handleSelectSubjectAndStudy = (s: MedicalSubject, chapterTitle?: string) => {
    setSubject(s);
    if (chapterTitle) {
      setActiveChapterTitle(chapterTitle);
    }
    setIsBreak(false);
    setActivePage('timer');
  };

  // Global Keyboard Shortcuts
  // 1: Timer page, 2: Tracker page, 3: Subjects page
  // Space: Start/Pause, R: Reset, F: Fullscreen, Esc: Exit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Digit1') {
        setActivePage('timer');
      } else if (e.code === 'Digit2') {
        setActivePage('tracker');
      } else if (e.code === 'Digit3') {
        setActivePage('subjects');
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleStartPause();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        setIsZenMode((p) => !p);
      } else if (e.code === 'Escape') {
        if (isZenMode) setIsZenMode(false);
        if (isCollegeModalOpen) setIsCollegeModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRunning, timeLeft, targetEndTime, durationSec, isZenMode, isCollegeModalOpen]);

  const selectedCollege =
    BD_GOVT_MEDICAL_COLLEGES.find((c) => c.id === collegeId) || BD_GOVT_MEDICAL_COLLEGES[0];

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="min-h-screen bg-[#07080b] bg-grid-hairline text-zinc-100 flex flex-col items-center p-3 sm:p-6 md:p-8 font-mono select-none">
      {/* Fullscreen Zen Kiosk Mode */}
      {isZenMode && (
        <ZenKioskMode
          mins={mins}
          secs={secs}
          isRunning={isRunning}
          subject={subject}
          activeChapterTitle={activeChapterTitle}
          totalHoursToday={totalHoursToday}
          targetMinutes={targetMinutes}
          totalMinutesToday={totalMinutesToday}
          percentage={percentage}
          targetCollegeName={`${selectedCollege.shortName} (${selectedCollege.seats} seats)`}
          onStartPause={handleStartPause}
          onReset={handleReset}
          onCommitEarly={handleCommitEarly}
          onExit={() => setIsZenMode(false)}
        />
      )}

      {/* College Selector Modal */}
      <CollegeSelectorModal
        isOpen={isCollegeModalOpen}
        onClose={() => setIsCollegeModalOpen(false)}
        selectedId={collegeId}
        onSelect={(id) => setCollegeId(id)}
      />

      {/* Top Luxury Hardware Navigation Bar */}
      <NavigationHeader
        activePage={activePage}
        onPageChange={(page) => setActivePage(page)}
        isTimerRunning={isRunning}
        totalHoursToday={totalHoursToday}
        hscBatch={hscBatch}
        onBatchChange={(b) => setHscBatch(b)}
        selectedCollege={selectedCollege}
        onOpenCollegeModal={() => setIsCollegeModalOpen(true)}
        ambientSound={ambientSound}
        onCycleSound={handleCycleSound}
        onEnterKiosk={() => setIsZenMode(true)}
      />

      {/* PAGE 1: DEDICATED TIMER PAGE */}
      {activePage === 'timer' && (
        <TimerPage
          mins={mins}
          secs={secs}
          isRunning={isRunning}
          subject={subject}
          onSubjectChange={(s) => {
            setSubject(s);
            setActiveChapterTitle(undefined);
            setIsBreak(false);
          }}
          activeChapterTitle={activeChapterTitle}
          onClearActiveChapter={() => setActiveChapterTitle(undefined)}
          onSelectChapter={(chap) => setActiveChapterTitle(chap)}
          onSelectSubjectAndChapter={(subId, chap) => {
            setSubject(subId);
            setActiveChapterTitle(chap);
            setIsBreak(false);
          }}
          completedChapterIds={completedChapterIds}
          durationSec={durationSec}
          isBreak={isBreak}
          onStartPause={handleStartPause}
          onReset={handleReset}
          onCommitEarly={handleCommitEarly}
          onSetPreset={handleSetPreset}
          onAdjustMinutes={handleAdjustMinutes}
          totalHoursToday={totalHoursToday}
          percentage={percentage}
          onGoToTracker={() => setActivePage('tracker')}
          onGoToSyllabus={() => setActivePage('subjects')}
          targetCollegeShortName={selectedCollege.shortName}
        />
      )}

      {/* PAGE 2: DEDICATED 8.5H TRACKER PAGE */}
      {activePage === 'tracker' && (
        <TrackerPage
          sessions={sessions}
          totalHoursToday={totalHoursToday}
          totalMinutesToday={totalMinutesToday}
          targetMinutes={targetMinutes}
          remainingHours={remainingHours}
          percentage={percentage}
          completedBlocks={completedBlocks}
          isTimerRunning={isRunning}
          selectedCollege={selectedCollege}
          hscBatch={hscBatch}
          onQuickAdd={handleQuickAdd}
          onDeleteSession={handleDeleteSession}
          onClearSessions={handleClearSessions}
        />
      )}

      {/* PAGE 3: DEDICATED SYLLABUS & CHAPTERS PAGE */}
      {activePage === 'subjects' && (
        <SubjectsPage
          onSelectSubjectAndStudy={handleSelectSubjectAndStudy}
          activeSubject={subject}
          completedChapterIds={completedChapterIds}
          onToggleChapterDone={handleToggleChapterDone}
          onBatchMarkSubject={handleBatchMarkSubject}
          sessions={sessions}
        />
      )}

      {/* Footer Hotkey & Admission Note */}
      <footer className="w-full max-w-4xl mt-4 px-2 text-[10px] text-zinc-500 flex flex-wrap items-center justify-between gap-2 font-mono">
        <div>
          Keys: <span className="text-zinc-400">1</span> Chronometer · <span className="text-zinc-400">2</span> 8.5H Tracker · <span className="text-zinc-400">3</span> Syllabus Checklist · <span className="text-zinc-400">Space</span> Start/Pause · <span className="text-zinc-400">F</span> Fullscreen
        </div>
        <div className="text-zinc-500">
          Target: {selectedCollege.name} ({selectedCollege.city}) · 8.5h Daily Standard
        </div>
      </footer>
    </div>
  );
}
