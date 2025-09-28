import '../assets/mui.js';
import FEATURES from "../features.js";
import {html, LitElement} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {cuteAlert} from "../assets/libs.js";

@customElement('binding-panel')
class BindingPanel extends LitElement {

    @property()
    accessor data

    @state()
    accessor uid = []
    @state()
    accessor bindType = "0"

    k = []
    originalUIDType = ''
    originalUID = []

    @state()
    accessor uidData = {}

    _(s) {
        return this.shadowRoot.getElementById(s)
    }

    constructor() {
        super();
        for (let i=0 ; i < 64;) {
            this.k[i] = 0 | (Math.abs(Math.sin(++i)) * 4294967296);
        }
    }

    firstUpdated() {
        this.uid = this.data.uid.toString();
        this.originalUID = this.data.uid;
        this.originalUIDType = (this.data && this.data.uidtype) ? this.data.uidtype : '';
        this.updateUIDType(this.originalUIDType);
    }

    _handleBindTypeChange(e) {
        this.bindType = e.target.value;
    }

    render() {
      return html`
        <link rel="stylesheet" href="src/assets/mui.css">
        <link rel="stylesheet" href="src/assets/elrs.css">
        <div class="mui-panel mui--text-title">Binding</div>
        <div class="mui-panel">
            <form id='upload_options' method='POST' action="/config">
                ${!FEATURES.IS_TX ? html`
                <div class="mui-select">
                    <select id="vbind" name="vbind" @change="${this._handleBindTypeChange}">
                        <option value="0">Persistent (Default) - Bind information is stored across reboots</option>
                        <option value="1">Volatile - Never store bind information across reboots</option>
                        <option value="2">Returnable - Unbinding a receiver reverts to flashed binding phrase</option>
                        <option value="3">Administered - Binding information can only be edited through web UI</option>
                    </select>
                    <label for="vbind">Binding storage</label>
                </div>
                ` : ''}
                ${this.bindType!=="1" ? html`
                <div>
                    Enter a new binding phrase to replace the current binding information.
                    This will persist across reboots, but <b>will be reset</b> if the firmware is flashed with a binding phrase.
                    Note: The Binding phrase is not remembered, it is a temporary field used to generate the binding UID.
                    <br/><br/>
                    <div class="mui-textfield">
                        <input type="text" id="phrase" name="phrase" placeholder="Binding Phrase" @input="${this.updateBindingPhrase}"/>
                        <label for="phrase">Binding Phrase</label>
                    </div>
                </div>
                ` : ''}
                <div class="mui-textfield">
                    <label for='uid'><span id="uid-text"></span></label>
                    ${this.bindType !== "1" ? html`
                    <span class="badge" id="uid-type" style="background-color: ${this.uidData.bg}; color: ${this.uidData.fg}">${this.uidData.uidtype}</span>
                    ` : ''}
                    <input size='40' id='uid' name='uid' type='text' class='array' readonly value="${this.uid}"/>
                </div>
                ${FEATURES.HAS_SUBGHZ ? html`
                <input id='domain' name='domain' type="hidden"/>
                ` : html``}
                <input type="hidden" id="wifi-on-interval" name="wifi-on-interval"/>
                ${FEATURES.IS_TX ? html`
                <input id='tlm-interval' name='tlm-interval' type='hidden'/>
                <input id='fan-runtime' name='fan-runtime' type='hidden'/>
                <input id='is-airport' name='is-airport' type='hidden'/>
                <input id='airport-uart-baud' name='airport-uart-baud' type='hidden'/>
                ` : html``}
                ${!FEATURES.IS_TX ? html`
                <input id='rcvr-uart-baud' name='rcvr-uart-baud' type='hidden'/>
                <input id='lock-on-first-connection' name='lock-on-first-connection' type='hidden'/>
                <input id='is-airport' name='is-airport' type='hidden'/>
                <input id='dji-permanently-armed' name='dji-permanently-armed' type='hidden'/>
                ` : html``}
                <input type="hidden" id="flash-discriminator" name="flash-discriminator"/>
                <input type="hidden" id="wifi-ssid" name="wifi-ssid"/>
                <input type="hidden" id='wifi-password' name='wifi-password'/>
                <button id='submit-options' class="mui-btn mui-btn--primary" ?disabled=${this.uidData.uidtype !== 'Modified'} @click="${this.submitOptions}">Save</button>
            </form>
        </div>
    `;
  }

