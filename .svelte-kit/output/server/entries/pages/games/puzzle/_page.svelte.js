import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, o as store_get, r as derived, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import "../../../../chunks/settings.js";
import { t as _ } from "../../../../chunks/locale.js";
import { t as Confetti } from "../../../../chunks/Confetti.js";
//#region src/routes/games/puzzle/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const emojiSets = {
			2: [["🐶", "🐱"], ["🐻", "🐸"]],
			3: [
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
			],
			4: [
				[
					"🐶",
					"🐱",
					"🐰",
					"🐻"
				],
				[
					"🐸",
					"🐵",
					"🦊",
					"🐯"
				],
				[
					"🐭",
					"🐼",
					"🐨",
					"🦁"
				],
				[
					"🐮",
					"🦊",
					"🐸",
					"🐰"
				]
			],
			5: [
				[
					"🐶",
					"🐱",
					"🐰",
					"🐻",
					"🐸"
				],
				[
					"🐵",
					"🦊",
					"🐯",
					"🐭",
					"🐼"
				],
				[
					"🐨",
					"🦁",
					"🐮",
					"🐷",
					"🐸"
				],
				[
					"🐰",
					"🐱",
					"🐶",
					"🐯",
					"🦊"
				],
				[
					"🐻",
					"🐵",
					"🐼",
					"🐨",
					"🦁"
				]
			]
		};
		let level = 1;
		let pieces = [];
		let won = false;
		let dragging = null;
		let placed = /* @__PURE__ */ new Set();
		function levelConfig(l) {
			if (l <= 2) return {
				size: 2,
				tiles: 4
			};
			if (l <= 5) return {
				size: 3,
				tiles: 9
			};
			if (l <= 8) return {
				size: 4,
				tiles: 16
			};
			return {
				size: 5,
				tiles: 25
			};
		}
		let size = derived(() => levelConfig(level).size);
		function initGame() {
			const cfg = levelConfig(level);
			const grid = emojiSets[cfg.size];
			if (!grid) return;
			const result = [];
			let id = 0;
			for (let r = 0; r < cfg.size; r++) for (let c = 0; c < cfg.size; c++) {
				result.push({
					id,
					correctRow: r,
					correctCol: c,
					emoji: grid[r][c],
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
		$$renderer.push(`<div class="puzzle-game svelte-culilx"><div class="level-bar svelte-culilx"><!--[-->`);
		const each_array = ensure_array_like(Array(10));
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			each_array[i];
			$$renderer.push(`<button${attr_class("lvl-btn svelte-culilx", void 0, { "active": level === i + 1 })}>${escape_html(i + 1)}</button>`);
		}
		$$renderer.push(`<!--]--></div> <div class="board svelte-culilx"${attr_style("", { "grid-template-columns": `repeat(${stringify(size())}, 1fr)` })}><!--[-->`);
		const each_array_1 = ensure_array_like(Array(size()));
		for (let r = 0, $$length = each_array_1.length; r < $$length; r++) {
			each_array_1[r];
			$$renderer.push(`<!--[-->`);
			const each_array_2 = ensure_array_like(Array(size()));
			for (let c = 0, $$length = each_array_2.length; c < $$length; c++) {
				each_array_2[c];
				$$renderer.push(`<button${attr_class("ghost-cell svelte-culilx", void 0, {
					"small": size() >= 4,
					"drag-over": false
				})}><span${attr_class("ghost-emoji svelte-culilx", void 0, { "small": size() >= 4 })}>${escape_html(emojiSets[size()][r][c])}</span> <!--[-->`);
				const each_array_3 = ensure_array_like(pieces.filter((p) => p.correctRow === r && p.correctCol === c && placed.has(p.id)));
				for (let $$index_1 = 0, $$length = each_array_3.length; $$index_1 < $$length; $$index_1++) {
					let placedPiece = each_array_3[$$index_1];
					$$renderer.push(`<span${attr_class("placed-piece svelte-culilx", void 0, { "small": size() >= 4 })}>${escape_html(placedPiece.emoji)}</span>`);
				}
				$$renderer.push(`<!--]--></button>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> <div class="tray svelte-culilx"><!--[-->`);
		const each_array_4 = ensure_array_like(pieces);
		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let piece = each_array_4[$$index_4];
			if (!placed.has(piece.id)) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button${attr_class("tray-piece svelte-culilx", void 0, {
					"dragging": dragging === piece.id,
					"small": size() >= 4
				})}>${escape_html(piece.emoji)}</button>`);
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
