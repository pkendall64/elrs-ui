import '../assets/mui.js';

class OptionsPanel extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
            <div class="mui-panel">
                <h2>Runtime Options</h2>
                This form <b>overrides</b> the options provided when the firmware was flashed. These changes will persist across reboots, but <b>will be reset</b> when the firmware is reflashed.
                <!-- FEATURE:IS_TX -->
                Note: The Binding phrase is <b>not</b> remembered, it is a temporary field used to generate the binding UID.
                <br/><br/>
                <div class="mui-textfield">
                    <input type="text" id="phrase" name="phrase" placeholder="Binding Phrase" />
                    <label for="phrase">Binding Phrase</label>
                </div>
                <!-- /FEATURE:IS_TX -->
                <!-- FEATURE:NOT IS_TX -->
                <br/><br/>
                <!-- /FEATURE:NOT IS_TX -->
                <form id='upload_options' method='POST' action="/options">
                    <!-- FEATURE:IS_TX -->
                    <div class="mui-textfield">
                        <label for='uid'><span id="uid-text"></span></label>
                        <span class="badge" id="uid-type"></span>
                        <input size='40' id='uid' name='uid' type='text' class='array' readonly/>
                    </div>
                    <!-- /FEATURE:IS_TX -->
                    <!-- FEATURE:HAS_SUBGHZ -->
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
                    <!-- /FEATURE:HAS_SUBGHZ -->
                    <div class="mui-textfield">
                        <input size='3' id='wifi-on-interval' name='wifi-on-interval' type='text' placeholder="Disabled"/>
                        <label for="wifi-on-interval">WiFi "auto on" interval in seconds (leave blank to disable)</label>
                    </div>
                    <!-- FEATURE:IS_TX -->
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
                    <!-- /FEATURE:IS_TX -->
                    <!-- FEATURE:NOT IS_TX -->
                    <div id="baud-config" class="mui-textfield"  style="display: block;">
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
                    <!-- /FEATURE:NOT IS_TX -->
                    <button id='submit-options' class="mui-btn mui-btn--primary" disabled>Save</button>
                    <button id="reset-options" class="mui-btn mui-btn--small mui-btn--danger" style="display: none;">
                        Reset runtime options to defaults
                    </button>
                    <input type="hidden" id="flash-discriminator" name="flash-discriminator"/>
                    <input type="hidden" id="wifi-ssid" name="wifi-ssid"/>
                    <input type="hidden" id='wifi-password' name='wifi-password'/>
                </form>
            </div>
            <!-- FEATURE:IS_TX -->
            <div class="mui-panel">
                <h2>Import/Export</h2>
                <br/>
                <div>
                    <a href="/config?export" download="models.json" target="_blank" class="mui-btn mui-btn--small mui-btn--dark">Save model configuration file</a>
                </div>
                <div>
                    <button class="mui-btn mui-btn--small mui-btn--primary upload">
                        <label>
                            Upload model configuration file
                            <input type="file" id="fileselect" name="fileselect[]" />
                        </label>
                    </button>
                </div>
            </div>
            <!-- /FEATURE:IS_TX -->
    `;
  }
}

customElements.define('options-panel', OptionsPanel);
