# AgentKai

AgentKai is a barebones demo of an agentic chat application. It shows the
core loop of an LLM agent calling tools and having the results rendered in
the UI as typed artifacts, without being tied to any particular product
domain.

Ask it about a place, and it will:

1. Geocode the place and show it to you as an **area of interest (AOI)** on
   a map.
2. Optionally fetch a **satellite image** covering that area, if you ask
   for one.

## How it works

### Under the hood

1. This is a monorepo with a React frontend application and a Python
   FastAPI backend application built with LangGraph.
2. The backend has one main agent with two tools: `get_area_of_interest`
   (geocodes a place name via OpenStreetMap) and `get_satellite_image`
   (fetches static satellite imagery via MapTiler for the current AOI).
3. Tool results are set on the agent's state and streamed to the frontend,
   which renders them as chat artifacts (`frontend/app/artifacts/`).
4. Most of the agent's behaviour is controlled through its system prompt
   (`backend/src/agent_kai/agent/graph.py`) rather than hardcoded logic,
   which makes the app easy to steer or extend through text.

### Adding a new tool

The system prompt in `backend/src/agent_kai/agent/graph.py` includes a
`HOW TO ADD A NEW TOOL` section that walks through extending the agent with
new capabilities. The short version:

1. Write the tool in `backend/src/agent_kai/tools/`.
2. Add a state field for it in `backend/src/agent_kai/agent/state.py` if it
   returns something visual.
3. Register it in the `tools` list in `create_graph()`.
4. Describe when to use it in the system prompt.
5. If it needs a new artifact type in the UI (not `aoi` or `image`), follow
   the matching guide in `frontend/app/artifacts/config.tsx`.

## Running locally

Detailed instructions can be found in the different component folders
([frontend](./frontend), [backend](./backend)). The tl;dr:

1. Install backend and run with `scripts/api`
2. Install frontend and run with `pnpm dev`

You'll need a [Mistral AI](https://mistral.ai/) API key for the LLM and a
[MapTiler](https://www.maptiler.com/) API key for the map/satellite
imagery — see `backend/.env.example` and `frontend/.env.example`.
