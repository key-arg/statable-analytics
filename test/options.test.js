import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderScript, resolveScript } from '../dist/index.js'

test('builds the tracker URL from the site ID', () => {
  const { src, attrs } = resolveScript({ siteId: '3270462' })
  assert.equal(src, 'https://statable.com/js/3270462/s.js')
  assert.deepEqual(attrs, {})
})

test('accepts a numeric site ID', () => {
  assert.equal(resolveScript({ siteId: 3270462 }).src, 'https://statable.com/js/3270462/s.js')
})

test('rejects a missing site ID', () => {
  assert.throws(() => resolveScript({}), /siteId" is required/)
  assert.throws(() => resolveScript({ siteId: '  ' }), /siteId" is required/)
})

test('rejects a site ID that could alter the path', () => {
  assert.throws(() => resolveScript({ siteId: '../evil' }), /alphanumeric/)
  assert.throws(() => resolveScript({ siteId: '1/2' }), /alphanumeric/)
})

test('trims a trailing slash from the host', () => {
  const { src } = resolveScript({ siteId: '1', host: 'https://stats.example.com/' })
  assert.equal(src, 'https://stats.example.com/js/1/s.js')
})

test('requires an absolute host', () => {
  assert.throws(() => resolveScript({ siteId: '1', host: 'stats.example.com' }), /must start with http/)
})

test('maps the optional attributes', () => {
  const { attrs } = resolveScript({
    siteId: '1',
    trackingApi: 'https://example.com/proxy/event',
    beforeSend: 'statableEnrich',
  })
  assert.deepEqual(attrs, {
    'data-tracking-api': 'https://example.com/proxy/event',
    'data-before-send': 'statableEnrich',
  })
})

test('turns props into sticky data attributes', () => {
  const { attrs } = resolveScript({ siteId: '1', props: { cohort: 'beta', Env: 'production', build: 42 } })
  assert.deepEqual(attrs, {
    'data-statable-cohort': 'beta',
    'data-statable-env': 'production',
    'data-statable-build': '42',
  })
})

test('rejects a prop key that is not attribute-safe', () => {
  assert.throws(() => resolveScript({ siteId: '1', props: { 'a b': 'x' } }), /alphanumeric with dashes/)
  assert.throws(() => resolveScript({ siteId: '1', props: { 'a"b': 'x' } }), /alphanumeric with dashes/)
})

test('renders a deferred script tag', () => {
  const html = renderScript(resolveScript({ siteId: '3270462' }))
  assert.equal(html, '<script defer src="https://statable.com/js/3270462/s.js"></script>')
})

test('escapes attribute values when rendering', () => {
  const html = renderScript(resolveScript({ siteId: '1', props: { q: 'a"b&c' } }))
  assert.ok(html.includes('data-statable-q="a&quot;b&amp;c"'))
  assert.ok(!html.includes('a"b'))
})
