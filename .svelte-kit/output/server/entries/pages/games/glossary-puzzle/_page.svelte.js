import { n as onDestroy } from "../../../../chunks/index-server.js";
import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, n as attr_style, o as store_get, r as derived, s as stringify, t as attr_class } from "../../../../chunks/server.js";
import { t as _ } from "../../../../chunks/locale.js";
import "../../../../chunks/Confetti.js";
//#endregion
//#region src/lib/glossary-puzzle/images.js
var PUZZLE_IMAGES = [
	{
		id: "garden",
		name: "Garden",
		category: "nature",
		icon: "🌸",
		file: "/puzzles/01-garden.jpg",
		thumbEmoji: "🌸"
	},
	{
		id: "ocean",
		name: "Ocean",
		category: "nature",
		icon: "🐠",
		file: "/puzzles/02-ocean.jpg",
		thumbEmoji: "🌊"
	},
	{
		id: "space",
		name: "Space",
		category: "adventure",
		icon: "🚀",
		file: "/puzzles/03-space.jpg",
		thumbEmoji: "🚀"
	},
	{
		id: "farm",
		name: "Farm",
		category: "nature",
		icon: "🐄",
		file: "/puzzles/04-farm.jpg",
		thumbEmoji: "🌾"
	},
	{
		id: "jungle",
		name: "Jungle",
		category: "adventure",
		icon: "🦁",
		file: "/puzzles/05-jungle.jpg",
		thumbEmoji: "🌴"
	},
	{
		id: "food",
		name: "Food",
		category: "food",
		icon: "🍕",
		file: "/puzzles/06-food.jpg",
		thumbEmoji: "🍎"
	},
	{
		id: "pets",
		name: "Pets",
		category: "animals",
		icon: "🐱",
		file: "/puzzles/07-pets.jpg",
		thumbEmoji: "🐶"
	},
	{
		id: "transport",
		name: "Transport",
		category: "adventure",
		icon: "🚂",
		file: "/puzzles/08-transport.jpg",
		thumbEmoji: "🚂"
	}
];
function getCategories() {
	const cats = {};
	PUZZLE_IMAGES.forEach((img) => {
		if (!cats[img.category]) cats[img.category] = {
			icon: img.icon,
			name: img.category,
			images: []
		};
		cats[img.category].images.push(img);
	});
	return Object.entries(cats).map(([key, val]) => ({
		key,
		...val
	}));
}
var DIFFICULTIES = {
	easy: {
		label: "Easy",
		cols: 2,
		rows: 2,
		snapRadius: 35
	},
	medium: {
		label: "Medium",
		cols: 3,
		rows: 3,
		snapRadius: 25
	},
	hard: {
		label: "Hard",
		cols: 4,
		rows: 4,
		snapRadius: 18
	}
};
//#endregion
//#region src/routes/games/glossary-puzzle/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let selectedCategory = null;
		let diffKey = "easy";
		derived(() => DIFFICULTIES[diffKey]);
		const categories = getCategories();
		let filteredImages = derived(() => PUZZLE_IMAGES);
		derived(() => 0);
		onDestroy(() => {});
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="gp-gallery svelte-h6or84"><h2 class="gp-gallery-title svelte-h6or84">🧩 ${escape_html(store_get($$store_subs ??= {}, "$_", _)("puzzle"))}</h2> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="gp-categories svelte-h6or84"><!--[-->`);
			const each_array = ensure_array_like(categories);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let cat = each_array[$$index];
				$$renderer.push(`<button${attr_class("gp-cat-btn svelte-h6or84", void 0, { "active": selectedCategory === cat.key })}><span class="gp-cat-icon svelte-h6or84">${escape_html(cat.icon)}</span> <span class="gp-cat-name svelte-h6or84">${escape_html(cat.name)}</span></button>`);
			}
			$$renderer.push(`<!--]--></div> <div class="gp-diff-select svelte-h6or84"><!--[-->`);
			const each_array_1 = ensure_array_like(Object.entries(DIFFICULTIES));
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let [key, d] = each_array_1[$$index_1];
				$$renderer.push(`<button${attr_class("gp-diff-btn svelte-h6or84", void 0, { "active": diffKey === key })}>${escape_html(d.label)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <div class="gp-image-grid svelte-h6or84"><!--[-->`);
			const each_array_2 = ensure_array_like(filteredImages());
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let img = each_array_2[$$index_2];
				$$renderer.push(`<button class="gp-image-card svelte-h6or84"><div class="gp-thumb svelte-h6or84"${attr_style("", { "background-image": `url(${stringify(img.file)})` })}></div> <span class="gp-thumb-name svelte-h6or84">${escape_html(img.name)}</span></button>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
