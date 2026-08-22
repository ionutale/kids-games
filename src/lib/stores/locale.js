import { writable, derived } from 'svelte/store';

const STORAGE_KEY = 'kids-games-locale';

const translations = {
  en: {
    title: 'Kids Games', paint: 'Paint', stickers: 'Stickers', memory: 'Memory',
    puzzle: 'Puzzle', pop: 'Pop', soccer: 'Soccer', sorting: 'Sorting', splash: 'Splash',
    level: 'Level', score: 'Score', time: 'Time',
    greatJob: 'Great job!', levelComplete: 'Level {n} complete!',
    nextLevel: 'Next Level', replay: 'Replay', playAgain: 'Play Again',
    newPuzzle: 'New Puzzle', again: 'Again!', greatGame: 'Great game!',
    goals: 'Goals', tapToKick: 'Tap where you want to kick!',
    tapItem: 'Tap an item to start', tapBasket: 'Now tap a basket!',
    tapItemThenBasket: 'Tap an item, then a basket',
    allSorted: 'All sorted!', puzzleDone: 'Puzzle done!',
    age: 'Age', sound: 'Sound', done: 'Done', back: 'Back to games',
    settings: 'Settings', install: 'Install Kids Games', installBtn: 'Install',
    towerDefense: 'Tower Defense', startWave: 'Start Wave', nextWave: 'Next Wave',
    waveInProgress: 'Wave in progress...', upgrade: 'Upgrade', sell: 'Sell',
    youWin: 'You Win!', gameOver: 'Game Over!', tryAgain: 'Try Again',
    animalQuiz: 'Animal Quiz', allDone: 'All done!', correct: 'Correct!',
  },
  it: {
    title: 'Giochi Bambini', paint: 'Disegna', stickers: 'Adesivi', memory: 'Memoria',
    puzzle: 'Puzzle', pop: 'Scoppia', soccer: 'Calcio', sorting: 'Ordina', splash: 'Schizzi',
    level: 'Livello', score: 'Punti', time: 'Tempo',
    greatJob: 'Grandioso!', levelComplete: 'Livello {n} completato!',
    nextLevel: 'Prossimo', replay: 'Riprova', playAgain: 'Gioca ancora',
    newPuzzle: 'Nuovo puzzle', again: 'Ancora!', greatGame: 'Bella partita!',
    goals: 'Goal', tapToKick: 'Tocca dove vuoi tirare!',
    tapItem: 'Tocca un oggetto', tapBasket: 'Ora tocca un cestino!',
    tapItemThenBasket: 'Tocca un oggetto, poi un cestino',
    allSorted: 'Tutto ordinato!', puzzleDone: 'Puzzle finito!',
    age: 'Età', sound: 'Suono', done: 'Fatto', back: 'Torna ai giochi',
    settings: 'Impostazioni', install: 'Installa Giochi', installBtn: 'Installa',
    towerDefense: 'Torre Difesa', startWave: 'Inizia Onda', nextWave: 'Prossima Onda',
    waveInProgress: 'Onda in corso...', upgrade: 'Migliora', sell: 'Vendi',
    youWin: 'Hai Vinto!', gameOver: 'Game Over!', tryAgain: 'Riprova',
    animalQuiz: 'Quiz Animali', allDone: 'Tutto fatto!', correct: 'Giusto!',
  },
  ro: {
    title: 'Jocuri Copii', paint: 'Desenează', stickers: 'Abțibilduri', memory: 'Memorie',
    puzzle: 'Puzzle', pop: 'Pocneste', soccer: 'Fotbal', sorting: 'Sortează', splash: 'Stropi',
    level: 'Nivel', score: 'Scor', time: 'Timp',
    greatJob: 'Foarte bine!', levelComplete: 'Nivelul {n} complet!',
    nextLevel: 'Următorul', replay: 'Refă', playAgain: 'Joacă din nou',
    newPuzzle: 'Puzzle nou', again: 'Din nou!', greatGame: 'Joc grozav!',
    goals: 'Goluri', tapToKick: 'Atinge unde vrei să lovești!',
    tapItem: 'Atinge un obiect', tapBasket: 'Acum atinge un coș!',
    tapItemThenBasket: 'Atinge un obiect, apoi un coș',
    allSorted: 'Toate sortate!', puzzleDone: 'Puzzle terminat!',
    age: 'Vârstă', sound: 'Sunet', done: 'Gata', back: 'Înapoi la jocuri',
    settings: 'Setări', install: 'Instalează Jocuri', installBtn: 'Instalează',
    towerDefense: 'Apărare Turn', startWave: 'Începe Valul', nextWave: 'Următorul Val',
    waveInProgress: 'Val în desfășurare...', upgrade: 'Îmbunătățește', sell: 'Vinde',
    youWin: 'Ai Câștigat!', gameOver: 'Game Over!', tryAgain: 'Încearcă din nou',
    animalQuiz: 'Test Animale', allDone: 'Gata!', correct: 'Corect!',
  },
  de: {
    title: 'Kinderspiele', paint: 'Malen', stickers: 'Sticker', memory: 'Memory',
    puzzle: 'Puzzle', pop: 'Platzen', soccer: 'Fußball', sorting: 'Sortieren', splash: 'Splash',
    level: 'Level', score: 'Punkte', time: 'Zeit',
    greatJob: 'Super gemacht!', levelComplete: 'Level {n} geschafft!',
    nextLevel: 'Nächstes Level', replay: 'Nochmal', playAgain: 'Nochmal spielen',
    newPuzzle: 'Neues Puzzle', again: 'Nochmal!', greatGame: 'Tolles Spiel!',
    goals: 'Tore', tapToKick: 'Tippe, wo du hinschießen möchtest!',
    tapItem: 'Tippe auf ein Bild', tapBasket: 'Jetzt einen Korb tippen!',
    tapItemThenBasket: 'Tippe ein Bild, dann einen Korb',
    allSorted: 'Alles sortiert!', puzzleDone: 'Puzzle fertig!',
    age: 'Alter', sound: 'Ton', done: 'Fertig', back: 'Zurück zu den Spielen',
    settings: 'Einstellungen', install: 'Kinderspiele installieren', installBtn: 'Installieren',
    towerDefense: 'Turmverteidigung', startWave: 'Welle starten', nextWave: 'Nächste Welle',
    waveInProgress: 'Welle läuft...', upgrade: 'Aufrüsten', sell: 'Verkaufen',
    youWin: 'Du hast gewonnen!', gameOver: 'Spiel vorbei!', tryAgain: 'Versuch es nochmal',
    animalQuiz: 'Tier-Quiz', allDone: 'Alles fertig!', correct: 'Richtig!',
  },
  fr: {
    title: "Jeux d'enfants", paint: 'Dessiner', stickers: 'Stickers', memory: 'Mémoire',
    puzzle: 'Puzzle', pop: 'Pop', soccer: 'Football', sorting: 'Trier', splash: 'Splash',
    level: 'Niveau', score: 'Score', time: 'Temps',
    greatJob: 'Bravo !', levelComplete: 'Niveau {n} terminé !',
    nextLevel: 'Niveau suivant', replay: 'Rejouer', playAgain: 'Recommencer',
    newPuzzle: 'Nouveau puzzle', again: 'Encore !', greatGame: 'Super partie !',
    goals: 'Buts', tapToKick: "Touche où tu veux tirer !",
    tapItem: 'Touche un objet', tapBasket: 'Puis touche un panier !',
    tapItemThenBasket: 'Touche un objet, puis un panier',
    allSorted: 'Tout trié !', puzzleDone: 'Puzzle terminé !',
    age: 'Âge', sound: 'Son', done: 'OK', back: 'Retour aux jeux',
    settings: 'Réglages', install: "Installer Jeux d'enfants", installBtn: 'Installer',
    towerDefense: 'Défense de tour', startWave: 'Lancer la vague', nextWave: 'Vague suivante',
    waveInProgress: 'Vague en cours...', upgrade: 'Améliorer', sell: 'Vendre',
    youWin: 'Tu as gagné !', gameOver: 'Partie terminée !', tryAgain: 'Réessaie',
    animalQuiz: 'Quiz des animaux', allDone: 'Tout est fini !', correct: 'Correct !',
  },
  zh: {
    title: '儿童游戏', paint: '绘画', stickers: '贴纸', memory: '记忆',
    puzzle: '拼图', pop: '泡泡', soccer: '足球', sorting: '分类', splash: '泼水',
    level: '级别', score: '分数', time: '时间',
    greatJob: '太棒了！', levelComplete: '第 {n} 关完成！',
    nextLevel: '下一关', replay: '再玩一次', playAgain: '再来一局',
    newPuzzle: '新拼图', again: '再来！', greatGame: '好样的！',
    goals: '进球', tapToKick: '点你想踢的地方！',
    tapItem: '点击一个物品', tapBasket: '然后点击一个篮子！',
    tapItemThenBasket: '先点物品，再点篮子',
    allSorted: '全部分好了！', puzzleDone: '拼图完成！',
    age: '年龄', sound: '声音', done: '完成', back: '返回游戏',
    settings: '设置', install: '安装儿童游戏', installBtn: '安装',
    towerDefense: '塔防', startWave: '开始一波', nextWave: '下一波',
    waveInProgress: '一波进行中...', upgrade: '升级', sell: '出售',
    youWin: '你赢了！', gameOver: '游戏结束！', tryAgain: '再试一次',
    animalQuiz: '动物问答', allDone: '全部完成！', correct: '正确！',
  }
};

const defaultLocale = 'en';

function detectLocale() {
  if (typeof navigator === 'undefined') return defaultLocale;
  const lang = navigator.language?.slice(0, 2);
  if (['it', 'ro', 'de', 'fr', 'zh'].includes(lang)) return lang;
  return defaultLocale;
}

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
const initial = stored || detectLocale();

export const locale = writable(initial);

function setLang(lang) {
  if (translations[lang]) {
    locale.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }
}
locale.setLang = setLang;

export const _ = derived(locale, ($locale) => {
  const dict = translations[$locale] || translations.en;
  return (key, params = {}) => {
    let text = dict[key] || translations.en[key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
    return text;
  };
});
