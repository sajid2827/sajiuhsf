import { HSCBatch } from '../data/medicalColleges';
import { AmbientSoundType } from '../utils/audio';

export type MedicalSubject =
  | 'botany_1'
  | 'zoology_2'
  | 'chemistry_1'
  | 'chemistry_2'
  | 'physics_1'
  | 'physics_2'
  | 'math_1'
  | 'math_2'
  | 'ict';

export interface ChapterItem {
  id: string;
  chapterNumber: number;
  englishTitle: string;
  bengaliTitle: string;
  fullTitle: string;
}

export interface SubjectOption {
  id: MedicalSubject;
  label: string;
  bengaliLabel: string;
  paperLabel: string;
  code: string;
  color: string;
  chapters: ChapterItem[];
}

export interface StudySession {
  id: string;
  subject: MedicalSubject;
  chapter?: string;
  durationMinutes: number;
  time: string;
  dateKey: string; // YYYY-MM-DD
}

export interface MedicalSettings {
  dailyTargetHours: number; // 8.5
  hscBatch: HSCBatch; // '27' | '28' | '29'
  dreamCollegeId: string; // 'dmc', 'ssmc', etc.
  focusDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  soundEnabled: boolean;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  bellVolume: number;
  autoStartBreak: boolean;
}
