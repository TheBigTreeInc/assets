# Use a Git-hosted portrait library

The standalone workshop works offline with its bundled packs. Games can download
an immutable pack from the shared repository using `src/asset-library.js`.
Serve the repository files over HTTPS with CORS enabled for your game's origin.
GitHub Pages is a suitable static file host. Git itself is storage, not a browser API.
Do not embed private repository access tokens in a game.

```html
<script src="src/portrait-kit.js"></script>
<script src="src/asset-library.js"></script>
<script>
async function startPortraits(baseURL, trustedPin) {
  const renderer = await GameAssetLibrary.loadRenderer(baseURL, trustedPin, {
    fallbackURL: 'packs/everyday-illustrated/pack.json'
  });
  const identity = ModularPortraits.normalizeIdentity(renderer.pack, {});
  document.body.append(renderer.render(identity, {size: 256}));
  return renderer;
}
// trustedPin = {id, version, sha256}, copied from the exported catalog.json.
// startPortraits('https://your-host/path/', trustedPin);
</script>
```

The client verifies the pinned release SHA-256, every file hash and size, and
the component canvas. Browser CacheStorage keeps verified files for offline use;
files are checked again when read. Interrupted or corrupt downloads use bundled
art. A full cached pack avoids downloads on subsequent starts. CacheStorage and
Web Crypto require HTTPS or localhost. Downloads time out after 15 seconds per
file. The initial pack has several files, so keep a loading indicator in your game.

Publish new art under a new version and update the trusted pin in the consuming
game. Saved portrait identities keep their existing choices and revision;
appearance JSON never controls download URLs, file paths or checksums.
