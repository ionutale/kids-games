import { n as onDestroy } from "../../../../chunks/index-server.js";
import { S as escape_html, i as ensure_array_like } from "../../../../chunks/server.js";
import "../../../../chunks/locale.js";
//#region src/routes/games/emoji-warcraft/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onDestroy(() => {});
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="ew-menu svelte-1famq7u"><h2>⚔️ Emoji Warcraft</h2> <div class="ew-levels svelte-1famq7u"><!--[-->`);
			const each_array = ensure_array_like(Array(5));
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				each_array[i];
				$$renderer.push(`<button class="ew-lvl-btn svelte-1famq7u">Level ${escape_html(i + 1)}</button>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _page as default };
