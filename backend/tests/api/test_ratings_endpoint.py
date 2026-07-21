from unittest.mock import patch

import pytest


@pytest.fixture
def langfuse_enabled():
    with patch("agent_kai.api.app.settings.langfuse_enabled", True):
        yield


class TestRatingsEndpoint:
    @patch("agent_kai.api.app.langfuse_client", create=True)
    def test_ratings_endpoint_invokes_langfuse_client_with_provided_values(
        self,
        patched_langfuse_client,
        test_client,
        langfuse_enabled,
    ):
        resp = test_client.post(
            "/ratings",
            json={"trace_id": "an-id", "rating": 1, "comment": "this was awesome!"},
        )
        assert resp.status_code == 201
        patched_langfuse_client.create_score.assert_called_once_with(
            name="user-feedback",
            trace_id="an-id",
            value=1,
            comment="this was awesome!",
            data_type="NUMERIC",
        )

    @patch("agent_kai.api.app.langfuse_client", create=True)
    def test_ratings_endpoint_returns_error_if_langfuse_does(
        self,
        patched_langfuse_client,
        test_client,
        langfuse_enabled,
    ):
        patched_langfuse_client.create_score.side_effect = Exception("An exception")
        resp = test_client.post(
            "/ratings",
            json={"trace_id": "an-id", "rating": 1, "comment": "this was awesome!"},
        )
        assert resp.status_code == 500

    def test_ratings_endpoint_is_unavailable_when_langfuse_is_disabled(
        self, test_client
    ):
        resp = test_client.post(
            "/ratings",
            json={"trace_id": "an-id", "rating": 1, "comment": "this was awesome!"},
        )
        assert resp.status_code == 503

    def test_ratings_endpoint_correctly_validates_inputs(self, test_client):
        resp = test_client.post("/ratings", json={"blah": "blah"})
        assert resp.status_code == 422
