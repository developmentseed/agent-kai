# Backend for AgentKai

## Prerequisites

You will need the following installed:

- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- [docker](https://www.docker.com/get-started/)

## Installation

1. Install the dependencies and the package:

   ```bash
   uv sync
   ```

1. Set up the environment variables:

   ```bash
   cp .env.example .env
   ```

   Then edit the `.env` file to set the required environment variables.

## LLM dependencies

The LLM provider is configurable. The agent uses two models — a `large` one (used by the
agent graph) and a `small` one (available for cheaper, narrower tasks) — both created via
LangChain's `init_chat_model`, so any provider it supports can be used.

Set the following in your `.env` file:

- `LLM_PROVIDER_KEY` (required) - the API key for the provider
- `LLM_PROVIDER` - the LangChain provider id, defaults to `mistralai`
- `LLM_LARGE_MODEL` - defaults to `mistral-large-latest`
- `LLM_SMALL_MODEL` - defaults to `mistral-small-latest`

If you switch provider, install its LangChain integration package (e.g.
`uv add langchain-openai`) in place of `langchain-mistralai`.

## Map / imagery dependencies

The `get_satellite_image` tool uses MapTiler's Static Maps API, which requires an API key. Get a free one at [maptiler.com](https://www.maptiler.com/) and set `MAPTILER_API_KEY` in your `.env` file. (This is the same key the frontend uses for its map.)

## Scripts To Rule Them All 💍📜

We use `Scripts To Rule Them All` to abstract away common actions for developing within the backend codebase:

- `scripts/api`  - This will run the fastapi app
- `scripts/build-docker-image` - This will build the docker image locally
- `scripts/lint` - This will invoke the linter and type checker to detect any issues
- `scripts/format` - This will invoke the linter and formatter to attempt to automatically fix issues
- `scripts/test` - This will run the tests within the backend
