from typing import Annotated, Any

from langchain.agents import AgentState as LangchainAgentState
from typing_extensions import NotRequired


class AgentState(LangchainAgentState):
    aoi: NotRequired[
        Annotated[
            dict[str, Any] | None,
            "A GeoJSON Feature representing the current area of interest "
            "(AOI) selected by the user.",
        ]
    ]
    image: NotRequired[
        Annotated[
            dict[str, Any] | None,
            "An image artifact to display to the user, shaped as "
            "{'type': <mime type>, 'url': <publicly reachable image URL>}.",
        ]
    ]
