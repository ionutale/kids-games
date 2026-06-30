
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/games" | "/games/animal-quiz" | "/games/glossary-puzzle" | "/games/memory" | "/games/paint" | "/games/pop" | "/games/puzzle" | "/games/soccer" | "/games/sorting" | "/games/splash" | "/games/stickers" | "/games/tower-defense";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/games": Record<string, never>;
			"/games/animal-quiz": Record<string, never>;
			"/games/glossary-puzzle": Record<string, never>;
			"/games/memory": Record<string, never>;
			"/games/paint": Record<string, never>;
			"/games/pop": Record<string, never>;
			"/games/puzzle": Record<string, never>;
			"/games/soccer": Record<string, never>;
			"/games/sorting": Record<string, never>;
			"/games/splash": Record<string, never>;
			"/games/stickers": Record<string, never>;
			"/games/tower-defense": Record<string, never>
		};
		Pathname(): "/" | "/games/animal-quiz" | "/games/glossary-puzzle" | "/games/memory" | "/games/paint" | "/games/pop" | "/games/puzzle" | "/games/soccer" | "/games/sorting" | "/games/splash" | "/games/stickers" | "/games/tower-defense";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/icons/icon-192.svg" | "/icons/icon-512.svg" | "/manifest.json" | "/puzzles/01-garden.jpg" | "/puzzles/02-ocean.jpg" | "/puzzles/03-space.jpg" | "/puzzles/04-farm.jpg" | "/puzzles/05-jungle.jpg" | "/puzzles/06-food.jpg" | "/puzzles/07-pets.jpg" | "/puzzles/08-transport.jpg" | "/robots.txt" | "/screenshots/memory.png" | "/screenshots/paint.png" | "/screenshots/pop.png" | "/screenshots/puzzle.png" | "/screenshots/soccer.png" | "/screenshots/sorting.png" | "/screenshots/splash.png" | "/screenshots/stickers.png" | "/sounds/nudge.mp3" | "/sounds/pickup.mp3" | "/sounds/snap.mp3" | "/sounds/tap.mp3" | "/sounds/victory.mp3" | string & {};
	}
}