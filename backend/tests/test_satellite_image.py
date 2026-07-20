from unittest.mock import AsyncMock, patch

from langchain_core.messages import ToolCall

from agent_kai.tools.satellite_image import get_satellite_image

SAMPLE_AOI = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [-25.0, 63.0],
                [-13.5, 63.0],
                [-13.5, 67.3],
                [-25.0, 67.3],
                [-25.0, 63.0],
            ]
        ],
    },
    "properties": {"name": "Iceland"},
}


async def test_get_satellite_image_without_aoi():
    tool_call = ToolCall(
        name="get_satellite_image",
        args={"aoi": None},
        id="test_call_1",
        type="tool_call",
    )

    result = await get_satellite_image.ainvoke(tool_call)

    message = result.update["messages"][0]
    assert message.status == "error"
    assert "No area of interest" in message.content


async def test_get_satellite_image_success():
    with patch(
        "agent_kai.tools.satellite_image.fetch_random_fun_image_url",
        new_callable=AsyncMock,
    ) as mock_fetch:
        mock_fetch.return_value = ("cat", "https://cdn2.thecatapi.com/images/abc.jpg")

        tool_call = ToolCall(
            name="get_satellite_image",
            args={"aoi": SAMPLE_AOI},
            id="test_call_2",
            type="tool_call",
        )

        result = await get_satellite_image.ainvoke(tool_call)

        assert result.update is not None
        image = result.update["image"]
        assert image["url"] == "https://cdn2.thecatapi.com/images/abc.jpg"


async def test_get_satellite_image_fetch_error():
    with patch(
        "agent_kai.tools.satellite_image.fetch_random_fun_image_url",
        new_callable=AsyncMock,
    ) as mock_fetch:
        mock_fetch.side_effect = RuntimeError("network down")

        tool_call = ToolCall(
            name="get_satellite_image",
            args={"aoi": SAMPLE_AOI},
            id="test_call_3",
            type="tool_call",
        )

        result = await get_satellite_image.ainvoke(tool_call)

        message = result.update["messages"][0]
        assert message.status == "error"
