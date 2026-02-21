export interface PatronusAnimal {
  id: string;
  nameEn: string;
  nameFr: string;
  emoji: string;
}

export const patronusAnimals: PatronusAnimal[] = [
  { id: 'stag', nameEn: 'Stag', nameFr: 'Cerf', emoji: '\uD83E\uDD8C' },
  { id: 'doe', nameEn: 'Doe', nameFr: 'Biche', emoji: '\uD83E\uDD8C' },
  { id: 'otter', nameEn: 'Otter', nameFr: 'Loutre', emoji: '\uD83E\uDDA6' },
  { id: 'phoenix', nameEn: 'Phoenix', nameFr: 'Ph\u00e9nix', emoji: '\uD83D\uDD25' },
  { id: 'wolf', nameEn: 'Wolf', nameFr: 'Loup', emoji: '\uD83D\uDC3A' },
  { id: 'hare', nameEn: 'Hare', nameFr: 'Li\u00e8vre', emoji: '\uD83D\uDC07' },
  { id: 'horse', nameEn: 'Horse', nameFr: 'Cheval', emoji: '\uD83D\uDC0E' },
  { id: 'swan', nameEn: 'Swan', nameFr: 'Cygne', emoji: '\uD83E\uDDA2' },
  { id: 'eagle', nameEn: 'Eagle', nameFr: 'Aigle', emoji: '\uD83E\uDD85' },
  { id: 'lion', nameEn: 'Lion', nameFr: 'Lion', emoji: '\uD83E\uDD81' },
  { id: 'fox', nameEn: 'Fox', nameFr: 'Renard', emoji: '\uD83E\uDD8A' },
  { id: 'owl', nameEn: 'Owl', nameFr: 'Hibou', emoji: '\uD83E\uDD89' },
  { id: 'cat', nameEn: 'Cat', nameFr: 'Chat', emoji: '\uD83D\uDC08' },
  { id: 'dolphin', nameEn: 'Dolphin', nameFr: 'Dauphin', emoji: '\uD83D\uDC2C' },
  { id: 'bear', nameEn: 'Bear', nameFr: 'Ours', emoji: '\uD83D\uDC3B' },
  { id: 'lynx', nameEn: 'Lynx', nameFr: 'Lynx', emoji: '\uD83D\uDC31' },
  { id: 'boar', nameEn: 'Boar', nameFr: 'Sanglier', emoji: '\uD83D\uDC17' },
  { id: 'ermine', nameEn: 'Ermine', nameFr: 'Hermine', emoji: '\uD83E\uDDAD' },
  { id: 'falcon', nameEn: 'Falcon', nameFr: 'Faucon', emoji: '\uD83E\uDD85' },
  { id: 'unicorn', nameEn: 'Unicorn', nameFr: 'Licorne', emoji: '\uD83E\uDD84' },
];

export function getPatronusById(id: string): PatronusAnimal | undefined {
  return patronusAnimals.find((a) => a.id === id);
}

export function getRandomPatronus(): PatronusAnimal {
  return patronusAnimals[Math.floor(Math.random() * patronusAnimals.length)];
}
