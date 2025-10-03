import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import '../assets/mui.js';

@customElement('models-panel')
class ModelsPanel extends LitElement {
    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <div class="mui-panel mui--text-title">Model Configurations</div>
            <div class="mui-panel">
                <p>Backup and restore your model configurations stored in the transmitter module</p>
                <div>
                    <a href="/config?export" download="models.json" target="_blank"
                       class="mui-btn mui-btn--primary">Export model configurations file</a>
                </div>
                <div>
                    <button class="mui-btn mui-btn--accent upload">
                        <label>
                            Import model configuration file
                            <input type="file" id="fileselect" name="fileselect[]"/>
                        </label>
                    </button>
                </div>
            </div>
        `;
    }
}
