# Leave a Tree

One-page site for the Dream Team seed money challenge. Next.js (App Router), exported as a static site: no backend, free hosting.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to /out
```

## Before launch: payment links

All links and prices live in `lib/site.ts`. Until a link is filled in, its button shows a notice instead of opening checkout.

In Stripe (Payment Links), create:

| Link | Price | Key in `lib/site.ts` |
|---|---|---|
| Seedling | €15 | `seedling` |
| Heritage | €35 | `heritage` |
| Legacy | €65 | `legacy` |
| Growth updates, monthly (recurring) | €3 / month | `monthly` |
| Growth updates, yearly (recurring) | €29 / year | `yearly` |
| Gift versions (optional) | €20 / €40 / €70 | `seedlingGift`, `heritageGift`, `legacyGift` |

For each tree link:
- Add a required custom field: text, label "Name on the tag".
- Gift links: add a second custom field "Recipient name and email".
- After payment: "Don't show confirmation page", redirect to
  `https://<your-site>/thanks/?tier=heritage` (use the tier id; add `&gift=1` on gift links).

For the subscription links redirect to `https://<your-site>/thanks/?plan=monthly` or `?plan=yearly`.

Choosing a tier opens an order form (name on tag, email, dedication, gift). It doesn't save anything yet: on submit it opens the tier's payment link (the gift link if gift is ticked and set), or goes straight to `/thanks/` when no link is set.

## Deploy (free)

- **Vercel:** import the repo, no settings needed.
- Elsewhere (or on a custom domain), set the env var `NEXT_PUBLIC_SITE_URL=https://your-domain` before building, so link previews point at the right share image.
- **Netlify:** build command `npm run build`, publish directory `out`.
- **GitHub Pages:** run `npm run build` and publish the `out` folder. If the site lives at `user.github.io/repo`, set `basePath: "/repo"` in `next.config.ts`.

## During the challenge

Update the numbers in `ledger` (`lib/site.ts`) as trees go in and orders come in, then redeploy.

## Where things are

- `lib/site.ts`: payment links, prices, ledger numbers, sponsor name, team
- `public/team/`: team photos (square, ~480px)
- `app/icon.svg`, `app/apple-icon.png`, `app/opengraph-image.png`: favicon, home-screen icon, link preview image
- `components/Landing.tsx`: all page sections
- `components/Tag.tsx`: the plain / wood / metal tag preview
- `app/thanks/page.tsx`: confirmation page after payment
- `app/globals.css`: colours, fonts and styles (paper, forest ink, sun)
- `components/Stamp.tsx`: the "Seed-funded by Tomorrow University" stamp
