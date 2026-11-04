"""Fan entity for Ventoxx."""
from __future__ import annotations

import math
from typing import Any

from homeassistant.components.fan import FanEntity, FanEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util.percentage import (
    int_states_in_range,
    percentage_to_ranged_value,
    ranged_value_to_percentage,
)

from .const import (
    CONF_HOST,
    DOMAIN,
    PRESET_MODES,
    PRESET_RECUPERATION,
)
from .coordinator import VentoxxDataUpdateCoordinator
from .ventoxx_api import VentoxxAPI, encode_fstate

SPEED_RANGE = (1, 3)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Ventoxx fan entity."""
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: VentoxxDataUpdateCoordinator = data["coordinator"]
    api: VentoxxAPI = data["api"]
    host = entry.data[CONF_HOST]

    async_add_entities([VentoxxFan(coordinator, api, entry.entry_id, host)])


class VentoxxFan(CoordinatorEntity[VentoxxDataUpdateCoordinator], FanEntity):
    """Representation of a Ventoxx fan."""

    _attr_has_entity_name = True
    _attr_name = "Fan"
    _attr_preset_modes = PRESET_MODES
    _attr_supported_features = (
        FanEntityFeature.SET_SPEED
        | FanEntityFeature.PRESET_MODE
        | FanEntityFeature.TURN_ON
        | FanEntityFeature.TURN_OFF
    )

    def __init__(
        self,
        coordinator: VentoxxDataUpdateCoordinator,
        api: VentoxxAPI,
        entry_id: str,
        host: str,
    ) -> None:
        """Initialize the fan."""
        super().__init__(coordinator)
        self.api = api
        self._entry_id = entry_id
        self._host = host
        self._attr_unique_id = f"{entry_id}_fan"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name="Ventoxx Harmony",
            manufacturer="Ventoxx",
            model="Harmony Smart",
            configuration_url=f"http://{host}",
        )
        self._last_speed = 1
        self._last_mode = PRESET_RECUPERATION

    @property
    def speed_count(self) -> int:
        """Return the number of speeds."""
        return int_states_in_range(SPEED_RANGE)

    @property
    def is_on(self) -> bool:
        """Return true if fan is on."""
        return bool(self.coordinator.data.get("is_on", False))

    @property
    def percentage(self) -> int | None:
        """Return current speed percentage."""
        if not self.is_on:
            return 0
        speed = self.coordinator.data.get("speed", 0)
        if speed > 0:
            self._last_speed = speed
            return ranged_value_to_percentage(SPEED_RANGE, speed)
        return 0

    @property
    def preset_mode(self) -> str | None:
        """Return the current preset mode."""
        mode = self.coordinator.data.get("preset_mode")
        if mode:
            self._last_mode = mode
        return mode

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        return {
            "fstate_raw": self.coordinator.data.get("fstate"),
            "derror": self.coordinator.data.get("derror"),
            "dstate": self.coordinator.data.get("dstate"),
            "buzzer": bool(self.coordinator.data.get("buzzst", 0)),
            "display": bool(self.coordinator.data.get("dispst", 0)),
        }

    async def async_turn_on(
        self,
        percentage: int | None = None,
        preset_mode: str | None = None,
        **kwargs: Any,
    ) -> None:
        """Turn on the fan."""
        speed = self._last_speed
        if percentage is not None:
            speed = math.ceil(percentage_to_ranged_value(SPEED_RANGE, percentage))
            self._last_speed = speed

        mode = preset_mode or self._last_mode
        self._last_mode = mode

        fstate = encode_fstate(mode, speed)
        await self.api.set_fstate(fstate)
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn off the fan."""
        await self.api.set_fstate(0)
        await self.coordinator.async_request_refresh()

    async def async_set_percentage(self, percentage: int) -> None:
        """Set the speed percentage of the fan."""
        if percentage == 0:
            await self.async_turn_off()
            return

        speed = math.ceil(percentage_to_ranged_value(SPEED_RANGE, percentage))
        self._last_speed = speed
        mode = self.preset_mode or self._last_mode
        fstate = encode_fstate(mode, speed)
        await self.api.set_fstate(fstate)
        await self.coordinator.async_request_refresh()

    async def async_set_preset_mode(self, preset_mode: str) -> None:
        """Set new preset mode."""
        if preset_mode not in PRESET_MODES:
            raise ValueError(f"Invalid preset mode: {preset_mode}")

        self._last_mode = preset_mode
        speed = self._last_speed or 1
        fstate = encode_fstate(preset_mode, speed)
        await self.api.set_fstate(fstate)
        await self.coordinator.async_request_refresh()
