import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import FEATURES from "../features.js";
import '../assets/mui.js';

@customElement('options-panel')
class OptionsPanel extends LitElement {
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
                    ${FEATURES.HAS_SUBGHZ ? html`
                        <div class="mui-select">
                            <select id='domain' name='domain'>
                                <option value='0'>AU915</option>
                                <option value='1'>FCC915</option>
                                <option value='2'>EU868</option>
                                <option value='3'>IN866</option>
                                <option value='4'>AU433</option>
                                <option value='5'>EU433</option>
                                <option value='6'>US433</option>
                                <option value='7'>US433-Wide</option>
                            </select>
                            <label for="domain">Regulatory domain</label>
                        </div>
                    ` : ''}
                    ${FEATURES.IS_TX ? html`
                        <div class="mui-textfield">
                            <input size='5' id='tlm-interval' name='tlm-interval' type='text'/>
                            <label for="tlm-interval">TLM report interval (ms)</label>
                        </div>
                        <div class="mui-textfield">
                            <input size='3' id='fan-runtime' name='fan-runtime' type='text'/>
                            <label for="fan-runtime">Fan runtime (s)</label>
                        </div>
                        <div class="mui-checkbox">
                            <input id='is-airport' name='is-airport' type='checkbox'/>
                            <label for="is-airport">Use as AirPort Serial device</label>
                        </div>
                        <div class="mui-textfield">
                            <input size='7' id='airport-uart-baud' name='airport-uart-baud' type='text'/>
                            <label for="airport-uart-baud">AirPort UART baud</label>
                        </div>
                    ` : html`
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
                    `}

                    <input type="hidden" id="flash-discriminator" name="flash-discriminator"/>
                    <input type="hidden" id="wifi-ssid" name="wifi-ssid"/>
                    <input type="hidden" id='wifi-password' name='wifi-password'/>

                    <button id='submit-options' class="mui-btn mui-btn--primary" disabled>Save</button>
                    <button id="reset-options" class="mui-btn mui-btn--small mui-btn--danger" style="display: none;">
                        Reset runtime options to defaults
                    </button>
                </form>
            </div>
            ${FEATURES.IS_TX ? html`
                <div class="mui-panel">
                    <h2>Import/Export</h2>
                    <br/>
                    <div>
                        <a href="/config?export" download="models.json" target="_blank"
                           class="mui-btn mui-btn--small mui-btn--dark">Save model configuration file</a>
                    </div>
                    <div>
                        <button class="mui-btn mui-btn--small mui-btn--primary upload">
                            <label>
                                Upload model configuration file
                                <input type="file" id="fileselect" name="fileselect[]"/>
                            </label>
                        </button>
                    </div>
                </div>
            ` : ''}
        `;
    }
}
