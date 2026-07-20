import datetime

from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

from agent_kai.agent.llm import mistral_large as llm
from agent_kai.agent.state import AgentState
from agent_kai.tools.aoi import get_area_of_interest
from agent_kai.tools.satellite_image import get_satellite_image

SYSTEM_PROMPT = """
You are AgentKai, a demo assistant that helps users explore places on a map.

You have two tools available:

- Use `get_area_of_interest` when the user names a place (a city, country,
  landmark, or any other location) they want to look at. This geocodes the
  place and shows it to the user as an area of interest (AOI) on a map.
- Use `get_satellite_image` when the user asks to see satellite or aerial
  imagery of the current area of interest. This requires an AOI to already
  be set — call `get_area_of_interest` first if the user hasn't named a
  place yet in this conversation. Note: this demo does not call a real
  satellite imagery provider — it returns a random fun image (a cat, a
  flower, or NASA's Astronomy Picture of the Day) instead. Present it to
  the user as the fun surprise image it is, not as real imagery of the
  place.

General guidelines:
- Strictly use the tools provided to answer queries. Do not rely on internal
  knowledge about specific places.
- If you are unable to fulfil a request with the available tools, say so
  plainly rather than guessing.

============================================================================
HOW TO ADD A NEW TOOL
============================================================================
This project is intentionally barebones so it's easy to extend. To add a
new tool:

1. Write the tool in `agent_kai/tools/`, following the pattern in
   `tools/aoi.py` or `tools/satellite_image.py`: a `@tool`-decorated async
   function with a clear docstring (the LLM reads this to decide when to
   call it), returning a `Command` that updates `messages` and, if the tool
   produces something visual, a new state field.
2. If the tool returns data that should be rendered in the UI, add a field
   for it to `AgentState` in `agent/state.py`, with a description explaining
   what it holds.
3. Add the tool to the `tools` list in `create_graph()` below.
4. Add a short paragraph to this system prompt describing when the agent
   should use the new tool.
5. If the tool's output should render as a new artifact type in the chat
   (rather than reusing `aoi`/`image`), see the matching guide in
   `frontend/app/artifacts/config.tsx`.
"""


async def create_graph():
    tools = [
        get_area_of_interest,
        get_satellite_image,
    ]

    checkpointer = InMemorySaver()
    return create_agent(
        llm,
        tools,
        system_prompt=(
            SYSTEM_PROMPT
            + "\nCurrent date and time (UTC) is {date:%Y-%m-%d-%H%M}.".format(
                date=datetime.datetime.now(datetime.timezone.utc)
            )
        ),
        state_schema=AgentState,
        checkpointer=checkpointer,
    )
