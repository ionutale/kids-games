# Quiz Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalize Animal Quiz into a shared quiz engine and add six new picture-naming quizzes (Food, Vehicles, Colors & Shapes, Clothes, Toys, Instruments) with six-locale names.

**Architecture:** One data module (`src/lib/quiz/topics.js`) holds all topics; one pure module (`src/lib/quiz/round.js`) builds options; one Svelte engine (`QuizGame.svelte`) renders the round; every quiz route is a thin wrapper around the engine. Existing Animal Quiz is refactored onto the engine with identical UX.

**Tech Stack:** SvelteKit (Svelte 5 runes), Vitest (unit + behavioral), Playwright (e2e), pnpm.

**Spec:** `docs/superpowers/specs/2026-09-20-quiz-collection-design.md`

## Global Constraints

- Package manager: `pnpm` only. Unit tests: `pnpm test`. E2E: `pnpm exec playwright test`. Lint/type check: `pnpm check`.
- No code comments unless they explain non-obvious intent (repo convention).
- Item shape is exactly `{ emoji, en, it, ro, de, fr, zh }`; every locale string non-empty.
- Locales are exactly `['en', 'it', 'ro', 'de', 'fr', 'zh']`.
- Do not change existing Animal Quiz behavior: same fixed item order, 3 options, silent red shake on wrong, green pop + confetti + 1.5 s advance on correct, All-done overlay with Play Again.
- Commit after every task (the user has asked for commits + a final push).

---

### Task 1: Quiz topics data module + integrity tests

**Files:**
- Create: `src/lib/quiz/topics.js`
- Delete: `src/lib/animalQuizData.js`
- Create: `tests/unit/quiz-topics.test.js`
- Modify: `tests/unit/animal-quiz.test.js:2`
- Modify: `tests/behavioral/animal-quiz.test.js:2`
- Modify: `tests/e2e/animal-quiz.test.js:2`
- Modify: `src/routes/games/animal-quiz/+page.svelte:7` (import line only)

**Interfaces:**
- Consumes: nothing.
- Produces: `LOCALES: string[]`, `TOPICS: Record<string, { id, titleKey, icon, accent, items: Item[] }>`, `itemsFor(topicId: string): Item[]` — used by Tasks 2–6.

- [ ] **Step 1: Write the failing integrity test**

Create `tests/unit/quiz-topics.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { LOCALES, TOPICS, itemsFor } from '$lib/quiz/topics.js';

describe('quiz topic data', () => {
  it('exposes the seven topics with metadata', () => {
    expect(Object.keys(TOPICS).sort()).toEqual(
      ['animals', 'clothes', 'colorshapes', 'food', 'instruments', 'toys', 'vehicles'].sort()
    );
    for (const topic of Object.values(TOPICS)) {
      expect(topic.id).toBeTruthy();
      expect(topic.titleKey).toBeTruthy();
      expect(topic.icon).toBeTruthy();
      expect(topic.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('every topic has at least 12 items', () => {
    for (const topic of Object.values(TOPICS)) {
      expect(topic.items.length, topic.id).toBeGreaterThanOrEqual(12);
    }
  });

  it('emojis are unique within a topic', () => {
    for (const topic of Object.values(TOPICS)) {
      const emojis = topic.items.map((i) => i.emoji);
      expect(new Set(emojis).size, topic.id).toBe(emojis.length);
    }
  });

  it('every item has a non-empty name in every locale', () => {
    for (const topic of Object.values(TOPICS)) {
      for (const item of topic.items) {
        for (const loc of LOCALES) {
          expect(item[loc], `${topic.id} ${item.emoji} missing ${loc}`).toBeTruthy();
        }
      }
    }
  });

  it('names are unique within each topic and locale', () => {
    for (const topic of Object.values(TOPICS)) {
      for (const loc of LOCALES) {
        const names = topic.items.map((i) => i[loc]);
        expect(new Set(names).size, `${topic.id} ${loc}`).toBe(names.length);
      }
    }
  });

  it('itemsFor returns the topic items and [] for unknown topics', () => {
    expect(itemsFor('animals')).toBe(TOPICS.animals.items);
    expect(itemsFor('nope')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test tests/unit/quiz-topics.test.js`
Expected: FAIL — cannot resolve `$lib/quiz/topics.js`.

- [ ] **Step 3: Create the data module**

Create `src/lib/quiz/topics.js` (animals block is the exact existing list from `src/lib/animalQuizData.js`):

