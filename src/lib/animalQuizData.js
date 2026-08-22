// Animal quiz data — names keyed by supported locale codes.
// Add an entry per animal: { emoji, en, it, ro, de, fr, zh }

const ANIMALS = [
  { emoji: '🐶', en: 'Dog', it: 'Cane', ro: 'Câine', de: 'Hund', fr: 'Chien', zh: '狗' },
  { emoji: '🐱', en: 'Cat', it: 'Gatto', ro: 'Pisică', de: 'Katze', fr: 'Chat', zh: '猫' },
  { emoji: '🐰', en: 'Rabbit', it: 'Coniglio', ro: 'Iepure', de: 'Hase', fr: 'Lapin', zh: '兔子' },
  { emoji: '🐻', en: 'Bear', it: 'Orso', ro: 'Urs', de: 'Bär', fr: 'Ours', zh: '熊' },
  { emoji: '🐸', en: 'Frog', it: 'Rana', ro: 'Broască', de: 'Frosch', fr: 'Grenouille', zh: '青蛙' },
  { emoji: '🐵', en: 'Monkey', it: 'Scimmia', ro: 'Maimuță', de: 'Affe', fr: 'Singe', zh: '猴子' },
  { emoji: '🦊', en: 'Fox', it: 'Volpe', ro: 'Vulpe', de: 'Fuchs', fr: 'Renard', zh: '狐狸' },
  { emoji: '🐯', en: 'Tiger', it: 'Tigre', ro: 'Tigru', de: 'Tiger', fr: 'Tigre', zh: '老虎' },
  { emoji: '🐭', en: 'Mouse', it: 'Topo', ro: 'Șoarece', de: 'Maus', fr: 'Souris', zh: '老鼠' },
  { emoji: '🐼', en: 'Panda', it: 'Panda', ro: 'Panda', de: 'Panda', fr: 'Panda', zh: '熊猫' },
  { emoji: '🐨', en: 'Koala', it: 'Koala', ro: 'Koala', de: 'Koala', fr: 'Koala', zh: '考拉' },
  { emoji: '🦁', en: 'Lion', it: 'Leone', ro: 'Leu', de: 'Löwe', fr: 'Lion', zh: '狮子' },
  { emoji: '🐮', en: 'Cow', it: 'Mucca', ro: 'Vacă', de: 'Kuh', fr: 'Vache', zh: '牛' },
  { emoji: '🐷', en: 'Pig', it: 'Maiale', ro: 'Porc', de: 'Schwein', fr: 'Cochon', zh: '猪' },
  { emoji: '🐙', en: 'Octopus', it: 'Polpo', ro: 'Caracatiță', de: 'Krake', fr: 'Pieuvre', zh: '章鱼' },
  { emoji: '🦋', en: 'Butterfly', it: 'Farfalla', ro: 'Fluture', de: 'Schmetterling', fr: 'Papillon', zh: '蝴蝶' },
  { emoji: '🐝', en: 'Bee', it: 'Ape', ro: 'Albina', de: 'Biene', fr: 'Abeille', zh: '蜜蜂' },
  { emoji: '🐧', en: 'Penguin', it: 'Pinguino', ro: 'Pinguin', de: 'Pinguin', fr: 'Manchot', zh: '企鹅' },
  { emoji: '🦉', en: 'Owl', it: 'Gufo', ro: 'Bufniță', de: 'Eule', fr: 'Hibou', zh: '猫头鹰' },
  { emoji: '🐘', en: 'Elephant', it: 'Elefante', ro: 'Elefant', de: 'Elefant', fr: 'Éléphant', zh: '大象' },
  { emoji: '🐴', en: 'Horse', it: 'Cavallo', ro: 'Cal', de: 'Pferd', fr: 'Cheval', zh: '马' },
  { emoji: '🐍', en: 'Snake', it: 'Serpente', ro: 'Șarpe', de: 'Schlange', fr: 'Serpent', zh: '蛇' },
  { emoji: '🦆', en: 'Duck', it: 'Anatra', ro: 'Rață', de: 'Ente', fr: 'Canard', zh: '鸭子' },
  { emoji: '🐺', en: 'Wolf', it: 'Lupo', ro: 'Lup', de: 'Wolf', fr: 'Loup', zh: '狼' },
  { emoji: '🐟', en: 'Fish', it: 'Pesce', ro: 'Pește', de: 'Fisch', fr: 'Poisson', zh: '鱼' },
  { emoji: '🦈', en: 'Shark', it: 'Squalo', ro: 'Rechin', de: 'Hai', fr: 'Requin', zh: '鲨鱼' },
  { emoji: '🐢', en: 'Turtle', it: 'Tartaruga', ro: 'Broască Țestoasă', de: 'Schildkröte', fr: 'Tortue', zh: '乌龟' },
  { emoji: '🦄', en: 'Unicorn', it: 'Unicorno', ro: 'Inorog', de: 'Einhorn', fr: 'Licorne', zh: '独角兽' },
  { emoji: '🐑', en: 'Sheep', it: 'Pecora', ro: 'Oaie', de: 'Schaf', fr: 'Mouton', zh: '羊' },
  { emoji: '🦒', en: 'Giraffe', it: 'Giraffa', ro: 'Girafă', de: 'Giraffe', fr: 'Girafe', zh: '长颈鹿' },
  { emoji: '🦔', en: 'Hedgehog', it: 'Riccio', ro: 'Arici', de: 'Igel', fr: 'Hérisson', zh: '刺猬' },
  { emoji: '🐊', en: 'Crocodile', it: 'Coccodrillo', ro: 'Crocodil', de: 'Krokodil', fr: 'Crocodile', zh: '鳄鱼' },
];

export const LOCALES = ['en', 'it', 'ro', 'de', 'fr', 'zh'];

export default ANIMALS;
