export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["icons/icon-192.svg","icons/icon-512.svg","manifest.json","robots.txt"]),
	mimeTypes: {".svg":"image/svg+xml",".json":"application/json",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.OYGP2GFM.js",app:"_app/immutable/entry/app.BqNUOQJq.js",imports:["_app/immutable/entry/start.OYGP2GFM.js","_app/immutable/chunks/C0izG7CS.js","_app/immutable/chunks/B9JtjcNA.js","_app/immutable/entry/app.BqNUOQJq.js","_app/immutable/chunks/B9JtjcNA.js","_app/immutable/chunks/DYl5dUZ5.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
