import {LitElement, html} from 'lit';
import './elrs-logo.js';
import '../assets/mui.js';

import '../pages/continuous-wave.js';
import '../pages/lr1121-updater.js';
import '../pages/hardware-layout.js';
import '../pages/binding-panel.js';
import '../pages/options-panel.js';
import '../pages/wifi-panel.js';
import '../pages/update-panel.js';
import '../pages/model-panel.js';
import '../pages/buttons-panel.js';
import {customElement, query} from "lit/decorators.js";

@customElement('elrs-app')
export class ElrsApp extends LitElement {
    @query("#sidedrawer") accessor sidedrawerEl;
    @query("#main") accessor mainEl;

    constructor() {
        super();
        this.appState = {options: null, config: null};
        this.renderRoute = this.renderRoute.bind(this);
    }

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
                            <li><a id="menu-binding" href="#binding">Binding</a></li>
                            <li><a id="menu-options" href="#options">Options</a></li>
                            <li><a id="menu-wifi" href="#wifi">WiFi</a></li>
                            <li><a id="menu-update" href="#update">Update</a></li>
                            <li><a id="menu-model" href="#model">Model</a></li>
                            <li><a id="menu-buttons" href="#buttons">Buttons</a></li>
                        </ul>
                    </li>
                    <li>
                        <strong>Advanced</strong>
                        <ul>
                            <li><a id="menu-hardware" href="#hardware">Hardware Layout</a></li>
                            <li><a id="menu-cw" href="#cw">Continuous Wave</a></li>
                            <li><a id="menu-lr1121" href="#lr1121">LR1121 Firmware</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
            <header id="header">
                <div class="mui-appbar mui--appbar-line-height">
                    <div class="mui--align-middle">
                        <span class="mui--appbar-height">
                          <a class="sidedrawer-toggle mui--visible-xs-inline-block mui--visible-sm-inline-block js-show-sidedrawer"
                             @click="${this.showSidedrawer}">☰</a>
                          <a class="sidedrawer-toggle mui--hidden-xs mui--hidden-sm js-hide-sidedrawer"
                             @click="${this.hideSidedrawer}">☰</a>
                          <span class="mui--text-display1 mui--align-middle">ExpressLRS</span>
                          <elrs-logo class="mui--align-middle" width="50px"></elrs-logo>
                        </span>
                    </div>
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
        const links = this.sidedrawerEl.querySelectorAll('a[href^="#"]');
        links.forEach(a => a.classList.remove('active'));
        const id = (
            route === 'binding' ? 'menu-binding' :
                route === 'options' ? 'menu-options' :
                    route === 'wifi' ? 'menu-wifi' :
                        route === 'update' ? 'menu-update' :
                            route === 'model' ? 'menu-model' :
                                route === 'buttons' ? 'menu-buttons' :
                                    route === 'hardware' ? 'menu-hardware' :
                                        route === 'lr1121' ? 'menu-lr1121' :
                                            'menu-cw'
        );
        const el = id ? this.querySelector(`#${id}`) : null;
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
        this.sidedrawerEl.classList.remove('active');
        const content = this.buildRouteContent(route);
        const that = this;
        this.replaceMainWithTransition(content).then(that.scrollMainToTop);
    };

    showSidedrawer() {
        const options = {
            onclose: () => {
                this.sidedrawerEl.classList.remove('active');
                document.body.appendChild(this.sidedrawerEl);
            }
        };
        const overlayEl = mui.overlay('on', options);
        overlayEl.appendChild(this.sidedrawerEl);
        setTimeout(() => this.sidedrawerEl.classList.add('active'), 20);
    };

    hideSidedrawer() {
        document.body.classList.toggle('hide-sidedrawer');
    };
}
