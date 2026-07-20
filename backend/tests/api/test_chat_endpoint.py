import uuid
from unittest.mock import patch

from agent_kai.api.app import app


class TestChatEndpoint:
    """Test cases for the chat endpoint."""

    @patch("agent_kai.api.app.stream_chat")
    def test_chat_endpoint_accepts_valid_request(
        self, mock_stream_chat, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint accepts a valid request."""
        # Arrange
        query = "What is the temperature in Lisbon?"
        thread_id = uuid.uuid4()

        # Mock the chatbot in app state
        app.state.chatbot = mock_chatbot_empty_stream

        # Mock the stream_chat function to return a simple response
        mock_stream_chat.return_value = iter([b"test response"])

        # Act
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {
                    "messages": [{"content": query, "type": "human"}],
                },
                "thread_id": str(thread_id),
            },
        )

        # Assert
        assert response.status_code == 200

    def test_chat_endpoint_validates_request_schema(
        self, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint validates the request schema."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream

        # Act - Missing required fields
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {
                    "messages": [{"content": "test query", "type": "human"}]
                }
            },  # Missing thread_id
        )

        # Assert
        assert response.status_code == 422  # Validation error

    def test_chat_endpoint_handles_invalid_uuid(
        self, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint handles invalid UUID format."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream

        # Act - Invalid UUID format
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {
                    "messages": [{"content": "test query", "type": "human"}]
                },
                "thread_id": "invalid-uuid",
            },
        )

        # Assert
        assert response.status_code == 422  # Validation error

    def test_chat_endpoint_handles_missing_query(
        self, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint handles missing query."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream

        # Act - Missing query
        response = test_client.post(
            "/chat",
            json={"thread_id": str(uuid.uuid4())},  # Missing query
        )

        # Assert
        assert response.status_code == 422  # Validation error

    @patch("agent_kai.api.app.stream_chat")
    def test_chat_endpoint_handles_empty_query(
        self, mock_stream_chat, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint handles empty query."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream

        # Mock the stream_chat function to return a simple response
        mock_stream_chat.return_value = iter([b"test response"])

        # Act - Empty query
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {
                    "messages": [{"content": "", "type": "human"}],
                },
                "thread_id": str(uuid.uuid4()),
            },
        )

        # Assert
        assert response.status_code == 200  # Empty string is valid

    @patch("agent_kai.api.app.stream_chat")
    def test_chat_endpoint_handles_very_long_query(
        self, mock_stream_chat, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint handles very long queries."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream
        long_query = "x" * 10000  # Very long query

        # Mock the stream_chat function to return a simple response
        mock_stream_chat.return_value = iter([b"test response"])

        # Act
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {"messages": [{"content": long_query, "type": "human"}]},
                "thread_id": str(uuid.uuid4()),
            },
        )

        # Assert
        assert response.status_code == 200

    @patch("agent_kai.api.app.stream_chat")
    def test_chat_endpoint_handles_special_characters(
        self, mock_stream_chat, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint handles special characters in query."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream
        special_query = "Query with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?"

        # Mock the stream_chat function to return a simple response
        mock_stream_chat.return_value = iter([b"test response"])

        # Act
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {
                    "messages": [{"content": special_query, "type": "human"}],
                },
                "thread_id": str(uuid.uuid4()),
            },
        )

        # Assert
        assert response.status_code == 200

    @patch("agent_kai.api.app.stream_chat")
    def test_chat_endpoint_handles_unicode_characters(
        self, mock_stream_chat, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint handles unicode characters."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream
        unicode_query = "Query with unicode: 🌍🌎🌏 你好世界 Привет мир"

        # Mock the stream_chat function to return a simple response
        mock_stream_chat.return_value = iter([b"test response"])

        # Act
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {
                    "messages": [{"content": unicode_query, "type": "human"}]
                },
                "thread_id": str(uuid.uuid4()),
            },
        )

        assert response.status_code == 200


class TestChatEndpointEdgeCases:
    """Test edge cases for the chat endpoint."""

    def test_chat_endpoint_with_none_values(
        self, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint handles None values properly."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream

        # Act - Send None values
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {"messages": [{"content": None, "type": "human"}]},
                "thread_id": None,
            },
        )

        # Assert
        assert response.status_code == 422  # Validation error for None values

    def test_chat_endpoint_with_wrong_data_types(
        self, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint handles wrong data types."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream

        # Act - Send wrong data types
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {"messages": [{"content": 123, "type": "human"}]},
                "thread_id": 456,
            },  # Numbers instead of strings
        )

        # Assert
        assert response.status_code == 422  # Validation error for wrong types

    @patch("agent_kai.api.app.stream_chat")
    def test_chat_endpoint_with_extra_fields(
        self, mock_stream_chat, test_client, mock_chatbot_empty_stream
    ):
        """Test that the chat endpoint handles extra fields gracefully."""
        # Arrange
        app.state.chatbot = mock_chatbot_empty_stream

        # Mock the stream_chat function to return a simple response
        mock_stream_chat.return_value = iter([b"test response"])

        # Act - Send extra fields
        response = test_client.post(
            "/chat",
            json={
                "agent_state": {
                    "messages": [{"content": "test query", "type": "human"}],
                },
                "thread_id": str(uuid.uuid4()),
                "extra_field": "should be ignored",
                "another_field": 123,
            },
        )

        # Assert
        assert response.status_code == 200  # Extra fields should be ignored
