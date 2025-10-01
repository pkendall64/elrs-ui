import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import FEATURES from "../features.js";
import {elrsState} from "../utils/state.js";
import '../assets/mui.js';
import {cuteAlert} from "../assets/libs.js";

@customElement('buttons-panel')
class ButtonsPanel extends LitElement {

    colorTimer = undefined;
    colorUpdated = false;
    buttonActions = [];

    createRenderRoot() {
        return this;
    }

//     if (data.hasOwnProperty['button-colors']) {
//     if (_('button1-color')) _('button1-color').oninput = changeCurrentColors;
//     if (data['button-colors'][0] === -1) _('button1-color-div').style.display = 'none';
//     else _('button1-color').value = color(data['button-colors'][0]);
//
//     if (_('button2-color')) _('button2-color').oninput = changeCurrentColors;
//     if (data['button-colors'][1] === -1) _('button2-color-div').style.display = 'none';
//     else _('button2-color').value = color(data['button-colors'][1]);
// }
// if (data.hasOwnProperty('button-actions')) {
//     updateButtons(data['button-actions']);
// } else {
//     _('button-tab').style.display = 'none';
// }

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
                    ${FEATURES.IS_TX ? html`
                        <div id="button1-color-div" style="display: none;">
                            <input id='button1-color' name='button1-color' type='color'/>
                            <label for="button1-color">User button 1 color</label>
                        </div>
                        <div id="button2-color-div" style="display: none;">
                            <input id='button2-color' name='button2-color' type='color'/>
                            <label for="button2-color">User button 2 color</label>
                        </div>
                    ` : ''}
                    <button class="mui-btn mui-btn--primary" @click="${this.submitButtonActions}">Save</button>
                </form>
            </div>
        `;
    }

    submitButtonActions(e) {
        e.stopPropagation();
        e.preventDefault();
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/config');
        xhr.setRequestHeader('Content-Type', 'application/json');
        // put in the colors
        if (buttonActions[0]) buttonActions[0].color = to8bit(_(`button1-color`).value)
        if (buttonActions[1]) buttonActions[1].color = to8bit(_(`button2-color`).value)
        xhr.send(JSON.stringify({'button-actions': buttonActions}));

        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    cuteAlert({
                        type: 'info',
                        title: 'Success',
                        message: 'Button actions have been saved'
                    });
                } else {
                    cuteAlert({
                        type: 'error',
                        title: 'Failed',
                        message: 'An error occurred while saving button configuration'
                    });
                }
            }
        }
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
                console.log(b, p, v)
                result.push(this.appendRow(parseInt(b), parseInt(p), v));
            }
            // if (_v['color'] !== undefined) {
            //     _(`button${parseInt(b)+1}-color-div`).style.display = 'block';
            // }
            // _(`button${parseInt(b)+1}-color`).value = toRGB(_v['color']);
        }
        // _('button1-color').oninput = changeCurrentColors;
        // _('button2-color').oninput = changeCurrentColors;
        return result
    }

    changeCurrentColors() {
        if (colorTimer === undefined) {
            sendCurrentColors();
            this.colorTimer = setInterval(this.timeoutCurrentColors, 50);
        } else {
            this.colorUpdated = true;
        }
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
                const index = parseInt(k.substring('6')) - 1;
                if (_(k + '-div').style.display === 'none') colors[index] = -1;
                else colors[index] = to8bit(v);
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

        if (value === 0) {
            _(`select-press-${b}-${p}`).value = '';
            _(`select-long-${b}-${p}`).value = '';
            _(`select-short-${b}-${p}`).value = '';
        }
        this.checkEnableButtonActionSave();
    }

    changePress(b, p, value) {
        (this.buttonActions)[b]['action'][p]['is-long-press'] = (value === 'true');
        _(`mui-long-${b}-${p}`).style.display = value === 'true' ? 'block' : 'none';
        _(`mui-short-${b}-${p}`).style.display = value === 'true' ? 'none' : 'block';
        this.checkEnableButtonActionSave();
    }

    changeCount(b, p, value) {
        (this.buttonActions)[b]['action'][p]['count'] = parseInt(value);
        _(`select-long-${b}-${p}`).value = value;
        _(`select-short-${b}-${p}`).value = value;
        this.checkEnableButtonActionSave();
    }

    _renderOptions(options, selected) {
        return options.map(
            (label, index) => html`
                <option .value="${index.toString()}" ?selected="${index === selected}">${label}</option>
            `
        );
    }

    appendRow(b, p, v) {
        return html`
            <tr>
                <td>
                    Button ${parseInt(b) + 1}
                </td>
                <td>
                    <div class="mui-select">
                        <select @change="${(e) => {this.changeAction(b, p, parseInt(e.target.value))}}">
                            ${this._renderOptions(['Unused', 'Increase Power', 'Go to VTX Band Menu', 'Go to VTX Channel Menu',
                                'Send VTX Settings', 'Start WiFi', 'Enter Binding Mode', 'Start BLE Joystick'], v['action'])}
                        </select>
                        <label>Action</label>
                    </div>
                </td>
                <td>
                    <div class="mui-select">
                        <select id="select-press-${b}-${p}" @change="${(e) => this.changePress(b, p, e.target.value)}">
                            <option value='' disabled hidden ?selected="${v['action'] === 0}"></option>
                            <option value='false' ?selected="${v['is-long-press'] === false}">Short press (click)
                            </option>
                            <option value='true' ?selected="${v['is-long-press'] === true}">Long press (hold)
                            </option>
                        </select>
                        <label>Press</label>
                    </div>
                </td>
                <td>
                    <div class="mui-select" id="mui-long-${b}-${p}"
                         style="display:${(this.buttonActions)[b]['action'][p]['is-long-press'] ? "block" : "none"};">
                        <select id="select-long-${b}-${p}" @change="${(e) => this.changeCount(b, p, parseInt(e.target.value))}">
                            <option value='' disabled hidden ?selected="${v['action'] === 0}"></option>
                            ${this._renderOptions([
                                'for 0.5 seconds', 'for 1 second', 'for 1.5 seconds', 'for 2 seconds',
                                'for 2.5 seconds', 'for 3 seconds', 'for 3.5 seconds', 'for 4 seconds',
                            ], v['count'])}
                        </select>
                        <label>Count</label>
                    </div>
                    <div class="mui-select" id="mui-short-${b}-${p}"
                         style="display:${(this.buttonActions)[b]['action'][p]['is-long-press'] ? "none" : "block"};">
                        <select id="select-short-${b}-${p}" @change="${(e) => this.changeCount(b, p, parseInt(e.target.value))}">
                            <option value='' disabled hidden ?selected="${v['action'] === 0}"}></option>
                            ${this._renderOptions([
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
