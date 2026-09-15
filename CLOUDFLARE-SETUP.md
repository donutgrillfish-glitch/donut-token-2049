# TOKEN2049 live reservation setup

This update adds global inventory, 15-minute reservations, Basin forwarding and a private admin page.

## 1. Upload the files

Copy every file and folder from this package into the root of the GitHub repository. Keep the `functions` folder structure exactly as provided. Existing `index.html`, `script.js` and `theme.css` must be replaced.

## 2. Create the database

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages → D1 SQL Database → Create database**.
3. Name it `donut-token-2049-spots`.
4. Open its **Console**.
5. Copy all of `schema.sql`, paste it into the console and execute it.

## 3. Bind the database to the Pages project

1. Open **Workers & Pages → donut-token-2049 → Settings → Bindings**.
2. Add a **D1 database binding**.
3. Variable name must be exactly `SPOTS_DB`.
4. Select `donut-token-2049-spots`.
5. Save.

## 4. Create the private admin token

1. In the same Pages project, open **Settings → Variables and Secrets**.
2. Add an encrypted secret named exactly `ADMIN_TOKEN`.
3. Use a long unique password (at least 24 random characters).
4. Save it somewhere private. Never add it to GitHub.

Optional: add a text variable named `BASIN_ENDPOINT` with the existing Basin endpoint. The code already contains the current endpoint, so this is not required.

## 5. Redeploy

Open **Deployments** and retry the latest deployment, or commit a small GitHub change. Bindings and secrets take effect after a new deployment.

## 6. Test

1. Open the public website in one normal window and one incognito window.
2. Reserve a spot in the first window.
3. Confirm the second window shows it as **RESERVED** and cannot open it.
4. Submit a clearly labelled test claim.
5. Confirm it appears in Basin and changes to **PENDING** publicly.
6. Open `/admin.html` on the live domain.
7. Enter the private admin token.
8. Mark the test **SOLD**, then confirm the public site displays SOLD.
9. Use **Reopen** to return a fake or rejected claim to AVAILABLE.

## Status rules

- **AVAILABLE**: anyone can reserve it.
- **RESERVED**: held for one visitor for 15 minutes.
- **PENDING**: form and transaction received; waiting for manual verification.
- **SOLD**: manually approved by the admin.

Do not mark a claim SOLD until the transaction network, receiving wallet, USDC token, amount and confirmation status all match.
