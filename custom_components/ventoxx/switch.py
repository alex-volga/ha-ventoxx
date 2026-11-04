"""Switch platform for Ventoxx (Buzzer and Display)."""
from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_HOST, DOMAIN
from .coordinator import VentoxxDataUpdateCoordinator
from .ventoxx_api import VentoxxAPI


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Ventoxx switch entities."""
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: VentoxxDataUpdateCoordinator = data["coordinator"]
    api: VentoxxAPI = data["api"]
    host = entry.data[CONF_HOST]

    async_add_entities(
        [
            VentoxxBuzzerSwitch(coordinator, api, entry.entry_id, host),
            VentoxxDisplaySwitch(coordinator, api, entry.entry_id, host),
        ]
    )


class VentoxxBuzzerSwitch(CoordinatorEntity[VentoxxDataUpdateCoordinator], SwitchEntity):
    """Switch to toggle buzzer."""

    _attr_has_entity_name = True
    _attr_name = "Buzzer"
    _attr_icon = "mdi:volume-high"

    def __init__(
        self,
        coordinator: VentoxxDataUpdateCoordinator,
        api: VentoxxAPI,
        entry_id: str,
        host: str,
    ) -> None:
        """Initialize buzzer switch."""
        super().__init__(coordinator)
        self.api = api
        self._attr_unique_id = f"{entry_id}_buzzer"
        dev_title = f"Ventoxx ({api.device_name})" if api.device_name else "Ventoxx Harmony"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name=dev_title,
            manufacturer="Ventoxx",
            model="Harmony Smart",
            sw_version=api.sw_version,
            configuration_url=f"http://{host}",
        )

    @property
    def is_on(self) -> bool:
        """Return True if buzzer is enabled (1 = enabled, 0 = muted)."""
        return bool(self.coordinator.data.get("buzzst", 0))

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn on the buzzer."""
        if not self.is_on:
            await self.api.set_buzzer()
            await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn off the buzzer."""
        if self.is_on:
            await self.api.set_buzzer()
            await self.coordinator.async_request_refresh()


class VentoxxDisplaySwitch(CoordinatorEntity[VentoxxDataUpdateCoordinator], SwitchEntity):
    """Switch to toggle display backlight."""

    _attr_has_entity_name = True
    _attr_name = "Display"
    _attr_icon = "mdi:brightness-6"

    def __init__(
        self,
        coordinator: VentoxxDataUpdateCoordinator,
        api: VentoxxAPI,
        entry_id: str,
        host: str,
    ) -> None:
        """Initialize display switch."""
        super().__init__(coordinator)
        self.api = api
        self._attr_unique_id = f"{entry_id}_display"
        dev_title = f"Ventoxx ({api.device_name})" if api.device_name else "Ventoxx Harmony"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name=dev_title,
            manufacturer="Ventoxx",
            model="Harmony Smart",
            sw_version=api.sw_version,
            configuration_url=f"http://{host}",
        )

    @property
    def is_on(self) -> bool:
        """Return True if display is ON (dispst: 0 = display ON/illuminated, 1 = display OFF/dark)."""
        return not bool(self.coordinator.data.get("dispst", 0))

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn on the display (set dispst to 0)."""
        if not self.is_on:
            await self.api.set_display()
            await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn off the display (set dispst to 1)."""
        if self.is_on:
            await self.api.set_display()
            await self.coordinator.async_request_refresh()
