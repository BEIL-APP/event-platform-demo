# AWS Amplify Migration Runbook

This project is a static Vite + React SPA. There is no backend runtime, and all demo data lives in `localStorage`.

## Target architecture

- Frontend hosting: AWS Amplify Hosting
- CDN / HTTPS: Managed by Amplify
- Custom domain: Route 53 or external registrar such as Gabia
- Build artifact: `dist/`

This is the fastest AWS migration path for the current codebase. Moving to ECS, Lambda, or a custom S3 + CloudFront stack would add operational complexity without improving the current product.

## Why Amplify fits this repo

- `vite build` produces a static bundle.
- The app uses `BrowserRouter`, so it only needs SPA rewrite handling.
- There is no server-side rendering, API runtime, or database.
- The existing Vercel rewrite behavior can be replaced with one Amplify rewrite rule.

## One-time setup

1. Push the repository to GitHub if Amplify will connect directly to the repo.
2. In AWS, create an Amplify app and connect the repository branch.
3. Amplify will detect the included `amplify.yml` and use it for build/deploy.
4. After the first deploy, add the SPA rewrite rule in Amplify Hosting.

## Required Amplify rewrite rule

Add this rule in Amplify Console > Hosting > Rewrites and redirects:

| Source address | Target address | Type |
| --- | --- | --- |
| `/<*>` | `/index.html` | `200 (Rewrite)` |

This preserves direct access and browser refresh for routes such as:

- `/explore`
- `/scan/:boothId`
- `/admin/dashboard`

Without this rule, deep links will return a 404.

## Custom domain cutover

### Option A: Keep Gabia as registrar

1. Buy the domain in Gabia.
2. In Amplify, add the custom domain.
3. Copy the DNS records that Amplify provides.
4. Add those records in Gabia DNS.
5. Wait for certificate validation and DNS propagation.

### Option B: Use Route 53

1. Transfer or register the domain in Route 53.
2. Add the domain in Amplify.
3. Let Amplify manage the records automatically.

For a fast launch, Option A is usually enough.

## Recommended domain structure

- Main site: `www.yourbrand.com`
- Apex redirect: `yourbrand.com` -> `www.yourbrand.com`
- If you want a demo-only hostname: `demo.yourbrand.com`

## Suggested migration sequence

1. Keep the current Vercel deployment alive.
2. Deploy the same branch to Amplify.
3. Verify the AWS URL before changing DNS.
4. Connect the custom domain to Amplify.
5. Switch mail, pitch deck, and outreach links to the custom domain.
6. Remove Vercel only after DNS and HTTPS are stable.

## Verification checklist

- Landing page loads on the Amplify domain.
- Refresh works on `/explore`.
- Refresh works on `/admin/dashboard`.
- Static assets under `/assets/*` load without 403 or 404.
- Logo files under `public/` render correctly.
- Mobile layout matches the Vercel build.
- Browser tab title and OG metadata are acceptable for outreach.

## Repo-specific notes

- Current Vercel routing is defined in [`vercel.json`](/Users/wonyong/Desktop/myproject/b2b-event-platform-demo/vercel.json).
- Current build command is defined in [`package.json`](/Users/wonyong/Desktop/myproject/b2b-event-platform-demo/package.json).
- The app uses `BrowserRouter` in [`src/App.tsx`](/Users/wonyong/Desktop/myproject/b2b-event-platform-demo/src/App.tsx), which is why the rewrite rule is mandatory.

## Later upgrades

When this demo becomes a real service, revisit the architecture if any of these appear:

- real authentication
- API server
- database
- file uploads
- SSR or SEO-critical content

At that point, the frontend can still stay on Amplify while backend services move to API Gateway, Lambda, ECS, or another AWS stack.
