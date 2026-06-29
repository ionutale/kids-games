import { h as writable, i as derived, l as attr, o as store_get, s as unsubscribe_stores, u as escape_html } from "./internal.js";
import "./exports.js";
import "./client.js";
//#region src/lib/stores/settings.js
var STORAGE_KEY = "kids-games-settings";
function createSettings() {
	const stored = typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") : null;
	const { subscribe, set, update } = writable({
		soundEnabled: stored?.soundEnabled ?? true,
		ageLevel: stored?.ageLevel ?? 3,
		firstVisit: stored?.firstVisit ?? true
	});
	return {
		subscribe,
		toggleSound: () => update((s) => {
			const next = {
				...s,
				soundEnabled: !s.soundEnabled
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			return next;
		}),
		setAge: (level) => update((s) => {
			const next = {
				...s,
				ageLevel: level
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			return next;
		}),
		markVisited: () => update((s) => {
			const next = {
				...s,
				firstVisit: false
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			return next;
		})
	};
}
var settings = createSettings();
//#endregion
//#region src/lib/components/SoundToggle.svelte
function SoundToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let soundOn = derived(() => store_get($$store_subs ??= {}, "$settings", settings).soundEnabled);
		$$renderer.push(`<button class="sound-btn svelte-wwq073"${attr("aria-label", soundOn() ? "Mute sounds" : "Enable sounds")}>${escape_html(soundOn() ? "🔊" : "🔇")}</button>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { settings as n, SoundToggle as t };
