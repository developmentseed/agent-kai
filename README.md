# AgentKai

AgentKai is a barebones demo of an agentic chat application. It shows the
core loop of an LLM agent calling tools and having the results rendered in
the UI as typed artifacts, without being tied to any particular product
domain.

Ask it about a place, and it will:

1. Geocode the place and show it to you as an **area of interest (AOI)** on
   a map.
2. Optionally fetch an **image** for that area, if you ask for one — a fun
   stand-in (a cat or a flower) rather than real satellite imagery, since
   this is just a demo.

## How it works

### Under the hood

1. This is a monorepo with a React frontend application and a Python
   FastAPI backend application built with LangGraph.
2. The backend has one main agent with two tools: `get_area_of_interest`
   (geocodes a place name via OpenStreetMap) and `get_satellite_image`
   (deliberately *not* real satellite imagery — it returns a random cat or
   flower photo in place of the current AOI, from The Cat API / Wikimedia
   Commons).
3. Tool results are set on the agent's state and streamed to the frontend
   as newline-delimited JSON, which renders them as chat artifacts
   (`frontend/app/artifacts/`). The AOI is drawn on a MapTiler basemap.
4. Most of the agent's behaviour is controlled through its system prompt
   (`backend/src/agent_kai/agent/graph.py`) rather than hardcoded logic,
   which makes the app easy to steer or extend through text.
5. Responses can optionally be traced with Langfuse (`LANGFUSE_ENABLED`),
   which also powers a thumbs up/down rating control in the chat UI.

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
[MapTiler](https://www.maptiler.com/) API key for the map — see
`backend/.env.example` and `frontend/.env.example`. Langfuse tracing/ratings
are optional and off by default.

## License

[MIT](./LICENSE)
