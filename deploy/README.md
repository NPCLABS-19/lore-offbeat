# Deploying

The site is published to GitHub Pages at
<https://npclabs-19.github.io/lore-offbeat/>.

## How it is deployed today

The `gh-pages` branch holds the built static site. To publish an update:

```bash
BASE_PATH=/lore-offbeat npm run build:static
```

Then push the contents of `dist/client` to the `gh-pages` branch.

`BASE_PATH` matters: GitHub Pages serves project sites from `/<repo>`, and
Vite resolves chunk and preload URLs against it. Building without it produces
a site that only works at a domain root.

## Switching to automated deploys

`github-pages-workflow.yml` builds and deploys on every push to `main`. It is
kept here rather than in `.github/workflows/` because pushing workflow files
needs the `workflow` OAuth scope. To enable it:

```bash
gh auth refresh -s workflow
```

```bash
mkdir -p .github/workflows && git mv deploy/github-pages-workflow.yml .github/workflows/deploy-pages.yml
```

Then commit, push, and set Pages to build from GitHub Actions in the
repository settings.

## Note on visibility

This repository is public, so every asset in `public/offbeat/` is publicly
readable. The sign-in screen is a browser-only demo and protects nothing.
`robots.txt` and a `noindex` meta tag keep the site out of search indexes, but
they do not restrict access.
