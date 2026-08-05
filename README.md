# Lore / OFF/BEAT prototype

A living, client-facing brand book for OFF/BEAT. It follows the cover → directory → chapter rhythm of the supplied Standards references while keeping client content, visual tokens, downloads, access settings, and embedded tools centralized.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The prototype uses a simulated email magic-link flow: no email is sent, no password is stored, and the 10-user limit exists only in this browser's local storage.

```bash
npm run build
npm run lint
```

## Update a client

Most client changes live in one place:

- `content/offbeat.ts` — client name, intro, chapters, section order, colors, font files, banners, background roles, assets, PDF path, access cap, and app registry.
- `public/offbeat/assets/` — approved downloadable artwork.
- `public/offbeat/fonts/` — locally served client font files.
- `public/offbeat/offbeat-brand-guidelines.pdf` — the downloadable offline edition.

The owner updates the source; there is intentionally no client editor or freelancer marketplace in this demo.

## What is real and what is provisional

- Logo, Typography, and Color use material exposed by the current live OFF/BEAT guide.
- System contains the existing OFF/BEAT Shape Generator rebuilt as a responsive native React tool.
- Photography and Application are clearly labeled structural placeholders. Replace them when approved client material arrives.
- The login screen demonstrates the intended journey but is not security. Production access needs server-side authentication, membership storage, and enforcement.

## Embedded design tool

The Shape Generator supports custom dimensions, standard aspect ratios, stepped corner presets, 1–4 steps, rotation, single/2×2/3×3 layouts, colors, gradients, sticker and ornamental modes, randomization, SVG copy, SVG download, and 2× PNG export.

## Deployment recommendation

For this static prototype, GitHub Pages is the more feasible handoff target: the interface and local demo gate can run entirely client-side. A static-export step or a small Vite-only packaging pass is still required because the current Sites/Vinext build includes a server entry.

Webflow is useful if the visual pages must be maintained inside Webflow Designer, but this implementation would need to be rebuilt there or embedded as custom code. The native React generator, shared configuration model, and PDF workflow would be harder to maintain.

For the production version with real email magic links and a hard maximum of 10 users per client, use a backend-capable host (Cloudflare/Sites, Vercel, or similar) with an auth/data layer such as Supabase. GitHub Pages alone cannot securely enforce membership; Webflow would also require a third-party membership/auth service.

## Production access model

Recommended data model:

- `clients`: client id, slug, user limit, theme/content revision.
- `memberships`: client id, normalized email, invited/active/revoked state.
- `sessions`: short-lived, server-issued sessions from email magic links.
- Server-side invite transaction that locks/counts active memberships before adding user 10.
- Owner-only content publishing; client users receive read/download/tool access only.

Never rely on local storage or a hidden page URL for production access control.
