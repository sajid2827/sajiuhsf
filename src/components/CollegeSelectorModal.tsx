import React, { useState } from 'react';
import { X, Building2, Search, Check, ShieldCheck, MapPin } from 'lucide-react';
import { BD_GOVT_MEDICAL_COLLEGES, GovtMedicalCollege } from '../data/medicalColleges';

interface CollegeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CollegeSelectorModal: React.FC<CollegeSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedId,
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = BD_GOVT_MEDICAL_COLLEGES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.shortName.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#0e1015] border border-white/10 shadow-2xl flex flex-col max-h-[85vh] text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#12141c]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-none bg-emerald-400 shadow-[0_0_8px_rgba(5,223,114,0.6)]" />
            <h3 className="font-mono text-xs uppercase tracking-widest text-white font-bold">
              Select Target BD Govt Medical College
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by college name, acronym (DMC, SSMC, CMC) or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#13151d] border border-white/10 pl-9 pr-3 py-2 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60"
              autoFocus
            />
          </div>
        </div>

        {/* List of Colleges */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {filtered.map((college) => {
            const isSelected = college.id === selectedId;
            return (
              <button
                key={college.id}
                onClick={() => {
                  onSelect(college.id);
                  onClose();
                }}
                className={`w-full text-left p-3 border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#141a1f] border-emerald-500/60 text-white shadow-[inset_0_0_12px_rgba(5,223,114,0.08)]'
                    : 'bg-[#111319] border-white/[0.05] hover:border-white/15 text-zinc-300 hover:text-white hover:bg-[#151722]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm tracking-wide text-white">
                      {college.shortName}
                    </span>
                    <span className="text-zinc-500 text-xs">·</span>
                    <span className="text-xs font-medium text-zinc-200">{college.name}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <MapPin className="w-3 h-3 text-zinc-500" /> {college.city}
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-emerald-400/90 font-mono font-semibold">
                      {college.seats} MBBS Seats
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-500 font-mono">Est. {college.established}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 italic pt-0.5">
                    "{college.tagline}"
                  </div>
                </div>

                <div className="mt-1">
                  {isSelected ? (
                    <div className="w-5 h-5 bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 border border-white/10" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[#0a0c10] text-[11px] font-mono text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> DGHS Standard Quota: 8.5 Hours/Day
          </span>
          <span>10 Medical Colleges Indexed</span>
        </div>
      </div>
    </div>
  );
};
