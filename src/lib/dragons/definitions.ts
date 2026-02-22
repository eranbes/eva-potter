export interface DragonDef {
  id: string;
  nameEn: string;
  nameFr: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'legendary';
  weight: number;
  color: string;
  glowColor: string;
}

export const dragons: DragonDef[] = [
  {
    id: 'common_welsh_green',
    nameEn: 'Common Welsh Green',
    nameFr: 'Vert gallois',
    emoji: '🐉',
    rarity: 'common',
    weight: 30,
    color: '#22c55e',
    glowColor: 'rgba(34,197,94,0.6)',
  },
  {
    id: 'swedish_short_snout',
    nameEn: 'Swedish Short-Snout',
    nameFr: 'Suédois à museau court',
    emoji: '🐲',
    rarity: 'rare',
    weight: 15,
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.6)',
  },
  {
    id: 'hungarian_horntail',
    nameEn: 'Hungarian Horntail',
    nameFr: 'Magyar à pointes',
    emoji: '🔥',
    rarity: 'legendary',
    weight: 5,
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.6)',
  },
  {
    id: 'chinese_fireball',
    nameEn: 'Chinese Fireball',
    nameFr: 'Boutefeu chinois',
    emoji: '💥',
    rarity: 'common',
    weight: 25,
    color: '#ef4444',
    glowColor: 'rgba(239,68,68,0.6)',
  },
  {
    id: 'norwegian_ridgeback',
    nameEn: 'Norwegian Ridgeback',
    nameFr: 'Norvégien à crête',
    emoji: '🐉',
    rarity: 'rare',
    weight: 10,
    color: '#6366f1',
    glowColor: 'rgba(99,102,241,0.6)',
  },
  {
    id: 'antipodean_opaleye',
    nameEn: 'Antipodean Opaleye',
    nameFr: 'Opalœil des antipodes',
    emoji: '✨',
    rarity: 'rare',
    weight: 8,
    color: '#ec4899',
    glowColor: 'rgba(236,72,153,0.6)',
  },
  {
    id: 'peruvian_vipertooth',
    nameEn: 'Peruvian Vipertooth',
    nameFr: 'Dent-de-vipère du Pérou',
    emoji: '🐍',
    rarity: 'legendary',
    weight: 4,
    color: '#a855f7',
    glowColor: 'rgba(168,85,247,0.6)',
  },
  {
    id: 'romanian_longhorn',
    nameEn: 'Romanian Longhorn',
    nameFr: 'Cornelongue roumain',
    emoji: '🦬',
    rarity: 'common',
    weight: 3,
    color: '#78716c',
    glowColor: 'rgba(120,113,108,0.6)',
  },
];

export const DRAGON_EGG_COST = 5000;

export function getDragonById(id: string): DragonDef | undefined {
  return dragons.find((d) => d.id === id);
}

export function getRandomDragon(): DragonDef {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const dragon of dragons) {
    cumulative += dragon.weight;
    if (roll < cumulative) {
      return dragon;
    }
  }
  return dragons[0];
}
