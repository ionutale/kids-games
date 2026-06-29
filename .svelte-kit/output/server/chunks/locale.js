import { E as writable, w as derived } from "./server.js";
import "./index-server2.js";
//#region src/lib/stores/locale.js
var STORAGE_KEY = "kids-games-locale";
var translations = {
	en: {
		title: "Kids Games",
		paint: "Paint",
		stickers: "Stickers",
		memory: "Memory",
		puzzle: "Puzzle",
		pop: "Pop",
		soccer: "Soccer",
		sorting: "Sorting",
		splash: "Splash",
		level: "Level",
		score: "Score",
		time: "Time",
		greatJob: "Great job!",
		levelComplete: "Level {n} complete!",
		nextLevel: "Next Level",
		replay: "Replay",
		playAgain: "Play Again",
		newPuzzle: "New Puzzle",
		again: "Again!",
		greatGame: "Great game!",
		goals: "Goals",
		tapToKick: "Tap where you want to kick!",
		tapItem: "Tap an item to start",
		tapBasket: "Now tap a basket!",
		tapItemThenBasket: "Tap an item, then a basket",
		allSorted: "All sorted!",
		puzzleDone: "Puzzle done!",
		age: "Age",
		sound: "Sound",
		done: "Done",
		back: "Back to games",
		settings: "Settings",
		install: "Install Kids Games",
		installBtn: "Install"
	},
	it: {
		title: "Giochi Bambini",
		paint: "Disegna",
		stickers: "Adesivi",
		memory: "Memoria",
		puzzle: "Puzzle",
		pop: "Scoppia",
		soccer: "Calcio",
		sorting: "Ordina",
		splash: "Schizzi",
		level: "Livello",
		score: "Punti",
		time: "Tempo",
		greatJob: "Grandioso!",
		levelComplete: "Livello {n} completato!",
		nextLevel: "Prossimo",
		replay: "Riprova",
		playAgain: "Gioca ancora",
		newPuzzle: "Nuovo puzzle",
		again: "Ancora!",
		greatGame: "Bella partita!",
		goals: "Goal",
		tapToKick: "Tocca dove vuoi tirare!",
		tapItem: "Tocca un oggetto",
		tapBasket: "Ora tocca un cestino!",
		tapItemThenBasket: "Tocca un oggetto, poi un cestino",
		allSorted: "Tutto ordinato!",
		puzzleDone: "Puzzle finito!",
		age: "Età",
		sound: "Suono",
		done: "Fatto",
		back: "Torna ai giochi",
		settings: "Impostazioni",
		install: "Installa Giochi",
		installBtn: "Installa"
	},
	ro: {
		title: "Jocuri Copii",
		paint: "Desenează",
		stickers: "Abțibilduri",
		memory: "Memorie",
		puzzle: "Puzzle",
		pop: "Pocneste",
		soccer: "Fotbal",
		sorting: "Sortează",
		splash: "Stropi",
		level: "Nivel",
		score: "Scor",
		time: "Timp",
		greatJob: "Foarte bine!",
		levelComplete: "Nivelul {n} complet!",
		nextLevel: "Următorul",
		replay: "Refă",
		playAgain: "Joacă din nou",
		newPuzzle: "Puzzle nou",
		again: "Din nou!",
		greatGame: "Joc grozav!",
		goals: "Goluri",
		tapToKick: "Atinge unde vrei să lovești!",
		tapItem: "Atinge un obiect",
		tapBasket: "Acum atinge un coș!",
		tapItemThenBasket: "Atinge un obiect, apoi un coș",
		allSorted: "Toate sortate!",
		puzzleDone: "Puzzle terminat!",
		age: "Vârstă",
		sound: "Sunet",
		done: "Gata",
		back: "Înapoi la jocuri",
		settings: "Setări",
		install: "Instalează Jocuri",
		installBtn: "Instalează"
	}
};
var defaultLocale = "en";
function detectLocale() {
	if (typeof navigator === "undefined") return defaultLocale;
	const lang = navigator.language?.slice(0, 2);
	if (lang === "it" || lang === "ro") return lang;
	return defaultLocale;
}
function createLocale() {
	const { subscribe, set, update } = writable((typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null) || detectLocale());
	return {
		subscribe,
		setLang: (lang) => {
			if (translations[lang]) {
				set(lang);
				if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, lang);
			}
		},
		t: derived({ subscribe }, ($lang) => {
			const dict = translations[$lang] || translations.en;
			return (key, params = {}) => {
				let text = dict[key] || translations.en[key] || key;
				for (const [k, v] of Object.entries(params)) text = text.replace(`{${k}}`, v);
				return text;
			};
		})
	};
}
var locale = createLocale();
var _ = locale.t;
//#endregion
export { locale as n, _ as t };
