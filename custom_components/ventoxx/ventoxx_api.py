"""API client for Ventoxx local HTTP interface."""
from __future__ import annotations

import logging
from typing import Any
import aiohttp

_LOGGER = logging.getLogger(__name__)


def decode_fstate(fstate: int) -> dict[str, Any]:
    """Decode raw fstate bitmask into speed and mode."""
    if not fstate:
        return {
            "is_on": False,
            "speed": 0,
            "preset_mode": "recuperation",
        }

    speed = fstate & 0x07
    if fstate == 0x0E:  # 14
        return {
            "is_on": True,
            "speed": 1,
            "preset_mode": "night",
        }
    if fstate == 0x06:  # 6
        return {
            "is_on": True,
            "speed": 3,
            "preset_mode": "intensive",
        }

    mode_bits = fstate & 0x18
    if mode_bits == 0x10:
        mode = "recuperation"
    elif mode_bits == 0x08:
        mode = "intake"
    elif mode_bits == 0x00:
        mode = "exhaust"
    else:
        mode = "recuperation"

    return {
        "is_on": True,
        "speed": speed if 1 <= speed <= 3 else 1,
        "preset_mode": mode,
    }


def encode_fstate(preset_mode: str, speed: int = 1) -> int:
    """Encode preset mode and speed into raw fstate bitmask."""
    spd = max(1, min(3, speed))
    if preset_mode == "night":
        return 0x0E
    if preset_mode == "intensive":
        return 0x06
    if preset_mode == "intake":
        return 0x08 | spd
    if preset_mode == "exhaust":
        return spd
    # Default is recuperation
    return 0x10 | spd


class VentoxxAPI:
    """Ventoxx HTTP API Client."""

    def __init__(self, host: str, password: str, session: aiohttp.ClientSession) -> None:
        """Initialize the API client."""
        self._host = host.rstrip("/")
        if not self._host.startswith("http://") and not self._host.startswith("https://"):
            self._host = f"http://{self._host}"
        self._password = password
        self._session = session
        self._authenticated = False

    async def authenticate(self) -> bool:
        """Authenticate on Ventoxx web server."""
        url = f"{self._host}/psw"
        payload = {"psw": self._password, "fest": "on"}
        try:
            async with self._session.post(url, data=payload, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    data = await resp.json(content_type=None)
                    if data.get("result"):
                        self._authenticated = True
                        _LOGGER.debug("Ventoxx authenticated successfully on %s", self._host)
                        return True
                _LOGGER.warning("Ventoxx login failed on %s: HTTP %s", self._host, resp.status)
        except Exception as ex:
            _LOGGER.error("Failed to connect to Ventoxx on %s: %s", self._host, ex)
        self._authenticated = False
        return False

    async def get_state(self) -> dict[str, Any] | None:
        """Fetch current state from the device."""
        if not self._authenticated:
            if not await self.authenticate():
                return None

        url = f"{self._host}/getstate"
        try:
            async with self._session.post(url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                # If redirected to psw.html or unauthorized
                if resp.status in (302, 303, 401) or "psw.html" in str(resp.url):
                    _LOGGER.info("Ventoxx session expired, re-authenticating...")
                    if await self.authenticate():
                        async with self._session.post(url, timeout=aiohttp.ClientTimeout(total=5)) as resp2:
                            if resp2.status == 200:
                                return await resp2.json(content_type=None)
                    return None

                if resp.status == 200:
                    data = await resp.json(content_type=None)
                    return data
        except Exception as ex:
            _LOGGER.warning("Error fetching Ventoxx state: %s", ex)
        return None

    async def set_fstate(self, fstate: int) -> dict[str, Any] | None:
        """Send new fstate to device."""
        if not self._authenticated:
            if not await self.authenticate():
                return None

        url = f"{self._host}/setfstate"
        payload = {"fstate": str(fstate)}
        try:
            async with self._session.post(url, data=payload, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    return await resp.json(content_type=None)
        except Exception as ex:
            _LOGGER.error("Error setting Ventoxx fstate: %s", ex)
        return None

    async def set_buzzer(self) -> dict[str, Any] | None:
        """Toggle buzzer."""
        url = f"{self._host}/setbuzz"
        try:
            async with self._session.post(url, data={"ch": "c"}, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    return await resp.json(content_type=None)
        except Exception as ex:
            _LOGGER.error("Error toggling buzzer: %s", ex)
        return None

    async def set_display(self) -> dict[str, Any] | None:
        """Toggle display."""
        url = f"{self._host}/setdisp"
        try:
            async with self._session.post(url, data={"ch": "c"}, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    return await resp.json(content_type=None)
        except Exception as ex:
            _LOGGER.error("Error toggling display: %s", ex)
        return None
