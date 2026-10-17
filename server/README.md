# Editorial API

The Express 5 and MongoDB API supports readers, editors, and administrators. Existing `/api/blog`, `/api/auth`, `/api/user`, and `/api/admin` routes remain available. Responses use `{ success, ...data }`; failed requests use an appropriate HTTP status and `{ success: false, message }`.

## Local setup

Use Node.js 22 or newer and a MongoDB instance. From `server/`:

```sh
npm ci
cp .env.example .env
npm run dev
```

Set `MONGODB_URI` to your database connection string, including the database name. Set `JWT_SECRET` to a long random value and `CLIENT_URL` to the frontend origin. The API refuses to start without required configuration or a working database connection. Default port: `3000`.

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to establish initial administrator access. This configured account does not create or modify database records. Sign in through the normal login form or `/api/admin/login`. Registered readers can be promoted to editor or administrator through the member management screen. Optional `EDITOR_EMAIL` and `EDITOR_PASSWORD` provide a configured editor account.

Existing MongoDB documents are retained. No migration, seed, or database reset runs on startup. New metadata has schema defaults. Email login also accepts accounts whose emails were stored with different capitalization.

ImageKit credentials are required for uploaded cover files. The API also accepts an HTTPS `image` URL when saving an article, which works without ImageKit. The optional `AI_MICROSERVICE_URL` receives `{title, subTitle}` and must return Editor.js `{blocks}`; writing articles does not require that service.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

Tests run without a live database or third-party credentials. They cover input validation, protected draft access, authorization, token expiry and revocation, trusted origins, rate limits, moderation on comment edits, atomic likes, and subscriber persistence. Database operations are stubbed in focused controller tests; these are not a substitute for a deployment integration test against MongoDB and ImageKit.

## Reader endpoints

| Method | Route | Behavior |
| --- | --- | --- |
| POST | `/api/auth/signup` | `{name, email, password}`; creates a reader and starts a session |
| POST | `/api/auth/login` | `{email, password}`; reader or staff login |
| POST | `/api/auth/logout` | Clears the session cookie |
| GET | `/api/auth/check-auth` | Current session user and current database role |
| GET | `/api/blog/all` | Published articles; `search`, `category`, `featured`, `sort=latest\|oldest\|popular`, `page`, `limit` |
| GET | `/api/blog/:blogId` | Published article by MongoDB ID or slug |
| POST | `/api/blog/comments` | `{blogId}`; approved comments plus the signed-in reader's pending comments |
| POST | `/api/blog/add-comment` | `{blog, content}`; registered readers, moderation required |
| POST | `/api/blog/edit-comment` | `{commentId, content}`; owner only, resets approval |
| POST | `/api/blog/delete-comment` | `{commentId}`; owner only |
| POST | `/api/blog/like`, `/api/blog/unlike` | `{id}`; atomic, idempotent reading-list updates |
| GET | `/api/user/liked-blogs` | Signed-in reader's saved published articles |
| GET | `/api/user/comments` | Reader's comments on existing, published articles |
| POST | `/api/newsletter/subscribe` | `{email}`; saves a normalized, unique subscriber address |

Newsletter subscriptions are persisted for administrators. This project does not send newsletters or transactional email; connect an email provider before promising delivery.

## Studio endpoints

Administrators and editors can list, create, edit, publish, and moderate. Only administrators can delete articles or manage members and subscriber records.

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | Article, draft, comment, pending moderation, member, subscriber, and saved-article counts |
| GET | `/api/admin/blogs` | `search`, `category`, `featured`, `status=published\|draft`, `page`, `limit` |
| GET | `/api/admin/blogs/:id` | Protected draft/published article access for the editor |
| POST | `/api/blog/add` | Creates an article; accepts multipart `blog` JSON plus `image` file, or JSON with an HTTPS `image` URL |
| PUT | `/api/blog/edit/:id` | Updates an article; existing cover can be retained |
| POST | `/api/blog/toggle-publish` | `{id, isPublished?}`; optional explicit status, otherwise toggles |
| POST | `/api/blog/delete` | `{id}`; administrator only, removes associated comments |
| POST | `/api/blog/generate` | `{title, subTitle?}`; optional AI service with a 30-second timeout |
| GET | `/api/admin/comments` | `search`, `status=pending\|approved`, `page`, `limit` |
| POST | `/api/admin/approve-comment` | `{id, isApproved?}`; approves by default or returns to moderation |
| POST | `/api/admin/delete-comment` | `{id}`; removes a moderated comment |
| GET | `/api/admin/users` | All registered roles; `search`, `role=user\|editor\|admin`, `page`, `limit` |
| PATCH | `/api/admin/users/:id` | `{role?, isActive?}`; cannot suspend or demote the signed-in administrator |
| GET | `/api/admin/subscribers` | Active subscribers; `page`, `limit` |
| PATCH | `/api/admin/subscribers/:id` | `{isActive}`; removes/restores a subscriber without deleting the record |
| GET | `/api/health` | `200` when MongoDB is connected; `503` otherwise |

Article fields: `title`, `subTitle`, `category`, `description` (Editor.js blocks), `isPublished`, `authorName`, `featured`, `tags`, optional `excerpt`, optional HTTPS `image`. The server derives `slug`, `readTime`, and `publishedAt`. Articles require title, category, and a cover image. Publishing also requires content. Supported content blocks: paragraph, header, list, quote, delimiter, and inlineCode.

Article text preserves safe bold, italic, underline, strikethrough, highlight, code, line breaks, and links through a server-side HTML allowlist. Event attributes, embedded documents, scripts, styling, and unsafe link protocols are removed. Editor.js v2 nested lists retain child items and supported list metadata, with at most eight levels and 1,000 total list items per article.

Lists return their original array key (`blogs`, `comments`, `users`, `subscribers`) and `pagination: {total, page, limit, pages}`. The default limit is 100 for compatibility; maximum limit is 100. Consumers needing more records must request subsequent pages. Empty filters should be omitted.

## Deployment

Use HTTPS for both frontend and API, set `NODE_ENV=production`, and list exact allowed frontend origins in `CLIENT_URL` (comma-separated). Cookies are HTTP-only and expire after seven days; production cookies use `Secure` and `SameSite=None` for separate frontend/API origins. State-changing browser requests must use an allowed origin. Browsers that block third-party cookies require hosting frontend and API under the same site.

Set `TRUST_PROXY=1` only when a trusted reverse proxy removes untrusted forwarding headers. Login, signup, comments, AI generation, and subscription endpoints have per-IP memory limits. For multiple API processes, replace the in-process limiter with a shared store. Database-backed users have roles and active status rechecked on each request; signing out clears the browser cookie. Changing `JWT_SECRET` invalidates all sessions.

MongoDB indexes are declared for email uniqueness, slugs, public article lists, categories, and comment moderation. Build required indexes through your normal deployment procedure when automatic indexing is disabled. Back up the database before deploying schema changes.
