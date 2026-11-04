class VentoxxCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity (fan.ventoxx_harmony_fan)');
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    const entityId = this.config.entity;
    const stateObj = hass.states[entityId];

    if (!stateObj) {
      this.shadowRoot.innerHTML = `<ha-card style="padding: 16px; color: red;">Entity not found: ${entityId}</ha-card>`;
      return;
    }

    const isOn = stateObj.state === 'on';
    const attrs = stateObj.attributes || {};
    const currentSpeed = attrs.speed_level || (attrs.percentage ? Math.round(attrs.percentage / 33.3) : 0);
    const currentMode = attrs.preset_mode || 'recuperation';
    const dstate = attrs.dstate || 0;
    const pairingModes = { 0: 'Незалежний', 1: 'Головний', 2: 'Підлеглий' };
    const pairingName = pairingModes[dstate] || 'Незалежний';

    // Find switches
    const buzzerId = this.config.buzzer || 'switch.ventoxx_harmony_buzzer';
    const displayId = this.config.display || 'switch.ventoxx_harmony_display';
    const buzzerObj = hass.states[buzzerId];
    const displayObj = hass.states[displayId];
    const isBuzzerOn = buzzerObj && buzzerObj.state === 'on';
    const isDisplayOn = displayObj && displayObj.state === 'on';

    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          background: var(--ha-card-background, var(--card-background-color, #1e293b));
          color: var(--primary-text-color, #ffffff);
          border-radius: 16px;
          padding: 16px;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
          box-shadow: var(--ha-card-box-shadow, 0 4px 12px rgba(0,0,0,0.15));
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .title-group {
          display: flex;
          flex-direction: column;
        }
        .title {
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          background: rgba(69, 121, 181, 0.25);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.3);
          align-self: flex-start;
          margin-top: 4px;
        }
        .power-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          background: ${isOn ? 'var(--primary-color, #0284c7)' : 'rgba(255,255,255,0.1)'};
          color: ${isOn ? '#ffffff' : 'var(--disabled-text-color, #64748b)'};
        }
        .power-btn:hover {
          filter: brightness(1.15);
        }
        .section-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--secondary-text-color, #94a3b8);
          margin: 12px 0 6px 0;
        }
        .row {
          display: flex;
          gap: 8px;
          justify-content: space-between;
        }
        .mode-btn {
          flex: 1;
          height: 48px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #ffffff);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          font-size: 11px;
          transition: all 0.2s;
        }
        .mode-btn svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }
        .mode-btn.active {
          background: #ffffff;
          color: #0369a1;
          border-color: #38bdf8;
          font-weight: 700;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        }
        .speed-btn {
          flex: 1;
          height: 44px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #ffffff);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .speed-btn svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
        .speed-btn.active {
          background: #ffffff;
          color: #0369a1;
          border-color: #38bdf8;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        }
        .bottom-toggles {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 12px;
        }
        .toggle-btn {
          flex: 1;
          height: 38px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: var(--secondary-text-color, #94a3b8);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .toggle-btn.active {
          background: rgba(2, 132, 199, 0.2);
          border-color: #38bdf8;
          color: #38bdf8;
          font-weight: 500;
        }
        .toggle-btn svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
      </style>

      <ha-card>
        <div class="header">
          <div class="title-group">
            <div class="title">
              <svg style="width:24px;height:24px;fill:#38bdf8;" viewBox="0 0 24 24">
                <path d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
              </svg>
              ${this.config.name || stateObj.attributes.friendly_name || 'Ventoxx Harmony'}
            </div>
            <div class="badge">Роль: ${pairingName}</div>
          </div>
          <button class="power-btn" id="btn-power" title="Увімкнути/Вимкнути">
            <svg style="width:24px;height:24px;" viewBox="0 0 24 24">
              <path d="M16.56,5.44C15.86,4.74 15.03,4.2 14.12,3.85C13.21,3.5 12.24,3.32 11.27,3.32C10.3,3.32 9.33,3.5 8.42,3.85C7.51,4.2 6.68,4.74 5.98,5.44C3.87,7.55 3.33,10.74 4.38,13.38L3.21,14.55C1.86,11.39 2.5,7.58 5.12,4.96C6.01,4.07 7.07,3.38 8.24,2.94C9.41,2.5 10.65,2.27 11.9,2.27C13.15,2.27 14.39,2.5 15.56,2.94C16.73,3.38 17.79,4.07 18.68,4.96C21.3,7.58 21.94,11.39 20.59,14.55L19.42,13.38C20.47,10.74 19.93,7.55 17.82,5.44M11.9,13.64C12.45,13.64 12.9,13.19 12.9,12.64V1C12.9,0.45 12.45,0 11.9,0C11.35,0 10.9,0.45 10.9,1V12.64C10.9,13.19 11.35,13.64 11.9,13.64Z" />
            </svg>
          </button>
        </div>

        <div class="section-label">Швидкість роботи</div>
        <div class="row">
          <button class="speed-btn ${isOn && currentSpeed >= 1 ? 'active' : ''}" data-speed="1">
            <svg viewBox="0 0 24 24"><path d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12Z"/></svg>
            1
          </button>
          <button class="speed-btn ${isOn && currentSpeed >= 2 ? 'active' : ''}" data-speed="2">
            <svg viewBox="0 0 24 24"><path d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12Z"/></svg>
            2
          </button>
          <button class="speed-btn ${isOn && currentSpeed >= 3 ? 'active' : ''}" data-speed="3">
            <svg viewBox="0 0 24 24"><path d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12Z"/></svg>
            3
          </button>
        </div>

        <div class="section-label">Режим вентиляції</div>
        <div class="row">
          <button class="mode-btn ${isOn && currentMode === 'recuperation' ? 'active' : ''}" data-mode="recuperation" title="Рекуперація (теплообмін)">
            <svg viewBox="0 0 24 24"><path d="M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z"/></svg>
            <span>Рекуп.</span>
          </button>
          <button class="mode-btn ${isOn && currentMode === 'intake' ? 'active' : ''}" data-mode="intake" title="Приплив свіжого повітря">
            <svg viewBox="0 0 24 24"><path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/></svg>
            <span>Приплив</span>
          </button>
          <button class="mode-btn ${isOn && currentMode === 'exhaust' ? 'active' : ''}" data-mode="exhaust" title="Витяжка відпрацьованого повітря">
            <svg viewBox="0 0 24 24"><path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/></svg>
            <span>Витяжка</span>
          </button>
          <button class="mode-btn ${isOn && currentMode === 'intensive_intake' ? 'active' : ''}" data-mode="intensive_intake" title="Інтенсивний приплив">
            <svg viewBox="0 0 24 24"><path d="M5.59,7.41L7,6L13,12L7,18L5.59,16.59L10.17,12L5.59,7.41M11.59,7.41L13,6L19,12L13,18L11.59,16.59L16.17,12L11.59,7.41Z"/></svg>
            <span>Інтенс. П</span>
          </button>
          <button class="mode-btn ${isOn && currentMode === 'intensive_exhaust' ? 'active' : ''}" data-mode="intensive_exhaust" title="Інтенсивна витяжка">
            <svg viewBox="0 0 24 24"><path d="M18.41,16.59L17,18L11,12L17,6L18.41,7.41L13.83,12L18.41,16.59M12.41,16.59L11,18L5,12L11,6L12.41,7.41L7.83,12L12.41,16.59Z"/></svg>
            <span>Інтенс. В</span>
          </button>
        </div>

        <div class="bottom-toggles">
          <button class="toggle-btn ${isDisplayOn ? 'active' : ''}" id="btn-display">
            <svg viewBox="0 0 24 24"><path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z"/></svg>
            Дисплей: ${isDisplayOn ? 'Увімк' : 'Вимк'}
          </button>
          <button class="toggle-btn ${isBuzzerOn ? 'active' : ''}" id="btn-buzzer">
            <svg viewBox="0 0 24 24"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg>
            Звук: ${isBuzzerOn ? 'Увімк' : 'Вимк'}
          </button>
        </div>
      </ha-card>
    `;

    // Event listeners
    this.shadowRoot.getElementById('btn-power').onclick = () => {
      this._hass.callService('fan', isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
    };

    this.shadowRoot.querySelectorAll('.speed-btn').forEach(btn => {
      btn.onclick = () => {
        const speed = parseInt(btn.dataset.speed, 10);
        const percentage = Math.round(speed * 33.33);
        this._hass.callService('fan', 'set_percentage', { entity_id: entityId, percentage });
      };
    });

    this.shadowRoot.querySelectorAll('.mode-btn').forEach(btn => {
      btn.onclick = () => {
        const preset_mode = btn.dataset.mode;
        this._hass.callService('fan', 'set_preset_mode', { entity_id: entityId, preset_mode });
      };
    });

    this.shadowRoot.getElementById('btn-display').onclick = () => {
      if (displayObj) {
        this._hass.callService('switch', 'toggle', { entity_id: displayId });
      }
    };

    this.shadowRoot.getElementById('btn-buzzer').onclick = () => {
      if (buzzerObj) {
        this._hass.callService('switch', 'toggle', { entity_id: buzzerId });
      }
    };
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('ventoxx-card', VentoxxCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ventoxx-card',
  name: 'Ventoxx Control Card',
  description: 'Custom interactive control card for Ventoxx Harmony recuperators.',
  preview: true,
});
