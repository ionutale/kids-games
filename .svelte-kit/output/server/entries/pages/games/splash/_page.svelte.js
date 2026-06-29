import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, s as stringify } from "../../../../chunks/server.js";
import "../../../../chunks/audioManager.js";
//#region src/routes/games/splash/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let splashes = [];
		$$renderer.push(`<div class="splash-game svelte-1bam220" role="application"><!--[-->`);
		const each_array = ensure_array_like(splashes);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let s = each_array[$$index];
			$$renderer.push(`<span class="splash svelte-1bam220"${attr_style("", {
				left: `${stringify(s.x)}%`,
				top: `${stringify(s.y)}%`,
				"font-size": `${stringify(s.size)}px`,
				"--delay": `${stringify(s.delay)}s`,
				"--color": s.color
			})}>${escape_html(s.emoji)}</span>`);
		}
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
