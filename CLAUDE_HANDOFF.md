# Claude handoff — Off/Beat Lore corrective brief

## Read this first

This file is a handoff and a reset of direction, not approval to redesign the site yet.

**Do not make visual, code, asset, authentication, or deployment changes until the owner gives a new explicit instruction.** If asked to resume, begin with the asset audit and curation proposal described below; do not treat the current galleries as approved content.

## Product context

Lore is a prototype for a living, interactive replacement for a static brand book. The first client is **Off/Beat**. It is intended to let a brand owner centrally update content, backgrounds, banners, fonts, downloads, and embedded design-assistance tools.

The current demo includes:

- A centrally configured Off/Beat brand book.
- A simulated email magic-link journey with an owner-only editing model and a nominal 10-user client cap.
- Downloadable assets and an offline PDF export.
- A native Off/Beat Shape Generator.

Future multi-client, freelancer, and secure SSO capabilities are product ideas only. Do not add them to this prototype.

## The current problem

The site currently treats the Canva-exported exploration deck as display content. It does this by rendering flattened screenshots from the deck in large galleries, alongside too many social and logo assets at once. This makes the experience feel like a pasted presentation rather than a curated, professional brand system.

The PDF is a **reference and source-discovery tool**. It may inform selection, art direction, and asset provenance, but its pages must not be rendered as visual content in the brand book.

### Audit snapshot

The current media system has **57 visible media-card placements**: eight deck-derived logo studies, six motion items, fourteen logo exports, six reused social examples in Photography, eight deck-derived application studies, and all fifteen social assets in Applications. It has the density of an asset archive, not a brand-book narrative.

There are 51 files (about 6.7 MB) under `public/offbeat/media/`: sixteen `round-one` JPGs, six motion assets, fourteen logo exports, and fifteen social images. The issue is presentation and curation—not a reason to delete source material.

### Current implementation that needs correction after approval

| Location | Current behaviour | Correct direction |
| --- | --- | --- |
| `content/offbeat.ts` | `offbeat.media.logoExplorations` and `offbeat.media.applications` point to flattened JPGs in `public/offbeat/media/round-one/`. | Keep the files as research material, but remove them from rendered collections. Replace them with a small, curated selection of original source assets. |
| `app/components/LoreBook.tsx` | Logo, Photography, and Application chapters render wide media walls. | Replace asset dumps with editorially spaced layouts and purposeful examples. |
| `public/offbeat/media/round-one/` | Holds extracted deck-page JPGs. | Preserve; do not delete or display them. Treat as an internal reference archive. |
| `public/offbeat/media/social/`, `motion/`, and `logo-exports/` | Holds original supplied social designs, motion work, and production exports. | Curate a small visible subset; retain the complete source library as downloadable material. |
| `app/globals.css` | Uses generic two/three-column gallery systems with compact gaps and repeated metadata bars. | Replace the relevant gallery rules with purpose-built, whitespace-led editorial layouts. |
| `content/offbeat.ts` | Defines `cream: #FFEFE9`, but its content background is still configured as `white`. | When visual changes are approved, use the warm-white content surface consistently. |
| `scripts/generate_brandbook_pdf.py` and `README.md` | Still describe/render Photography and Applications as placeholders while the website shows galleries. | Keep them unchanged for now; once the web curation is approved, update the PDF script and README together. |

## Source hierarchy and provenance

Use the following order when deciding what can be shown.

1. **Approved brand-book artwork** — `public/offbeat/assets/` and `public/offbeat/fonts/`. These are the primary logo, construction, colour, shape, and type assets currently used in the guide.
2. **Original supplied production material** — the assets copied into `public/offbeat/media/social/`, `public/offbeat/media/motion/`, and `public/offbeat/media/logo-exports/`. They can be shown after curation and must remain downloadable.
3. **External source archive** — `/Users/adityasangal/Downloads/BEAT-20260804T102018Z-1-001.zip`, the supplied social-image files in `/Users/adityasangal/Downloads/`, and `/Users/adityasangal/Downloads/offbeat round 01.pdf`. These establish provenance and can be re-audited if needed.
4. **Research-only deck derivatives** — `public/offbeat/media/round-one/` and `tmp/pdfs/`. Never render these as a page gallery unless the owner expressly changes this instruction.

Ignore the Canva URL. The supplied PDF is the canonical replacement for it.

## Non-negotiable visual rules

- Use the Songtrust reference for **structure**, not styling: generous whitespace, quiet hierarchy, editorial pacing, and approximately 61.8/38.2 content proportions.
- Use Helvetica or Nimbus Sans Medium across the brand-book interface. The Off/Beat wordmark should not be rendered in Archivo Narrow.
- Archivo Narrow is only appropriate where it already exists inside approved social-style headline artwork.
- Use sentence case for navigation, labels, captions, and body copy. Reserve all caps for genuine display/social headlines.
- Keep copy sparse. Correct letter spacing, line height, and scale before adding more text.
- Use warm white—not pure white—as the principal light surface. Use Off/Beat pink, black, and supporting colours deliberately rather than everywhere.
- Pattern blocks have no decorative stroke. Use the stepped Off/Beat form with pink/warm-white fields and **“Custom patterns”** centred in the composition.
- Avoid tight card grids, ornamental borders, duplicate images, and generic gallery captions.

