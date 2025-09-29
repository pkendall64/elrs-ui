import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import '../components/filedrag.js'
import '../assets/mui.js'
import {cuteAlert} from '../assets/libs.js'
import HARDWARE_SCHEMA from '../utils/hardware-schema.js'

@customElement('hardware-layout')
export class HardwareLayout extends LitElement {
    static styles = css`
        img.icon-input {
            content: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='700pt' height='700pt' version='1.1' viewBox='0 0 700 700' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m326.67 46.668h46.664v260.54l140-140 32.996 32.992-196.33 196.33-196.33-196.33 32.996-32.992 140 140zm210 396.66v-93.332h46.664v140h-466.66v-140h46.664v93.332z' fill='%2312B0FB' fill-rule='evenodd'/%3E%3C/svg%3E%0A");
            display: block;
            height: 1.5em;
            width: 1.5em;
            float: left;
        }

        td img.icon-input {
            float: right;
        }

        img.icon-output {
            content: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='700pt' height='700pt' version='1.1' viewBox='0 0 700 700' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m373.33 396.67h-46.664v-283.88l-140 140-32.996-32.992 196.33-196.33 196.33 196.33-32.996 32.992-140-140zm163.34 46.664v-93.332h46.664v140h-466.66v-140h46.664v93.332z' fill='%2371D358' fill-rule='evenodd'/%3E%3C/svg%3E%0A");
            display: block;
            height: 1.5em;
            width: 1.5em;
            float: left;
        }

        td img.icon-output {
            float: right;
        }

        img.icon-analog {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cg fill='none' stroke='%23ff9800' stroke-width='4'%3E%3Cpath d='M8 52V12M56 52V12M8 22h12l8 20h8l8-14h12'/%3E%3C/g%3E%3C/svg%3E");
            display: block;
            height: 1.5em;
            width: 1.5em;
            float: left;
        }

        td img.icon-analog {
            float: right;
        }

        img.icon-pwm {
            content: url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23C462DD' stroke-width='10' stroke-linecap='undefined' stroke-linejoin='undefined' fill='none'%3E%3Cline y2='318' x2='2' y1='318' x1='106'/%3E%3Cline y2='74' x2='105' y1='323.00001' x1='105'/%3E%3Cline y2='79' x2='254.00001' y1='79' x1='106'/%3E%3Cline y2='323' x2='249' y1='79' x1='249'/%3E%3Cline y2='318' x2='248' y1='318' x1='320'/%3E%3Cline y2='317' x2='315' y1='77' x1='315'/%3E%3Cline y2='77' x2='310' y1='77' x1='377'/%3E%3Cline y2='78' x2='372' y1='322.00001' x1='372'/%3E%3Cline y2='317' x2='371' y1='317' x1='399'/%3E%3C/g%3E%3C/svg%3E");
            display: block;
            height: 1.5em;
            width: 1.5em;
            float: left;
        }

        td img.icon-pwm {
            float: right;
        }
    `;

    @state() accessor customised = false;

    // Data-driven schema for table rows and sections
    static SCHEMA = HARDWARE_SCHEMA;

    _renderIcon(icon) {
        if (!icon) return html``;
        if (icon === 'input-output') {
            return html`<img class="icon-input"/><img class="icon-output"/>`;
        }
        return html`<img class="icon-${icon}"/>`;
    }

    _renderField(row) {
        const common = (extraClass = '') => ({id: row.id, name: row.id, class: extraClass || row.className || ''});
        switch (row.type) {
            case 'checkbox':
                return html`<input id="${row.id}" name="${row.id}" type="checkbox"/>`;
            case 'select':
                return html`<select id="${row.id}" name="${row.id}">
                    ${row.options?.map(opt => html`
                        <option value="${opt.value}">${opt.label}</option>`)}
                </select>`;
            case 'text':
            default:
                const cls = row.className ? row.className : '';
                const sizeAttr = row.size ? `size="${row.size}"` : '';
                return html`<input ${sizeAttr} id="${row.id}" name="${row.id}" type="text" class="${cls}"/>`;
        }
    }

