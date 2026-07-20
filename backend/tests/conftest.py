import asyncio
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from agent_kai.api.app import app
from agent_kai.settings import get_settings


@pytest.fixture(scope="session")
def event_loop():
    """Create an asyncio event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def settings():
    """Fixture to provide settings for tests."""
    return get_settings()


@pytest.fixture
def test_client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_chatbot_empty_stream():
    """Mock chatbot for testing."""
    chatbot = MagicMock()

    # Mock the get_state method
    mock_state = MagicMock()
    mock_state.values = {}
    chatbot.get_state.return_value = mock_state

    # Mock the update_state method
    chatbot.update_state = MagicMock()

    # Mock the astream method to return an empty async generator
    def make_async_gen():
        async def gen():
            for x in []:
                yield x

        return gen()

    chatbot.astream = MagicMock(return_value=make_async_gen())

    return chatbot
