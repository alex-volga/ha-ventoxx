"""DataUpdateCoordinator for Ventoxx."""
from __future__ import annotations

from datetime import timedelta
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN
from .ventoxx_api import VentoxxAPI, decode_fstate

_LOGGER = logging.getLogger(__name__)


class VentoxxDataUpdateCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Class to manage fetching Ventoxx data."""

    def __init__(self, hass: HomeAssistant, api: VentoxxAPI, update_interval: int) -> None:
        """Initialize coordinator."""
        self.api = api
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=update_interval),
        )

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from Ventoxx API."""
        data = await self.api.get_state()
        if data is None:
            raise UpdateFailed("Failed to fetch state from Ventoxx")

        fstate = data.get("fstate", 0)
        decoded = decode_fstate(fstate)
        data.update(decoded)
        return data
