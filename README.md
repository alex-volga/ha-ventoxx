# Ventoxx Fan Control for Home Assistant 🌀

<p align="center">
  <img src="icon.png" alt="Ventoxx Logo" width="128" height="128">
</p>

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/default)
[![GitHub release](https://img.shields.io/github/v/release/alex-volga/ha-ventoxx?include_prereleases)](https://github.com/alex-volga/ha-ventoxx/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Повноцінна локальна інтеграція Home Assistant для рекуператорів та вентиляційних установок **Ventoxx Harmony Smart** (та сумісних моделей [Ventoxx](https://ventoxx.ua/)).

---

## 🚀 Можливості інтеграції

* ⚡ **100% локальне керування:** Спілкується безпосередньо з пристроєм через локальну мережу HTTP API. Жодних хмар Tuya, затримок чи залежності від інтернету.
* 🔄 **Повний зворотний зв'язок:** Стан миттєво оновлюється в Home Assistant, навіть якщо ви керуєте з **фізичного пульта ДУ** або через додаток **SmartLife / Tuya**.
* 🎛️ **Зручний вибір режимів та швидкостей:**
  * **Вибір режиму (`select.ventoxx_harmony_operating_mode`):**
    * 🔄 **Рекуперація** (`recuperation`)
    * 💨 **Приплив** (`intake`)
    * 🚪 **Витяжка** (`exhaust`)
    * ⚡ **Інтенсивний приплив** (`intensive_intake`)
    * 🌪️ **Інтенсивна витяжка** (`intensive_exhaust`)
  * **Вибір швидкості (`select.ventoxx_harmony_speed`):** Швидкість 1, 2, 3
  * **Сутність вентилятора (`fan.ventoxx_harmony_fan`):** Стандартний інтерфейс з повзунком швидкості та вибором режимів.
* 🔔 **Перемикачі (`switch`):**
  * **Підсвічування дисплею (`switch.ventoxx_harmony_display`):** Коректне увімкнення та вимкнення індикації приладу.
  * **Звуковий сигнал / зумер (`switch.ventoxx_harmony_buzzer`):** Звуковий супровід команд.
* 📊 **Діагностичні сенсори:**
  * **Роль приладу:** `Незалежний`, `Головний` або `Підлеглий`.
  * **Версія прошивки:** автоматично визначається з `upd.html` (наприклад `0.9.5.010`).
  * **Мережева назва:** автоматично визначається з `set.html` (наприклад `ventoxx-e1ba64`).
  * **Код помилки:** діагностика несправностей.

---

## 🎨 Варіанти карток для дашборду (Dashboard Cards)

### Варіант 1: Фірмова інтерактивна картка Ventoxx (`custom:ventoxx-card`) — Найзручніша!

Інтеграція постачається з **готовою вбудованою карткою**, яка автоматично реєструється в Home Assistant. Вона має інтерактивні кнопки швидкостей та режимів з підсвічуванням поточного стану, а також показує назву приладу та його роль:

```yaml
type: custom:ventoxx-card
entity: fan.ventoxx_harmony_fan
```

---

### Варіант 2: Нативна картка-плитка Home Assistant (Tile Card)

Якщо ви віддаєте перевагу нативним елементам Home Assistant, додайте `fan-preset-modes` зі стилем `icons` — завдяки `icons.json` активний режим підсвічуватиметься точно так само, як і швидкість:

```yaml
type: tile
entity: fan.ventoxx_harmony_fan
name: Ventoxx Harmony
icon: mdi:air-filter
color: teal
features:
  - type: fan-speed
  - type: fan-preset-modes
    style: icons
    preset_modes:
      - recuperation
      - intake
      - exhaust
      - intensive_intake
      - intensive_exhaust
```

---

## 📦 Встановлення

### Варіант 1: Через HACS (Рекомендовано)

1. Відкрийте **HACS** у вашому Home Assistant.
2. Натисніть три крапки у правому верхньому кутку → **Користувацькі репозиторії (Custom repositories)**.
3. Додайте посилання: `https://github.com/alex-volga/ha-ventoxx`
4. Тип (Category): **Інтеграція (Integration)**.
5. Натисніть **Додати** і завантажте інтеграцію.
6. Перезавантажте Home Assistant.

### Варіант 2: Вручну

Скопіюйте папку `custom_components/ventoxx/` у каталог вашого Home Assistant:
```bash
<config>/custom_components/ventoxx/
```
І перезавантажте Home Assistant.

---

## ⚙️ Налаштування

1. Перейдіть у **Налаштування** → **Пристрої та служби** → **Додати інтеграцію**.
2. Знайдіть **Ventoxx**.
3. Введіть:
   * **IP-адреса або хост:** наприклад `192.168.1.124`
   * **Пароль:** пароль від веб-панелі пристрою (за замовчуванням `ventoxxpass`)
4. Натисніть **Надіслати**.

---

## 💡 Автоматизація: Пам'ять стану після відключення світла (Power-on Restore)

```yaml
alias: "Ventoxx: Відновлення роботи після появи світла"
description: "Вмикає рекуператор у попередній режим, якщо він працював до збою живлення"
trigger:
  - platform: state
    entity_id: binary_sensor.elektrika_v_merezhi
    from: "off"
    to: "on"
    for:
      seconds: 20
condition:
  - condition: template
    value_template: "{{ states('fan.ventoxx_harmony_fan') != 'unavailable' }}"
action:
  - action: fan.turn_on
    target:
      entity_id: fan.ventoxx_harmony_fan
```

---

## 📄 Ліцензія та історія змін

* Історія змін: [CHANGELOG.md](CHANGELOG.md)
* Ліцензія: [MIT](LICENSE)
