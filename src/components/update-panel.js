import '../assets/mui.js';
import './filedrag.js';

class UpdatePanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="mui-panel">
        <h2>Firmware Update</h2>
        Select the correct <strong>firmware.bin</strong> for your platform otherwise a bad flash may occur.
        If this happens you will need to recover via USB/Serial. You may also download the <a href="firmware.bin" title="Click to download firmware">currently running firmware</a>.
        <br/><br/>
        <file-drop id="firmware-upload" label="Select firmware file">or drop firmware file here</file-drop>
        <br/>
        <h3 id="status"></h3>
        <progress id="progressBar" value="0" max="100" style="width:100%;"></progress>
      </div>
    `;
  }
}

customElements.define('update-panel', UpdatePanel);
