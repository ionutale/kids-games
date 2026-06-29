import { E as writable } from "./server.js";
import "./index-server2.js";
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
//#region src/lib/sounds/audioManager.js
var audioCtx = null;
function getContext() {
	if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	if (audioCtx.state === "suspended") audioCtx.resume();
	return audioCtx;
}
function playTone(freq, duration, type = "sine", volume = .3) {
	try {
		const ctx = getContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = type;
		osc.frequency.value = freq;
		gain.gain.setValueAtTime(volume, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + duration);
	} catch {}
}
function playWin() {
	[
		523,
		587,
		659,
		784,
		880,
		1047
	].forEach((f, i) => {
		setTimeout(() => playTone(f, .2, "sine", .2), i * 80);
	});
}
//#endregion
export { settings as n, playWin as t };
