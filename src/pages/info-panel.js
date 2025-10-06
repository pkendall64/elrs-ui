import {html, LitElement} from "lit";
import {customElement, query, state} from "lit/decorators.js";
import FEATURES from "../features.js";
import {elrsState} from "../utils/state.js";
import '../assets/mui.js';

@customElement('info-panel')
class InfoPanel extends LitElement {
    render() {
        return html`
        <div class="mui-panel mui--text-title">Information</div>
        `
    }

}