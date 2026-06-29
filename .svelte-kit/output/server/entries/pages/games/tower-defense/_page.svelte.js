import { n as onDestroy } from "../../../../chunks/index-server.js";
import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, o as store_get, r as derived, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/settings.js";
import { t as _ } from "../../../../chunks/locale.js";
//#region src/lib/tower-defense/maps.js
var MAPS = [
	{
		id: 1,
		name: "Simple S",
		grid: 6,
		startCoins: 100,
		lives: 10,
		layout: [
			[
				"spawn",
				"path",
				null,
				null,
				null,
				null
			],
			[
				null,
				"path",
				null,
				null,
				null,
				null
			],
			[
				null,
				"path",
				"path",
				"path",
				null,
				null
			],
			[
				null,
				null,
				null,
				"path",
				null,
				null
			],
			[
				null,
				null,
				null,
				"path",
				null,
				null
			],
			[
				null,
				null,
				null,
				"end",
				null,
				null
			]
		]
	},
	{
		id: 2,
		name: "L-Turn",
		grid: 7,
		startCoins: 120,
		lives: 10,
		layout: [
			[
				"spawn",
				"path",
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				"path",
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				"path",
				"path",
				"path",
				"path",
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				"end",
				null
			]
		]
	},
	{
		id: 3,
		name: "Zigzag",
		grid: 8,
		startCoins: 140,
		lives: 10,
		layout: [
			[
				"spawn",
				"path",
				null,
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				"path",
				null,
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				"path",
				"path",
				"path",
				null,
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				"path",
				null,
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				"path",
				"path",
				"path",
				null,
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				"path",
				null,
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				"path",
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				"end",
				null
			]
		]
	},
	{
		id: 4,
		name: "Double Back",
		grid: 9,
		startCoins: 160,
		lives: 10,
		layout: [
			[
				"spawn",
				"path",
				"path",
				"path",
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				"path",
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				"path",
				"path",
				"path",
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				"path",
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				"path",
				"path",
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				"end",
				null
			]
		]
	},
	{
		id: 5,
		name: "Maze",
		grid: 10,
		startCoins: 180,
		lives: 10,
		layout: [
			[
				"spawn",
				"path",
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				"path",
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				"path",
				"path",
				"path",
				null,
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				"path",
				null,
				null,
				null,
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				"path",
				"path",
				"path",
				"path",
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				"path",
				null,
				null,
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				"path",
				"path",
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				"path",
				null
			],
			[
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				"end",
				null
			]
		]
	}
];
//#endregion
//#region src/routes/games/tower-defense/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let selectedLevel = 1;
		let unlockedLevel = 1;
		derived(() => MAPS[selectedLevel - 1]?.grid || 6);
		onDestroy(() => {});
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="td-menu svelte-1wd0abr"><h2 class="td-title svelte-1wd0abr">🛡️ ${escape_html(store_get($$store_subs ??= {}, "$_", _)("towerDefense"))}</h2> <div class="level-grid svelte-1wd0abr"><!--[-->`);
			const each_array = ensure_array_like(MAPS);
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let map = each_array[i];
				$$renderer.push(`<button${attr_class("td-level-btn svelte-1wd0abr", void 0, { "locked": i + 1 > unlockedLevel })}><span class="level-num svelte-1wd0abr">${escape_html(map.id)}</span> <span class="level-name svelte-1wd0abr">${escape_html(map.name)}</span> `);
				if (i + 1 > unlockedLevel) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="lock-icon svelte-1wd0abr">🔒</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></button>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
