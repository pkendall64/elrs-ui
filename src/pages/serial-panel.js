import {html, LitElement} from "lit";
import {customElement, state} from "lit/decorators.js";
import '../assets/mui.js';
import {_renderOptions} from "../utils/libs.js";
import {elrsState} from "../utils/state.js";

@customElement('serial-panel')
class SerialPanel extends LitElement {
    SERIAL_OPTIONS = ["CRSF", "Inverted CRSF", "SBUS", "Inverted SBUS", "SUMD", "DJI RS Pro", "HoTT Telemetry", "MAVLINK", "DisplayPort", "GPS"]

    @state() accessor serial1Protocol
    @state() accessor serial2Protocol
    @state() accessor baudRate
    @state() accessor sbusFailsafe
    @state() accessor isAirport

    createRenderRoot() {
        this.isAirport = elrsState.options['is-airport'];
        this.serial1Protocol = this.isAirport ? 10 : elrsState.config['serial-protocol']
        this.serial1Protocol = elrsState.config['serial1-protocol']
        this.baudRate = elrsState.options['rcvr-uart-baud']
        this.sbusFailsafe = elrsState.config['sbus-failsafe']
        return this;
    }

    render() {
        return html`
            <div class="mui-panel mui--text-title">Serial/UART Protocols</div>
            <div class="mui-panel">
                <p>Set the protocol(s) used to communicate with the flight controller or other external devices.</p>
                <form>
                    <div class="mui-select">
                        <select id='serial-protocol' name='serial-protocol'
                            value=${this.serial1Protocol}
                            @change=${this._updateSerial1}
                        >
                            ${_renderOptions([...this.SERIAL_OPTIONS, "AirPort"], 0)}
                        </select>
                        <label for='serial-protocol'>Serial 1 Protocol</label>
                    </div>
                    <div class="mui-select">
                        <select id='serial1-protocol' name='serial1-protocol'
                            value=${this.serial2Protocol}
                            @change=${this._updateSerial2}
                        >
                            ${_renderOptions(["Off", ...this.SERIAL_OPTIONS], 0)}
                        </select>
                        <label for='serial1-protocol'>Serial 2 Protocol</label>
                    </div>
                    ${this._displayBaudRate() ? html`
                    <div class="mui-textfield">
                        <input size='7' type='number'
                               @input=${(e) => this.baudRate = parseInt(e.target.value)}
                               value=${this.baudRate}/>
                        <label>CRSF/Airport baud</label>
                    </div>
                    ` : ''}
                    ${this._sbusSelected() ? html`
                    <div id="sbus-config">
                        <div class="mui--text-title">SBUS Failsafe</div>
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
                    ` : ''}
                    <button class="mui-btn mui-btn--small mui-btn--primary" @click="${this._saveSerial}">Save</button>
                </form>
            </div>
        `;
    }

    _updateSerial1(e) {
        this.serial1Protocol = parseInt(e.target.value);
        this.isAirport = this.serial1Protocol === 10;
    }

    _updateSerial2(e) {
        this.serial2Protocol = parseInt(e.target.value);
    }

    _displayBaudRate() {
        return this.isAirport || this.serial1Protocol === 0 || this.serial1Protocol === 1 || this.serial2Protocol === 1 || this.serial2Protocol === 2
    }

    _sbusSelected() {
        return this.serial1Protocol === 2 || this.serial1Protocol === 3 || this.serial2Protocol === 3 || this.serial2Protocol === 4
    }

    _saveSerial() {

    }
}
