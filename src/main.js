import {_, _c} from './assets/libs.js'
import './assets/mui.js'
import './components/elrs-logo.js'
import './pages/continuous-wave.js'
import './pages/lr1121-updater.js'
import './pages/hardware-layout.js'
import './pages/binding-panel.js'
import './pages/options-panel.js'
import './pages/wifi-panel.js'
import './pages/update-panel.js'
import './pages/model-panel.js'
import './pages/buttons-panel.js'

document.addEventListener('DOMContentLoaded', () => {
    const bodyEl = document.body;
    const sidedrawerEl = _('sidedrawer');

    // App state loaded at startup
    const appState = { options: null, config: null };
    let initialDataPromise = null;

    async function loadInitialData() {
        try {
            const resp = await fetch('/config');
            if (!resp.ok) throw new Error('Failed to load config');
            const data = await resp.json();
            appState.options = data.options || null;
            appState.config = data.config || null;
        } catch (e) {
            // Leave state nulls on failure; panels that depend on data should handle gracefully
            // Optionally log
            console.warn('Startup data load failed:', e);
        }
    }

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

    // Simple hash-based routing for panels
    const mainEl = _('main');

    function scrollMainToTop() {
        const doScroll = (behavior = 'smooth') => {
            if (typeof window.scrollTo === 'function') {
                try {
                    window.scrollTo({ top: 0, left: 0, behavior });
                } catch (_) {
                    // Older browsers don't support options object
                    window.scrollTo(0, 0);
                }
            } else {
                // Fallback if window.scrollTo isn't available
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }
        };
        requestAnimationFrame(() => requestAnimationFrame(() => doScroll('smooth')));
    }

    function setActiveMenu(route) {
        const links = sidedrawerEl.querySelectorAll('a[href^="#"]');
        links.forEach(a => a.classList.remove('active'));
        let id = null;
        switch (route) {
            case 'binding': id = 'menu-binding'; break;
            case 'options': id = 'menu-options'; break;
            case 'wifi': id = 'menu-wifi'; break;
            case 'update': id = 'menu-update'; break;
            case 'model': id = 'menu-model'; break;
            case 'buttons': id = 'menu-buttons'; break;
            case 'hardware': id = 'menu-hardware'; break;
            case 'lr1121': id = 'menu-lr1121'; break;
            case 'cw':
            default: id = 'menu-cw';
        }
        const el = id ? document.getElementById(id) : null;
        if (el) el.classList.add('active');
    }

    function renderRoute() {
        const route = (location.hash || '#cw').replace('#', '');
        switch (route) {
            case 'binding': {
                mainEl.innerHTML = '';
                const el = document.createElement('binding-panel');
                if (appState.config) {
                    // Pass config object to the binding panel as a property
                    el.config = appState.config;
                    el.options = appState.options;
                }
                mainEl.appendChild(el);
                break;
            }
            case 'options':
                mainEl.innerHTML = '<options-panel></options-panel>';
                break;
            case 'wifi':
                mainEl.innerHTML = '<wifi-panel></wifi-panel>';
                break;
            case 'update':
                mainEl.innerHTML = '<update-panel></update-panel>';
                break;
            case 'model':
                mainEl.innerHTML = '<model-panel></model-panel>';
                break;
            case 'buttons':
                mainEl.innerHTML = '<buttons-panel></buttons-panel>';
                break;
            case 'hardware':
                mainEl.innerHTML = '<hardware-layout></hardware-layout>';
                break;
            case 'lr1121':
                mainEl.innerHTML = '<lr1121-updater></lr1121-updater>';
                break;
            case 'cw':
            default:
                mainEl.innerHTML = '<continuous-wave></continuous-wave>';
        }
        setActiveMenu(route);
        // Close sidedrawer after navigation on small screens
        try { mui.overlay('off'); } catch (e) {}
        bodyEl.classList.remove('hide-sidedrawer');
        sidedrawerEl.classList.remove('active');
        // Smoothly scroll the main area to the top on each route change
        scrollMainToTop();
    }

    // Bind menu links (optional: just to ensure overlay closes quickly)
    const hwLink = _('menu-hardware');
    const cwLink = _('menu-cw');
    const lrLink = _('menu-lr1121');
    const bindLink = _('menu-binding');
    const optLink = _('menu-options');
    const wifiLink = _('menu-wifi');
    const updLink = _('menu-update');
    const modelLink = _('menu-model');
    const btnLink = _('menu-buttons');
    if (hwLink) hwLink.addEventListener('click', () => setTimeout(renderRoute));
    if (cwLink) cwLink.addEventListener('click', () => setTimeout(renderRoute));
    if (lrLink) lrLink.addEventListener('click', () => setTimeout(renderRoute));
    if (bindLink) optLink.addEventListener('click', () => setTimeout(renderRoute));
    if (optLink) optLink.addEventListener('click', () => setTimeout(renderRoute));
    if (wifiLink) wifiLink.addEventListener('click', () => setTimeout(renderRoute));
    if (updLink) updLink.addEventListener('click', () => setTimeout(renderRoute));
    if (modelLink) modelLink.addEventListener('click', () => setTimeout(renderRoute));
    if (btnLink) btnLink.addEventListener('click', () => setTimeout(renderRoute));

    window.addEventListener('hashchange', renderRoute);
    // Initial data load then initial render
    initialDataPromise = loadInitialData().catch(() => {}).then(() => {
        renderRoute();
    });
});
