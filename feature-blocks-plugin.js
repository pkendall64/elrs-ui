// HTML Feature Blocks Vite plugin extracted for reuse/maintenance
// Enables conditional inclusion of HTML sections delimited by
// <!-- FEATURE:NAME --> ... <!-- /FEATURE:NAME --> markers.
// Usage: import { htmlFeatureBlocksPlugin } from './feature-blocks-plugin.js'
// and register in Vite plugins with the current env passed into the factory.

// Simple boolean coercion for env strings
function toBoolEnv(v, def) {
  if (v === undefined || v === null || v === '') return def
  const s = String(v).trim().toLowerCase()
  return s === '1' || s === 'true' || s === 'yes' || s === 'on' || s === 'y'
}

export function htmlFeatureBlocksPlugin(env) {
  function normalizeName(name) {
    return String(name).trim().replace(/[^A-Za-z0-9]+/g, '_').toUpperCase()
  }
  function parseRawName(raw) {
    let s = String(raw).trim()
    let invert = false
    if (/^NOT\b/i.test(s)) {
      invert = true
      s = s.replace(/^NOT\b\s*/i, '')
    }
    if (s.startsWith('!')) {
      invert = true
      s = s.replace(/^!+\s*/, '')
    }
    return { name: s, invert }
  }
  function getFlagForName(name, defaultValue) {
    const key = normalizeName(name)
    const v = env[`VITE_FEATURE_HTML_${key}`] ?? env[`VITE_FEATURE_${key}`]
    return toBoolEnv(v, defaultValue)
  }
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return {
    name: 'html-feature-blocks',
    transformIndexHtml(html) {
      const re = /<!--\s*FEATURE:([\w\-.:\s]+)\s*-->[\s\S]*?<!--\s*\/FEATURE:\1\s*-->/gi
      return html.replace(re, (match, rawName) => {
        const { name, invert } = parseRawName(rawName)
        const flag = getFlagForName(name, false)
        const keep = invert ? !flag : flag
        if (!keep) return ''
        // Strip the markers but keep inner content when enabled
        const esc = escapeRegExp(rawName)
        const open = new RegExp(`<!--\\s*FEATURE:${esc}\\s*-->`, 'gi')
        const close = new RegExp(`<!--\\s*\\/FEATURE:${esc}\\s*-->`, 'gi')
        return match.replace(open, '').replace(close, '')
      })
    },
  }
}
