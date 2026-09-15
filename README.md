# Donut × TOKEN2049 Singapore Sponsorship Site

Static website prepared for GitHub and Cloudflare Pages.

## Upload to GitHub

1. Extract the ZIP.
2. Open your empty GitHub repository.
3. Select **Add file → Upload files**.
4. Upload everything inside the extracted folder, including the `assets` folder.
5. Commit the files to the `main` branch.

`index.html` must remain at the repository root.

## Cloudflare Pages settings

- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `.`
- Root directory: leave blank

Cloudflare will redeploy automatically whenever changes are committed to `main`.

## Important launch note

The sponsorship form is currently a front-end prototype and does not save or email submissions. Connect a secure form endpoint and server-side inventory validation before accepting live claims.
