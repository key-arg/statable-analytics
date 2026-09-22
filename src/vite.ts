import type { Plugin } from 'vite'
import type { StatableOptions } from './options.js'
import { resolveScript } from './options.js'

export interface StatableViteOptions extends StatableOptions {
  /**
   * Also inject during `vite dev`.
   *
   * Off by default so local runs stay out of the stats.
   *
   * @default false
   */
  dev?: boolean
}

/**
 * Injects the Statable tracker into every HTML entry Vite serves or builds.
 *
 * The tag is added through transformIndexHtml, so it lands in <head> of the
 * finished HTML and is never processed as an application module.
 *
 * @example
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import statable from 'statable-analytics/vite'
 *
 * export default defineConfig({
 *   plugins: [statable({ siteId: '3270462' })],
 * })
 */
export default function statable(options: StatableViteOptions): Plugin {
  let isDev = false

  return {
    name: 'statable-analytics',
    // Resolve early so a bad siteId fails the config, not the page.
    configResolved(config) {
      isDev = config.command === 'serve'
      if (!options.disabled)
        resolveScript(options)
    },
    transformIndexHtml: {
      order: 'post',
      handler() {
        if (options.disabled || (isDev && !options.dev))
          return
        return [{
          tag: 'script',
          injectTo: 'head',
          attrs: scriptAttrs(options),
        }]
      },
    },
  }
}

function scriptAttrs(options: StatableOptions): Record<string, string | boolean> {
  const { src, attrs } = resolveScript(options)
  return { defer: true, src, ...attrs }
}

export type { StatableOptions }
