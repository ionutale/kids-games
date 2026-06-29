import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, t as attr_class, x as attr } from "../../../../chunks/server.js";
import "../../../../chunks/settings.js";
//#region src/routes/games/paint/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let currentColor = "#FF6B6B";
		let currentSize = "big";
		const colors = [
			"#FF6B6B",
			"#4FC3F7",
			"#81C784",
			"#FFD54F",
			"#BA68C8",
			"#FF8A65"
		];
		$$renderer.push(`<div class="paint-game svelte-1mlrtdb"><div class="canvas-wrap svelte-1mlrtdb"><canvas class="draw-canvas svelte-1mlrtdb"></canvas></div> <div class="toolbar svelte-1mlrtdb"><!--[-->`);
		const each_array = ensure_array_like(colors);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let c = each_array[$$index];
			$$renderer.push(`<button${attr_class("color-btn svelte-1mlrtdb", void 0, { "active": currentColor === c })}${attr("aria-label", c)}${attr_style("", { background: c })}></button>`);
		}
		$$renderer.push(`<!--]--></div> <div class="bottom-bar svelte-1mlrtdb"><button class="action-btn svelte-1mlrtdb">${escape_html("⭐")}</button> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like([
				"small",
				"medium",
				"big"
			]);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let s = each_array_1[$$index_1];
				$$renderer.push(`<button${attr_class("size-btn svelte-1mlrtdb", void 0, { "active": currentSize === s })}>${escape_html(s === "small" ? "─" : s === "medium" ? "━" : "━━")}</button>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--> <button class="action-btn svelte-1mlrtdb">🗑️</button></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
