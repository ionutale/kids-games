import "../../../../chunks/index-server.js";
import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, s as stringify } from "../../../../chunks/server.js";
import "../../../../chunks/settings.js";
//#region src/routes/games/pop/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let bubbles = [];
		$$renderer.push(`<div class="pop-game svelte-dhi6h0"><!--[-->`);
		const each_array = ensure_array_like(bubbles);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let b = each_array[$$index];
			$$renderer.push(`<button class="bubble svelte-dhi6h0"${attr_style("", {
				left: `${stringify(b.x)}%`,
				"font-size": `${stringify(b.size)}px`,
				"--speed": `${stringify(b.speed)}s`
			})}>${escape_html(b.emoji)}</button>`);
		}
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
