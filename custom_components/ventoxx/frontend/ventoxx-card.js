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
          width: 24px;
          height: 24px;
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
          padding: 4px;
          gap: 4px;
        }
        .speed-tab {
          flex: 1;
          height: 44px;
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
          background: rgba(255, 255, 255, 0.06);
          color: var(--primary-text-color, #ffffff);
        }
        .speed-tab.active {
          background: var(--primary-color, #0284c7);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .speed-tab svg {
          width: 22px;
          height: 22px;
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
              <!-- mdi:air-filter -->
              <svg viewBox="0 0 24 24">
                <path d="M19,18.31V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V16.3C4.54,16.12 3.95,16 3,16A1,1 0 0,1 2,15A1,1 0 0,1 3,14C3.82,14 4.47,14.08 5,14.21V12.3C4.54,12.12 3.95,12 3,12A1,1 0 0,1 2,11A1,1 0 0,1 3,10C3.82,10 4.47,10.08 5,10.21V8.3C4.54,8.12 3.95,8 3,8A1,1 0 0,1 2,7A1,1 0 0,1 3,6C3.82,6 4.47,6.08 5,6.21V4A2,2 0 0,1 7,2H17A2,2 0 0,1 19,4V6.16C20.78,6.47 21.54,7.13 21.71,7.29C22.1,7.68 22.1,8.32 21.71,8.71C21.32,9.1 20.8,9.09 20.29,8.71V8.71C20.29,8.71 19.25,8 17,8C15.74,8 14.91,8.41 13.95,8.9C12.91,9.41 11.74,10 10,10C9.64,10 9.31,10 9,9.96V7.95C9.3,8 9.63,8 10,8C11.26,8 12.09,7.59 13.05,7.11C14.09,6.59 15.27,6 17,6V4H7V20H17V18C18.5,18 18.97,18.29 19,18.31M17,10C15.27,10 14.09,10.59 13.05,11.11C12.09,11.59 11.26,12 10,12C9.63,12 9.3,12 9,11.95V13.96C9.31,14 9.64,14 10,14C11.74,14 12.91,13.41 13.95,12.9C14.91,12.42 15.74,12 17,12C19.25,12 20.29,12.71 20.29,12.71V12.71C20.8,13.1 21.32,13.1 21.71,12.71C22.1,12.32 22.1,11.69 21.71,11.29C21.5,11.08 20.25,10 17,10M17,14C15.27,14 14.09,14.59 13.05,15.11C12.09,15.59 11.26,16 10,16C9.63,16 9.3,16 9,15.95V17.96C9.31,18 9.64,18 10,18C11.74,18 12.91,17.41 13.95,16.9C14.91,16.42 15.74,16 17,16C19.25,16 20.29,16.71 20.29,16.71V16.71C20.8,17.1 21.32,17.1 21.71,16.71C22.1,16.32 22.1,15.69 21.71,15.29C21.5,15.08 20.25,14 17,14Z" />
              </svg>
            </div>
            ${cardTitle ? `<div class="title">${cardTitle}</div>` : ''}
          </div>
          <button class="power-btn" id="btn-power" title="${isOn ? 'Вимкнути' : 'Увімкнути'}">
            <!-- mdi:power-cycle -->
            <svg viewBox="0 0 24 24">
              <path d="M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M13,17H11V7H13V17Z" />
            </svg>
          </button>
        </div>

        <div class="speed-toolbar">
          <!-- mdi:fan-off -->
          <button class="speed-tab ${effectiveSpeed === 0 ? 'active' : ''}" data-speed="0" title="Вимкнено">
            <svg viewBox="0 0 24 24">
              <path d="M12.5,2C9.64,2 8.57,4.55 9.29,7.47L15,13.16C15.87,13.37 16.81,13.81 17.28,14.73C18.46,17.1 22.03,17 22.03,12.5C22.03,8.92 18.05,8.13 14.35,10.13C14.03,9.73 13.61,9.42 13.13,9.22C13.32,8.29 13.76,7.24 14.75,6.75C17.11,5.57 17,2 12.5,2M3.28,4L2,5.27L4.47,7.73C3.22,7.74 2,8.87 2,11.5C2,15.07 5.96,15.85 9.65,13.87C9.97,14.27 10.4,14.59 10.89,14.79C10.69,15.71 10.25,16.75 9.27,17.24C6.91,18.42 7,22 11.5,22C13.8,22 14.94,20.36 14.94,18.21L18.73,22L20,20.72L3.28,4Z" />
            </svg>
          </button>
          <!-- mdi:fan-speed-1 -->
          <button class="speed-tab ${effectiveSpeed === 1 ? 'active' : ''}" data-speed="1" title="Швидкість 1">
            <svg viewBox="0 0 24 24">
              <path d="M13 19C13 17.59 13.5 16.3 14.3 15.28C14.17 14.97 14.03 14.65 13.86 14.34C14.26 14 14.57 13.59 14.77 13.11C15.26 13.21 15.78 13.39 16.25 13.67C17.07 13.25 18 13 19 13C20.05 13 21.03 13.27 21.89 13.74C21.95 13.37 22 12.96 22 12.5C22 8.92 18.03 8.13 14.33 10.13C14 9.73 13.59 9.42 13.11 9.22C13.3 8.29 13.74 7.24 14.73 6.75C17.09 5.57 17 2 12.5 2C8.93 2 8.14 5.96 10.13 9.65C9.72 9.97 9.4 10.39 9.21 10.87C8.28 10.68 7.23 10.25 6.73 9.26C5.56 6.89 2 7 2 11.5C2 15.07 5.95 15.85 9.64 13.87C9.96 14.27 10.39 14.59 10.88 14.79C10.68 15.71 10.24 16.75 9.26 17.24C6.9 18.42 7 22 11.5 22C12.31 22 13 21.78 13.5 21.41C13.19 20.67 13 19.86 13 19M12 13C11.43 13 11 12.55 11 12S11.43 11 12 11C12.54 11 13 11.45 13 12S12.54 13 12 13M17 15V17H18V23H20V15H17Z" />
            </svg>
          </button>
          <!-- mdi:fan-speed-2 -->
          <button class="speed-tab ${effectiveSpeed === 2 ? 'active' : ''}" data-speed="2" title="Швидкість 2">
            <svg viewBox="0 0 24 24">
              <path d="M13 19C13 17.59 13.5 16.3 14.3 15.28C14.17 14.97 14.03 14.65 13.86 14.34C14.26 14 14.57 13.59 14.77 13.11C15.26 13.21 15.78 13.39 16.25 13.67C17.07 13.25 18 13 19 13C20.05 13 21.03 13.27 21.89 13.74C21.95 13.37 22 12.96 22 12.5C22 8.92 18.03 8.13 14.33 10.13C14 9.73 13.59 9.42 13.11 9.22C13.3 8.29 13.74 7.24 14.73 6.75C17.09 5.57 17 2 12.5 2C8.93 2 8.14 5.96 10.13 9.65C9.72 9.97 9.4 10.39 9.21 10.87C8.28 10.68 7.23 10.25 6.73 9.26C5.56 6.89 2 7 2 11.5C2 15.07 5.95 15.85 9.64 13.87C9.96 14.27 10.39 14.59 10.88 14.79C10.68 15.71 10.24 16.75 9.26 17.24C6.9 18.42 7 22 11.5 22C12.31 22 13 21.78 13.5 21.41C13.19 20.67 13 19.86 13 19M12 13C11.43 13 11 12.55 11 12S11.43 11 12 11C12.54 11 13 11.45 13 12S12.54 13 12 13M16 15V17H19V18H18C16.9 18 16 18.9 16 20V23H21V21H18V20H19C20.11 20 21 19.11 21 18V17C21 15.9 20.11 15 19 15H16Z" />
            </svg>
          </button>
          <!-- mdi:fan-speed-3 -->
          <button class="speed-tab ${effectiveSpeed === 3 ? 'active' : ''}" data-speed="3" title="Швидкість 3">
            <svg viewBox="0 0 24 24">
              <path d="M13 19C13 17.59 13.5 16.3 14.3 15.28C14.17 14.97 14.03 14.65 13.86 14.34C14.26 14 14.57 13.59 14.77 13.11C15.26 13.21 15.78 13.39 16.25 13.67C17.07 13.25 18 13 19 13C20.05 13 21.03 13.27 21.89 13.74C21.95 13.37 22 12.96 22 12.5C22 8.92 18.03 8.13 14.33 10.13C14 9.73 13.59 9.42 13.11 9.22C13.3 8.29 13.74 7.24 14.73 6.75C17.09 5.57 17 2 12.5 2C8.93 2 8.14 5.96 10.13 9.65C9.72 9.97 9.4 10.39 9.21 10.87C8.28 10.68 7.23 10.25 6.73 9.26C5.56 6.89 2 7 2 11.5C2 15.07 5.95 15.85 9.64 13.87C9.96 14.27 10.39 14.59 10.88 14.79C10.68 15.71 10.24 16.75 9.26 17.24C6.9 18.42 7 22 11.5 22C12.31 22 13 21.78 13.5 21.41C13.19 20.67 13 19.86 13 19M12 13C11.43 13 11 12.55 11 12S11.43 11 12 11C12.54 11 13 11.45 13 12S12.54 13 12 13M21 21V20.5C21 19.67 20.33 19 19.5 19C20.33 19 21 18.33 21 17.5V17C21 15.89 20.1 15 19 15H16V17H19V18H17V20H19V21H16V23H19C20.11 23 21 22.11 21 21" />
            </svg>
          </button>
        </div>

        <div class="section-label">Режим роботи</div>
        <div class="mode-row">
          <!-- Витяжка зліва: mdi:home-export-outline -->
          <button class="mode-btn ${isOn && currentMode === 'exhaust' ? 'active' : ''}" data-mode="exhaust" title="Витяжка повітря">
            <svg viewBox="0 0 24 24"><path d="M24 13L20 17V14H11V12H20V9L24 13M4 20V12H1L11 3L18 9.3V10H15.79L11 5.69L6 10.19V18H16V16H18V20H4Z"/></svg>
            <span>Витяжка</span>
          </button>
          <!-- Рекуперація по центру: mdi:sync / cycle -->
          <button class="mode-btn ${isOn && currentMode === 'recuperation' ? 'active' : ''}" data-mode="recuperation" title="Рекуперація (теплообмін)">
            <svg viewBox="0 0 24 24"><path d="M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z"/></svg>
            <span>Рекуперація</span>
          </button>
          <!-- Приплив справа: mdi:home-import-outline -->
          <button class="mode-btn ${isOn && currentMode === 'intake' ? 'active' : ''}" data-mode="intake" title="Приплив повітря">
            <svg viewBox="0 0 24 24"><path d="M15 13L11 17V14H2V12H11V9L15 13M5 20V16H7V18H17V10.19L12 5.69L7.21 10H4.22L12 3L22 12H19V20H5Z"/></svg>
            <span>Приплив</span>
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
