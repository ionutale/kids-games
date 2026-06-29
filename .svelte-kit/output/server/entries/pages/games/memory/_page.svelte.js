import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, o as store_get, r as derived, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/audioManager.js";
import { t as _ } from "../../../../chunks/locale.js";
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
		const STORAGE_KEY = "memory-unlocked-level";
		let cards = [];
		let matched = /* @__PURE__ */ new Set();
		let showcasing = /* @__PURE__ */ new Set();
		let won = false;
		let level = 1;
		let unlockedLevel = 1;
		function loadUnlocked() {
			let stored = 1;
			if (typeof localStorage !== "undefined") stored = parseInt(localStorage.getItem(STORAGE_KEY));
			unlockedLevel = stored >= 1 && stored <= 10 ? stored : 1;
			level = unlockedLevel;
		}
		function pairsFromLevel(l) {
			if (l >= 10) return 12;
			return l + 1;
		}
		function colsFromCount(count) {
			if (count <= 8) return 2;
			return 4;
		}
		function initGame() {
			const pairs = pairsFromLevel(level);
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
		loadUnlocked();
		initGame();
		$$renderer.push(`<div class="memory-game svelte-9c3864"><div class="level-indicator svelte-9c3864"><span class="level-label svelte-9c3864">${escape_html(store_get($$store_subs ??= {}, "$_", _)("level"))} ${escape_html(level)}</span> <div class="level-dots svelte-9c3864"><!--[-->`);
		const each_array = ensure_array_like(Array(10));
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			each_array[i];
			$$renderer.push(`<span${attr_class("level-dot svelte-9c3864", void 0, {
				"current": level === i + 1,
				"unlocked": i + 1 <= unlockedLevel,
				"locked": i + 1 > unlockedLevel
			})}></span>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="grid svelte-9c3864"${attr_style("", { "grid-template-columns": `repeat(${stringify(cols())}, 1fr)` })}><!--[-->`);
		const each_array_1 = ensure_array_like(cards);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let card = each_array_1[$$index_1];
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
		$$renderer.push(`<!--]--></div> `);
		if (won) {
			$$renderer.push("<!--[0-->");
			Confetti($$renderer, {});
			$$renderer.push(`<!----> <div class="win-overlay svelte-9c3864"><p class="win-text svelte-9c3864">${escape_html(store_get($$store_subs ??= {}, "$_", _)("greatJob"))}</p> <p class="win-sub svelte-9c3864">${escape_html(store_get($$store_subs ??= {}, "$_", _)("levelComplete", { n: level }))}</p> `);
			if (level < 10) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="next-btn svelte-9c3864">${escape_html(store_get($$store_subs ??= {}, "$_", _)("nextLevel"))}</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <button class="replay-btn svelte-9c3864">${escape_html(store_get($$store_subs ??= {}, "$_", _)("replay"))}</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
