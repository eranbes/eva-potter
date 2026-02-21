/**
 * French translations for book titles and descriptions.
 * Keyed by book slug (matches the `slug` column in the books table).
 * Uses official French edition titles.
 */
export const booksFr: Record<string, { title: string; description: string }> = {
  'philosophers-stone': {
    title: "Harry Potter \u00e0 l'\u00e9cole des sorciers",
    description:
      "Le gar\u00e7on qui a surv\u00e9cu d\u00e9couvre qu'il est un sorcier et commence son aventure magique \u00e0 Poudlard.",
  },
  'chamber-of-secrets': {
    title: 'Harry Potter et la Chambre des secrets',
    description:
      "Une force myst\u00e9rieuse p\u00e9trifie les \u00e9l\u00e8ves de Poudlard, et Harry doit d\u00e9couvrir le secret de la Chambre des secrets.",
  },
  'prisoner-of-azkaban': {
    title: "Harry Potter et le Prisonnier d'Azkaban",
    description:
      "Un dangereux prisonnier s'est \u00e9chapp\u00e9 d'Azkaban, et Harry apprend des v\u00e9rit\u00e9s surprenantes sur son pass\u00e9.",
  },
  'goblet-of-fire': {
    title: 'Harry Potter et la Coupe de feu',
    description:
      "Harry est myst\u00e9rieusement inscrit au dangereux Tournoi des Trois Sorciers et doit affronter des \u00e9preuves bien trop dangereuses pour son \u00e2ge.",
  },
  'order-of-the-phoenix': {
    title: "Harry Potter et l'Ordre du Ph\u00e9nix",
    description:
      "Harry forme un groupe secret de d\u00e9fense alors que le Minist\u00e8re de la Magie refuse de croire au retour de Voldemort.",
  },
  'half-blood-prince': {
    title: 'Harry Potter et le Prince de Sang-M\u00eal\u00e9',
    description:
      "Harry d\u00e9couvre le pass\u00e9 de Voldemort gr\u00e2ce \u00e0 des le\u00e7ons priv\u00e9es avec Dumbledore et trouve un myst\u00e9rieux manuel de potions.",
  },
  'deathly-hallows': {
    title: 'Harry Potter et les Reliques de la Mort',
    description:
      "Harry, Ron et Hermione partent en qu\u00eate dangereuse pour trouver et d\u00e9truire les Horcruxes de Voldemort.",
  },
};
