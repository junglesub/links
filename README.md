# Professional Card for GitHub Pages

QR card page generator for GitHub Pages.

Edit `content/site.yaml`, then build a static output into `docs/`.
GitHub Pages is deployed through GitHub Actions, so source files are committed and the site is built in CI.

## Usage

1. Run `npm install` once.
2. Edit `content/site.yaml`.
3. Run `npm run build` for a local preview build.
4. Commit source files and push to `main`.
5. In GitHub Pages settings, choose `GitHub Actions` as the source.

## Deployment Notes

- `docs/` is generated output and is ignored by Git.
- GitHub Actions builds `docs/` and uploads it as the Pages artifact.
- `docs/robots.txt` is intentionally tracked because the deployed site must always ship the crawl policy.
- Do not rely on manually editing files inside `docs/` for permanent changes.

## Content Rules

- `links[].url` is required.
- `name`, `description`, and `icon` are optional.
- Missing labels are supplemented from page metadata or the domain when possible.
- If a link should intentionally have no description, set `description: ""`.
- `availableLanguages` supports `ko` and `en`.
- `defaultLanguage` controls prerendered HTML and OG language when set to `ko` or `en`.

## Theme and Language Behavior

- Theme defaults to the saved user choice when available.
- Without a saved choice, theme falls back to the device color scheme.
- Language defaults to the saved user choice when available.
- Without a saved choice, language falls back to browser language, then to the configured fallback language.
- Initial page boot uses a short loading overlay to avoid theme and language flicker.

## Icons

- Manual icons: `mail`, `file`, `globe`
- Without `icon`, web links use a favicon, `mailto:` uses the mail icon, and document links use the file icon.

## Build Output

- `docs/index.html`
- `docs/assets/styles.css`
- `docs/assets/app.js`
- `docs/assets/og-image.png`
- `docs/robots.txt`
