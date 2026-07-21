import {
  ArtifactAOI,
  ArtifactImage,
  ArtifactMessages
} from '$artifacts/config';

export type ArtifactChatMessage<T, D> = {
  traceId: string;
  id: string;
  timestamp: string;
  type: T;
  message: null;
  data: D;
};

export type ChatMessage =
  | {
      traceId?: undefined;
      type: 'user';
      message: string;
      data?: never;
      id: string;
      timestamp: string;
    }
  | {
      traceId?: undefined;
      type: 'error';
      message: string;
      data?: object;
      id: string;
      timestamp: string;
    }
  | {
      traceId: string;
      type: 'assistant';
      message: string;
      data?: never;
      id: string;
      timestamp: string;
    }
  | ArtifactMessages;

export interface AgentMessage {
  content: string;

  /** Extra payload data associated with the message (tool calls, etc.). */
  additional_kwargs: Record<string, unknown>;

  /** Response metadata (headers, token counts, etc.). */
  response_metadata: Record<string, unknown>;

  /** A string that is unique to the message type. */
  type: string;

  /** Optional human-readable name. */
  name?: string | null;

  /** Optional unique identifier (numbers coerced to string in Python). */
  id?: string | null;
}
export interface AgentStreamMessage {
  trace_id: string;
  state: AgentStateMessage;
}

export interface AgentStateMessage {
  messages: ReadonlyArray<AgentMessage>;
  error?: unknown | null;

  /**
   * Artifact-producing fields, mirroring the extra fields on `AgentState` in
   * `backend/src/agent_kai/agent/state.py`. Add a field here when you add one
   * there, and handle it in `processArtifactMessage`.
   */
  aoi?: ArtifactAOI | null;
  image?: ArtifactImage | null;

  /** Set by LangGraph, not by our tools. */
  remaining_steps?: number;
}
