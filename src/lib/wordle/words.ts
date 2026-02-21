export type WordCategory = 'character' | 'spell' | 'creature' | 'place' | 'object' | 'potion';

export interface WordEntry {
  word: string;          // uppercase, 4-8 letters (English)
  wordFr?: string;       // uppercase, 4-8 letters (French variant, omit if same as word)
  category: WordCategory;
  hintEn: string;        // English hint
  hintFr: string;        // French hint
}

/** Get the word for the given language */
export function getWord(entry: WordEntry, lang: 'en' | 'fr'): string {
  if (lang === 'fr' && entry.wordFr) return entry.wordFr;
  return entry.word;
}

export const WORD_LIST: WordEntry[] = [
  // ============================================================
  // CHARACTERS (~30)
  // ============================================================
  { word: 'HARRY', category: 'character', hintEn: 'The Boy Who Lived', hintFr: 'Le Survivant' },
  { word: 'DRACO', category: 'character', hintEn: 'Slytherin rival with platinum hair', hintFr: 'Rival de Serpentard aux cheveux platine' },
  { word: 'SNAPE', wordFr: 'ROGUE', category: 'character', hintEn: 'Potions master with a hidden loyalty', hintFr: 'Maître des potions à la loyauté secrète' },
  { word: 'DOBBY', category: 'character', hintEn: 'A free house-elf', hintFr: 'Un elfe de maison libre' },
  { word: 'LUPIN', category: 'character', hintEn: 'Werewolf professor of Defence', hintFr: 'Professeur loup-garou de Défense' },
  { word: 'GINNY', category: 'character', hintEn: 'Youngest Weasley, fierce and brave', hintFr: 'La plus jeune des Weasley, courageuse' },
  { word: 'LUNA', category: 'character', hintEn: 'Dreamy Ravenclaw who sees thestrals', hintFr: 'Serdaigle rêveuse qui voit les Sombrals' },
  { word: 'FRED', category: 'character', hintEn: 'One half of the Weasley twins', hintFr: 'Une moitié des jumeaux Weasley' },
  { word: 'GEORGE', category: 'character', hintEn: 'The other Weasley twin', hintFr: "L'autre jumeau Weasley" },
  { word: 'HAGRID', category: 'character', hintEn: 'Half-giant keeper of keys at Hogwarts', hintFr: 'Demi-géant gardien des clés de Poudlard' },
  { word: 'FLEUR', category: 'character', hintEn: 'Beauxbatons champion, part Veela', hintFr: 'Championne de Beauxbâtons, en partie Vélane' },
  { word: 'CEDRIC', category: 'character', hintEn: 'Hufflepuff Triwizard champion', hintFr: 'Champion de Poufsouffle au Tournoi' },
  { word: 'NEVILLE', category: 'character', hintEn: 'Brave Gryffindor who destroyed a Horcrux', hintFr: 'Courageux Gryffondor qui détruisit un Horcruxe' },
  { word: 'TONKS', category: 'character', hintEn: 'Metamorphmagus and Auror', hintFr: 'Métamorphomage et Auror' },
  { word: 'SIRIUS', category: 'character', hintEn: "Harry's godfather, an Animagus dog", hintFr: 'Parrain de Harry, Animagus chien' },
  { word: 'MOLLY', category: 'character', hintEn: 'Weasley matriarch, fierce protector', hintFr: 'Matriarche Weasley, protectrice féroce' },
  { word: 'ARTHUR', category: 'character', hintEn: 'Weasley father, loves Muggle objects', hintFr: 'Père Weasley, passionné par les Moldus' },
  { word: 'MOODY', wordFr: 'MAUGREY', category: 'character', hintEn: 'Mad-Eye, the paranoid Auror', hintFr: "Fol-Œil, l'Auror paranoïaque" },
  { word: 'HEDWIG', wordFr: 'HEDWIGE', category: 'character', hintEn: "Harry's loyal snowy owl", hintFr: 'La chouette des neiges fidèle de Harry' },
  { word: 'PERCY', category: 'character', hintEn: 'Ambitious Weasley who became prefect', hintFr: 'Weasley ambitieux devenu préfet' },
  { word: 'KREACHER', wordFr: 'KREATTUR', category: 'character', hintEn: 'Black family house-elf', hintFr: 'Elfe de maison de la famille Black' },
  { word: 'FILCH', wordFr: 'RUSARD', category: 'character', hintEn: 'Grumpy Hogwarts caretaker', hintFr: 'Concierge grognon de Poudlard' },
  { word: 'COLIN', category: 'character', hintEn: 'Camera-loving Gryffindor student', hintFr: 'Élève Gryffondor fan de photos' },
  { word: 'CRABBE', category: 'character', hintEn: "Draco's burly Slytherin sidekick", hintFr: 'Acolyte costaud de Draco à Serpentard' },
  { word: 'DEAN', category: 'character', hintEn: 'Gryffindor who loves football', hintFr: 'Gryffondor fan de football' },
  { word: 'SEAMUS', category: 'character', hintEn: 'Irish Gryffindor known for explosions', hintFr: 'Gryffondor irlandais connu pour ses explosions' },
  { word: 'OLIVER', category: 'character', hintEn: 'Obsessive Gryffindor Quidditch captain', hintFr: 'Capitaine passionné de Quidditch à Gryffondor' },
  { word: 'PEEVES', category: 'character', hintEn: 'Mischievous Hogwarts poltergeist', hintFr: 'Esprit frappeur farceur de Poudlard' },
  { word: 'REMUS', category: 'character', hintEn: 'First name of Professor Lupin', hintFr: 'Prénom du Professeur Lupin' },
  { word: 'ALBUS', category: 'character', hintEn: 'First name of the great headmaster', hintFr: 'Prénom du grand directeur' },

  // ============================================================
  // SPELLS (~22)
  // ============================================================
  { word: 'LUMOS', category: 'spell', hintEn: 'Produces light from the wand tip', hintFr: 'Produit de la lumière au bout de la baguette' },
  { word: 'ACCIO', category: 'spell', hintEn: 'Summoning charm', hintFr: "Sortilège d'attraction" },
  { word: 'CRUCIO', category: 'spell', hintEn: 'Unforgivable torture curse', hintFr: 'Sortilège de torture Impardonnable' },
  { word: 'IMPERIO', category: 'spell', hintEn: 'Unforgivable mind-control curse', hintFr: 'Sortilège Impardonnable de contrôle mental' },
  { word: 'REPARO', category: 'spell', hintEn: 'Mends broken objects', hintFr: 'Répare les objets cassés' },
  { word: 'STUPEFY', category: 'spell', hintEn: 'Stunning spell that knocks out a target', hintFr: "Sortilège de Stupéfixion" },
  { word: 'OBLIVIO', category: 'spell', hintEn: 'Memory-erasing charm (short form)', hintFr: "Sortilège d'amnésie (forme courte)" },
  { word: 'SECTUM', category: 'spell', hintEn: 'First part of a dark slashing curse', hintFr: 'Première partie du sort tranchant de Rogue' },
  { word: 'RICTUS', category: 'spell', hintEn: 'Tickling charm (Rictusempra)', hintFr: 'Sort de chatouillement (Rictusempra)' },
  { word: 'EXPECTO', category: 'spell', hintEn: 'First word of the Patronus charm', hintFr: 'Premier mot du sort du Patronus' },
  { word: 'RIDDIKU', category: 'spell', hintEn: 'Boggart-banishing charm (short form)', hintFr: "Sort pour repousser l'Épouvantard" },
  { word: 'SONORUS', category: 'spell', hintEn: 'Amplifies the voice magically', hintFr: 'Amplifie la voix magiquement' },
  { word: 'FINITE', category: 'spell', hintEn: 'Ends ongoing spell effects', hintFr: 'Met fin aux effets de sorts en cours' },
  { word: 'ENGORGIO', category: 'spell', hintEn: 'Causes the target to swell in size', hintFr: "Fait grossir l'objet ciblé" },
  { word: 'REDUCTO', category: 'spell', hintEn: 'Blasts solid objects apart', hintFr: 'Fait exploser les objets solides' },
  { word: 'SILENCIO', category: 'spell', hintEn: 'Silencing charm', hintFr: 'Sort de silence' },
  { word: 'DIFFINDO', category: 'spell', hintEn: 'Severing charm that cuts things', hintFr: 'Sort de découpe' },
  { word: 'PROTEGO', category: 'spell', hintEn: 'Shield charm that blocks spells', hintFr: 'Sort de bouclier qui bloque les sorts' },
  { word: 'PRIOR', category: 'spell', hintEn: 'First word of Priori Incantatem', hintFr: 'Premier mot de Priori Incantatem' },
  { word: 'RELASHIO', category: 'spell', hintEn: 'Releases a jet of sparks or boiling water', hintFr: 'Libère un jet de flammes ou d\u2019eau bouillante' },
  { word: 'EPISKEY', category: 'spell', hintEn: 'Heals minor injuries', hintFr: 'Guérit les blessures mineures' },
  { word: 'CONFUNDO', category: 'spell', hintEn: 'Confundus charm that confuses the target', hintFr: 'Sort de Confusion qui désoriente la cible' },

  // ============================================================
  // CREATURES (~20)
  // ============================================================
  { word: 'DRAGON', category: 'creature', hintEn: 'Fire-breathing beast of the first task', hintFr: 'Bête crachant du feu lors de la première épreuve' },
  { word: 'PHOENIX', category: 'creature', hintEn: 'Reborn from its own ashes', hintFr: 'Renaît de ses propres cendres' },
  { word: 'NIFFLER', category: 'creature', hintEn: 'Treasure-hunting furry creature', hintFr: 'Créature à fourrure chasseuse de trésors' },
  { word: 'CENTAUR', wordFr: 'CENTAURE', category: 'creature', hintEn: 'Half-human, half-horse forest dweller', hintFr: 'Mi-homme, mi-cheval, habitant de la forêt' },
  { word: 'BOGGART', category: 'creature', hintEn: 'Shape-shifter that becomes your fear', hintFr: 'Épouvantard : prend la forme de votre peur' },
  { word: 'PIXIE', category: 'creature', hintEn: 'Mischievous blue Cornish creature', hintFr: 'Petit lutin bleu de Cornouailles' },
  { word: 'ERROL', category: 'creature', hintEn: 'Elderly Weasley family owl', hintFr: 'Vieux hibou de la famille Weasley' },
  { word: 'BASILISK', wordFr: 'BASILIC', category: 'creature', hintEn: 'Giant serpent whose gaze kills', hintFr: 'Serpent géant au regard mortel' },
  { word: 'GOBLIN', wordFr: 'GOBELIN', category: 'creature', hintEn: 'Gringotts bank keeper', hintFr: 'Gardien de la banque Gringotts' },
  { word: 'VEELA', wordFr: 'VELANE', category: 'creature', hintEn: 'Enchanting beings with silvery hair', hintFr: 'Êtres enchanteurs aux cheveux argentés' },
  { word: 'NAGINI', category: 'creature', hintEn: "Voldemort's serpent and final Horcrux", hintFr: 'Le serpent de Voldemort et dernier Horcruxe' },
  { word: 'THESTRAL', wordFr: 'SOMBRAL', category: 'creature', hintEn: 'Winged horse seen only by those who witnessed death', hintFr: 'Cheval ailé visible seulement par ceux ayant vu la mort' },
  { word: 'MERFOLK', category: 'creature', hintEn: 'Lake dwellers who guard the second task', hintFr: 'Êtres de l\u2019eau gardiens de la deuxième épreuve' },
  { word: 'KNEAZLE', category: 'creature', hintEn: 'Cat-like creature, Crookshanks is part this', hintFr: 'Créature féline, Pattenrond en est un croisé' },
  { word: 'DEMENTOR', category: 'creature', hintEn: 'Soul-sucking Azkaban guard', hintFr: "Détraqueur, gardien d\u2019Azkaban" },
  { word: 'WEREWOLF', wordFr: 'GAROU', category: 'creature', hintEn: 'Human who transforms at full moon', hintFr: 'Humain qui se transforme à la pleine lune' },
  { word: 'FAWKES', wordFr: 'FUMSECK', category: 'creature', hintEn: "Dumbledore's phoenix companion", hintFr: 'Le phénix compagnon de Dumbledore' },
  { word: 'ARAGOG', category: 'creature', hintEn: "Hagrid's giant spider friend", hintFr: "L'araignée géante amie de Hagrid" },
  { word: 'FLUFFY', wordFr: 'TOUFFU', category: 'creature', hintEn: 'Three-headed dog guarding a trapdoor', hintFr: 'Chien à trois têtes gardant une trappe' },
  { word: 'BUCKBEAK', wordFr: 'BUCK', category: 'creature', hintEn: 'Proud hippogriff saved by time travel', hintFr: 'Hippogriffe fier sauvé par le Retourneur de Temps' },

  // ============================================================
  // PLACES (~18)
  // ============================================================
  { word: 'HOGWARTS', wordFr: 'POUDLARD', category: 'place', hintEn: 'School of Witchcraft and Wizardry', hintFr: 'École de sorcellerie' },
  { word: 'AZKABAN', category: 'place', hintEn: 'Wizard prison guarded by dementors', hintFr: 'Prison des sorciers gardée par les Détraqueurs' },
  { word: 'DIAGON', wordFr: 'TRAVERSE', category: 'place', hintEn: 'Famous wizarding shopping alley', hintFr: 'Célèbre allée commerçante des sorciers' },
  { word: 'BURROW', wordFr: 'TERRIER', category: 'place', hintEn: 'The Weasley family home', hintFr: 'La maison de la famille Weasley' },
  { word: 'GODRIC', category: 'place', hintEn: "Hollow where Harry's parents died", hintFr: 'Le village où les parents de Harry sont morts' },
  { word: 'TOWER', wordFr: 'TOUR', category: 'place', hintEn: 'Astronomy location atop Hogwarts', hintFr: "Tour d\u2019astronomie de Poudlard" },
  { word: 'PRIVET', category: 'place', hintEn: 'Drive where the Dursleys live', hintFr: 'La rue où vivent les Dursley' },
  { word: 'DUNGEON', wordFr: 'CACHOT', category: 'place', hintEn: 'Underground area where Potions class is held', hintFr: 'Sous-sol où a lieu le cours de potions' },
  { word: 'SHELL', category: 'place', hintEn: 'Cottage where Bill and Fleur live', hintFr: 'Chaumière où vivent Bill et Fleur' },
  { word: 'MALFOY', category: 'place', hintEn: 'Manor of the platinum-haired family', hintFr: 'Manoir de la famille aux cheveux platine' },
  { word: 'LEAKY', wordFr: 'CHAUDRON', category: 'place', hintEn: 'Cauldron pub, gateway to Diagon Alley', hintFr: 'Le Chaudron Baveur, passage vers le Chemin de Traverse' },
  { word: 'MINISTRY', category: 'place', hintEn: 'Of Magic, the wizard government', hintFr: 'Ministère de la Magie, le gouvernement sorcier' },
  { word: 'PLATFORM', wordFr: 'VOIE', category: 'place', hintEn: 'Nine and three-quarters departure point', hintFr: 'Neuf trois-quarts, point de départ' },
  { word: 'CHAMBER', wordFr: 'CHAMBRE', category: 'place', hintEn: 'Secret room of Slytherin under Hogwarts', hintFr: 'Salle secrète de Serpentard sous Poudlard' },
  { word: 'ROOM', wordFr: 'SALLE', category: 'place', hintEn: 'Of Requirement, appears when needed', hintFr: 'Sur Demande, apparaît quand on en a besoin' },
  { word: 'VAULT', wordFr: 'COFFRE', category: 'place', hintEn: 'Underground bank chamber for wizard gold', hintFr: 'Chambre souterraine pour l\u2019or des sorciers' },
  { word: 'FOREST', wordFr: 'FORET', category: 'place', hintEn: 'Forbidden woodland near Hogwarts', hintFr: 'Forêt Interdite près de Poudlard' },
  { word: 'SPINNER', wordFr: 'TISSEUR', category: 'place', hintEn: "End, the street where Snape's house is", hintFr: 'Impasse du Tisseur, rue de la maison de Rogue' },

  // ============================================================
  // OBJECTS (~18)
  // ============================================================
  { word: 'WAND', wordFr: 'BAGUETTE', category: 'object', hintEn: 'Every wizard needs one', hintFr: 'Tout sorcier en a besoin' },
  { word: 'HORCRUX', wordFr: 'HORCRUXE', category: 'object', hintEn: 'Fragment of a dark soul', hintFr: "Fragment d\u2019une âme sombre" },
  { word: 'SNITCH', wordFr: 'VIDOR', category: 'object', hintEn: 'Golden winged ball worth 150 points', hintFr: "Balle dorée ailée valant 150 points" },
  { word: 'CLOAK', wordFr: 'CAPE', category: 'object', hintEn: 'Invisibility garment, a Deathly Hallow', hintFr: "Cape d\u2019invisibilité, une Relique de la Mort" },
  { word: 'BROOM', wordFr: 'BALAI', category: 'object', hintEn: 'Flying transport for Quidditch', hintFr: 'Transport volant pour le Quidditch' },
  { word: 'ELDER', wordFr: 'SUREAU', category: 'object', hintEn: 'Most powerful wand ever made', hintFr: 'La baguette la plus puissante jamais créée' },
  { word: 'SORTING', category: 'object', hintEn: 'Hat that chooses your Hogwarts house', hintFr: 'Choixpeau Magique qui choisit votre maison' },
  { word: 'MARAUDER', category: 'object', hintEn: "Map that shows everyone's location", hintFr: 'Carte du Maraudeur qui montre la position de chacun' },
  { word: 'GOBLET', wordFr: 'COUPE', category: 'object', hintEn: 'Of Fire, selects Triwizard champions', hintFr: 'De Feu, choisit les champions du Tournoi' },
  { word: 'PORTKEY', category: 'object', hintEn: 'Object enchanted for instant transport', hintFr: 'Portoloin, objet enchanté pour un transport instantané' },
  { word: 'PENSIEVE', wordFr: 'PENSINE', category: 'object', hintEn: 'Basin for viewing stored memories', hintFr: 'Bassin pour visionner les souvenirs' },
  { word: 'NIMBUS', category: 'object', hintEn: "Harry's first broomstick model", hintFr: 'Premier modèle de balai de Harry' },
  { word: 'FIREBOLT', wordFr: 'ECLAIR', category: 'object', hintEn: 'Fastest racing broom, a gift from Sirius', hintFr: 'Éclair de Feu, balai le plus rapide, cadeau de Sirius' },
  { word: 'QUAFFLE', wordFr: 'SOUAFLE', category: 'object', hintEn: 'Red ball used by Chasers in Quidditch', hintFr: 'Balle rouge utilisée par les Poursuiveurs' },
  { word: 'BLUDGER', wordFr: 'COGNARD', category: 'object', hintEn: 'Aggressive ball that chases players', hintFr: 'Balle agressive qui poursuit les joueurs' },
  { word: 'LOCKET', category: 'object', hintEn: "Slytherin's Horcrux worn around the neck", hintFr: 'Médaillon de Serpentard, un Horcruxe porté au cou' },
  { word: 'DIADEM', wordFr: 'DIADEME', category: 'object', hintEn: "Ravenclaw's lost tiara Horcrux", hintFr: 'Diadème perdu de Serdaigle, un Horcruxe' },
  { word: 'DIARY', wordFr: 'JOURNAL', category: 'object', hintEn: "Tom Riddle's first Horcrux", hintFr: 'Premier Horcruxe de Tom Jedusor' },

  // ============================================================
  // POTIONS (~12)
  // ============================================================
  { word: 'FELIX', category: 'potion', hintEn: 'Felicis, liquid luck potion', hintFr: 'Felicis, potion de chance liquide' },
  { word: 'DRAUGHT', category: 'potion', hintEn: 'Of Living Death, powerful sleeping potion', hintFr: 'De Mort Vivante, puissante potion de sommeil' },
  { word: 'MANDRAKE', category: 'potion', hintEn: 'Plant used to cure those who have been petrified', hintFr: 'Mandragore, plante utilisée pour guérir les pétrifiés' },
  { word: 'SKELEGRO', category: 'potion', hintEn: 'Regrows bones painfully overnight', hintFr: 'Poussos, fait repousser les os douloureusement' },
  { word: 'BEZOAR', wordFr: 'BEZOARD', category: 'potion', hintEn: 'Stone from a goat that cures most poisons', hintFr: 'Pierre de chèvre qui guérit la plupart des poisons' },
  { word: 'POTION', category: 'potion', hintEn: 'Magical brew, Snape teaches how to make them', hintFr: 'Breuvage magique, Rogue enseigne à les préparer' },
  { word: 'PEPPERUP', category: 'potion', hintEn: 'Cures colds, causes steam from ears', hintFr: 'Pimentine, guérit les rhumes, vapeur par les oreilles' },
  { word: 'ELIXIR', category: 'potion', hintEn: 'Of life, grants immortality', hintFr: 'De longue vie, accorde l\u2019immortalité' },
  { word: 'ANTIDOTE', category: 'potion', hintEn: 'Cures common poisons', hintFr: 'Guérit les poisons courants' },
  { word: 'SLEEPING', category: 'potion', hintEn: 'Puts the drinker into a deep sleep', hintFr: 'Plonge le buveur dans un sommeil profond' },
  { word: 'CALMING', category: 'potion', hintEn: 'Soothes anxiety and agitation', hintFr: "Apaise l\u2019anxiété et l\u2019agitation" },
  { word: 'ESSENCE', category: 'potion', hintEn: 'Of Dittany, heals wounds instantly', hintFr: 'De dictame, guérit les blessures instantanément' },
];

export function getRandomWord(): WordEntry {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}
