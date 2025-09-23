// Simple dev mock server plugin extracted for maintainability
// ESM module used by vite.config.js

export function devMockPlugin() {
  function sendJSON(res, obj, status = 200) {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
  }
  function sendText(res, text, status = 200) {
    res.statusCode = status
    res.setHeader('Content-Type', 'text/plain')
    res.end(text)
  }
  // Basic stub data used by multiple endpoints
  const stubState = {
    options: {
      'wifi-on-interval': -1,
      'rcvr-uart-baud': '420000',
      'customised': false,
      'wifi-ssid': 'MockHomeWiFi',
      'fan-runtime': 10,
      'tlm-interval': 200,
      'is-airport': false,
      'airport-uart-baud': '420000',
      'lock-on-first-connection': false,
      'dji-permanently-armed': false,
    },
    config: {
      product_name: 'ELRS Mock Device',
      reg_domain: 'EU868',
      uid: [0, 0, 0, 0, 0, 0],
      uidtype: 'Volatile',
      mode: 'AP',
      ssid: 'ExpressLRS TX',
      modelid: 255,
      'force-tlm': false,
      'serial-protocol': 1,
      'serial1-protocol': 0,
      'sbus-failsafe': 0,
      // Each item must have { config: number, features: number }
      pwm: [
        { config: 0, features: 0 },
        { config: 0, features: 0 },
        { config: 0, features: 0 },
        { config: 0, features: 0 },
      ],
      vbind: '1',
      'button-actions': [
        { color: 0, action: [{ action: 0, count: 0, 'is-long-press': false }] },
        { color: 0, action: [{ action: 0, count: 0, 'is-long-press': false }] },
      ],
      'button-colors': [0, 0],
      'serial-config': {},
    }
  }
  return {
    name: 'vite-dev-mock',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '/'
        const method = (req.method || 'GET').toUpperCase()

        // Utilities to collect request body (json or text)
        const readBody = () => new Promise((resolve) => {
          let data = ''
          req.on('data', (chunk) => { data += chunk })
          req.on('end', () => resolve(data))
        })

        if (method === 'GET' && url === '/config') {
          return sendJSON(res, { options: stubState.options, config: stubState.config })
        }
        if (method === 'GET' && (url === '/networks.json' || url.startsWith('/networks.json'))) {
          return sendJSON(res, ['ExpressLRS TX', 'MockHomeWiFi', 'OfficeNet'])
        }
        if (method === 'POST' && (url === '/options' || url === '/options.json')) {
          return readBody().then(() => sendText(res, 'Options saved'))
        }
        if (method === 'POST' && url === '/config') {
          return readBody().then((body) => {
            try {
              const data = JSON.parse(body || '{}')
              if (data['button-actions']) stubState.config['button-actions'] = data['button-actions']
            } catch (e) {
              // ignore parse errors in mock
            }
            return sendText(res, 'Config saved')
          })
        }
        if (method === 'POST' && url === '/buttons') {
          return readBody().then(() => sendText(res, 'OK'))
        }
        if (method === 'POST' && url === '/reboot') {
          return sendText(res, 'Rebooting...')
        }
        if (method === 'POST' && url === '/forceupdate') {
          return sendText(res, 'Force update scheduled')
        }
        if (method === 'POST' && url === '/import') {
          return sendText(res, 'Import OK')
        }
        if (method === 'POST' && url === '/update') {
          // Treat as file upload; we won’t parse multipart in this mock
          return sendText(res, 'Firmware uploaded')
        }
        next()
      })
    }
  }
}