```js
export const LOCALES = ['en', 'it', 'ro', 'de', 'fr', 'zh'];

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
  { emoji: '🐊', en: 'Crocodile', it: 'Coccodrillo', ro: 'Crocodil', de: 'Krokodil', fr: 'Crocodile', zh: '鳄鱼' }
];

const FOOD = [
  { emoji: '🍎', en: 'Apple', it: 'Mela', ro: 'Măr', de: 'Apfel', fr: 'Pomme', zh: '苹果' },
  { emoji: '🍌', en: 'Banana', it: 'Banana', ro: 'Banană', de: 'Banane', fr: 'Banane', zh: '香蕉' },
  { emoji: '🍇', en: 'Grapes', it: 'Uva', ro: 'Struguri', de: 'Trauben', fr: 'Raisin', zh: '葡萄' },
  { emoji: '🍓', en: 'Strawberry', it: 'Fragola', ro: 'Căpșună', de: 'Erdbeere', fr: 'Fraise', zh: '草莓' },
  { emoji: '🍊', en: 'Orange', it: 'Arancia', ro: 'Portocală', de: 'Orange', fr: 'Orange', zh: '橙子' },
  { emoji: '🍉', en: 'Watermelon', it: 'Anguria', ro: 'Pepene', de: 'Wassermelone', fr: 'Pastèque', zh: '西瓜' },
  { emoji: '🍍', en: 'Pineapple', it: 'Ananas', ro: 'Ananas', de: 'Ananas', fr: 'Ananas', zh: '菠萝' },
  { emoji: '🍒', en: 'Cherries', it: 'Ciliegie', ro: 'Cireșe', de: 'Kirschen', fr: 'Cerises', zh: '樱桃' },
  { emoji: '🍑', en: 'Peach', it: 'Pesca', ro: 'Piersică', de: 'Pfirsich', fr: 'Pêche', zh: '桃子' },
  { emoji: '🥕', en: 'Carrot', it: 'Carota', ro: 'Morcov', de: 'Karotte', fr: 'Carotte', zh: '胡萝卜' },
  { emoji: '🌽', en: 'Corn', it: 'Mais', ro: 'Porumb', de: 'Mais', fr: 'Maïs', zh: '玉米' },
  { emoji: '🥦', en: 'Broccoli', it: 'Broccolo', ro: 'Broccoli', de: 'Brokkoli', fr: 'Brocoli', zh: '西兰花' },
  { emoji: '🍞', en: 'Bread', it: 'Pane', ro: 'Pâine', de: 'Brot', fr: 'Pain', zh: '面包' },
  { emoji: '🧀', en: 'Cheese', it: 'Formaggio', ro: 'Brânză', de: 'Käse', fr: 'Fromage', zh: '奶酪' },
  { emoji: '🥚', en: 'Egg', it: 'Uovo', ro: 'Ou', de: 'Ei', fr: 'Œuf', zh: '鸡蛋' },
  { emoji: '🍕', en: 'Pizza', it: 'Pizza', ro: 'Pizza', de: 'Pizza', fr: 'Pizza', zh: '披萨' },
  { emoji: '🍦', en: 'Ice cream', it: 'Gelato', ro: 'Înghețată', de: 'Eis', fr: 'Glace', zh: '冰淇淋' },
  { emoji: '🍰', en: 'Cake', it: 'Torta', ro: 'Tort', de: 'Kuchen', fr: 'Gâteau', zh: '蛋糕' },
  { emoji: '🍪', en: 'Cookie', it: 'Biscotto', ro: 'Fursec', de: 'Keks', fr: 'Biscuit', zh: '饼干' },
  { emoji: '🍫', en: 'Chocolate', it: 'Cioccolato', ro: 'Ciocolată', de: 'Schokolade', fr: 'Chocolat', zh: '巧克力' }
];

const VEHICLES = [
  { emoji: '🚗', en: 'Car', it: 'Auto', ro: 'Mașină', de: 'Auto', fr: 'Voiture', zh: '汽车' },
  { emoji: '🚌', en: 'Bus', it: 'Autobus', ro: 'Autobuz', de: 'Bus', fr: 'Bus', zh: '公交车' },
  { emoji: '🚒', en: 'Fire truck', it: 'Camion dei pompieri', ro: 'Camion de pompieri', de: 'Feuerwehrauto', fr: 'Camion de pompiers', zh: '消防车' },
  { emoji: '🚓', en: 'Police car', it: 'Auto della polizia', ro: 'Mașină de poliție', de: 'Polizeiauto', fr: 'Voiture de police', zh: '警车' },
  { emoji: '🚑', en: 'Ambulance', it: 'Ambulanza', ro: 'Ambulanță', de: 'Krankenwagen', fr: 'Ambulance', zh: '救护车' },
  { emoji: '🚲', en: 'Bicycle', it: 'Bicicletta', ro: 'Bicicletă', de: 'Fahrrad', fr: 'Vélo', zh: '自行车' },
  { emoji: '🛵', en: 'Scooter', it: 'Scooter', ro: 'Scuter', de: 'Roller', fr: 'Scooter', zh: '踏板车' },
  { emoji: '🏍️', en: 'Motorcycle', it: 'Moto', ro: 'Motocicletă', de: 'Motorrad', fr: 'Moto', zh: '摩托车' },
  { emoji: '🚂', en: 'Train', it: 'Treno', ro: 'Tren', de: 'Zug', fr: 'Train', zh: '火车' },
  { emoji: '✈️', en: 'Airplane', it: 'Aereo', ro: 'Avion', de: 'Flugzeug', fr: 'Avion', zh: '飞机' },
  { emoji: '🚁', en: 'Helicopter', it: 'Elicottero', ro: 'Elicopter', de: 'Hubschrauber', fr: 'Hélicoptère', zh: '直升机' },
  { emoji: '🚀', en: 'Rocket', it: 'Razzo', ro: 'Rachetă', de: 'Rakete', fr: 'Fusée', zh: '火箭' },
  { emoji: '🚢', en: 'Ship', it: 'Nave', ro: 'Navă', de: 'Schiff', fr: 'Bateau', zh: '轮船' },
  { emoji: '⛵', en: 'Sailboat', it: 'Barca a vela', ro: 'Barcă cu pânze', de: 'Segelboot', fr: 'Voilier', zh: '帆船' },
  { emoji: '🚜', en: 'Tractor', it: 'Trattore', ro: 'Tractor', de: 'Traktor', fr: 'Tracteur', zh: '拖拉机' },
  { emoji: '🚤', en: 'Speedboat', it: 'Motoscafo', ro: 'Barcă rapidă', de: 'Schnellboot', fr: 'Bateau rapide', zh: '快艇' }
];

const COLORSHAPES = [
  { emoji: '🔴', en: 'Red', it: 'Rosso', ro: 'Roșu', de: 'Rot', fr: 'Rouge', zh: '红色' },
  { emoji: '🟠', en: 'Orange', it: 'Arancione', ro: 'Portocaliu', de: 'Orange', fr: 'Orange', zh: '橙色' },
  { emoji: '🟡', en: 'Yellow', it: 'Giallo', ro: 'Galben', de: 'Gelb', fr: 'Jaune', zh: '黄色' },
  { emoji: '🟢', en: 'Green', it: 'Verde', ro: 'Verde', de: 'Grün', fr: 'Vert', zh: '绿色' },
  { emoji: '🔵', en: 'Blue', it: 'Blu', ro: 'Albastru', de: 'Blau', fr: 'Bleu', zh: '蓝色' },
  { emoji: '🟣', en: 'Purple', it: 'Viola', ro: 'Violet', de: 'Lila', fr: 'Violet', zh: '紫色' },
  { emoji: '🟤', en: 'Brown', it: 'Marrone', ro: 'Maro', de: 'Braun', fr: 'Marron', zh: '棕色' },
  { emoji: '⚫', en: 'Black', it: 'Nero', ro: 'Negru', de: 'Schwarz', fr: 'Noir', zh: '黑色' },
  { emoji: '⭕', en: 'Circle', it: 'Cerchio', ro: 'Cerc', de: 'Kreis', fr: 'Cercle', zh: '圆形' },
  { emoji: '🔺', en: 'Triangle', it: 'Triangolo', ro: 'Triunghi', de: 'Dreieck', fr: 'Triangle', zh: '三角形' },
  { emoji: '⬛', en: 'Square', it: 'Quadrato', ro: 'Pătrat', de: 'Quadrat', fr: 'Carré', zh: '正方形' },
  { emoji: '🔶', en: 'Diamond', it: 'Rombo', ro: 'Romb', de: 'Raute', fr: 'Losange', zh: '菱形' },
  { emoji: '⭐', en: 'Star', it: 'Stella', ro: 'Stea', de: 'Stern', fr: 'Étoile', zh: '星星' },
  { emoji: '❤️', en: 'Heart', it: 'Cuore', ro: 'Inimă', de: 'Herz', fr: 'Cœur', zh: '爱心' }
];

const CLOTHES = [
  { emoji: '👕', en: 'T-shirt', it: 'Maglietta', ro: 'Tricou', de: 'T-Shirt', fr: 'T-shirt', zh: 'T恤' },
  { emoji: '👖', en: 'Pants', it: 'Pantaloni', ro: 'Pantaloni', de: 'Hose', fr: 'Pantalon', zh: '裤子' },
  { emoji: '👗', en: 'Dress', it: 'Vestito', ro: 'Rochie', de: 'Kleid', fr: 'Robe', zh: '连衣裙' },
  { emoji: '👟', en: 'Sneakers', it: 'Scarpe da ginnastica', ro: 'Adidași', de: 'Turnschuhe', fr: 'Baskets', zh: '运动鞋' },
  { emoji: '🧢', en: 'Cap', it: 'Berretto', ro: 'Șapcă', de: 'Kappe', fr: 'Casquette', zh: '棒球帽' },
  { emoji: '🧥', en: 'Coat', it: 'Cappotto', ro: 'Palton', de: 'Mantel', fr: 'Manteau', zh: '外套' },
  { emoji: '🧦', en: 'Socks', it: 'Calzini', ro: 'Șosete', de: 'Socken', fr: 'Chaussettes', zh: '袜子' },
  { emoji: '🧣', en: 'Scarf', it: 'Sciarpa', ro: 'Fular', de: 'Schal', fr: 'Écharpe', zh: '围巾' },
  { emoji: '🩳', en: 'Shorts', it: 'Pantaloncini', ro: 'Pantaloni scurți', de: 'Shorts', fr: 'Short', zh: '短裤' },
  { emoji: '👞', en: 'Shoe', it: 'Scarpa', ro: 'Pantof', de: 'Schuh', fr: 'Chaussure', zh: '皮鞋' },
  { emoji: '🥾', en: 'Boot', it: 'Stivale', ro: 'Cizmă', de: 'Stiefel', fr: 'Botte', zh: '靴子' },
  { emoji: '🧤', en: 'Gloves', it: 'Guanti', ro: 'Mănuși', de: 'Handschuhe', fr: 'Gants', zh: '手套' },
  { emoji: '👒', en: 'Sun hat', it: 'Cappello da sole', ro: 'Pălărie de soare', de: 'Sonnenhut', fr: 'Chapeau de soleil', zh: '遮阳帽' },
  { emoji: '🎩', en: 'Top hat', it: 'Cilindro', ro: 'Joben', de: 'Zylinder', fr: 'Haut-de-forme', zh: '礼帽' }
];

const TOYS = [
  { emoji: '🧸', en: 'Teddy bear', it: 'Orsetto', ro: 'Ursuleț', de: 'Teddybär', fr: 'Nounours', zh: '泰迪熊' },
  { emoji: '⚽', en: 'Soccer ball', it: 'Pallone', ro: 'Minge de fotbal', de: 'Fußball', fr: 'Ballon de football', zh: '足球' },
  { emoji: '🏀', en: 'Basketball', it: 'Palla da basket', ro: 'Minge de baschet', de: 'Basketball', fr: 'Ballon de basket', zh: '篮球' },
  { emoji: '🎲', en: 'Dice', it: 'Dado', ro: 'Zar', de: 'Würfel', fr: 'Dé', zh: '骰子' },
  { emoji: '🪁', en: 'Kite', it: 'Aquilone', ro: 'Zmeu', de: 'Drachen', fr: 'Cerf-volant', zh: '风筝' },
  { emoji: '🎈', en: 'Balloon', it: 'Palloncino', ro: 'Balon', de: 'Luftballon', fr: 'Ballon de baudruche', zh: '气球' },
  { emoji: '🎁', en: 'Gift', it: 'Regalo', ro: 'Cadou', de: 'Geschenk', fr: 'Cadeau', zh: '礼物' },
  { emoji: '🪀', en: 'Yo-yo', it: 'Yo-yo', ro: 'Yo-yo', de: 'Jo-Jo', fr: 'Yo-yo', zh: '溜溜球' },
  { emoji: '🎯', en: 'Target', it: 'Bersaglio', ro: 'Țintă', de: 'Zielscheibe', fr: 'Cible', zh: '飞镖靶' },
  { emoji: '🎮', en: 'Game controller', it: 'Gamepad', ro: 'Gamepad', de: 'Gamepad', fr: 'Manette', zh: '游戏手柄' },
  { emoji: '🪃', en: 'Boomerang', it: 'Boomerang', ro: 'Bumerang', de: 'Bumerang', fr: 'Boomerang', zh: '回旋镖' },
  { emoji: '🛹', en: 'Skateboard', it: 'Skateboard', ro: 'Skateboard', de: 'Skateboard', fr: 'Skateboard', zh: '滑板' },
  { emoji: '🧩', en: 'Puzzle', it: 'Puzzle', ro: 'Puzzle', de: 'Puzzle', fr: 'Puzzle', zh: '拼图' },
  { emoji: '🪅', en: 'Piñata', it: 'Piñata', ro: 'Piñata', de: 'Piñata', fr: 'Piñata', zh: '皮纳塔' }
];

const INSTRUMENTS = [
  { emoji: '🎸', en: 'Guitar', it: 'Chitarra', ro: 'Chitară', de: 'Gitarre', fr: 'Guitare', zh: '吉他' },
  { emoji: '🥁', en: 'Drum', it: 'Tamburo', ro: 'Tobă', de: 'Trommel', fr: 'Tambour', zh: '鼓' },
  { emoji: '🎹', en: 'Piano', it: 'Pianoforte', ro: 'Pian', de: 'Klavier', fr: 'Piano', zh: '钢琴' },
  { emoji: '🎺', en: 'Trumpet', it: 'Tromba', ro: 'Trompetă', de: 'Trompete', fr: 'Trompette', zh: '小号' },
  { emoji: '🎻', en: 'Violin', it: 'Violino', ro: 'Vioară', de: 'Geige', fr: 'Violon', zh: '小提琴' },
  { emoji: '🎷', en: 'Saxophone', it: 'Sassofono', ro: 'Saxofon', de: 'Saxophon', fr: 'Saxophone', zh: '萨克斯' },
  { emoji: '🪕', en: 'Banjo', it: 'Banjo', ro: 'Banjo', de: 'Banjo', fr: 'Banjo', zh: '班卓琴' },
  { emoji: '🪗', en: 'Accordion', it: 'Fisarmonica', ro: 'Acordeon', de: 'Akkordeon', fr: 'Accordéon', zh: '手风琴' },
  { emoji: '🪘', en: 'Hand drum', it: 'Tamburo a mano', ro: 'Tobă alungită', de: 'Handtrommel', fr: 'Tambour long', zh: '长鼓' },
  { emoji: '🔔', en: 'Bell', it: 'Campana', ro: 'Clopoțel', de: 'Glocke', fr: 'Cloche', zh: '铃铛' },
  { emoji: '🎼', en: 'Sheet music', it: 'Spartito', ro: 'Partitură', de: 'Notenblatt', fr: 'Partition', zh: '乐谱' },
  { emoji: '🎤', en: 'Microphone', it: 'Microfono', ro: 'Microfon', de: 'Mikrofon', fr: 'Microphone', zh: '麦克风' }
];

export const TOPICS = {
  animals: { id: 'animals', titleKey: 'animalQuiz', icon: '🐾', accent: '#FDBA74', items: ANIMALS },
  food: { id: 'food', titleKey: 'foodQuiz', icon: '🍎', accent: '#FCA5A5', items: FOOD },
  vehicles: { id: 'vehicles', titleKey: 'vehicleQuiz', icon: '🚗', accent: '#93C5FD', items: VEHICLES },
  colorshapes: { id: 'colorshapes', titleKey: 'colorShapeQuiz', icon: '🔷', accent: '#C4B5FD', items: COLORSHAPES },
  clothes: { id: 'clothes', titleKey: 'clothesQuiz', icon: '👕', accent: '#F0ABFC', items: CLOTHES },
  toys: { id: 'toys', titleKey: 'toyQuiz', icon: '🧸', accent: '#FDE68A', items: TOYS },
  instruments: { id: 'instruments', titleKey: 'instrumentQuiz', icon: '🎸', accent: '#6EE7B7', items: INSTRUMENTS }
};

export function itemsFor(topicId) {
  return TOPICS[topicId]?.items ?? [];
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test tests/unit/quiz-topics.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Point the existing importers at the new module**

- `tests/unit/animal-quiz.test.js:2` → `import { LOCALES, TOPICS } from '$lib/quiz/topics.js';` and replace every `ANIMALS` usage with `TOPICS.animals.items` (the whole file uses `ANIMALS` in 5 places).
- `tests/behavioral/animal-quiz.test.js:2` → `import { TOPICS } from '$lib/quiz/topics.js';` and `const ANIMALS = TOPICS.animals.items;` after the import.
- `tests/e2e/animal-quiz.test.js:2` → `import { TOPICS } from '../../src/lib/quiz/topics.js';` and add `const ANIMALS = TOPICS.animals.items;`.
- `src/routes/games/animal-quiz/+page.svelte:7` → `import { TOPICS } from '$lib/quiz/topics.js';` and add `const ANIMALS = TOPICS.animals.items;` inside `<script>`.

- [ ] **Step 6: Delete the old module and run everything**

```bash
git rm src/lib/animalQuizData.js
pnpm test
```
Expected: all unit + behavioral tests PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(quiz): shared quiz topics data — animals moved plus food/vehicles/colorshapes/clothes/toys/instruments topics; integrity tests"
```

