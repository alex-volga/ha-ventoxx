"""Sensor platform for Ventoxx."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo, EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_HOST, DOMAIN
from .coordinator import VentoxxDataUpdateCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Ventoxx sensor entities."""
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: VentoxxDataUpdateCoordinator = data["coordinator"]
    host = entry.data[CONF_HOST]

    async_add_entities(
        [
            VentoxxModeSensor(coordinator, entry.entry_id, host),
            VentoxxErrorSensor(coordinator, entry.entry_id, host),
            VentoxxPairingSensor(coordinator, entry.entry_id, host),
        ]
    )


class VentoxxModeSensor(CoordinatorEntity[VentoxxDataUpdateCoordinator], SensorEntity):
    """Sensor for current Ventoxx mode."""

    _attr_has_entity_name = True
    _attr_name = "Operating Mode"
    _attr_icon = "mdi:air-conditioner"

    def __init__(self, coordinator: VentoxxDataUpdateCoordinator, entry_id: str, host: str) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_mode"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name="Ventoxx Harmony",
            manufacturer="Ventoxx",
            model="Harmony Smart",
            configuration_url=f"http://{host}",
        )

    @property
    def native_value(self) -> str | None:
        """Return native value."""
        if not self.coordinator.data.get("is_on", False):
            return "off"
        return self.coordinator.data.get("preset_mode")


class VentoxxErrorSensor(CoordinatorEntity[VentoxxDataUpdateCoordinator], SensorEntity):
    """Sensor for error code."""

    _attr_has_entity_name = True
    _attr_name = "Error Code"
    _attr_icon = "mdi:alert-circle-outline"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: VentoxxDataUpdateCoordinator, entry_id: str, host: str) -> None:
        """Initialize error sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_error"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name="Ventoxx Harmony",
            manufacturer="Ventoxx",
            model="Harmony Smart",
            configuration_url=f"http://{host}",
        )

    @property
    def native_value(self) -> int:
        """Return error code."""
        return int(self.coordinator.data.get("derror", 0))


class VentoxxPairingSensor(CoordinatorEntity[VentoxxDataUpdateCoordinator], SensorEntity):
    """Sensor for pairing/sync state."""

    _attr_has_entity_name = True
    _attr_name = "Pairing State"
    _attr_icon = "mdi:link"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: VentoxxDataUpdateCoordinator, entry_id: str, host: str) -> None:
        """Initialize pairing sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_pairing"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name="Ventoxx Harmony",
            manufacturer="Ventoxx",
            model="Harmony Smart",
            configuration_url=f"http://{host}",
        )

    @property
    def native_value(self) -> str:
        """Return pairing state."""
        dstate = self.coordinator.data.get("dstate", 0)
        mapping = {
            0: "independent",
            1: "master",
            2: "slave",
        }
        return mapping.get(dstate, "unknown")
