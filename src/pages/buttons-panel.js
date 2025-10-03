import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import {elrsState, saveConfig} from "../utils/state.js";
import {_, _renderOptions} from "../utils/libs.js";

@customElement('buttons-panel')
class ButtonsPanel extends LitElement {

    colorTimer = undefined;
    colorUpdated = false;
    buttonActions = [];

    createRenderRoot() {
        this.timeoutCurrentColors = this.timeoutCurrentColors.bind(this);
        return this;
    }

    render() {
        return html`
            <div class="mui-panel mui--text-title">Button & Actions</div>
            <div class="mui-panel">
                <p>
                    Specify which actions to perform when clicking or long pressing module buttons.
                </p>
                <form class="mui-form" id='button_actions'>
                    ${elrsState.config['button-actions'] ? html`
                        <table class="mui-table">
                            <tbody id="button-actions">
                            ${this.updateButtons()}
                            </tbody>
                        </table>
                    ` : ``}
                    ${this.buttonActions[0] ? html`
                    <div id="button1-color-div" style="display: ${this.buttonActions[0]['color']!==undefined ? 'block' : 'none'};">
                        <input id='button1-color' name='button1-color' type='color' @input="${this.changeCurrentColors}" .value="${this.toRGB(this.buttonActions[0]['color'])}"/>
                        <label for="button1-color">User button 1 color</label>
                    </div>
                    ` : ''}
                    ${this.buttonActions[1] ? html`
                    <div id="button2-color-div" style="display: ${this.buttonActions[1]['color']!==undefined ? 'block' : 'none'};">
                        <input id='button2-color' name='button2-color' type='color' @input="${this.changeCurrentColors}" .value="${this.toRGB(this.buttonActions[1]['color'])}"/>
                        <label for="button2-color">User button 2 color</label>
                    </div>
                    ` : ''}
                    <button id="submit-actions" class="mui-btn mui-btn--primary" @click="${this.submitButtonActions}">Save</button>
                </form>
            </div>
        `;
    }

    submitButtonActions(e) {
        e.stopPropagation();
        e.preventDefault();
        saveConfig(
            {'button-actions': this.buttonActions}
        )
    }

    toRGB(c) {
        let r = c & 0xE0;
        r = ((r << 16) + (r << 13) + (r << 10)) & 0xFF0000;
        let g = c & 0x1C;
        g = ((g << 11) + (g << 8) + (g << 5)) & 0xFF00;
        let b = ((c & 0x3) << 1) + ((c & 0x3) >> 1);
        b = (b << 5) + (b << 2) + (b >> 1);
        let s = (r + g + b).toString(16);
        return '#' + "000000".substring(0, 6 - s.length) + s;
    }

    updateButtons() {
        let result = []
        this.buttonActions = elrsState.config['button-actions'];
        for (const [b, _v] of Object.entries(this.buttonActions)) {
            for (const [p, v] of Object.entries(_v['action'])) {
                result.push(this.appendRow(parseInt(b), parseInt(p), v));
            }
        }
        return result
    }

    changeCurrentColors() {
        if (this.colorTimer === undefined) {
            this.sendCurrentColors();
            this.colorTimer = setInterval(this.timeoutCurrentColors, 50);
        } else {
            this.colorUpdated = true;
        }
        if (this.buttonActions[0]) this.buttonActions[0].color = this.to8bit(_(`button1-color`).value)
        if (this.buttonActions[1]) this.buttonActions[1].color = this.to8bit(_(`button2-color`).value)
    }

    to8bit(v) {
        v = parseInt(v.substring(1), 16)
        return ((v >> 16) & 0xE0) + ((v >> (8 + 3)) & 0x1C) + ((v >> 6) & 0x3)
    }

    sendCurrentColors() {
        const formData = new FormData(_('button_actions'));
        const data = Object.fromEntries(formData);
        let colors = [];
        for (const [k, v] of Object.entries(data)) {
            if (_(k) && _(k).type === 'color') {
                const index = parseInt(k.substring(6)) - 1;
                if (_(k + '-div').style.display === 'none') colors[index] = -1;
                else colors[index] = this.to8bit(v);
            }
        }
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.open('POST', '/buttons', true);
        xmlhttp.setRequestHeader('Content-type', 'application/json');
        xmlhttp.send(JSON.stringify(colors));
        this.colorUpdated = false;
    }

