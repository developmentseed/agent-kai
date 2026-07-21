"""Tool for fetching a fun random image in place of a real satellite image.

This demo intentionally does not call a real satellite imagery provider.
Instead it picks one of three free, keyless-friendly APIs at random and
returns a picture of a cat, a flower, or NASA's Astronomy Picture of the
Day (APOD).
"""

import logging
import random
from typing import Annotated, Any

import httpx
from langchain.tools import InjectedState
from langchain_core.messages import ToolMessage
from langchain_core.tools import tool
from langchain_core.tools.base import InjectedToolCallId
from langgraph.types import Command

logger = logging.getLogger(__name__)

CAT_API_URL = "https://api.thecatapi.com/v1/images/search"
NASA_APOD_API_URL = "https://api.nasa.gov/planetary/apod"
# NASA's shared, no-signup-required key for api.nasa.gov (rate-limited but
# keyless): https://api.nasa.gov/#api-keys
NASA_APOD_DEMO_KEY = "DEMO_KEY"
WIKIMEDIA_COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php"
FLOWER_CATEGORY = "Category:Flowers"
# Wikimedia's API etiquette policy rejects requests with a generic/missing
# User-Agent: https://meta.wikimedia.org/wiki/User-Agent_policy
WIKIMEDIA_USER_AGENT = "AgentKai/1.0 (demo app)"

IMAGE_SOURCES = ("cat", "flower", "nasa")


async def fetch_cat_image_url(client: httpx.AsyncClient) -> str:
    """Fetch a random cat photo URL from The Cat API (no key required)."""
    response = await client.get(CAT_API_URL)
    response.raise_for_status()
    return response.json()[0]["url"]


async def fetch_flower_image_url(client: httpx.AsyncClient) -> str:
    """
    Fetch a random flower photo URL by sampling Wikimedia Commons'
    "Category:Flowers" (no key required).
    """
    response = await client.get(
        WIKIMEDIA_COMMONS_API_URL,
        params={
            "action": "query",
            "generator": "categorymembers",
            "gcmtitle": FLOWER_CATEGORY,
            "gcmtype": "file",
            "gcmlimit": 50,
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json",
        },
        headers={"User-Agent": WIKIMEDIA_USER_AGENT},
    )
    response.raise_for_status()
    pages = list(response.json()["query"]["pages"].values())
    return random.choice(pages)["imageinfo"][0]["url"]


async def fetch_nasa_apod_image_url(client: httpx.AsyncClient, api_key: str) -> str:
    """Fetch a random NASA Astronomy Picture of the Day image URL.

    `count=1` asks NASA's APOD API for one random entry from its archive.
    Some entries are videos rather than images, so we retry a few times
    until we land on an image.
    """
    for _ in range(5):
        response = await client.get(
            NASA_APOD_API_URL, params={"api_key": api_key, "count": 1}
        )
        response.raise_for_status()
        entry = response.json()[0]
        if entry.get("media_type") == "image":
            return entry.get("hdurl") or entry["url"]
    raise RuntimeError(
        "Could not find a NASA APOD entry with an image after 5 attempts"
    )


async def fetch_random_fun_image_url() -> tuple[str, str]:
    """Pick a random source and fetch an image URL from it.

    Returns a (source, image_url) tuple.
    """
    source = random.choice(IMAGE_SOURCES)
    # http2=True: Wikimedia's edge rejects HTTP/1.1-only clients as bots.
    async with httpx.AsyncClient(
        follow_redirects=True, timeout=15, http2=True
    ) as client:
        if source == "cat":
            image_url = await fetch_cat_image_url(client)
        elif source == "flower":
            image_url = await fetch_flower_image_url(client)
        else:
            image_url = await fetch_nasa_apod_image_url(client, NASA_APOD_DEMO_KEY)
    return source, image_url


@tool("get_satellite_image")
async def get_satellite_image(
    tool_call_id: Annotated[str, InjectedToolCallId],
    aoi: Annotated[dict[str, Any] | None, InjectedState("aoi")],
) -> Command:
    """Fetch an image to show the user in place of real satellite imagery.

    This demo does not call a real satellite imagery provider. It instead
    returns a random fun image — a cat, a flower, or NASA's Astronomy
    Picture of the Day — so the tool-call flow can be exercised without a
    satellite imagery API key.

    Requires an AOI to already be set in this conversation — if the user
    hasn't named a place yet, call `get_area_of_interest` first.
    """
    if not aoi:
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content=(
                            "ERROR: No area of interest set yet. "
                            "Call get_area_of_interest first."
                        ),
                        tool_call_id=tool_call_id,
                        status="error",
                    )
                ]
            }
        )

    try:
        source, image_url = await fetch_random_fun_image_url()
    except Exception as e:
        logger.warning(f"Error fetching random image: {e}")
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content="ERROR: Could not fetch an image.",
                        tool_call_id=tool_call_id,
                        status="error",
                    )
                ]
            }
        )

    return Command(
        update={
            "image": {"type": "image/png", "url": image_url},
            "messages": [
                ToolMessage(
                    content=(
                        f"Fetched a random {source} image to show in place of a real "
                        "satellite image."
                    ),
                    tool_call_id=tool_call_id,
                )
            ],
        }
    )