## Corrective approach — only after owner approval

### 1. Audit before altering anything

- Build a source map that records each visible asset, its original source, usage category, title, alt text, and downloadable file.
- Classify every image/video as `approved`, `curated-showcase`, or `archive-only`.
- Preserve all existing source files. The worktree currently has no useful committed history, so do not use `git reset`, bulk deletions, or destructive cleanup.

### 2. Keep content centralized

- Continue using `content/offbeat.ts` as the source of truth for content, visual tokens, asset metadata, downloads, and chapter order.
- Replace the current flat `logoExplorations`, `applications`, and full `social` presentation lists with a data model that distinguishes a curated `showcase` from a download-only `archive`.
- Every asset shown on the page must have an accurate label, alt text, format/dimensions metadata, and a direct download target.
- Do not hard-code new asset content inside React components.

The current `MediaCard` and `MotionCard` already provide individual file downloads. Preserve that behaviour for visible work; add the archive experience through the centralized configuration rather than duplicating paths in the UI.

### 3. Rebuild the media presentation around curation

Keep visible media intentionally small: normally **three to six assets per chapter**. The whole source library can be available from a secondary, compact archive/download treatment.

| Chapter | Intended treatment |
| --- | --- |
| Logo | Retain approved logo rules and approved file downloads. Add one restrained explorations treatment using original source assets only; show a limited motion selection; keep the remaining production files in a download library. |
| Photography | Replace the six-card wall with a short art-direction section: three or four principles paired with selected original examples, not PDF slides. |
| Applications | Use a calm, asymmetrical showcase of four to six carefully chosen merchandise, environmental, or editorial examples. Use the 61.8/38.2 rhythm rather than a dense uniform grid. |
| Social | Treat published social work as a small, clearly labelled showcase or horizontal rail. Do not display all supplied posts as a wall, and do not repeat the same visual in multiple chapters without an intentional reason. |
| Archive/downloads | Offer raw source assets in a subordinate, searchable/listed or grouped download area. It should not compete with the brand-book narrative. |

### 4. Preserve working functionality

Do not alter these unless the owner separately asks:

- The simulated email/login flow in `app/components/LoreBook.tsx`.
- The nominal 10-user cap and owner-only editing flags in `content/offbeat.ts`.
- The Shape Generator in `app/components/ShapeGenerator.tsx`.
- Asset download mechanics.
- Deployment strategy or hosting configuration.

The current login is a browser-only demonstration, not production security. Do not claim it enforces real membership or SSO.

### 5. Update the PDF last

Do not regenerate or redesign `public/offbeat/offbeat-brand-guidelines.pdf` or `output/pdf/offbeat-brand-guidelines.pdf` until the web curation and layout are approved. Once approved, update `scripts/generate_brandbook_pdf.py` so the exported PDF reflects the same selective, editorial structure—not a gallery dump—and render it for visual QA.

## Files most relevant to the next implementation pass

- `content/offbeat.ts` — central client configuration, visual tokens, chapter content, media metadata, access flags, downloads.
- `app/components/LoreBook.tsx` — chapter layouts, media rendering, download cards, demo access flow.
- `app/globals.css` — typography, spacing, editorial layout proportions, and media-grid rules.
- `app/components/ShapeGenerator.tsx` — preserve existing interactive tool and its default Off/Beat configuration.
- `scripts/generate_brandbook_pdf.py` — only touch after web approval.
- `tests/rendered-html.test.mjs` — update expectations to ensure reference-only deck images cannot reappear in rendered collections.
- `README.md` — update alongside the PDF once Photography and Applications stop being placeholders.

## Required completion checks after implementation

- No rendered UI references files from `public/offbeat/media/round-one/`.
- No chapter is an indiscriminate asset dump; visible collections are intentionally limited and labelled.
- Every visible image/video can be downloaded and has meaningful alt text.
- No visual is duplicated across Photography, Applications, and Social without a stated purpose.
- Tests no longer assert that a `round-one` image or the old gallery keys must be present; instead they assert the curated showcase/archive behaviour.
- Desktop and mobile layouts retain whitespace, readable typography, and a clear visual hierarchy.
- The existing demo login, central configuration, downloads, and Shape Generator still work.
- Run `npm run lint` and `npm test` after code changes.
- After PDF work is approved, generate and visually inspect the PDF before delivery.

## Working conventions

- Use `apply_patch` for source edits.
- Make small, reversible changes. Do not remove the research archive until the owner has reviewed a source map and explicitly approves deletion.
- Do not deploy to GitHub Pages, Webflow, or another host in this phase.
- If an asset’s approval status is uncertain, keep it archive-only and ask the owner rather than presenting it as final brand guidance.

## Stop condition

The owner has asked for this handoff before any further redesign. End after documenting/auditing the current state and wait for their next instruction before changing the presentation.
