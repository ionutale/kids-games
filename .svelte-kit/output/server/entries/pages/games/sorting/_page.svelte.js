import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, o as store_get, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/audioManager.js";
import { t as _ } from "../../../../chunks/locale.js";
import { t as Confetti } from "../../../../chunks/Confetti.js";
//#region src/routes/games/sorting/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const categories = {
			colors: {
				items: [
					{
						emoji: "🔴",
						cat: 0
					},
					{
						emoji: "🟡",
						cat: 1
					},
					{
						emoji: "🔵",
						cat: 2
					},
					{
						emoji: "🟢",
						cat: 3
					},
					{
						emoji: "🟣",
						cat: 0
					},
					{
						emoji: "🟠",
						cat: 1
					},
					{
						emoji: "⚪",
						cat: 2
					},
					{
						emoji: "🟤",
						cat: 3
					}
				],
				baskets: [
					"Red",
					"Yellow",
					"Blue",
					"Green"
				]
			},
			shapes: {
				items: [
					{
						emoji: "⬛",
						cat: 0
					},
					{
						emoji: "⭕",
						cat: 1
					},
					{
						emoji: "🔺",
						cat: 2
					},
					{
						emoji: "💎",
						cat: 3
					},
					{
						emoji: "⬜",
						cat: 0
					},
					{
						emoji: "🔵",
						cat: 1
					},
					{
						emoji: "🔻",
						cat: 2
					},
					{
						emoji: "🔶",
						cat: 3
					}
				],
				baskets: [
					"Square",
					"Circle",
					"Triangle",
					"Diamond"
				]
			}
		};
		let currentCat = "colors";
		let items = [];
		let baskets = [];
		let sorted = /* @__PURE__ */ new Set();
		let won = false;
		let wobbleId = null;
		let selected = null;
		let level = 3;
		function levelConfig(l) {
			return {
				numItems: Math.min(2 + l, 8),
				numBaskets: l <= 3 ? 2 : 4
			};
		}
		function initGame() {
			const keys = Object.keys(categories);
			currentCat = keys[Math.floor(Math.random() * keys.length)];
			const cat = categories[currentCat];
			const config = levelConfig(level);
			baskets = cat.baskets.slice(0, config.numBaskets);
			items = [...cat.items].sort(() => Math.random() - .5).slice(0, config.numItems).map((item, i) => ({
				...item,
				id: i
			}));
			sorted = /* @__PURE__ */ new Set();
			won = false;
			selected = null;
		}
		initGame();
		$$renderer.push(`<div class="sorting-game svelte-4wh2ej"><div class="items-row svelte-4wh2ej"><!--[-->`);
		const each_array = ensure_array_like(items);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			if (!sorted.has(item.id)) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button${attr_class("item svelte-4wh2ej", void 0, {
					"selected": selected === item.id,
					"wobble": wobbleId === item.id
				})}>${escape_html(item.emoji)}</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (selected !== null) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="hint svelte-4wh2ej">${escape_html(store_get($$store_subs ??= {}, "$_", _)("tapBasket"))}</p>`);
		} else if (sorted.size > 0 && sorted.size < items.length) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="hint svelte-4wh2ej">${escape_html(store_get($$store_subs ??= {}, "$_", _)("tapItemThenBasket"))}</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="hint svelte-4wh2ej">`);
			if (items.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`${escape_html(store_get($$store_subs ??= {}, "$_", _)("tapItem"))}`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></p>`);
		}
		$$renderer.push(`<!--]--> <div class="baskets-row svelte-4wh2ej"><!--[-->`);
		const each_array_1 = ensure_array_like(baskets);
		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let basket = each_array_1[i];
			$$renderer.push(`<button class="basket svelte-4wh2ej"><span class="basket-label svelte-4wh2ej">${escape_html(basket)}</span> <span class="basket-count svelte-4wh2ej">${escape_html(items.filter((item) => item.cat === i && sorted.has(item.id)).length)}</span></button>`);
		}
		$$renderer.push(`<!--]--></div> <div class="level-bar svelte-4wh2ej"><!--[-->`);
		const each_array_2 = ensure_array_like(Array(10));
		for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
			each_array_2[i];
			$$renderer.push(`<button${attr_class("level-btn svelte-4wh2ej", void 0, { "active": level === i + 1 })}>${escape_html(i + 1)}</button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (won) {
			$$renderer.push("<!--[0-->");
			Confetti($$renderer, {});
			$$renderer.push(`<!----> <div class="win-overlay svelte-4wh2ej"><p class="win-text svelte-4wh2ej">${escape_html(store_get($$store_subs ??= {}, "$_", _)("allSorted"))}</p> <button class="replay-btn svelte-4wh2ej">${escape_html(store_get($$store_subs ??= {}, "$_", _)("again"))}</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
