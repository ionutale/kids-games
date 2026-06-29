import "../../chunks/index-server.js";
import { c as unsubscribe_stores, o as store_get, p as getContext, r as derived, x as attr } from "../../chunks/server.js";
import "../../chunks/client.js";
import "../../chunks/audioManager.js";
import { t as _ } from "../../chunks/locale.js";
import { t as SoundToggle } from "../../chunks/SoundToggle.js";
//#region node_modules/.pnpm/@sveltejs+kit@2.68.0_@sveltejs+vite-plugin-svelte@7.1.2_svelte@5.56.4_vite@8.1.0_terser_92cd6391677923dcfe4fa79ac66478d5/node_modules/@sveltejs/kit/src/runtime/app/stores.js
/**
* A function that returns all of the contextual stores. On the server, this must be called during component initialization.
* Only use this if you need to defer store subscription until after the component has mounted, for some reason.
*
* @deprecated Use `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
*/
var getStores = () => {
	const stores$1 = getContext("__svelte__");
	return {
		/** @type {typeof page} */
		page: { subscribe: stores$1.page.subscribe },
		/** @type {typeof navigating} */
		navigating: { subscribe: stores$1.navigating.subscribe },
		/** @type {typeof updated} */
		updated: stores$1.updated
	};
};
/**
* A readable store whose value contains page data.
*
* On the server, this store can only be subscribed to during component initialization. In the browser, it can be subscribed to at any time.
*
* @deprecated Use `page` from `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
* @type {import('svelte/store').Readable<import('@sveltejs/kit').Page>}
*/
var page = { subscribe(fn) {
	return getStores().page.subscribe(fn);
} };
//#endregion
//#region src/lib/components/BackButton.svelte
function BackButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { to = "/" } = $$props;
		$$renderer.push(`<button class="back-btn svelte-iugoeh"${attr("aria-label", store_get($$store_subs ??= {}, "$_", _)("back"))}><span class="arrow">←</span></button>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		let isGame = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/games"));
		$$renderer.push(`<div class="shell svelte-12qhfyh">`);
		if (isGame()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<header class="top-bar svelte-12qhfyh">`);
			BackButton($$renderer, {});
			$$renderer.push(`<!----> `);
			SoundToggle($$renderer, {});
			$$renderer.push(`<!----></header>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <main class="game-area svelte-12qhfyh">`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _layout as default };
