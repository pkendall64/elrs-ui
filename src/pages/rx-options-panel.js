import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import FEATURES from "../features.js";
import '../assets/mui.js';
import {_renderOptions} from "../utils/libs.js";

@customElement('rx-options-panel')
class RxOptionsPanel extends LitElement {
    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <div class="mui-panel mui--text-title">Runtime Options</div>
            <div class="mui-panel">
                <p>This form <b>overrides</b> the options provided when the firmware was flashed. These changes will
                    persist across reboots, but <b>will be reset</b> when the firmware is reflashed.</p>
                <form id='upload_options' method='POST' action="/options">
                    <!-- FEATURE:HAS_SUBGHZ -->
                    <div class="mui-select">
                        <select @change="${(e) => this.domain = parseInt(e.target.value)}">
                            ${_renderOptions(['AU915','FCC915','EU868','IN866','AU433','EU433','US433','US433-Wide'], this.domain)}
                        </select>
                        <label for="domain">Regulatory domain</label>
                    </div>
                    <!-- /FEATURE:HAS_SUBGHZ -->
                    <div id="baud-config" class="mui-textfield" style="display: block;">
                        <input size='7' id='rcvr-uart-baud' name='rcvr-uart-baud' type='text'/>
                        <label for="rcvr-uart-baud">UART baud</label>
                    </div>
                    <div class="mui-checkbox">
                        <input id='lock-on-first-connection' name='lock-on-first-connection' type='checkbox'/>
                        <label for="lock-on-first-connection">Lock on first connection</label>
                    </div>
                    <div class="mui-checkbox">
                        <input id='is-airport' name='is-airport' type='checkbox'/>
                        <label for="is-airport">Use as AirPort Serial device</label>
                    </div>
                    <div class="mui-checkbox">
                        <input id='dji-permanently-armed' name='dji-permanently-armed' type='checkbox'/>
                        <label for="dji-permanently-armed">Permanently arm DJI air units</label>
                    </div>
                    <h2>Model Match</h2>
                    Specify the 'Receiver' number in OpenTX/EdgeTX model setup page and turn on the 'Model Match'
                    in the ExpressLRS Lua script for that model. 'Model Match' is between 0 and 63 inclusive.
                    <br/><br/>
                    <div class="mui-checkbox">
                        <input id='model-match' name='model-match' type='checkbox'/>
                        <label for="model-match">Enable Model Match</label>
                    </div>
                    <div class="mui-textfield" id="modelNum">
                        <input id='modelid' type='text' name='modelid' value="255" required/>
                        <label for="modelid">Model ID</label>
                    </div>
                    <h2>Force telemetry off</h2>
                    When running multiple receivers simultaneously from the same TX (to increase the number of PWM servo outputs), there can be at most one receiver with telemetry enabled.
                    <br>Enable this option to ignore the "Telem Ratio" setting on the TX and never send telemetry from this receiver.
                    <br/><br/>
                    <div class="mui-checkbox">
                        <input id='force-tlm' name='force-tlm' type='checkbox' value="1"/>
                        <label for="force-tlm">Force telemetry OFF on this receiver</label>
                    </div>

                    <button id='submit-options' class="mui-btn mui-btn--primary" disabled>Save</button>
                    <button id="reset-options" class="mui-btn mui-btn--small mui-btn--danger" style="display: none;">
                        Reset runtime options to defaults
                    </button>
                </form>
            </div>
        `;
    }
}
