import { S as escape_html, T as get, c as unsubscribe_stores, i as ensure_array_like, o as store_get, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/index-server2.js";
import { n as locale, t as _ } from "../../../../chunks/locale.js";
import { t as Confetti } from "../../../../chunks/Confetti.js";
//#region src/lib/animalQuizData.js
var ANIMALS = [
	{
		emoji: "🐶",
		en: "Dog",
		it: "Cane",
		ro: "Câine"
	},
	{
		emoji: "🐱",
		en: "Cat",
		it: "Gatto",
		ro: "Pisică"
	},
	{
		emoji: "🐰",
		en: "Rabbit",
		it: "Coniglio",
		ro: "Iepure"
	},
	{
		emoji: "🐻",
		en: "Bear",
		it: "Orso",
		ro: "Urs"
	},
	{
		emoji: "🐸",
		en: "Frog",
		it: "Rana",
		ro: "Broască"
	},
	{
		emoji: "🐵",
		en: "Monkey",
		it: "Scimmia",
		ro: "Maimuță"
	},
	{
		emoji: "🦊",
		en: "Fox",
		it: "Volpe",
		ro: "Vulpe"
	},
	{
		emoji: "🐯",
		en: "Tiger",
		it: "Tigre",
		ro: "Tigru"
	},
	{
		emoji: "🐭",
		en: "Mouse",
		it: "Topo",
		ro: "Șoarece"
	},
	{
		emoji: "🐼",
		en: "Panda",
		it: "Panda",
		ro: "Panda"
	},
	{
		emoji: "🐨",
		en: "Koala",
		it: "Koala",
		ro: "Koala"
	},
	{
		emoji: "🦁",
		en: "Lion",
		it: "Leone",
		ro: "Leu"
	},
	{
		emoji: "🐮",
		en: "Cow",
		it: "Mucca",
		ro: "Vacă"
	},
	{
		emoji: "🐷",
		en: "Pig",
		it: "Maiale",
		ro: "Porc"
	},
	{
		emoji: "🐙",
		en: "Octopus",
		it: "Polpo",
		ro: "Caracatiță"
	},
	{
		emoji: "🦋",
		en: "Butterfly",
		it: "Farfalla",
		ro: "Fluture"
	},
	{
		emoji: "🐝",
		en: "Bee",
		it: "Ape",
		ro: "Albina"
	},
	{
		emoji: "🐧",
		en: "Penguin",
		it: "Pinguino",
		ro: "Pinguin"
	},
	{
		emoji: "🦉",
		en: "Owl",
		it: "Gufo",
		ro: "Bufniță"
	},
	{
		emoji: "🐘",
		en: "Elephant",
		it: "Elefante",
		ro: "Elefant"
	}
];
//#endregion
//#region src/routes/games/animal-quiz/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let round = 0;
		let currentAnimal = null;
		let options = [];
		let showConfetti = false;
		let shakeId = null;
		let done = false;
		function lang() {
			return get(locale);
		}
		function shuffle(arr) {
			const a = [...arr];
			for (let i = a.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[a[i], a[j]] = [a[j], a[i]];
			}
			return a;
		}
		function nextRound() {
			if (round >= ANIMALS.length) {
				done = true;
				if (store_get($$store_subs ??= {}, "$locale", locale).startsWith("it")) {}
				return;
			}
			const animal = ANIMALS[round];
			currentAnimal = animal;
			const shuffled = shuffle(ANIMALS.filter((a) => a.emoji !== animal.emoji));
			const wrong = [{
				name: shuffled[0][lang()] || shuffled[0].en,
				correct: false
			}, {
				name: shuffled[1][lang()] || shuffled[1].en,
				correct: false
			}];
			options = shuffle([{
				name: animal[lang()] || animal.en,
				correct: true
			}, ...wrong]);
			shakeId = null;
			showConfetti = false;
		}
		nextRound();
		$$renderer.push(`<div class="quiz svelte-18zrxpt"><h2 class="quiz-title svelte-18zrxpt">🐾 ${escape_html(store_get($$store_subs ??= {}, "$_", _)("animalQuiz"))}</h2> `);
		if (!done) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="quiz-progress svelte-18zrxpt">${escape_html(1)} / ${escape_html(ANIMALS.length)}</p> `);
			if (currentAnimal) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="animal-display svelte-18zrxpt"><span class="big-emoji svelte-18zrxpt">${escape_html(currentAnimal.emoji)}</span></div> <div class="options svelte-18zrxpt"><!--[-->`);
				const each_array = ensure_array_like(options);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let opt = each_array[$$index];
					$$renderer.push(`<button${attr_class("opt-btn svelte-18zrxpt", void 0, { "shake": shakeId === opt.name })}>${escape_html(opt.name)}</button>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="done-screen svelte-18zrxpt"><p class="done-text svelte-18zrxpt">🎉 ${escape_html(store_get($$store_subs ??= {}, "$_", _)("allDone"))}</p> <button class="replay-btn svelte-18zrxpt">${escape_html(store_get($$store_subs ??= {}, "$_", _)("playAgain"))}</button></div>`);
		}
		$$renderer.push(`<!--]--> `);
		if (showConfetti) {
			$$renderer.push("<!--[0-->");
			Confetti($$renderer, {});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
