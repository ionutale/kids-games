import { a as ensure_array_like, u as escape_html } from "../../chunks/internal.js";
import "../../chunks/SoundToggle.js";
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const games = [
			{
				id: "paint",
				icon: "🎨",
				label: "Paint"
			},
			{
				id: "stickers",
				icon: "🌟",
				label: "Stickers"
			},
			{
				id: "memory",
				icon: "🧠",
				label: "Memory"
			},
			{
				id: "puzzle",
				icon: "🧩",
				label: "Puzzle"
			},
			{
				id: "pop",
				icon: "🫧",
				label: "Pop"
			},
			{
				id: "soccer",
				icon: "⚽",
				label: "Soccer"
			},
			{
				id: "sorting",
				icon: "📦",
				label: "Sorting"
			},
			{
				id: "splash",
				icon: "🌈",
				label: "Splash"
			}
		];
		$$renderer.push(`<div class="hub svelte-1uha8ag"><h1 class="title svelte-1uha8ag">🎮 Kids Games</h1> <div class="grid svelte-1uha8ag"><!--[-->`);
		const each_array = ensure_array_like(games);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let game = each_array[$$index];
			$$renderer.push(`<button class="game-btn svelte-1uha8ag"><span class="icon svelte-1uha8ag">${escape_html(game.icon)}</span> <span class="label svelte-1uha8ag">${escape_html(game.label)}</span></button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<button class="settings-trigger svelte-1uha8ag" aria-label="Settings">⚙️</button>`);
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
