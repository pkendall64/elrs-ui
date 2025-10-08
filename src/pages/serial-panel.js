import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import '../assets/mui.js';
import {_renderOptions} from "../utils/libs.js";

@customElement('serial-panel')
class SerialPanel extends LitElement {
    SERIAL_OPTIONS = ["CRSF", "Inverted CRSF", "SBUS", "Inverted SBUS", "SUMD", "DJI RS Pro", "HoTT Telemetry", "MAVLINK", "DisplayPort", "GPS"]

    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <div class="mui-panel mui--text-title">Serial/UART Protocols</div>
            <div class="mui-panel">
                <form class="mui-form" action='/config' id='config' method='POST'>
                    <div id="serial-config">
                        Set the protocol(s) used to communicate with the flight controller or other external devices.
                        <br/><br/>
                        <div class="mui-select">
                            <select id='serial-protocol' name='serial-protocol'>
                                ${_renderOptions(this.SERIAL_OPTIONS, 0)}
                            </select>
                            <label for='serial-protocol'>Serial Protocol</label>
                        </div>
                        </div>
                        <div id="serial1-config">
                            <div class="mui-select">
                                <select id='serial1-protocol' name='serial1-protocol'>
                                    ${_renderOptions(["Off", ...this.SERIAL_OPTIONS], 0)}
                                </select>
                                <label for='serial1-protocol'>Serial2 Protocol</label>
                            </div>
                        </div>
                        <div id="sbus-config" style="display: none;">
                            <h2>SBUS Failsafe</h2>
                            Set the failsafe behaviour when using the SBUS protocol:<br/>
                            <ul>
                                <li>"No Pulses" stops sending SBUS data when a connection to the transmitter is lost
                                </li>
                                <li>"Last Position" continues to send the last received channel data along with the
                                    FAILSAFE
                                    bit set
                                </li>
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
                        <button type='submit' class="mui-btn mui-btn--small mui-btn--primary">Save</button>
                </form>
            </div>
        `;
    }
}
