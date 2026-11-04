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
    const effectiveSpeed = isOn ? currentSpeed : 0;
    const currentMode = attrs.preset_mode || 'recuperation';
    const cardTitle = this.config.title !== undefined ? this.config.title : (this.config.name || stateObj.attributes.friendly_name || 'Ventoxx Harmony');

    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          background: var(--ha-card-background, var(--card-background-color, #1e293b));
          color: var(--primary-text-color, #ffffff);
          border-radius: var(--ha-card-border-radius, 16px);
          padding: 16px;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
          box-shadow: var(--ha-card-box-shadow, 0 4px 12px rgba(0,0,0,0.15));
          box-sizing: border-box;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .title-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--secondary-background-color, rgba(255, 255, 255, 0.08));
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${isOn ? 'var(--primary-color, #0284c7)' : 'var(--secondary-text-color, #94a3b8)'};
          flex-shrink: 0;
        }
        .icon-circle svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }
        .title {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.2;
          color: var(--primary-text-color, #ffffff);
        }
        .power-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          background: ${isOn ? 'var(--primary-color, #0284c7)' : 'rgba(255,255,255,0.08)'};
          color: ${isOn ? '#ffffff' : 'var(--secondary-text-color, #94a3b8)'};
        }
        .power-btn:hover {
          filter: brightness(1.2);
          transform: scale(1.05);
        }
        .power-btn svg {
          width: 22px;
          height: 22px;
          fill: currentColor;
        }
        .section-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--secondary-text-color, #94a3b8);
          margin: 14px 0 8px 0;
        }
        /* Speed toolbar style */
        .speed-toolbar {
          display: flex;
          background: var(--secondary-background-color, rgba(255, 255, 255, 0.06));
          border-radius: 12px;
          padding: 3px;
          gap: 3px;
        }
        .speed-tab {
          flex: 1;
          height: 40px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: var(--secondary-text-color, #94a3b8);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .speed-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--primary-text-color, #ffffff);
        }
        .speed-tab.active {
          background: var(--primary-color, #0284c7);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .speed-tab svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }
        /* Mode buttons grid */
        .mode-row {
          display: flex;
          gap: 8px;
        }
        .mode-btn {
          flex: 1;
          height: 58px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: var(--secondary-background-color, rgba(255,255,255,0.05));
          color: var(--primary-text-color, #ffffff);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .mode-btn svg {
          width: 22px;
          height: 22px;
          fill: currentColor;
        }
        .mode-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .mode-btn.active {
          background: #ffffff;
          color: #0369a1;
          border-color: #38bdf8;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(56, 189, 248, 0.35);
        }
      </style>

      <ha-card>
        <div class="header">
          <div class="title-left">
            <div class="icon-circle">
              <!-- Heat exchanger / ventilation unit icon -->
              <svg viewBox="0 0 24 24">
                <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M7,5V7H17V5H7M7,9V11H17V9H7M7,13V15H17V13H7M7,17V19H17V17H7Z"/>
              </svg>
            </div>
            ${cardTitle ? `<div class="title">${cardTitle}</div>` : ''}
          </div>
          <button class="power-btn" id="btn-power" title="${isOn ? 'Вимкнути' : 'Увімкнути'}">
            <!-- Standard Power 0_I icon -->
            <svg viewBox="0 0 24 24">
              <path d="M16.56,5.44C15.86,4.74 15.03,4.2 14.12,3.85C13.21,3.5 12.24,3.32 11.27,3.32C10.3,3.32 9.33,3.5 8.42,3.85C7.51,4.2 6.68,4.74 5.98,5.44C3.87,7.55 3.33,10.74 4.38,13.38L3.21,14.55C1.86,11.39 2.5,7.58 5.12,4.96C6.01,4.07 7.07,3.38 8.24,2.94C9.41,2.5 10.65,2.27 11.9,2.27C13.15,2.27 14.39,2.5 15.56,2.94C16.73,3.38 17.79,4.07 18.68,4.96C21.3,7.58 21.94,11.39 20.59,14.55L19.42,13.38C20.47,10.74 19.93,7.55 17.82,5.44M11.9,13.64C12.45,13.64 12.9,13.19 12.9,12.64V1C12.9,0.45 12.45,0 11.9,0C11.35,0 10.9,0.45 10.9,1V12.64C10.9,13.19 11.35,13.64 11.9,13.64Z" />
            </svg>
          </button>
        </div>

        <div class="speed-toolbar">
          <!-- Off button (fan-off) -->
          <button class="speed-tab ${effectiveSpeed === 0 ? 'active' : ''}" data-speed="0" title="Вимкнено">
            <svg viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M1.39,4.22L2.8,2.81L21.19,21.2L19.78,22.61L16.27,19.1C15,19.68 13.55,20 12,20A8,8 0 0,1 4,12C4,10.45 4.32,9 4.9,7.73L1.39,4.22M12,4A8,8 0 0,1 20,12C20,13.55 19.68,15 19.1,16.27L17.5,14.67C17.82,13.84 18,12.94 18,12A6,6 0 0,0 12,6C11.06,6 10.16,6.18 9.33,6.5L7.73,4.9C9,4.32 10.45,4 12,4Z"/>
            </svg>
          </button>
          <!-- Fan speed 1 -->
          <button class="speed-tab ${effectiveSpeed === 1 ? 'active' : ''}" data-speed="1" title="Швидкість 1">
            <svg viewBox="0 0 24 24">
              <path d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11.5,15.5H13V8.5H10V10H11.5V15.5Z"/>
            </svg>
          </button>
          <!-- Fan speed 2 -->
          <button class="speed-tab ${effectiveSpeed === 2 ? 'active' : ''}" data-speed="2" title="Швидкість 2">
            <svg viewBox="0 0 24 24">
              <path d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M10,8.5V10H13V11.5H10.5C9.67,11.5 9,12.17 9,13V15.5H14.5V14H10.5V13H13C13.83,13 14.5,12.33 14.5,11.5V10C14.5,9.17 13.83,8.5 13,8.5H10Z"/>
            </svg>
          </button>
          <!-- Fan speed 3 -->
          <button class="speed-tab ${effectiveSpeed === 3 ? 'active' : ''}" data-speed="3" title="Швидкість 3">
            <svg viewBox="0 0 24 24">
              <path d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M10,8.5V10H13.5V11.25H11.5V12.75H13.5V14H10V15.5H13.5C14.33,15.5 15,14.83 15,14V10C15,9.17 14.33,8.5 13.5,8.5H10Z"/>
            </svg>
          </button>
        </div>

        <div class="section-label">Режим роботи</div>
        <div class="mode-row">
          <button class="mode-btn ${isOn && currentMode === 'recuperation' ? 'active' : ''}" data-mode="recuperation" title="Рекуперація (теплообмін)">
            <svg viewBox="0 0 24 24"><path d="M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z"/></svg>
            <span>Рекуперація</span>
          </button>
          <button class="mode-btn ${isOn && currentMode === 'intake' ? 'active' : ''}" data-mode="intake" title="Приплив повітря">
            <svg viewBox="0 0 24 24"><path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/></svg>
            <span>Приплив</span>
          </button>
          <button class="mode-btn ${isOn && currentMode === 'exhaust' ? 'active' : ''}" data-mode="exhaust" title="Витяжка повітря">
            <svg viewBox="0 0 24 24"><path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/></svg>
            <span>Витяжка</span>
          </button>
        </div>
      </ha-card>
    `;

    // Event listeners
    this.shadowRoot.getElementById('btn-power').onclick = () => {
      this._hass.callService('fan', isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
    };

    this.shadowRoot.querySelectorAll('.speed-tab').forEach(btn => {
      btn.onclick = () => {
        const speed = parseInt(btn.dataset.speed, 10);
        if (speed === 0) {
          this._hass.callService('fan', 'turn_off', { entity_id: entityId });
        } else {
          const percentage = Math.round(speed * 33.33);
          this._hass.callService('fan', 'set_percentage', { entity_id: entityId, percentage });
        }
      };
    });

    this.shadowRoot.querySelectorAll('.mode-btn').forEach(btn => {
      btn.onclick = () => {
        const preset_mode = btn.dataset.mode;
        this._hass.callService('fan', 'set_preset_mode', { entity_id: entityId, preset_mode });
      };
    });
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
