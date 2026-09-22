/**
 * Shared option handling for the Astro integration and the Vite plugin.
 *
 * Both entry points do the same small job: turn a typed options object into the
 * attributes of a single <script> tag. Keeping that in one place means the two
 * integrations cannot drift apart.
 */

export interface StatableOptions {
  /**
   * Numeric Site ID from Site settings -> Tracking Code.
   *
   * The tracker reads the ID from the URL path, so no data-id attribute is
   * needed.
   */
  siteId: string | number

  /**
   * Origin the tracker is served from.
   *
   * Change this only when you serve the script through your own domain.
   *
   * @default 'https://statable.com'
   */
  host?: string

  /**
   * Override the ingest endpoint, for a proxy or a self-hosted collector.
   *
   * Maps to data-tracking-api. Defaults to <script-origin>/api/event.
   */
  trackingApi?: string

  /**
   * Name of a global function that may mutate custom props before each event is
   * sent. Maps to data-before-send.
   */
  beforeSend?: string

  /**
   * Sticky custom properties attached to every event from a page load.
   *
   * Each entry becomes a data-statable-<key> attribute, so keys must be usable
   * in an attribute name.
   */
  props?: Record<string, string | number | boolean>

  /**
   * Skip injecting the tracker. Handy for keeping local runs out of the stats
   * without deleting the config.
   *
   * @default false
   */
  disabled?: boolean
}

export interface ScriptTag {
  src: string
  attrs: Record<string, string>
}

const DEFAULT_HOST = 'https://statable.com'

/** Attribute keys are lowercased and restricted to what HTML accepts unquoted. */
const PROP_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function normaliseHost(host: string): string {
  const trimmed = host.trim().replace(/\/+$/, '')
  if (!/^https?:\/\//.test(trimmed))
    throw new Error(`[statable] "host" must start with http:// or https://, got ${JSON.stringify(host)}`)
  return trimmed
}

export function resolveScript(options: StatableOptions): ScriptTag {
  const siteId = String(options.siteId ?? '').trim()
  if (!siteId)
    throw new Error('[statable] "siteId" is required. Find it in Site settings -> Tracking Code.')
  if (!/^[a-zA-Z0-9]+$/.test(siteId))
    throw new Error(`[statable] "siteId" must be alphanumeric, got ${JSON.stringify(options.siteId)}`)

  const host = normaliseHost(options.host ?? DEFAULT_HOST)
  const attrs: Record<string, string> = {}

  if (options.trackingApi)
    attrs['data-tracking-api'] = options.trackingApi
  if (options.beforeSend)
    attrs['data-before-send'] = options.beforeSend

  for (const [key, value] of Object.entries(options.props ?? {})) {
    const name = key.toLowerCase()
    if (!PROP_KEY.test(name))
      throw new Error(`[statable] props key ${JSON.stringify(key)} must be alphanumeric with dashes`)
    attrs[`data-statable-${name}`] = String(value)
  }

  return { src: `${host}/js/${siteId}/s.js`, attrs }
}

/** Serialises a tag for raw HTML injection. Values are attribute-escaped. */
export function renderScript(tag: ScriptTag): string {
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  const attrs = Object.entries(tag.attrs)
    .map(([name, value]) => ` ${name}="${escape(value)}"`)
    .join('')
  return `<script defer src="${escape(tag.src)}"${attrs}></script>`
}
