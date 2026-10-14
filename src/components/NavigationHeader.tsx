import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  ChevronDown,
  Timer,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { HSCBatch, GovtMedicalCollege } from '../data/medicalColleges';
import { AmbientSoundType, soundEngine } from '../utils/audio';

export type ActivePage = 'timer' | 'tracker' | 'subjects';

interface NavigationHeaderProps {
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  isTimerRunning: boolean;
  totalHoursToday: string;
  hscBatch: HSCBatch;
  onBatchChange: (batch: HSCBatch) => void;
  selectedCollege: GovtMedicalCollege;
  onOpenCollegeModal: () => void;
  ambientSound: AmbientSoundType;
  onCycleSound: () => void;
  onEnterKiosk: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activePage,
  onPageChange,
  isTimerRunning,
  totalHoursToday,
  hscBatch,
  onBatchChange,
  selectedCollege,
  onOpenCollegeModal,
  ambientSound,
  onCycleSound,
  onEnterKiosk,
}) => {
  const soundLabel: Record<AmbientSoundType, string> = {
    none: 'MUTE',
    gamma40: '40Hz',
    pink: 'PINK',
    white: 'WHITE',
    rain: 'RAIN',
  };

  return (
    <header className="w-full max-w-4xl chassis-box p-3 sm:p-4 mb-4 flex flex-col gap-3 font-mono">
      {/* Top Brand & Utility Cluster */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-emerald-400 led-active" />
          <div className="flex flex-col">
            <span className="font-bold tracking-widest text-white text-xs sm:text-sm">
              MEDICORE // 8.5
            </span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
              BD Medical Admission System
            </span>
          </div>
        </div>

        {/* Center / Right Telemetry controls */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* HSC Batch Switcher */}
          <div className="flex items-center bg-[#090b10] border border-white/[0.08] p-0.5">
            {(['27', '28', '29'] as HSCBatch[]).map((b) => (
              <button
                key={b}
                onClick={() => {
                  soundEngine.playKeyClick(1.2);
                  onBatchChange(b);
                }}
                className={`px-2 py-0.5 text-[10px] font-bold tracking-wider transition-colors ${
                  hscBatch === b
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(5,223,114,0.15)]'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
                title={`HSC 20${b} Candidate`}
              >
                HSC '{b}
              </button>
            ))}
          </div>

          {/* Target Medical College Selector */}
          <button
            onClick={() => {
              soundEngine.playKeyClick();
              onOpenCollegeModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#090b10] border border-white/[0.08] hover:border-emerald-500/50 hover:bg-[#131620] text-zinc-200 transition-colors text-xs font-semibold btn-tactile"
            title="Change Target Medical College"
          >
            <span className="text-emerald-400 font-bold">{selectedCollege.shortName}</span>
            <span className="text-[10px] text-zinc-500">({selectedCollege.seats}s)</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {/* Sound switch */}
          <button
            onClick={onCycleSound}
            className={`px-2 py-1 border text-[10px] font-bold flex items-center gap-1 transition-all btn-tactile ${
              ambientSound !== 'none'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-white/[0.08] bg-[#090b10] text-zinc-400 hover:text-white'
            }`}
            title="Cycle focus audio frequencies"
          >
            {ambientSound !== 'none' ? (
              <Volume2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <VolumeX className="w-3 h-3 text-zinc-500" />
            )}
            <span>{soundLabel[ambientSound]}</span>
          </button>

          {/* Fullscreen Kiosk */}
          <button
            onClick={onEnterKiosk}
            className="p-1.5 border border-white/[0.08] bg-[#090b10] hover:border-white/20 text-zinc-400 hover:text-white transition-colors btn-tactile"
            title="Fullscreen Focus (F)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3 Dedicated Navigation Tabs */}
      <nav className="grid grid-cols-3 gap-2">
        {/* Tab 1: TIMER */}
        <button
          onClick={() => {
            soundEngine.playKeyClick();
            onPageChange('timer');
          }}
          className={`py-2 px-3 border text-left flex items-center justify-between transition-all btn-tactile ${
            activePage === 'timer'
              ? 'bg-[#151922] border-emerald-400/80 text-white shadow-[inset_0_0_10px_rgba(5,223,114,0.1)]'
              : 'bg-[#090b10] border-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Timer className={`w-3.5 h-3.5 ${activePage === 'timer' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <div>
              <div className="text-[10px] text-zinc-500 tracking-wider">PAGE 01</div>
              <div className="text-xs font-bold tracking-wide">CHRONOMETER</div>
            </div>
          </div>
          {isTimerRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 led-pulsing" title="Running" />
          )}
        </button>

        {/* Tab 2: TRACKER */}
        <button
          onClick={() => {
            soundEngine.playKeyClick();
            onPageChange('tracker');
          }}
          className={`py-2 px-3 border text-left flex items-center justify-between transition-all btn-tactile ${
            activePage === 'tracker'
              ? 'bg-[#151922] border-emerald-400/80 text-white shadow-[inset_0_0_10px_rgba(5,223,114,0.1)]'
              : 'bg-[#090b10] border-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className={`w-3.5 h-3.5 ${activePage === 'tracker' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <div>
              <div className="text-[10px] text-zinc-500 tracking-wider">PAGE 02</div>
              <div className="text-xs font-bold tracking-wide">8.5H TRACKER</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline">
            {totalHoursToday}h
          </span>
        </button>

        {/* Tab 3: SUBJECTS */}
        <button
          onClick={() => {
            soundEngine.playKeyClick();
            onPageChange('subjects');
          }}
          className={`py-2 px-3 border text-left flex items-center justify-between transition-all btn-tactile ${
            activePage === 'subjects'
              ? 'bg-[#151922] border-emerald-400/80 text-white shadow-[inset_0_0_10px_rgba(5,223,114,0.1)]'
              : 'bg-[#090b10] border-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className={`w-3.5 h-3.5 ${activePage === 'subjects' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <div>
              <div className="text-[10px] text-zinc-500 tracking-wider">PAGE 03</div>
              <div className="text-xs font-bold tracking-wide">SYLLABUS</div>
            </div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 bg-[#12151e] border border-white/10 text-emerald-400 font-mono hidden sm:inline">
            79 CH
          </span>
        </button>
      </nav>
    </header>
  );
};
