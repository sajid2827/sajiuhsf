export interface GovtMedicalCollege {
  id: string;
  name: string;
  shortName: string;
  bengaliName: string;
  city: string;
  established: number;
  seats: number;
  tagline: string;
}

export const BD_GOVT_MEDICAL_COLLEGES: GovtMedicalCollege[] = [
  {
    id: 'dmc',
    name: 'Dhaka Medical College',
    shortName: 'DMC',
    bengaliName: 'ঢাকা মেডিকেল কলেজ',
    city: 'Dhaka',
    established: 1946,
    seats: 250,
    tagline: 'The pinnacle of medical excellence in Bangladesh (K-Batch Dream)',
  },
  {
    id: 'ssmc',
    name: 'Sir Salimullah Medical College',
    shortName: 'SSMC',
    bengaliName: 'স্যার সলিমুল্লাহ মেডিকেল কলেজ',
    city: 'Dhaka (Mitford)',
    established: 1875,
    seats: 250,
    tagline: 'Historic pioneer in healthcare along the Buriganga',
  },
  {
    id: 'shsmc',
    name: 'Shaheed Suhrawardy Medical College',
    shortName: 'ShSMC',
    bengaliName: 'শহীদ সোহরাওয়ার্দী মেডিকেল কলেজ',
    city: 'Sher-e-Bangla Nagar, Dhaka',
    established: 2006,
    seats: 230,
    tagline: 'Modern epicenter of medical innovation in the capital',
  },
  {
    id: 'cmc',
    name: 'Chittagong Medical College',
    shortName: 'CMC',
    bengaliName: 'চট্টগ্রাম মেডিকেল কলেজ',
    city: 'Chittagong',
    established: 1957,
    seats: 250,
    tagline: 'Premier healthcare citadel of southeastern Bangladesh',
  },
  {
    id: 'rmc',
    name: 'Rajshahi Medical College',
    shortName: 'RMC',
    bengaliName: 'রাজশাহী মেডিকেল কলেজ',
    city: 'Rajshahi',
    established: 1958,
    seats: 250,
    tagline: 'Renowned academic beacon on the banks of the Padma',
  },
  {
    id: 'mmc',
    name: 'Mymensingh Medical College',
    shortName: 'MMC',
    bengaliName: 'ময়মনসিংহ মেডিকেল কলেজ',
    city: 'Mymensingh',
    established: 1962,
    seats: 250,
    tagline: 'The historic heart of medical learning along the Brahmaputra',
  },
  {
    id: 'somc',
    name: 'Sylhet MAG Osmani Medical College',
    shortName: 'SOMC',
    bengaliName: 'সিলেট এম.এ.জি ওসমানী মেডিকেল কলেজ',
    city: 'Sylhet',
    established: 1962,
    seats: 250,
    tagline: 'Steadfast sanctuary of healers in the land of tea gardens',
  },
  {
    id: 'sbmc',
    name: 'Sher-e-Bangla Medical College',
    shortName: 'SBMC',
    bengaliName: 'শের-ই-বাংলা মেডিকেল কলেজ',
    city: 'Barisal',
    established: 1968,
    seats: 250,
    tagline: 'Guiding southern coastal health with compassion',
  },
  {
    id: 'rpmc',
    name: 'Rangpur Medical College',
    shortName: 'RpMC',
    bengaliName: 'রংপুর মেডিকেল কলেজ',
    city: 'Rangpur',
    established: 1970,
    seats: 250,
    tagline: 'Northern vanguard of medical education and clinical care',
  },
  {
    id: 'kmc',
    name: 'Khulna Medical College',
    shortName: 'KMC',
    bengaliName: 'খুলনা মেডিকেল কলেজ',
    city: 'Khulna',
    established: 1992,
    seats: 200,
    tagline: 'Leading medical gateway of the Sundarbans region',
  },
];

export type HSCBatch = '27' | '28' | '29';

export const HSC_BATCHES: { id: HSCBatch; label: string; year: string; stage: string }[] = [
  {
    id: '27',
    label: 'HSC Batch 27',
    year: 'HSC 2027 · Med Admission 2027-28',
    stage: 'Intensive Pre-Med & Syllabus Mastery',
  },
  {
    id: '28',
    label: 'HSC Batch 28',
    year: 'HSC 2028 · Med Admission 2028-29',
    stage: 'Core Foundation & Textbook Deep-Dive',
  },
  {
    id: '29',
    label: 'HSC Batch 29',
    year: 'HSC 2029 · Med Admission 2029-30',
    stage: 'Early Botanical & Bio-Chemical Grounding',
  },
];
