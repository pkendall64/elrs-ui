import {css, html, LitElement} from 'lit';
import {customElement, property} from "lit/decorators.js";

@customElement('file-drop')
export class FileDrop extends LitElement {
    static styles = css`
        .drop-zone {
            font-weight: bold;
            text-align: center;
            padding: 1em 0;
            margin: 1em 0;
            color: #555;
            border: 2px dashed #555;
            border-radius: 7px;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }

        .drop-zone.dragover {
            color: #f00;
            border-color: #f00;
            border-style: solid;
            box-shadow: inset 0 3px 4px #888;
        }
    `;

    @property()
    accessor label

    render() {
        return html`
            <link rel="stylesheet" href="./src/assets/elrs.css">
            <link rel="stylesheet" href="./src/assets/mui.css">
            <button class="mui-btn mui-btn--small mui-btn--primary upload">
                <label>
                    ${this.label}
                    <input type="file" id="fileselect" name="fileselect[]" @change=${this._selectFiles}/>
                </label>
            </button>
            <div
                    class="drop-zone"
                    @dragover=${this._handleDragOver}
                    @dragleave=${this._handleDragLeave}
                    @drop=${this._handleDrop}
            >
                <slot></slot>
            </div>
        `;
    }

    _handleDragOver(event) {
        event.preventDefault(); // This is necessary to allow a drop.
        this.shadowRoot.querySelector('.drop-zone').classList.add('dragover');
    }

    _handleDragLeave() {
        this.shadowRoot.querySelector('.drop-zone').classList.remove('dragover');
    }

    _handleDrop(event) {
        event.preventDefault(); // Prevent file from being opened by the browser.
        this.shadowRoot.querySelector('.drop-zone').classList.remove('dragover');
        this._callback(event.dataTransfer.files);
    }

    _selectFiles(event) {
        this._callback(event.target.files);
    }

    _callback(files) {
        if (files.length) {
            // Dispatch a custom 'file-drop' event with the files in the detail property.
            this.dispatchEvent(new CustomEvent('file-drop', {
                detail: {files},
                bubbles: true,
                composed: true
            }));
        }

    }
}
