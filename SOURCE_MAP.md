# Off/Beat media source map & curation proposal

Audit date: 2026-08-05 · Status: **awaiting owner approval — no code, asset, or layout changes made.**
Prepared per `CLAUDE_HANDOFF.md` ("Corrective approach · 1. Audit before altering anything").

Classifications used below:

- **approved** — primary brand-book artwork; stays as-is.
- **curated-showcase (proposed)** — recommended visible selection; needs owner sign-off.
- **archive-only** — preserved on disk and (where original material) downloadable, but not rendered as page galleries.

Nothing is deleted in any outcome. `public/offbeat/media/round-one/` is archive-only by standing instruction.

---

## 1. Rendered placements today — 57 media cards

| Section | Renders | Count | Source | Finding |
| --- | --- | --- | --- | --- |
| 01.6 Round one explorations | `media.logoExplorations` | 8 | `round-one/` deck JPGs | Deck screenshots with baked-in slide chrome ("19-STUDIO · OFFBEAT · EXPLORATIONS · 01" header is part of the pixels). Must leave rendered collections. |
| 01.7 Logo in motion | `media.motion` | 6 | `motion/` originals | Original work, but shown as a full wall incl. two near-duplicate slash loops. |
| 01.8 Production exports | `media.logoExports` | 14 | `logo-exports/` originals | 12 colour/surface permutations of the same badge + 1 master sheet + 1 co-brand trio. Download-library material, not showcase. Auto-generated names ("Production export 01") and alts violate the accurate-label rule. |
| 04.1 Image direction | `media.social[3,4,6,7,9,12]` | 6 | `social/` originals | Direct duplicates of the Social wall via fragile index lookup (`LoreBook.tsx:382`). |
| 06.1 Application explorations | `media.applications` | 8 | `round-one/` deck JPGs | Same deck-chrome problem as 01.6. |
| 06.2 Social media design | `media.social` | 15 | `social/` originals | Full wall; the density problem, plus 6 of these repeat in Photography. |

Approved artwork rendered outside media grids (cover, construction, clearspace, colour fields, shape grid, 7 asset cards, footer) is in order and untouched by this proposal.

## 2. File inventory — 51 media files, classification per file

### `public/offbeat/media/social/` — 15 originals (provenance: supplied social designs, Downloads / BEAT archive)

| File | Config name | Proposed classification | Proposed home |
| --- | --- | --- | --- |
| work-life-balance.jpg | Work-life balance | curated-showcase | Photography · familiar reference, one graphic intervention |
| ai-duplicates.jpg | AI duplicates | curated-showcase | Photography · repetition as intervention |
| shark-tank-guide.jpg | Shark Tank guide | curated-showcase | Photography · grain and duotone treatment |
| anti-vc-shirt.jpg | Anti VC Club | curated-showcase | Applications · merchandise |
| anti-925-shirt.jpg | Anti 925 | curated-showcase | Applications · merchandise |
| cap-application.jpg | Cap application | curated-showcase | Applications · merchandise |
| starter-kit.jpg | Starter kit | curated-showcase | Applications · object/product |
| godmode-launch.jpg | Godmode launch | curated-showcase | Social rail · partnership launch |
| startup-swiping.jpg | Startup swiping | curated-showcase | Social rail · event format |
| partnership-announcement.jpg | Partnership announcement | curated-showcase | Social rail · people announcement |
| grooming-report.jpg | Grooming report | curated-showcase | Social rail · report/editorial format |
| venture-capital.jpg | Venture capital | curated-showcase | Social rail · type-led editorial |
| ai-workshop.jpg | AI workshop | archive-only | Download library |
| cohort-applications.jpg | Cohort applications | archive-only | Download library |
| solar-investment.jpg | Solar investment | archive-only | Download library |

Each file appears in exactly one chapter under this proposal — the current Photography/Social duplication disappears.

### `public/offbeat/media/logo-exports/` — 14 originals (provenance: production archive)

| File | Proposed classification | Note |
| --- | --- | --- |
| asset-38.png | curated-showcase | Master variant sheet — tells the whole colourway story in one image |
| asset-17.png | curated-showcase | Co-brand lockups (Cuminco / God Mode / Acme "by OFF/BEAT") — the only artefact showing partnership usage |
| asset-10.png | curated-showcase | Knockout plate on black — strongest single production surface |
| asset-1,2,3,4,5,6,7,8,9,11,35 (11 files) | archive-only | Colour/surface permutations → grouped download library with real names per colourway |

