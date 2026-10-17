# Folio

An independent journal and editorial studio built with React 19, Vite, TypeScript, Express 5, MongoDB, Editor.js, and ImageKit.

The redesign replaces the old Little Tech Tips interface with a shared editorial identity: paper surfaces, Newsreader type, burnt terracotta accents, quiet interactions, responsive layouts, and practical publishing tools. The audit and implementation scope are in [REDESIGN_PLAN.md](REDESIGN_PLAN.md).

## Run locally

Use Node.js 22 or newer. Install the two applications:

```sh
npm --prefix client ci
npm --prefix server ci
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Set your MongoDB connection string, `JWT_SECRET`, `CLIENT_URL`, and initial `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env`. Keep MongoDB running. Then use two terminals from the project root:

```sh
npm run server
```

```sh
npm run client
```

Open **http://localhost:5173**. The studio is **http://localhost:5173/admin**. Vite proxies `/api` to port 3000. Set `VITE_BASE_URL` only when the API uses another origin. `CLIENT_URL` must match the frontend origin exactly; `localhost` and `127.0.0.1` are different origins.

Configured staff credentials give initial studio access without adding database records. Create a normal reader account and promote it in the Community screen when you want a staff member to also like and comment as a reader. Existing database records are retained; no seed or migration runs automatically.

For a frontend-only preview, set `VITE_DEMO_MODE=true` in `client/.env`. Development also falls back to a labeled sample edition when the API is unavailable and this setting is omitted. Set it to `false` for live integration work. Production never automatically substitutes sample content for failed API requests. Sample stories do not write comments, likes, or newsletter signups.

## Reader features

- Featured editorial story, topic navigation, search, server pagination, newest/oldest/most-loved sorting, grid/list views.
- Readable articles, safe rich text and nested lists, author metadata, reading time, table of contents, related stories, copy/native share.
- Device-local bookmarks, reader signup/login, likes, moderated comments, and account activity.
- Persistent newsletter registration, clear success/failure states, publication story and privacy pages.
- Mobile navigation, keyboard focus, skip links, reduced motion, appropriate touch inputs, and lazy-loaded reader/studio screens.

## Editorial studio

- Real overview counts, draft queue, recent articles, and moderation links.
- Searchable articles with status/category filters, server pagination, explicit publish/unpublish, editing, and confirmed deletion.
- Editor.js writing, cover upload or HTTPS URL, author, tags, featured status, draft/publish controls, reading time, unsaved-change notice.
- Approved/pending comment moderation, community role management and account suspension.
- Subscriber list, current-page CSV export, and confirmed unsubscribe.

ImageKit credentials enable file uploads. HTTPS cover image URLs work without ImageKit. The optional AI draft service is configured separately and never blocks manual writing.

## Validation

```sh
npm run check
npm test
npm run build
```

The backend test suite uses isolated model stubs and covers auth, draft protection, validation, rich-text sanitization, moderation, likes, subscriber persistence, and sorting. No test writes to a live database. Reader and studio flows were also checked in Chrome at 1440px and 390px using mocked APIs. Real phone behavior and live MongoDB/ImageKit integration still require verification in your configured environment.

Compatible dependency updates cleared the client audit. The server has two moderate audit entries from ImageKit 6 and its transitive UUID package; the affected UUID APIs are unused by ImageKit here. Resolving these entries requires an ImageKit SDK migration. No high or critical advisories remain at the time of verification.

## Deployment notes

Build the frontend into `client/dist`, serve it with SPA fallback to `index.html`, and run the API with `NODE_ENV=production`. Use HTTPS and exact allowed frontend origins. Configure secrets in the host, not the repository. See [server/README.md](server/README.md) for API contracts, cookie behavior, rate limits, indexes, and production requirements.

Newsletter addresses are stored and managed, but no email is sent yet. Connect a mail provider and delivery worker before enabling a newsletter campaign. Bookmarks are specific to this browser and device. The app has no analytics or advertising integration. Font requests go to Google Fonts; upload requests use ImageKit when configured.

This redesign does not deploy the site or mutate existing production data.
