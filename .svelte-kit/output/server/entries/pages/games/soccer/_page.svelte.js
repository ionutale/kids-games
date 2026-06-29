import { S as escape_html, c as unsubscribe_stores, n as attr_style, s as stringify } from "../../../../chunks/server.js";
import "../../../../chunks/settings.js";
import "../../../../chunks/Confetti.js";
//#region src/routes/games/soccer/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let ballX = 20;
		let ballY = 50;
		let score = 0;
		$$renderer.push(`<div class="soccer-game svelte-etwtpk" role="application"><div class="field svelte-etwtpk"><div class="goal-area svelte-etwtpk"></div> <div class="ball svelte-etwtpk"${attr_style("", {
			left: `${stringify(ballX)}%`,
			top: `${stringify(ballY)}%`
		})}>⚽</div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="score-display svelte-etwtpk">Score: ${escape_html(score)}</div>`);
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