### `public/offbeat/media/motion/` — 6 originals (provenance: production archive)

| File | Proposed classification | Note |
| --- | --- | --- |
| logo-wordmark-reveal.mp4 | curated-showcase | Hero reveal |
| logo-slash-loop.mp4 | curated-showcase | Signature slash loop |
| email-signature.gif | curated-showcase | Real in-use example |
| logo-slash.mp4 | archive-only | Near-duplicate of the loop |
| logo-brackets.mp4 | archive-only | Secondary construction study |
| logo-animation.gif | archive-only | Superseded by the MP4 reveals |

### `public/offbeat/media/round-one/` — 16 deck-derived JPGs

All 16 files: **archive-only** (mandated). Every file carries the exploration deck's header chrome baked into the image. Content that deserves to survive (colour matrix, secondary bracket lockups, Hindi ऑफ/बीट lockup, annotated construction) should be rebuilt natively from approved artwork or re-sourced from the BEAT archive as originals — never shown as slides.
Files: application-{apparel, campaign-board, cap, editorial, food-merch, object, shape-system, storefront}.jpg, logo-{color-fields, color-matrix, construction, knockout-variants, slash-exploration, slash-icon, wordmark-variants}.jpg, type-exploration.jpg.

### Approved artwork & fonts (unchanged)

`public/offbeat/assets/` (10 files incl. logo-primary/knockout/supporting/clearspace/construction SVGs, cover-logo, shape-grid, slash-insignia, color-swatches) and `public/offbeat/fonts/` (Nimbus Sans ×2, Archivo Variable): **approved**.

## 3. Proposed visible totals

18 curated media placements (3 production + 3 motion + 3 photography + 4 applications + 5 social) replacing 57 — plus the approved artwork already in the guide. All 51 source files remain on disk; originals stay downloadable through the archive/download treatment.

## 4. Defects observed beyond the handoff's list

1. **Fragile duplication coupling** — Photography selects social items by hard-coded indices `[3, 4, 6, 7, 9, 12]` in `app/components/LoreBook.tsx:382`; any reorder of the social array silently changes Photography.
2. **Generic metadata** — `logoExports` names/alt text are auto-generated in `content/offbeat.ts:378-387`; fails the "accurate label, meaningful alt" completion check. Real per-colourway names proposed at implementation.
3. **Tests assert the wrong invariants** — `tests/rendered-html.test.mjs:40` requires the `logoExplorations:` key to exist; there is no guard preventing `round-one/` paths from re-entering rendered collections. To flip per handoff §"Files most relevant".
4. **Content surface** — `theme.backgrounds.content` is `"white"` (`content/offbeat.ts:88`) while the rule (and defined `cream: #FFEFE9`) calls for warm white. Change belongs to the approved implementation pass.
5. **Directory over-promise** — chapter directories list sections that render nothing (Photography lists 4 sections, renders 1; Logo lists "Supporting logo", "Logo use", "Don'ts" ordering that doesn't match rendered 01.1–01.9). Reconcile section lists during the rebuild.
6. **Environmental gap** — no original environmental/storefront renders exist outside deck pages. Options: re-extract originals from `BEAT-20260804T102018Z-1-001.zip` (224 MB, verified present) for approval, or omit environmental examples until supplied.

## 5. Provenance ledger

| Source | Status |
| --- | --- |
| `~/Downloads/BEAT-20260804T102018Z-1-001.zip` (224 MB) | Present, unopened this pass |
| `~/Downloads/offbeat round 01.pdf` (95 MB) | Present; canonical replacement for the Canva URL (ignored per instruction) |
| `tmp/pdfs/` page extracts + contact sheet | Present; research-only |
| `public/offbeat/media/*` | Verified complete: 15 + 14 + 6 + 16 = 51 files, ~6.7 MB |

## 6. Next steps once curation is approved

1. `git init` + baseline commit (worktree currently has no usable history).
2. Split the media model in `content/offbeat.ts` into `showcase` / `archive`; remove index-based reuse; real names and alt text for every visible item.
3. Flip test expectations: assert no rendered collection references `round-one/`; assert showcase/archive keys.
4. Rebuild chapter layouts per handoff treatments (editorial spacing, 61.8/38.2, warm-white surface, no decorative strokes).
5. Archive/download treatment for the full library.
6. `npm run lint` && `npm test`; PDF and README last, after web approval.
