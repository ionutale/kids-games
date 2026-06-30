import "../../chunks/index-server.js";
import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, o as store_get, r as derived } from "../../chunks/server.js";
import "../../chunks/settings.js";
import { n as locale, t as _ } from "../../chunks/locale.js";
import "../../chunks/SoundToggle.js";
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const games = [
			{
				id: "paint",
				icon: "🎨",
				key: "paint"
			},
			{
				id: "stickers",
				icon: "🌟",
				key: "stickers"
			},
			{
				id: "memory",
				icon: "🧠",
				key: "memory"
			},
			{
				id: "puzzle",
				icon: "🧩",
				key: "puzzle"
			},
			{
				id: "pop",
				icon: "🫧",
				key: "pop"
			},
			{
				id: "soccer",
				icon: "⚽",
				key: "soccer"
			},
			{
				id: "sorting",
				icon: "📦",
				key: "sorting"
			},
			{
				id: "splash",
				icon: "🌈",
				key: "splash"
			},
			{
				id: "tower-defense",
				icon: "🛡️",
				key: "towerDefense"
			},
			{
				id: "animal-quiz",
				icon: "🐾",
				key: "animalQuiz"
			}
		];
		derived(() => store_get($$store_subs ??= {}, "$locale", locale));
		let { setLang } = locale;
		$$renderer.push(`<div class="hub svelte-1uha8ag"><h1 class="title svelte-1uha8ag">🎮 ${escape_html(store_get($$store_subs ??= {}, "$_", _)("title"))}</h1> <div class="grid svelte-1uha8ag"><!--[-->`);
		const each_array = ensure_array_like(games);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let game = each_array[$$index];
			$$renderer.push(`<button class="game-btn svelte-1uha8ag"><span class="icon svelte-1uha8ag">${escape_html(game.icon)}</span> <span class="label svelte-1uha8ag">${escape_html(store_get($$store_subs ??= {}, "$_", _)(game.key))}</span></button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<button class="settings-trigger svelte-1uha8ag" aria-label="Settings">⚙️</button>`);
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
