"""Constants for the Ventoxx integration."""

DOMAIN = "ventoxx"

CONF_HOST = "host"
CONF_PASSWORD = "password"
CONF_SCAN_INTERVAL = "scan_interval"

DEFAULT_HOST = "192.168.1.124"
DEFAULT_SCAN_INTERVAL = 5

# Preset modes
PRESET_RECUPERATION = "recuperation"
PRESET_INTAKE = "intake"
PRESET_EXHAUST = "exhaust"
PRESET_NIGHT = "night"
PRESET_INTENSIVE = "intensive"

PRESET_MODES = [
    PRESET_RECUPERATION,
    PRESET_INTAKE,
    PRESET_EXHAUST,
    PRESET_NIGHT,
    PRESET_INTENSIVE,
]
