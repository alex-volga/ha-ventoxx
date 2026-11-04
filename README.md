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
* 📊 **Діагностичні сенсори:** Поточний режим роботи, код помилки, режим спарювання (ведучий/підлеглий).

---

## 🎨 Приклади карток для дашборду (Dashboard Cards)

Замість звичайної нудної картки зі списком перемикачів, використовуйте сучасну картку Home Assistant:

### Варіант 1: Компактна сучасна Tile-картка (Рекомендовано)

Найбільш ергономічна нативна картка Home Assistant з анімацією обертання та вбудованим керуванням швидкістю і режимами:

```yaml
type: tile
entity: fan.ventoxx_harmony_fan
name: Ventoxx Harmony
icon: mdi:air-filter
color: teal
features:
  - type: fan-speed
  - type: fan-preset-modes
    style: dropdown
    preset_modes:
      - recuperation
      - intake
      - exhaust
      - intensive_intake
      - intensive_exhaust
```

---

### Варіант 2: Повна панель керування (як у рідному пульті Ventoxx)

Повністю відтворює фізичний пульт і веб-панель Ventoxx: окремі кнопки для кожної швидкості (1, 2, 3), кнопки для кожного режиму та перемикачі підсвітки/звуку:

```yaml
type: vertical-stack
cards:
  # Головна плашка з вентилятором
  - type: tile
    entity: fan.ventoxx_harmony_fan
    name: Ventoxx Harmony
    icon: mdi:air-filter
    color: teal
    features:
      - type: fan-speed

  # Кнопки швидкостей: 1, 2, 3
  - type: horizontal-stack
    cards:
      - type: button
        name: "1 Швидкість"
        icon: mdi:fan-speed-1
        tap_action:
          action: call-service
          service: select.select_option
          target:
            entity_id: select.ventoxx_harmony_speed
          data:
            option: "1"
      - type: button
        name: "2 Швидкість"
        icon: mdi:fan-speed-2
        tap_action:
          action: call-service
          service: select.select_option
          target:
            entity_id: select.ventoxx_harmony_speed
          data:
            option: "2"
      - type: button
        name: "3 Швидкість"
        icon: mdi:fan-speed-3
        tap_action:
          action: call-service
          service: select.select_option
          target:
            entity_id: select.ventoxx_harmony_speed
          data:
            option: "3"

  # Кнопки режимів роботи
  - type: horizontal-stack
    cards:
      - type: button
        name: "Рекуперація"
        icon: mdi:sync
        tap_action:
          action: call-service
          service: select.select_option
          target:
            entity_id: select.ventoxx_harmony_operating_mode
          data:
            option: "recuperation"
      - type: button
        name: "Приплив"
        icon: mdi:arrow-right-bold
        tap_action:
          action: call-service
          service: select.select_option
          target:
            entity_id: select.ventoxx_harmony_operating_mode
          data:
            option: "intake"
      - type: button
        name: "Витяжка"
        icon: mdi:arrow-left-bold
        tap_action:
          action: call-service
          service: select.select_option
          target:
            entity_id: select.ventoxx_harmony_operating_mode
          data:
            option: "exhaust"

  # Перемикачі дисплея та звуку
  - type: horizontal-stack
    cards:
      - type: tile
        entity: switch.ventoxx_harmony_display
        name: Дисплей
        icon: mdi:brightness-6
      - type: tile
        entity: switch.ventoxx_harmony_buzzer
        name: Звук
        icon: mdi:volume-high
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

Оскільки прошивка Ventoxx після подачі живлення завжди стартує вимкненою, ви можете додати просту автоматизацію в Home Assistant, щоб пристрій автоматично повертався у свій попередній режим після відновлення електроенергії:

```yaml
alias: "Ventoxx: Відновлення роботи після появи світла"
description: "Вмикає рекуператор у попередній режим, якщо він працював до збою живлення"
trigger:
  - platform: state
    entity_id: binary_sensor.elektrika_v_merezhi
    from: "off"
    to: "on"
    for:
      seconds: 20 # час на завантаження рекуператора та підключення до Wi-Fi
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