---

### Task 2: Pure round helpers + behavioral rewrite

**Files:**
- Create: `src/lib/quiz/round.js`
- Create: `tests/unit/quiz-round.test.js`
- Modify: `tests/behavioral/animal-quiz.test.js` (rewrite to use the real helper)

**Interfaces:**
- Consumes: `TOPICS.animals.items` from Task 1.
- Produces: `buildOptions(item: Item, items: Item[], lang: string, rng?: () => number): { name: string, correct: boolean }[]` — used by Tasks 3+.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/quiz-round.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { buildOptions } from '$lib/quiz/round.js';
import { TOPICS } from '$lib/quiz/topics.js';

const items = TOPICS.animals.items;

describe('buildOptions', () => {
  it('returns exactly three options with one correct', () => {
    const opts = buildOptions(items[0], items, 'en');
    expect(opts.length).toBe(3);
    expect(opts.filter((o) => o.correct).length).toBe(1);
  });

  it('the correct option uses the requested locale', () => {
    const item = items[5];
    for (const lang of ['en', 'it', 'ro', 'de', 'fr', 'zh']) {
      const correct = buildOptions(item, items, lang).find((o) => o.correct);
      expect(correct.name).toBe(item[lang]);
    }
  });

  it('wrong options are unique names from other items', () => {
    const item = items[0];
    const opts = buildOptions(item, items, 'en');
    const wrong = opts.filter((o) => !o.correct);
    expect(wrong[0].name).not.toBe(wrong[1].name);
    for (const w of wrong) expect(w.name).not.toBe(item.en);
  });

  it('is deterministic with an injected rng', () => {
    let s1 = 7;
    const rngA = () => ((s1 = (s1 * 9301 + 49297) % 233280) / 233280);
    let s2 = 7;
    const rngB = () => ((s2 = (s2 * 9301 + 49297) % 233280) / 233280);
    expect(buildOptions(items[2], items, 'it', rngA)).toEqual(buildOptions(items[2], items, 'it', rngB));
  });

  it('handles a two-item pool without crashing', () => {
    const pool = [items[0], items[1]];
    const opts = buildOptions(pool[0], pool, 'en');
    expect(opts.length).toBe(3);
    expect(opts.filter((o) => o.name === pool[0].en).length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/quiz-round.test.js`
Expected: FAIL — cannot resolve `$lib/quiz/round.js`.

- [ ] **Step 3: Implement the helper**

Create `src/lib/quiz/round.js`:

```js
export function buildOptions(item, items, lang, rng = Math.random) {
  const pool = items.filter((i) => i.emoji !== item.emoji);
  const picks = [];
  let guard = 0;
  while (picks.length < 2 && pool.length > 0 && guard < 200) {
    guard++;
    const candidate = pool[Math.floor(rng() * pool.length) % pool.length];
    const name = candidate[lang] || candidate.en;
    if (name !== (item[lang] || item.en) && !picks.some((p) => p.name === name)) {
      picks.push({ name, correct: false });
    }
  }
  const correct = { name: item[lang] || item.en, correct: true };
  const options = [correct, ...picks];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1)) % (i + 1);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test tests/unit/quiz-round.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Rewrite the behavioral test to exercise the real helper**

Replace `tests/behavioral/animal-quiz.test.js` entirely:

```js
import { describe, it, expect } from 'vitest';
import { TOPICS } from '$lib/quiz/topics.js';
import { buildOptions } from '$lib/quiz/round.js';

const ANIMALS = TOPICS.animals.items;

describe('Animal Quiz behavior', () => {
  it('generates exactly 3 options', () => {
    expect(buildOptions(ANIMALS[0], ANIMALS, 'en').length).toBe(3);
  });

  it('one option is correct', () => {
    const opts = buildOptions(ANIMALS[0], ANIMALS, 'en');
    expect(opts.filter((o) => o.correct).length).toBe(1);
  });

  it('correct option has the right name', () => {
    const animal = ANIMALS[5];
    const correct = buildOptions(animal, ANIMALS, 'en').find((o) => o.correct);
    expect(correct.name).toBe(animal.en);
  });

  it('wrong options are different from the correct one', () => {
    const animal = ANIMALS[0];
    for (const w of buildOptions(animal, ANIMALS, 'en').filter((o) => !o.correct)) {
      expect(w.name).not.toBe(animal.en);
    }
  });

  it('wrong options are unique', () => {
    const wrong = buildOptions(ANIMALS[0], ANIMALS, 'en').filter((o) => !o.correct);
    expect(wrong[0].name).not.toBe(wrong[1].name);
  });

  it('name matches the current language', () => {
    const animal = ANIMALS[0];
    const correct = buildOptions(animal, ANIMALS, 'it').find((o) => o.correct);
    expect(correct.name).toBe(animal.it);
  });
});
```

- [ ] **Step 6: Run all unit + behavioral tests**

Run: `pnpm test`
Expected: PASS, no failures.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(quiz): pure buildOptions helper — localized 3-option builder; behavioral test now exercises real code"
```

---

### Task 3: QuizGame engine + Animal Quiz refactor

**Files:**
- Create: `src/lib/components/QuizGame.svelte`
- Modify: `src/routes/games/animal-quiz/+page.svelte` (becomes a thin wrapper)

**Interfaces:**
- Consumes: `itemsFor` (Task 1), `buildOptions` (Task 2), `$locale` store, `GameShell`, `WinOverlay`, `BigButton`, `Confetti`, `playTap`/`playMatch`.
- Produces: component prop `topic: string` — used by Tasks 4+.

- [ ] **Step 1: Create the engine component**

Create `src/lib/components/QuizGame.svelte` (ported from the existing animal-quiz page; `data-testid` attributes added for e2e):

```svelte
<script>
  import { get } from 'svelte/store';
  import { _, locale } from '$lib/stores/locale';
  import { playTap, playMatch } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import { TOPICS, itemsFor } from '$lib/quiz/topics.js';
  import { buildOptions } from '$lib/quiz/round.js';

  let { topic = '' } = $props();

  const meta = TOPICS[topic];
  const items = itemsFor(topic);

  let round = $state(0);
  let currentItem = $state(null);
  let options = $state([]);
  let showConfetti = $state(false);
  let shakeName = $state(null);
  let done = $state(false);

  function lang() {
    return get(locale);
  }

  function nextRound() {
    if (round >= items.length) {
      done = true;
      return;
    }
    currentItem = items[round];
    options = buildOptions(currentItem, items, lang());
    shakeName = null;
    showConfetti = false;
  }

  function pick(opt) {
    if (showConfetti || done) return;
    if (opt.correct) {
      showConfetti = true;
      playMatch();
      setTimeout(() => {
        round++;
        nextRound();
      }, 1500);
    } else {
      shakeName = opt.name;
      playTap();
      setTimeout(() => (shakeName = null), 500);
    }
  }

  function restart() {
    round = 0;
    currentItem = null;
    options = [];
    done = false;
    showConfetti = false;
    shakeName = null;
    setTimeout(() => nextRound(), 0);
  }

  nextRound();
</script>

<GameShell accent={meta?.accent ?? '#FDBA74'}>
  <div class="quiz">
    <h2 class="quiz-title">{meta?.icon} {meta ? $_(meta.titleKey) : ''}</h2>

    {#if !done}
      <p class="quiz-progress" data-testid="quiz-progress">{round + 1} / {items.length}</p>

      {#if currentItem}
        <div class="item-display">
          <span class="big-emoji" data-testid="quiz-emoji">{currentItem.emoji}</span>
        </div>

        <div class="options">
          {#each options as opt, i (opt.name)}
            <button
              class="opt-btn"
              class:shake={shakeName === opt.name}
              class:correct={showConfetti && opt.correct}
              onclick={() => pick(opt)}
              data-testid={opt.correct ? 'correct-opt' : `wrong-opt-${i}`}
            >
              {opt.name}
            </button>
          {/each}
        </div>
      {/if}
    {:else}
      <WinOverlay title="🎉 {$_('allDone')}">
        <BigButton variant="primary" class="replay-btn" onclick={restart}>{$_('playAgain')}</BigButton>
      </WinOverlay>
    {/if}

    {#if showConfetti}
      <Confetti />
    {/if}
  </div>
</GameShell>

<style>
  .quiz {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    padding: 24px 16px;
    gap: 16px;
  }
  .quiz-title {
    font-size: 22px;
    color: var(--text-hi);
  }
  .quiz-progress {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-lo);
  }
  .item-display {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 160px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  .big-emoji {
    font-size: 80px;
    line-height: 1;
  }
  .options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 280px;
  }
  .opt-btn {
    width: 100%;
    padding: 16px;
    font-size: 20px;
    font-weight: 700;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    transition: transform 0.1s;
    color: var(--text-hi);
  }
  .opt-btn:active { transform: scale(0.97); }
  .opt-btn.correct {
    background: var(--mint);
    border-color: var(--mint);
    color: #062033;
    transform: scale(1.12);
    box-shadow: 0 0 20px rgba(110, 231, 183, 0.6);
    animation: correctPop 0.25s ease-out;
  }
  @keyframes correctPop {
    0% { transform: scale(1); }
    60% { transform: scale(1.18); }
    100% { transform: scale(1.12); }
  }
  .opt-btn.shake {
    animation: shake 0.4s ease-in-out;
    background: #FFEBEE;
    color: #E57373;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    50% { transform: translateX(10px); }
    75% { transform: translateX(-5px); }
  }
</style>
```

Note: `restart()` inside `$effect` mounts the first round and re-runs when the component re-renders fresh (route reuse). Do not add `data.seed`-style tracking here — there is no seed.

- [ ] **Step 2: Replace the animal-quiz page with a wrapper**

`src/routes/games/animal-quiz/+page.svelte` becomes:

```svelte
<script>
  import QuizGame from '$lib/components/QuizGame.svelte';
</script>

<QuizGame topic="animals" />
```

- [ ] **Step 3: Run the existing Animal Quiz tests (regression net)**

Run: `pnpm test && pnpm exec playwright test tests/e2e/animal-quiz.test.js --reporter=line`
Expected: unit + behavioral PASS; the e2e file PASSES (it asserts data length and option flow using the data module).

- [ ] **Step 4: Run `pnpm check`**

Run: `pnpm check`
Expected: 0 errors (pre-existing warnings only).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(quiz): extract QuizGame engine — animal-quiz becomes a thin wrapper, UX unchanged"
```

---

### Task 4: Six new quiz routes

**Files:**
- Create: `src/routes/games/food-quiz/+page.svelte`
- Create: `src/routes/games/vehicle-quiz/+page.svelte`
- Create: `src/routes/games/color-shape-quiz/+page.svelte`
- Create: `src/routes/games/clothes-quiz/+page.svelte`
- Create: `src/routes/games/toy-quiz/+page.svelte`
- Create: `src/routes/games/instrument-quiz/+page.svelte`

**Interfaces:**
- Consumes: `QuizGame` with prop `topic` (Task 3); topic ids from Task 1.
- Produces: the six URLs used by Task 5 (hub) and Task 6 (e2e).

- [ ] **Step 1: Create the six wrappers**

Each file has exactly this content (topic varies):

```svelte
<script>
  import QuizGame from '$lib/components/QuizGame.svelte';
</script>

<QuizGame topic="food" />
```

Topic mapping: `food-quiz` → `food`, `vehicle-quiz` → `vehicles`, `color-shape-quiz` → `colorshapes`, `clothes-quiz` → `clothes`, `toy-quiz` → `toys`, `instrument-quiz` → `instruments`.

- [ ] **Step 2: Verify with a smoke check**

Run: `pnpm check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(quiz): six new quiz routes — food, vehicles, colors & shapes, clothes, toys, instruments"
```

---

### Task 5: Hub tiles + locale keys

**Files:**
- Modify: `src/routes/+page.svelte:18` (games array — insert after the `animal-quiz` entry)
- Modify: `src/lib/stores/locale.js` (add 6 keys to each of the 6 locale objects, right after each `animalQuiz:` line)

**Interfaces:**
- Consumes: topic routes from Task 4, `titleKey`s from Task 1.
- Produces: hub navigation entries; localized titles used by the engine.

- [ ] **Step 1: Add the hub entries**

In `src/routes/+page.svelte`, after `{ id: 'animal-quiz', icon: '🐾', key: 'animalQuiz', accent: '#FDBA74' },` insert:

```js
    { id: 'food-quiz', icon: '🍎', key: 'foodQuiz', accent: '#FCA5A5' },
    { id: 'vehicle-quiz', icon: '🚗', key: 'vehicleQuiz', accent: '#93C5FD' },
    { id: 'color-shape-quiz', icon: '🔷', key: 'colorShapeQuiz', accent: '#C4B5FD' },
    { id: 'clothes-quiz', icon: '👕', key: 'clothesQuiz', accent: '#F0ABFC' },
    { id: 'toy-quiz', icon: '🧸', key: 'toyQuiz', accent: '#FDE68A' },
    { id: 'instrument-quiz', icon: '🎸', key: 'instrumentQuiz', accent: '#6EE7B7' },
```

- [ ] **Step 2: Add the locale keys**

After each locale's `animalQuiz:` line, insert (exact per locale):

- en: `foodQuiz: 'Food Quiz', vehicleQuiz: 'Vehicle Quiz', colorShapeQuiz: 'Colors & Shapes', clothesQuiz: 'Clothes Quiz', toyQuiz: 'Toys Quiz', instrumentQuiz: 'Instruments Quiz',`
- it: `foodQuiz: 'Quiz Cibo', vehicleQuiz: 'Quiz Veicoli', colorShapeQuiz: 'Colori e Forme', clothesQuiz: 'Quiz Vestiti', toyQuiz: 'Quiz Giochi', instrumentQuiz: 'Quiz Strumenti',`
- ro: `foodQuiz: 'Quiz Mâncare', vehicleQuiz: 'Quiz Vehicule', colorShapeQuiz: 'Culori și Forme', clothesQuiz: 'Quiz Haine', toyQuiz: 'Quiz Jucării', instrumentQuiz: 'Quiz Instrumente',`
- de: `foodQuiz: 'Essens-Quiz', vehicleQuiz: 'Fahrzeug-Quiz', colorShapeQuiz: 'Farben & Formen', clothesQuiz: 'Kleidungs-Quiz', toyQuiz: 'Spielzeug-Quiz', instrumentQuiz: 'Instrumente-Quiz',`
- fr: `foodQuiz: 'Quiz Nourriture', vehicleQuiz: 'Quiz Véhicules', colorShapeQuiz: 'Couleurs et Formes', clothesQuiz: 'Quiz Vêtements', toyQuiz: 'Quiz Jouets', instrumentQuiz: 'Quiz Instruments',`
- zh: `foodQuiz: '食物问答', vehicleQuiz: '交通工具问答', colorShapeQuiz: '颜色和形状', clothesQuiz: '衣服问答', toyQuiz: '玩具问答', instrumentQuiz: '乐器问答',`

- [ ] **Step 3: Check + smoke**

Run: `pnpm check`
Expected: 0 errors. Then verify one title renders: `pnpm exec playwright test tests/e2e/quizzes.test.js` will cover this in Task 6.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(quiz): hub tiles + six-locale titles for the new quizzes"
```

---

### Task 6: E2E coverage for the six quizzes

**Files:**
- Create: `tests/e2e/quizzes.test.js`

**Interfaces:**
- Consumes: the six URLs from Task 4, engine test ids from Task 3 (`quiz-progress`, `quiz-emoji`, `correct-opt`, `wrong-opt-*`).
- Produces: regression coverage; no downstream consumers.

- [ ] **Step 1: Write the test**

Create `tests/e2e/quizzes.test.js`:

```js
import { test, expect } from '@playwright/test';

const QUIZZES = [
  { path: '/games/food-quiz', title: 'Food Quiz' },
  { path: '/games/vehicle-quiz', title: 'Vehicle Quiz' },
  { path: '/games/color-shape-quiz', title: 'Colors & Shapes' },
  { path: '/games/clothes-quiz', title: 'Clothes Quiz' },
  { path: '/games/toy-quiz', title: 'Toys Quiz' },
  { path: '/games/instrument-quiz', title: 'Instruments Quiz' }
];

test.describe('Quiz Collection E2E', () => {
  for (const quiz of QUIZZES) {
    test(`${quiz.path}: card, 3 options, wrong shakes, correct advances`, async ({ page }) => {
      await page.goto(quiz.path);
      await expect(page.locator('.quiz-title')).toContainText(quiz.title);
      await expect(page.getByTestId('quiz-emoji')).toBeVisible();
      await expect(page.locator('.opt-btn')).toHaveCount(3);
      await expect(page.getByTestId('quiz-progress')).toHaveText(/1 \/ \d+/);

      const wrong = page.locator('[data-testid^="wrong-opt-"]').first();
      await wrong.click();
      await expect(wrong).toHaveClass(/shake/);
      await expect(page.getByTestId('quiz-progress')).toHaveText(/1 \/ \d+/);

      await page.waitForTimeout(550);
      await page.getByTestId('correct-opt').click();
      await expect(page.getByTestId('correct-opt')).toHaveClass(/correct/);
      await expect(page.getByTestId('quiz-progress')).toHaveText(/2 \/ \d+/, { timeout: 4000 });
    });
  }
});
```

- [ ] **Step 2: Run the new e2e file**

Run: `pnpm exec playwright test tests/e2e/quizzes.test.js --reporter=line`
Expected: 6 passed.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test(quiz): e2e for the six new quizzes — wrong option shakes, correct advances"
```

---

### Task 7: Docs + full verification

**Files:**
- Modify: `CONTEXT.md` (add a "Quiz Games" section)

- [ ] **Step 1: Add the glossary section**

In `CONTEXT.md`, after the "Category Sort Game" section (or next to the other game glossaries), add:

```markdown
## Quiz Games

- **Topic**: One quiz's content set (`src/lib/quiz/topics.js`) — Animals, Food, Vehicles, Colors & Shapes, Clothes, Toys, Instruments.
- **Item**: A single quiz entry `{ emoji, en, it, ro, de, fr, zh }`; every quiz requires all six locale names.
- **Quiz Round**: One pass through a Topic: big emoji → 3 localized name options → silent red shake on wrong, green pop + confetti on correct, All-done overlay with Play Again.
```

- [ ] **Step 2: Full verification**

```bash
pnpm test
pnpm check
pnpm exec playwright test --reporter=line
```
Expected: all unit + behavioral pass; `pnpm check` 0 errors; all e2e pass (one pre-existing flaky spot-the-difference test may need its retry — that is not a regression).

- [ ] **Step 3: Commit + push everything**

```bash
git add -A
git commit -m "docs(quiz): Quiz Games glossary — Topic, Item, Quiz Round"
git push origin main
```

---

## Self-Review Notes

- Spec coverage: topics/data (T1), engine (T3), routes (T4), hub + i18n (T5), tests unit/behavioral/e2e (T1/T2/T6), docs (T7), out-of-scope respected (no levels/progress).
- Type consistency: `itemsFor`/`TOPICS`/`buildOptions` signatures are identical across tasks; engine prop is `topic`; test ids `quiz-progress`, `quiz-emoji`, `correct-opt`, `wrong-opt-${i}` are defined in T3 and consumed only in T6.
- The `$effect(restart)` in T3 also re-runs if the component is ever re-instantiated; it does not read reactive values, so it runs once per mount.
