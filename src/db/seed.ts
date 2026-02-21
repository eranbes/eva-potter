import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'eva_potter.db');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = OFF');

console.log('🧙 Eva Potter Database Seed');
console.log('📁 Database path:', dbPath);

// Create tables if they don't exist (never drops user data)
console.log('📋 Creating tables (if not exist)...');
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    pin TEXT NOT NULL DEFAULT '',
    total_points INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    cover_image TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL,
    points_to_unlock INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id),
    difficulty TEXT NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL,
    explanation TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    book_id INTEGER NOT NULL REFERENCES books(id),
    difficulty TEXT NOT NULL,
    questions_answered INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    question_id INTEGER NOT NULL REFERENCES questions(id),
    selected_option TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS game_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wordle_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    word TEXT NOT NULL,
    won INTEGER NOT NULL,
    guesses_used INTEGER NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    played_at TEXT NOT NULL
  );
`);

// Clear and re-seed content tables only (preserving user data)
console.log('🔄 Refreshing content tables...');
sqlite.exec(`DELETE FROM questions`);
sqlite.exec(`DELETE FROM books`);
sqlite.exec(`DELETE FROM game_settings`);

// Seed books
console.log('📚 Seeding books...');
const insertBook = sqlite.prepare(
  `INSERT INTO books (id, title, slug, description, cover_image, sort_order, points_to_unlock) VALUES (?, ?, ?, ?, '', ?, ?)`
);

const booksData = [
  [1, "Harry Potter and the Philosopher's Stone", 'philosophers-stone', 'The boy who lived discovers he is a wizard and begins his magical journey at Hogwarts School of Witchcraft and Wizardry.', 1, 0],
  [2, 'Harry Potter and the Chamber of Secrets', 'chamber-of-secrets', 'A mysterious force is petrifying students at Hogwarts, and Harry must uncover the secret of the Chamber of Secrets.', 2, 60],
  [3, 'Harry Potter and the Prisoner of Azkaban', 'prisoner-of-azkaban', 'A dangerous prisoner has escaped from Azkaban, and Harry learns surprising truths about his past.', 3, 180],
  [4, 'Harry Potter and the Goblet of Fire', 'goblet-of-fire', 'Harry is mysteriously entered into the dangerous Triwizard Tournament and faces challenges beyond his years.', 4, 360],
  [5, 'Harry Potter and the Order of the Phoenix', 'order-of-the-phoenix', 'Harry forms a secret defence group as the Ministry of Magic refuses to believe Voldemort has returned.', 5, 600],
  [6, 'Harry Potter and the Half-Blood Prince', 'half-blood-prince', 'Harry learns about Voldemort\'s past through private lessons with Dumbledore and discovers a mysterious potions textbook.', 6, 900],
  [7, 'Harry Potter and the Deathly Hallows', 'deathly-hallows', 'Harry, Ron, and Hermione set out on a dangerous quest to find and destroy Voldemort\'s Horcruxes.', 7, 1300],
];

for (const book of booksData) {
  insertBook.run(...book);
}

// Seed game settings
console.log('⚙️  Seeding game settings...');
const insertSetting = sqlite.prepare(`INSERT INTO game_settings (key, value) VALUES (?, ?)`);
insertSetting.run('points_easy', '10');
insertSetting.run('points_normal', '20');
insertSetting.run('points_hard', '30');
insertSetting.run('points_expert', '40');
insertSetting.run('questions_per_level', '10');

// Seed questions
console.log('❓ Seeding questions...');
const insertQuestion = sqlite.prepare(
  `INSERT INTO questions (book_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

type Q = [number, string, string, string, string, string, string, string, string, number];

const questions: Q[] = [
  // ===== BOOK 1: Philosopher's Stone =====
  // Easy (10)
  [1, 'easy', 'What is Harry Potter\'s middle name?', 'James', 'John', 'William', 'Thomas', 'A', 'Harry\'s full name is Harry James Potter, named after his father James Potter.', 1],
  [1, 'easy', 'Who is Harry\'s best friend at Hogwarts?', 'Draco Malfoy', 'Ron Weasley', 'Neville Longbottom', 'Dean Thomas', 'B', 'Ron Weasley becomes Harry\'s first and best friend on the Hogwarts Express.', 2],
  [1, 'easy', 'What house is Harry sorted into?', 'Slytherin', 'Ravenclaw', 'Hufflepuff', 'Gryffindor', 'D', 'The Sorting Hat placed Harry in Gryffindor, the house known for bravery and courage.', 3],
  [1, 'easy', 'What is the name of Harry\'s pet owl?', 'Errol', 'Hedwig', 'Pigwidgeon', 'Scabbers', 'B', 'Hagrid bought Hedwig as a birthday present for Harry from Eeylops Owl Emporium in Diagon Alley.', 4],
  [1, 'easy', 'Who gives Harry his Hogwarts letter?', 'Professor McGonagall', 'Dumbledore', 'Hagrid', 'An owl', 'C', 'After the Dursleys kept destroying Harry\'s letters, Hagrid personally delivered it to the hut on the rock.', 5],
  [1, 'easy', 'What sport does Harry play at Hogwarts?', 'Football', 'Cricket', 'Quidditch', 'Tennis', 'C', 'Quidditch is the most popular sport in the wizarding world, played on broomsticks.', 6],
  [1, 'easy', 'What position does Harry play in Quidditch?', 'Chaser', 'Beater', 'Keeper', 'Seeker', 'D', 'Harry became the youngest Seeker in a century when he joined the Gryffindor team in his first year.', 7],
  [1, 'easy', 'Where do the Dursleys make Harry sleep?', 'The attic', 'The garden shed', 'The cupboard under the stairs', 'The garage', 'C', 'Harry lived in the cupboard under the stairs at 4 Privet Drive until his Hogwarts letter arrived.', 8],
  [1, 'easy', 'What is the name of the headmaster of Hogwarts?', 'Severus Snape', 'Albus Dumbledore', 'Minerva McGonagall', 'Rubeus Hagrid', 'B', 'Albus Dumbledore is considered the greatest wizard of modern times and the headmaster of Hogwarts.', 9],
  [1, 'easy', 'What is hidden on the third floor of Hogwarts?', 'A dragon', 'The Philosopher\'s Stone', 'A treasure chest', 'The Sword of Gryffindor', 'B', 'The Philosopher\'s Stone, created by Nicolas Flamel, was hidden at Hogwarts for protection.', 10],

  // Normal (10)
  [1, 'normal', 'What does the Mirror of Erised show?', 'The future', 'The past', 'Your deepest desire', 'Your worst fear', 'C', 'The name "Erised" is "Desire" spelled backwards. The inscription reads: "I show not your face but your heart\'s desire."', 1],
  [1, 'normal', 'What is the three-headed dog guarding the Stone called?', 'Fang', 'Fluffy', 'Rex', 'Cerberus', 'B', 'Fluffy belongs to Hagrid, who bought him from a Greek man in a pub. Music puts Fluffy to sleep.', 2],
  [1, 'normal', 'What flavour does Dumbledore say he found in a Bertie Bott\'s bean?', 'Earwax', 'Vomit', 'Grass', 'Soap', 'A', 'Dumbledore said he once got a vomit-flavoured one and lost his taste for them, but found an earwax one.', 3],
  [1, 'normal', 'What is Nicolas Flamel famous for creating?', 'The Elder Wand', 'The Philosopher\'s Stone', 'The Invisibility Cloak', 'The Marauder\'s Map', 'B', 'Nicolas Flamel is the only known maker of the Philosopher\'s Stone, which produces the Elixir of Life.', 4],
  [1, 'normal', 'Who tries to steal the Philosopher\'s Stone for Voldemort?', 'Snape', 'Quirrell', 'Malfoy', 'Filch', 'B', 'Professor Quirrell had Voldemort living on the back of his head, hidden under his turban.', 5],
  [1, 'normal', 'What does Harry see in the Mirror of Erised?', 'Himself as Head Boy', 'His family', 'A pile of gold', 'Himself holding the Quidditch Cup', 'B', 'Harry sees himself surrounded by his parents and extended family — something he never had.', 6],
  [1, 'normal', 'How do you get past Fluffy the three-headed dog?', 'Feed it treats', 'Play music', 'Cast a spell', 'Give it a bone', 'B', 'Fluffy falls asleep when music is played, just like the mythical Cerberus of Greek legend.', 7],
  [1, 'normal', 'What does Hagrid win in a card game at the pub?', 'A broomstick', 'A dragon egg', 'A magic wand', 'A golden snitch', 'B', 'Hagrid won a Norwegian Ridgeback dragon egg, which he named Norbert (later renamed Norberta).', 8],
  [1, 'normal', 'What are the cores of Harry\'s and Voldemort\'s wands?', 'Dragon heartstring', 'Unicorn hair', 'Phoenix feather', 'Thestral hair', 'C', 'Both wands contain a tail feather from Fawkes, Dumbledore\'s phoenix — making them brothers.', 9],
  [1, 'normal', 'What chess piece does Ron play as in the giant chess game?', 'King', 'Knight', 'Bishop', 'Rook', 'B', 'Ron sacrificed himself as a knight so Harry could checkmate the king and proceed to the Stone.', 10],

  // Hard (10)
  [1, 'hard', 'On what street do the Dursleys live?', 'Magnolia Crescent', 'Wisteria Walk', 'Privet Drive', 'Spinner\'s End', 'C', 'The Dursleys live at number 4 Privet Drive, Little Whinging, Surrey.', 1],
  [1, 'hard', 'What is the first password to Gryffindor Tower?', 'Fortuna Major', 'Caput Draconis', 'Pig Snout', 'Balderdash', 'B', 'Caput Draconis is Latin for "Dragon\'s Head." Percy the Prefect gives this password.', 2],
  [1, 'hard', 'How many possible fouls are there in Quidditch?', '700', '300', '500', '150', 'A', 'There are 700 possible fouls in Quidditch, though all of them occurred during the 1473 World Cup final.', 3],
  [1, 'hard', 'What does Dumbledore say he sees in the Mirror of Erised?', 'Himself with the Stone', 'A pair of thick woollen socks', 'His family alive', 'Himself as Minister for Magic', 'B', 'Dumbledore tells Harry he sees himself holding a pair of thick woollen socks, though this may not be entirely true.', 4],
  [1, 'hard', 'What is the vault number where the Philosopher\'s Stone was kept?', '687', '713', '711', '694', 'B', 'Vault 713 at Gringotts held the Philosopher\'s Stone before Hagrid collected it on Dumbledore\'s orders.', 5],
  [1, 'hard', 'Who sent Harry the Invisibility Cloak for Christmas?', 'Hagrid', 'Sirius Black', 'Dumbledore', 'McGonagall', 'C', 'Dumbledore sent Harry his father\'s Invisibility Cloak with a note saying "Use it well."', 6],
  [1, 'hard', 'What type of dragon does Hagrid hatch?', 'Hungarian Horntail', 'Swedish Short-Snout', 'Norwegian Ridgeback', 'Common Welsh Green', 'C', 'Hagrid hatched a Norwegian Ridgeback, which he named Norbert. It was later taken to Romania by Charlie Weasley\'s friends.', 7],
  [1, 'hard', 'What flavour is the first chocolate frog card Harry gets?', 'There are no flavours — it\'s a collectible card', 'Mint', 'Plain chocolate', 'Strawberry', 'A', 'Chocolate Frog cards are collectible wizard cards. Harry\'s first card features Albus Dumbledore.', 8],
  [1, 'hard', 'What centaur tells Harry that Mars is bright tonight?', 'Bane', 'Ronan', 'Firenze', 'Magorian', 'B', 'Ronan the centaur keeps saying "Mars is bright tonight," referring to the coming conflict. Firenze actually helps Harry.', 9],
  [1, 'hard', 'How old was Nicolas Flamel when he decided to destroy the Stone?', '465', '565', '665', '365', 'C', 'Nicolas Flamel was 665 years old. He and his wife Perenelle had enough Elixir of Life stored to set their affairs in order.', 10],

  // ===== BOOK 2: Chamber of Secrets =====
  // Easy (10)
  [2, 'easy', 'What creature warns Harry not to return to Hogwarts?', 'A goblin', 'A house-elf', 'A ghost', 'A centaur', 'B', 'Dobby the house-elf visited Harry at the Dursleys\' to warn him about the dangers at Hogwarts.', 1],
  [2, 'easy', 'What is the name of the house-elf who visits Harry?', 'Kreacher', 'Winky', 'Dobby', 'Hokey', 'C', 'Dobby served the Malfoy family and risked severe punishment to warn Harry about the Chamber of Secrets.', 2],
  [2, 'easy', 'How do Harry and Ron get to Hogwarts when they miss the train?', 'They walk', 'A flying car', 'A magic carpet', 'They take a bus', 'B', 'They flew Mr. Weasley\'s enchanted Ford Anglia to Hogwarts and crashed into the Whomping Willow.', 3],
  [2, 'easy', 'What is the name of the Weasley family\'s home?', 'Shell Cottage', 'The Burrow', 'Grimmauld Place', 'The Hollow', 'B', 'The Burrow is the Weasley family home, located near the village of Ottery St Catchpole in Devon.', 4],
  [2, 'easy', 'Who is the new Defence Against the Dark Arts teacher?', 'Remus Lupin', 'Mad-Eye Moody', 'Gilderoy Lockhart', 'Severus Snape', 'C', 'Gilderoy Lockhart was a famous author who turned out to be a fraud who stole other wizards\' achievements.', 5],
  [2, 'easy', 'What kind of creature is in the Chamber of Secrets?', 'A dragon', 'A basilisk', 'A werewolf', 'A troll', 'B', 'The Basilisk is a giant serpent also known as the King of Serpents. Its gaze can kill.', 6],
  [2, 'easy', 'Who opened the Chamber of Secrets?', 'Draco Malfoy', 'Ginny Weasley', 'Tom Riddle', 'Hagrid', 'B', 'Ginny Weasley was being controlled by Tom Riddle\'s diary, which made her open the Chamber.', 7],
  [2, 'easy', 'What special ability does Harry have that helps him in this book?', 'He can fly without a broom', 'He can talk to snakes', 'He can turn invisible', 'He can read minds', 'B', 'Harry is a Parselmouth — he can speak Parseltongue, the language of snakes. This is very rare.', 8],
  [2, 'easy', 'What does Harry find in Moaning Myrtle\'s bathroom?', 'A secret passage', 'Tom Riddle\'s diary', 'The Philosopher\'s Stone', 'A dragon egg', 'B', 'Harry found Tom Riddle\'s diary, which turned out to be a Horcrux containing a piece of Voldemort\'s soul.', 9],
  [2, 'easy', 'Who is petrified first in the book?', 'Hermione', 'Mrs. Norris', 'Colin Creevey', 'Justin Finch-Fletchley', 'B', 'Mrs. Norris, Filch\'s cat, was the first to be petrified. She was found hanging from a torch bracket.', 10],

  // Normal (10)
  [2, 'normal', 'What potion do Harry, Ron and Hermione brew to disguise themselves?', 'Felix Felicis', 'Polyjuice Potion', 'Veritaserum', 'Amortentia', 'B', 'Polyjuice Potion allows the drinker to assume the physical appearance of another person for one hour.', 1],
  [2, 'normal', 'Who does Hermione accidentally turn into with the Polyjuice Potion?', 'A dog', 'A cat', 'A bird', 'A rat', 'B', 'Hermione accidentally used a cat hair instead of Millicent Bulstrode\'s hair and partially transformed into a cat.', 2],
  [2, 'normal', 'What item does Harry use to destroy the diary?', 'The Sword of Gryffindor', 'A Basilisk fang', 'His wand', 'A phoenix feather', 'B', 'Harry stabbed the diary with a Basilisk fang. Basilisk venom is one of the few substances that can destroy a Horcrux.', 3],
  [2, 'normal', 'What creature comes to Harry\'s aid in the Chamber?', 'A hippogriff', 'A phoenix', 'A unicorn', 'A dragon', 'B', 'Fawkes, Dumbledore\'s phoenix, brought Harry the Sorting Hat and healed his Basilisk wound with phoenix tears.', 4],
  [2, 'normal', 'Why can\'t the Basilisk\'s gaze kill the petrified students?', 'They were wearing glasses', 'None of them looked at it directly', 'They were protected by a spell', 'They closed their eyes', 'B', 'Each victim saw the Basilisk indirectly — through a camera, a ghost, a mirror, or water — which petrified instead of killed them.', 5],
  [2, 'normal', 'What plant is used to cure the petrified students?', 'Gillyweed', 'Mandrake', 'Devil\'s Snare', 'Moly', 'B', 'Mandrake Restorative Draught is made from mature Mandrakes. Their cry can be fatal, so earmuffs are needed when repotting.', 6],
  [2, 'normal', 'Who was Tom Riddle\'s real identity?', 'Grindelwald', 'Voldemort', 'Salazar Slytherin', 'Severus Snape', 'B', 'Tom Marvolo Riddle rearranges to "I am Lord Voldemort" — he created this name while still at Hogwarts.', 7],
  [2, 'normal', 'What does Harry accidentally do at Flourish and Blotts?', 'Sets a book on fire', 'Ends up in Knockturn Alley', 'Breaks his wand', 'Turns invisible', 'B', 'Harry mispronounced "Diagon Alley" while using Floo Powder and ended up in the dark shop Borgin and Burkes in Knockturn Alley.', 8],
  [2, 'normal', 'What does Dobby use to try to stop Harry going to Hogwarts?', 'A Bludger', 'A curse', 'A locked door', 'A sleeping potion', 'A', 'Dobby enchanted a Bludger to chase Harry during a Quidditch match, hoping he\'d be injured enough to be sent home.', 9],
  [2, 'normal', 'How does Harry free Dobby from the Malfoys?', 'He pays the Malfoys', 'He tricks Lucius into giving Dobby a sock', 'He uses a spell', 'He asks Dumbledore', 'B', 'Harry hid Tom Riddle\'s diary inside a sock. When Lucius threw it aside, Dobby caught it — receiving clothes means freedom for a house-elf.', 10],

  // Hard (10)
  [2, 'hard', 'What type of car does Mr. Weasley enchant?', 'Ford Cortina', 'Ford Anglia', 'Ford Escort', 'Ford Fiesta', 'B', 'Arthur Weasley enchanted a turquoise Ford Anglia to fly. It later went wild in the Forbidden Forest.', 1],
  [2, 'hard', 'Who is the Heir of Slytherin?', 'Draco Malfoy', 'Salazar Slytherin', 'Tom Riddle', 'Lucius Malfoy', 'C', 'Tom Riddle, being the last descendant of Salazar Slytherin, was the true Heir of Slytherin.', 2],
  [2, 'hard', 'What is Nearly Headless Nick\'s full name?', 'Sir Nicholas de Mimsy', 'Sir Nicholas de Mimsy-Porpington', 'Sir Nicholas de Canterbury', 'Sir Nicholas de Porpington-Mimsy', 'B', 'His full name is Sir Nicholas de Mimsy-Porpington. He was nearly beheaded with a blunt axe — 45 hacks and his head still wasn\'t off.', 3],
  [2, 'hard', 'What is the name of the Weasleys\' owl?', 'Hedwig', 'Pigwidgeon', 'Errol', 'Hermes', 'C', 'Errol is the Weasleys\' elderly, unreliable owl who frequently crashes into things during deliveries.', 4],
  [2, 'hard', 'How old was Moaning Myrtle when she died?', '12', '14', '16', '11', 'B', 'Myrtle Warren was a 14-year-old Ravenclaw student who was killed by the Basilisk 50 years before Harry\'s time.', 5],
  [2, 'hard', 'What spell does Lockhart accidentally cast on himself?', 'Stupefy', 'Obliviate', 'Petrificus Totalus', 'Confundus', 'B', 'Lockhart tried to use Obliviate (memory charm) on Harry and Ron with Ron\'s broken wand, and it backfired, erasing his own memory permanently.', 6],
  [2, 'hard', 'What ghost celebrates their Deathday Party?', 'The Bloody Baron', 'The Grey Lady', 'Nearly Headless Nick', 'The Fat Friar', 'C', 'Nearly Headless Nick celebrated his 500th Deathday Party on Halloween. The food was rotten so ghosts could almost taste it.', 7],
  [2, 'hard', 'Where is the entrance to the Chamber of Secrets located?', 'Behind a painting', 'In the Restricted Section', 'In a bathroom sink', 'Under the Whomping Willow', 'C', 'The entrance is hidden in a sink in Moaning Myrtle\'s bathroom. A tiny snake is carved on the tap, and it opens with Parseltongue.', 8],
  [2, 'hard', 'What does the writing on the wall say when Mrs. Norris is petrified?', 'The Chamber is Open', 'The Heir Returns', 'The Chamber of Secrets has been opened. Enemies of the Heir, beware.', 'Beware the Basilisk', 'C', 'The message was written in blood on the wall near the petrified Mrs. Norris on the night of the Deathday Party.', 9],
  [2, 'hard', 'What did Aragog tell Harry about the creature in the Chamber?', 'It was a dragon', 'Spiders fear it and he would not name it', 'It was another spider', 'It was a werewolf', 'B', 'Aragog, the giant Acromantula, said spiders fear the creature in the Chamber above all others and refused to speak its name.', 10],

  // ===== BOOK 3: Prisoner of Azkaban =====
  // Easy (10)
  [3, 'easy', 'Who is the prisoner of Azkaban?', 'Voldemort', 'Lucius Malfoy', 'Sirius Black', 'Peter Pettigrew', 'C', 'Sirius Black escaped from Azkaban prison after 12 years. He was the first person known to escape.', 1],
  [3, 'easy', 'What creatures guard Azkaban prison?', 'Dragons', 'Dementors', 'Trolls', 'Giants', 'B', 'Dementors are dark creatures that feed on happiness and can suck out a person\'s soul with the Dementor\'s Kiss.', 2],
  [3, 'easy', 'What new class does Harry take that involves a hippogriff?', 'Transfiguration', 'Defence Against the Dark Arts', 'Care of Magical Creatures', 'Herbology', 'C', 'Hagrid becomes the Care of Magical Creatures teacher and introduces the class to Buckbeak the hippogriff.', 3],
  [3, 'easy', 'What is the name of the hippogriff?', 'Fawkes', 'Buckbeak', 'Norbert', 'Aragog', 'B', 'Buckbeak is a hippogriff — a creature with the front of an eagle and the body of a horse. You must bow to approach one.', 4],
  [3, 'easy', 'Who is the new Defence Against the Dark Arts teacher?', 'Gilderoy Lockhart', 'Severus Snape', 'Remus Lupin', 'Mad-Eye Moody', 'C', 'Professor Remus Lupin was one of the best DADA teachers Harry ever had. He taught Harry the Patronus Charm.', 5],
  [3, 'easy', 'What magical map do Harry, Ron, and Hermione use?', 'Map of Hogwarts', 'The Marauder\'s Map', 'The Treasure Map', 'The Secret Map', 'B', 'The Marauder\'s Map shows every person\'s location within Hogwarts. It was created by Moony, Wormtail, Padfoot, and Prongs.', 6],
  [3, 'easy', 'What is Harry\'s relationship to Sirius Black?', 'Uncle', 'Godfather', 'Cousin', 'Brother', 'B', 'Sirius Black is Harry\'s godfather. He was best friends with James Potter at Hogwarts.', 7],
  [3, 'easy', 'What does Harry learn to cast to fight Dementors?', 'Stupefy', 'Expelliarmus', 'Patronus Charm', 'Lumos', 'C', 'The Patronus Charm (Expecto Patronum) creates a silver guardian that protects against Dementors.', 8],
  [3, 'easy', 'What form does Harry\'s Patronus take?', 'A wolf', 'A stag', 'An otter', 'A dog', 'B', 'Harry\'s Patronus is a stag, the same animal his father James could transform into as an Animagus (Prongs).', 9],
  [3, 'easy', 'What does Hermione use to attend extra classes?', 'A broomstick', 'A Time-Turner', 'An invisibility cloak', 'A teleportation spell', 'B', 'Hermione was given a Time-Turner by Professor McGonagall so she could attend multiple classes at the same time.', 10],

  // Normal (10)
  [3, 'normal', 'What animal is Peter Pettigrew\'s Animagus form?', 'A dog', 'A cat', 'A rat', 'A bird', 'C', 'Peter Pettigrew (Wormtail) lived as Ron\'s pet rat Scabbers for 12 years to hide from Voldemort\'s followers.', 1],
  [3, 'normal', 'What is Sirius Black\'s Animagus form?', 'A stag', 'A large black dog', 'A wolf', 'A raven', 'B', 'Sirius transforms into a large black dog, which is why his Marauder nickname is "Padfoot."', 2],
  [3, 'normal', 'Who really betrayed Harry\'s parents to Voldemort?', 'Sirius Black', 'Remus Lupin', 'Peter Pettigrew', 'Severus Snape', 'C', 'Peter Pettigrew was the Potters\' Secret Keeper, not Sirius. He betrayed them and framed Sirius for the crime.', 3],
  [3, 'normal', 'What is Professor Lupin\'s secret?', 'He is a vampire', 'He is a werewolf', 'He is a Death Eater', 'He is an Animagus', 'B', 'Remus Lupin was bitten by the werewolf Fenrir Greyback as a child. His friends became Animagi to keep him company during full moons.', 4],
  [3, 'normal', 'What creature does Lupin use to teach about Boggarts?', 'Nothing — a Boggart changes shape', 'A snake', 'A spider', 'A ghost', 'A', 'A Boggart takes the shape of whatever you fear most. The spell Riddikulus makes it take a funny shape instead.', 5],
  [3, 'normal', 'What does the Knight Bus do?', 'It takes students to Hogwarts', 'It\'s emergency transport for stranded witches and wizards', 'It delivers mail', 'It patrols the streets', 'B', 'The Knight Bus picks up stranded witches and wizards. It has beds instead of seats and is driven by Ernie Prang.', 6],
  [3, 'normal', 'What sweet shop do students visit in Hogsmeade?', 'Weasleys\' Wizard Wheezes', 'Honeydukes', 'Zonko\'s', 'Sugar Plum\'s', 'B', 'Honeydukes is the famous sweet shop in Hogsmeade that sells magical sweets like Chocolate Frogs and Pepper Imps.', 7],
  [3, 'normal', 'Who gives Harry the Marauder\'s Map?', 'Sirius Black', 'Dumbledore', 'Fred and George Weasley', 'Remus Lupin', 'C', 'Fred and George stole the Marauder\'s Map from Filch\'s office in their first year and gave it to Harry.', 8],
  [3, 'normal', 'What does Hermione\'s Boggart turn into?', 'A spider', 'Professor McGonagall saying she failed', 'A Dementor', 'Lord Voldemort', 'B', 'Hermione\'s greatest fear was academic failure — her Boggart turned into Professor McGonagall telling her she\'d failed everything.', 9],
  [3, 'normal', 'How do Harry and Hermione save Buckbeak?', 'They hide him in the forest', 'They use the Time-Turner to go back and rescue him', 'They ask Dumbledore', 'They cast an invisibility spell', 'B', 'Using the Time-Turner, Harry and Hermione went back three hours to free Buckbeak before his execution.', 10],

  // Hard (10)
  [3, 'hard', 'What are the four Marauder nicknames?', 'Moony, Wormtail, Padfoot, and Prongs', 'Moony, Ratty, Padfoot, and Antlers', 'Wolfy, Wormtail, Padfoot, and Prongs', 'Moony, Wormtail, Paws, and Prongs', 'A', 'Moony (Lupin/werewolf), Wormtail (Pettigrew/rat), Padfoot (Sirius/dog), and Prongs (James/stag).', 1],
  [3, 'hard', 'What does Harry see in his crystal ball in Divination?', 'A Grim', 'Nothing', 'A lightning bolt', 'The Dark Mark', 'A', 'The Grim is a spectral dog that is an omen of death — though what Harry kept seeing was actually Sirius in his dog form.', 2],
  [3, 'hard', 'What magazine does Ron\'s dad win a prize from?', 'The Daily Prophet', 'The Quibbler', 'The Daily Mail', 'The Daily Prophet\'s Grand Prize Galleon Draw', 'D', 'Arthur Weasley won the Daily Prophet Grand Prize Galleon Draw of 700 Galleons, which the family used for a trip to Egypt.', 3],
  [3, 'hard', 'What Quidditch team does Ron support?', 'Puddlemere United', 'Kenmare Kestrels', 'Chudley Cannons', 'Wimbourne Wasps', 'C', 'The Chudley Cannons are Ron\'s favourite team. Their motto was changed to "Let\'s all just keep our fingers crossed and hope for the best."', 4],
  [3, 'hard', 'What is Professor Trelawney\'s first name?', 'Sybill', 'Cassandra', 'Lavender', 'Minerva', 'A', 'Professor Sybill Trelawney teaches Divination. She is the great-great-granddaughter of the famous Seer Cassandra Trelawney.', 5],
  [3, 'hard', 'Which spell does Snape teach the class to identify werewolves?', 'He assigns an essay on werewolves', 'Lumos Maxima', 'Homorphus Charm', 'Revelio', 'A', 'Snape set the class an essay on werewolves when he substituted for Lupin, hoping a student would figure out Lupin\'s secret.', 6],
  [3, 'hard', 'What is the incantation for the Patronus Charm?', 'Patronum Expecto', 'Expecto Patronum', 'Patronus Maxima', 'Expecto Patronus', 'B', 'The correct incantation is "Expecto Patronum," which roughly translates from Latin as "I await a guardian."', 7],
  [3, 'hard', 'Where does Sirius hide after escaping Azkaban?', 'The Forbidden Forest', 'The Shrieking Shack', 'Hogsmeade caves', 'Grimmauld Place', 'C', 'Sirius hides in a cave near Hogsmeade, surviving on rats. He also hides in the Shrieking Shack briefly.', 8],
  [3, 'hard', 'How many turns of the Time-Turner do Harry and Hermione make?', 'Two', 'Three', 'Four', 'Five', 'B', 'Dumbledore tells Hermione that "three turns should do it" — each turn goes back one hour, taking them back three hours.', 9],
  [3, 'hard', 'What does Aunt Marge insult that causes Harry to lose control of his magic?', 'Harry\'s appearance', 'Harry\'s parents', 'Harry\'s friends', 'Harry\'s school grades', 'B', 'Aunt Marge insulted Harry\'s parents, calling his father a "no-account, good-for-nothing, lazy scrounger," causing Harry to accidentally inflate her like a balloon.', 10],

  // ===== BOOK 4: Goblet of Fire =====
  // Easy (10)
  [4, 'easy', 'What tournament takes place at Hogwarts?', 'The Quidditch World Cup', 'The Triwizard Tournament', 'The Duelling Championship', 'The House Cup', 'B', 'The Triwizard Tournament is a magical competition between three European wizarding schools.', 1],
  [4, 'easy', 'How many schools compete in the Triwizard Tournament?', 'Two', 'Three', 'Four', 'Five', 'B', 'Hogwarts, Beauxbatons Academy of Magic, and Durmstrang Institute compete in the Triwizard Tournament.', 2],
  [4, 'easy', 'Who is chosen as the Hogwarts champion?', 'Harry Potter', 'Cedric Diggory', 'Fred Weasley', 'Draco Malfoy', 'B', 'Cedric Diggory was the official Hogwarts champion. Harry was mysteriously selected as a fourth champion.', 3],
  [4, 'easy', 'What event does Harry attend at the beginning of the book?', 'A Quidditch World Cup', 'A wedding', 'A Ministry event', 'A dragon show', 'A', 'Harry attends the Quidditch World Cup final between Ireland and Bulgaria with the Weasleys.', 4],
  [4, 'easy', 'What does Harry face in the first task?', 'A sphinx', 'A dragon', 'A giant spider', 'A mermaid', 'B', 'Each champion had to retrieve a golden egg guarded by a dragon. Harry faced a Hungarian Horntail.', 5],
  [4, 'easy', 'What special event happens at Hogwarts besides the tournament?', 'A carnival', 'The Yule Ball', 'A concert', 'Quidditch matches', 'B', 'The Yule Ball is a formal dance held on Christmas Day as part of the Triwizard Tournament traditions.', 6],
  [4, 'easy', 'Who does Harry take to the Yule Ball?', 'Hermione', 'Ginny Weasley', 'Cho Chang', 'Parvati Patil', 'D', 'Harry asked Cho Chang first but she was already going with Cedric, so he went with Parvati Patil.', 7],
  [4, 'easy', 'What is at the centre of the maze in the third task?', 'A dragon', 'The Triwizard Cup', 'A chest of gold', 'Dumbledore', 'B', 'The Triwizard Cup was placed at the centre of a magical maze filled with obstacles and creatures.', 8],
  [4, 'easy', 'Who returns at the end of this book?', 'Sirius Black', 'Nicolas Flamel', 'Lord Voldemort', 'James Potter', 'C', 'Lord Voldemort returns to a physical body using a dark ritual involving Harry\'s blood.', 9],
  [4, 'easy', 'What creature does Hagrid show the class that can only be seen after witnessing death?', 'Hippogriffs', 'Thestrals', 'Blast-Ended Skrewts', 'Nifflers', 'B', 'Thestrals are winged horses visible only to those who have seen and accepted death. Harry can see them after Cedric\'s death.', 10],

  // Normal (10)
  [4, 'normal', 'What does the golden egg contain?', 'A baby dragon', 'A clue for the second task that only works underwater', 'A map', 'A golden snitch', 'B', 'The golden egg screeches when opened in air, but plays Mermish song underwater, giving the clue for the second task.', 1],
  [4, 'normal', 'What does Harry have to rescue from the lake in the second task?', 'The golden egg', 'Ron Weasley', 'His wand', 'A treasure chest', 'B', 'Each champion had to rescue the person they\'d miss most from the lake. Harry rescued Ron (and also saved Fleur\'s sister Gabrielle).', 2],
  [4, 'normal', 'What does Harry use to breathe underwater?', 'A Bubble-Head Charm', 'Gillyweed', 'A magical helmet', 'A potion', 'B', 'Dobby gave Harry Gillyweed, which temporarily gives the user gills and webbed hands and feet for breathing underwater.', 3],
  [4, 'normal', 'Who put Harry\'s name in the Goblet of Fire?', 'Dumbledore', 'Barty Crouch Jr.', 'Karkaroff', 'Snape', 'B', 'Barty Crouch Jr., disguised as Mad-Eye Moody using Polyjuice Potion, put Harry\'s name in the Goblet under a fourth school name.', 4],
  [4, 'normal', 'Who is disguised as Mad-Eye Moody throughout the year?', 'Peter Pettigrew', 'Barty Crouch Jr.', 'Lucius Malfoy', 'Voldemort', 'B', 'Barty Crouch Jr. kept the real Moody locked in a magical trunk and used Polyjuice Potion to impersonate him all year.', 5],
  [4, 'normal', 'What happens when Harry and Cedric touch the Triwizard Cup together?', 'They win together', 'It is a Portkey that takes them to a graveyard', 'They are disqualified', 'It explodes', 'B', 'The Cup was turned into a Portkey by Barty Crouch Jr., transporting Harry and Cedric to the graveyard where Voldemort waited.', 6],
  [4, 'normal', 'What is Priori Incantatem?', 'A healing spell', 'The reverse spell effect when brother wands connect', 'A dark curse', 'A charm for creating light', 'B', 'When Harry and Voldemort\'s brother wands connected, echoes of Voldemort\'s recent victims appeared, including Harry\'s parents.', 7],
  [4, 'normal', 'Who is the Beauxbatons champion?', 'Viktor Krum', 'Fleur Delacour', 'Gabrielle Delacour', 'Madame Maxime', 'B', 'Fleur Delacour represented Beauxbatons. She is part Veela, which gives her an enchanting beauty.', 8],
  [4, 'normal', 'Who is the Durmstrang champion?', 'Igor Karkaroff', 'Fleur Delacour', 'Viktor Krum', 'Gregory Goyle', 'C', 'Viktor Krum is also a famous international Quidditch player who played Seeker for Bulgaria in the World Cup.', 9],
  [4, 'normal', 'What is the Dark Mark?', 'A mark on Harry\'s arm', 'Voldemort\'s sign — a skull with a snake', 'A dark spell', 'A poisonous plant', 'B', 'The Dark Mark is Voldemort\'s symbol — a skull with a serpent tongue. Death Eaters cast it in the sky and bear it on their arms.', 10],

  // Hard (10)
  [4, 'hard', 'What dragon does Harry face in the first task?', 'Swedish Short-Snout', 'Chinese Fireball', 'Welsh Green', 'Hungarian Horntail', 'D', 'The Hungarian Horntail is considered the most dangerous dragon species. Harry used his Firebolt broomstick to outfly it.', 1],
  [4, 'hard', 'What spell does Harry use to summon his broomstick during the first task?', 'Wingardium Leviosa', 'Accio', 'Locomotor', 'Mobiliarbus', 'B', 'Harry used the Summoning Charm (Accio Firebolt!) to call his broomstick from the castle during the dragon task.', 2],
  [4, 'hard', 'Who does Hermione go to the Yule Ball with?', 'Ron Weasley', 'Harry Potter', 'Viktor Krum', 'Neville Longbottom', 'C', 'Viktor Krum asked Hermione to the Yule Ball. Ron was very jealous but hadn\'t asked her himself.', 3],
  [4, 'hard', 'What is Veritaserum?', 'A love potion', 'A truth-telling potion', 'A sleeping potion', 'A strength potion', 'B', 'Veritaserum is the most powerful truth serum. Three drops are enough to make someone spill their deepest secrets.', 4],
  [4, 'hard', 'What creatures pull the Beauxbatons carriage?', 'Thestrals', 'Abraxan horses', 'Hippogriffs', 'Pegasi', 'B', 'The Beauxbatons carriage is pulled by a dozen enormous winged Abraxan horses that drink only single-malt whisky.', 5],
  [4, 'hard', 'What does S.P.E.W. stand for?', 'Society for the Protection of Elvish Welfare', 'Society for the Promotion of Elfish Wellbeing', 'Society for the Prevention of Elf Workload', 'Students Protecting Elf Workers', 'A', 'Hermione founded S.P.E.W. to advocate for house-elf rights. Ron and Harry were reluctant members.', 6],
  [4, 'hard', 'What bone does Voldemort use in the resurrection ritual?', 'His father\'s bone', 'His mother\'s bone', 'Dumbledore\'s bone', 'A unicorn bone', 'A', '"Bone of the father, unknowingly given" — Voldemort\'s father\'s bone was taken from the grave in the Little Hangleton graveyard.', 7],
  [4, 'hard', 'What spell does Voldemort use to kill Cedric?', 'Crucio', 'Sectumsempra', 'Avada Kedavra', 'Expulso', 'C', 'Avada Kedavra is the Killing Curse and one of the three Unforgivable Curses. It produces a flash of green light.', 8],
  [4, 'hard', 'Who tells Harry about the dragons before the first task?', 'Dumbledore', 'Hagrid', 'Sirius Black', 'Ron', 'B', 'Hagrid secretly showed Harry the dragons the night before the first task. Charlie Weasley was helping manage them.', 9],
  [4, 'hard', 'What is the name of Barty Crouch Jr.\'s father?', 'Bartemius Crouch Sr.', 'Bartholomew Crouch', 'Benedict Crouch', 'Bernard Crouch', 'A', 'Bartemius Crouch Sr. was Head of the Department of International Magical Co-operation. His son killed him and transfigured his body into a bone.', 10],

  // ===== BOOK 5: Order of the Phoenix =====
  // Easy (10)
  [5, 'easy', 'What is the Order of the Phoenix?', 'A book of spells', 'A secret group fighting Voldemort', 'A type of potion', 'A Quidditch team', 'B', 'The Order of the Phoenix is a secret organisation founded by Dumbledore to fight Voldemort and his Death Eaters.', 1],
  [5, 'easy', 'What is the name of the new Defence Against the Dark Arts teacher?', 'Professor Umbridge', 'Professor Lupin', 'Professor Moody', 'Professor Lockhart', 'A', 'Dolores Umbridge was sent by the Ministry of Magic to control Hogwarts and refuses to teach practical defence.', 2],
  [5, 'easy', 'What secret group does Harry form to learn defence?', 'The Phoenix Club', 'The DA (Dumbledore\'s Army)', 'The Defence League', 'Harry\'s Heroes', 'B', 'Dumbledore\'s Army (DA) was a secret student group that met in the Room of Requirement to learn practical defence spells.', 3],
  [5, 'easy', 'What room do the DA members use for practice?', 'The Great Hall', 'The Room of Requirement', 'The Common Room', 'An empty classroom', 'B', 'The Room of Requirement appears only when someone has real need of it, and it transforms to suit their needs.', 4],
  [5, 'easy', 'What does Umbridge make Harry write in detention?', '"I will behave"', '"I must not tell lies"', '"I will follow rules"', '"I am sorry"', 'B', 'Umbridge used a cursed quill that carved the words into the back of Harry\'s hand as he wrote them, using his own blood as ink.', 5],
  [5, 'easy', 'Who is Harry\'s first kiss?', 'Ginny Weasley', 'Hermione Granger', 'Cho Chang', 'Luna Lovegood', 'C', 'Harry and Cho Chang shared a kiss under the mistletoe in the Room of Requirement before Christmas.', 6],
  [5, 'easy', 'Where is the Order of the Phoenix headquartered?', 'Hogwarts', '12 Grimmauld Place', 'The Burrow', 'The Ministry of Magic', 'B', 'Number 12 Grimmauld Place is Sirius Black\'s family home, hidden by a Fidelius Charm.', 7],
  [5, 'easy', 'Who is the leader of the Order of the Phoenix?', 'Harry Potter', 'Sirius Black', 'Albus Dumbledore', 'Minerva McGonagall', 'C', 'Dumbledore founded and leads the Order of the Phoenix to fight against Voldemort.', 8],
  [5, 'easy', 'What government position does Umbridge hold?', 'Minister for Magic', 'Hogwarts High Inquisitor', 'Head of Aurors', 'Chief Warlock', 'B', 'Umbridge was appointed Hogwarts High Inquisitor by the Minister for Magic, giving her power to inspect and dismiss teachers.', 9],
  [5, 'easy', 'What are the exams that fifth-year students take called?', 'N.E.W.T.s', 'O.W.L.s', 'S.A.T.s', 'G.C.S.E.s', 'B', 'O.W.L.s (Ordinary Wizarding Levels) are crucial exams taken in fifth year that determine which N.E.W.T. classes students can take.', 10],

  // Normal (10)
  [5, 'normal', 'What does Harry see in his visions connected to Voldemort?', 'The future', 'A door in the Department of Mysteries', 'Hogwarts being destroyed', 'His parents', 'B', 'Harry has visions of a corridor and door in the Department of Mysteries because Voldemort is seeking a prophecy stored there.', 1],
  [5, 'normal', 'What is the prophecy about?', 'How to defeat Dementors', 'The one with the power to vanquish the Dark Lord', 'The location of the Elder Wand', 'How to create Horcruxes', 'B', 'The prophecy states that "the one with the power to vanquish the Dark Lord" was born at the end of July to parents who defied Voldemort three times.', 2],
  [5, 'normal', 'Who teaches Harry Occlumency?', 'Dumbledore', 'Snape', 'Lupin', 'McGonagall', 'B', 'Snape teaches Harry Occlumency — the art of closing your mind against external penetration — to block his connection to Voldemort.', 3],
  [5, 'normal', 'What do Fred and George do before leaving Hogwarts?', 'They take their N.E.W.T.s', 'They create a spectacular fireworks display and swamp', 'They apologize to Umbridge', 'They destroy the Great Hall', 'B', 'Fred and George set off a magnificent fireworks display and created a portable swamp before flying away on their broomsticks.', 4],
  [5, 'normal', 'Who betrays Dumbledore\'s Army to Umbridge?', 'Cho Chang', 'Marietta Edgecombe', 'Neville Longbottom', 'Zacharias Smith', 'B', 'Marietta Edgecombe told Umbridge about the DA. Hermione had jinxed the sign-up sheet so "SNEAK" appeared in spots on the betrayer\'s face.', 5],
  [5, 'normal', 'What happens to Sirius at the Department of Mysteries?', 'He is captured', 'He is killed by Bellatrix', 'He escapes', 'He is stunned', 'B', 'Sirius Black was killed by his cousin Bellatrix Lestrange, falling through the mysterious veil in the Death Chamber.', 6],
  [5, 'normal', 'Who is the new character Luna Lovegood?', 'A Hufflepuff student', 'An eccentric Ravenclaw who believes in unusual creatures', 'A Slytherin spy', 'A transfer student from Beauxbatons', 'B', 'Luna Lovegood is a quirky Ravenclaw who believes in Nargles and Wrackspurts. Her father edits The Quibbler magazine.', 7],
  [5, 'normal', 'What do Thestrals look like?', 'Beautiful white horses', 'Skeletal winged horses', 'Tiny flying ponies', 'Invisible unicorns', 'B', 'Thestrals are skeletal, reptilian winged horses with white, shining eyes. They\'re considered unlucky by many wizards.', 8],
  [5, 'normal', 'Why can\'t Dumbledore look at Harry throughout this book?', 'He is angry with Harry', 'He fears Voldemort could use their connection', 'He is blind', 'Harry insulted him', 'B', 'Dumbledore avoided Harry because he feared Voldemort might use the mental connection to spy through Harry\'s eyes or possess him.', 9],
  [5, 'normal', 'What does Hermione trick Umbridge into going to the Forbidden Forest for?', 'To see centaurs', 'To see Dumbledore\'s secret weapon (Grawp)', 'To find a lost student', 'To collect rare herbs', 'B', 'Hermione tricked Umbridge by claiming Dumbledore had a secret weapon in the forest. They encountered Grawp (Hagrid\'s giant half-brother) and centaurs.', 10],

  // Hard (10)
  [5, 'hard', 'What is the full text of the prophecy\'s key phrase?', '"The one with the power to vanquish the Dark Lord approaches"', '"Neither can live while the other survives"', '"Born to those who have thrice defied him, born as the seventh month dies"', 'All of the above are parts of the prophecy', 'D', 'The prophecy, made by Trelawney to Dumbledore, contains all these elements and was the reason Voldemort targeted the Potters.', 1],
  [5, 'hard', 'Who else could the prophecy have referred to besides Harry?', 'Ron Weasley', 'Draco Malfoy', 'Neville Longbottom', 'Cedric Diggory', 'C', 'Neville was also born at the end of July to parents who defied Voldemort three times. Voldemort chose Harry, marking him as his equal.', 2],
  [5, 'hard', 'What is Grawp?', 'A type of creature', 'Hagrid\'s giant half-brother', 'A house-elf', 'A spell', 'B', 'Grawp is Hagrid\'s half-brother, a full giant about 16 feet tall. Hagrid brought him back from his trip to the giants.', 3],
  [5, 'hard', 'What is the name of the Weasley twins\' joke shop?', 'Weasley\'s Wizard Wheezes', 'Weasley\'s Wondrous Wares', 'Weasley\'s Wand Works', 'Weasley\'s Wild Things', 'A', 'Fred and George used Harry\'s Triwizard Tournament winnings to open Weasleys\' Wizard Wheezes at 93 Diagon Alley.', 4],
  [5, 'hard', 'Who is the head of the Auror Office?', 'Kingsley Shacklebolt', 'Rufus Scrimgeour', 'Gawain Robards', 'Nymphadora Tonks', 'B', 'Rufus Scrimgeour was Head of the Auror Office before becoming Minister for Magic after Fudge was removed.', 5],
  [5, 'hard', 'What does the Quibbler article Harry gives an interview to reveal?', 'The location of Sirius Black', 'Harry\'s account of Voldemort\'s return', 'The identity of Death Eaters', 'Dumbledore\'s secret plans', 'B', 'Luna\'s father published Harry\'s full account of Voldemort\'s return in The Quibbler, which Umbridge then banned at Hogwarts.', 6],
  [5, 'hard', 'What curse did Bellatrix use on Neville\'s parents?', 'Avada Kedavra', 'Cruciatus Curse', 'Imperius Curse', 'Sectumsempra', 'B', 'Bellatrix and other Death Eaters tortured Neville\'s parents, Frank and Alice Longbottom, into insanity with the Cruciatus Curse.', 7],
  [5, 'hard', 'What is the name of the centaur who teaches Divination?', 'Bane', 'Ronan', 'Firenze', 'Magorian', 'C', 'Firenze agreed to teach Divination at Hogwarts after Umbridge sacked Trelawney, which made him an outcast among centaurs.', 8],
  [5, 'hard', 'What does the Veil in the Department of Mysteries represent?', 'A portal to another dimension', 'The boundary between life and death', 'A time travel device', 'An illusion', 'B', 'The Veil is an ancient archway through which the dead pass. Harry and Luna can hear whispers from beyond it because they\'ve witnessed death.', 9],
  [5, 'hard', 'What spell does Harry successfully use against Bellatrix after Sirius dies?', 'Avada Kedavra', 'Stupefy', 'Crucio', 'Sectumsempra', 'C', 'In grief and rage, Harry cast the Cruciatus Curse at Bellatrix, though Voldemort told him he needed to truly enjoy causing pain for it to work fully.', 10],

  // ===== BOOK 6: Half-Blood Prince =====
  // Easy (10)
  [6, 'easy', 'Who is the Half-Blood Prince?', 'Harry Potter', 'Voldemort', 'Severus Snape', 'Draco Malfoy', 'C', 'Snape\'s mother was Eileen Prince and his father was a Muggle named Tobias Snape, making him the "Half-Blood Prince."', 1],
  [6, 'easy', 'What book does Harry find that helps him in Potions?', 'A library book', 'The Half-Blood Prince\'s old textbook', 'Hermione\'s notes', 'A book from Dumbledore', 'B', 'Harry found a used Potions textbook full of helpful notes and invented spells written by the Half-Blood Prince.', 2],
  [6, 'easy', 'What does Harry learn about during private lessons with Dumbledore?', 'Advanced spells', 'Voldemort\'s past and Horcruxes', 'Quidditch strategies', 'How to become an Animagus', 'B', 'Dumbledore shows Harry memories in the Pensieve to understand Voldemort\'s history and how he created Horcruxes.', 3],
  [6, 'easy', 'What are Horcruxes?', 'Dark creatures', 'Objects containing pieces of a soul', 'Powerful wands', 'Secret spells', 'B', 'A Horcrux is an object in which a Dark wizard has hidden a piece of their soul to achieve immortality.', 4],
  [6, 'easy', 'Who does Harry start to have feelings for?', 'Hermione', 'Luna Lovegood', 'Cho Chang', 'Ginny Weasley', 'D', 'Harry develops feelings for Ginny Weasley throughout his sixth year. They start dating after Gryffindor wins the Quidditch Cup.', 5],
  [6, 'easy', 'What potion does Harry win with the Prince\'s help?', 'Polyjuice Potion', 'Felix Felicis (Liquid Luck)', 'Veritaserum', 'Amortentia', 'B', 'Harry brewed a perfect Draught of Living Death using the Prince\'s instructions and won a small bottle of Felix Felicis from Slughorn.', 6],
  [6, 'easy', 'What is Professor Slughorn\'s subject?', 'Defence Against the Dark Arts', 'Potions', 'Transfiguration', 'Charms', 'B', 'Horace Slughorn returns to teach Potions, while Snape finally gets the Defence Against the Dark Arts position.', 7],
  [6, 'easy', 'Who kills Dumbledore at the end of the book?', 'Voldemort', 'Draco Malfoy', 'Snape', 'Bellatrix', 'C', 'Snape cast the Killing Curse on Dumbledore atop the Astronomy Tower, though it was later revealed to be a mercy killing they had planned.', 8],
  [6, 'easy', 'What task was Draco given by Voldemort?', 'To spy on Harry', 'To kill Dumbledore', 'To steal the Elder Wand', 'To open the Chamber of Secrets', 'B', 'Voldemort assigned Draco the task of killing Dumbledore, partly as punishment for Lucius Malfoy\'s failures.', 9],
  [6, 'easy', 'Where do Harry and Dumbledore go to find a Horcrux?', 'The Forbidden Forest', 'A cave by the sea', 'Godric\'s Hollow', 'The Ministry of Magic', 'B', 'Harry and Dumbledore traveled to a seaside cave where young Tom Riddle once terrorised other orphanage children.', 10],

  // Normal (10)
  [6, 'normal', 'What spell from the Half-Blood Prince\'s book does Harry use on Draco?', 'Stupefy', 'Sectumsempra', 'Levicorpus', 'Muffliato', 'B', 'Sectumsempra slashes the target as if by an invisible sword. Harry used it on Draco in the bathroom, seriously injuring him.', 1],
  [6, 'normal', 'What does R.A.B. stand for?', 'Regulus Arcturus Black', 'Ronald Arthur Billius', 'Rubeus Albus Bartemius', 'Rodolphus Amycus Bellatrix', 'A', 'R.A.B. is Regulus Arcturus Black, Sirius\'s brother, who stole the real Horcrux locket and replaced it with a fake.', 2],
  [6, 'normal', 'What is the Unbreakable Vow?', 'A promise that binds wizards — breaking it means death', 'A special type of marriage', 'A spell that cannot be undone', 'A type of enchantment on objects', 'A', 'Snape made an Unbreakable Vow with Narcissa Malfoy to protect Draco and complete his task if he failed.', 3],
  [6, 'normal', 'What does Slughorn collect?', 'Rare potions ingredients', 'Famous and talented students (the "Slug Club")', 'Dark artifacts', 'Magical creatures', 'B', 'Slughorn collects well-connected and talented students, forming the "Slug Club" to benefit from their future success.', 4],
  [6, 'normal', 'What memory does Dumbledore need from Slughorn?', 'Slughorn\'s first day at Hogwarts', 'The real memory of Tom Riddle asking about Horcruxes', 'A memory about the Chamber of Secrets', 'The memory of Voldemort\'s birth', 'B', 'Slughorn had tampered with his memory of young Tom Riddle asking about Horcruxes. Dumbledore needed the unaltered version.', 5],
  [6, 'normal', 'How does Harry get the true memory from Slughorn?', 'He uses Veritaserum', 'He uses Felix Felicis (Liquid Luck)', 'He uses Legilimency', 'Dumbledore forces Slughorn', 'B', 'Harry used his Felix Felicis to create the perfect conditions for persuading Slughorn to give up the true memory.', 6],
  [6, 'normal', 'What potion does Dumbledore have to drink in the cave?', 'Polyjuice Potion', 'The Emerald Potion (Drink of Despair)', 'Veritaserum', 'Felix Felicis', 'B', 'The Emerald Potion caused Dumbledore terrible suffering — it induced fear, delirium, and extreme thirst. Harry had to force him to drink it all.', 7],
  [6, 'normal', 'What does Harry discover about the locket Horcrux they retrieved?', 'It was already destroyed', 'It was a fake — someone had already taken the real one', 'It was the wrong object', 'It was cursed', 'B', 'The locket was a fake, containing a note from R.A.B. saying he had stolen the real Horcrux and intended to destroy it.', 8],
  [6, 'normal', 'How do Death Eaters get into Hogwarts?', 'Through the main gate', 'Through a Vanishing Cabinet', 'Through the Forbidden Forest', 'Through Floo powder', 'B', 'Draco repaired a broken Vanishing Cabinet in the Room of Requirement, connecting it to its twin in Borgin and Burkes.', 9],
  [6, 'normal', 'What position does Harry play on the Quidditch team this year?', 'Seeker', 'Quidditch Captain', 'Chaser', 'Keeper', 'B', 'Harry is made Quidditch Captain in his sixth year and selects the team, including Ron as Keeper.', 10],

  // Hard (10)
  [6, 'hard', 'How many Horcruxes did Voldemort create?', 'Five', 'Six', 'Seven', 'Eight', 'B', 'Voldemort created six Horcruxes intentionally (splitting his soul into seven pieces including the part in his body). Harry was an accidental seventh.', 1],
  [6, 'hard', 'What are the known Horcruxes?', 'The diary, ring, locket, cup, diadem, Nagini, and Harry', 'The diary, ring, locket, cup, and Nagini only', 'The diary, ring, locket, and cup only', 'The Elder Wand, Cloak, and Stone', 'A', 'The Horcruxes were: Tom Riddle\'s diary, Marvolo Gaunt\'s ring, Slytherin\'s locket, Hufflepuff\'s cup, Ravenclaw\'s diadem, Nagini, and Harry (unintentional).', 2],
  [6, 'hard', 'What cursed object injured Dumbledore\'s hand?', 'The locket', 'Marvolo Gaunt\'s ring', 'Hufflepuff\'s cup', 'The diary', 'B', 'Dumbledore was cursed when he put on Marvolo Gaunt\'s ring (which contained the Resurrection Stone). The curse was slowly killing him.', 3],
  [6, 'hard', 'What was Tom Riddle\'s mother\'s name?', 'Bellatrix Gaunt', 'Merope Gaunt', 'Hepzibah Gaunt', 'Morfin Gaunt', 'B', 'Merope Gaunt was a descendant of Salazar Slytherin who used a love potion on the Muggle Tom Riddle Sr.', 4],
  [6, 'hard', 'What does Amortentia smell like?', 'Nothing', 'Whatever attracts you most', 'Roses and chocolate', 'Fresh parchment only', 'B', 'Amortentia is the most powerful love potion. It smells different to everyone — Harry smelled treacle tart, broomstick handle, and something flowery from the Burrow (Ginny).', 5],
  [6, 'hard', 'Who becomes the new Minister for Magic after Fudge?', 'Kingsley Shacklebolt', 'Rufus Scrimgeour', 'Pius Thicknesse', 'Arthur Weasley', 'B', 'Rufus Scrimgeour replaced Cornelius Fudge as Minister for Magic after Fudge was forced to admit Voldemort\'s return.', 6],
  [6, 'hard', 'What Inferi guard the locket Horcrux in the cave?', 'Zombies', 'Reanimated dead bodies controlled by dark magic', 'Dementors', 'Ghosts', 'B', 'Inferi are corpses reanimated by Dark Magic. They hide in the lake around the island where the Horcrux was placed and fear fire.', 7],
  [6, 'hard', 'What does Dumbledore use to fight the Inferi?', 'A Patronus', 'A ring of fire', 'The Elder Wand\'s power alone', 'Avada Kedavra', 'B', 'Dumbledore created a massive ring of fire (using Firestorm) to drive back the Inferi, as they fear heat and light.', 8],
  [6, 'hard', 'Who makes the Unbreakable Vow with Snape?', 'Bellatrix Lestrange', 'Narcissa Malfoy', 'Draco Malfoy', 'Lucius Malfoy', 'B', 'Narcissa Malfoy begged Snape to protect Draco. Bellatrix served as the Bonder (witness) for the Unbreakable Vow.', 9],
  [6, 'hard', 'What are the terms of the Unbreakable Vow Snape takes?', 'To kill Dumbledore only', 'To watch over Draco, protect him, and carry out the deed if Draco fails', 'To become a double agent', 'To protect the Malfoy family', 'B', 'Snape vowed to watch over Draco, protect him from harm, and if Draco should fail, to carry out the task Voldemort had given Draco (killing Dumbledore).', 10],

  // ===== BOOK 7: Deathly Hallows =====
  // Easy (10)
  [7, 'easy', 'What are the three Deathly Hallows?', 'Three types of magic', 'The Elder Wand, Resurrection Stone, and Invisibility Cloak', 'Three schools of magic', 'Three Horcruxes', 'B', 'The Deathly Hallows are three magical objects from the Tale of the Three Brothers, said to make the owner the Master of Death.', 1],
  [7, 'easy', 'Where do Harry, Ron, and Hermione go instead of returning to Hogwarts?', 'To the Ministry', 'On a quest to find and destroy Horcruxes', 'To another country', 'To find Dumbledore\'s tomb', 'B', 'Harry, Ron, and Hermione skip their seventh year to hunt down and destroy Voldemort\'s remaining Horcruxes.', 2],
  [7, 'easy', 'What does Dumbledore leave Harry in his will?', 'The Elder Wand', 'The first Golden Snitch Harry ever caught', 'Money', 'A Pensieve', 'B', 'Dumbledore left Harry the first Snitch he ever caught (which contained the Resurrection Stone) and the Sword of Gryffindor.', 3],
  [7, 'easy', 'What does Dumbledore leave Ron?', 'A wand', 'The Deluminator', 'A book', 'Money', 'B', 'The Deluminator (Put-Outer) captures and releases light. It also helped Ron find his way back to Harry and Hermione after he left.', 4],
  [7, 'easy', 'What does Dumbledore leave Hermione?', 'A Time-Turner', 'The Tales of Beedle the Bard', 'A magic mirror', 'An enchanted bag', 'B', 'Hermione received The Tales of Beedle the Bard, which contained the story of the Three Brothers and the symbol of the Deathly Hallows.', 5],
  [7, 'easy', 'Who destroys the first Horcrux in this book (the locket)?', 'Harry', 'Ron', 'Hermione', 'Neville', 'B', 'Ron destroyed Slytherin\'s locket with the Sword of Gryffindor after Harry opened it with Parseltongue.', 6],
  [7, 'easy', 'What happens at the Battle of Hogwarts?', 'Voldemort wins', 'A massive fight between good and evil at Hogwarts', 'Hogwarts is destroyed completely', 'Nothing — it was cancelled', 'B', 'The Battle of Hogwarts was the final confrontation between Voldemort\'s forces and the defenders of Hogwarts.', 7],
  [7, 'easy', 'Who kills Voldemort?', 'Dumbledore', 'Neville', 'Harry (Voldemort\'s own curse rebounds)', 'Snape', 'C', 'Voldemort\'s Killing Curse rebounded because the Elder Wand recognised Harry as its true master and wouldn\'t kill him.', 8],
  [7, 'easy', 'Who kills Nagini the snake?', 'Harry', 'Ron', 'Hermione', 'Neville', 'D', 'Neville Longbottom pulled the Sword of Gryffindor from the Sorting Hat and beheaded Nagini, destroying the last Horcrux.', 9],
  [7, 'easy', 'Who does Harry marry?', 'Hermione Granger', 'Cho Chang', 'Luna Lovegood', 'Ginny Weasley', 'D', 'Harry married Ginny Weasley. They had three children: James Sirius, Albus Severus, and Lily Luna Potter.', 10],

  // Normal (10)
  [7, 'normal', 'How do the Order members move Harry from Privet Drive?', 'Floo Network', 'Seven Harrys using Polyjuice Potion', 'An invisible car', 'Apparition', 'B', 'Six volunteers took Polyjuice Potion to look like Harry, creating seven Harrys to confuse the Death Eaters during the escape.', 1],
  [7, 'normal', 'Who dies during the flight from Privet Drive?', 'Hagrid', 'Mad-Eye Moody and Hedwig', 'Ron', 'Tonks', 'B', 'Alastor "Mad-Eye" Moody was killed by Voldemort during the flight, and Hedwig was killed by a stray Killing Curse.', 2],
  [7, 'normal', 'Where do Harry, Ron, and Hermione break into to find a Horcrux?', 'Hogwarts only', 'The Ministry of Magic and Gringotts', 'Malfoy Manor', 'Azkaban', 'B', 'They infiltrated the Ministry to get the locket from Umbridge, and later broke into Gringotts to steal Hufflepuff\'s cup from the Lestrange vault.', 3],
  [7, 'normal', 'What does Ron do that causes a rift in the group?', 'He betrays them', 'He leaves temporarily due to the locket\'s influence', 'He gets captured', 'He goes to help his family', 'B', 'The Horcrux locket amplified Ron\'s insecurities and jealousy, causing him to leave. The Deluminator helped him find his way back.', 4],
  [7, 'normal', 'What do Harry and Hermione visit in Godric\'s Hollow?', 'Dumbledore\'s house', 'Harry\'s parents\' grave and old home', 'A shop', 'The Hogwarts Express station', 'B', 'Harry visited his parents\' graves and the ruined house where Voldemort killed them. It was also where Bathilda Bagshot lived.', 5],
  [7, 'normal', 'What creature helps Harry break into Gringotts?', 'Dobby', 'Griphook the goblin', 'A dragon', 'Kreacher', 'B', 'Griphook agreed to help them break into the Lestrange vault in exchange for the Sword of Gryffindor.', 6],
  [7, 'normal', 'How do they escape Gringotts?', 'They Apparate', 'They ride a dragon', 'Through a secret tunnel', 'They use the Invisibility Cloak', 'B', 'Harry, Ron, and Hermione freed a blind Ukrainian Ironbelly dragon and rode it out through the roof of Gringotts.', 7],
  [7, 'normal', 'What is the significance of the tale of the Three Brothers?', 'It\'s just a fairy tale', 'It tells the origin of the Deathly Hallows', 'It predicts Harry\'s future', 'It\'s about the founders of Hogwarts', 'B', 'The three brothers each received a Hallow from Death: the Elder Wand, the Resurrection Stone, and the Cloak of Invisibility.', 8],
  [7, 'normal', 'What is "The Prince\'s Tale" chapter about?', 'A fairy tale', 'Snape\'s memories showing he loved Lily Potter and was loyal to Dumbledore', 'A story about royalty', 'Draco\'s confession', 'B', 'Snape\'s memories revealed he had always loved Lily Potter, and everything he did was to protect Harry and serve Dumbledore.', 9],
  [7, 'normal', 'Why does Harry sacrifice himself in the Forbidden Forest?', 'He gives up', 'He is the last Horcrux and must die to destroy it', 'Voldemort forces him', 'He is tricked', 'B', 'Harry learns he is an unintentional Horcrux and walks willingly to his death so the piece of Voldemort\'s soul inside him would be destroyed.', 10],

  // Hard (10)
  [7, 'hard', 'Who is the true master of the Elder Wand?', 'Voldemort', 'Snape', 'Harry Potter', 'Dumbledore', 'C', 'Draco disarmed Dumbledore before Snape killed him, making Draco the master. Harry then disarmed Draco at Malfoy Manor, making Harry the true master.', 1],
  [7, 'hard', 'What is the name of the house-elf who dies saving Harry?', 'Kreacher', 'Winky', 'Dobby', 'Hokey', 'C', 'Dobby was killed by Bellatrix\'s knife while Disapparating from Malfoy Manor. His grave reads "Here lies Dobby, a free elf."', 2],
  [7, 'hard', 'What are the names of Harry\'s children?', 'James, Albus, and Lily', 'Sirius, Remus, and Nymphadora', 'Fred, George, and Ginny', 'Arthur, Molly, and Rose', 'A', 'James Sirius Potter, Albus Severus Potter, and Lily Luna Potter — named after people who were important to Harry.', 3],
  [7, 'hard', 'Who kills Bellatrix Lestrange?', 'Harry Potter', 'Neville Longbottom', 'Ginny Weasley', 'Molly Weasley', 'D', 'Molly Weasley duelled and killed Bellatrix after she tried to curse Ginny, shouting "NOT MY DAUGHTER, YOU —!"', 4],
  [7, 'hard', 'Which Weasley twin dies in the Battle of Hogwarts?', 'George', 'Fred', 'Both survive', 'Neither — they weren\'t there', 'B', 'Fred Weasley was killed during the Battle of Hogwarts by an explosion. He died laughing at Percy\'s joke.', 5],
  [7, 'hard', 'What does Harry use the Resurrection Stone for?', 'To bring back Dumbledore', 'To bring back his parents, Sirius, and Lupin as he walks to his death', 'To defeat Voldemort', 'To destroy a Horcrux', 'B', 'Harry used the Stone to summon the spirits of his parents, Sirius, and Lupin, who walked with him as he went to face Voldemort.', 6],
  [7, 'hard', 'Where was the diadem of Ravenclaw hidden?', 'In the Chamber of Secrets', 'In the Room of Requirement', 'In Ravenclaw Tower', 'In the Forbidden Forest', 'B', 'Tom Riddle hid Ravenclaw\'s diadem in the Room of Requirement when he came to Hogwarts to apply for a teaching position.', 7],
  [7, 'hard', 'What destroyed the Ravenclaw diadem Horcrux?', 'The Sword of Gryffindor', 'Basilisk venom', 'Fiendfyre', 'Avada Kedavra', 'C', 'Crabbe accidentally cast Fiendfyre in the Room of Requirement, which destroyed the diadem. Fiendfyre is one of the substances that can destroy Horcruxes.', 8],
  [7, 'hard', 'What does Snape\'s Patronus reveal about him?', 'He is a Death Eater', 'He loved Lily — his Patronus is a doe, matching hers', 'He is related to Voldemort', 'He was the Half-Blood Prince', 'B', 'Snape\'s Patronus was a silver doe, the same as Lily Potter\'s. When Dumbledore asked "After all this time?" Snape replied "Always."', 9],
  [7, 'hard', 'What happens to the Elder Wand after Voldemort\'s defeat?', 'Harry keeps it', 'Harry snaps it and throws it away', 'It is buried with Dumbledore', 'Harry gives it to the Ministry', 'B', 'In the book, Harry uses it to repair his own broken wand, then returns it to Dumbledore\'s tomb. In the film, he snaps it and throws it away.', 10],

  // ===== EXPERT QUESTIONS =====
  // These are extremely difficult — obscure details, minor characters, specific numbers, easily confused facts.

  // ===== BOOK 1: Philosopher's Stone — Expert (10) =====
  [1, 'expert', 'What day of the week does the story begin on?', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'B', 'The book opens with "Mr and Mrs Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal" on a Tuesday.', 1],
  [1, 'expert', 'What is the name of the newsreader who reports on the unusual owl activity?', 'Jim McGuffin', 'Ted', 'Vernon Dursley', 'Dedalus Diggle', 'A', 'Jim McGuffin is the newsreader on the evening news who reports on the unusual behaviour of owls during the day.', 2],
  [1, 'expert', 'How many presents did Dudley count on his birthday before getting upset?', '36', '37', '38', '39', 'A', 'Dudley counted 36 presents and was furious because he had 37 the year before. His parents promised to buy him two more while out.', 3],
  [1, 'expert', 'What does Dedalus Diggle do when he meets Harry in a shop?', 'Shakes his hand', 'Bows to him', 'Gives him a present', 'Winks at him', 'B', 'Dedalus Diggle bowed to Harry in a shop once. Mr Dursley thought the little man in a violet top hat was very strange.', 4],
  [1, 'expert', 'What flavour birthday cake does Hagrid bring Harry?', 'Vanilla with pink icing', 'Chocolate with green icing', 'Chocolate with pink icing', 'Vanilla with green icing', 'C', 'Hagrid brought a sticky chocolate birthday cake with "Happee Birthdae Harry" written on it in green icing.', 5],
  [1, 'expert', 'What does the inscription on the Mirror of Erised say when read backwards?', 'I show not your face but your heart\'s desire', 'I show your deepest dreams', 'I reveal what you truly want', 'I show the future you desire', 'A', 'The inscription "Erised stra ehru oyt ube cafru oyt on wohsi" reads backwards as "I show not your face but your heart\'s desire."', 6],
  [1, 'expert', 'What is the name of the pub where Hagrid wins the dragon egg?', 'The Three Broomsticks', 'The Leaky Cauldron', 'The Hog\'s Head', 'The Broomsticks Inn', 'C', 'Hagrid won the dragon egg from a hooded stranger at the Hog\'s Head pub in Hogsmeade, who was actually Quirrell in disguise.', 7],
  [1, 'expert', 'What is Neville\'s toad called?', 'Trevor', 'Neville', 'Gordon', 'Dennis', 'A', 'Neville\'s toad is called Trevor, and he is constantly losing him. Trevor tries to escape at every opportunity.', 8],
  [1, 'expert', 'According to Dumbledore, what are the twelve uses of dragon\'s blood attributed to him?', 'He discovered all twelve', 'He discovered ten of twelve', 'The card only says twelve uses', 'He perfected them with Flamel', 'C', 'Dumbledore\'s Chocolate Frog card states he is "particularly famous for his discovery of the twelve uses of dragon\'s blood."', 9],
  [1, 'expert', 'What does Hermione say is the logic puzzle\'s potion bottle that lets you move forward through the black flames?', 'The largest bottle', 'The smallest bottle', 'The round bottle', 'The second from the left', 'B', 'Hermione solves Snape\'s logic puzzle and identifies the smallest bottle as the one that will let the drinker pass through the black fire ahead.', 10],

  // ===== BOOK 2: Chamber of Secrets — Expert (10) =====
  [2, 'expert', 'What colour is the Ford Anglia?', 'Red', 'Blue', 'Turquoise', 'Green', 'C', 'Arthur Weasley\'s enchanted Ford Anglia is turquoise. It later goes wild in the Forbidden Forest after crashing into the Whomping Willow.', 1],
  [2, 'expert', 'What is Gilderoy Lockhart\'s favourite colour?', 'Blue', 'Lilac', 'Gold', 'Scarlet', 'B', 'Lockhart\'s favourite colour is lilac, as mentioned in one of his books. He frequently wears lilac robes.', 2],
  [2, 'expert', 'What does Mrs Weasley use to clean Harry\'s face when they first meet?', 'A spell', 'A cloth', 'A spit-dampened handkerchief', 'Water from her wand', 'C', 'Mrs Weasley uses a crumpled handkerchief to clean soot off Harry\'s face after he arrives via Floo powder, much like a typical mum.', 3],
  [2, 'expert', 'How many Valentine\'s Day cards did Lockhart say he received?', '46', '36', '56', '26', 'A', 'Lockhart boasted about receiving 46 Valentine\'s cards and decorated the Great Hall with pink flowers and heart-shaped confetti.', 4],
  [2, 'expert', 'What punishment does Filch give Harry that reveals Filch is a Squib?', 'Lines with a quill', 'Polishing trophies', 'Harry sees a Kwikspell letter on his desk', 'Cleaning the dungeon', 'C', 'While in Filch\'s office for punishment, Harry sees a Kwikspell course envelope — a correspondence course for Squibs (non-magical people born to wizarding families).', 5],
  [2, 'expert', 'What is the name of Aragog\'s wife?', 'Mosag', 'Shelob', 'Arachne', 'Ungoliant', 'A', 'Aragog\'s wife is Mosag. Hagrid found her for Aragog so they could have a family — they produced a massive colony of Acromantulas.', 6],
  [2, 'expert', 'What is the last thing Tom Riddle writes in the air with Harry\'s wand?', 'His name', 'TOM MARVOLO RIDDLE then rearranges it to I AM LORD VOLDEMORT', 'A spell', 'The Dark Mark', 'B', 'Tom Riddle writes his full name in the air then rearranges the letters to reveal "I AM LORD VOLDEMORT."', 7],
  [2, 'expert', 'What is the name of the ghost who attends Nearly Headless Nick\'s Deathday Party from the Far East?', 'The Wailing Widow', 'The Headless Hunt', 'Peeves', 'There is no such ghost named', 'A', 'The Wailing Widow came all the way from Kent (not the Far East). The Far East was not specifically referenced for a guest — it was a trick. The Wailing Widow of Kent is mentioned.', 8],
  [2, 'expert', 'What does the Howler from Mrs Weasley say Ron stole?', 'The broomstick', 'The car', 'Money from the vault', 'Fred\'s wand', 'B', 'Mrs Weasley\'s Howler screams about Ron stealing the car, saying his father is facing an inquiry at work and if he puts another toe out of line she\'ll bring him straight home.', 9],
  [2, 'expert', 'How many years has Filch been filing complaints about Peeves?', 'He files about four a year since he started', 'It is never specified exactly', 'Three per year for twenty years', 'One per term', 'A', 'Filch\'s filing cabinet contains hundreds of complaints about Peeves, and he files them regularly — roughly four a year is mentioned.', 10],

  // ===== BOOK 3: Prisoner of Azkaban — Expert (10) =====
  [3, 'expert', 'What is the conductor of the Knight Bus called?', 'Ernie Prang', 'Stan Shunpike', 'Tom', 'Mundungus Fletcher', 'B', 'Stan Shunpike is the conductor. Ernie Prang is the driver. Stan later ended up in Azkaban, wrongly imprisoned as a suspected Death Eater.', 1],
  [3, 'expert', 'What is the name of Hermione\'s cat?', 'Crookshanks', 'Mrs Norris', 'Tibbles', 'Snowball', 'A', 'Crookshanks is a large, ginger, bandy-legged cat who is part Kneazle. He is unusually intelligent and recognised Scabbers as Peter Pettigrew.', 2],
  [3, 'expert', 'How long had Scabbers been with the Weasley family before Ron?', 'Five years', 'Eight years', 'Twelve years', 'Three years', 'C', 'Scabbers (Peter Pettigrew) lived as a rat for twelve years — first with Percy, then with Ron — hiding from Voldemort\'s followers.', 3],
  [3, 'expert', 'What does the Boggart turn into when faced by Professor Lupin?', 'A full moon', 'A silvery-white orb', 'A crystal ball with mist', 'A werewolf', 'B', 'Lupin\'s Boggart becomes a silvery-white orb representing the full moon, since the full moon triggers his painful werewolf transformation.', 4],
  [3, 'expert', 'What finger did Peter Pettigrew cut off to fake his own death?', 'His index finger', 'His thumb', 'His middle finger', 'His ring finger', 'A', 'Pettigrew cut off his index finger (the biggest bit they found of him was his finger) before transforming into a rat and escaping into the sewer.', 5],
  [3, 'expert', 'Who is the driver of the Knight Bus?', 'Stan Shunpike', 'Ernie Prang', 'Ern', 'Angus', 'B', 'Ernie Prang is the elderly driver of the Knight Bus. Stan Shunpike calls him "Ern" for short.', 6],
  [3, 'expert', 'What sweet does Professor Lupin offer Harry on the Hogwarts Express?', 'A Chocolate Frog', 'Bertie Bott\'s Beans', 'A piece of chocolate', 'Drooble\'s Best Blowing Gum', 'C', 'Lupin gives Harry a large piece of chocolate after the Dementor attack on the train. Chocolate is the best remedy for a Dementor encounter.', 7],
  [3, 'expert', 'What is the street address of the Dursleys?', 'Number 4, Privet Drive', 'Number 7, Privet Drive', 'Number 4, Magnolia Crescent', 'Number 12, Privet Drive', 'A', 'The Dursleys live at number 4, Privet Drive, Little Whinging, Surrey. This has been Harry\'s home since he was left on the doorstep as a baby.', 8],
  [3, 'expert', 'How much does a ride on the Knight Bus cost for hot chocolate?', 'Eleven Sickles', 'Fourteen Sickles', 'Thirteen Sickles', 'Nine Sickles', 'C', 'The Knight Bus costs eleven Sickles for a basic ride, but thirteen Sickles if you want hot chocolate, and fifteen for a hot water bottle and toothbrush.', 9],
  [3, 'expert', 'What alias does Sirius use when writing to Harry?', 'Padfoot', 'Snuffles', 'Moony', 'A concerned friend', 'B', 'Sirius signs his letters as "Snuffles" so that if the letters are intercepted, no one will know who wrote them.', 10],

  // ===== BOOK 4: Goblet of Fire — Expert (10) =====
  [4, 'expert', 'What is the name of the campsite manager at the Quidditch World Cup?', 'Mr Roberts', 'Mr Payne', 'Mr Weasley', 'Mr Bagman', 'A', 'Mr Roberts is the Muggle who manages the campsite. He keeps getting suspicious about the wizards and has to be Memory Charmed repeatedly.', 1],
  [4, 'expert', 'Who catches the Snitch in the Quidditch World Cup final?', 'The Irish Seeker', 'Viktor Krum', 'Both seekers at once', 'Neither — the game was called', 'B', 'Krum caught the Snitch but Ireland still won because they were 160 points ahead. The final score was Ireland 170, Bulgaria 160.', 2],
  [4, 'expert', 'What is the incantation to conjure the Dark Mark?', 'Morsmordre', 'Avada Kedavra', 'Serpensortia', 'Sectumsempra', 'A', 'Morsmordre is the spell that conjures the Dark Mark in the sky. Barty Crouch Jr.\'s house-elf Winky was found with the wand that cast it.', 3],
  [4, 'expert', 'What is the name of Barty Crouch\'s house-elf?', 'Dobby', 'Kreacher', 'Winky', 'Hokey', 'C', 'Winky was fiercely loyal to Barty Crouch Sr. She was devastated when he dismissed her after she was found holding the wand that cast the Dark Mark.', 4],
  [4, 'expert', 'What does Harry see emerge from Voldemort\'s wand during Priori Incantatem?', 'Only his parents', 'Cedric, an old man, Bertha Jorkins, and his parents', 'Just Cedric Diggory', 'Dumbledore and Snape', 'B', 'The echoes that emerged in reverse order were: Cedric Diggory, Frank Bryce (the old Muggle), Bertha Jorkins, Lily Potter, and James Potter.', 5],
  [4, 'expert', 'What maze creature asks Harry a riddle during the third task?', 'A centaur', 'A sphinx', 'A troll', 'A Blast-Ended Skrewt', 'B', 'A sphinx blocks Harry\'s path and asks him a riddle. The answer is "spider." If he got it wrong, she would attack him.', 6],
  [4, 'expert', 'What is the name of the village where the Riddle family lived?', 'Godric\'s Hollow', 'Little Hangleton', 'Ottery St Catchpole', 'Tinworth', 'B', 'The Riddle family lived in a large house on a hill overlooking the village of Little Hangleton. This is also where the graveyard is.', 7],
  [4, 'expert', 'How old must champions be to enter the Triwizard Tournament?', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'C', 'An Age Line was drawn around the Goblet of Fire so that only students aged seventeen or over could enter. Fred and George tried an Ageing Potion.', 8],
  [4, 'expert', 'What are Blast-Ended Skrewts a cross between?', 'Manticores and fire crabs', 'Dragons and scorpions', 'Acromantulas and salamanders', 'Hippogriffs and nifflers', 'A', 'Blast-Ended Skrewts are a cross between Manticores and fire crabs. Hagrid bred them illegally. They blast fire from their ends and have stingers.', 9],
  [4, 'expert', 'What does Moody\'s magical eye allow him to see?', 'The future', 'Through walls, invisibility cloaks, and the back of his own head', 'Only dark magic', 'People\'s thoughts', 'B', 'Mad-Eye Moody\'s magical eye can see through almost anything — walls, Invisibility Cloaks, the back of his own head, and even through solid wood.', 10],

  // ===== BOOK 5: Order of the Phoenix — Expert (10) =====
  [5, 'expert', 'What is the address of the Order of the Phoenix headquarters?', 'Number 11, Grimmauld Place', 'Number 12, Grimmauld Place', 'Number 13, Grimmauld Place', 'Number 10, Grimmauld Place', 'B', 'Number 12, Grimmauld Place, London, is the ancestral home of the Black family and is hidden by a Fidelius Charm.', 1],
  [5, 'expert', 'What is the name of Neville\'s plant that squirts Stinksap?', 'Mimbulus mimbletonia', 'Mandrake', 'Venomous Tentacula', 'Fanged Geranium', 'A', 'Mimbulus mimbletonia is a rare Assyrian plant that squirts Stinksap as a defence mechanism. Neville received it as a birthday gift from his great uncle Algie.', 2],
  [5, 'expert', 'What is Mrs Figg\'s role in the Order?', 'She is a witch who guards Harry', 'She is a Squib placed by Dumbledore to watch over Harry', 'She is a Muggle spy', 'She has no role', 'B', 'Arabella Figg is a Squib whom Dumbledore placed in Little Whinging to keep an eye on Harry while he lived with the Dursleys.', 3],
  [5, 'expert', 'How many O.W.L.s does Percy Weasley get?', 'Ten', 'Twelve', 'Seven', 'Nine', 'B', 'Percy Weasley received twelve O.W.L.s, the maximum possible, making him a top student and eventual Ministry employee.', 4],
  [5, 'expert', 'What is the number of the courtroom where Harry\'s hearing takes place?', 'Courtroom Seven', 'Courtroom Ten', 'Courtroom Three', 'Courtroom Twelve', 'B', 'Harry\'s disciplinary hearing was held in Courtroom Ten, which is the same courtroom used for Death Eater trials, deep in the Department of Mysteries level.', 5],
  [5, 'expert', 'What form does Tonks\'s Patronus take?', 'A wolf', 'A jack rabbit', 'It changes — later it becomes a wolf', 'A cat', 'B', 'In this book, Tonks\'s Patronus is a jack rabbit. It later changes to a wolf when she falls in love with Remus Lupin.', 6],
  [5, 'expert', 'Who is the founder of the original Order of the Phoenix besides Dumbledore?', 'There is no other founder', 'Dumbledore is the sole founder', 'Alastor Moody co-founded it', 'The original Order had no single founder', 'B', 'Dumbledore is the sole founder of the Order of the Phoenix, created during the first war against Voldemort.', 7],
  [5, 'expert', 'What is the maximum score on an O.W.L. exam?', 'Outstanding', 'Outstanding with distinction', 'Outstanding Plus', 'There is no maximum — just Outstanding', 'A', 'O.W.L. passing grades are Outstanding (O), Exceeds Expectations (E), and Acceptable (A). Failing grades are Poor (P), Dreadful (D), and Troll (T).', 8],
  [5, 'expert', 'What is the room number where the prophecy is stored?', 'Row 97', 'Row 94', 'Row 95', 'Row 93', 'A', 'The prophecy about Harry and Voldemort is stored in Row 97 of the Hall of Prophecy in the Department of Mysteries.', 9],
  [5, 'expert', 'What does the inscription on the prophecy record say?', 'S.P.T. to A.P.W.B.D. — Dark Lord and (?) Harry Potter', 'Harry Potter and the Dark Lord', 'The Chosen One prophecy', 'Trelawney\'s First Prophecy', 'A', 'The label reads "S.P.T. to A.P.W.B.D. — Dark Lord and (?) Harry Potter" — meaning Sybill Patricia Trelawney to Albus Percival Wulfric Brian Dumbledore.', 10],

  // ===== BOOK 6: Half-Blood Prince — Expert (10) =====
  [6, 'expert', 'What is the name of the village where the Gaunt family lived?', 'Godric\'s Hollow', 'Little Hangleton', 'Great Hangleton', 'Ottery St Catchpole', 'B', 'The Gaunt family lived in a shack on the outskirts of Little Hangleton, the same village where the Riddle family\'s grand house stood.', 1],
  [6, 'expert', 'What is the name of the house-elf who shows Dumbledore a memory about Hufflepuff\'s cup?', 'Dobby', 'Winky', 'Kreacher', 'Hokey', 'D', 'Hokey was the house-elf of Hepzibah Smith. She showed Tom Riddle Hufflepuff\'s cup and Slytherin\'s locket, which he then stole after murdering Hepzibah.', 2],
  [6, 'expert', 'What was Tom Riddle\'s mother\'s love potion ingredient?', 'Amortentia', 'A love potion is implied but never specified', 'Felix Felicis', 'A philtre she made herself', 'B', 'It is strongly implied that Merope Gaunt used a love potion (possibly Amortentia) on Tom Riddle Sr., but the exact potion is never confirmed.', 3],
  [6, 'expert', 'What does Dumbledore say his scar looks like above his left knee?', 'A map of the London Underground', 'A perfect map of the London Underground', 'The constellation Orion', 'A lightning bolt', 'B', 'When McGonagall questions Dumbledore\'s scars, he mentions having a scar above his left knee that is a perfect map of the London Underground.', 4],
  [6, 'expert', 'What is the name of Hepzibah Smith\'s prized possession that was a Hogwarts founder\'s artefact?', 'Gryffindor\'s sword', 'Hufflepuff\'s cup', 'Ravenclaw\'s diadem', 'Slytherin\'s ring', 'B', 'Hepzibah Smith proudly showed Tom Riddle two treasures: Slytherin\'s locket and Hufflepuff\'s cup. Riddle murdered her and stole both.', 5],
  [6, 'expert', 'What is the name of the orphanage where Tom Riddle grew up?', 'St Mary\'s', 'Wool\'s Orphanage', 'London Orphanage', 'St Brutus\'s', 'B', 'Tom Riddle grew up in Wool\'s Orphanage in London. Dumbledore visited him there to invite him to Hogwarts.', 6],
  [6, 'expert', 'What does Mundungus Fletcher steal from Grimmauld Place?', 'The Black family silver', 'Slytherin\'s locket', 'Both the family silver and the locket', 'Sirius\'s wand', 'C', 'Mundungus stole various items from 12 Grimmauld Place after Sirius died, including the real Slytherin locket Horcrux and the family silver.', 7],
  [6, 'expert', 'What potion does Slughorn say was his finest brew when teaching at Hogwarts?', 'Felix Felicis', 'Amortentia', 'Draught of Living Death', 'Wolfsbane Potion', 'A', 'Slughorn describes his finest brewing achievement and shows Felix Felicis (Liquid Luck) as a sample to his class, offering it as a prize.', 8],
  [6, 'expert', 'What is the name of Ogden from the Ministry who visits the Gaunt house?', 'Bob Ogden', 'Bill Ogden', 'Barnabas Ogden', 'Bertie Ogden', 'A', 'Bob Ogden was from the Department of Magical Law Enforcement. He visited the Gaunt shack because Morfin had attacked Tom Riddle Sr. with magic.', 9],
  [6, 'expert', 'What ingredient does Slughorn say is key to the Draught of Living Death that Harry improves?', 'Sopophorous bean — crush it, don\'t cut it', 'Valerian roots', 'Wormwood', 'Asphodel', 'A', 'The Half-Blood Prince\'s textbook advised crushing the Sopophorous bean with the flat side of a silver dagger rather than cutting it, which releases more juice.', 10],

  // ===== BOOK 7: Deathly Hallows — Expert (10) =====
  [7, 'expert', 'What is the name of the goblin who helps Harry break into Gringotts?', 'Griphook', 'Bogrod', 'Ragnok', 'Gornuk', 'A', 'Griphook agreed to help Harry break into the Lestrange vault in exchange for the Sword of Gryffindor, which he considered goblin-made property.', 1],
  [7, 'expert', 'What is the name of the Muggle Studies teacher killed by Voldemort?', 'Charity Burbage', 'Alecto Carrow', 'Aurora Sinistra', 'Bathsheda Babbling', 'A', 'Charity Burbage was murdered by Voldemort at Malfoy Manor in front of the Death Eaters. She had written in favour of Muggle-borns.', 2],
  [7, 'expert', 'What is the name of the dragon in Gringotts?', 'It is never named — it is a Ukrainian Ironbelly', 'Norberta', 'Gringott', 'Albion', 'A', 'The dragon guarding the high-security vaults is an old, blind, pale Ukrainian Ironbelly that has been underground for years. It is never given a name.', 3],
  [7, 'expert', 'What is the Taboo curse placed on Voldemort\'s name?', 'It burns the speaker', 'Saying "Voldemort" breaks protective enchantments and alerts Snatchers', 'It causes the speaker to forget', 'It summons Voldemort himself', 'B', 'The Taboo meant that anyone who spoke Voldemort\'s name aloud would have their protective enchantments broken and Snatchers would be alerted to their location.', 4],
  [7, 'expert', 'What does Dumbledore\'s will say about the Sword of Gryffindor?', 'It goes to Harry', 'It goes to Neville', 'The Ministry claims it is not Dumbledore\'s to give', 'It goes to McGonagall', 'C', 'Dumbledore bequeathed the Sword of Gryffindor to Harry, but the Ministry argued it was not Dumbledore\'s personal possession to give away.', 5],
  [7, 'expert', 'What are the names of the Snatchers who capture Harry?', 'Greyback, Scabior, and others', 'Crabbe and Goyle', 'Yaxley and Rowle', 'Dolohov and Thorfinn', 'A', 'The Snatchers led by Fenrir Greyback and Scabior capture Harry, Ron, and Hermione after Harry says "Voldemort," triggering the Taboo.', 6],
  [7, 'expert', 'What does the sign on Xenophilius Lovegood\'s door say?', 'Welcome', 'The Deathly Hallows symbol', 'Do not disturb the Dirigible Plums', 'The Quibbler — Editor in Chief', 'C', 'Luna\'s home has a sign and the garden has Dirigible Plums. Xenophilius is eccentric and the editor of The Quibbler.', 7],
  [7, 'expert', 'What is the name of the wandmaker Voldemort visits to learn about the Elder Wand?', 'Ollivander', 'Gregorovitch', 'Both — he kidnaps Ollivander and tracks down Gregorovitch', 'Jimmy Kiddell', 'C', 'Voldemort kidnaps Ollivander first to learn about the twin cores, then tracks down Gregorovitch because the Elder Wand was stolen from him by Grindelwald.', 8],
  [7, 'expert', 'Who cast the Fidelius Charm making Bill Weasley the Secret-Keeper for Shell Cottage?', 'Bill himself', 'Arthur Weasley', 'Bill — the homeowner is typically the Secret-Keeper', 'Fleur Delacour', 'C', 'Bill Weasley is the Secret-Keeper for Shell Cottage, where Harry, Luna, Dean, and the others go after escaping Malfoy Manor.', 9],
  [7, 'expert', 'What are the last words Snape says before he dies?', '"Always"', '"Look at me" — so he can see Lily\'s eyes one last time', '"Tell Dumbledore"', '"Protect Harry"', 'B', '"Look at me," Snape asks Harry, wanting to see Lily\'s green eyes one last time as he dies. "Always" is his response about his Patronus in a memory.', 10],
];

// Insert all questions
const insertMany = sqlite.transaction((data: Q[]) => {
  for (const q of data) {
    insertQuestion.run(...q);
  }
});

insertMany(questions);

sqlite.pragma('foreign_keys = ON');

console.log(`✅ Seeded ${booksData.length} books`);
console.log(`✅ Seeded 5 game settings`);
console.log(`✅ Seeded ${questions.length} questions`);
console.log('🎉 Database seeding complete!');

sqlite.close();
