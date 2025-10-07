import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import {elrsState} from "../utils/state.js";
import '../assets/mui.js';

@customElement('info-panel')
class InfoPanel extends LitElement {
    createRenderRoot() {
        return this;
    }

    render() {
        return html`
        <div class="mui-panel mui--text-title">Information</div>
        <div class="mui-panel">
            
        </div>`
    }

}