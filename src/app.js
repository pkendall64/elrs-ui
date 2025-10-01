import {LitElement, html, svg} from 'lit';
import {customElement, query} from "lit/decorators.js";
import './assets/mui.js';
import './components/elrs-logo.js';

import './pages/continuous-wave.js';
import './pages/lr1121-updater.js';
import './pages/hardware-layout.js';
import './pages/binding-panel.js';
import './pages/options-panel.js';
import './pages/wifi-panel.js';
import './pages/update-panel.js';
import './pages/model-panel.js';
import './pages/buttons-panel.js';

@customElement('elrs-app')
export class App extends LitElement {
    @query("#sidedrawer") accessor sidedrawerEl;
    @query("#main") accessor mainEl;

    constructor() {
        super();
        this.appState = {options: null, config: null};
        // Bind methods used as callbacks to preserve `this`
        this.renderRoute = this.renderRoute.bind(this);
        this.showSidedrawer = this.showSidedrawer.bind(this);
        this.hideSidedrawer = this.hideSidedrawer.bind(this);
    }

    menu = svg`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="48" d="M88 152h336M88 256h336M88 360h336"/></svg>`

    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <div id="sidedrawer" class="mui--no-user-select">
                <div id="sidedrawer-brand" class="mui--appbar-line-height">
                    <span class="mui--text-headline">ExpressLRS</span>
                </div>
                <div class="mui-divider"></div>
                <ul>
                    <li>
                        <strong>General</strong>
                        <ul>
                            <li><a id="menu-binding" href="#binding"><span class="mui--align-middle icon--symbols icon--symbols--bind"></span>Binding</a></li>
                            <li><a id="menu-options" href="#options"><span class="mui--align-middle icon--symbols icon--symbols--options"></span>Options</a></li>
                            <li><a id="menu-wifi" href="#wifi"><span class="mui--align-middle icon--symbols icon--symbols--wifi"></span>WiFi</a></li>
                            <li><a id="menu-update" href="#update"><span class="mui--align-middle icon--symbols icon--symbols--update"></span>Update</a></li>
                            <li><a id="menu-model" href="#model"><span class="mui--align-middle icon--symbols icon--symbols--connections"></span>Model</a></li>
                            <li><a id="menu-buttons" href="#buttons"><span class="mui--align-middle icon--symbols icon--symbols-buttons"></span>Buttons</a></li>
                        </ul>
                    </li>
                    <li>
                        <strong>Advanced</strong>
                        <ul>
                            <li><a id="menu-hardware" href="#hardware"><span class="mui--align-middle icon--symbols icon--symbols--hardware"></span>Hardware Layout</a></li>
                            <li><a id="menu-cw" href="#cw"><span class="mui--align-middle icon--symbols icon--symbols--wave"></span>Continuous Wave</a></li>
                            <li><a id="menu-lr1121" href="#lr1121"><span class="mui--align-middle icon--symbols icon--symbols--lr1121"></span>LR1121 Firmware</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
            <header id="header">
                <div class="mui-appbar mui--appbar-line-height ">
                    <a class="mui--align-middle sidedrawer-toggle mui--visible-xs-inline-block mui--visible-sm-inline-block js-show-sidedrawer"
                       @click="${this.showSidedrawer}">${this.menu}</a>
                    <a class="mui--align-middle sidedrawer-toggle mui--hidden-xs mui--hidden-sm js-hide-sidedrawer"
                       @click="${this.hideSidedrawer}">${this.menu}</a>
                    <span class="mui--text-display1 mui--align-middle">ExpressLRS</span>
                    <elrs-logo class="mui--align-middle" width="50px"></elrs-logo>
                </div>
            </header>
            <div id="content-wrapper">
                <div class="mui--appbar-height"></div>
                <div id="main" class="mui-container-fluid"></div>
            </div>
            <footer id="footer">
                <div class="mui-container-fluid">
                    <br/>
                    Made with ♥ by <a href="https://www.muicss.com">MUI</a>
                </div>
            </footer>
        `;
    }

    firstUpdated(_changedProperties) {
        // Bind menu links to rerender quickly
        ['hardware', 'cw', 'lr1121', 'binding', 'options', 'wifi', 'update', 'model', 'buttons']
            .forEach(id => {
                const el = this.querySelector(`#menu-${id}`);
                if (el) el.addEventListener('click', () => setTimeout(this.renderRoute));
            });

        window.addEventListener('hashchange', this.renderRoute);

        // Initial load sequence
        this.loadInitialData().catch(() => {
        }).then(() => {
            this.renderRoute();
        });
    }

    async loadInitialData() {
        try {
            const resp = await fetch('/config');
            if (!resp.ok) throw new Error('Failed to load config');
            const data = await resp.json();
            this.appState.options = data.options || null;
            this.appState.config = data.config || null;
        } catch (e) {
            console.warn('Startup data load failed:', e);
        }
    };

    scrollMainToTop() {
        const doScroll = (behavior = 'smooth') => {
            try {
                window.scrollTo({top: 0, left: 0, behavior});
            } catch {
                window.scrollTo(0, 0);
            }
        };
        requestAnimationFrame(() => requestAnimationFrame(() => doScroll('smooth')));
    };

    setActiveMenu(route) {
        // Sidedrawer may be moved into MUI overlay, making @query return null; resolve robustly
        const sidedrawer = this.sidedrawerEl || this.querySelector('#sidedrawer') || document.getElementById('sidedrawer');
        if (sidedrawer) {
            const links = sidedrawer.querySelectorAll('a[href^="#"]');
            links.forEach(a => a.classList.remove('active'));
        }
        const id = 'menu-' +route;
        const el = id ? (this.querySelector(`#${id}`) || document.getElementById(id)) : null;
        if (el) el.classList.add('active');
    };

    buildRouteContent(route) {
        switch (route) {
            case 'binding': {
                const el = document.createElement('binding-panel');
                if (this.appState.config) {
                    el.config = this.appState.config;
                    el.options = this.appState.options;
                }
                return el;
            }
            case 'options':
                return '<options-panel></options-panel>';
            case 'wifi':
                return '<wifi-panel></wifi-panel>';
            case 'update':
                return '<update-panel></update-panel>';
            case 'model':
                return '<model-panel></model-panel>';
            case 'buttons':
                return '<buttons-panel></buttons-panel>';
            case 'hardware':
                return '<hardware-layout></hardware-layout>';
            case 'lr1121':
                return '<lr1121-updater></lr1121-updater>';
            case 'cw':
            default:
                return '<continuous-wave></continuous-wave>';
        }
    };

    replaceMainWithTransition(newContent) {
        return new Promise(resolve => {
            const onEnd = () => {
                this.mainEl.removeEventListener('transitionend', onEnd);
                if (typeof newContent === 'string') {
                    this.mainEl.innerHTML = newContent;
                } else if (newContent instanceof Node) {
                    this.mainEl.innerHTML = '';
                    this.mainEl.appendChild(newContent);
                } else {
                    this.mainEl.innerHTML = '';
                }
                this.mainEl.classList.add('route-fade-in');
                requestAnimationFrame(() => {
                    this.mainEl.classList.remove('route-fade-out');
                    requestAnimationFrame(() => {
                        this.mainEl.classList.remove('route-fade-in');
                        resolve();
                    });
                });
            };
            this.mainEl.addEventListener('transitionend', onEnd);
            this.mainEl.classList.add('route-fade-out');
            setTimeout(onEnd, 220);
        })
    };

    renderRoute() {
        const route = (location.hash || '#cw').replace('#', '');
        this.setActiveMenu(route);
        try {
            mui.overlay('off');
        } catch {
        }
        document.body.classList.remove('hide-sidedrawer');
        // Sidedrawer may be temporarily moved out of renderRoot; guard lookup
        const sd = this.querySelector('#sidedrawer') || document.getElementById('sidedrawer');
        if (sd) sd.classList.remove('active');
        const content = this.buildRouteContent(route);
        this.replaceMainWithTransition(content).then(() => this.scrollMainToTop());
    };

    showSidedrawer() {
        // Capture a stable reference before moving the node so @query doesn't return null
        const sidedrawer = this.sidedrawerEl;
        if (!sidedrawer) return;
        const options = {
            onclose: () => {
                sidedrawer.classList.remove('active');
                // Append back into the component so @query can find it again
                this.appendChild(sidedrawer);
            }
        };
        const overlayEl = mui.overlay('on', options);
        overlayEl.appendChild(sidedrawer);
        setTimeout(() => sidedrawer.classList.add('active'), 20);
    };

    hideSidedrawer() {
        document.body.classList.toggle('hide-sidedrawer');
    };
}
