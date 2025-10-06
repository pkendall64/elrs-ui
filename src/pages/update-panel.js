import {html, LitElement} from "lit";
import {customElement} from "lit/decorators.js";
import '../assets/mui.js';
import '../components/filedrag.js'
import FEATURES from "../features.js";
import {cuteAlert} from "../utils/feedback.js";
import {_} from "../utils/libs.js";

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
                <file-drop id="firmware-upload" label="Select firmware file" @file-drop="${this._fileSelectHandler}">or drop firmware file here</file-drop>
                <br/>
                <h3 id="status"></h3>
                <progress id="progressBar" value="0" max="100" style="width:100%;"></progress>
            </div>
        `;
    }


    _fileSelectHandler(e) {
        // ESP32 expects .bin, ESP8285 RX expect .bin.gz
        const files = e.detail.files;
        const fileExt = files[0].name.split('.').pop();
        let expectedFileExt
        let expectedFileExtDesc
        if (FEATURES.IS_8285 && !FEATURES.IS_TX) {
            expectedFileExt = 'gz';
            expectedFileExtDesc = '.bin.gz file. <br />Do NOT decompress/unzip/extract the file!';
        } else {
            expectedFileExt = 'bin';
            expectedFileExtDesc = '.bin file.';
        }
        if (fileExt === expectedFileExt) {
            this._uploadFile(files[0]);
        } else {
            cuteAlert({
                type: 'error',
                title: 'Incorrect File Format',
                message: 'You selected the file &quot;' + files[0].name.toString() + '&quot;.<br />The firmware file must be a ' + expectedFileExtDesc
            });
        }
    }

    _uploadFile(file) {
        const formdata = new FormData();
        formdata.append('upload', file, file.name);
        const ajax = new XMLHttpRequest();
        ajax.upload.addEventListener('progress', this._progressHandler, false);
        ajax.addEventListener('load', this._completeHandler, false);
        ajax.addEventListener('error', this._errorHandler, false);
        ajax.addEventListener('abort', this._abortHandler, false);
        ajax.open('POST', '/update');
        ajax.setRequestHeader('X-FileSize', file.size);
        ajax.send(formdata);
    }

    _progressHandler(event) {
        // _("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
        const percent = Math.round((event.loaded / event.total) * 100);
        _('progressBar').value = percent;
        _('status').innerHTML = percent + '% uploaded... please wait';
    }

    _completeHandler(event) {
        _('status').innerHTML = '';
        _('progressBar').value = 0;
        const data = JSON.parse(event.target.responseText);
        if (data.status === 'ok') {
            function showMessage() {
                cuteAlert({
                    type: 'success',
                    title: 'Update Succeeded',
                    message: data.msg
                });
            }
            // This is basically a delayed display of the success dialog with a fake progress
            let percent = 0;
            const interval = setInterval(()=>{
                if (FEATURES.IS_8285)
                    percent = percent + 1;
                else
                    percent = percent + 2;

                _('progressBar').value = percent;
                _('status').innerHTML = percent + '% flashed... please wait';
                if (percent === 100) {
                    clearInterval(interval);
                    _('status').innerHTML = '';
                    _('progressBar').value = 0;
                    showMessage();
                }
            }, 100);
        } else if (data.status === 'mismatch') {
            cuteAlert({
                type: 'question',
                title: 'Targets Mismatch',
                message: data.msg,
                confirmText: 'Flash anyway',
                cancelText: 'Cancel'
            }).then((e)=>{
                const xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        _('status').innerHTML = '';
                        _('progressBar').value = 0;
                        if (this.status === 200) {
                            const data = JSON.parse(this.responseText);
                            cuteAlert({
                                type: 'info',
                                title: 'Force Update',
                                message: data.msg
                            });
                        } else {
                            cuteAlert({
                                type: 'error',
                                title: 'Force Update',
                                message: 'An error occurred trying to force the update'
                            });
                        }
                    }
                };
                xmlhttp.open('POST', '/forceupdate', true);
                const data = new FormData();
                data.append('action', e);
                xmlhttp.send(data);
            });
        } else {
            cuteAlert({
                type: 'error',
                title: 'Update Failed',
                message: data.msg
            });
        }
    }

    _errorHandler(event) {
        _('status').innerHTML = '';
        _('progressBar').value = 0;
        return cuteAlert({
            type: 'error',
            title: 'Update Failed',
            message: event.target.responseText
        });
    }

    _abortHandler(event) {
        _('status').innerHTML = '';
        _('progressBar').value = 0;
        return cuteAlert({
            type: 'info',
            title: 'Update Aborted',
            message: event.target.responseText
        });
    }
}
