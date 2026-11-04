# Ventoxx Fan Control for Home Assistant 🌀

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/default)
[![GitHub release](https://img.shields.io/github/v/release/alex-volga/ha-ventoxx?include_prereleases)](https://github.com/alex-volga/ha-ventoxx/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Повноцінна локальна інтеграція Home Assistant для рекуператорів та вентиляційних установок **Ventoxx Harmony Smart** (та сумісних моделей Ventoxx).

---

## 🚀 Переваги над Tuya Cloud

* ⚡ **100% локальне керування:** Спілкується безпосередньо з пристроєм через локальну мережу HTTP API. Жодних хмар Tuya, затримок чи залежності від інтернету.
* 🔄 **Повний зворотний зв'язок:** Стан миттєво оновлюється в Home Assistant, навіть якщо ви керуєте з **фізичного пульта ДУ** або через додаток **SmartLife / Tuya**.
* 🎛️ **Повноцінна сутність вентилятора (`fan`):**
  * Вмикання / Вимикання
  * 3 швидкості (33%, 66%, 100%)
  * Усі режими роботи: **Рекуперація**, **Приплив**, **Витяжка**, **Нічний режим**, **Інтенсивне провітрювання**
* 🔔 **Додаткові перемикачі:** Звуковий сигнал (зумер) та підсвічування дисплею.
* 📊 **Діагностичні сенсори:** Поточний режим роботи, код помилки, режим спарювання (ведучий/підлеглий).

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

1. Завантажте репозиторій або скопіюйте папку `custom_components/ventoxx/` у каталог вашого Home Assistant:
   ```
   <config>/custom_components/ventoxx/
   ```
2. Перезавантажте Home Assistant.

---

## ⚙️ Налаштування

1. Перейдіть у **Налаштування** → **Пристрої та служби** → **Додати інтеграцію**.
2. Знайдіть **Ventoxx**.
3. Введіть:
   * **IP-адреса або хост:** наприклад `192.168.1.124`
   * **Пароль:** пароль від веб-панелі пристрою (за замовчуванням `ventoxxpass` або ваш власний)
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

## 📄 Ліцензія

Цей проект розповсюджується під ліцензією [MIT](LICENSE).
