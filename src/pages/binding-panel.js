import {html, LitElement} from "lit";
import {customElement, query, state} from "lit/decorators.js";
import FEATURES from "../features.js";
import {elrsState} from "../utils/state.js";
import '../assets/mui.js';
import {cuteAlert} from "../assets/libs.js";
import {calcMD5} from "../utils/md5.js";

@customElement('binding-panel')
class BindingPanel extends LitElement {
    @query('#vbind') accessor vbind
    @query('#phrase') accessor phrase

    @state() accessor uid = []
    @state() accessor bindType = "0"
    @state() accessor uidData = {}

    originalUIDType = ''
    originalUID = []

    createRenderRoot() {
        return this;
    }

    firstUpdated(_changedProperties) {
        this.uid = elrsState.config.uid;
        this.originalUID = elrsState.config.uid;
        this.originalUIDType = (elrsState.config && elrsState.config.uidtype) ? elrsState.config.uidtype : '';
        this.updateUIDType(this.originalUIDType);
    }

    _handleBindTypeChange(e) {
        this.bindType = e.target.value;
    }

    render() {
        return html`
            <div class="mui-panel mui--text-title">Binding</div>
            <div class="mui-panel">
                <form id='upload_options'>
                    ${!FEATURES.IS_TX ? html`
                        <div class="mui-select">
                            <select id="vbind" @change="${this._handleBindTypeChange}">
                                <option value="0">Persistent (Default) - Bind information is stored across reboots
                                </option>
                                <option value="1">Volatile - Never store bind information across reboots</option>
                                <option value="2">Returnable - Unbinding a receiver reverts to flashed binding phrase
                                </option>
                                <option value="3">Administered - Binding information can only be edited through web UI
                                </option>
                            </select>
                            <label for="vbind">Binding storage</label>
                        </div>
                    ` : ''}
                    ${this.bindType !== "1" ? html`
                        <div>
                            Enter a new binding phrase to replace the current binding information.
                            This will persist across reboots, but <b>will be reset</b> if the firmware is flashed with a
                            binding phrase.
                            Note: The Binding phrase is not remembered, it is a temporary field used to generate the
                            binding UID.
                            <br/><br/>
                            <div class="mui-textfield">
                                <input type="text" id="phrase" placeholder="Binding Phrase"
                                       @input="${this.updateBindingPhrase}"/>
                                <label for="phrase">Binding Phrase</label>
                            </div>
                        </div>
                        <div class="mui-textfield">
                            <label for='uid'>Binding UID</label>
                            ${this.bindType !== "1" ? html`
                                <span class="badge" id="uid-type"
                                      style="background-color: ${this.uidData.bg}; color: ${this.uidData.fg}">${this.uidData.uidtype}</span>
                            ` : ''}
                            <input size='40' id='uid' name='uid' type='text' class='array' readonly
                                   value="${this.uid}"/>
                        </div>
                    ` : ''}
                    <button class="mui-btn mui-btn--primary"
                            ?disabled=${(this.vbind?.value !== '1') && this.uidData.uidtype !== 'Modified'}
                            @click="${this.submitOptions}">Save
                    </button>
                </form>
            </div>
        `;
    }


    isValidUidByte(s) {
        let f = parseFloat(s);
        return !isNaN(f) && isFinite(s) && Number.isInteger(f) && f >= 0 && f < 256;
    }

    uidBytesFromText(text) {
        // If text is 4-6 numbers separated with [commas]/[spaces] use as a literal UID
        // This is a strict parser to not just extract numbers from text, but only accept if text is only UID bytes
        if (/^[0-9, ]+$/.test(text)) {
            let asArray = text.split(',').filter(this.isValidUidByte).map(Number);
            if (asArray.length >= 4 && asArray.length <= 6) {
                while (asArray.length < 6)
                    asArray.unshift(0);
                return asArray;
            }
        }

        const bindingPhraseFull = `-DMY_BINDING_PHRASE="${text}"`;
        const bindingPhraseHashed = calcMD5(bindingPhraseFull);
        return [...bindingPhraseHashed.subarray(0, 6)];
    }

