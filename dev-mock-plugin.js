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
        "uid": [1,2,3,4,5,6],   // this is the 'flashed' UID and may be empty if using traditional binding on an RX.
        "tlm-interval": 240,
        "fan-runtime": 30,
        "no-sync-on-arm": false,
        "uart-inverted": true,
        "unlock-higher-power": false,
        "is-airport": true,
        "rcvr-uart-baud": 420000,
        "rcvr-invert-tx": false,
        "lock-on-first-connection": true,
        "domain": 1,
        "wifi-on-interval": 60,
        "wifi-password": "w1f1-pAssw0rd",
        "wifi-ssid": "network-ssid"
    },
    config: {
      product_name: 'ELRS Mock Device',
      reg_domain: 'EU868',
      uid: [5,4,3,2,1,0],  // current UID
      uidtype: 'Flashed',
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
        { color: 255, action: [{ action: 1, count: 2, 'is-long-press': false }] },
        { color: 0, action: [{ action: 2, count: 3, 'is-long-press': true }] },
      ],
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
        // CW page mock endpoints
        if (url === '/cw' && method === 'GET') {
          return sendJSON(res, { center: 915000000, center2: 2440000000, radios: 2 })
        }
        if (url === '/cw' && method === 'POST') {
          return sendText(res, 'CW started')
        }
        // LR1121 page mock endpoints
        if (method === 'GET' && url === '/lr1121.json') {
          return sendJSON(res, {
            manual: false,
            radio1: { type: 0xA1, hardware: 0x01, firmware: 0x0102 },
            radio2: { type: 0xA1, hardware: 0x02, firmware: 0x0102 }
          })
        }
        if (method === 'POST' && url.startsWith('/lr1121')) {
          // treat as file upload; ignore body
          return sendJSON(res, { status: 'ok', msg: 'LR1121 firmware flashed successfully (mock). Reboot device to take effect.' })
        }
        if (method === 'POST' && url.startsWith('/reset')) {
          // e.g. /reset?lr1121
          return sendText(res, 'Custom firmware flag cleared, rebooting...')
        }
        // Hardware page mock endpoints
        if (url === '/hardware.json' && method === 'GET') {
          return sendJSON(res, {
            customised: true,
            chipselect: '',
            oled_scl: '',
            oled_sda: '',
            oled_vbat: false,
            ch3_lna: false,
            gps_rx: '',
            gps_tx: '',
            gps_baud: '9600',
            backled_r: '',
            backled_g: '',
            backled_b: '',
            led_blue: '',
            led_red: '',
            led_green: '',
            usb_vcp_alt: false,
            serial_rx: '',
            serial_tx: '',
            serial2_rx: '',
            serial2_tx: '',
            debugback: false,
            debug_backpack_rx: '',
            debug_backpack_tx: '',
            debug_backpack_baud: '460800',
            use_backpack: false,
            backpack_boot: '',
            backpack_en: '',
            passthrough_baud: '',
            i2c_scl: '',
            i2c_sda: '',
            misc_fan_en: '',
            misc_fan_pwm: '',
            misc_fan_speeds: [],
            misc_fan_tacho: '',
            gsensor_stk8xxx: false,
            misc_gsensor_int: '',
            thermal_lm75a: false,
            pwm_outputs: [],
            vbat: '',
            vbat_offset: '',
            vbat_scale: '',
            vbat_atten: '-1',
            vtx_amp_pwm: '',
            vtx_amp_vpd: '',
            vtx_amp_vref: '',
            vtx_nss: '',
            vtx_sck: '',
            vtx_miso: '',
            vtx_mosi: '',
            vtx_amp_vpd_25mW: [],
            vtx_amp_vpd_100mW: [],
            vtx_amp_pwm_25mW: [],
            vtx_amp_pwm_100mW: []
          })
        }
        if (url === '/hardware.json' && method === 'POST') {
          return readBody().then(() => sendText(res, 'Hardware config saved'))
        }
        next()
      })
    }
  }
}
