from agent_kai.settings import get_settings

settings = get_settings()


class TestRootEndpoint:
    def test_root_endpoint_returns_correct_version(
        self,
        test_client,
    ):
        resp = test_client.get("/")
        assert resp.status_code == 200
        assert resp.json()["backend"] == settings.version
