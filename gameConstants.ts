export interface RankInfo {
  title: string;
  icon: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  shadowColor: string;
  minLevel: number;
}

export const MILITARY_HIERARCHY: RankInfo[] = [
  { minLevel: 300, title: 'Marechal Supremo', icon: 'fa-crown', color: 'text-red-500', badgeBg: 'from-red-600 via-rose-500 to-red-900', borderColor: 'border-red-400', shadowColor: 'shadow-red-500/50' },
  { minLevel: 250, title: 'General de Divisão Estelar', icon: 'fa-star-shooting', color: 'text-amber-300', badgeBg: 'from-amber-400 via-red-600 to-zinc-950', borderColor: 'border-amber-400', shadowColor: 'shadow-red-600/50' },
  { minLevel: 210, title: 'Coronel de Elite', icon: 'fa-shield-halved', color: 'text-blue-500', badgeBg: 'from-blue-600 via-cyan-500 to-indigo-900', borderColor: 'border-blue-400', shadowColor: 'shadow-blue-500/40' },
  { minLevel: 170, title: 'Major de Assalto', icon: 'fa-medal', color: 'text-emerald-400', badgeBg: 'from-emerald-500 via-teal-500 to-green-900', borderColor: 'border-emerald-400', shadowColor: 'shadow-emerald-500/30' },
  { minLevel: 130, title: 'Capitão de Divisão', icon: 'fa-crosshairs', color: 'text-purple-400', badgeBg: 'from-purple-500 via-violet-500 to-purple-900', borderColor: 'border-purple-400', shadowColor: 'shadow-purple-500/30' },
  { minLevel: 90, title: 'Tenente Tático', icon: 'fa-bolt', color: 'text-cyan-400', badgeBg: 'from-cyan-400 via-sky-500 to-blue-800', borderColor: 'border-cyan-400', shadowColor: 'shadow-cyan-500/30' },
  { minLevel: 60, title: 'Sargento Veterano', icon: 'fa-chevron-up', color: 'text-zinc-200', badgeBg: 'from-zinc-300 via-zinc-400 to-zinc-700', borderColor: 'border-zinc-300', shadowColor: 'shadow-zinc-400/30' },
  { minLevel: 30, title: 'Cabo de Infantaria', icon: 'fa-angle-up', color: 'text-orange-400', badgeBg: 'from-orange-500 via-amber-600 to-orange-900', borderColor: 'border-orange-500', shadowColor: 'shadow-orange-700/30' },
  { minLevel: 10, title: 'Soldado Raso', icon: 'fa-minus', color: 'text-zinc-500', badgeBg: 'from-zinc-600 via-zinc-700 to-black', borderColor: 'border-zinc-600', shadowColor: 'shadow-black/20' },
  { minLevel: 0, title: 'Recruta', icon: 'fa-circle', color: 'text-zinc-600', badgeBg: 'from-zinc-800 via-zinc-900 to-black', borderColor: 'border-zinc-800', shadowColor: 'shadow-transparent' }
];

export const getMilitaryRank = (level: number): RankInfo => {
  return MILITARY_HIERARCHY.find(r => level >= r.minLevel) || MILITARY_HIERARCHY[MILITARY_HIERARCHY.length - 1];
};

export const getXPForNextLevel = (level: number) => level * 1000;
