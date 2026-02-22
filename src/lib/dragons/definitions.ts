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
    emoji: '\u{1F409}',
    rarity: 'common',
    weight: 60,
    color: '#22c55e',
    glowColor: 'rgba(34,197,94,0.6)',
  },
  {
    id: 'swedish_short_snout',
    nameEn: 'Swedish Short-Snout',
    nameFr: 'Suédois à museau court',
    emoji: '\u{1F432}',
    rarity: 'rare',
    weight: 30,
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.6)',
  },
  {
    id: 'hungarian_horntail',
    nameEn: 'Hungarian Horntail',
    nameFr: 'Magyar à pointes',
    emoji: '\u{1F525}',
    rarity: 'legendary',
    weight: 10,
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.6)',
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
