# Junjie Xie — Personal Academic Homepage

A minimal, responsive academic homepage designed for GitHub Pages. The résumé content is rendered directly as HTML; no local CV/PDF is published.

## Preview locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Publish on GitHub Pages

1. Create a public repository named `<your-github-username>.github.io`.
2. Push every file in this folder to the repository's `main` branch.
3. In **Settings → Pages**, select **Deploy from a branch**, `main`, and `/ (root)`.
4. Visit `https://<your-github-username>.github.io`.

## Edit content

- Main page and links: `index.html`
- Colors and layout: `styles.css`
- Original color portrait: `profile.jpg`

The repository includes `.nojekyll`, so GitHub Pages serves these static files directly.
