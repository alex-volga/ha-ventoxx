# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-04

### Added
- Direct Mode Selector (`select.ventoxx_harmony_operating_mode`) with support for all Ventoxx modes:
  - Recuperation (`recuperation`, `<->`)
  - Intake (`intake`, `->`)
  - Exhaust (`exhaust`, `<-`)
  - Intensive Intake (`intensive_intake`, `>==`)
  - Intensive Exhaust (`intensive_exhaust`, `==<`)
- Direct Speed Selector (`select.ventoxx_harmony_speed`) with speeds 1, 2, and 3.
- Official Ventoxx component branding (`icon.png` and `logo.png`).
- Bilingual translations for English (`en`) and Ukrainian (`uk`).
- Examples and documentation for custom Lovelace cards and power-outage recovery automations.

### Fixed
- Fixed inverted Display switch logic (`switch.ventoxx_harmony_display`): turning ON in Home Assistant now properly enables the display illumination on the physical device.

---

## [1.0.0] - 2026-11-04

### Added
- Initial release of Ventoxx Harmony Smart local integration for Home Assistant.
- Full local HTTP communication over port 80 without Tuya Cloud dependency.
- Fan entity (`fan.ventoxx_harmony_fan`) supporting on/off, speed levels, and preset modes.
- Switch entities for buzzer (`switch.ventoxx_harmony_buzzer`) and display (`switch.ventoxx_harmony_display`).
- Diagnostic sensors for operating mode, error codes, and pairing state.
- HACS compatibility.
