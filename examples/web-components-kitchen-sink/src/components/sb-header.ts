import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import './sb-button';

/**
 * @attr {Object} user - User of the app
 *
 * @event {CustomEvent} sb-header:createAccount - Event send when user clicks on create account button
 * @event {CustomEvent} sb-header:login - Event send when user clicks on login button
 * @event {CustomEvent} sb-header:logout - Event send when user clicks on logout button
 *
 * @summary This is a simple Storybook Header
 *
 * @tag sb-header
 */
@customElement('sb-header')
export class SbHeader extends LitElement {
  static get styles() {
    return css`
      .wrapper {
        font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding: 15px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      svg {
        display: inline-block;
        vertical-align: top;
      }

      h1 {
        font-weight: 900;
        font-size: 20px;
        line-height: 1;
        margin: 6px 0 6px 10px;
        display: inline-block;
        vertical-align: top;
      }

      button + button {
        margin-left: 10px;
      }
    `;
  }

  // Currently TS decorators are not reflected so we have to use static `properties` function
  // https://github.com/Polymer/lit-html/issues/1476
  static get properties() {
    return {
      user: { type: Object, reflect: true },
    };
  }

  user?: Record<string, any>;

  private dispatchCustomEvent(eventName: string) {
    const options = {
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent(`sb-header:${eventName}`, options));
  }

  render() {
    return html`
      <header>
        <div class="wrapper">
          <div>
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fillRule="evenodd">
                <path
                  d="M10 0h12a10 10 0 0110 10v12a10 10 0 01-10 10H10A10 10 0 010 22V10A10 10 0 0110 0z"
                  fill="#FFF"
                />
                <path
                  d="M5.3 10.6l10.4 6v11.1l-10.4-6v-11zm11.4-6.2l9.7 5.5-9.7 5.6V4.4z"
                  fill="#555AB9"
                />
                <path
                  d="M27.2 10.6v11.2l-10.5 6V16.5l10.5-6zM15.7 4.4v11L6 10l9.7-5.5z"
                  fill="#91BAF8"
                />
              </g>
            </svg>
            <h1>Acme</h1>
          </div>
          <div>
            ${this.logInOutButton()}
            <sb-button
              size="small"
              @sb-button:click="${() => this.dispatchCustomEvent('createAccount')}"
              label="Sign up"
            >
            </sb-button>
          </div>
        </div>
      </header>
    `;
  }

  private logInOutButton() {
    return this.user
      ? html`<sb-button size="small" @sb-button:click="${() => this.dispatchCustomEvent('logout')} "
        label = "Log out" </sb-button>`
      : html`<sb-button size="small" @sb-button:click="${() => this.dispatchCustomEvent('login')}"
                        label="Log in" </sb-button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sb-header': SbHeader;
  }
}
