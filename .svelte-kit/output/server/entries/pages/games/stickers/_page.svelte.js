import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, o as store_get, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import { t as settings } from "../../../../chunks/settings.js";
//#region src/routes/games/stickers/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const scenes = [
			"🌿",
			"🌊",
			"🚀",
			"🦁"
		];
		let scene = "🌿";
		let placed = [];
		let activeStickers = [];
		let dragging = null;
		$$renderer.push(`<div class="stickers-game svelte-beejdd"><div class="scene-select svelte-beejdd"><!--[-->`);
		const each_array = ensure_array_like(scenes);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let s = each_array[$$index];
			$$renderer.push(`<button${attr_class("scene-btn svelte-beejdd", void 0, { "active": scene === s })}>${escape_html(s)}</button>`);
		}
		$$renderer.push(`<!--]--></div> <div class="scene-area svelte-beejdd" style="background: linear-gradient(135deg, #e8f5e9 0%, #fff3e0 100%);"><!--[-->`);
		const each_array_1 = ensure_array_like(placed);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let p = each_array_1[$$index_1];
			$$renderer.push(`<span${attr_class("placed-sticker svelte-beejdd", void 0, { "dragging": dragging === p.id })}${attr_style("", {
				left: `${stringify(p.x)}%`,
				top: `${stringify(p.y)}%`,
				"font-size": store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 2 ? "48px" : "36px"
			})}>${escape_html(p.emoji)}</span>`);
		}
		$$renderer.push(`<!--]--></div> <div class="tray svelte-beejdd"><!--[-->`);
		const each_array_2 = ensure_array_like(activeStickers);
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let sticker = each_array_2[$$index_2];
			$$renderer.push(`<button class="sticker-btn svelte-beejdd">${escape_html(sticker)}</button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (placed.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="clear-btn svelte-beejdd">🗑️</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
