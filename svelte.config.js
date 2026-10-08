import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Root-absolute /_app URLs. Relative ones break when the cached shell is
    // opened at /games/..., which is every offline deep link and refresh.
    paths: { relative: false },
    adapter: adapter({
      pages: 'public',
      assets: 'public',
      fallback: 'index.html',
      precompress: false,
      strict: true
    })
  }
};

export default config;
