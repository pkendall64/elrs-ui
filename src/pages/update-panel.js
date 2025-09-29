import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import '../assets/mui.js';
import '../components/filedrag.js'

@customElement('update-panel')
class UpdatePanel extends LitElement {
    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <div class="mui-panel mui--text-title">Firmware Update</div>
            <div class="mui-panel">
                <p>
                    Select the correct <strong>firmware.bin</strong> for your platform otherwise a bad flash may occur.
                    If this happens you will need to recover via USB/Serial. You may also download the <a
                        href="firmware.bin" title="Click to download firmware">currently running firmware</a>.
                </p>
                <file-drop id="firmware-upload" label="Select firmware file">or drop firmware file here</file-drop>
                <br/>
                <h3 id="status"></h3>
                <progress id="progressBar" value="0" max="100" style="width:100%;"></progress>
            </div>
        `;
    }
}
