import {_, _c} from './assets/libs.js'
import './components/elrs-logo.js'
import './components/continuous-wave.js'
import './assets/mui.js'

document.addEventListener('DOMContentLoaded', () => {
    const bodyEl = document.body;
    const sidedrawerEl = _('sidedrawer');

    function showSidedrawer() {
        const options = {
            onclose: () => {
                sidedrawerEl.classList.remove('active');
                document.body.appendChild(sidedrawerEl);
            }
        };

        const overlayEl = mui.overlay('on', options);
        overlayEl.appendChild(sidedrawerEl);

        setTimeout(() => {
            sidedrawerEl.classList.add('active');
        }, 20);
    }

    function hideSidedrawer() {
        bodyEl.classList.toggle('hide-sidedrawer');
    }

    _c('.js-show-sidedrawer').on('click', showSidedrawer);
    _c('.js-hide-sidedrawer').on('click', hideSidedrawer);
});
