import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, o as store_get, r as derived, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import { n as settings } from "../../../../chunks/audioManager.js";
import { t as Confetti } from "../../../../chunks/Confetti.js";
//#region src/routes/games/puzzle/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const images = [
			{
				id: 1,
				colors: [
					"#FF6B6B",
					"#4FC3F7",
					"#FFD54F"
				],
				name: "Sun"
			},
			{
				id: 2,
				colors: [
					"#81C784",
					"#BA68C8",
					"#FF8A65"
				],
				name: "Flower"
			},
			{
				id: 3,
				colors: [
					"#4FC3F7",
					"#E57373",
					"#FFD54F"
				],
				name: "Star"
			}
		];
		let pieces = [];
		let won = false;
		function initGame() {
			const img = images[Math.floor(Math.random() * images.length)];
			const count = store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 2 ? 2 : store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 3 ? 4 : store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 4 ? 6 : 8;
			const cols = count <= 2 ? 2 : count <= 4 ? 2 : 3;
			const rows = Math.ceil(count / cols);
			const result = [];
			let id = 0;
			for (let r = 0; r < rows; r++) for (let c = 0; c < cols && id < count; c++) {
				result.push({
					id,
					correctRow: r,
					correctCol: c,
					row: r,
					col: c,
					color: img.colors[(r * cols + c) % img.colors.length],
					placed: false
				});
				id++;
			}
			const positions = [];
			for (let i = 0; i < count; i++) positions.push({
				row: result[i].correctRow,
				col: result[i].correctCol
			});
			for (let i = positions.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[positions[i], positions[j]] = [positions[j], positions[i]];
			}
			for (let i = 0; i < count; i++) {
				result[i].row = positions[i].row;
				result[i].col = positions[i].col;
			}
			pieces = result;
			won = false;
		}
		let gridCols = derived(() => store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 2 ? 2 : store_get($$store_subs ??= {}, "$settings", settings).ageLevel <= 4 ? 2 : 3);
		initGame();
		$$renderer.push(`<div class="puzzle-game svelte-culilx"><div class="puzzle-grid svelte-culilx"${attr_style("", { "grid-template-columns": `repeat(${stringify(gridCols())}, 1fr)` })}><!--[-->`);
		const each_array = ensure_array_like(pieces);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let piece = each_array[$$index];
			$$renderer.push(`<button${attr_class("piece svelte-culilx", void 0, { "placed": piece.placed })}${attr_style("", {
				background: piece.color,
				"grid-row": piece.row + 1,
				"grid-column": piece.col + 1
			})}>${escape_html(piece.placed ? "" : "?")}</button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (won) {
			$$renderer.push("<!--[0-->");
			Confetti($$renderer, {});
			$$renderer.push(`<!----> <div class="win-overlay svelte-culilx"><p class="win-text svelte-culilx">Puzzle done!</p> <button class="replay-btn svelte-culilx">New Puzzle</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
