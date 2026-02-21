export interface Ingredient {
  id: string;
  nameEn: string;
  nameFr: string;
  emoji: string;
}

export const ingredients: Ingredient[] = [
  { id: 'wolfsbane', nameEn: 'Wolfsbane', nameFr: 'Tue-loup', emoji: '🌿' },
  { id: 'bezoar', nameEn: 'Bezoar', nameFr: 'Bézoard', emoji: '💎' },
  { id: 'mandrake', nameEn: 'Mandrake Root', nameFr: 'Racine de Mandragore', emoji: '🌱' },
  { id: 'lacewing', nameEn: 'Lacewing Fly', nameFr: 'Chrysope', emoji: '🪰' },
  { id: 'boomslang', nameEn: 'Boomslang Skin', nameFr: 'Peau de Serpent', emoji: '🐍' },
  { id: 'gillyweed', nameEn: 'Gillyweed', nameFr: 'Branchiflore', emoji: '🌊' },
  { id: 'felix', nameEn: 'Felix Felicis', nameFr: 'Felix Felicis', emoji: '✨' },
  { id: 'dragon_blood', nameEn: 'Dragon Blood', nameFr: 'Sang de Dragon', emoji: '🩸' },
  { id: 'unicorn_hair', nameEn: 'Unicorn Hair', nameFr: 'Crin de Licorne', emoji: '🦄' },
  { id: 'phoenix_tear', nameEn: 'Phoenix Tear', nameFr: 'Larme de Phénix', emoji: '💧' },
  { id: 'moonstone', nameEn: 'Moonstone', nameFr: 'Pierre de Lune', emoji: '🌙' },
  { id: 'ashwinder', nameEn: 'Ashwinder Egg', nameFr: 'Oeuf de Serpencendre', emoji: '🥚' },
];
