# statable-analytics

Add [Statable](https://statable.com) to an Astro or Vite site with one line of config.

Statable is privacy-first web analytics: no cookies, no consent banner for your
analytics, data stored in the EU. The package ships the integration only. It has
no runtime dependencies and adds a single deferred `<script>` to your pages.

## Install

```bash
npm install statable-analytics
```

You need a numeric Site ID. Find it in Statable under
**Site settings → Tracking Code**.

## Astro

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import statable from 'statable-analytics/astro'

export default defineConfig({
  integrations: [statable({ siteId: '3270462' })],
})
```

## Vite

```js
// vite.config.js
import { defineConfig } from 'vite'
import statable from 'statable-analytics/vite'

export default defineConfig({
  plugins: [statable({ siteId: '3270462' })],
})
```

Works with any Vite project that builds an HTML entry, including React, Vue,
Svelte and Solid templates.

## Options

| Option | Type | Default | What it does |
|---|---|---|---|
| `siteId` | `string \| number` | required | Numeric Site ID from Site settings |
| `host` | `string` | `https://statable.com` | Origin the tracker is served from. Change it only when you proxy the script through your own domain |
| `trackingApi` | `string` | `<host>/api/event` | Override the ingest endpoint |
| `beforeSend` | `string` | none | Name of a global function that may adjust custom props before an event is sent |
| `props` | `Record<string, string \| number \| boolean>` | none | Sticky custom properties added to every event from a page load |
| `dev` | `boolean` | `false` | Also load the tracker in the dev server |
| `disabled` | `boolean` | `false` | Skip injection entirely |

Local runs stay out of your stats by default. Pass `dev: true` when you want to
check the tracker while developing.

### Custom properties

```js
statable({
  siteId: '3270462',
  props: { env: 'production', plan: 'pro' },
})
```

Each entry becomes a `data-statable-<key>` attribute, so keys must be
alphanumeric with dashes.

### Serving the tracker from your own domain

```js
statable({
  siteId: '3270462',
  host: 'https://stats.example.com',
  trackingApi: 'https://stats.example.com/api/event',
})
```

## Custom events

The tracker exposes `window.statable.t(event, props)` once it has loaded. Guard
the call, because the script is deferred:

```js
window.statable?.t('signup', { plan: 'pro' })
```

See the [JavaScript API](https://statable.com/docs/developers/javascript-api/)
for the full reference.

## Documentation

- [Astro](https://statable.com/docs/install/astro/)
- [Vite](https://statable.com/docs/install/vite/)
- [Tracking script reference](https://statable.com/docs/developers/tracking-script/)

## Licence

MIT © [Key Arg B.V.](https://statable.com)
