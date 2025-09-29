import '../assets/mui.js';
import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";

@customElement('wifi-panel')
class WifiPanel extends LitElement {
    createRenderRoot() { return this; }

    render() {
        return html`
            <div class="mui-panel mui--text-title">WiFi Configuration</div>
      <div class="mui-panel">
        <h2 id="apmode" style="display:none;">Currently in Access Point mode</h2>
        <h2 id="stamode" style="display:none;">Current Home network: <span id="ssid"></span></h2>
        <p>
        Here you can join a network and it will be saved as your Home network. When you enable WiFi in range of your Home network,
        ExpressLRS will automatically connect to it. In Access Point (AP) mode, the network name is ExpressLRS TX or ExpressLRS RX
        with password "expresslrs".
        </p>
        <form id="sethome" method="POST" autocomplete="off" class="mui-form">
          <div class="mui-radio">
            <input type="radio" id="nt0" name="networktype" value="0" checked>
            <label for="nt0">Set new Home network</label>
          </div>
          <div class="mui-radio">
            <input type="radio" id="nt1" name="networktype" value="1">
            <label for="nt1">One-time connect to network, retain Home network setting</label>
          </div>
          <div class="mui-radio">
            <input type="radio" id="nt2" name="networktype" value="2">
            <label for="nt2">Start AP mode, retain Home network setting</label>
          </div>
          <div class="mui-radio">
            <input type="radio" id="nt3" name="networktype" value="3">
            <label for="nt3">Forget Home network setting, always use AP mode</label>
          </div>
          <br/>
          <div id="credentials">
            <div class="autocomplete mui-textfield" style="position:relative;">
              <div id="loader" style="position:absolute;right:0;width: 28px;height: 28px;" class="loader"></div>
              <input id="network" type="text" name="network" placeholder="SSID"/>
              <label for="network">WiFi SSID</label>
            </div>
            <div class="mui-textfield">
              <input size='64' id='password' name='password' type='password'/>
              <label for="password">WiFi password</label>
            </div>
          </div>
          <button type="submit" class="mui-btn mui-btn--primary">Confirm</button>
        </form>
      </div>
      <div class="mui-panel">
        <a id="connect" href="#">Connect to Home network: <span id="homenet"></span></a>
      </div>
    `;
    }
}
