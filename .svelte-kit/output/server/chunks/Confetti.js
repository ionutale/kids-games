import "./index-server.js";
import { i as ensure_array_like, n as attr_style, s as stringify } from "./server.js";
//#region src/lib/components/Confetti.svelte
function Confetti($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pieces = [];
		$$renderer.push(`<div class="confetti-container svelte-onysc0"><!--[-->`);
		const each_array = ensure_array_like(pieces);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let p = each_array[$$index];
			$$renderer.push(`<div class="piece svelte-onysc0"${attr_style("", {
				left: `${stringify(p.x)}%`,
				"--delay": `${stringify(p.delay)}s`,
				"--duration": `${stringify(p.duration)}s`,
				"--color": p.color,
				"--rotation": `${stringify(p.rotation)}deg`,
				"--size": `${stringify(p.size)}px`
			})}></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { Confetti as t };
