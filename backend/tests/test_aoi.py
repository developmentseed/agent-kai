from unittest.mock import AsyncMock, patch

from langchain_core.messages import ToolCall

from agent_kai.tools.aoi import get_area_of_interest


async def test_get_area_of_interest_success():
    with patch(
        "agent_kai.tools.aoi.geocode_location",
        new_callable=AsyncMock,
    ) as mock_geocode:
        mock_geocode.return_value = {
            "display_name": "Iceland",
            "boundingbox": ["63.0", "67.3", "-25.0", "-13.5"],
        }

        tool_call = ToolCall(
            name="get_area_of_interest",
            args={"location": "Iceland"},
            id="test_call_1",
            type="tool_call",
        )

        result = await get_area_of_interest.ainvoke(tool_call)

        assert result.update is not None
        aoi = result.update["aoi"]
        assert aoi["type"] == "Feature"
        assert aoi["properties"]["name"] == "Iceland"
        assert aoi["geometry"]["type"] == "Polygon"

        ring = aoi["geometry"]["coordinates"][0]
        lons = [pt[0] for pt in ring]
        lats = [pt[1] for pt in ring]
        assert min(lons) == -25.0
        assert max(lons) == -13.5
        assert min(lats) == 63.0
        assert max(lats) == 67.3

        message = result.update["messages"][0]
        assert "Iceland" in message.content


async def test_get_area_of_interest_not_found():
    with patch(
        "agent_kai.tools.aoi.geocode_location",
        new_callable=AsyncMock,
    ) as mock_geocode:
        mock_geocode.return_value = None

        tool_call = ToolCall(
            name="get_area_of_interest",
            args={"location": "Nowhereland"},
            id="test_call_2",
            type="tool_call",
        )

        result = await get_area_of_interest.ainvoke(tool_call)

        message = result.update["messages"][0]
        assert message.status == "error"
        assert "Nowhereland" in message.content


async def test_get_area_of_interest_geocode_error():
    with patch(
        "agent_kai.tools.aoi.geocode_location",
        new_callable=AsyncMock,
    ) as mock_geocode:
        mock_geocode.side_effect = RuntimeError("network down")

        tool_call = ToolCall(
            name="get_area_of_interest",
            args={"location": "Iceland"},
            id="test_call_3",
            type="tool_call",
        )

        result = await get_area_of_interest.ainvoke(tool_call)

        message = result.update["messages"][0]
        assert message.status == "error"
