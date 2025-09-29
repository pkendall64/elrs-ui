import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import '../assets/mui.js';

@customElement('buttons-panel')
class ButtonsPanel extends LitElement {
    createRenderRoot() {
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
                    <table class="mui-table">
                        <tbody id="button-actions"></tbody>
                    </table>
                    <div id="button1-color-div" style="display: none;">
                        <input id='button1-color' name='button1-color' type='color'/>
                        <label for="button1-color">User button 1 color</label>
                    </div>
                    <div id="button2-color-div" style="display: none;">
                        <input id='button2-color' name='button2-color' type='color'/>
                        <label for="button2-color">User button 2 color</label>
                    </div>
                    <button id="submit-actions" class="mui-btn mui-btn--primary">Save</button>
                </form>
            </div>
        `;
    }
}
