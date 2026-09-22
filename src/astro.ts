import type { AstroIntegration } from 'astro'
import type { StatableOptions } from './options.js'
import { resolveScript } from './options.js'

export interface StatableAstroOptions extends StatableOptions {
  /**
   * Also load the tracker during `astro dev`.
   *
   * Off by default so local runs stay out of the stats.
   *
   * @default false
   */
  dev?: boolean
}

/**
 * Builds the inline bootstrap that appends the tracker to <head>.
 *
 * Attributes are set through setAttribute rather than an HTML string, so values
 * never need escaping and cannot break out of the tag.
 */
function bootstrap(src: string, attrs: Record<string, string>): string {
  const lines = Object.entries(attrs)
    .map(([name, value]) => `  s.setAttribute(${JSON.stringify(name)}, ${JSON.stringify(value)});`)
    .join('\n')
  return [
    '(function () {',
    '  var s = document.createElement("script");',
    `  s.src = ${JSON.stringify(src)};`,
    '  s.defer = true;',
    lines,
    '  document.head.appendChild(s);',
    '})();',
  ].filter(Boolean).join('\n')
}

/**
 * Adds the Statable tracker to every page of an Astro site.
 *
 * @example
 * // astro.config.mjs
 * import { defineConfig } from 'astro/config'
 * import statable from 'statable-analytics/astro'
 *
 * export default defineConfig({
 *   integrations: [statable({ siteId: '3270462' })],
 * })
 */
export default function statable(options: StatableAstroOptions): AstroIntegration {
  return {
    name: 'statable-analytics',
    hooks: {
      'astro:config:setup': ({ command, injectScript, logger }) => {
        if (options.disabled) {
          logger.info('disabled, tracker not injected')
          return
        }
        if (command === 'dev' && !options.dev) {
          logger.info('skipped in dev, pass dev: true to load it here as well')
          return
        }
        const { src, attrs } = resolveScript(options)
        injectScript('head-inline', bootstrap(src, attrs))
      },
    },
  }
}

export type { StatableOptions }
