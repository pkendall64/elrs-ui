import {State} from "@lit-app/state";
import {cuteAlert} from "./libs.js";

class ElrsState extends State {
    config = {}
    options = {}
}

async function handleUpdate(xhr, successCB) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            await cuteAlert({
                type: 'question',
                title: 'Configuration Update Succeeded',
                message: 'Reboot to take effect',
                confirmText: 'Reboot',
                cancelText: 'Close'
            }).then((e) => {
                if (successCB) successCB();
                if (e === 'confirm') {
                    const r = new XMLHttpRequest();
                    r.open('POST', '/reboot');
                    r.setRequestHeader('Content-Type', 'application/json');
                    r.onreadystatechange = function () {
                    };
                    r.send();
                }
            });
        } else {
            await cuteAlert({
                type: 'error',
                title: 'Configuration Update Failed',
                message: xhr.responseText
            });
        }
    }
}

export function saveConfig(changes, successCB) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => handleUpdate(xhr, successCB);
    xhr.open('POST', '/config');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(changes));
}

export function saveOptions(changes, successCB) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => handleUpdate(xhr, successCB);
    xhr.open('POST', '/options.json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(changes));
}

export let elrsState = new ElrsState()
