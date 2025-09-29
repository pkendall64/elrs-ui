import {html, LitElement} from 'lit'
import './elrs-logo.js'

// Render into light DOM so existing global CSS (MUI) applies and IDs are accessible
export class ElrsHeader extends LitElement {
    createRenderRoot() {
        return this
    }

    render() {
        return html`
<header class="mui-appbar mui--z1 mui--text-center elrs-header">
  <elrs-logo></elrs-logo>
  <h1><b>ExpressLRS</b></h1>
  <span id="product_name"></span><br/>
  <b>Firmware Rev. </b>@@{VERSION} <span id="reg_domain"></span>
</header>`
    }
}

customElements.define('elrs-header', ElrsHeader)
