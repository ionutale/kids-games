import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, o as store_get, r as derived, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import { t as settings } from "../../../../chunks/settings.js";
import { t as Confetti } from "../../../../chunks/Confetti.js";
//#region src/routes/games/memory/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const emojis = [
			"🐶",
			"🐱",
			"🐰",
			"🐻",
			"🐸",
			"🐵",
			"🦊",
			"🐯",
			"🐭",
			"🐼",
			"🐨",
			"🦁"
		];
		let cards = [];
		let matched = /* @__PURE__ */ new Set();
		let won = false;
		function initGame() {
			const pairs = store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 2 ? 3 : store_get($$store_subs ??= {}, "$settings", settings).ageLevel === 3 ? 4 : store_get($$store_subs ??= {}, "$settings", settings).ageLevel === 4 ? 6 : 8;
			const selected = emojis.slice(0, pairs);
			const deck = [...selected, ...selected].map((emoji, i) => ({
				id: i,
				emoji,
				flipped: false
			}));
			for (let i = deck.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[deck[i], deck[j]] = [deck[j], deck[i]];
			}
			cards = deck;
			matched = /* @__PURE__ */ new Set();
			won = false;
		}
		derived(() => store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 3 ? store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 2 ? 3 : 4 : 4);
		initGame();
		$$renderer.push(`<div class="memory-game svelte-9c3864"><div class="grid svelte-9c3864"${attr_style("", { "grid-template-columns": `repeat(${stringify(store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 2 ? 3 : 4)}, 1fr)` })}><!--[-->`);
		const each_array = ensure_array_like(cards);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let card = each_array[$$index];
			$$renderer.push(`<button${attr_class("card svelte-9c3864", void 0, {
				"flipped": card.flipped || matched.has(card.id),
				"matched": matched.has(card.id)
			})}><span class="card-front svelte-9c3864">${escape_html(card.emoji)}</span> <span class="card-back svelte-9c3864">?</span></button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (won) {
			$$renderer.push("<!--[0-->");
			Confetti($$renderer, {});
			$$renderer.push(`<!----> <div class="win-overlay svelte-9c3864"><p class="win-text svelte-9c3864">Great job!</p> <button class="replay-btn svelte-9c3864">Play Again</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
