import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, o as store_get, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/audioManager.js";
import { t as _ } from "../../../../chunks/locale.js";
import { t as Confetti } from "../../../../chunks/Confetti.js";
//#region src/routes/games/puzzle/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const PUZZLE_SIZE = 3;
		const emojiGrid = [
			[
				"🐶",
				"🐱",
				"🐰"
			],
			[
				"🐻",
				"🐸",
				"🐵"
			],
			[
				"🦊",
				"🐯",
				"🐭"
			]
		];
		let pieces = [];
		let won = false;
		let dragging = null;
		function initGame() {
			const result = [];
			let id = 0;
			for (let r = 0; r < PUZZLE_SIZE; r++) for (let c = 0; c < PUZZLE_SIZE; c++) {
				result.push({
					id,
					correctRow: r,
					correctCol: c,
					row: r,
					col: c,
					emoji: emojiGrid[r][c],
					placed: false
				});
				id++;
			}
			const positions = [];
			for (let i = 0; i < result.length; i++) positions.push({
				row: result[i].row,
				col: result[i].col
			});
			for (let i = positions.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[positions[i], positions[j]] = [positions[j], positions[i]];
			}
			for (let i = 0; i < result.length; i++) {
				result[i].row = positions[i].row;
				result[i].col = positions[i].col;
			}
			pieces = result;
			won = false;
		}
		initGame();
		$$renderer.push(`<div class="puzzle-game svelte-culilx"><div class="puzzle-board svelte-culilx"><div class="bg-grid svelte-culilx"><!--[-->`);
		const each_array = ensure_array_like(Array(PUZZLE_SIZE));
		for (let r = 0, $$length = each_array.length; r < $$length; r++) {
			each_array[r];
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(Array(PUZZLE_SIZE));
			for (let c = 0, $$length = each_array_1.length; c < $$length; c++) {
				each_array_1[c];
				$$renderer.push(`<div class="bg-cell svelte-culilx"${attr_style("", {
					"grid-row": r + 1,
					"grid-column": c + 1
				})}><span class="bg-emoji svelte-culilx">${escape_html(emojiGrid[r][c])}</span></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> <!--[-->`);
		const each_array_2 = ensure_array_like(pieces);
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let piece = each_array_2[$$index_2];
			if (!piece.placed) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div${attr_class("piece svelte-culilx", void 0, { "dragging": dragging === piece.id })}${attr_style("", {
					"grid-row": piece.row + 1,
					"grid-column": piece.col + 1,
					"z-index": dragging === piece.id ? 10 : 1
				})}><span class="piece-emoji svelte-culilx">${escape_html(piece.emoji)}</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> `);
		if (won) {
			$$renderer.push("<!--[0-->");
			Confetti($$renderer, {});
			$$renderer.push(`<!----> <div class="win-overlay svelte-culilx"><p class="win-text svelte-culilx">${escape_html(store_get($$store_subs ??= {}, "$_", _)("puzzleDone"))}</p> <button class="replay-btn svelte-culilx">${escape_html(store_get($$store_subs ??= {}, "$_", _)("newPuzzle"))}</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
