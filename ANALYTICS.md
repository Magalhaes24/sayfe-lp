# Analytics (first-party, consent-gated)

Nothing is stored or sent until the visitor presses Accept. GPC / Do Not Track counts as Decline.

| Piece | File |
| --- | --- |
| Consent state, GPC/DNT, withdraw | `src/analytics/consent.js` |
| Tracker (events, heatmap data, vitals) | `src/analytics/tracker.js` |
| Route page views | `src/analytics/Analytics.js` |
| Banner and policy | `src/components/ConsentBanner.js`, `src/pages/Privacy.js` |
| Dashboard (`/admin/analytics`) | `src/pages/AdminAnalytics.js`, `analyticsAggregate.js` |
| Storage rules | `firestore.rules` (`analytics_batches`) |

## Deploy checklist

1. `firebase deploy --only firestore:rules`
2. Turn on the retention policy (records vanish after ~13 months):
   `gcloud firestore fields ttls update expireAt --collection-group=analytics_batches --enable-ttl`
3. Recommended: enable Firebase App Check for Firestore so only your site can write.
4. Fill in the legal entity / contact details in `src/pages/Privacy.js`.

## Testing without writing data

In the browser console, `sessionStorage.setItem("ac_dry", "1")`, reload, accept the banner. Events then
land in `window.__acSent` instead of Firestore.

## Custom events

```js
import { trackEvent } from "../analytics/tracker";
trackEvent("waitlist_joined", { source: "hero" });
```

Add `data-track="name"` to any link or button to give it a stable name in the dashboard.

Opening `/admin/analytics` marks that browser as "owner" (`ac_ignore`) so your own visits are not counted.
