import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, r as derived, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/audioManager.js";
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
		let showcasing = /* @__PURE__ */ new Set();
		let won = false;
		let difficulty = 4;
		function pairsFromLevel(level) {
			if (level >= 10) return 12;
			return level + 1;
		}
		function colsFromCount(count) {
			if (count <= 8) return 2;
			if (count <= 16) return 4;
			return 4;
		}
		function initGame() {
			pairsFromLevel(difficulty) * 2;
			const pairs = pairsFromLevel(difficulty);
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
			showcasing = /* @__PURE__ */ new Set();
			won = false;
		}
		let cols = derived(() => colsFromCount(cards.length));
		initGame();
		$$renderer.push(`<div class="memory-game svelte-9c3864"><div class="grid svelte-9c3864"${attr_style("", { "grid-template-columns": `repeat(${stringify(cols())}, 1fr)` })}><!--[-->`);
		const each_array = ensure_array_like(cards);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let card = each_array[$$index];
			$$renderer.push(`<button${attr_class("card svelte-9c3864", void 0, {
				"flipped": card.flipped || matched.has(card.id) || showcasing.has(card.id),
				"showcasing": showcasing.has(card.id),
				"matched": matched.has(card.id)
			})}><span class="card-front svelte-9c3864">${escape_html(card.emoji)}</span> <span class="card-back svelte-9c3864">?</span> `);
			if (showcasing.has(card.id)) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="sparkle s1 svelte-9c3864">⭐</span> <span class="sparkle s2 svelte-9c3864">✨</span> <span class="sparkle s3 svelte-9c3864">💫</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></button>`);
		}
		$$renderer.push(`<!--]--></div> <div class="diff-bar svelte-9c3864"><span class="diff-label svelte-9c3864">Level</span> <div class="diff-buttons svelte-9c3864"><!--[-->`);
		const each_array_1 = ensure_array_like(Array(10));
		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			each_array_1[i];
			$$renderer.push(`<button${attr_class("diff-btn svelte-9c3864", void 0, { "active": difficulty === i + 1 })}>${escape_html(i + 1)}</button>`);
		}
		$$renderer.push(`<!--]--></div></div> `);
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
