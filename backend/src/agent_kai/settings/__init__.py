from functools import lru_cache
from typing import Literal, Self

from pydantic import HttpUrl, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

LOG_LEVEL = Literal[
    "DEBUG",
    "INFO",
    "WARNING",
    "ERROR",
    "CRITICAL",
]


class Settings(BaseSettings):
    mistral_api_key: str
    maptiler_api_key: str
    langfuse_public_key: str | None = None
    langfuse_secret_key: str | None = None
    langfuse_host: HttpUrl | None = None
    langfuse_enabled: bool = False
    log_level: LOG_LEVEL = "DEBUG"
    version: str = "N/A"
    stable: bool = True  # Represents whether we know of any issues affecting our service that are current

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    @model_validator(mode="after")
    def ensure_langfuse_params_provided_if_enabled(self) -> Self:
        if self.langfuse_enabled:
            if not all(
                [self.langfuse_public_key, self.langfuse_secret_key, self.langfuse_host]
            ):
                raise ValueError(
                    "When langfuse is enabled, langfuse_public_key, langfuse_secret_key, and langfuse_host must all be set."
                )
        return self


@lru_cache()
def get_settings() -> Settings:
    return Settings()
