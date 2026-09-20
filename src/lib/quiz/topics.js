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
