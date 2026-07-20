import pytest
from pydantic import ValidationError

from agent_kai.settings import get_settings


def test_that_settings_raises_validation_error_when_langfuse_vars_missing_when_enabled(
    monkeypatch,
):
    monkeypatch.setenv("LANGFUSE_ENABLED", "True")
    monkeypatch.setenv("LANGFUSE_PUBLIC_KEY", "")
    monkeypatch.setenv("LANGFUSE_SECRET_KEY", "")
    # As we use HttpUrl as the type, we have to provide a valid host just to get past the initial type check, to exercise _this_ validator
    monkeypatch.setenv("LANGFUSE_HOST", "https://localhost.com")
    get_settings.cache_clear()
    with pytest.raises(
        ValidationError,
        match="When langfuse is enabled, langfuse_public_key, langfuse_secret_key, and langfuse_host must all be set.",
    ):
        _ = get_settings()


def test_that_settings_doesnt_raised_validation_error_when_langfuse_vars_missing_when_disabled(
    monkeypatch,
):
    # raising=False means if the env var wasn't available, it wont error when trying to delete
    monkeypatch.setenv("LANGFUSE_ENABLED", "false")
    monkeypatch.delenv("LANGFUSE_PUBLIC_KEY", raising=False)
    monkeypatch.delenv("LANGFUSE_SECRET_KEY", raising=False)
    monkeypatch.delenv("LANGFUSE_HOST", raising=False)
    get_settings.cache_clear()
    _ = get_settings()
