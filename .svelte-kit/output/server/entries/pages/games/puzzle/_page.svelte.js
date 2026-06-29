import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, o as store_get, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/settings.js";
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
		let placed = /* @__PURE__ */ new Set();
		function initGame() {
			const result = [];
			let id = 0;
			for (let r = 0; r < PUZZLE_SIZE; r++) for (let c = 0; c < PUZZLE_SIZE; c++) {
				result.push({
					id,
					correctRow: r,
					correctCol: c,
					emoji: emojiGrid[r][c],
					placed: false
				});
				id++;
			}
			for (let i = result.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[result[i], result[j]] = [result[j], result[i]];
			}
			pieces = result;
			placed = /* @__PURE__ */ new Set();
			won = false;
		}
		initGame();
		$$renderer.push(`<div class="puzzle-game svelte-culilx"><div class="board svelte-culilx"><!--[-->`);
		const each_array = ensure_array_like(Array(PUZZLE_SIZE));
		for (let r = 0, $$length = each_array.length; r < $$length; r++) {
			each_array[r];
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(Array(PUZZLE_SIZE));
			for (let c = 0, $$length = each_array_1.length; c < $$length; c++) {
				each_array_1[c];
				$$renderer.push(`<button${attr_class("ghost-cell svelte-culilx", void 0, { "drag-over": false })}><span class="ghost-emoji svelte-culilx">${escape_html(emojiGrid[r][c])}</span> <!--[-->`);
				const each_array_2 = ensure_array_like(pieces.filter((p) => p.correctRow === r && p.correctCol === c && placed.has(p.id)));
				for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
					let placedPiece = each_array_2[$$index];
					$$renderer.push(`<span class="placed-piece svelte-culilx">${escape_html(placedPiece.emoji)}</span>`);
				}
				$$renderer.push(`<!--]--></button>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> <div class="tray svelte-culilx"><!--[-->`);
		const each_array_3 = ensure_array_like(pieces);
		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let piece = each_array_3[$$index_3];
			if (!placed.has(piece.id)) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button${attr_class("tray-piece svelte-culilx", void 0, { "dragging": dragging === piece.id })}>${escape_html(piece.emoji)}</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
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
