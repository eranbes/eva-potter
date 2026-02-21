export interface SortingQuestion {
  id: number;
  questionEn: string;
  questionFr: string;
  options: Array<{
    labelEn: string;
    labelFr: string;
    weights: { gryffindor: number; slytherin: number; ravenclaw: number; hufflepuff: number };
  }>;
}

export const sortingQuestions: SortingQuestion[] = [
  {
    id: 1,
    questionEn: 'You find a mysterious door in Hogwarts. What do you do?',
    questionFr: 'Tu trouves une porte mysterieuse a Poudlard. Que fais-tu ?',
    options: [
      {
        labelEn: 'Open it immediately — adventure awaits!',
        labelFr: "L'ouvrir immediatement — l'aventure attend !",
        weights: { gryffindor: 3, slytherin: 1, ravenclaw: 1, hufflepuff: 0 },
      },
      {
        labelEn: 'Study the runes on the door first',
        labelFr: "Etudier d'abord les runes sur la porte",
        weights: { gryffindor: 0, slytherin: 1, ravenclaw: 3, hufflepuff: 1 },
      },
      {
        labelEn: 'Check if it could be useful to you',
        labelFr: "Verifier si cela pourrait t'etre utile",
        weights: { gryffindor: 0, slytherin: 3, ravenclaw: 1, hufflepuff: 1 },
      },
      {
        labelEn: 'Find a friend to explore it together',
        labelFr: 'Trouver un ami pour explorer ensemble',
        weights: { gryffindor: 1, slytherin: 0, ravenclaw: 1, hufflepuff: 3 },
      },
    ],
  },
  {
    id: 2,
    questionEn: 'Which quality do you value most?',
    questionFr: 'Quelle qualite values-tu le plus ?',
    options: [
      {
        labelEn: 'Courage and bravery',
        labelFr: 'Le courage et la bravoure',
        weights: { gryffindor: 3, slytherin: 0, ravenclaw: 1, hufflepuff: 1 },
      },
      {
        labelEn: 'Wisdom and creativity',
        labelFr: 'La sagesse et la creativite',
        weights: { gryffindor: 0, slytherin: 1, ravenclaw: 3, hufflepuff: 1 },
      },
      {
        labelEn: 'Ambition and determination',
        labelFr: "L'ambition et la determination",
        weights: { gryffindor: 1, slytherin: 3, ravenclaw: 0, hufflepuff: 1 },
      },
      {
        labelEn: 'Loyalty and kindness',
        labelFr: 'La loyaute et la gentillesse',
        weights: { gryffindor: 1, slytherin: 0, ravenclaw: 1, hufflepuff: 3 },
      },
    ],
  },
  {
    id: 3,
    questionEn: 'A troll is blocking the path. How do you handle it?',
    questionFr: 'Un troll bloque le chemin. Comment le geres-tu ?',
    options: [
      {
        labelEn: 'Charge forward and face it head-on',
        labelFr: 'Foncer en avant et lui faire face',
        weights: { gryffindor: 3, slytherin: 1, ravenclaw: 0, hufflepuff: 1 },
      },
      {
        labelEn: 'Use a clever spell to outsmart it',
        labelFr: 'Utiliser un sort malin pour le surpasser',
        weights: { gryffindor: 0, slytherin: 1, ravenclaw: 3, hufflepuff: 1 },
      },
      {
        labelEn: 'Find a way to turn the situation to your advantage',
        labelFr: 'Trouver un moyen de tourner la situation a ton avantage',
        weights: { gryffindor: 1, slytherin: 3, ravenclaw: 1, hufflepuff: 0 },
      },
      {
        labelEn: 'Distract it so everyone can pass safely',
        labelFr: 'Le distraire pour que tout le monde passe en securite',
        weights: { gryffindor: 1, slytherin: 0, ravenclaw: 1, hufflepuff: 3 },
      },
    ],
  },
  {
    id: 4,
    questionEn: 'Which magical object would you choose?',
    questionFr: 'Quel objet magique choisirais-tu ?',
    options: [
      {
        labelEn: 'The Sword of Gryffindor',
        labelFr: "L'Epee de Gryffondor",
        weights: { gryffindor: 3, slytherin: 1, ravenclaw: 0, hufflepuff: 1 },
      },
      {
        labelEn: "Rowena Ravenclaw's Diadem",
        labelFr: 'Le Diademe de Rowena Serdaigle',
        weights: { gryffindor: 0, slytherin: 1, ravenclaw: 3, hufflepuff: 1 },
      },
      {
        labelEn: "Slytherin's Locket",
        labelFr: 'Le Medaillon de Serpentard',
        weights: { gryffindor: 1, slytherin: 3, ravenclaw: 1, hufflepuff: 0 },
      },
      {
        labelEn: "Hufflepuff's Cup",
        labelFr: 'La Coupe de Poufsouffle',
        weights: { gryffindor: 1, slytherin: 0, ravenclaw: 1, hufflepuff: 3 },
      },
    ],
  },
];
