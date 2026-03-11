# Professional Card for GitHub Pages

Edit `content/site.yaml` and build the static QR card page into `docs/`.

## Usage

1. Run `npm install` once.
2. Edit `content/site.yaml`.
3. Run `npm run build`.
4. Commit `docs/` and push to `main`.
5. In GitHub Pages settings, choose `GitHub Actions` as the source.

## Content Rules

- `links[].url` is required.
- `name`, `description`, and `icon` are optional.
- Missing labels are supplemented from page metadata or the domain when possible.
- `availableLanguages` supports `ko` and `en`.

## Icons

- Manual icons: `mail`, `file`, `globe`
- Without `icon`, web links use a favicon, `mailto:` uses the mail icon, and document links use the file icon.