    calcMD5(str) {
        let b; let c; let d; let j;
        const x = [];
        const str2 = unescape(encodeURI(str));
        let a = str2.length;
        const h = [b = 1732584193, c = -271733879, ~b, ~c];
        let i = 0;

        for (; i <= a;) x[i >> 2] |= (str2.charCodeAt(i) || 128) << 8 * (i++ % 4);

        x[str = (a + 8 >> 6) * 16 + 14] = a * 8;
        i = 0;

        for (; i < str; i += 16) {
            a = h; j = 0;
            for (; j < 64;) {
                a = [
                    d = a[3],
                    ((b = a[1] | 0) +
                        ((d = (
                            (a[0] +
                                [
                                    b & (c = a[2]) | ~b & d,
                                    d & b | ~d & c,
                                    b ^ c ^ d,
                                    c ^ (b | ~d)
                                ][a = j >> 4]
                            ) +
                            (this.k[j] +
                                (x[[
                                    j,
                                    5 * j + 1,
                                    3 * j + 5,
                                    7 * j
                                ][a] % 16 + i] | 0)
                            )
                        )) << (a = [
                            7, 12, 17, 22,
                            5, 9, 14, 20,
                            4, 11, 16, 23,
                            6, 10, 15, 21
                        ][4 * a + j++ % 4]) | d >>> 32 - a)
                    ),
                    b,
                    c
                ];
            }
            for (j = 4; j;) h[--j] = h[j] + a[j];
        }

        str = [];
        for (; j < 32;) str.push(((h[j >> 3] >> ((1 ^ j++ & 7) * 4)) & 15) * 16 + ((h[j >> 3] >> ((1 ^ j++ & 7) * 4)) & 15));

        return new Uint8Array(str);
    }

    isValidUidByte(s) {
        let f = parseFloat(s);
        return !isNaN(f) && isFinite(s) && Number.isInteger(f) && f >= 0 && f < 256;
    }

    uidBytesFromText(text) {
        // If text is 4-6 numbers separated with [commas]/[spaces] use as a literal UID
        // This is a strict parser to not just extract numbers from text, but only accept if text is only UID bytes
        if (/^[0-9, ]+$/.test(text))
        {
            let asArray = text.split(',').filter(this.isValidUidByte).map(Number);
            if (asArray.length >= 4 && asArray.length <= 6)
            {
                while (asArray.length < 6)
                    asArray.unshift(0);
                return asArray;
            }
        }

        const bindingPhraseFull = `-DMY_BINDING_PHRASE="${text}"`;
        const bindingPhraseHashed = this.calcMD5(bindingPhraseFull);
        return bindingPhraseHashed.subarray(0, 6);
    }

    updateBindingPhrase(e) {
        let text = e.target.value
        if (text.length === 0) {
            this.uid = this.originalUID.toString();
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
        }
        else if (uidtype === 'Flashed') // TX
        {
            bg = '#1976D2'; // blue/white
            desc = 'The binding UID was generated from a binding phrase set at flash time';
        }
        else if (uidtype === 'Overridden') // TX
        {
            bg = '#689F38'; // green/black
            fg = 'black';
            desc = 'The binding UID has been generated from a binding phrase previously entered into the "binding phrase" field above';
        }
        else if (uidtype === 'Modified') // edited here
        {
            bg = '#7c00d5'; // purple
            desc = 'The binding UID has been modified, but not yet saved';
        }
        else if (uidtype === 'Volatile') // RX
        {
            bg = '#FFA000'; // amber
            desc = 'The binding UID will be cleared on boot';
        }
        else if (uidtype === 'Loaned') // RX
        {
            bg = '#FFA000'; // amber
            desc = 'This receiver is on loan and can be returned using Lua or three-plug';
        }
        else // RX
        {
            if (_('uid').value.endsWith('0,0,0,0'))
            {
                bg = '#FFA000'; // amber
                uidtype = 'Not bound';
                desc = 'This receiver is unbound and will boot to binding mode';
            }
            else
            {
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
        xhr.open('POST', '/options.json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        // Convert the DOM element into a JSON object containing the form elements
        const formElem = this._('upload_options');
        const formObject = Object.fromEntries(new FormData(formElem));
        // Add in all the unchecked checkboxes which will be absent from a FormData object
        formElem.querySelectorAll('input[type=checkbox]:not(:checked)').forEach((k) => formObject[k.name] = false);
        // Force customised to true as this is now customising it
        formObject['customised'] = true;
        // Serialize and send the formObject
        const _this = this
        xhr.send(JSON.stringify(formObject, function(k, v) {
            if (v === '') return undefined;
            if (_this._(k)) {
                if (_this._(k).type === 'color') return undefined;
                if (_this._(k).type === 'checkbox') return v === 'on';
                if (_this._(k).classList.contains('datatype-boolean')) return v === 'true';
                if (_this._(k).classList.contains('array')) {
                    const arr = v.split(',').map((element) => {
                        return Number(element);
                    });
                    return arr.length === 0 ? undefined : arr;
                }
            }
            if (typeof v === 'boolean') return v;
            if (v === 'true') return true;
            if (v === 'false') return false;
            return isNaN(v) ? v : +v;
        }));

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
                        this._('phrase').value = '';
                        this.updateUIDType(this.originalUIDType);
                    }
                    if (e === 'confirm') {
                        const r = new XMLHttpRequest();
                        r.open('POST', '/reboot');
                        r.setRequestHeader('Content-Type', 'application/json');
                        r.onreadystatechange = function() {};
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
