import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/audioManager.js";
import "../../../../chunks/Confetti.js";
//#region src/routes/games/soccer/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let ballX = 20;
		let ballY = 50;
		let score = 0;
		let level = 3;
		function levelTargets(l) {
			return {
				goalWidth: Math.min(40 + l * 2, 55),
				targetScore: Math.min(2 + l, 8),
				missChance: Math.max(0, .5 - l * .05)
			};
		}
		$$renderer.push(`<div class="soccer-game svelte-etwtpk" role="application"><div class="field svelte-etwtpk"><div class="goal-area svelte-etwtpk"></div> <div class="ball svelte-etwtpk"${attr_style("", {
			left: `${stringify(ballX)}%`,
			top: `${stringify(ballY)}%`
		})}>⚽</div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="score-display svelte-etwtpk">Score: ${escape_html(score)}/${escape_html(levelTargets(level).targetScore)}</div>`);
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
