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
from .ventoxx_api import VentoxxAPI


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Ventoxx sensor entities."""
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: VentoxxDataUpdateCoordinator = data["coordinator"]
    api: VentoxxAPI = data["api"]
    host = entry.data[CONF_HOST]

    async_add_entities(
        [
            VentoxxModeSensor(coordinator, api, entry.entry_id, host),
            VentoxxErrorSensor(coordinator, api, entry.entry_id, host),
            VentoxxRoleSensor(coordinator, api, entry.entry_id, host),
            VentoxxFirmwareSensor(coordinator, api, entry.entry_id, host),
        ]
    )


class VentoxxModeSensor(CoordinatorEntity[VentoxxDataUpdateCoordinator], SensorEntity):
    """Sensor for current Ventoxx mode."""

    _attr_has_entity_name = True
    _attr_name = "Operating Mode"
    _attr_icon = "mdi:air-conditioner"

    def __init__(self, coordinator: VentoxxDataUpdateCoordinator, api: VentoxxAPI, entry_id: str, host: str) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_mode"
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

    def __init__(self, coordinator: VentoxxDataUpdateCoordinator, api: VentoxxAPI, entry_id: str, host: str) -> None:
        """Initialize error sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_error"
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
    def native_value(self) -> int:
        """Return error code."""
        return int(self.coordinator.data.get("derror", 0))


class VentoxxRoleSensor(CoordinatorEntity[VentoxxDataUpdateCoordinator], SensorEntity):
    """Sensor for device role/type (Незалежний, Головний, Підлеглий)."""

    _attr_has_entity_name = True
    _attr_name = "Device Role"
    _attr_icon = "mdi:account-network"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: VentoxxDataUpdateCoordinator, api: VentoxxAPI, entry_id: str, host: str) -> None:
        """Initialize role sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_role"
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
    def native_value(self) -> str:
        """Return pairing state role."""
        dstate = self.coordinator.data.get("dstate", 0)
        mapping = {
            0: "Незалежний",
            1: "Головний",
            2: "Підлеглий",
        }
        return mapping.get(dstate, "Незалежний")


class VentoxxFirmwareSensor(CoordinatorEntity[VentoxxDataUpdateCoordinator], SensorEntity):
    """Sensor for firmware version."""

    _attr_has_entity_name = True
    _attr_name = "Firmware Version"
    _attr_icon = "mdi:cellphone-arrow-down"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: VentoxxDataUpdateCoordinator, api: VentoxxAPI, entry_id: str, host: str) -> None:
        """Initialize firmware sensor."""
        super().__init__(coordinator)
        self.api = api
        self._attr_unique_id = f"{entry_id}_firmware"
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
    def native_value(self) -> str:
        """Return firmware version."""
        return self.api.sw_version or "0.9.5.010"
