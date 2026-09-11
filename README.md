# KIWI-biolab

A static Eleventy website for [kiwi-biolab.org](https://kiwi-biolab.org), preserving the nine original KIWI-biolab pages with a modern, responsive presentation.

## Run locally

Use Node.js 24 (the CI version) and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:8080`. Run `npm run check` to build and validate the site. `npm run build` generates `_site/`. All public pages are ordinary HTML; there is no runtime backend.

## Edit content on GitHub

Open a file, choose **Edit**, preview the change and commit it (or open a pull request). A merge into `main` runs validation and publishes the new build.

| Content | File or directory |
| --- | --- |
| Contact, privacy | `src/content/*.md` — Markdown with YAML front matter |
| Homepage, research and other page layouts | `src/*.njk` |
| News, events, talks | `src/_data/news.json`, `events.json`, `talks.json` |
| Team and historical partner roster | `src/_data/team.json`, `partners.json` |
| Publications | `src/_data/publications.json` |
| Research projects and original task forces | `src/_data/projects.json`, `taskForces.json` |
| Navigation, contact details, domain and logo | `src/_data/site.json` |
| Photographs and logos | `src/assets/images/` |
| Source references and image credits | `src/_data/sources.json`, `assetCredits.json` |

### Add news, an event or a talk

Copy an entry in its JSON file and give it a unique, lowercase `id`. Set `title`, `dateLabel`, `year`, `summary`, `body`, `source`, and `verifiedAt`. `body` accepts simple HTML such as paragraphs, lists, emphasis and links. Escape double quotes inside JSON strings. Keep entries in date order, newest first; the displayed order follows the file.

An image is optional. Set `image` to `/assets/images/your-file.jpg`, provide `imageAlt`, and record the source and credit in `assetCredits.json`. Use genuine source images or owner-supplied assets. Do not add generated images.

Set `historical: true` for original project-archive material, and preserve `originalAnchor` when editing migrated entries. The automatically derived year filters include `Undated` when the source does not establish a year. Do not invent a date. Remove old meeting credentials and expired registration links.

### Add a publication

Copy a record in `publications.json`; use a unique `id`, category `type`, `year`, HTML `citation`, plain-text `searchText`, `doi` (without the `https://doi.org/` prefix), institutional `source`, and `verifiedAt`. The original categories are **Journal articles**, **Book chapters**, and **Conferences**. DOI values must be unique. Keep any preprint/submitted designation until an official source establishes the publication status.

### Contact and sources

Write all email addresses with `[at]`, including addresses inside archived descriptions. Do not add `mailto:` links. The site has no contact form, analytics, cookies, remote fonts, or automatically loaded third-party widgets. The virtual lab tour and social pages are ordinary external links.

Record factual changes and their institutional sources. A page's retrieval date is not its publication date. Preserve uncertain project statuses without claiming that work is active or completed. Historical team membership does not establish a current role.

## GitHub Pages

The workflow `.github/workflows/pages.yml` validates pull requests and publishes successful builds from `main`. In repository **Settings → Pages**, select **GitHub Actions** as the build source. Retain the existing custom domain **kiwi-biolab.org** and its DNS settings. The `CNAME` and `.nojekyll` files are copied into the deployment artifact.

The implementation does not change repository settings or DNS. Publishing requires the workflow to run after these changes are pushed. Revert the relevant commit to roll back a content or code change and let the workflow rebuild.

## Content provenance

`src/_data/sources.json` records source precedence and unresolved source discrepancies. `/sources/` displays content sources and image credits. Archived content was recovered from the supplied January 2026 Wayback entry point, with child captures from December 2025 and January 2026. Current additions are based on TU Berlin's public pages, including its April 2026 lab announcement. The linked Zotero group has no entries dated later than 2023.

The green KIWI-biolab logo was supplied by the owner. It is used unchanged. Fonts are served locally from the Inter package (SIL Open Font License).

89 source image files were recovered. Eleven unavailable archive assets (two microscopy figures, two network logos and seven older seminar portraits) returned 404 from both the archive and original host. Their text content is retained; no replacement images were invented.
