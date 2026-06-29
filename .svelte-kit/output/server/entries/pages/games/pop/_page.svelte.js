import "../../../../chunks/index-server.js";
import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/audioManager.js";
//#region src/routes/games/pop/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let bubbles = [];
		let score = 0;
		let timeLeft = 20;
		let level = 3;
		$$renderer.push(`<div class="pop-game svelte-dhi6h0">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="hud svelte-dhi6h0"><span class="hud-item svelte-dhi6h0">Score: ${escape_html(score)}</span> <span${attr_class("hud-item svelte-dhi6h0", void 0, { "hud-warn": false })}>Time: ${escape_html(timeLeft)}s</span></div> <!--[-->`);
		const each_array = ensure_array_like(bubbles);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let b = each_array[$$index];
			$$renderer.push(`<button class="bubble svelte-dhi6h0"${attr_style("", {
				left: `${stringify(b.x)}%`,
				"font-size": `${stringify(b.size)}px`,
				"--speed": `${stringify(b.speed)}s`
			})}>${escape_html(b.emoji)}</button>`);
		}
		$$renderer.push(`<!--]--> <div class="level-bar svelte-dhi6h0"><!--[-->`);
		const each_array_1 = ensure_array_like(Array(10));
		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			each_array_1[i];
			$$renderer.push(`<button${attr_class("level-btn svelte-dhi6h0", void 0, { "active": level === i + 1 })}>${escape_html(i + 1)}</button>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
