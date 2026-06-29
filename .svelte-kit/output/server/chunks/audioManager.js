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
export { playWin as t };