    timeoutCurrentColors() {
        if (this.colorUpdated) {
            this.sendCurrentColors();
        } else {
            clearInterval(this.colorTimer);
            this.colorTimer = undefined;
        }
    }

    checkEnableButtonActionSave() {
        let disable = false;
        for (const [b, _v] of Object.entries(this.buttonActions)) {
            for (const [p, v] of Object.entries(_v['action'])) {
                if (v['action'] !== 0 && (_(`select-press-${b}-${p}`).value === '' || _(`select-long-${b}-${p}`).value === '' || _(`select-short-${b}-${p}`).value === '')) {
                    disable = true;
                }
            }
        }
        _('submit-actions').disabled = disable;
    }

    changeAction(b, p, value) {
        (this.buttonActions)[b]['action'][p]['action'] = value;
        _(`select-press-${b}-${p}`).disabled = value === 0;
        _(`select-long-${b}-${p}`).disabled = value === 0;
        _(`select-short-${b}-${p}`).disabled = value === 0;
        this.checkEnableButtonActionSave();
    }

    changePress(b, p, value) {
        (this.buttonActions)[b]['action'][p]['is-long-press'] = (value === 'true');
        _(`select-long-${b}-${p}`).style.display = value === 'true' ? 'block' : 'none';
        _(`select-short-${b}-${p}`).style.display = value === 'true' ? 'none' : 'block';
        this.checkEnableButtonActionSave();
    }

    changeCount(b, p, value) {
        (this.buttonActions)[b]['action'][p]['count'] = parseInt(value);
        _(`select-long-${b}-${p}`).value = value;
        _(`select-short-${b}-${p}`).value = value;
        this.checkEnableButtonActionSave();
    }

    appendRow(b, p, v) {
        return html`
            <tr>
                <td>
                    Button ${parseInt(b) + 1}
                </td>
                <td>
                    <div class="mui-select">
                        <select @change="${(e) => this.changeAction(b, p, parseInt(e.target.value))}">
                            ${_renderOptions(['Unused', 'Increase Power', 'Go to VTX Band Menu', 'Go to VTX Channel Menu',
                                'Send VTX Settings', 'Start WiFi', 'Enter Binding Mode', 'Start BLE Joystick'], v['action'])}
                        </select>
                        <label>Action</label>
                    </div>
                </td>
                <td>
                    <div class="mui-select">
                        <select id="select-press-${b}-${p}" @change="${(e) => this.changePress(b, p, e.target.value)}">
                            <option value='' disabled hidden ?selected="${v['action'] === 0}"></option>
                            <option value='false' ?selected="${v['is-long-press'] === false}">Short press (click)</option>
                            <option value='true' ?selected="${v['is-long-press'] === true}">Long press (hold)</option>
                        </select>
                        <label>Press</label>
                    </div>
                </td>
                <td>
                    <div class="mui-select" id="mui-long-${b}-${p}"
                         style="display:${(this.buttonActions)[b]['action'][p]['is-long-press'] ? "block" : "none"};">
                        <select id="select-long-${b}-${p}" @change="${(e) => this.changeCount(b, p, parseInt(e.target.value))}">
                            <option value='' disabled hidden ?selected="${v['action'] === 0}"></option>
                            ${_renderOptions([
                                'for 0.5 seconds', 'for 1 second', 'for 1.5 seconds', 'for 2 seconds',
                                'for 2.5 seconds', 'for 3 seconds', 'for 3.5 seconds', 'for 4 seconds',
                            ], v['count'])}
                        </select>
                        <label>Count</label>
                    </div>
                    <div class="mui-select" id="mui-short-${b}-${p}"
                         style="display:${(this.buttonActions)[b]['action'][p]['is-long-press'] ? "none" : "block"};">
                        <select id="select-short-${b}-${p}" @change="${(e) => this.changeCount(b, p, parseInt(e.target.value))}">
                            <option value='' disabled hidden ?selected="${v['action'] === 0}"></option>
                            ${_renderOptions([
                                '1 time', '2 times', '3 times', '4 times',
                                '5 times', '6 times', '7 times', '8 times',
                            ], v['count'])}
                        </select>
                        <label>Count</label>
                    </div>
                </td>
            </tr>
        `
    }
}
