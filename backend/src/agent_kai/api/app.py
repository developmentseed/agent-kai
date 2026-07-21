import json
import logging
import sys
from contextlib import aclosing, asynccontextmanager
from http import HTTPStatus
from typing import Any, AsyncGenerator, Dict, cast

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from langfuse import Langfuse
from langfuse.langchain import CallbackHandler
from langchain.messages import AnyMessage, HumanMessage
from pydantic import UUID4

from agent_kai.agent.graph import create_graph
from agent_kai.agent.state import AgentState
from agent_kai.api.schemas.chat import (
    ChatRequestBody,
    ChatResponse,
)
from agent_kai.api.schemas.ratings import CreateRatingBody
from agent_kai.api.schemas.version import VersionResponse
from agent_kai.settings import get_settings

settings = get_settings()

# Whitelist state fields that can be set by the user.
# Note that these attrs need to be pydantic Fields and
# need a description in the AgentState model.
UI_SET_FIELDS_WHITELIST: list[str] = ["messages"]

logging.basicConfig(
    level=settings.log_level,
    format="%(asctime)s [%(levelname)s] %(name)s:%(lineno)d %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

if settings.langfuse_enabled:
    langfuse_client = Langfuse()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.chatbot = await create_graph()
    yield


app = FastAPI(title="AgentKai API", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    # Set ALLOWED_ORIGINS in your .env to wherever the frontend is served from.
    # Browsers reject a wildcard origin on credentialed requests, so this has
    # to be an explicit list.
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
def root() -> VersionResponse:
    return VersionResponse(backend=settings.version)


@app.get("/health/liveness", tags=["Health"])
def liveness() -> JSONResponse:
    return JSONResponse(content={"status": "alive"})


@app.get("/health/readiness", tags=["Health"])
async def readiness() -> JSONResponse:
    try:
        # put some kind of dependency connection check here!
        return JSONResponse(content={"status": "ready", "stable": settings.stable})
    except Exception as ex:
        logger.error(ex)
        return JSONResponse(
            content={"status": "not ready", "stable": False},
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
        )


async def stream_chat(
    ui_state_update: AgentState,
    thread_id: UUID4,
    chatbot: Any,
    request: Request,
) -> AsyncGenerator[bytes, None]:
    config: Dict[str, Any] = {
        "configurable": {
            "thread_id": thread_id,
        },
        "metadata": {"langfuse_session_id": thread_id},
    }

    langfuse_handler = None

    if settings.langfuse_enabled:
        langfuse_handler = CallbackHandler()
        config["callbacks"] = [langfuse_handler]

    state_updates = {}

    vars_to_update: Dict[str, Any] = {
        key: val
        for key, val in ui_state_update.items()
        if val and key in UI_SET_FIELDS_WHITELIST
    }
    logger.debug(f"State variables to update: {vars_to_update}")

    ui_messages = []
    for key in vars_to_update.keys():
        if key != "messages":
            ui_messages.append(
                HumanMessage(content=f"Manually selected data for field {key}")
            )

    # Add UI messages to the existing messages if they exist
    existing_messages: list[AnyMessage] = vars_to_update.get("messages", [])
    vars_to_update["messages"] = ui_messages + existing_messages

    state_updates.update(vars_to_update)

    stream = chatbot.astream(
        input=state_updates,
        config=config,
        stream_mode="updates",
    )

    try:
        async with aclosing(stream):
            async for update in stream:
                if await request.is_disconnected():
                    logger.info("Client disconnected; stopping stream.")
                    break

                agent = next(iter(update.keys()))
                payload = update[agent]
                state_payload = cast(AgentState, payload)

                resp = ChatResponse(trace_id=None, state=state_payload)
                if langfuse_handler:
                    resp.trace_id = getattr(langfuse_handler, "last_trace_id", None)

                line = json.dumps(resp.model_dump()) + "\n"
                yield line.encode("utf-8")

    except Exception as e:
        logger.warning("stream_chat error: %r", e)


@app.post("/chat")
async def chat(request: ChatRequestBody, http_request: Request) -> StreamingResponse:
    generator = stream_chat(
        ui_state_update=request.agent_state,
        thread_id=request.thread_id,
        chatbot=http_request.app.state.chatbot,
        request=http_request,
    )
    return StreamingResponse(
        generator,
        media_type="application/x-ndjson; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            # If you run behind nginx, this prevents buffering of the stream:
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/ratings")
async def create_rating(request: CreateRatingBody) -> Response:
    # Ratings are stored as Langfuse scores against the trace of the response
    # being rated, so there is nowhere to put them when tracing is off.
    if not settings.langfuse_enabled:
        logger.info("Rating discarded: langfuse is not enabled.")
        return Response(status_code=HTTPStatus.SERVICE_UNAVAILABLE)

    try:
        langfuse_client.create_score(
            name="user-feedback",
            trace_id=request.trace_id,
            value=request.rating,
            comment=request.comment,
            data_type="NUMERIC",
        )
    except Exception:
        logger.error(
            f"Error creating score for trace_id: {request.trace_id}", exc_info=True
        )
        return Response(status_code=HTTPStatus.INTERNAL_SERVER_ERROR)
    return Response(status_code=HTTPStatus.CREATED)
