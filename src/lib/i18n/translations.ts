export type Language = 'en' | 'fr';

type TranslationDictionary = Record<string, string | string[]>;

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    // Welcome page
    'welcome.title': 'Eva Potter',
    'welcome.subtitle': 'The Magical Quiz Adventure',
    'welcome.nameLabel': 'What is your name, young wizard?',
    'welcome.namePlaceholder': 'Enter your name here...',
    'welcome.nameError': 'Please enter your name, young witch or wizard!',
    'welcome.submitError': 'The Sorting Hat had trouble! Please try again.',
    'welcome.submitting': 'Opening the doors...',
    'welcome.submit': 'Enter the Great Hall',
    'welcome.pinLabelNew': 'Choose a 4-digit PIN to remember you',
    'welcome.pinLabelReturning': 'Enter your PIN',
    'welcome.pinPlaceholder': '4 digits',
    'welcome.pinError': 'Wrong PIN! Try again.',
    'welcome.pinFormatError': 'PIN must be exactly 4 digits',
    'welcome.back': 'Back',
    'welcome.quote': 'It does not do to dwell on dreams and forget to live.',
    'welcome.quoteAuthor': '- Albus Dumbledore',

    // Books page
    'books.welcomeBack': 'Welcome back, {name}!',
    'books.points': '{count} points',
    'books.chooseBook': 'Choose Your Book',
    'books.loading': 'Summoning the library...',
    'books.error': 'The library seems to be under a Confundus Charm. Please try again!',
    'books.tryAgain': 'Try again',

    // Book detail / difficulty page
    'bookDetail.backToBookshelf': 'Back to Bookshelf',
    'bookDetail.loading': 'Opening the book...',
    'bookDetail.notFound': 'This book was not found in the Hogwarts Library.',
    'bookDetail.locked': 'This book is still locked! You need {points} points to unlock it. Keep earning points from other quizzes!',
    'bookDetail.error': 'A mischievous Niffler seems to have stolen this book. Please try again!',
    'bookDetail.returnToBookshelf': 'Return to Bookshelf',
    'bookDetail.chooseChallenge': 'Choose Your Challenge',
    'bookDetail.startOver': 'Start Over',
    'bookDetail.startOverConfirm': 'This will reset your progress and deduct {points} points. Are you sure?',
    'bookDetail.startOverYes': 'Yes, reset',
    'bookDetail.startOverCancel': 'Cancel',
    'bookDetail.startOverError': 'Failed to reset quiz. Please try again!',

    // Difficulty labels
    'difficulty.firstYears': 'First-Years',
    'difficulty.owls': 'O.W.L.s',
    'difficulty.newts': 'N.E.W.T.s',
    'difficulty.easy': 'Easy',
    'difficulty.normal': 'Normal',
    'difficulty.hard': 'Hard',
    'difficulty.easyDesc': 'Perfect for beginning your magical education. Basic questions about the story.',
    'difficulty.normalDesc': 'Ordinary Wizarding Level questions. For witches and wizards with solid knowledge.',
    'difficulty.hardDesc': 'Nastily Exhausting Wizarding Test. Only the most dedicated students dare attempt these!',
    'difficulty.orderOfThePhoenix': 'Order of the Phoenix',
    'difficulty.expert': 'Expert',
    'difficulty.expertDesc': 'Only true members of the Order could answer these. Incredibly obscure details and the tiniest mentions from the books!',
    'difficulty.expertLocked': 'Complete N.E.W.T.s first to unlock!',

    // Completion status
    'status.complete': 'Complete!',
    'status.inProgress': 'In Progress',
    'status.notStarted': 'Not started',

    // Quiz play page
    'quiz.questionOf': 'Question {current} of {total}',
    'quiz.submitAnswer': 'Submit Answer',
    'quiz.castingSpell': 'Casting spell...',
    'quiz.nextQuestion': 'Next Question',
    'quiz.seeResults': 'See Results',
    'quiz.back': 'Back',
    'quiz.backToBook': 'Back to Book',
    'quiz.tryAgain': 'Try Again',
    'quiz.invalidDifficulty': "That's not a valid difficulty level!",
    'quiz.chooseDifficulty': 'Choose a Difficulty',
    'quiz.loading': 'Preparing your questions...',
    'quiz.bookNotFound': 'Book not found in the Hogwarts Library.',
    'quiz.bookLocked': 'This book is locked! You need {points} points to unlock it.',
    'quiz.fetchError': "Failed to find this book. The Marauder's Map might help!",
    'quiz.noQuestions': 'No questions found for this quiz yet. Professor McGonagall is still writing them!',
    'quiz.pointsThisQuiz': '+{points} points this quiz',

    // Results page
    'results.title': 'Quiz Complete!',
    'results.noResults': 'No quiz results found. Perhaps a Memory Charm was involved?',
    'results.takeQuiz': 'Take the Quiz',
    'results.backToBookshelf': 'Back to Bookshelf',
    'results.chooseDifficulty': 'Choose Difficulty',
    'results.tryAgain': 'Try Again',
    'results.answerReview': 'Answer Review',
    'results.pointsEarned': '+{points} points earned!',
    'results.totalPoints': 'Total: {points} points',
    'results.outstanding': 'Outstanding! You would make Hermione Granger proud!',
    'results.exceeds': 'Exceeds Expectations! You clearly know your wizarding world!',
    'results.acceptable': 'Acceptable! A solid showing, young wizard!',
    'results.notBad': "Not bad! With a bit more study, you'll ace it next time!",
    'results.keepTrying': "Keep trying! Even Neville Longbottom became a hero. You've got this!",

    // Progress page
    'progress.title': 'Your Magical Journey',
    'progress.subtitle': 'Track your progress across the Wizarding World',
    'progress.loading': 'Loading your journey...',
    'progress.error': 'The Hogwarts Express seems to have hit a snag. Please try again!',
    'progress.backToBookshelf': 'Back to Bookshelf',
    'progress.hogwartsExpress': 'The Hogwarts Express',
    'progress.totalPoints': 'Total Points',
    'progress.questions': 'Questions',
    'progress.correct': 'Correct',
    'progress.hogwartsAwaits': 'Hogwarts awaits...',
    'progress.overall': '{percent}% overall',

    // Leaderboard page
    'leaderboard.title': 'Leaderboard',
    'leaderboard.subtitle': "See who's top of the class at Hogwarts",
    'leaderboard.loading': 'Summoning the rankings...',
    'leaderboard.error': 'The Sorting Hat seems confused. Please try again!',
    'leaderboard.backToBookshelf': 'Back to Bookshelf',
    'leaderboard.you': '(You)',

    // Header
    'header.title': 'Eva Potter',

    // Answer feedback
    'feedback.didYouKnow': 'Did you know?',
    'feedback.points': '+{points} points!',
    'feedback.correctMessages': [
      'Brilliant! Dumbledore would be proud!',
      'Outstanding! 10 points to your house!',
      "Magical work! You're a true witch!",
      'Wonderful! Even Hermione is impressed!',
      'Excellent! That was spellbinding!',
      'Superb! You know your magic well!',
      'Fantastic! Professor McGonagall approves!',
      'Well done! The Sorting Hat chose wisely!',
    ] as unknown as string,
    'feedback.incorrectMessages': [
      'Not quite, but keep trying! Even Neville got better!',
      'Almost! Even the best wizards miss sometimes!',
      "Don't worry! You're still learning great magic!",
      'Nice try! Every great witch keeps practicing!',
      'So close! Hagrid believes in you!',
      'Keep going! Ron missed a few spells too!',
    ] as unknown as string,

    // Answer review
    'review.question': 'Question {number}',
    'review.yourAnswer': 'Your answer:',
    'review.correctAnswer': 'Correct answer:',

    // Quiz progress bar
    'progressBar.questionOf': 'Question {current} of {total}',
    'progressBar.pts': '{points} pts',

    // Unlock celebration
    'unlock.bookUnlocked': 'Book Unlocked!',
    'unlock.tapToContinue': 'Tap anywhere to continue',

    // Wordle
    'wordle.title': 'Magical Words',
    'wordle.subtitle': 'Guess the Harry Potter word',
    'wordle.loading': 'Conjuring a word...',
    'wordle.newGame': 'New Game',
    'wordle.hint': '{category} — {length} letters',
    'wordle.category.character': 'Character',
    'wordle.category.spell': 'Spell',
    'wordle.category.creature': 'Creature',
    'wordle.category.place': 'Place',
    'wordle.category.object': 'Object',
    'wordle.category.potion': 'Potion',
    'wordle.win': 'Brilliant!',
    'wordle.lose': 'The word was {word}',
    'wordle.pointsEarned': '+{points} points!',
    'wordle.playAgain': 'Play Again',
    'wordle.guessesLeft': '{count} guesses left',
    'wordle.stats': 'Stats',
    'wordle.played': 'Played',
    'wordle.winRate': 'Win %',
    'wordle.streak': 'Streak',
    'wordle.maxStreak': 'Max Streak',
    'wordle.guessDistribution': 'Guess Distribution',
    'wordle.notEnoughLetters': 'Not enough letters',

    // Book card
    'bookCard.pointsToUnlock': '{points} points to unlock',

    // Goblet of Fortune
    'goblet.title': 'The Goblet of Fortune',
    'goblet.subtitle': 'The magical flames flicker before you...',
    'goblet.betPrompt': 'How many points do you dare to risk?',
    'goblet.flamePrompt': 'Choose a flame!',
    'goblet.allIn': 'All in!',
    'goblet.skip': 'No thanks',
    'goblet.continue': 'Continue',
    'goblet.win': 'The flame burns gold! You won {points} points!',
    'goblet.lose': 'The flame fades... You lost {points} points.',
    'goblet.red': 'Red',
    'goblet.blue': 'Blue',
    'goblet.gold': 'Gold',
  },

  fr: {
    // Welcome page
    'welcome.title': 'Eva Potter',
    'welcome.subtitle': "L'Aventure Magique du Quiz",
    'welcome.nameLabel': 'Quel est ton nom, jeune sorcier ?',
    'welcome.namePlaceholder': 'Entre ton nom ici...',
    'welcome.nameError': 'Entre ton nom, jeune sorci\u00e8re ou sorcier !',
    'welcome.submitError': 'Le Choixpeau a eu un probl\u00e8me ! R\u00e9essaie.',
    'welcome.submitting': 'Ouverture des portes...',
    'welcome.submit': 'Entrer dans la Grande Salle',
    'welcome.pinLabelNew': 'Choisis un code PIN \u00e0 4 chiffres pour te souvenir',
    'welcome.pinLabelReturning': 'Entre ton code PIN',
    'welcome.pinPlaceholder': '4 chiffres',
    'welcome.pinError': 'Mauvais code PIN\u00a0! R\u00e9essaie.',
    'welcome.pinFormatError': 'Le code PIN doit faire exactement 4 chiffres',
    'welcome.back': 'Retour',
    'welcome.quote': "Il ne fait pas bon se perdre dans les r\u00eaves et oublier de vivre.",
    'welcome.quoteAuthor': '- Albus Dumbledore',

    // Books page
    'books.welcomeBack': 'Bon retour, {name}\u00a0!',
    'books.points': '{count} points',
    'books.chooseBook': 'Choisis ton Livre',
    'books.loading': 'Invocation de la biblioth\u00e8que...',
    'books.error': 'La biblioth\u00e8que semble sous un sortil\u00e8ge de Confusion. R\u00e9essaie\u00a0!',
    'books.tryAgain': 'R\u00e9essayer',

    // Book detail / difficulty page
    'bookDetail.backToBookshelf': 'Retour \u00e0 la Biblioth\u00e8que',
    'bookDetail.loading': 'Ouverture du livre...',
    'bookDetail.notFound': "Ce livre n'a pas \u00e9t\u00e9 trouv\u00e9 dans la biblioth\u00e8que de Poudlard.",
    'bookDetail.locked': "Ce livre est encore verrouill\u00e9\u00a0! Il te faut {points} points pour le d\u00e9bloquer. Continue \u00e0 gagner des points avec d'autres quiz\u00a0!",
    'bookDetail.error': 'Un Niffleur espion semble avoir vol\u00e9 ce livre. R\u00e9essaie\u00a0!',
    'bookDetail.returnToBookshelf': 'Retour \u00e0 la Biblioth\u00e8que',
    'bookDetail.chooseChallenge': 'Choisis ton D\u00e9fi',
    'bookDetail.startOver': 'Recommencer',
    'bookDetail.startOverConfirm': 'Cela va r\u00e9initialiser ta progression et enlever {points} points. Tu es s\u00fbr(e)\u00a0?',
    'bookDetail.startOverYes': 'Oui, r\u00e9initialiser',
    'bookDetail.startOverCancel': 'Annuler',
    'bookDetail.startOverError': 'La r\u00e9initialisation a \u00e9chou\u00e9. R\u00e9essaie\u00a0!',

    // Difficulty labels
    'difficulty.firstYears': 'Premi\u00e8re Ann\u00e9e',
    'difficulty.owls': 'B.U.S.E.',
    'difficulty.newts': 'A.S.P.I.C.',
    'difficulty.easy': 'Facile',
    'difficulty.normal': 'Normal',
    'difficulty.hard': 'Difficile',
    'difficulty.easyDesc': "Id\u00e9al pour commencer ton \u00e9ducation magique. Questions de base sur l'histoire.",
    'difficulty.normalDesc': "Brevet Universel de Sorcellerie \u00c9l\u00e9mentaire. Pour les sorci\u00e8res et sorciers avec de solides connaissances.",
    'difficulty.hardDesc': "Accumulation de Sorcellerie Particuli\u00e8rement Intensive et Contraignante. Seuls les \u00e9l\u00e8ves les plus courageux osent essayer\u00a0!",
    'difficulty.orderOfThePhoenix': "L'Ordre du Ph\u00e9nix",
    'difficulty.expert': 'Expert',
    'difficulty.expertDesc': "Seuls les vrais membres de l'Ordre pourraient r\u00e9pondre. Des d\u00e9tails incroyablement obscurs et les moindres mentions des livres\u00a0!",
    'difficulty.expertLocked': "Termine les A.S.P.I.C. d'abord pour d\u00e9bloquer\u00a0!",

    // Completion status
    'status.complete': 'Termin\u00e9\u00a0!',
    'status.inProgress': 'En cours',
    'status.notStarted': 'Pas commenc\u00e9',

    // Quiz play page
    'quiz.questionOf': 'Question {current} sur {total}',
    'quiz.submitAnswer': 'Valider la R\u00e9ponse',
    'quiz.castingSpell': 'Lancement du sort...',
    'quiz.nextQuestion': 'Question Suivante',
    'quiz.seeResults': 'Voir les R\u00e9sultats',
    'quiz.back': 'Retour',
    'quiz.backToBook': 'Retour au Livre',
    'quiz.tryAgain': 'R\u00e9essayer',
    'quiz.invalidDifficulty': "Ce n'est pas un niveau de difficult\u00e9 valide\u00a0!",
    'quiz.chooseDifficulty': 'Choisis une difficult\u00e9',
    'quiz.loading': 'Pr\u00e9paration de tes questions...',
    'quiz.bookNotFound': "Livre introuvable dans la biblioth\u00e8que de Poudlard.",
    'quiz.bookLocked': "Ce livre est verrouill\u00e9\u00a0! Il te faut {points} points pour le d\u00e9bloquer.",
    'quiz.fetchError': "Impossible de trouver ce livre. La Carte du Maraudeur pourrait aider\u00a0!",
    'quiz.noQuestions': "Pas encore de questions pour ce quiz. Le professeur McGonagall est encore en train de les \u00e9crire\u00a0!",
    'quiz.pointsThisQuiz': '+{points} points pour ce quiz',

    // Results page
    'results.title': 'Quiz Termin\u00e9\u00a0!',
    'results.noResults': "Aucun r\u00e9sultat trouv\u00e9. Peut-\u00eatre un sortil\u00e8ge d'Oubliettes\u00a0?",
    'results.takeQuiz': 'Faire le Quiz',
    'results.backToBookshelf': 'Retour \u00e0 la Biblioth\u00e8que',
    'results.chooseDifficulty': 'Choisis la difficult\u00e9',
    'results.tryAgain': 'R\u00e9essayer',
    'results.answerReview': 'R\u00e9capitulatif des r\u00e9ponses',
    'results.pointsEarned': '+{points} points gagn\u00e9s\u00a0!',
    'results.totalPoints': 'Total\u00a0: {points} points',
    'results.outstanding': "Optimal\u00a0! Hermione Granger serait fi\u00e8re de toi\u00a0!",
    'results.exceeds': 'Effort exceptionnel\u00a0! Tu connais bien le monde des sorciers\u00a0!',
    'results.acceptable': 'Acceptable\u00a0! Bien jou\u00e9, jeune sorcier\u00a0!',
    'results.notBad': "Pas mal\u00a0! Avec un peu plus d'\u00e9tude, tu r\u00e9ussiras la prochaine fois\u00a0!",
    'results.keepTrying': "Continue\u00a0! M\u00eame Neville Londubat est devenu un h\u00e9ros. Tu vas y arriver\u00a0!",

    // Progress page
    'progress.title': 'Ton Voyage Magique',
    'progress.subtitle': 'Suis ta progression \u00e0 travers le Monde des Sorciers',
    'progress.loading': 'Chargement de ton voyage...',
    'progress.error': "Le Poudlard Express semble avoir eu un souci. R\u00e9essaie\u00a0!",
    'progress.backToBookshelf': 'Retour \u00e0 la Biblioth\u00e8que',
    'progress.hogwartsExpress': 'Le Poudlard Express',
    'progress.totalPoints': 'Points Totaux',
    'progress.questions': 'Questions',
    'progress.correct': 'Bonnes r\u00e9ponses',
    'progress.hogwartsAwaits': 'Poudlard attend...',
    'progress.overall': '{percent}% au total',

    // Leaderboard page
    'leaderboard.title': 'Classement',
    'leaderboard.subtitle': 'D\u00e9couvre qui est le premier de la classe \u00e0 Poudlard',
    'leaderboard.loading': 'Invocation du classement...',
    'leaderboard.error': 'Le Choixpeau semble confus. R\u00e9essaie\u00a0!',
    'leaderboard.backToBookshelf': 'Retour \u00e0 la Biblioth\u00e8que',
    'leaderboard.you': '(Toi)',

    // Header
    'header.title': 'Eva Potter',

    // Answer feedback
    'feedback.didYouKnow': 'Le savais-tu\u00a0?',
    'feedback.points': '+{points} points\u00a0!',
    'feedback.correctMessages': [
      'Brillant\u00a0! Dumbledore serait fier\u00a0!',
      'Exceptionnel\u00a0! 10 points pour ta maison\u00a0!',
      "Travail magique\u00a0! Tu es une vraie sorci\u00e8re\u00a0!",
      "Merveilleux\u00a0! M\u00eame Hermione est impressionn\u00e9e\u00a0!",
      "Excellent\u00a0! C'\u00e9tait ensorcelant\u00a0!",
      'Superbe\u00a0! Tu connais bien ta magie\u00a0!',
      'Fantastique\u00a0! Le professeur McGonagall approuve\u00a0!',
      'Bien jou\u00e9\u00a0! Le Choixpeau a bien choisi\u00a0!',
    ] as unknown as string,
    'feedback.incorrectMessages': [
      'Pas tout \u00e0 fait, mais continue\u00a0! M\u00eame Neville a progress\u00e9\u00a0!',
      'Presque\u00a0! M\u00eame les meilleurs sorciers se trompent parfois\u00a0!',
      "Ne t'inqui\u00e8te pas\u00a0! Tu deviens un peu plus magique chaque jour\u00a0!",
      "Bel essai\u00a0! Toute grande sorci\u00e8re continue de s'entra\u00eener\u00a0!",
      'Si pr\u00e8s\u00a0! Hagrid croit en toi\u00a0!',
      "Continue\u00a0! Ron aussi a rat\u00e9 quelques sorts\u00a0!",
    ] as unknown as string,

    // Answer review
    'review.question': 'Question {number}',
    'review.yourAnswer': 'Ta r\u00e9ponse\u00a0:',
    'review.correctAnswer': 'Bonne r\u00e9ponse\u00a0:',

    // Quiz progress bar
    'progressBar.questionOf': 'Question {current} sur {total}',
    'progressBar.pts': '{points} pts',

    // Unlock celebration
    'unlock.bookUnlocked': 'Livre D\u00e9bloqu\u00e9\u00a0!',
    'unlock.tapToContinue': 'Appuie n\u2019importe o\u00f9 pour continuer',

    // Wordle
    'wordle.title': 'Mots Magiques',
    'wordle.subtitle': 'Devine le mot Harry Potter',
    'wordle.loading': 'Invocation d\u2019un mot...',
    'wordle.newGame': 'Nouvelle Partie',
    'wordle.hint': '{category} — {length} lettres',
    'wordle.category.character': 'Personnage',
    'wordle.category.spell': 'Sortil\u00e8ge',
    'wordle.category.creature': 'Cr\u00e9ature',
    'wordle.category.place': 'Lieu',
    'wordle.category.object': 'Objet',
    'wordle.category.potion': 'Potion',
    'wordle.win': 'Brillant\u00a0!',
    'wordle.lose': 'Le mot \u00e9tait {word}',
    'wordle.pointsEarned': '+{points} points\u00a0!',
    'wordle.playAgain': 'Rejouer',
    'wordle.guessesLeft': '{count} essais restants',
    'wordle.stats': 'Statistiques',
    'wordle.played': 'Jou\u00e9s',
    'wordle.winRate': 'Victoires %',
    'wordle.streak': 'S\u00e9rie',
    'wordle.maxStreak': 'Meilleure s\u00e9rie',
    'wordle.guessDistribution': 'R\u00e9partition des essais',
    'wordle.notEnoughLetters': 'Pas assez de lettres',

    // Book card
    'bookCard.pointsToUnlock': '{points} points pour d\u00e9bloquer',

    // Goblet of Fortune
    'goblet.title': 'La Coupe de Fortune',
    'goblet.subtitle': 'Les flammes magiques vacillent devant toi...',
    'goblet.betPrompt': 'Combien de points oses-tu risquer\u00a0?',
    'goblet.flamePrompt': 'Choisis une flamme\u00a0!',
    'goblet.allIn': 'Tout miser\u00a0!',
    'goblet.skip': 'Non merci',
    'goblet.continue': 'Continuer',
    'goblet.win': 'La flamme brille dor\u00e9e\u00a0! Tu as gagn\u00e9 {points} points\u00a0!',
    'goblet.lose': 'La flamme s\u2019\u00e9teint... Tu as perdu {points} points.',
    'goblet.red': 'Rouge',
    'goblet.blue': 'Bleue',
    'goblet.gold': 'Dor\u00e9e',
  },
};
