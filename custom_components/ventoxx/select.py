"""Select platform for Ventoxx (Mode and Speed selectors)."""
from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CONF_HOST,
    DOMAIN,
    PRESET_MODES,
    PRESET_RECUPERATION,
)
from .coordinator import VentoxxDataUpdateCoordinator
from .ventoxx_api import VentoxxAPI, encode_fstate

SPEED_OPTIONS = ["1", "2", "3"]


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Ventoxx select entities."""
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: VentoxxDataUpdateCoordinator = data["coordinator"]
    api: VentoxxAPI = data["api"]
    host = entry.data[CONF_HOST]

    async_add_entities(
        [
            VentoxxModeSelect(coordinator, api, entry.entry_id, host),
            VentoxxSpeedSelect(coordinator, api, entry.entry_id, host),
        ]
    )


class VentoxxModeSelect(CoordinatorEntity[VentoxxDataUpdateCoordinator], SelectEntity):
    """Selector for Ventoxx operating mode."""

    _attr_has_entity_name = True
    _attr_name = "Operating Mode"
    _attr_icon = "mdi:air-filter"
    _attr_options = PRESET_MODES

    def __init__(
        self,
        coordinator: VentoxxDataUpdateCoordinator,
        api: VentoxxAPI,
        entry_id: str,
        host: str,
    ) -> None:
        """Initialize mode select."""
        super().__init__(coordinator)
        self.api = api
        self._attr_unique_id = f"{entry_id}_mode_select"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name="Ventoxx Harmony",
            manufacturer="Ventoxx",
            model="Harmony Smart",
            configuration_url=f"http://{host}",
        )

    @property
    def current_option(self) -> str | None:
        """Return the selected mode."""
        return self.coordinator.data.get("preset_mode", PRESET_RECUPERATION)

    async def async_select_option(self, option: str) -> None:
        """Change the operating mode."""
        if option not in PRESET_MODES:
            raise ValueError(f"Invalid mode: {option}")

        speed = self.coordinator.data.get("speed") or 1
        fstate = encode_fstate(option, speed)
        await self.api.set_fstate(fstate)
        await self.coordinator.async_request_refresh()


class VentoxxSpeedSelect(CoordinatorEntity[VentoxxDataUpdateCoordinator], SelectEntity):
    """Selector for Ventoxx fan speed."""

    _attr_has_entity_name = True
    _attr_name = "Speed"
    _attr_icon = "mdi:fan-speed-1"
    _attr_options = SPEED_OPTIONS

    def __init__(
        self,
        coordinator: VentoxxDataUpdateCoordinator,
        api: VentoxxAPI,
        entry_id: str,
        host: str,
    ) -> None:
        """Initialize speed select."""
        super().__init__(coordinator)
        self.api = api
        self._attr_unique_id = f"{entry_id}_speed_select"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name="Ventoxx Harmony",
            manufacturer="Ventoxx",
            model="Harmony Smart",
            configuration_url=f"http://{host}",
        )

    @property
    def current_option(self) -> str | None:
        """Return the selected speed (1, 2, or 3)."""
        speed = self.coordinator.data.get("speed", 1)
        if speed in (1, 2, 3):
            return str(speed)
        return "1"

    async def async_select_option(self, option: str) -> None:
        """Change the fan speed."""
        if option not in SPEED_OPTIONS:
            raise ValueError(f"Invalid speed: {option}")

        speed = int(option)
        mode = self.coordinator.data.get("preset_mode", PRESET_RECUPERATION)
        fstate = encode_fstate(mode, speed)
        await self.api.set_fstate(fstate)
        await self.coordinator.async_request_refresh()
