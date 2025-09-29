import '../assets/mui.js';

class ModelPanel extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <div class="mui-panel">
        <div id="model_tab">
          <h2>PWM Output</h2>
          Set PWM output mode and failsafe positions.
          <ul>
            <li><b>Output:</b> Receiver output pin</li>
            <li><b>Features:</b> If an output is capable of supporting another function, that is indicated here</li>
            <li><b>Mode:</b> Output frequency, 10KHz 0-100% duty cycle, binary On/Off, DShot, Serial, or I2C (some options are pin dependant)</li>
            <ul>
              <li>When enabling serial pins, be sure to select the <b>Serial Protocol</b> below and <b>UART baud</b> on the <b>Options</b> tab</li>
            </ul>
            <li><b>Input:</b> Input channel from the handset</li>
            <li><b>Invert:</b> Invert input channel position</li>
            <li><b>750us:</b> Use half pulse width (494-1006us) with center 750us instead of 988-2012us</li>
            <li><b>Failsafe</b>
              <ul>
                <li>"Set Position" sets the servo to an absolute "Failsafe Pos"
                  <ul>
                    <li>Does not use "Invert" flag</li>
                    <li>Value will be halved if "750us" flag is set</li>
                    <li>Will be converted to binary for "On/Off" mode (>1500us = HIGH)</li>
                  </ul>
                </li>
                <li>"No Pulses" stops sending pulses
                  <ul>
                    <li>Unpowers servos</li>
                    <li>May disarm ESCs</li>
                  </ul>
                </li>
                <li>"Last Position" continues sending last received channel position</li>
              </ul>
            </li>
          </ul>
          <form action="/pwm" id="pwm" method="POST"></form>
        </div>
        <form class="mui-form" action='/config' id='config' method='POST'>
          <h2>Binding Phrase</h2>
          <div class="mui-select">
            <select id="vbind" name="vbind">
              <option value="0">Persistent (Default) - Bind information is stored across reboots</option>
              <option value="1">Volatile - Never store bind information across reboots</option>
              <option value="2">Returnable - Unbinding a receiver reverts to flashed binding phrase</option>
              <option value="3">Administered - Binding information can only be edited through web UI</option>
            </select>
            <label for="vbind">Binding storage</label>
          </div>
          <div id="bindphrase">
            Enter a new binding phrase to replace the current binding information.
            This will persist across reboots, but <b>will be reset</b> if the firmware is flashed with a binding phrase.
            Note: The Binding phrase is not remembered, it is a temporary field used to generate the binding UID.
            <br/><br/>
            <div class="mui-textfield">
              <input type="text" id="phrase" name="phrase" placeholder="Binding Phrase" />
              <label for="phrase">Binding Phrase</label>
            </div>
            <div class="mui-textfield">
              <label for="uid"><span id="uid-text"></span></label>
              <span class="badge" id="uid-type"></span>
              <input size="40" id="uid" name="uid" type="text" class="array" readonly/>
            </div>
          </div>
          <div id="serial-config">
            <h2>Serial Protocol</h2>
            Set the protocol used to communicate with the flight controller or other external devices.
            <br/><br/>
            <div class="mui-select">
              <select id='serial-protocol' name='serial-protocol'>
                <option value='0'>CRSF</option>
                <option value='1'>Inverted CRSF</option>
                <option value='2'>SBUS</option>
                <option value='3'>Inverted SBUS</option>
                <option value='4'>SUMD</option>
                <option value='5'>DJI RS Pro</option>
                <option value='6'>HoTT Telemetry</option>
                <option value='7'>MAVLINK</option>
                <option value='8'>DisplayPort</option>
                <option value='9'>GPS</option>
              </select>
              <label for='serial-protocol'>Serial Protocol</label>
            </div>
          </div>
          <div id="serial1-config">
            <div class="mui-select">
              <select id='serial1-protocol' name='serial1-protocol'>
                <option value='0'>Off</option>
                <option value='1'>CRSF</option>
                <option value='2'>Inverted CRSF</option>
                <option value='3'>SBUS</option>
                <option value='4'>Inverted SBUS</option>
                <option value='5'>SUMD</option>
                <option value='6'>DJI RS Pro</option>
                <option value='7'>HoTT Telemetry</option>
                <option value='8'>Tramp</option>
                <option value='9'>SmartAudio</option>
                <option value='10'>DisplayPort</option>
                <option value='11'>GPS</option>
              </select>
              <label for='serial1-protocol'>Serial2 Protocol</label>
            </div>
          </div>
          <div id="sbus-config" style="display: none;">
            <h2>SBUS Failsafe</h2>
            Set the failsafe behaviour when using the SBUS protocol:<br/>
            <ul>
              <li>"No Pulses" stops sending SBUS data when a connection to the transmitter is lost</li>
              <li>"Last Position" continues to send the last received channel data along with the FAILSAFE bit set</li>
            </ul>
            <br/>
            <div class="mui-select">
              <select id='sbus-failsafe' name='serial-failsafe'>
                <option value='0'>No Pulses</option>
                <option value='1'>Last Position</option>
              </select>
              <label for="sbus-failsafe">SBUS Failsafe</label>
            </div>
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
          When running multiple receivers simultaneously from the same TX (to increase the number of PWM servo outputs), there can be at most one receiver with telemetry enabled.<br>Enable this option to ignore the "Telem Ratio" setting on the TX and never send telemetry from this receiver.
          <br/><br/>
          <div class="mui-checkbox">
            <input id='force-tlm' name='force-tlm' type='checkbox' value="1"/>
            <label for="force-tlm">Force telemetry OFF on this receiver</label>
          </div>
          <button type='submit' class="mui-btn mui-btn--small mui-btn--primary">Save</button>
        </form>
      </div>
      <div class="mui-panel">
        <a id="reset-model" href="#">Reset all model settings to defaults (includes binding).</a>
      </div>
    `;
    }
}

customElements.define('model-panel', ModelPanel);
