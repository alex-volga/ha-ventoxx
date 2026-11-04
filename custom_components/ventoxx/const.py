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
PRESET_INTENSIVE_INTAKE = "intensive_intake"
PRESET_INTENSIVE_EXHAUST = "intensive_exhaust"

PRESET_MODES = [
    PRESET_RECUPERATION,
    PRESET_INTAKE,
    PRESET_EXHAUST,
    PRESET_INTENSIVE_INTAKE,
    PRESET_INTENSIVE_EXHAUST,
]
