from langchain_mistralai import ChatMistralAI
from pydantic import SecretStr

from agent_kai.settings import get_settings

settings = get_settings()

mistral_large = ChatMistralAI(
    model_name="mistral-large-latest",
    api_key=SecretStr(settings.mistral_api_key),
    temperature=0.0,
)

mistral_medium = ChatMistralAI(
    model_name="mistral-medium-latest",
    api_key=SecretStr(settings.mistral_api_key),
    temperature=0.0,
)

mistral_small = ChatMistralAI(
    model_name="mistral-small-latest",
    api_key=SecretStr(settings.mistral_api_key),
    temperature=0.0,
)

magistral_medium = ChatMistralAI(
    model_name="magistral-medium-latest",
    api_key=SecretStr(settings.mistral_api_key),
    temperature=0.0,
)

magistral_small = ChatMistralAI(
    model_name="magistral-small-latest",
    api_key=SecretStr(settings.mistral_api_key),
    temperature=0.0,
)