    render() {
        return html`
            <link rel="stylesheet" href="./src/assets/elrs.css"/>
            <link rel="stylesheet" href="./src/assets/mui.css"/>
            <div class="mui-panel mui--text-title">Hardware Layout</div>
            <div id="custom_config" class="mui-panel"
                 style="display:${this.customised ? 'block' : 'none'}; background-color: #FFC107;">
                This hardware configuration has been customised. This can be safely ignored if this is a custom hardware
                build or for testing purposes.<br>
                You can <a download href="/hardware.json">download</a> the configuration or <a href="/reset?hardware">reset</a>
                to pre-configured defaults and reboot.
            </div>
            <div class="mui-panel">
                <label>Upload target configuration (remember to press "Save Target Configuration" below):</label>
                <file-drop id="filedrag" label="Upload" @file-drop=${this._onFileDrop}>or drop files here</file-drop>
            </div>
            <div class="mui-panel">
                <form id="upload_hardware" method="POST" action="/hardware">
                    <input type="hidden" id="customised" name="customised" value="true"/>
                    ${this._renderTable()}
                    <br>
                    <input id="submit-config" type="button" value="Save Target Configuration"
                           class="mui-btn mui-btn--primary" @click=${this._submitConfig}/>
                </form>
            </div>
        `;
    }

    _renderTable() {
        return html`
            <table>
                ${this.constructor.SCHEMA.map(section => html`
                    <tr>
                        <td colspan="4"><b>${section.title}</b></td>
                    </tr>
                    ${section.rows.map(row => html`
                        <tr>
                            <td width="30"></td>
                            <td>${row.label}${this._renderIcon(row.icon)}</td>
                            <td>${this._renderField(row)}</td>
                            <td>${row.desc || ''}</td>
                        </tr>
                    `)}
                `)}
            </table>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        // Add tooltips to icon classes after first paint
        setTimeout(() => this._initTooltips(), 0);
        this._loadData();
    }

    _initTooltips() {
        const add = (cls, label) => {
            const images = this.renderRoot.querySelectorAll('.' + cls);
            images.forEach(i => i.setAttribute('title', label));
        };
        add('icon-input', 'Digital Input');
        add('icon-output', 'Digital Output');
        add('icon-analog', 'Analog Input');
        add('icon-pwm', 'PWM Output');
    }

    _loadData() {
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                const data = JSON.parse(xmlhttp.responseText);
                this.customised = !!data.customised;
                this._updateHardwareSettings(data);
            }
        };
        xmlhttp.open('GET', '/hardware.json', true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send();
    }

    _onFileDrop(e) {
        const files = e.detail.files;
        const form = this.renderRoot.getElementById('upload_hardware');
        if (form) form.reset();
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const data = JSON.parse(ev.target.result);
                this._updateHardwareSettings(data);
            };
            reader.readAsText(file);
        }
    }

    _updateHardwareSettings(data) {
        for (const [key, value] of Object.entries(data)) {
            const el = this.renderRoot.getElementById(key);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = !!value;
                } else {
                    if (Array.isArray(value)) el.value = value.toString();
                    else el.value = value;
                }
            }
        }
        const cc = this.renderRoot.getElementById('custom_config');
        if (cc) cc.style.display = data.customised ? 'block' : 'none';
    }

    _submitConfig() {
        const form = this.renderRoot.getElementById('upload_hardware');
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/hardware.json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        const formData = new FormData(form);
        const body = JSON.stringify(Object.fromEntries(formData), (k, v) => {
            if (v === '') return undefined;
            const el = this.renderRoot.getElementById(k);
            if (el && el.type === 'checkbox') {
                return v === 'on';
            }
            if (el && el.classList.contains('array')) {
                const arr = v.split(',').map((element) => Number(element));
                return arr.length === 0 ? undefined : arr;
            }
            return isNaN(v) ? v : +v;
        });
        xhr.send(body);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                cuteAlert({
                    type: 'question',
                    title: 'Upload Succeeded',
                    message: 'Reboot to take effect',
                    confirmText: 'Reboot',
                    cancelText: 'Close'
                }).then((e) => {
                    if (e === 'confirm') {
                        const rx = new XMLHttpRequest();
                        rx.open('POST', '/reboot');
                        rx.setRequestHeader('Content-Type', 'application/json');
                        rx.onreadystatechange = function () {
                        };
                        rx.send();
                    }
                });
            }
        };
        return false;
    }
}
