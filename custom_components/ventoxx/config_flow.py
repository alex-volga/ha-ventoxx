"""Config flow for Ventoxx integration."""
from __future__ import annotations

from typing import Any
import aiohttp
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import CONF_HOST, CONF_PASSWORD, CONF_SCAN_INTERVAL, DEFAULT_HOST, DEFAULT_SCAN_INTERVAL, DOMAIN
from .ventoxx_api import VentoxxAPI


class VentoxxConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Ventoxx."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            host = user_input[CONF_HOST].strip()
            password = user_input[CONF_PASSWORD].strip()

            jar = aiohttp.CookieJar(unsafe=True)
            async with aiohttp.ClientSession(cookie_jar=jar) as session:
                api = VentoxxAPI(host, password, session)
                if not await api.authenticate():
                    errors["base"] = "cannot_connect"
                else:
                    await self.async_set_unique_id(host)
                    self._abort_if_unique_id_configured()
                    return self.async_create_entry(
                        title=f"Ventoxx ({host})",
                        data={
                            CONF_HOST: host,
                            CONF_PASSWORD: password,
                        },
                    )

        schema = vol.Schema(
            {
                vol.Required(CONF_HOST, default=DEFAULT_HOST): str,
                vol.Required(CONF_PASSWORD): str,
            }
        )

        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry) -> config_entries.OptionsFlow:
        """Get options flow."""
        return VentoxxOptionsFlowHandler(config_entry)


class VentoxxOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options for Ventoxx."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_SCAN_INTERVAL,
                    default=self.config_entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                ): vol.All(vol.Coerce(int), vol.Clamp(min=2, max=60)),
            }
        )

        return self.async_show_form(step_id="init", data_schema=schema)
