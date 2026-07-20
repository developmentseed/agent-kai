from typing import Optional

from pydantic import UUID4, BaseModel

from agent_kai.agent.state import AgentState


class ChatRequestBody(BaseModel):
    agent_state: AgentState
    thread_id: UUID4


class ChatResponse(BaseModel):
    trace_id: Optional[str]
    state: AgentState
