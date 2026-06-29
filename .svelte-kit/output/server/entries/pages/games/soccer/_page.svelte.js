import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, o as store_get, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/settings.js";
import { t as _ } from "../../../../chunks/locale.js";
import "../../../../chunks/Confetti.js";
//#region src/routes/games/soccer/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let ballX = 50;
		let ballY = 82;
		let ballMoving = false;
		let score = 0;
		let level = 3;
		function levelTargets(l) {
			return {
				targetScore: Math.min(2 + l, 8),
				goalSize: Math.max(10, 24 - l)
			};
		}
		$$renderer.push(`<div class="soccer-game svelte-etwtpk" role="application"><div class="field svelte-etwtpk"><div class="goal-area svelte-etwtpk"></div> <div class="goal-text svelte-etwtpk">🏆</div> <div${attr_class("ball svelte-etwtpk", void 0, { "kicking": ballMoving })}${attr_style("", {
			left: `${stringify(ballX)}%`,
			top: `${stringify(ballY)}%`
		})}>⚽</div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="score-display svelte-etwtpk">${escape_html(store_get($$store_subs ??= {}, "$_", _)("score"))}: ${escape_html(score)}/${escape_html(levelTargets(level).targetScore)}</div>`);
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="level-bar svelte-etwtpk"><!--[-->`);
		const each_array = ensure_array_like(Array(10));
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			each_array[i];
			$$renderer.push(`<button${attr_class("level-btn svelte-etwtpk", void 0, { "active": level === i + 1 })}>${escape_html(i + 1)}</button>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
