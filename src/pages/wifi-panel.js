import {html, LitElement} from "lit";
import {customElement, state} from "lit/decorators.js";
import {elrsState} from "../utils/state.js";
import {_} from "../utils/libs.js";
import {postWithFeedback} from "../utils/feedback.js";
import {autocomplete} from "../utils/autocomplete.js";

@customElement('wifi-panel')
class WifiPanel extends LitElement {

    @state() accessor selectedValue = '0';
    running = false;

    constructor() {
        super();
        this._getNetworks = this._getNetworks.bind(this);
    }

    createRenderRoot() {
        return this;
    }

    disconnectedCallback() {
        this.running = false;
    }

    updated(_) {
        if (!this.running) this._getNetworks();
        this.running = true;
    }

    render() {
        return html`
            <div class="mui-panel mui--text-title">WiFi Configuration</div>
            <div class="mui-panel">
                <div class="mui-panel info-bg">
                    ${elrsState.config.mode !== 'STA' ? 'Currently in Access-Point mode' : 'Currently connected to home network: ' + elrsState.config.ssid}
                </div>
                <p>
                    Here you can join a network, and save it as your Home network. When you enable WiFi in range of your
                    Home network, ExpressLRS will automatically connect to it. In Access Point (AP) mode, the network
                    name is ExpressLRS TX or ExpressLRS RX with password "expresslrs".
                </p>
                <form id="sethome" method="POST" autocomplete="off" class="mui-form">
                    <div class="mui-radio">
                        <input type="radio" id="nt0" name="networktype" value="0" checked
                               @change="${this._handleChange}">
                        <label for="nt0">Set new home network</label>
                    </div>
                    <div class="mui-radio">
                        <input type="radio" id="nt1" name="networktype" value="1" @change="${this._handleChange}">
                        <label for="nt1">One-time connect to network, retain current home network setting</label>
                    </div>
                    <div class="mui-radio">
                        <input type="radio" id="nt2" name="networktype" value="2" @change="${this._handleChange}">
                        <label for="nt2">Start AP mode, retain current home network setting</label>
                    </div>
                    <div class="mui-radio">
                        <input type="radio" id="nt3" name="networktype" value="3" @change="${this._handleChange}">
                        <label for="nt3">Forget home network setting, always use AP mode</label>
                    </div>
                    <br/>
                    <div ?hidden="${this.selectedValue !== '0'}">
                        <div class="mui-textfield">
                            <input size='3' id='wifi-on-interval' name='wifi-on-interval' type='text'
                                   placeholder="Disabled"/>
                            <label for="wifi-on-interval">WiFi "auto on" interval in seconds (leave blank to
                                disable)</label>
                        </div>
                    </div>
                    <div id="credentials" ?hidden="${this.selectedValue === '2' || this.selectedValue === '3'}">
                        <div class="autocomplete mui-textfield" style="position:relative;">
                            <div id="loader" style="position:absolute;right:0;width: 28px;height: 28px;"
                                 class="loader"></div>
                            <input id="network" type="text" name="network" placeholder="SSID"/>
                            <label for="network">WiFi SSID</label>
                        </div>
                        <div class="mui-textfield">
                            <input size='64' id='password' name='password' type='password'/>
                            <label for="password">WiFi password</label>
                        </div>
                    </div>
                    <button type="submit" class="mui-btn mui-btn--primary" @click="${this._setupNetwork}">Confirm
                    </button>
                </form>
            </div>
            <div class="mui-panel" ?hidden="${elrsState.config.mode === 'STA'}">
                <a id="connect" href="#"
                   @click="${() => postWithFeedback('Connect to Home Network', 'An error occurred connecting to the Home network', '/connect', null)}">
                    Connect to Home network: ${elrsState.options['wifi-ssid']}
                </a>
            </div>
        `;
    }

    _handleChange(event) {
        this.selectedValue = event.target.value;
    }

    _setupNetwork(event) {
        event.preventDefault();
        switch (this.selectedValue) {
            case '0':
                postWithFeedback('Set Home Network', 'An error occurred setting the home network', '/sethome?save', function () {
                    return new FormData(_('sethome'));
                }, function () {
                    elrsState.options = {
                        ...elrsState.options,
                        'wifi-ssid': _('network').value,
                        'wifi-password': _('password').value
                    };
                })(event);
                break;
            case '1':
                postWithFeedback('Connect To Network', 'An error occurred connecting to the network', '/sethome', function () {
                    return new FormData(_('sethome'));
                })(event);
                break;
            case '2':
                postWithFeedback('Start Access Point', 'An error occurred starting the Access Point', '/access', null)(event);
                break;
            case '3':
                postWithFeedback('Forget Home Network', 'An error occurred forgetting the home network', '/forget', null)(event);
                break;
        }
    }

    _getNetworks() {
        const self = this;
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onload = function() {
            if (self.running) {
                if (this.status === 204) {
                    setTimeout(self._getNetworks, 2000);
                } else {
                    const data = JSON.parse(this.responseText);
                    if (data.length > 0) {
                        _('loader').style.display = 'none';
                        autocomplete(_('network'), data);
                    }
                }
            }
        };
        xmlhttp.onerror = function() {
            if (self.running) {
                setTimeout(self._getNetworks, 2000);
            }
        };
        xmlhttp.open('GET', 'networks.json', true);
        xmlhttp.send();
    }
}
