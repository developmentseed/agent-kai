from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel

from agent_kai.settings import get_settings

settings = get_settings()


def _build_model(model_name: str) -> BaseChatModel:
    return init_chat_model(
        model_name,
        model_provider=settings.llm_provider,
        api_key=settings.llm_provider_key,
        temperature=0.0,
    )


large: BaseChatModel = _build_model(settings.llm_large_model)
small: BaseChatModel = _build_model(settings.llm_small_model)
