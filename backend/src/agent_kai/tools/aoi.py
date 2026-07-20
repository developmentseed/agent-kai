"""Tool for looking up a place and returning it as an area of interest (AOI)."""

import logging
from typing import Annotated, Any

import httpx
from langchain_core.messages import ToolMessage
from langchain_core.tools import tool
from langchain_core.tools.base import InjectedToolCallId
from langgraph.types import Command

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "agentkai-demo/1.0 (+https://github.com/developmentseed/agentkai)"


async def geocode_location(location: str) -> dict[str, Any] | None:
    """
    Geocode a free-text place name using OpenStreetMap's Nominatim API.

    Args:
        location: Free-text place name, e.g. "Iceland" or "Paris, France".

    Returns:
        dict | None: The top matching result (with "display_name" and
        "boundingbox" keys), or None if nothing matched.
    """
    params: dict[str, Any] = {"q": location, "format": "jsonv2", "limit": 1}
    headers = {"User-Agent": USER_AGENT}

    async with httpx.AsyncClient() as client:
        response = await client.get(NOMINATIM_URL, params=params, headers=headers)
        response.raise_for_status()
        results = response.json()

    return results[0] if results else None


def bounding_box_to_polygon_feature(
    boundingbox: list[str], name: str
) -> dict[str, Any]:
    """
    Build a GeoJSON Polygon Feature from a Nominatim-style bounding box.

    Args:
        boundingbox: [south, north, west, east] as strings, Nominatim's format.
        name: Human-readable name to attach as the feature's "name" property.

    Returns:
        dict: A GeoJSON Feature with a rectangular Polygon geometry.
    """
    south, north, west, east = (float(coord) for coord in boundingbox)

    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [west, south],
                    [east, south],
                    [east, north],
                    [west, north],
                    [west, south],
                ]
            ],
        },
        "properties": {"name": name},
    }


@tool("get_area_of_interest")
async def get_area_of_interest(
    location: Annotated[str, "Free-text place name, e.g. 'Iceland' or 'Paris, France'"],
    tool_call_id: Annotated[str, InjectedToolCallId],
) -> Command:
    """Look up a place by name and set it as the current area of interest (AOI).

    Geocodes the given location and returns a GeoJSON polygon covering it,
    which is displayed to the user as a map artifact. Use this whenever the
    user names a place they want to look at.

    Args:
        location: The place name to look up.
    """
    try:
        result = await geocode_location(location)
    except Exception as e:
        logger.warning(f"Error geocoding '{location}': {e}")
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content=f"ERROR: Could not look up '{location}'.",
                        tool_call_id=tool_call_id,
                        status="error",
                    )
                ]
            }
        )

    if result is None:
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content=f"ERROR: No location found matching '{location}'.",
                        tool_call_id=tool_call_id,
                        status="error",
                    )
                ]
            }
        )

    name = result.get("display_name", location)
    aoi = bounding_box_to_polygon_feature(result["boundingbox"], name)

    return Command(
        update={
            "aoi": aoi,
            "messages": [
                ToolMessage(
                    content=f"Found area of interest: {name}",
                    tool_call_id=tool_call_id,
                )
            ],
        }
    )
