# Current development scope

- Update the current Stillwater Hotel game only: `index.html`, `index-zh.html`, the `case-*` runtime, forum, adverts and their current styling.
- Archived `classic*.html`, `classic-bridge.js`, `app.js`, `style.css`, `locale-zh.js`, `career.*`, `branches.*`, `support-chat.*`, `afterword.*`, `instructions.*`, `lobby-music.*`, `heritage.css`, `exploration.js` and `story-expansion.js` are frozen. Preserve their source files and saves.
- Do not add links or automatic redirects from the current game to the archive. Maintain the current distribution manifest in `site-files.mjs`; archived game pages and runtimes must stay out of `dist/`.
- Shared media and legacy-compatible display helpers may have archived consumers. Prefer current-only files or scoped selectors for new visual work.
- Preserve the existing schema-two save, clue provenance, three ending IDs, forum and saved adverts. Completion presentation belongs in `case-ending.js`; it must not grant puzzle progress.
- Validate with `npm run build`, `npm test`, and appropriate `--project=v2` Playwright checks. Default browser configuration targets the current edition only.
