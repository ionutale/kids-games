
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const NODE_ENV: string;
	export const OPENCODE_DISABLE_EMBEDDED_WEB_UI: string;
	export const OPENCODE_SERVER_PASSWORD: string;
	export const OSLogRateLimit: string;
	export const PLAYWRIGHT_TEST_BASE_URL: string;
	export const HOMEBREW_CELLAR: string;
	export const INFOPATH: string;
	export const npm_config_user_agent: string;
	export const LOGNAME: string;
	export const no_proxy: string;
	export const HOME: string;
	export const DEBUG_COLORS: string;
	export const npm_package_version: string;
	export const XPC_SERVICE_NAME: string;
	export const MACH_PORT_RENDEZVOUS_PEER_VALDATION: string;
	export const OPENCODE_CLIENT: string;
	export const NODE_PATH: string;
	export const npm_package_name: string;
	export const npm_lifecycle_event: string;
	export const PWD: string;
	export const npm_config_node_gyp: string;
	export const XPC_FLAGS: string;
	export const npm_command: string;
	export const ASDF_DATA_DIR: string;
	export const OPENCODE_EXPERIMENTAL_ICON_DISCOVERY: string;
	export const USER: string;
	export const __CFBundleIdentifier: string;
	export const ASDF_CONFIG_FILE: string;
	export const PATH: string;
	export const OPENCODE_SERVER_USERNAME: string;
	export const BROWSER: string;
	export const HOMEBREW_PREFIX: string;
	export const HOMEBREW_REPOSITORY: string;
	export const npm_execpath: string;
	export const EDITOR: string;
	export const OLLAMA_BACKEND: string;
	export const pnpm_config_verify_deps_before_run: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const SSH_AUTH_SOCK: string;
	export const SVELTEKIT_FORK: string;
	export const npm_node_execpath: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const ARCHFLAGS: string;
	export const COMMAND_MODE: string;
	export const npm_package_json: string;
	export const ASDF_DEFAULT_TOOL_VERSIONS_FILENAME: string;
	export const LANG: string;
	export const SHELL: string;
	export const FORCE_COLOR: string;
	export const COLOR: string;
	export const TMPDIR: string;
	export const MallocNanoZone: string;
	export const FPATH: string;
	export const SHLVL: string;
	export const NO_PROXY: string;
	export const HEADED: string;
	export const OPENCODE_EXPERIMENTAL_FILEWATCHER: string;
	export const npm_lifecycle_script: string;
	export const ASDF_DIR: string;
	export const XDG_STATE_HOME: string;
	export const PLAYWRIGHT_TEST: string;
	export const NODE: string;
	export const INIT_CWD: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		NODE_ENV: string;
		OPENCODE_DISABLE_EMBEDDED_WEB_UI: string;
		OPENCODE_SERVER_PASSWORD: string;
		OSLogRateLimit: string;
		PLAYWRIGHT_TEST_BASE_URL: string;
		HOMEBREW_CELLAR: string;
		INFOPATH: string;
		npm_config_user_agent: string;
		LOGNAME: string;
		no_proxy: string;
		HOME: string;
		DEBUG_COLORS: string;
		npm_package_version: string;
		XPC_SERVICE_NAME: string;
		MACH_PORT_RENDEZVOUS_PEER_VALDATION: string;
		OPENCODE_CLIENT: string;
		NODE_PATH: string;
		npm_package_name: string;
		npm_lifecycle_event: string;
		PWD: string;
		npm_config_node_gyp: string;
		XPC_FLAGS: string;
		npm_command: string;
		ASDF_DATA_DIR: string;
		OPENCODE_EXPERIMENTAL_ICON_DISCOVERY: string;
		USER: string;
		__CFBundleIdentifier: string;
		ASDF_CONFIG_FILE: string;
		PATH: string;
		OPENCODE_SERVER_USERNAME: string;
		BROWSER: string;
		HOMEBREW_PREFIX: string;
		HOMEBREW_REPOSITORY: string;
		npm_execpath: string;
		EDITOR: string;
		OLLAMA_BACKEND: string;
		pnpm_config_verify_deps_before_run: string;
		__CF_USER_TEXT_ENCODING: string;
		SSH_AUTH_SOCK: string;
		SVELTEKIT_FORK: string;
		npm_node_execpath: string;
		PNPM_SCRIPT_SRC_DIR: string;
		ARCHFLAGS: string;
		COMMAND_MODE: string;
		npm_package_json: string;
		ASDF_DEFAULT_TOOL_VERSIONS_FILENAME: string;
		LANG: string;
		SHELL: string;
		FORCE_COLOR: string;
		COLOR: string;
		TMPDIR: string;
		MallocNanoZone: string;
		FPATH: string;
		SHLVL: string;
		NO_PROXY: string;
		HEADED: string;
		OPENCODE_EXPERIMENTAL_FILEWATCHER: string;
		npm_lifecycle_script: string;
		ASDF_DIR: string;
		XDG_STATE_HOME: string;
		PLAYWRIGHT_TEST: string;
		NODE: string;
		INIT_CWD: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
