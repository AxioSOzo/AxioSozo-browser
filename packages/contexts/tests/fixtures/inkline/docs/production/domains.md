# Production domains

Configured in `vercel.json` and the Convex dashboard. Keep this table current.

| Host | Purpose | Served by |
| --- | --- | --- |
| `inkline.studio` | Marketing site | Vercel |
| `app.inkline.studio` | Customer web app | Vercel |
| `docs.inkline.studio` | Documentation | Vercel |
| `dashboard.inkline.studio` | Admin dashboard | Vercel |
| `api.inkline.studio` | Public API | Vercel → Convex HTTP actions |
| `realtime.inkline.studio` | Live sync | Convex |
| `*.inkline.studio` | Preview wildcard (not a product host) | Vercel |

Backends behind them: `inkline-prod.convex.cloud`, `inkline-prod.convex.site` and
`inkline.vercel.app`. Billing lives at https://dashboard.stripe.com/ and the status
page check uses `10.0.0.12` internally. See https://docs.convex.dev/production for
the deploy runbook and `apps/web/convex/http.ts` for the routes.
