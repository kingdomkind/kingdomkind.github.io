import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',      // output dir for HTML pages
      assets: 'build',     // output dir for assets
      fallback: null,      // set to '200.html' for SPA mode
      precompress: false,
      strict: true
    })
  }
};