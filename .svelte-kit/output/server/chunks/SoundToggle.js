import { S as escape_html, c as unsubscribe_stores, o as store_get, r as derived, x as attr } from "./server.js";
import "./client.js";
import { n as settings } from "./audioManager.js";
import { t as _ } from "./locale.js";
//#region src/lib/components/SoundToggle.svelte
function SoundToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let soundOn = derived(() => store_get($$store_subs ??= {}, "$settings", settings).soundEnabled);
		$$renderer.push(`<button class="sound-btn svelte-wwq073"${attr("aria-label", store_get($$store_subs ??= {}, "$_", _)("sound"))}>${escape_html(soundOn() ? "🔊" : "🔇")}</button>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { SoundToggle as t };
