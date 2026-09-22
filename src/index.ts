/**
 * Shared entry point.
 *
 * Most projects import the integration that matches their build tool:
 *
 *   import statable from 'statable-analytics/astro'
 *   import statable from 'statable-analytics/vite'
 *
 * This module exposes the pieces both are built from, for anything that needs
 * the tag itself.
 */

export { renderScript, resolveScript } from './options.js'
export type { ScriptTag, StatableOptions } from './options.js'