    updateBindingPhrase(e) {
        let text = e.target.value
        if (text.length === 0) {
            this.uid = this.originalUID;
            this.updateUIDType(this.originalUIDType);
        } else {
            this.uid = this.uidBytesFromText(text.trim());
            this.updateUIDType('Modified');
        }
    }

    updateUIDType(uidtype) {
        let bg = '';
        let fg = 'white';
        let desc = '';

        if (!uidtype || uidtype.startsWith('Not set')) // TX
        {
            bg = '#D50000';  // red/white
            uidtype = 'Not set';
            desc = 'Using autogenerated binding UID';
        } else if (uidtype === 'Flashed') // TX
        {
            bg = '#1976D2'; // blue/white
            desc = 'The binding UID was generated from a binding phrase set at flash time';
        } else if (uidtype === 'Overridden') // TX
        {
            bg = '#689F38'; // green/black
            fg = 'black';
            desc = 'The binding UID has been generated from a binding phrase previously entered into the "binding phrase" field above';
        } else if (uidtype === 'Modified') // edited here
        {
            bg = '#7c00d5'; // purple
            desc = 'The binding UID has been modified, but not yet saved';
        } else if (uidtype === 'Volatile') // RX
        {
            bg = '#FFA000'; // amber
            desc = 'The binding UID will be cleared on boot';
        } else if (uidtype === 'Loaned') // RX
        {
            bg = '#FFA000'; // amber
            desc = 'This receiver is on loan and can be returned using Lua or three-plug';
        } else // RX
        {
            if (this.uid.toString().endsWith('0,0,0,0')) {
                bg = '#FFA000'; // amber
                uidtype = 'Not bound';
                desc = 'This receiver is unbound and will boot to binding mode';
            } else {
                bg = '#1976D2'; // blue/white
                uidtype = 'Bound';
                desc = 'This receiver is bound and will boot waiting for connection';
            }
        }

        this.uidData = {
            bg, fg, uidtype, desc
        }
    }

    submitOptions(e) {
        e.stopPropagation();
        e.preventDefault();
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => this.handleUpdate(xhr);
        if (FEATURES.IS_TX) {
            xhr.open('POST', '/options.json');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({...elrsState.options, customised: true, uid: this.uid}));
        } else {
            xhr.open('POST', '/config');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                uid: this.uid,
                vbind: this.vbind.value,
                "pwm": elrsState.config["pwm"],
                "serial-protocol": elrsState.config["serial-protocol"],
                "serial1-protocol": elrsState.config["serial1-protocol"],
                "sbus-failsafe": elrsState.config["sbus-failsafe"],
                "modelid": elrsState.config["modelid"],
                "force-tlm": elrsState.config["force-tlm"],
            }));
        }
    }

    async handleUpdate(xhr) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                await cuteAlert({
                    type: 'question',
                    title: 'Upload Succeeded',
                    message: 'Reboot to take effect',
                    confirmText: 'Reboot',
                    cancelText: 'Close'
                }).then((e) => {
                    if (FEATURES.IS_TX) {
                        this.originalUID = this.uid;
                        this.originalUIDType = 'Overridden';
                        this.phrase.value = '';
                        this.updateUIDType(this.originalUIDType);
                    }
                    if (e === 'confirm') {
                        const r = new XMLHttpRequest();
                        r.open('POST', '/reboot');
                        r.setRequestHeader('Content-Type', 'application/json');
                        r.onreadystatechange = function () {
                        };
                        r.send();
                    }
                });
            } else {
                await cuteAlert({
                    type: 'error',
                    title: 'Upload Failed',
                    message: xhr.responseText
                });
            }
        }
    }
}
